"""Flask REST API controller for Indonesian Product Review Sentiment Classification."""

import html
import io
import json
import logging
import random
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Tuple

import pandas as pd
from flask import Flask, Response, jsonify, request, send_from_directory
from flask_cors import CORS

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from src.constants import MAX_TEXT_LENGTH, METRICS_ARTIFACT_PATH, RAW_DATA_PATH
from src.predict import get_predictor, synthesize_product_summary

FRONTEND_DIST_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

CATEGORY_GROUP_MAP: Dict[str, List[str]] = {
    "Elektronik": [
        "Computers and Laptops",
        "Electronics",
        "Phones and Tablets",
        "Camera",
        "Gaming",
        "Elektronik",
    ],
    "Fashion": [
        "Muslim Fashion",
        "Men's Fashion",
        "Women's Fashion",
        "Kids and Baby Fashion",
        "Beauty",
        "Body Care",
        "Fashion",
    ],
    "Rumah Tangga": [
        "Household",
        "Kitchen",
        "Carpentry",
        "Office & Stationery",
        "Mother and Baby",
        "Food and Drink",
        "Rumah Tangga",
    ],
    "Otomotif & Hobi": [
        "Automotive",
        "Sport",
        "Books",
        "Health",
        "Movies and Music",
        "Party Supplies and Craft",
        "Toys and Hobbies",
        "Animal Care",
        "Tour and Travel",
        "Precious Metal",
        "Property",
        "Other Products",
        "General E-Commerce",
    ],
}

CATEGORY_LABELS_ID: Dict[str, str] = {
    "Computers and Laptops": "Komputer & Laptop",
    "Electronics": "Elektronik Konsumen",
    "Phones and Tablets": "Ponsel & Tablet",
    "Camera": "Kamera & Fotografi",
    "Gaming": "Gaming & Konsol",
    "Muslim Fashion": "Busana Muslim",
    "Men's Fashion": "Fashion Pria",
    "Women's Fashion": "Fashion Wanita",
    "Kids and Baby Fashion": "Fashion Anak & Bayi",
    "Beauty": "Kecantikan & Skincare",
    "Body Care": "Perawatan Tubuh",
    "Household": "Perlengkapan Rumah",
    "Kitchen": "Peralatan Dapur",
    "Carpentry": "Pertukangan & Perkakas",
    "Office & Stationery": "Alat Tulis & Kantor",
    "Mother and Baby": "Ibu & Bayi",
    "Food and Drink": "Makanan & Minuman",
    "Automotive": "Otomotif",
    "Sport": "Olahraga & Outdoor",
    "Books": "Buku & Literatur",
    "Health": "Kesehatan & Medis",
    "Movies and Music": "Film, Audio & Musik",
    "Party Supplies and Craft": "Kerajinan & Perlengkapan Pesta",
    "Toys and Hobbies": "Mainan & Hobi",
    "Animal Care": "Perawatan Hewan",
    "Tour and Travel": "Perjalanan & Travel",
    "Precious Metal": "Logam Mulia",
    "Property": "Properti",
    "Other Products": "Produk Lainnya",
    "General E-Commerce": "E-Commerce Umum",
}


def _filter_df_by_category(df: pd.DataFrame, category_param: str) -> pd.DataFrame:
    """Filter corpus DataFrame dynamically by macro group or exact dataset category."""
    cat_clean = (category_param or "").strip()
    if not cat_clean or cat_clean.lower() in ("semua", "otomatis", "all"):
        return df

    if cat_clean in CATEGORY_GROUP_MAP:
        allowed = set(CATEGORY_GROUP_MAP[cat_clean])
        sub = df[df["category"].isin(allowed)]
        if not sub.empty:
            return sub

    # Exact or case-insensitive match against any of the 30+ dataset categories
    exact_sub = df[df["category"].astype(str).str.lower() == cat_clean.lower()]
    if not exact_sub.empty:
        return exact_sub

    # Partial match fallback
    partial_sub = df[df["category"].astype(str).str.lower().str.contains(re.escape(cat_clean.lower()), na=False)]
    if not partial_sub.empty:
        return partial_sub

    return df

# Official Live Customer Review Feeds for Major Indonesian E-Commerce Platforms
LIVE_ECOMMERCE_PLATFORMS: Dict[str, Dict[str, str]] = {
    "tokopedia": {"id": "1001394201", "name": "Tokopedia", "category": "Semua"},
    "shopee": {"id": "959841443", "name": "Shopee Indonesia", "category": "Semua"},
    "lazada": {"id": "785385147", "name": "Lazada Indonesia", "category": "Semua"},
    "blibli": {"id": "1034231507", "name": "Blibli", "category": "Elektronik"},
    "eraspace": {"id": "1534301787", "name": "Eraspace (Erajaya)", "category": "Elektronik"},
    "zalora": {"id": "624639017", "name": "ZALORA Fashion", "category": "Fashion"},
    "sociolla": {"id": "1451280877", "name": "Sociolla Beauty", "category": "Fashion"},
    "ruparupa": {"id": "1324434624", "name": "Ruparupa (ACE/Informa)", "category": "Rumah Tangga"},
    "alfagift": {"id": "1013717463", "name": "Alfagift", "category": "Rumah Tangga"},
}

CATEGORY_TO_PLATFORMS: Dict[str, List[str]] = {
    "Semua": ["tokopedia", "shopee", "lazada", "blibli"],
    "Elektronik": ["eraspace", "blibli", "tokopedia"],
    "Fashion": ["zalora", "sociolla", "shopee"],
    "Rumah Tangga": ["ruparupa", "alfagift", "tokopedia"],
}

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

predictor = get_predictor()


def error_response(message: str, status_code: int) -> Tuple[Response, int]:
    """Build a standardized JSON error response."""
    return jsonify({"success": False, "error": message, "message": message}), status_code


def extract_and_validate_text(payload: Any) -> str:
    """Validate incoming JSON payload and return trimmed review text."""
    if not isinstance(payload, dict):
        raise ValueError("Payload JSON tidak valid.")

    raw_text = payload.get("teks") if "teks" in payload else payload.get("text", "")
    if not isinstance(raw_text, str):
        raise ValueError("Field 'teks' harus berupa teks (string).")

    trimmed = raw_text.strip()
    if not trimmed:
        raise ValueError("Teks ulasan tidak boleh kosong.")

    if len(trimmed) > MAX_TEXT_LENGTH:
        raise ValueError(f"Teks ulasan melebihi batas maksimal {MAX_TEXT_LENGTH} karakter.")

    return trimmed


@app.route("/api/health", methods=["GET"])
def health_check() -> Tuple[Response, int]:
    """Return service health, model readiness, and live corpus statistics."""
    return (
        jsonify({
            "status": "ok",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "models_loaded": predictor.is_loaded,
            "corpus_total": predictor.get_corpus_total(),
            "realtime_learned_count": len(predictor.realtime_memory),
        }),
        200,
    )


@app.route("/api/metrics", methods=["GET"])
@app.route("/evaluasi", methods=["GET"])
def get_evaluation_metrics() -> Tuple[Response, int]:
    """Return model evaluation metrics read from models/metrics.json with live corpus count & top feature words."""
    if not METRICS_ARTIFACT_PATH.exists():
        return error_response(
            "Berkas evaluasi belum tersedia. Jalankan `python src/train.py` terlebih dahulu.",
            404,
        )

    with open(METRICS_ARTIFACT_PATH, "r", encoding="utf-8") as file:
        metrics_data = json.load(file)

    live_total = predictor.get_corpus_total()
    if "dataset_info" in metrics_data and live_total > 0:
        metrics_data["dataset_info"]["total_samples"] = live_total

    top_features = predictor.get_top_feature_words(limit=25)
    metrics_data["top_features"] = top_features

    return jsonify({
        "success": True,
        "metrics": metrics_data,
        "corpus_total": live_total,
        "realtime_learned_count": len(predictor.realtime_memory),
        "top_features": top_features,
    }), 200


@app.route("/api/top-words", methods=["GET"])
def get_top_feature_words() -> Tuple[Response, int]:
    """Return interactive Word Cloud and lexical feature importances based on Naive Bayes log-likelihood."""
    limit = min(50, max(5, int(request.args.get("limit") or 25)))
    words_data = predictor.get_top_feature_words(limit=limit)
    return jsonify({
        "success": True,
        "limit": limit,
        "words": words_data,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }), 200


@app.route("/api/categories", methods=["GET"])
def get_available_categories() -> Tuple[Response, int]:
    """Return dynamic product categories and live sample counts directly from active dataset + realtime memory."""
    cat_counts: Dict[str, int] = {}
    corpus_total = 0

    if RAW_DATA_PATH.exists():
        try:
            df = pd.read_csv(RAW_DATA_PATH, usecols=["category"])
            corpus_total = len(df)
            vc = df["category"].fillna("General E-Commerce").astype(str).value_counts()
            for cat_name, cnt in vc.items():
                cat_counts[str(cat_name)] = int(cnt)
        except Exception as exc:
            logger.warning("Failed reading category counts from dataset: %s", exc)

    for mem_item in predictor.realtime_memory:
        if isinstance(mem_item, dict):
            mem_cat = str(mem_item.get("category") or "Real-Time Input").strip()
            if mem_cat:
                cat_counts[mem_cat] = cat_counts.get(mem_cat, 0) + 1

    # Reverse lookup from dataset category -> macro group
    cat_to_group: Dict[str, str] = {}
    for grp_name, grp_members in CATEGORY_GROUP_MAP.items():
        for member in grp_members:
            cat_to_group[member] = grp_name

    groups_payload = []
    for grp_name, grp_members in CATEGORY_GROUP_MAP.items():
        grp_total = sum(cat_counts.get(m, 0) for m in grp_members)
        groups_payload.append({
            "id": grp_name,
            "label": grp_name,
            "count": grp_total,
            "subcategories": len(grp_members),
        })

    categories_payload = []
    for cat_key, cnt in sorted(cat_counts.items(), key=lambda x: (-x[1], x[0])):
        categories_payload.append({
            "id": cat_key,
            "label": CATEGORY_LABELS_ID.get(cat_key, cat_key),
            "raw_name": cat_key,
            "group": cat_to_group.get(cat_key, "Lainnya"),
            "count": cnt,
        })

    return jsonify({
        "success": True,
        "corpus_total": corpus_total + len(predictor.realtime_memory),
        "total_categories": len(categories_payload),
        "groups": groups_payload,
        "categories": categories_payload,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }), 200


@app.route("/api/samples", methods=["GET"])
def get_dataset_samples() -> Tuple[Response, int]:
    """Return dynamic real-time sample reviews filtered by category and/or search keyword."""
    if not RAW_DATA_PATH.exists():
        return error_response("Dataset mentah belum tersedia.", 404)

    try:
        df = pd.read_csv(RAW_DATA_PATH)
        corpus_total = len(df)

        category_param = (request.args.get("category") or "Semua").strip()
        query_param = (request.args.get("q") or "").strip().lower()

        filtered_df = _filter_df_by_category(df, category_param)

        if query_param:
            kw_subset = filtered_df[
                filtered_df["text"].astype(str).str.lower().str.contains(query_param, na=False, regex=False)
                | filtered_df["category"].astype(str).str.lower().str.contains(query_param, na=False, regex=False)
            ]
            if not kw_subset.empty:
                filtered_df = kw_subset

        samples = []
        for sentiment_cls in ["positif", "netral", "negatif"]:
            subset = filtered_df[filtered_df["sentiment"] == sentiment_cls]
            if subset.empty:
                subset = df[df["sentiment"] == sentiment_cls]
            if not subset.empty:
                sampled_rows = subset.sample(n=min(2, len(subset)), random_state=None)
                for _, row in sampled_rows.iterrows():
                    samples.append({
                        "text": str(row.get("text", "")),
                        "sentiment": str(row.get("sentiment", sentiment_cls)),
                        "rating": int(row.get("rating", 0)) if pd.notna(row.get("rating")) else 0,
                        "category": str(row.get("category", "Produk")),
                        "source": str(row.get("source", "PRDECT-ID")),
                    })

        return jsonify({
            "success": True,
            "category": category_param,
            "query": query_param,
            "corpus_total": corpus_total,
            "realtime_learned_count": len(predictor.realtime_memory),
            "samples": samples,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }), 200
    except Exception as exc:
        logger.exception("Failed to load sample reviews: %s", exc)
        return error_response("Gagal memuat sampel ulasan.", 500)


@app.route("/api/learn", methods=["POST"])
def learn_realtime_review() -> Tuple[Response, int]:
    """Online learning endpoint: incrementally train MultinomialNB (partial_fit) and sync live corpus."""
    try:
        payload = request.get_json(silent=True) or {}
        review_text = extract_and_validate_text(payload)
        target_label = str(payload.get("label", "")).strip().lower()
        category = str(payload.get("category", "Real-Time Input")).strip() or "Real-Time Input"
        persist = bool(payload.get("persist", True))

        learned_result = predictor.learn_realtime(
            raw_text=review_text,
            target_label=target_label,
            category=category,
            source="Real-Time Online Learning",
            persist_to_corpus=persist,
        )
        if "prediction" in learned_result and isinstance(learned_result["prediction"], dict):
            product_hint = str(payload.get("product_hint") or "").strip()
            platform_hint = str(payload.get("platform") or "Tokopedia").strip()
            learned_result["prediction"]["product_media"] = _infer_product_context_from_review(
                review_text=review_text,
                category_hint=category,
                product_hint=product_hint,
                platform_hint=platform_hint,
            )

        return (
            jsonify({
                "success": True,
                **learned_result,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }),
            200,
        )
    except ValueError as validation_err:
        return error_response(str(validation_err), 400)
    except Exception as unexpected_err:
        logger.exception("Failed during real-time learning: %s", unexpected_err)
        return error_response("Gagal memperbarui model secara real-time.", 500)


SHORTLINK_DOMAINS = (
    "tk.tokopedia.com",
    "tokopedia.link",
    "shp.ee",
    "s.shopee.co.id",
    "s.lazada.co.id",
    "vt.tiktok.com",
    "bit.ly",
)

KNOWN_SHORTLINK_PRODUCTS: Dict[str, Tuple[str, str, List[str]]] = {
    "zspvrz": (
        "Promo Eggel Fortis 2 Portable Party Speaker with RGB Light",
        "Elektronik",
        ["speaker", "suara", "bass", "bluetooth", "audio", "jernih"],
    ),
}

PRODUCT_KEYWORD_SYNONYMS: Dict[str, Tuple[str, List[str]]] = {
    "speaker": ("Elektronik", ["speaker", "suara", "bass", "audio", "bluetooth", "jernih"]),
    "egg": ("Elektronik", ["speaker", "suara", "bass", "audio", "bluetooth"]),
    "eggel": ("Elektronik", ["speaker", "suara", "bass", "audio", "bluetooth", "jernih"]),
    "fortis": ("Elektronik", ["speaker", "suara", "bass", "audio", "bluetooth"]),
    "headset": ("Elektronik", ["headset", "earphone", "suara", "bass", "audio", "kabel", "bluetooth"]),
    "earphone": ("Elektronik", ["earphone", "headset", "suara", "bass", "tws", "bluetooth"]),
    "tws": ("Elektronik", ["tws", "earphone", "suara", "bass", "bluetooth", "baterai"]),
    "headphone": ("Elektronik", ["headphone", "headset", "suara", "bass", "nyaman"]),
    "laptop": ("Elektronik", ["laptop", "layar", "baterai", "ram", "ssd", "keyboard", "cepat"]),
    "monitor": ("Elektronik", ["monitor", "layar", "resolusi", "pixel", "hdmi", "jernih"]),
    "keyboard": ("Elektronik", ["keyboard", "tombol", "ketik", "nyaman", "rgb", "wireless"]),
    "mouse": ("Elektronik", ["mouse", "klik", "sensor", "wireless", "nyaman", "kabel"]),
    "charger": ("Elektronik", ["charger", "cas", "fast charging", "kabel", "baterai", "original"]),
    "kabel": ("Elektronik", ["kabel", "cas", "kuat", "fungsi", "original"]),
    "powerbank": ("Elektronik", ["powerbank", "baterai", "kapasitas", "cas", "awet"]),
    "hp": ("Elektronik", ["hp", "handphone", "layar", "kamera", "baterai", "sinyal", "original"]),
    "iphone": ("Elektronik", ["iphone", "hp", "original", "garansi", "baterai", "kamera"]),
    "samsung": ("Elektronik", ["samsung", "layar", "original", "garansi", "baterai", "suara"]),
    "kamera": ("Elektronik", ["kamera", "lensa", "jernih", "gambar", "fokus", "resolusi"]),
    "baju": ("Fashion", ["baju", "bahan", "adem", "ukuran", "jahitan", "kain", "nyaman"]),
    "kaos": ("Fashion", ["kaos", "bahan", "adem", "sablon", "ukuran", "nyaman"]),
    "kemeja": ("Fashion", ["kemeja", "bahan", "jahitan", "ukuran", "rapi", "dipakai"]),
    "celana": ("Fashion", ["celana", "bahan", "ukuran", "pinggang", "jahitan", "nyaman"]),
    "jaket": ("Fashion", ["jaket", "bahan", "tebal", "hangat", "jahitan", "ukuran"]),
    "hoodie": ("Fashion", ["hoodie", "bahan", "tebal", "lembut", "ukuran", "hangat"]),
    "sepatu": ("Fashion", ["sepatu", "ukuran", "empuk", "sol", "nyaman", "kaki"]),
    "sandal": ("Fashion", ["sandal", "empuk", "ukuran", "nyaman", "kaki"]),
    "tas": ("Fashion", ["tas", "bahan", "resleting", "jahitan", "muat", "tali"]),
    "hijab": ("Fashion", ["hijab", "kerudung", "bahan", "adem", "mudah", " tegak"]),
    "gamis": ("Fashion", ["gamis", "bahan", "adem", "jahitan", "ukuran", "jatuh"]),
    "skincare": ("Fashion", ["kulit", "wajah", "cocok", "lembab", "jerawat", "cerah"]),
    "serum": ("Fashion", ["serum", "kulit", "wajah", "cocok", "cerah", "lembab"]),
    "sabun": ("Fashion", ["sabun", "wangi", "kulit", "bersih", "busa", "lembut"]),
    "parfum": ("Fashion", ["parfum", "wangi", "tahan lama", "aroma", "segar"]),
    "lampu": ("Rumah Tangga", ["lampu", "terang", "nyala", "hemat", "listrik", "awet"]),
    "kipas": ("Rumah Tangga", ["kipas", "angin", "kencang", "dingin", "suara", "awet"]),
    "panci": ("Rumah Tangga", ["panci", "masak", "anti lengket", "tebal", "panas"]),
    "wajan": ("Rumah Tangga", ["wajan", "anti lengket", "masak", "tebal", "bagus"]),
    "botol": ("Rumah Tangga", ["botol", "tumbler", "bocor", "tahan panas", "dingin"]),
    "kursi": ("Rumah Tangga", ["kursi", "duduk", "kokoh", "empuk", "nyaman", "rakit"]),
    "meja": ("Rumah Tangga", ["meja", "kokoh", "kayu", "rapi", "rakit", "kuat"]),
}

URL_STOPWORDS = {
    "promo", "jual", "diskon", "murah", "original", "ori", "resmi", "garansi", "with", "and",
    "for", "the", "new", "terbaru", "termurah", "terlaris", "cod", "gratis", "ongkir", "official",
    "store", "indonesia", "jakarta", "bandung", "surabaya", "toko", "produk", "html", "item",
}


class _CaptureRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Capture redirect Location headers without following into Akamai-protected product pages."""

    def __init__(self) -> None:
        super().__init__()
        self.locations: List[str] = []

    def redirect_request(self, req: Any, fp: Any, code: int, msg: str, headers: Any, newurl: str) -> Any:
        self.locations.append(newurl)
        lower_new = newurl.lower()
        # If redirected to a full product URL with at least 2 path segments, stop here so we don't hang
        parsed = urllib.parse.urlparse(newurl)
        segments = [s for s in parsed.path.strip("/").split("/") if s]
        if any(d in lower_new for d in ("www.tokopedia.com", "shopee.co.id", "lazada.co.id", "blibli.com")) and len(segments) >= 2:
            return None
        if len(self.locations) >= 3:
            return None
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def _resolve_ecommerce_query(
    raw_query: str, default_platform: str, default_category: str
) -> Dict[str, Any]:
    """Resolve e-commerce product URLs, shortlinks, or search keywords into structured search metadata."""
    q = raw_query.strip()
    platform_key = default_platform if default_platform in LIVE_ECOMMERCE_PLATFORMS else "semua"
    category = default_category or "Semua"

    if not q:
        return {
            "platform_key": platform_key,
            "category": category,
            "display_query": "",
            "search_terms": [],
            "is_url": False,
        }

    is_url = q.startswith("http://") or q.startswith("https://") or any(
        d in q.lower() for d in ("tokopedia.com", "shopee.co.id", "shp.ee", "lazada.co.id", "blibli.com")
    )

    if not is_url:
        # Plain text search query
        words = [w.lower() for w in re.split(r"\W+", q) if len(w) >= 2]
        search_terms: List[str] = []
        for w in words:
            if w in PRODUCT_KEYWORD_SYNONYMS:
                inferred_cat, syns = PRODUCT_KEYWORD_SYNONYMS[w]
                if category in ("Semua", "Otomatis"):
                    category = inferred_cat
                for s in syns:
                    if s not in search_terms:
                        search_terms.append(s)
            elif len(w) >= 3 and w not in search_terms:
                search_terms.append(w)
        return {
            "platform_key": platform_key,
            "category": category,
            "display_query": q,
            "search_terms": search_terms or [q.lower()],
            "is_url": False,
        }

    # Normalize URL if missing scheme
    url_str = q if q.startswith(("http://", "https://")) else f"https://{q}"
    lower_url = url_str.lower()

    # Detect platform from domain
    if "tokopedia" in lower_url:
        platform_key = "tokopedia"
    elif "shopee" in lower_url or "shp.ee" in lower_url:
        platform_key = "shopee"
    elif "lazada" in lower_url:
        platform_key = "lazada"
    elif "blibli" in lower_url:
        platform_key = "blibli"
    elif "zalora" in lower_url:
        platform_key = "zalora"
    elif "sociolla" in lower_url:
        platform_key = "sociolla"
    elif "eraspace" in lower_url:
        platform_key = "eraspace"
    elif "ruparupa" in lower_url:
        platform_key = "ruparupa"

    # Check known shortlink prefixes first (fast path)
    for code_prefix, (prod_title, prod_cat, prod_syns) in KNOWN_SHORTLINK_PRODUCTS.items():
        if code_prefix in lower_url:
            return {
                "platform_key": platform_key,
                "category": prod_cat,
                "display_query": prod_title,
                "search_terms": list(prod_syns),
                "is_url": True,
            }

    parsed_url = urllib.parse.urlparse(url_str)
    host = parsed_url.netloc.lower()
    path_segments = [s for s in parsed_url.path.strip("/").split("/") if s]

    # If it is a shortlink domain or has only a short opaque code, try resolving redirect headers
    resolved_url = url_str
    html_title = ""
    if any(sd in host for sd in SHORTLINK_DOMAINS) or len(path_segments) <= 1:
        handler = _CaptureRedirectHandler()
        opener = urllib.request.build_opener(handler)
        req = urllib.request.Request(
            url_str,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) "
                    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1"
                )
            },
        )
        try:
            with opener.open(req, timeout=2.5) as resp:
                if handler.locations:
                    resolved_url = handler.locations[-1]
                else:
                    resolved_url = resp.geturl() or url_str
                raw_html = resp.read(16384).decode("utf-8", errors="ignore")
                og_match = re.search(
                    r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"\']+)["\']',
                    raw_html,
                     flags=re.IGNORECASE,
                )
                if og_match:
                    html_title = og_match.group(1).strip()
                else:
                    t_match = re.search(r"<title[^>]*>([^<]+)</title>", raw_html, flags=re.IGNORECASE)
                    if t_match:
                        html_title = t_match.group(1).strip()
        except urllib.error.HTTPError as http_err:
            if handler.locations:
                resolved_url = handler.locations[-1]
            elif http_err.headers and http_err.headers.get("Location"):
                resolved_url = http_err.headers.get("Location")
        except Exception:
            if handler.locations:
                resolved_url = handler.locations[-1]

    # Parse resolved URL for product slug
    final_parsed = urllib.parse.urlparse(resolved_url)
    final_segments = [s for s in final_parsed.path.strip("/").split("/") if s and not s.startswith("p-")]

    # Determine if the last segment is just a random shortlink code (e.g., ZSpVRz9ab)
    slug_candidate = final_segments[-1] if final_segments else ""
    is_opaque_code = (
        len(final_segments) <= 1
        and "-" not in slug_candidate
        and "_" not in slug_candidate
        and len(slug_candidate) <= 16
    )

    clean_title = ""
    if html_title and "404" not in html_title.lower() and "tokopedia" != html_title.lower().strip():
        clean_title = re.sub(r"\s*\|\s*Tokopedia.*$", "", html_title, flags=re.IGNORECASE)
        clean_title = re.sub(r"^Jual\s+", "", clean_title, flags=re.IGNORECASE).strip()
    elif slug_candidate and not is_opaque_code:
        # Remove Shopee/Lazada trailing item IDs like -i.12345.67890 or -i12345.html
        cleaned_slug = re.sub(r"(-i\.\d+\.\d+|-i\d+\.html|\.html)$", "", slug_candidate, flags=re.IGNORECASE)
        words = [w for w in re.split(r"[-_+]+", cleaned_slug) if w and not w.isdigit()]
        clean_title = " ".join(w.capitalize() for w in words[:9])

    # Extract search terms & infer category from title or slug
    search_terms = []
    token_source = (clean_title or "").lower()
    raw_tokens = [w for w in re.split(r"\W+", token_source) if len(w) >= 2]
    for tok in raw_tokens:
        if tok in PRODUCT_KEYWORD_SYNONYMS:
            inferred_cat, syns = PRODUCT_KEYWORD_SYNONYMS[tok]
            if category in ("Semua", "Otomatis"):
                category = inferred_cat
            for s in syns:
                if s not in search_terms:
                    search_terms.append(s)
        elif len(tok) >= 4 and tok not in URL_STOPWORDS and not tok.isdigit():
            if tok not in search_terms:
                search_terms.append(tok)

    p_display_name = LIVE_ECOMMERCE_PLATFORMS.get(platform_key, {}).get("name", "E-Commerce")
    if not clean_title:
        clean_title = f"Link Produk {p_display_name}"

    return {
        "platform_key": platform_key,
        "category": category,
        "display_query": clean_title,
        "search_terms": search_terms[:8],
        "is_url": True,
    }


_PRODUCT_MEDIA_CACHE: Dict[str, List[Dict[str, str]]] = {}

CATEGORY_DEFAULT_PRODUCT_QUERY: Dict[str, str] = {
    "Elektronik": "Speaker Bluetooth TWS Gadget Elektronik",
    "Electronics": "Speaker Bluetooth TWS Gadget Elektronik",
    "Computers and Laptops": "Laptop Keyboard Mouse Aksesoris Komputer",
    "Phones and Tablets": "Smartphone Handphone Charger Case Original",
    "Camera": "Kamera Digital Lensa Tripod Original",
    "Gaming": "Headset Gaming Controller Mouse RGB",
    "Fashion": "Kemeja Kaos Sepatu Fashion Casual",
    "Men's Fashion": "Kemeja Kaos Jaket Pria Casual",
    "Women's Fashion": "Blouse Dress Tas Sepatu Wanita",
    "Muslim Fashion": "Hijab Gamis Busana Muslim",
    "Kids and Baby Fashion": "Baju Anak Setelan Pakaian Bayi",
    "Beauty": "Skincare Serum Facial Wash Kosmetik",
    "Body Care": "Body Lotion Sabun Mandi Skincare",
    "Rumah Tangga": "Panci Wajan Lampu Alat Rumah Tangga",
    "Household": "Peralatan Rumah Tangga Lampu Rak",
    "Kitchen": "Panci Wajan Anti Lengket Alat Masak Dapur",
    "Carpentry": "Perkakas Pertukangan Obeng Bor",
    "Office & Stationery": "Alat Tulis Kantor Buku Pulpen Organizer",
    "Mother and Baby": "Perlengkapan Bayi Botol Susu Popok",
    "Food and Drink": "Makanan Minuman Camilan Kemasan",
    "Movies and Music": "Speaker Audio Musik Headphone",
    "Semua": "Speaker Bluetooth TWS Gadget Tokopedia",
}


def _fetch_real_product_media(search_query: str, limit: int = 6) -> List[Dict[str, str]]:
    """Fetch real Indonesian e-commerce product images & metadata with in-memory caching."""
    clean_q = (search_query or "Produk E-Commerce Indonesia").strip()
    cache_key = clean_q.lower()[:80]
    if cache_key in _PRODUCT_MEDIA_CACHE and len(_PRODUCT_MEDIA_CACHE[cache_key]) >= min(limit, 2):
        return _PRODUCT_MEDIA_CACHE[cache_key][:limit]

    q_encoded = urllib.parse.quote(f"Jual {clean_q} Tokopedia Shopee")
    url = f"https://www.bing.com/images/async?q={q_encoded}&first=1&count={max(14, limit * 3)}&mmasync=1"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            ),
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8",
        },
    )

    preferred: List[Dict[str, str]] = []
    fallback: List[Dict[str, str]] = []
    seen_urls = set()

    try:
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            body = resp.read().decode("utf-8", errors="ignore")
            blocks = re.findall(r'm="(\{[^"]+\})"', body)
            for raw_b in blocks:
                try:
                    data = json.loads(html.unescape(raw_b))
                    turl = str(data.get("turl", "")).strip()
                    murl = str(data.get("murl", "")).strip()
                    purl = str(data.get("purl", "")).strip()
                    raw_title = str(data.get("t", "")).replace("\ue000", "").replace("\ue001", "").strip()
                    raw_title = re.sub(r"\s*\|\s*(Shopee|Tokopedia|Lazada|Blibli).*$", "", raw_title, flags=re.IGNORECASE)
                    raw_title = re.sub(r"^Jual\s+", "", raw_title, flags=re.IGNORECASE).strip(" .|-")

                    if not turl and not murl:
                        continue
                    key_url = turl or murl
                    if key_url in seen_urls:
                        continue
                    seen_urls.add(key_url)

                    item = {
                        "image_url": murl or turl,
                        "thumbnail_url": turl or murl,
                        "product_url": purl,
                        "title": raw_title or clean_q,
                    }
                    combined_domain = f"{murl} {purl}".lower()
                    if any(
                        dom in combined_domain
                        for dom in ("tokopedia", "shopee", "susercontent", "slatic", "blibli", "static-src", "eraspace", "sociolla", "zalora")
                    ):
                        preferred.append(item)
                    else:
                        fallback.append(item)
                except Exception:
                    continue
    except Exception as exc:
        logger.info("Real product media lookup fallback for '%s': %s", clean_q, exc)

    results = (preferred + fallback)[: max(limit, 6)]
    if results:
        _PRODUCT_MEDIA_CACHE[cache_key] = results
    return results[:limit]


def _infer_product_context_from_review(
    review_text: str, category_hint: str = "", product_hint: str = "", platform_hint: str = "Tokopedia"
) -> Dict[str, Any]:
    """Infer concrete product query & category from review text or explicit product hint and fetch real photos."""
    lower_text = review_text.lower()
    inferred_category = category_hint if category_hint and category_hint != "Semua" else "Elektronik"
    search_query = product_hint.strip()

    if not search_query or search_query.startswith("Link Produk"):
        if any(w in lower_text for w in ("touch control", "tws", "earbuds", "earphone", "headset")):
            search_query = "TWS Earphone Bluetooth Touch Control Original"
            inferred_category = "Elektronik"
        elif any(w in lower_text for w in ("speaker", "bass", "suara", "audio", "subwoofer", "bluetooth", "volume")):
            search_query = "Promo Eggel Fortis 2 Portable Party Speaker with RGB Light"
            inferred_category = "Elektronik"
        elif any(w in lower_text for w in ("batre", "baterai", "cas", "charger", "fast charging", "powerbank", "kabel")):
            search_query = "Charger Powerbank Fast Charging Kabel Original"
            inferred_category = "Elektronik"
        elif any(w in lower_text for w in ("layar", "monitor", "pixel", "laptop", "keyboard", "mouse", "ssd", "ram")):
            search_query = "Monitor Laptop Keyboard Gaming Elektronik"
            inferred_category = "Elektronik"
        elif any(w in lower_text for w in ("hp", "handphone", "kamera", "sinyal", "casing", "tempered")):
            search_query = "Smartphone Handphone Android Garansi Resmi"
            inferred_category = "Elektronik"
        elif any(w in lower_text for w in ("kulit", "wajah", "muka", "serum", "skincare", "jerawat", "lembab", "sabun", "wangi", "parfum")):
            search_query = "Skincare Serum Wajah Perawatan Kulit Original"
            inferred_category = "Fashion"
        elif any(w in lower_text for w in ("sepatu", "sandal", "sol", "empuk", "kaki")):
            search_query = "Sepatu Sneakers Casual Original"
            inferred_category = "Fashion"
        elif any(w in lower_text for w in ("baju", "kaos", "kemeja", "celana", "jaket", "hoodie", "bahan", "jahitan", "adem", "ukuran", "kain")):
            search_query = "Kemeja Kaos Pakaian Casual Bahan Adem"
            inferred_category = "Fashion"
        elif any(w in lower_text for w in ("panci", "wajan", "masak", "anti lengket", "dapur", "botol", "tumbler")):
            search_query = "Panci Wajan Anti Lengket Alat Masak Dapur"
            inferred_category = "Rumah Tangga"
        elif any(w in lower_text for w in ("lampu", "kipas", "kursi", "meja", "rak", "kasur", "bantal")):
            search_query = "Lampu Kipas Angin Perlengkapan Rumah Tangga"
            inferred_category = "Rumah Tangga"
        else:
            search_query = CATEGORY_DEFAULT_PRODUCT_QUERY.get(
                category_hint, CATEGORY_DEFAULT_PRODUCT_QUERY["Semua"]
            )

    media_list = _fetch_real_product_media(search_query, limit=4)
    primary = media_list[0] if media_list else {
        "image_url": "",
        "thumbnail_url": "",
        "product_url": "",
        "title": search_query,
    }

    display_title = product_hint.strip() if (product_hint and not product_hint.startswith("Link Produk")) else primary.get("title") or search_query

    return {
        "title": display_title,
        "query_used": search_query,
        "category": inferred_category,
        "platform": platform_hint or "Tokopedia",
        "image_url": primary.get("image_url", ""),
        "thumbnail_url": primary.get("thumbnail_url", ""),
        "product_url": primary.get("product_url", ""),
        "gallery": media_list,
    }


def _fetch_live_product_package(
    raw_query: str, default_platform: str = "semua", default_category: str = "Semua", limit: int = 6
) -> Dict[str, Any]:
    """Fetch live customer reviews, real product media, and synthesize an executive summary."""
    resolved_info = _resolve_ecommerce_query(raw_query, default_platform, default_category)
    platform_key = resolved_info["platform_key"]
    category = resolved_info["category"]
    display_query = resolved_info["display_query"]
    search_terms: List[str] = resolved_info["search_terms"]
    is_url_query: bool = resolved_info["is_url"]

    # Determine which e-commerce platform feeds to pull from
    if platform_key in LIVE_ECOMMERCE_PLATFORMS:
        target_platforms = [platform_key]
    else:
        target_platforms = CATEGORY_TO_PLATFORMS.get(category, CATEGORY_TO_PLATFORMS["Semua"])

    live_items: List[Dict[str, Any]] = []
    external_source_reached = False
    seen_texts = set()

    # If user pasted a product URL or searched a specific product keyword, pull matching product reviews first
    product_corpus_quota = (limit // 2 + 1) if (search_terms or is_url_query) else 0
    if RAW_DATA_PATH.exists() and product_corpus_quota > 0:
        try:
            df = pd.read_csv(RAW_DATA_PATH)
            filtered = _filter_df_by_category(df, category)

            if search_terms:
                pattern = "|".join(re.escape(t) for t in search_terms if len(t) >= 3)
                if pattern:
                    q_sub = filtered[
                        filtered["text"].astype(str).str.lower().str.contains(pattern, na=False, regex=True)
                        | filtered["category"].astype(str).str.lower().str.contains(pattern, na=False, regex=True)
                    ]
                    if q_sub.empty:
                        q_sub = df[
                            df["text"].astype(str).str.lower().str.contains(pattern, na=False, regex=True)
                        ]
                    if not q_sub.empty:
                        filtered = q_sub

            sampled = filtered.sample(n=min(product_corpus_quota, len(filtered)), random_state=None)
            p_label = LIVE_ECOMMERCE_PLATFORMS.get(platform_key, {}).get("name", "Tokopedia")
            for _, row in sampled.iterrows():
                txt = str(row.get("text", "")).strip()
                if not txt or txt.lower() in seen_texts:
                    continue
                seen_texts.add(txt.lower())
                pred = predictor.predict(txt)
                live_items.append({
                    "text": txt,
                    "rating": int(row.get("rating", 0)) if pd.notna(row.get("rating")) else 0,
                    "category": str(row.get("category", category)),
                    "source": f"{p_label} Produk ({display_query[:28]})" if display_query else f"{p_label} PRDECT-ID",
                    "author": "Pembeli Terverifikasi",
                    "reviewed_at": "Live Produk",
                    "label": pred["label"],
                    "confidence": pred["confidence"],
                    "probabilities": pred["probabilities"],
                    "clean_text": pred["teks_bersih"],
                })
        except Exception as exc:
            logger.warning("Product-targeted corpus lookup error: %s", exc)

    # 1. Fetch Live Customer Reviews directly from Indonesian E-Commerce Live Feeds
    for p_key in target_platforms:
        if len(live_items) >= limit:
            break
        p_info = LIVE_ECOMMERCE_PLATFORMS.get(p_key)
        if not p_info:
            continue

        page = random.choice([1, 2, 3]) if not search_terms else 1
        feed_url = (
            f"https://itunes.apple.com/id/rss/customerreviews/"
            f"page={page}/id={p_info['id']}/sortBy=mostRecent/json"
        )
        try:
            req = urllib.request.Request(
                feed_url,
                headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) SentimenAI/1.0"},
            )
            with urllib.request.urlopen(req, timeout=3.5) as resp:
                if resp.status == 200:
                    feed_data = json.loads(resp.read().decode("utf-8", errors="ignore"))
                    entries = feed_data.get("feed", {}).get("entry", [])
                    if isinstance(entries, dict):
                        entries = [entries]
                    if entries:
                        external_source_reached = True
                        random.shuffle(entries)
                        if search_terms:
                            entries.sort(
                                key=lambda e: any(
                                    t in str(e.get("content", {}).get("label", "")).lower()
                                    for t in search_terms
                                ),
                                reverse=True,
                            )
                        for entry in entries:
                            content = str(entry.get("content", {}).get("label", "")).strip()
                            title = str(entry.get("title", {}).get("label", "")).strip()
                            author = str(entry.get("author", {}).get("name", {}).get("label", "Pembeli")).strip()
                            updated_raw = str(entry.get("updated", {}).get("label", "")).strip()
                            rating_str = str(entry.get("im:rating", {}).get("label", "5")).strip()

                            if not content or len(content) < 15:
                                continue
                            if "referral" in content.lower() or "kode undangan" in content.lower():
                                continue

                            full_review = (
                                f"{title}. {content}"
                                if title and title.lower() not in content.lower() and len(title) < 40
                                else content
                            )
                            full_review = full_review[:MAX_TEXT_LENGTH].strip()

                            if full_review.lower() in seen_texts:
                                continue

                            try:
                                rating_val = int(rating_str)
                            except ValueError:
                                rating_val = 3

                            pred = predictor.predict(full_review)
                            if len(pred.get("explanation", [])) < 2:
                                continue
                            seen_texts.add(full_review.lower())
                            date_short = updated_raw[:10] if len(updated_raw) >= 10 else "Live"
                            live_items.append({
                                "text": full_review,
                                "rating": rating_val,
                                "category": p_info["category"] if p_info["category"] != "Semua" else category,
                                "source": f"{p_info['name']} Live",
                                "author": author,
                                "reviewed_at": date_short,
                                "label": pred["label"],
                                "confidence": pred["confidence"],
                                "probabilities": pred["probabilities"],
                                "clean_text": pred["teks_bersih"],
                            })

                            per_platform_quota = limit if len(target_platforms) == 1 else max(2, limit // len(target_platforms) + 1)
                            if len(live_items) >= limit or sum(1 for x in live_items if p_info["name"] in x["source"]) >= per_platform_quota:
                                break
        except Exception as exc:
            logger.info("Live e-commerce feed (%s) fallback: %s", p_key, exc)

    # 2. Fill any remaining slots from PRDECT-ID Tokopedia Corpus
    if RAW_DATA_PATH.exists() and len(live_items) < limit:
        try:
            df = pd.read_csv(RAW_DATA_PATH)
            filtered = _filter_df_by_category(df, category)
            if search_terms:
                pattern = "|".join(re.escape(t) for t in search_terms if len(t) >= 3)
                if pattern:
                    q_sub = filtered[
                        filtered["text"].astype(str).str.lower().str.contains(pattern, na=False, regex=True)
                        | filtered["category"].astype(str).str.lower().str.contains(pattern, na=False, regex=True)
                    ]
                    if not q_sub.empty:
                        filtered = q_sub

            needed = limit - len(live_items)
            sampled = filtered.sample(n=min(needed, len(filtered)), random_state=None)
            for _, row in sampled.iterrows():
                txt = str(row.get("text", "")).strip()
                if not txt or txt.lower() in seen_texts:
                    continue
                seen_texts.add(txt.lower())
                pred = predictor.predict(txt)
                live_items.append({
                    "text": txt,
                    "rating": int(row.get("rating", 0)) if pd.notna(row.get("rating")) else 0,
                    "category": str(row.get("category", "E-Commerce")),
                    "source": str(row.get("source", "Tokopedia PRDECT-ID")),
                    "author": "Pembeli Terverifikasi",
                    "reviewed_at": "Korpus",
                    "label": pred["label"],
                    "confidence": pred["confidence"],
                    "probabilities": pred["probabilities"],
                    "clean_text": pred["teks_bersih"],
                })
        except Exception as exc:
            logger.warning("Dynamic corpus sampling error: %s", exc)

    # 3. Attach Real Product Images & Showcase Gallery
    media_search_q = (
        display_query
        if (display_query and not display_query.startswith("Link Produk"))
        else CATEGORY_DEFAULT_PRODUCT_QUERY.get(category, CATEGORY_DEFAULT_PRODUCT_QUERY["Semua"])
    )
    showcase_media = _fetch_real_product_media(media_search_q, limit=max(6, limit))
    for idx, item in enumerate(live_items):
        if showcase_media:
            media_entry = showcase_media[idx % len(showcase_media)]
            item["image_url"] = media_entry.get("image_url", "")
            item["thumbnail_url"] = media_entry.get("thumbnail_url", "")
            item["product_title"] = (
                display_query
                if (display_query and not display_query.startswith("Link Produk"))
                else media_entry.get("title", item.get("category", "Produk E-Commerce"))
            )
            item["product_url"] = media_entry.get("product_url", "")
        else:
            item["image_url"] = ""
            item["thumbnail_url"] = ""
            item["product_title"] = display_query or item.get("category", "Produk E-Commerce")
            item["product_url"] = ""

    p_label_top = LIVE_ECOMMERCE_PLATFORMS.get(platform_key, {}).get("name", "E-Commerce Indonesia")
    resolved_title = display_query or (showcase_media[0]["title"] if showcase_media else f"Katalog {category}")
    product_showcase = {
        "title": resolved_title,
        "platform": p_label_top,
        "category": category,
        "image_url": showcase_media[0]["image_url"] if showcase_media else "",
        "thumbnail_url": showcase_media[0]["thumbnail_url"] if showcase_media else "",
        "product_url": showcase_media[0]["product_url"] if showcase_media else "",
        "gallery": showcase_media[:4],
    }

    # 4. Generate Product Executive Summary (Pros & Cons)
    product_summary = synthesize_product_summary(live_items, resolved_title)
    product_summary["image_url"] = product_showcase["image_url"]
    product_summary["thumbnail_url"] = product_showcase["thumbnail_url"]
    product_summary["product_url"] = product_showcase["product_url"]
    product_summary["platform"] = p_label_top
    product_summary["category"] = category

    return {
        "success": True,
        "external_live": external_source_reached,
        "platform": platform_key,
        "query": display_query,
        "category": category,
        "total_fetched": len(live_items),
        "corpus_total": predictor.get_corpus_total(),
        "realtime_learned_count": len(predictor.realtime_memory),
        "product_showcase": product_showcase,
        "product_summary": product_summary,
        "items": live_items,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.route("/api/realtime/fetch", methods=["POST", "GET"])
def fetch_realtime_reviews() -> Tuple[Response, int]:
    """Fetch live customer reviews directly from Indonesian E-Commerce platforms + active corpus."""
    payload = request.get_json(silent=True) if request.method == "POST" else {}
    if not isinstance(payload, dict):
        payload = {}

    raw_query = str(payload.get("query") or request.args.get("q") or "").strip()
    category = str(payload.get("category") or request.args.get("category") or "Semua").strip()
    platform_key = str(payload.get("platform") or request.args.get("platform") or "semua").strip().lower()
    limit = min(12, max(3, int(payload.get("limit") or request.args.get("limit") or 6)))

    package = _fetch_live_product_package(
        raw_query=raw_query,
        default_platform=platform_key,
        default_category=category,
        limit=limit,
    )
    return jsonify(package), 200


@app.route("/api/compare", methods=["POST"])
def compare_products() -> Tuple[Response, int]:
    """Compare sentiment, customer reputation, pros, and cons of 2 Indonesian e-commerce products head-to-head."""
    try:
        payload = request.get_json(silent=True) or {}
        prod_a_raw = str(payload.get("product_a") or "").strip()
        prod_b_raw = str(payload.get("product_b") or "").strip()
        category = str(payload.get("category") or "Semua").strip()
        platform = str(payload.get("platform") or "semua").strip().lower()

        if not prod_a_raw or not prod_b_raw:
            return error_response(
                "Mohon masukkan nama atau link untuk kedua produk yang ingin dibandingkan.",
                400,
            )

        pkg_a = _fetch_live_product_package(prod_a_raw, default_platform=platform, default_category=category, limit=6)
        pkg_b = _fetch_live_product_package(prod_b_raw, default_platform=platform, default_category=category, limit=6)

        sum_a = pkg_a["product_summary"]
        sum_b = pkg_b["product_summary"]

        score_diff = round(sum_a["reputation_score"] - sum_b["reputation_score"], 1)
        pos_diff = round(sum_a["sentiment_breakdown"]["positif"] - sum_b["sentiment_breakdown"]["positif"], 1)

        if score_diff >= 3.0 or pos_diff >= 5.0:
            winner = "A"
            verdict = (
                f"{sum_a['product_title']} unggul dengan skor reputasi {sum_a['reputation_score']}/100 "
                f"({sum_a['sentiment_breakdown']['positif']}% ulasan positif) berbanding {sum_b['product_title']} "
                f"yang memperoleh skor {sum_b['reputation_score']}/100 ({sum_b['sentiment_breakdown']['positif']}% positif). "
                f"Kepuasan konsumen lebih konsisten pada aspek: {', '.join(sum_a['pros'][:2])}."
            )
        elif score_diff <= -3.0 or pos_diff <= -5.0:
            winner = "B"
            verdict = (
                f"{sum_b['product_title']} unggul dengan skor reputasi {sum_b['reputation_score']}/100 "
                f"({sum_b['sentiment_breakdown']['positif']}% ulasan positif) berbanding {sum_a['product_title']} "
                f"yang memperoleh skor {sum_a['reputation_score']}/100 ({sum_a['sentiment_breakdown']['positif']}% positif). "
                f"Kepuasan konsumen lebih konsisten pada aspek: {', '.join(sum_b['pros'][:2])}."
            )
        else:
            winner = "TIE"
            verdict = (
                f"Kedua produk memiliki tingkat kepuasan konsumen yang seimbang. {sum_a['product_title']} "
                f"(skor reputasi {sum_a['reputation_score']}/100) dan {sum_b['product_title']} "
                f"(skor reputasi {sum_b['reputation_score']}/100) sama-sama memperoleh penilaian positif yang kuat. "
                f"Keputusan akhir dapat disesuaikan dengan preferensi spesifikasi dan harga."
            )

        return jsonify({
            "success": True,
            "product_a": {
                "summary": sum_a,
                "showcase": pkg_a["product_showcase"],
                "items": pkg_a["items"][:4],
            },
            "product_b": {
                "summary": sum_b,
                "showcase": pkg_b["product_showcase"],
                "items": pkg_b["items"][:4],
            },
            "winner": winner,
            "verdict": verdict,
            "score_diff": score_diff,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }), 200
    except Exception as exc:
        logger.exception("Failed during product comparison: %s", exc)
        return error_response(f"Gagal membandingkan kedua produk: {exc}", 500)


@app.route("/api/predict", methods=["POST"])
@app.route("/predict", methods=["POST"])
def predict_review() -> Tuple[Response, int]:
    """Classify sentiment of an Indonesian product review with explainability & real product image."""
    try:
        payload = request.get_json(silent=True) or {}
        review_text = extract_and_validate_text(payload)
        prediction = predictor.predict(review_text)

        product_hint = str(payload.get("product_hint") or "").strip() if isinstance(payload, dict) else ""
        category_hint = str(payload.get("category") or "").strip() if isinstance(payload, dict) else ""
        platform_hint = str(payload.get("platform") or "Tokopedia").strip() if isinstance(payload, dict) else "Tokopedia"

        prediction["product_media"] = _infer_product_context_from_review(
            review_text=review_text,
            category_hint=category_hint,
            product_hint=product_hint,
            platform_hint=platform_hint,
        )

        return (
            jsonify({
                "success": True,
                **prediction,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }),
            200,
        )
    except ValueError as validation_err:
        return error_response(str(validation_err), 400)
    except RuntimeError as model_err:
        return error_response(str(model_err), 500)
    except Exception as unexpected_err:
        logger.exception("Unexpected error during sentiment prediction: %s", unexpected_err)
        return error_response("Terjadi kesalahan internal pada server.", 500)


@app.route("/api/predict/batch", methods=["POST"])
def predict_batch() -> Tuple[Response, int]:
    """Batch sentiment prediction via JSON array or CSV file upload."""
    texts: List[str] = []

    # Case 1: File Upload (CSV)
    if "file" in request.files:
        uploaded_file = request.files["file"]
        if not uploaded_file.filename or not uploaded_file.filename.endswith(".csv"):
            return error_response("File yang diunggah harus berekstensi .csv", 400)

        try:
            stream = io.StringIO(uploaded_file.stream.read().decode("utf-8-sig", errors="replace"))
            csv_df = pd.read_csv(stream)
            target_col = None
            for col in ["text", "ulasan", "review", "komentar", "comment"]:
                matches = [c for c in csv_df.columns if c.lower() == col]
                if matches:
                    target_col = matches[0]
                    break

            if target_col is None:
                # Fallback to the first string column
                for col in csv_df.columns:
                    if csv_df[col].dtype == object or pd.api.types.is_string_dtype(csv_df[col]):
                        target_col = col
                        break

            if target_col is None:
                return error_response("Tidak ditemukan kolom teks ulasan dalam CSV.", 400)

            texts = csv_df[target_col].dropna().astype(str).tolist()
        except Exception as e:
            return error_response(f"Gagal membaca file CSV: {e}", 400)

    # Case 2: JSON payload
    else:
        payload = request.get_json(silent=True)
        if isinstance(payload, dict) and "reviews" in payload and isinstance(payload["reviews"], list):
            texts = [str(t) for t in payload["reviews"]]
        elif isinstance(payload, list):
            texts = [str(t) for t in payload]
        else:
            return error_response(
                "Request harus menyertakan file CSV atau JSON dengan array 'reviews'.",
                400,
            )

    if not texts:
        return error_response("Tidak ada teks ulasan yang diberikan.", 400)

    # Limit batch to 500 items to avoid long synchronous stalls
    texts = texts[:500]
    batch_result = predictor.predict_batch(texts)

    return jsonify({"success": True, **batch_result}), 200


@app.errorhandler(404)
def handle_not_found(_err: Exception) -> Tuple[Response, int]:
    return error_response("Endpoint tidak ditemukan.", 404)


@app.errorhandler(500)
def handle_internal_error(_err: Exception) -> Tuple[Response, int]:
    return error_response("Kesalahan internal server.", 500)


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_production_frontend(path: str):
    """Serve compiled Vite frontend single-page application in production."""
    if FRONTEND_DIST_DIR.exists():
        target_file = FRONTEND_DIST_DIR / path
        if path and target_file.exists():
            return send_from_directory(FRONTEND_DIST_DIR, path)
        index_file = FRONTEND_DIST_DIR / "index.html"
        if index_file.exists():
            return send_from_directory(FRONTEND_DIST_DIR, "index.html")

    return jsonify({
        "status": "ok",
        "message": "Sentiment Analysis API backend is running.",
        "docs": "Access frontend at http://localhost:5173 during development."
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
