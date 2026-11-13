"""Sentiment prediction service using the trained Scikit-Learn pipeline."""

import logging
import sys
from pathlib import Path
from typing import Any, Dict, Optional

import joblib

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.constants import MODEL_ARTIFACT_PATH
from src.preprocess import DataPreprocessor

logger = logging.getLogger(__name__)


class SentimentPredictor:
    """Loads the persisted pipeline once and predicts sentiment with class probabilities."""

    def __init__(self, model_path: Path = MODEL_ARTIFACT_PATH) -> None:
        self.model_path = model_path
        self.pipeline = None
        self.preprocessor = DataPreprocessor()
        self.reload()

    def reload(self) -> bool:
        """Load or reload the trained model artifact from disk."""
        if not self.model_path.exists():
            logger.error("Model file not found at %s", self.model_path)
            return False

        try:
            self.pipeline = joblib.load(self.model_path)
            logger.info("Loaded model pipeline from %s", self.model_path)
            return True
        except Exception as exc:
            logger.error("Failed to load model from %s: %s", self.model_path, exc)
            return False

    @property
    def is_loaded(self) -> bool:
        """Return True if the Scikit-Learn pipeline is ready in memory."""
        return self.pipeline is not None

    def predict(self, raw_text: str) -> Dict[str, Any]:
        """Run preprocessing and return predicted label, probabilities, and cleaned text."""
        if not self.is_loaded and not self.reload():
            raise RuntimeError(
                "Model belum dilatih. Jalankan `python src/train.py` terlebih dahulu."
            )

        clean_text = self.preprocessor.preprocess_text(raw_text, remove_stop=True, use_stem=False)
        model_input = clean_text or self.preprocessor.clean_text(raw_text)

        if not model_input:
            raise ValueError("Teks ulasan tidak mengandung kata yang valid setelah pembersihan.")

        predicted_label = str(self.pipeline.predict([model_input])[0])

        probabilities_ratio: Dict[str, float] = {"positif": 0.0, "netral": 0.0, "negatif": 0.0}
        probabilities_percent: Dict[str, float] = {"positif": 0.0, "netral": 0.0, "negatif": 0.0}

        if hasattr(self.pipeline, "predict_proba"):
            raw_probs = self.pipeline.predict_proba([model_input])[0]
            classes = getattr(self.pipeline, "classes_", [])
            for class_name, prob in zip(classes, raw_probs):
                key = str(class_name)
                probabilities_ratio[key] = round(float(prob), 4)
                probabilities_percent[key] = round(float(prob) * 100.0, 2)

        confidence = max(probabilities_percent.values()) if probabilities_percent else 0.0

        return {
            "label": predicted_label,
            "probabilitas": probabilities_ratio,
            "probabilities": probabilities_percent,
            "confidence": confidence,
            "teks_bersih": clean_text,
            "text": raw_text,
        }


_predictor_instance: Optional[SentimentPredictor] = None


def get_predictor() -> SentimentPredictor:
    """Return the singleton SentimentPredictor instance."""
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = SentimentPredictor()
    return _predictor_instance


def predict_sentiment(text: str) -> Dict[str, Any]:
    """Convenience function to predict sentiment for a single review string."""
    return get_predictor().predict(text)
