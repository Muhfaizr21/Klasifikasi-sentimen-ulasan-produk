"""Download and prepare public Indonesian e-commerce product review datasets (PRDECT-ID + HuggingFace)."""

import sys
import urllib.request
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.constants import DATA_DIR, MAIN_DATA_PATH, RAW_DATA_PATH

PRDECT_ID_CSV_URL = (
    "https://raw.githubusercontent.com/rhiosutoyo/"
    "PRDECT-ID-Indonesian-Product-Reviews-Dataset/main/Dataset/PRDECT-ID%20Dataset.csv"
)

HF_ECOMMERCE_JSON_URL = (
    "https://huggingface.co/datasets/AIbnuHibban/"
    "e-commerce-sentiment-bahasa-indonesia/resolve/main/simple.json"
)


def map_rating_to_sentiment(rating: int) -> str:
    """Convert 1-5 customer star rating to 3-class Indonesian sentiment label."""
    if rating <= 2:
        return "negatif"
    if rating == 3:
        return "netral"
    return "positif"


def download_file(url: str, destination: Path) -> None:
    """Download a file over HTTPS if not already cached."""
    destination.parent.mkdir(parents=True, exist_ok=True)
    print(f"Mengunduh dataset dari: {url}")
    urllib.request.urlretrieve(url, destination)


def build_real_dataset() -> pd.DataFrame:
    """Fetch PRDECT-ID (Tokopedia) and HuggingFace Indonesian e-commerce reviews."""
    raw_dir = DATA_DIR / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)

    prdect_file = raw_dir / "prdect_id_tokopedia.csv"
    hf_file = raw_dir / "hf_ecommerce_id.json"

    if not prdect_file.exists():
        download_file(PRDECT_ID_CSV_URL, prdect_file)

    if not hf_file.exists():
        download_file(HF_ECOMMERCE_JSON_URL, hf_file)

    # 1. Load PRDECT-ID Tokopedia dataset (5,400 rows)
    prd_df = pd.read_csv(prdect_file)
    tokopedia_df = pd.DataFrame({
        "text": prd_df["Customer Review"].astype(str).str.strip(),
        "rating": prd_df["Customer Rating"].astype(int),
        "sentiment": prd_df["Customer Rating"].astype(int).apply(map_rating_to_sentiment),
        "category": prd_df["Category"].astype(str),
        "source": "PRDECT-ID (Tokopedia)",
    })

    # 2. Load HuggingFace Indonesian E-Commerce Neutral Reviews to enrich minority class
    hf_df = pd.read_json(hf_file).drop_duplicates(subset=["comment"])
    hf_neutral = hf_df[hf_df["sentiment"] == "neutral"].copy()
    extra_neutral_df = pd.DataFrame({
        "text": hf_neutral["comment"].astype(str).str.strip(),
        "rating": hf_neutral["rating"].astype(int),
        "sentiment": "netral",
        "category": "General E-Commerce",
        "source": "HuggingFace (AIbnuHibban)",
    })

    combined_df = pd.concat([tokopedia_df, extra_neutral_df], ignore_index=True)
    combined_df = combined_df.drop_duplicates(subset=["text"]).reset_index(drop=True)
    return combined_df


def main() -> None:
    df = build_real_dataset()

    RAW_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(RAW_DATA_PATH, index=False, encoding="utf-8")
    df[["text", "sentiment"]].to_csv(MAIN_DATA_PATH, index=False, encoding="utf-8")

    print("\n" + "=" * 60)
    print("DATASET PUBLIK BERHASIL DIUNDUH & DISIAPKAN")
    print("=" * 60)
    print(f"Lokasi Berkas Utama : {MAIN_DATA_PATH}")
    print(f"Lokasi Data Mentah  : {RAW_DATA_PATH}")
    print(f"Total Ulasan Unik   : {len(df)} ulasan")
    print("\nDistribusi Kelas Sentimen:")
    print(df["sentiment"].value_counts().to_string())
    print("=" * 60)


if __name__ == "__main__":
    main()
