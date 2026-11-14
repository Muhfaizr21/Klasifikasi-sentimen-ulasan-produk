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

    def test_get_top_feature_words(self):
        predictor = get_predictor()
        top_words = predictor.get_top_feature_words(limit=10)
        assert "positif" in top_words
        assert "netral" in top_words
        assert "negatif" in top_words
        assert len(top_words["positif"]) > 0
        assert len(top_words["negatif"]) > 0
        assert "score" in top_words["positif"][0]

    def test_synthesize_product_summary(self):
        predictor = get_predictor()
        mock_reviews = [
            {"text": "Bagus banget suaranya jernih mantap", "label": "positif", "rating": 5},
            {"text": "Bagus kualitasnya original", "label": "positif", "rating": 5},
            {"text": "Standar sesuai harga", "label": "netral", "rating": 3},
            {"text": "Pengiriman agak lama dan bungkus tipis", "label": "negatif", "rating": 2},
        ]
        summary = predictor.synthesize_product_summary(mock_reviews, "Speaker Portable Bluetooth")
        assert summary["product_title"] == "Speaker Portable Bluetooth"
        assert 0 <= summary["reputation_score"] <= 100
        assert summary["recommendation_badge"] in [
            "Sangat Direkomendasikan",
            "Layak Beli",
            "Cukup Layak Dipertimbangkan",
            "Perlu Pertimbangan Ulang",
            "Data Masih Terbatas",
        ]
        assert len(summary["pros"]) > 0
        assert "executive_narrative" in summary

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
        assert "analysis" in res
        assert len(res["analysis"]["paragraphs"]) >= 2

    def test_predict_expectation_reversal_pragmatics(self):
        """Phrases like 'saya kira barang nya bagus' imply unmet expectation in Indonesian reviews."""
        predictor = get_predictor()
        res = predictor.predict("saya kira barang nya bagus")
        assert res["label"] == "negatif"
        assert res["analysis"]["pragmatic_note"]["type"] == "expectation_reversal"
        assert len(res["analysis"]["reasoning_steps"]) == 3

    def test_predict_negation_inversion(self):
        """Negated positive phrases like 'barang tidak bagus' should be classified as negatif."""
        predictor = get_predictor()
        res = predictor.predict("barangnya tidak bagus dan tidak membantu")
        assert res["label"] == "negatif"
        assert res["analysis"]["pragmatic_note"]["type"] == "negation_inversion"

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

    def test_samples_dynamic_category_and_query(self, api_client):
        res = api_client.get("/api/samples?category=Elektronik&q=bagus")
        assert res.status_code == 200
        data = res.get_json()
        assert data["success"] is True
        assert data["category"] == "Elektronik"
        assert data["corpus_total"] >= 5459
        assert len(data["samples"]) > 0

    def test_realtime_learn_endpoint(self, api_client):
        payload = {
            "teks": "Kualitas jahitan rapi dan bahan sangat nyaman dipakai seharian",
            "label": "positif",
            "category": "Fashion",
            "persist": False,
        }
        res = api_client.post("/api/learn", json=payload)
        assert res.status_code == 200
        data = res.get_json()
        assert data["success"] is True
        assert data["learned_label"] == "positif"
        assert data["prediction"]["label"] == "positif"
        assert data["corpus_total"] >= 5459

    def test_realtime_fetch_stream_endpoint(self, api_client):
        payload = {"query": "barang", "category": "Elektronik", "limit": 4}
        res = api_client.post("/api/realtime/fetch", json=payload)
        assert res.status_code == 200
        data = res.get_json()
        assert data["success"] is True
        assert len(data["items"]) > 0
        assert "label" in data["items"][0]
        assert "confidence" in data["items"][0]

    def test_top_words_endpoint(self, api_client):
        res = api_client.get("/api/top-words?limit=15")
        assert res.status_code == 200
        data = res.get_json()
        assert data["success"] is True
        assert "words" in data
        assert len(data["words"]["positif"]) <= 15
        assert len(data["words"]["negatif"]) <= 15

    def test_compare_endpoint(self, api_client):
        payload = {
            "product_a": "Eggel Fortis 2 Speaker",
            "product_b": "JBL Go 3 Portable Speaker",
            "category": "Elektronik",
            "platform": "Tokopedia"
        }
        res = api_client.post("/api/compare", json=payload)
        assert res.status_code == 200
        data = res.get_json()
        assert data["success"] is True
        assert "winner" in data
        assert data["winner"] in ["A", "B", "TIE"]
        assert "product_a" in data
        assert "product_b" in data
        assert "reputation_score" in data["product_a"]["summary"]

    def test_categories_dynamic_endpoint(self, api_client):
        res = api_client.get("/api/categories")
        assert res.status_code == 200
        data = res.get_json()
        assert data["success"] is True
        assert data["total_categories"] >= 25
        assert len(data["groups"]) >= 4
        assert len(data["categories"]) >= 25
        # Verify granular category filtering works in /api/samples
        sub_res = api_client.get("/api/samples?category=Computers+and+Laptops")
        assert sub_res.status_code == 200
        sub_data = sub_res.get_json()
        assert sub_data["success"] is True
        assert len(sub_data["samples"]) > 0

