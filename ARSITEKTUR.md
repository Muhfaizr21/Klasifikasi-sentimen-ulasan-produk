# Arsitektur: Sentimen Ulasan Produk (Naive Bayes)

**Versi:** 1.0
**Acuan:** [PRD](PRD.md)

## 1. Gambaran Umum

Sistem terdiri dari dua bagian yang terpisah: **pipeline pelatihan** yang dijalankan sekali atau setiap kali data berubah, dan **aplikasi web** yang hanya memuat model tersimpan untuk melakukan prediksi. Kedua bagian dihubungkan oleh satu file model yang sama, sehingga preprocessing dan vectorizer di web selalu sama dengan saat pelatihan.

## 2. Diagram Alur

Alur pelatihan:

Dataset mentah (CSV) → Validasi kolom dan label → Preprocessing teks → Pembagian latih dan uji (80:20, stratified) → Pipeline (Vectorizer + Naive Bayes) → Evaluasi → Simpan model (.pkl) dan laporan metrik

Alur prediksi di web:

Browser (form ulasan) → Backend Flask (`POST /predict`) → Validasi input → Preprocessing teks (fungsi yang sama dengan pelatihan) → Pipeline termuat → `predict_proba` → JSON label dan probabilitas → Browser menampilkan hasil

## 3. Komponen

| Komponen | Berkas | Tanggung jawab |
|----------|--------|----------------|
| Preprocessing | `src/preprocess.py` | Lowercase, hapus URL, angka, tanda baca; normalisasi slang; hapus stopword; stemming opsional |
| Pelatihan | `src/train.py` | Memuat data, membagi data, membangun pipeline, melatih, mengevaluasi, dan menyimpan model |
| Prediksi | `src/predict.py` | Memuat model sekali saat aplikasi start; menyediakan fungsi `predict_sentiment(teks)` |
| Backend | `app/main.py` | Menyediakan route halaman dan API; memanggil `predict.py` |
| Frontend | `app/templates/`, `app/static/` | Form input, tampilan hasil, bar probabilitas |
| Model | `models/model_sentimen.pkl` | Pipeline terlatih hasil `joblib.dump` |
| Laporan metrik | `models/metrics.json` | Angka evaluasi yang dibaca halaman evaluasi di web |

Prinsip pemisahan: `preprocess.py` dipakai oleh `train.py` dan `predict.py`. Tidak boleh ada salinan logika preprocessing di tempat lain.

## 4. Desain Pipeline Model

Pipeline scikit-learn terdiri dari dua langkah:

1. **Vectorizer:** `CountVectorizer` atau `TfidfVectorizer`, dengan `ngram_range` dan `min_df` sebagai parameter eksperimen.
2. **Klasifikasi:** `MultinomialNB` sebagai baseline, dan `ComplementNB` sebagai alternatif untuk data tidak seimbang.

Fungsi preprocessing dimasukkan ke vectorizer melalui parameter `preprocessor` atau dijalankan sebelum pipeline. Pilihan ini harus dicatat di laporan, dan keputusan akhirnya harus konsisten antara pelatihan dan prediksi.

Eksperimen yang direncanakan: CountVectorizer vs TF-IDF, dengan dan tanpa stopword, serta MultinomialNB vs ComplementNB. Hasil setiap kombinasi dicatat di `models/metrics.json`.

## 5. Desain API

Hanya ada satu endpoint prediksi untuk menjaga ruang lingkup tetap kecil.

**POST /predict**

Permintaan (JSON):
- `teks` (string, wajib, maksimal 1.000 karakter)

Respons sukses (200):
- `label`: salah satu dari `positif`, `netral`, `negatif`
- `probabilitas`: objek dengan tiga kunci kelas dan nilai antara 0 dan 1, jumlahnya 1
- `teks_bersih`: hasil preprocessing (untuk keperluan demo dan penjelasan di laporan)

Respons gagal:
- 400: teks kosong, bukan string, atau melebihi batas panjang
- 500: model tidak ditemukan atau gagal dimuat

**GET /** menampilkan halaman demo.
**GET /evaluasi** menampilkan metrik dari `models/metrics.json`.

## 6. Keputusan Desain

| Keputusan | Alasan | Konsekuensi |
|-----------|--------|-------------|
| Flask dipilih dibanding FastAPI | Lebih sederhana untuk dipelajari anggota kelompok | Tidak ada validasi otomatis; validasi ditulis manual |
| Model dimuat sekali saat start | Prediksi cepat | Perlu restart server setelah model dilatih ulang |
| Satu pipeline untuk vectorizer dan model | Mencegah ketidakcocokan fitur | Model lebih besar dalam ukuran file |
| Tidak ada database | Ruang lingkup PRD tidak butuh riwayat | Riwayat prediksi tidak tersimpan |
| Metrik disimpan sebagai JSON | Halaman evaluasi cukup membaca satu berkas | Pembaruan metrik harus lewat `train.py` |

## 7. Alur Kerja Tim dan Repositori

- Gunakan branch terpisah per anggota atau per tahap (misal `feat/preprocess`, `feat/web`).
- Perubahan pada `preprocess.py` harus diuji ulang dengan `train.py` sebelum digabung.
- Model dan data mentah tidak masuk Git jika ukurannya besar. Gunakan `.gitignore` dan bagikan lewat Google Drive.

## 8. Penanganan Error dan Keamanan

- Input teks dibersihkan dari karakter kontrol sebelum diproses.
- Web tidak menjalankan atau menampilkan teks sebagai HTML mentah; Jinja2 melakukan escaping otomatis.
- Jika `model_sentimen.pkl` tidak ada, aplikasi menampilkan pesan bahwa model perlu dilatih terlebih dahulu, bukan crash.
- Log error ditulis ke konsol, tanpa menyimpan teks ulasan pengguna.

## 9. Pengujian

| Jenis | Cakupan | Cara |
|-------|---------|------|
| Unit | `preprocess.py` | Contoh kalimat dengan hasil bersih yang sudah diketahui |
| Integrasi | `train.py` sampai `predict.py` | Latih model kecil, lalu pastikan prediksi berjalan |
| Manual | Web | Uji teks positif, netral, negatif, kosong, dan sangat panjang |

## 10. Batasan Teknis

- Model Naive Bayes tidak menangkap urutan kata, sehingga negasi seperti "tidak bagus" bisa salah dibaca.
- Kosakata dibatasi oleh data latih; kata baru di luar data latih diabaikan.
- Sistem hanya mendukung Bahasa Indonesia. Ulasan berbahasa campuran dengan Inggris mungkin kurang akurat.
