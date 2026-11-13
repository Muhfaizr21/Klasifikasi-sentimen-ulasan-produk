"""Text preprocessing and dataset splitting module (Single Source of Truth)."""

import logging
import re
import string
from typing import Tuple

import pandas as pd
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory
from sklearn.model_selection import train_test_split

from src.constants import (
    PRESERVED_SENTIMENT_WORDS,
    RANDOM_SEED,
    SLANG_DICTIONARY,
    TEST_SPLIT_RATIO,
)

logger = logging.getLogger(__name__)


class DataPreprocessor:
    """Cleans, normalizes slang, removes stopwords, and stems Indonesian review texts."""

    def __init__(self, use_stemming: bool = False) -> None:
        self.use_stemming = use_stemming
        default_stopwords = set(StopWordRemoverFactory().get_stop_words())
        self.stopwords = default_stopwords - PRESERVED_SENTIMENT_WORDS
        self.stemmer = StemmerFactory().create_stemmer()

    def clean_text(self, text: str) -> str:
        """Convert text to lowercase and strip control characters, URLs, digits, and punctuation."""
        if pd.isna(text) or text is None:
            return ""

        cleaned = str(text)
        cleaned = re.sub(r"[\x00-\x1f\x7f-\x9f]", " ", cleaned)
        cleaned = cleaned.lower()
        cleaned = re.sub(r"http\S+|www\S+|https\S+", " ", cleaned, flags=re.MULTILINE)
        cleaned = re.sub(r"@\w+|#\w+", " ", cleaned)
        cleaned = re.sub(r"\d+", " ", cleaned)
        cleaned = cleaned.translate(str.maketrans(string.punctuation, " " * len(string.punctuation)))
        return " ".join(cleaned.split()).strip()

    def normalize_slang(self, text: str) -> str:
        """Replace informal Indonesian slang tokens with their standard forms."""
        if not text:
            return ""
        tokens = [SLANG_DICTIONARY.get(token, token) for token in text.split()]
        return " ".join(tokens)

    def remove_stopwords(self, text: str) -> str:
        """Remove Indonesian stopwords while preserving negation and sentiment modifiers."""
        if not text:
            return ""
        tokens = [token for token in text.split() if token not in self.stopwords]
        return " ".join(tokens)

    def stem_text(self, text: str) -> str:
        """Apply Sastrawi Indonesian stemming."""
        return self.stemmer.stem(text) if text else ""

    def preprocess_text(
        self,
        text: str,
        remove_stop: bool = True,
        use_stem: bool = False,
    ) -> str:
        """Run the complete preprocessing pipeline on a single review string."""
        result = self.clean_text(text)
        result = self.normalize_slang(result)
        if remove_stop:
            result = self.remove_stopwords(result)
        if use_stem or self.use_stemming:
            result = self.stem_text(result)
        return result.strip()

    def preprocess_dataframe(
        self,
        df: pd.DataFrame,
        text_column: str = "text",
    ) -> pd.DataFrame:
        """Preprocess all rows in a dataframe and filter out empty entries."""
        processed_df = df.copy()
        processed_df["clean_text"] = processed_df[text_column].apply(
            lambda val: self.preprocess_text(val, remove_stop=True, use_stem=False)
        )
        processed_df["no_stopwords_text"] = processed_df[text_column].apply(
            lambda val: self.preprocess_text(val, remove_stop=False, use_stem=False)
        )

        valid_mask = processed_df["clean_text"].str.len() > 0
        return processed_df[valid_mask].reset_index(drop=True)

    @staticmethod
    def split_data(
        df: pd.DataFrame,
        test_size: float = TEST_SPLIT_RATIO,
        random_state: int = RANDOM_SEED,
    ) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Split dataset into stratified training and testing sets (80:20)."""
        train_df, test_df = train_test_split(
            df,
            test_size=test_size,
            random_state=random_state,
            stratify=df["sentiment"],
        )
        return train_df, test_df
