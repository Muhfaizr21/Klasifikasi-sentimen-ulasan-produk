"""Shared constants, paths, and domain rules for Indonesian Sentiment Classification."""

from pathlib import Path
from typing import Dict, List, Set

# Project Paths (Single Source of Truth)
ROOT_DIR: Path = Path(__file__).resolve().parent.parent
DATA_DIR: Path = ROOT_DIR / "data"
RAW_DATA_PATH: Path = DATA_DIR / "raw" / "reviews.csv"
MAIN_DATA_PATH: Path = DATA_DIR / "reviews.csv"
PROCESSED_DATA_PATH: Path = DATA_DIR / "processed" / "reviews_processed.csv"

MODELS_DIR: Path = ROOT_DIR / "models"
MODEL_ARTIFACT_PATH: Path = MODELS_DIR / "model_sentimen.pkl"
VECTORIZER_ARTIFACT_PATH: Path = MODELS_DIR / "vectorizer.pkl"
METRICS_ARTIFACT_PATH: Path = MODELS_DIR / "metrics.json"

# Domain Constraints
SENTIMENT_LABELS: List[str] = ["positif", "netral", "negatif"]
MAX_TEXT_LENGTH: int = 1000
RANDOM_SEED: int = 42
TEST_SPLIT_RATIO: float = 0.2

# Indonesian Informal / Slang Normalization Dictionary
SLANG_DICTIONARY: Dict[str, str] = {
    "gk": "tidak",
    "ga": "tidak",
    "gak": "tidak",
    "nggak": "tidak",
    "ngga": "tidak",
    "tdk": "tidak",
    "kagak": "tidak",
    "bgt": "sangat",
    "bgtt": "sangat",
    "bget": "sangat",
    "banget": "sangat",
    "bgs": "bagus",
    "baguss": "bagus",
    "mantul": "bagus",
    "mantap": "bagus",
    "mantab": "bagus",
    "jos": "bagus",
    "joss": "bagus",
    "oke": "bagus",
    "ok": "bagus",
    "okey": "bagus",
    "recomended": "rekomendasi",
    "recommended": "rekomendasi",
    "rekomen": "rekomendasi",
    "worth": "layak",
    "ori": "original",
    "orisinil": "original",
    "asli": "original",
    "kw": "palsu",
    "fake": "palsu",
    "zonk": "buruk",
    "ancur": "hancur",
    "parah": "buruk",
    "jelek": "buruk",
    "jlk": "buruk",
    "mengecewakan": "kecewa",
    "nyesel": "menyesal",
    "nyesal": "menyesal",
    "kapok": "menyesal",
    "cpt": "cepat",
    "cepet": "cepat",
    "kilat": "cepat",
    "lelet": "lambat",
    "lamaa": "lama",
    "lm": "lama",
    "murmer": "murah",
    "mumer": "murah",
    "brg": "barang",
    "produk": "barang",
    "paking": "pengemasan",
    "packing": "pengemasan",
    "kemas": "pengemasan",
    "seller": "penjual",
    "admin": "penjual",
    "kurir": "pengiriman",
    "ekspedisi": "pengiriman",
    "kirim": "pengiriman",
    "ongkir": "pengiriman",
    "smpe": "sampai",
    "sampe": "sampai",
    "nyampe": "sampai",
    "dtg": "datang",
    "udh": "sudah",
    "udah": "sudah",
    "sdh": "sudah",
    "blm": "belum",
    "tp": "tetapi",
    "tapi": "tetapi",
    "ko": "kok",
    "kok": "kok",
    "kirain": "kira",
    "dikira": "kira",
    "kupikir": "kira",
    "nyangka": "sangka",
    "expect": "ekspektasi",
    "zonk": "buruk",
    "ketipu": "tipu",
    "cacat": "rusak",
    "lecet": "rusak",
    "penyok": "rusak",
    "pecah": "rusak",
    "mati": "rusak",
    "error": "rusak",
    "eror": "rusak",
    "retur": "ganti",
    "refund": "ganti",
    "beneran": "benar",
    "bnrn": "benar",
    "yg": "yang",
    "dgn": "dengan",
    "dg": "dengan",
    "utk": "untuk",
    "buat": "untuk",
    "krn": "karena",
    "karna": "karena",
    "bikin": "membuat",
    "aja": "saja",
    "aj": "saja",
    "doang": "saja",
    "std": "standar",
    "biasa": "standar",
    "lumayan": "cukup",
    "mayan": "cukup",
    "makasih": "terima kasih",
    "mksh": "terima kasih",
    "thx": "terima kasih",
    "thanks": "terima kasih",
}

# Negation and sentiment-bearing words that must NOT be stripped as stopwords
PRESERVED_SENTIMENT_WORDS: Set[str] = {
    "tidak", "bukan", "jangan", "belum", "kurang", "tanpa",
    "cukup", "agak", "lumayan", "biasa", "standar", "sangat", "terlalu", "lebih",
    "baik", "bagus", "buruk", "puas", "kecewa",
    "kira", "sangka", "kok", "malah", "ternyata", "padahal", "tetapi", "namun",
    "sayang", "sayangnya", "cuma", "hanya", "ganti", "masalah", "bantu", "membantu",
    "rusak", "sesuai", "pas", "benar",
}

