"""Sentiment prediction service with explainability and batch classification."""

import logging
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

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

    def explain_tokens(self, model_input: str) -> List[Dict[str, Any]]:
        """Explain word contributions based on Naive Bayes log-likelihood difference."""
        if not self.pipeline:
            return []

        vec = self.pipeline.named_steps.get("vectorizer")
        clf = self.pipeline.named_steps.get("classifier")
        if not vec or not clf or not hasattr(clf, "feature_log_prob_"):
            return []

        vocab = getattr(vec, "vocabulary_", {})
        log_probs = clf.feature_log_prob_
        classes = list(getattr(clf, "classes_", []))

        if "positif" not in classes or "negatif" not in classes:
            return []

        pos_idx = classes.index("positif")
        neg_idx = classes.index("negatif")

        explanations: List[Dict[str, Any]] = []
        seen = set()

        for token in model_input.split():
            if token in vocab and token not in seen:
                seen.add(token)
                idx = vocab[token]
                pos_log = float(log_probs[pos_idx, idx])
                neg_log = float(log_probs[neg_idx, idx])
                diff = pos_log - neg_log

                if diff > 0.35:
                    polarity = "positif"
                elif diff < -0.35:
                    polarity = "negatif"
                else:
                    polarity = "netral"

                explanations.append({
                    "word": token,
                    "polarity": polarity,
                    "score": round(diff, 2),
                })

        # Sort by absolute influence score descending
        explanations.sort(key=lambda x: abs(x["score"]), reverse=True)
        return explanations

    def predict(self, raw_text: str) -> Dict[str, Any]:
        """Run preprocessing and return predicted label, probabilities, cleaned text, and explanation."""
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
        explanation = self.explain_tokens(model_input)

        return {
            "label": predicted_label,
            "probabilitas": probabilities_ratio,
            "probabilities": probabilities_percent,
            "confidence": confidence,
            "teks_bersih": clean_text,
            "text": raw_text,
            "explanation": explanation,
        }

    def predict_batch(self, raw_texts: List[str]) -> Dict[str, Any]:
        """Classify a batch of review texts and return summary metrics."""
        results = []
        counts = {"positif": 0, "netral": 0, "negatif": 0}

        for text in raw_texts:
            text_str = str(text).strip()
            if not text_str:
                continue
            try:
                res = self.predict(text_str)
                counts[res["label"]] += 1
                results.append({
                    "text": text_str,
                    "label": res["label"],
                    "confidence": res["confidence"],
                    "probabilities": res["probabilities"],
                    "clean_text": res["teks_bersih"],
                })
            except Exception as e:
                logger.warning("Failed to classify batch item: %s", e)

        total = len(results)
        percentages = {
            k: round((v / total * 100), 2) if total > 0 else 0.0
            for k, v in counts.items()
        }

        return {
            "total": total,
            "distribution": counts,
            "percentages": percentages,
            "results": results,
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
