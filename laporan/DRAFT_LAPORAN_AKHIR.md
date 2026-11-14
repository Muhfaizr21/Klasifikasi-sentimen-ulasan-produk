# LAPORAN TUGAS BESAR KECERDASAN BUATAN
## SISTEM KLASIFIKASI SENTIMEN ULASAN PRODUK E-COMMERCE MENGGUNAKAN ALGORITMA NAIVE BAYES

---

**Mata Kuliah:** Kecerdasan Buatan  
**Program Studi:** D4 Rekayasa Perangkat Lunak / Teknik Informatika  
**Institusi:** Politeknik Negeri Indramayu  
**Tahun Akademik:** 2026/2027  

### Disusun Oleh:
1. **Muhammad Faiz Ramadhan** (NIM: 2305072) — Ketua, Modeling & Backend
2. [Nama Anggota 2] (NIM: ...) — Preprocessing & Data Pipeline
3. [Nama Anggota 3] (NIM: ...) — Frontend UI/UX & Web Integration
4. [Nama Anggota 4] (NIM: ...) — Evaluasi & Dokumentasi

---

## DAFTAR ISI
1. [BAB I: PENDAHULUAN](#bab-i-pendahuluan)
   - 1.1 Latar Belakang
   - 1.2 Rumusan Masalah
   - 1.3 Tujuan Proyek
   - 1.4 Ruang Lingkup & Batasan
2. [BAB II: LANDASAN TEORI](#bab-ii-landasan-teori)
   - 2.1 Natural Language Processing (NLP) Bahasa Indonesia
   - 2.2 Text Preprocessing (Case Folding, Slang Normalization, Stopwords)
   - 2.3 Feature Extraction (CountVectorizer & TF-IDF Vectorizer)
   - 2.4 Algoritma Naive Bayes (MultinomialNB & ComplementNB)
   - 2.5 Metrik Evaluasi (Accuracy, Precision, Recall, Macro F1-Score)
3. [BAB III: METODOLOGI & ARSITEKTUR SISTEM](#bab-iii-metodologi--arsitektur-sistem)
   - 3.1 Alur Sistem (*Pipeline Architecture*)
   - 3.2 Dataset Ulasan Publik (PRDECT-ID Tokopedia & Hugging Face)
   - 3.3 Penanganan Ketidakseimbangan Kelas (Class Imbalance)
   - 3.4 Desain REST API & Antarmuka Pengguna
4. [BAB IV: HASIL EKSPERIMEN & PEMBAHASAN](#bab-iv-hasil-eksperimen--pembahasan)
   - 4.1 Perbandingan 5 Konfigurasi Eksperimen
   - 4.2 Analisis Confusion Matrix & Kelas Netral
   - 4.3 Analisis Efek Slang Normalization & Negasi
5. [BAB V: KESIMPULAN & SARAN](#bab-v-kesimpulan--saran)
   - 5.1 Kesimpulan
   - 5.2 Saran Pengembangan
6. [DAFTAR PUSTAKA](#daftar-pustaka)

---

## BAB I: PENDAHULUAN

### 1.1 Latar Belakang
Ulasan produk di platform e-commerce seperti Tokopedia dan Shopee merupakan salah satu sumber informasi paling berharga bagi calon pembeli maupun penjual. Namun, ribuan ulasan teks yang masuk setiap hari mustahil dianalisis satu per satu secara manual. Diperlukan otomasi berbasis kecerdasan buatan (*Artificial Intelligence*) menggunakan teknik *Natural Language Processing* (NLP) untuk mengklasifikasikan sentimen secara akurat dan cepat.

### 1.2 Rumusan Masalah
1. Bagaimana merancang pipeline NLP yang efektif menangani karakteristik teks ulasan Indonesia (banyak singkatan, kata gaul/*slang*, dan kalimat tidak baku)?
2. Bagaimana pengaruh ekstraksi fitur *CountVectorizer* dibandingkan *TF-IDF* terhadap performa Naive Bayes?
3. Bagaimana strategi menangani ulasan kelas *netral* yang sering beririsan dengan ulasan positif/negatif?

### 1.3 Tujuan Proyek
1. Membangun model Naive Bayes yang mencapai target *Macro F1-Score* $\ge 0.70$ pada data uji ulasan e-commerce.
2. Membangun aplikasi web interaktif yang mampu memberikan hasil inferensi sentimen beserta bar probabilitas keyakinan dalam waktu $< 2$ detik.
3. Menyediakan dashboard evaluasi transparan yang menampilkan metrik komparasi eksperimen dan Confusion Matrix.

---

## BAB II: LANDASAN TEORI

### 2.1 Teorema Bayes
Teorema Bayes dirumuskan sebagai:
$$P(C | X) = \frac{P(X | C) \cdot P(C)}{P(X)}$$
Di mana $P(C|X)$ adalah probabilitas posterior kelas $C$ setelah mengamati dokumen $X$, $P(X|C)$ adalah *likelihood*, $P(C)$ adalah *prior probability*, dan $P(X)$ adalah konstanta penormal.

### 2.2 Multinomial Naive Bayes vs Complement Naive Bayes
- **MultinomialNB:** Cocok untuk data diskrit (frekuensi kemunculan kata / TF-IDF). Mengasumsikan setiap fitur dibangkitkan dari distribusi multinomial.
- **ComplementNB:** Didesain khusus untuk menangani *imbalanced dataset*. Bekerja dengan menghitung statistik komplementer (selain kelas target) sehingga tidak bias ke kelas mayoritas.

---

## BAB IV: HASIL EKSPERIMEN & PEMBAHASAN

### 4.1 Tabel Komparasi 5 Eksperimen (5.459 Ulasan, Test Set = 1.092 Ulasan)

| No | Konfigurasi Model | Vectorizer | Classifier | Stopword Removal | Akurasi | Macro F1 | Weighted F1 |
|:--:|:------------------|:----------:|:----------:|:----------------:|:-------:|:--------:|:-----------:|
| 1 | **CountVectorizer + MultinomialNB** | CountVectorizer | MultinomialNB | Ya (Sastrawi) | **85.90%** | **77.28%** | **85.92%** |
| 2 | **TF-IDF + ComplementNB** | TfidfVectorizer | ComplementNB | Ya (Sastrawi) | 86.08% | 74.15% | 84.72% |
| 3 | **CountVectorizer + ComplementNB** | CountVectorizer | ComplementNB | Ya (Sastrawi) | 85.26% | 71.24% | 83.15% |
| 4 | **TF-IDF + MultinomialNB (Tanpa Stopwords)** | TfidfVectorizer | MultinomialNB | Tidak | 85.81% | 70.49% | 83.39% |
| 5 | **TF-IDF + MultinomialNB** | TfidfVectorizer | MultinomialNB | Ya (Sastrawi) | 86.17% | 70.46% | 83.64% |

---

## BAB V: KESIMPULAN
1. Pipeline NLP berhasil mencapai **Macro F1-Score 77.28%** dan **Akurasi 85.90%**, melampaui target PRD $\ge 70.0%$.
2. Preservasi kata negasi terbukti krusial untuk mencegah misklasifikasi pada ulasan bernada negatif seperti *"tidak bagus"*.
3. Aplikasi web berbasis React dan Flask mampu mengeksekusi inferensi dalam rata-rata **15–30 ms**, jauh di bawah batas non-fungsional 2 detik.
