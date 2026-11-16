"""Lightweight Supabase REST & Auth connectivity client for Flask backend."""

import json
import logging
import os
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv

logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(ROOT_DIR / ".env")


def _get_config() -> Dict[str, str]:
    load_dotenv(ROOT_DIR / ".env", override=False)
    return {
        "url": os.getenv("SUPABASE_URL", "").strip().rstrip("/"),
        "publishable_key": os.getenv("SUPABASE_PUBLISHABLE_KEY", "").strip(),
        "secret_key": os.getenv("SUPABASE_SECRET_KEY", "").strip(),
        "jwks_url": os.getenv("SUPABASE_JWKS_URL", "").strip(),
    }


def _active_api_key(cfg: Dict[str, str]) -> str:
    return cfg["secret_key"] or cfg["publishable_key"]


def get_supabase_status() -> Dict[str, Any]:
    """Check Supabase configuration and live REST/JWKS reachability."""
    cfg = _get_config()
    url = cfg["url"]
    api_key = _active_api_key(cfg)

    if not url or not api_key:
        return {
            "configured": False,
            "connected": False,
            "has_secret_key": bool(cfg["secret_key"]),
            "url": url,
            "message": "SUPABASE_URL atau API Key belum diisi di .env",
        }

    reachable = False
    jwks_ok = False
    table_ready = False
    error_detail: Optional[str] = None

    # 1. Verify JWKS / Auth endpoint reachability
    jwks_target = cfg["jwks_url"] or f"{url}/auth/v1/.well-known/jwks.json"
    try:
        req = urllib.request.Request(jwks_target, method="GET")
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            if resp.status == 200:
                jwks_ok = True
                reachable = True
    except Exception as exc:
        error_detail = str(exc)

    # 2. Check if sentiment_predictions table exists in PostgREST
    try:
        rest_req = urllib.request.Request(
            f"{url}/rest/v1/sentiment_predictions?select=id&limit=1",
            headers={
                "apikey": api_key,
                "Authorization": f"Bearer {api_key}",
            },
            method="GET",
        )
        with urllib.request.urlopen(rest_req, timeout=3.5) as resp:
            if resp.status == 200:
                table_ready = True
                reachable = True
    except urllib.error.HTTPError as http_err:
        if http_err.code in (401, 403, 404):
            reachable = True
            error_detail = f"HTTP {http_err.code}: Tabel belum dibuat atau butuh SUPABASE_SECRET_KEY / RLS policy."
        else:
            error_detail = f"HTTP {http_err.code}"
    except Exception as exc:
        if not error_detail:
            error_detail = str(exc)

    return {
        "configured": True,
        "connected": reachable,
        "jwks_ok": jwks_ok,
        "table_ready": table_ready,
        "has_secret_key": bool(cfg["secret_key"]),
        "url": url,
        "error": error_detail,
    }


def _post_rest_row(table: str, row: Dict[str, Any]) -> bool:
    """Insert a single row into a Supabase PostgREST table."""
    cfg = _get_config()
    url = cfg["url"]
    api_key = _active_api_key(cfg)
    if not url or not api_key:
        return False

    endpoint = f"{url}/rest/v1/{table}"
    payload = json.dumps(row).encode("utf-8")
    req = urllib.request.Request(
        endpoint,
        data=payload,
        headers={
            "apikey": api_key,
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=2.5) as resp:
            return resp.status in (200, 201, 204)
    except Exception as exc:
        logger.debug("Supabase insert to '%s' skipped/failed: %s", table, exc)
        return False


def log_prediction_to_supabase(raw_text: str, prediction: Dict[str, Any]) -> bool:
    """Persist a single sentiment prediction result to Supabase (non-fatal)."""
    probs = prediction.get("probabilities") or {}
    product_media = prediction.get("product_media") or {}
    row = {
        "review_text": raw_text[:2000],
        "sentiment": prediction.get("sentiment", ""),
        "confidence": float(prediction.get("confidence", 0.0) or 0.0),
        "prob_positif": float(probs.get("positif", 0.0) or 0.0),
        "prob_netral": float(probs.get("netral", 0.0) or 0.0),
        "prob_negatif": float(probs.get("negatif", 0.0) or 0.0),
        "product_name": product_media.get("title") or None,
        "category": product_media.get("category") or None,
    }
    return _post_rest_row("sentiment_predictions", row)


def log_online_learning_to_supabase(
    raw_text: str, target_label: str, category: str = "Real-Time Input"
) -> bool:
    """Persist an online learning (partial_fit) event to Supabase (non-fatal)."""
    row = {
        "review_text": raw_text[:2000],
        "target_label": target_label,
        "category": category,
    }
    return _post_rest_row("online_learning_logs", row)


def fetch_recent_supabase_predictions(limit: int = 20) -> List[Dict[str, Any]]:
    """Fetch recent sentiment predictions from Supabase."""
    cfg = _get_config()
    url = cfg["url"]
    api_key = _active_api_key(cfg)
    if not url or not api_key:
        return []

    endpoint = f"{url}/rest/v1/sentiment_predictions?select=*&order=created_at.desc&limit={int(limit)}"
    req = urllib.request.Request(
        endpoint,
        headers={
            "apikey": api_key,
            "Authorization": f"Bearer {api_key}",
        },
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as exc:
        logger.debug("Supabase fetch history failed: %s", exc)
        return []
