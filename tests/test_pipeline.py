"""Automated test suite for Text Preprocessing, Naive Bayes Pipeline, and REST API."""

import io
import json
import pytest
from pathlib import Path
from src.constants import MAX_TEXT_LENGTH
from src.preprocess import DataPreprocessor
from src.predict import get_predictor
from backend.app.main import app, extract_and_validate_text


@pytest.fixture
def preprocessor():
    return DataPreprocessor()


@pytest.fixture
def api_client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


class TestPreprocessing:
    """Unit tests for text cleaning and slang normalization."""

    def test_clean_text_removes_punctuation_and_numbers(self, preprocessor):
        raw = "Barang ini 100% Bagus Banget!!! Harganya cuma Rp.50.000 :)"
        cleaned = preprocessor.clean_text(raw)
        assert "100" not in cleaned
        assert "%" not in cleaned
        assert "!" not in cleaned
        assert cleaned.islower()

    def test_clean_text_removes_urls(self, preprocessor):
        raw = "Beli di https://tokopedia.com/toko mantap betul"
        cleaned = preprocessor.clean_text(raw)
        assert "http" not in cleaned
        assert "tokopedia.com" not in cleaned

    def test_slang_normalization(self, preprocessor):
        raw = "gk nyesel beli disini, brg bgs bgt dan paking rapi"
        normalized = preprocessor.normalize_slang(raw)
        assert "tidak" in normalized
        assert "menyesal" in normalized
        assert "barang" in normalized
        assert "bagus" in normalized
        assert "pengemasan" in normalized

    def test_preserves_negation_words(self, preprocessor):
        """Negation words like 'tidak', 'kurang', 'jangan' must NOT be stripped by stopwords."""
        raw = "tidak bagus dan kurang puas"
        result = preprocessor.preprocess_text(raw, remove_stop=True)
        assert "tidak" in result
        assert "kurang" in result

    def test_empty_and_null_input(self, preprocessor):
        assert preprocessor.preprocess_text("") == ""
        assert preprocessor.preprocess_text(None) == ""
        assert preprocessor.clean_text("   ") == ""


class TestPredictor:
    """Integration test for model prediction pipeline."""

    def test_predictor_loaded(self):
        predictor = get_predictor()
        assert predictor.is_loaded is True

    def test_predict_positive_review(self):
        predictor = get_predictor()
        res = predictor.predict("Barang original 100%, pengiriman super cepat dan packing rapi!")
        assert res["label"] in ["positif", "netral", "negatif"]
        assert res["label"] == "positif"
        assert res["confidence"] > 50.0
        assert "positif" in res["probabilities"]
        assert "explanation" in res
        assert isinstance(res["explanation"], list)

    def test_predict_negative_review(self):
        predictor = get_predictor()
        res = predictor.predict("Barang rusak parah, penjual penipu dan packing hancur lebur!")
        assert res["label"] == "negatif"
        assert res["probabilities"]["negatif"] > 50.0
        assert len(res["explanation"]) > 0

    def test_predict_batch(self):
        predictor = get_predictor()
        texts = [
            "Barang original dan bagus sekali!",
            "Rusak parah dan sangat mengecewakan",
            "Biasa saja standar sesuai harga",
        ]
        batch_res = predictor.predict_batch(texts)
        assert batch_res["total"] == 3
        assert "distribution" in batch_res
        assert len(batch_res["results"]) == 3


class TestAPIEndpoints:
    """Integration tests for Flask REST API endpoints."""

    def test_health_endpoint(self, api_client):
        res = api_client.get("/api/health")
        assert res.status_code == 200
        data = res.get_json()
        assert data["status"] == "ok"
        assert data["models_loaded"] is True

    def test_metrics_endpoint(self, api_client):
        res = api_client.get("/api/metrics")
        assert res.status_code == 200
        data = res.get_json()
        assert data["success"] is True
        assert "metrics" in data
        assert "f1_macro" in data["metrics"]

    def test_samples_endpoint(self, api_client):
        res = api_client.get("/api/samples")
        assert res.status_code == 200
        data = res.get_json()
        assert data["success"] is True
        assert len(data["samples"]) > 0

    def test_predict_valid_request(self, api_client):
        payload = {"teks": "Produk sangat berkualitas, seller komunikatif dan packing aman."}
        res = api_client.post("/api/predict", json=payload)
        assert res.status_code == 200
        data = res.get_json()
        assert data["success"] is True
        assert data["label"] == "positif"
        assert "probabilitas" in data
        assert "explanation" in data

    def test_predict_empty_text_error(self, api_client):
        res = api_client.post("/api/predict", json={"teks": "   "})
        assert res.status_code == 400
        data = res.get_json()
        assert data["success"] is False

    def test_predict_exceeds_max_length(self, api_client):
        long_text = "a" * (MAX_TEXT_LENGTH + 10)
        res = api_client.post("/api/predict", json={"teks": long_text})
        assert res.status_code == 400
        data = res.get_json()
        assert data["success"] is False

    def test_predict_batch_json(self, api_client):
        payload = {
            "reviews": [
                "Bagus sekali recommended!",
                "Jelek banget barang rusak",
            ]
        }
        res = api_client.post("/api/predict/batch", json=payload)
        assert res.status_code == 200
        data = res.get_json()
        assert data["success"] is True
        assert data["total"] == 2
        assert "distribution" in data

    def test_predict_batch_csv(self, api_client):
        csv_content = "review\nBagus mantap\nRusak parah kecewa\n"
        data = {
            "file": (io.BytesIO(csv_content.encode("utf-8")), "test_reviews.csv")
        }
        res = api_client.post(
            "/api/predict/batch",
            data=data,
            content_type="multipart/form-data"
        )
        assert res.status_code == 200
        data = res.get_json()
        assert data["success"] is True
        assert data["total"] == 2
