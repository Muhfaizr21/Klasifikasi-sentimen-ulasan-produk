"""Flask REST API controller for Indonesian Product Review Sentiment Classification."""

import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Tuple

from flask import Flask, Response, jsonify, request
from flask_cors import CORS

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from src.constants import MAX_TEXT_LENGTH, METRICS_ARTIFACT_PATH, RAW_DATA_PATH
from src.predict import get_predictor
import pandas as pd

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
    """Classify sentiment of an Indonesian product review."""
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


@app.errorhandler(404)
def handle_not_found(_err: Exception) -> Tuple[Response, int]:
    return error_response("Endpoint tidak ditemukan.", 404)


@app.errorhandler(500)
def handle_internal_error(_err: Exception) -> Tuple[Response, int]:
    return error_response("Kesalahan internal server.", 500)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
