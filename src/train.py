"""Model training, multi-configuration experimentation, and evaluation module."""

import json
import logging
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Tuple

import joblib
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)
from sklearn.naive_bayes import ComplementNB, MultinomialNB
from sklearn.pipeline import Pipeline

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.constants import (
    MAIN_DATA_PATH,
    METRICS_ARTIFACT_PATH,
    MODEL_ARTIFACT_PATH,
    MODELS_DIR,
    PROCESSED_DATA_PATH,
    SENTIMENT_LABELS,
    VECTORIZER_ARTIFACT_PATH,
)
from src.preprocess import DataPreprocessor

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class ExperimentConfig:
    """Immutable configuration for a single feature + classifier experiment."""

    name: str
    vectorizer_type: str
    classifier_type: str
    remove_stopwords: bool
    max_features: int = 2500
    ngram_range: Tuple[int, int] = (1, 2)
    alpha: float = 0.5


EXPERIMENT_SUITE: List[ExperimentConfig] = [
    ExperimentConfig(
        name="TF-IDF + MultinomialNB (Stopwords Removed)",
        vectorizer_type="tfidf",
        classifier_type="multinomial",
        remove_stopwords=True,
    ),
    ExperimentConfig(
        name="TF-IDF + ComplementNB (Stopwords Removed)",
        vectorizer_type="tfidf",
        classifier_type="complement",
        remove_stopwords=True,
    ),
    ExperimentConfig(
        name="CountVectorizer + MultinomialNB (Stopwords Removed)",
        vectorizer_type="count",
        classifier_type="multinomial",
        remove_stopwords=True,
    ),
    ExperimentConfig(
        name="CountVectorizer + ComplementNB (Stopwords Removed)",
        vectorizer_type="count",
        classifier_type="complement",
        remove_stopwords=True,
    ),
    ExperimentConfig(
        name="TF-IDF + MultinomialNB (Tanpa Stopword Removal)",
        vectorizer_type="tfidf",
        classifier_type="multinomial",
        remove_stopwords=False,
    ),
]


class ModelTrainer:
    """Orchestrates dataset preprocessing, experiment evaluation, and artifact persistence."""

    def __init__(self, model_dir: Path = MODELS_DIR) -> None:
        self.model_dir = model_dir
        self.model_dir.mkdir(parents=True, exist_ok=True)
        self.preprocessor = DataPreprocessor()

    @staticmethod
    def build_pipeline(config: ExperimentConfig) -> Pipeline:
        """Create a Scikit-Learn Pipeline from an ExperimentConfig."""
        if config.vectorizer_type == "tfidf":
            vectorizer = TfidfVectorizer(
                max_features=config.max_features,
                ngram_range=config.ngram_range,
                sublinear_tf=True,
            )
        else:
            vectorizer = CountVectorizer(
                max_features=config.max_features,
                ngram_range=config.ngram_range,
            )

        classifier = (
            ComplementNB(alpha=config.alpha)
            if config.classifier_type == "complement"
            else MultinomialNB(alpha=config.alpha)
        )

        return Pipeline([
            ("vectorizer", vectorizer),
            ("classifier", classifier),
        ])

    @staticmethod
    def evaluate_pipeline(
        pipeline: Pipeline,
        x_test: pd.Series,
        y_test: pd.Series,
        config: ExperimentConfig,
    ) -> Dict[str, Any]:
        """Compute accuracy, F1 scores, per-class report, and confusion matrix."""
        y_pred = pipeline.predict(x_test)

        accuracy = float(accuracy_score(y_test, y_pred))
        f1_macro = float(f1_score(y_test, y_pred, average="macro"))
        f1_weighted = float(f1_score(y_test, y_pred, average="weighted"))
        report = classification_report(
            y_test,
            y_pred,
            labels=SENTIMENT_LABELS,
            output_dict=True,
            zero_division=0,
        )
        matrix = confusion_matrix(y_test, y_pred, labels=SENTIMENT_LABELS)

        return {
            "experiment_name": config.name,
            "model_type": pipeline.named_steps["classifier"].__class__.__name__,
            "vectorizer_type": pipeline.named_steps["vectorizer"].__class__.__name__,
            "use_stopwords": config.remove_stopwords,
            "ngram_range": list(config.ngram_range),
            "accuracy": round(accuracy, 4),
            "f1_macro": round(f1_macro, 4),
            "f1_weighted": round(f1_weighted, 4),
            "classification_report": report,
            "confusion_matrix": matrix.tolist(),
            "labels": SENTIMENT_LABELS,
        }

    def run_experiments(
        self,
        train_df: pd.DataFrame,
        test_df: pd.DataFrame,
    ) -> Tuple[Pipeline, Dict[str, Any], List[Dict[str, Any]]]:
        """Execute all configured experiments and return the highest-scoring pipeline."""
        all_results: List[Dict[str, Any]] = []
        best_pipeline: Pipeline | None = None
        best_metrics: Dict[str, Any] | None = None
        highest_score = -1.0

        for config in EXPERIMENT_SUITE:
            feature_column = "clean_text" if config.remove_stopwords else "no_stopwords_text"
            pipeline = self.build_pipeline(config)
            pipeline.fit(train_df[feature_column], train_df["sentiment"])

            metrics = self.evaluate_pipeline(
                pipeline=pipeline,
                x_test=test_df[feature_column],
                y_test=test_df["sentiment"],
                config=config,
            )
            all_results.append(metrics)
            logger.info(
                "[%s] Accuracy=%.4f | Macro F1=%.4f",
                config.name,
                metrics["accuracy"],
                metrics["f1_macro"],
            )

            priority_score = metrics["f1_macro"] + (0.0001 if config.remove_stopwords else 0.0)
            if priority_score > highest_score:
                highest_score = priority_score
                best_pipeline = pipeline
                best_metrics = metrics

        if best_pipeline is None or best_metrics is None:
            raise RuntimeError("No experiment succeeded during training.")

        return best_pipeline, best_metrics, all_results

    def train_and_evaluate(self, data_path: Path = MAIN_DATA_PATH) -> Dict[str, Any]:
        """Full training workflow: load CSV -> preprocess -> split -> evaluate -> persist."""
        raw_df = pd.read_csv(data_path)
        processed_df = self.preprocessor.preprocess_dataframe(raw_df)

        PROCESSED_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
        processed_df.to_csv(PROCESSED_DATA_PATH, index=False, encoding="utf-8")

        train_df, test_df = self.preprocessor.split_data(processed_df)
        best_pipeline, best_metrics, experiments = self.run_experiments(train_df, test_df)

        distribution = processed_df["sentiment"].value_counts().to_dict()
        summary_payload: Dict[str, Any] = {
            **best_metrics,
            "trained_at": datetime.now(timezone.utc).isoformat(),
            "dataset_info": {
                "total_samples": int(len(processed_df)),
                "train_samples": int(len(train_df)),
                "test_samples": int(len(test_df)),
                "class_distribution": {str(k): int(v) for k, v in distribution.items()},
            },
            "experiments": experiments,
        }

        self.save_artifacts(best_pipeline, summary_payload)
        return summary_payload

    @staticmethod
    def save_artifacts(pipeline: Pipeline, metrics: Dict[str, Any]) -> None:
        """Persist trained pipeline and evaluation report to the root models directory."""
        MODELS_DIR.mkdir(parents=True, exist_ok=True)
        joblib.dump(pipeline, MODEL_ARTIFACT_PATH)
        if "vectorizer" in pipeline.named_steps:
            joblib.dump(pipeline.named_steps["vectorizer"], VECTORIZER_ARTIFACT_PATH)
        with open(METRICS_ARTIFACT_PATH, "w", encoding="utf-8") as file:
            json.dump(metrics, file, indent=2, ensure_ascii=False)
        logger.info("Saved artifacts to %s", MODELS_DIR)


def main() -> None:
    if not MAIN_DATA_PATH.exists():
        logger.error("Dataset not found at %s", MAIN_DATA_PATH)
        return

    trainer = ModelTrainer()
    metrics = trainer.train_and_evaluate(MAIN_DATA_PATH)

    print("\n" + "=" * 60)
    print("PELATIHAN & EVALUASI MODEL SELESAI")
    print("=" * 60)
    print(f"Konfigurasi Terbaik : {metrics['experiment_name']}")
    print(f"Total Dataset       : {metrics['dataset_info']['total_samples']} ulasan")
    print(f"Accuracy            : {metrics['accuracy']:.4f}")
    print(f"Macro F1-Score      : {metrics['f1_macro']:.4f}")
    print("=" * 60)


if __name__ == "__main__":
    main()
