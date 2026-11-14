"""Flask REST API controller for Indonesian Product Review Sentiment Classification."""

import io
import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Tuple

import pandas as pd
from flask import Flask, Response, jsonify, request, send_from_directory
from flask_cors import CORS

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from src.constants import MAX_TEXT_LENGTH, METRICS_ARTIFACT_PATH, RAW_DATA_PATH
from src.predict import get_predictor

FRONTEND_DIST_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

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
    """Return service health and model readiness status."""
    return (
        jsonify({
            "status": "ok",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "models_loaded": predictor.is_loaded,
        }),
        200,
    )


@app.route("/api/metrics", methods=["GET"])
@app.route("/evaluasi", methods=["GET"])
def get_evaluation_metrics() -> Tuple[Response, int]:
    """Return model evaluation metrics read from models/metrics.json."""
    if not METRICS_ARTIFACT_PATH.exists():
        return error_response(
            "Berkas evaluasi belum tersedia. Jalankan `python src/train.py` terlebih dahulu.",
            404,
        )

    with open(METRICS_ARTIFACT_PATH, "r", encoding="utf-8") as file:
        metrics_data = json.load(file)

    return jsonify({"success": True, "metrics": metrics_data}), 200


@app.route("/api/samples", methods=["GET"])
def get_dataset_samples() -> Tuple[Response, int]:
    """Return real sample reviews per sentiment class from the dataset."""
    if not RAW_DATA_PATH.exists():
        return error_response("Dataset mentah belum tersedia.", 404)

    try:
        df = pd.read_csv(RAW_DATA_PATH)
        samples = []
        for sentiment_cls in ["positif", "netral", "negatif"]:
            subset = df[df["sentiment"] == sentiment_cls]
            if not subset.empty:
                sampled_rows = subset.sample(n=min(3, len(subset)), random_state=None)
                for _, row in sampled_rows.iterrows():
                    samples.append({
                        "text": str(row.get("text", "")),
                        "sentiment": str(row.get("sentiment", sentiment_cls)),
                        "rating": int(row.get("rating", 0)) if pd.notna(row.get("rating")) else 0,
                        "category": str(row.get("category", "Produk")),
                        "source": str(row.get("source", "PRDECT-ID")),
                    })
        return jsonify({"success": True, "samples": samples}), 200
    except Exception as exc:
        logger.exception("Failed to load sample reviews: %s", exc)
        return error_response("Gagal memuat sampel ulasan.", 500)


@app.route("/api/predict", methods=["POST"])
@app.route("/predict", methods=["POST"])
def predict_review() -> Tuple[Response, int]:
    """Classify sentiment of an Indonesian product review with explainability."""
    try:
        review_text = extract_and_validate_text(request.get_json(silent=True))
        prediction = predictor.predict(review_text)

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
    app.run(host="0.0.0.0", port=5000, debug=False)
