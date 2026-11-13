# PRD: Sentimen Ulasan Produk (Naive Bayes)

**Versi:** 1.0
**Status:** Draf awal, dapat direvisi setiap minggu sesuai progres kelompok.
**Pemilik:** Ketua kelompok

## 1. Latar Belakang

Ulasan produk di marketplace seperti Tokopedia dan Shopee berjumlah sangat banyak. Membaca satu per satu tidak efisien bagi penjual maupun calon pembeli. Sistem yang bisa mengelompokkan ulasan menjadi positif, netral, atau negatif membantu memberi gambaran cepat tentang kepuasan pembeli.

Proyek ini sekaligus menjadi sarana menerapkan teori Naive Bayes, preprocessing teks, dan evaluasi model dalam satu pipeline yang utuh.

## 2. Tujuan Produk

1. Pengguna dapat memasukkan ulasan dan mendapatkan label sentimen dalam waktu kurang dari 2 detik.
2. Sistem menampilkan probabilitas untuk setiap kelas, sehingga pengguna mengetahui tingkat keyakinan model.
3. Model mencapai macro F1 yang dilaporkan secara jujur pada data uji, lengkap dengan analisis kelas yang lemah.
4. Seluruh pipeline dapat direproduksi dari dataset mentah sampai web demo.

## 3. Ruang Lingkup

**Termasuk:**
- Klasifikasi teks tiga kelas (positif, netral, negatif) untuk ulasan berbahasa Indonesia.
- Preprocessing teks dan normalisasi kata informal.
- Perbandingan minimal dua konfigurasi fitur (misal CountVectorizer vs TF-IDF, atau dengan dan tanpa stemming).
- Web demo satu halaman dengan input teks dan output label beserta probabilitas.
- Halaman ringkas berisi hasil evaluasi model.

**Tidak termasuk:**
- Scraping real-time dari Tokopedia atau Shopee.
- Akun pengguna, login, atau penyimpanan riwayat ulasan.
- Deteksi ulasan palsu atau spam.
- Analisis aspek (misal sentimen soal harga atau pengiriman terpisah).
- Deployment publik dengan skala produksi.

## 4. Pengguna

| Pengguna | Kebutuhan |
|----------|-----------|
| Dosen dan penguji | Melihat demo berjalan dan memeriksa metrik evaluasi |
| Anggota kelompok | Menjalankan pipeline dan memahami tiap tahap |
| Pengguna umum (demo) | Mengetik ulasan dan melihat hasil dengan mudah |

## 5. Kebutuhan Fungsional

| ID | Kebutuhan | Prioritas |
|----|-----------|-----------|
| F1 | Sistem memuat dataset ulasan dan label dari file CSV | Wajib |
| F2 | Sistem melakukan preprocessing: lowercase, hapus URL, angka, dan tanda baca | Wajib |
| F3 | Sistem menormalkan kata informal ke bentuk baku menggunakan kamus sederhana | Wajib |
| F4 | Sistem menghapus stopword Bahasa Indonesia | Wajib |
| F5 | Sistem mengubah teks menjadi fitur numerik dengan vectorizer | Wajib |
| F6 | Sistem melatih model Naive Bayes dan menyimpannya dalam satu pipeline | Wajib |
| F7 | Sistem menghitung accuracy, precision, recall, F1 per kelas, macro F1, dan confusion matrix | Wajib |
| F8 | Pengguna dapat memasukkan teks ulasan pada web | Wajib |
| F9 | Web menampilkan label sentimen dan probabilitas setiap kelas | Wajib |
| F10 | Web menolak input kosong dan menampilkan pesan yang jelas | Wajib |
| F11 | Web menampilkan halaman hasil evaluasi model | Dianjurkan |
| F12 | Sistem mendukung stemming dengan Sastrawi sebagai opsi eksperimen | Dianjurkan |
| F13 | Web menyediakan beberapa contoh ulasan yang bisa diklik | Opsional |

## 6. Kebutuhan Non-Fungsional

- **Kinerja:** prediksi satu ulasan di bawah 2 detik pada laptop biasa.
- **Reproduktibilitas:** `random_state` tetap, dan daftar versi paket ada di `requirements.txt`.
- **Keterbacaan:** kode diberi komentar, dan setiap tahap punya fungsi tersendiri di folder `src/`.
- **Keamanan dasar:** input teks dibatasi panjangnya (misal maksimal 1.000 karakter) dan tidak dieksekusi sebagai kode.
- **Kompatibilitas:** berjalan di Windows dan Linux, dengan browser modern.

## 7. Data

- **Sumber:** dataset publik berbahasa Indonesia atau data ulasan yang dikumpulkan kelompok secara etis.
- **Ukuran target:** minimal 2.000 ulasan, idealnya 5.000 atau lebih.
- **Label:** positif, netral, negatif. Aturan pelabelan wajib ditulis di laporan.
- **Pembagian:** 80% latih dan 20% uji, dengan `stratify` pada label.
- **Etika:** tidak menyimpan nama atau identitas pembeli. Teks yang mengandung data pribadi dihapus sebelum digunakan.

## 8. Metrik Keberhasilan

| Metrik | Target | Catatan |
|--------|--------|---------|
| Macro F1 pada data uji | Minimal 0,70 | Target awal, bisa disesuaikan setelah EDA |
| Recall kelas minoritas (netral) | Dilaporkan, tanpa target keras | Kelas netral sering paling sulit |
| Waktu respons web | Di bawah 2 detik | Diukur di laptop kelompok |
| Demo berjalan | Ya | Diuji di dua perangkat berbeda |

Accuracy dilaporkan, tetapi tidak dijadikan metrik utama karena distribusi kelas bisa tidak seimbang.

## 9. Rencana Mingguan

| Minggu | Target | Keluaran yang dikirim ke kolom komentar |
|--------|--------|------------------------------------------|
| 1 | Pilih dataset, tulis PRD dan arsitektur, EDA awal | Tautan Google Drive berisi PRD dan ringkasan EDA |
| 2 | Preprocessing dan vectorizer | Tautan Drive berisi notebook preprocessing |
| 3 | Pelatihan, evaluasi, dan eksperimen fitur | Tautan Drive berisi tabel metrik dan confusion matrix |
| 4 | Web demo dan integrasi model | Tautan Drive berisi tangkapan layar atau video demo |
| 5 | Laporan akhir, presentasi, dan demo | Tautan Drive berisi laporan dan slide |

## 10. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Dataset tidak seimbang | Kelas minoritas buruk | Gunakan ComplementNB, class weight, atau oversampling; laporkan per kelas |
| Label tidak konsisten | Model belajar pola yang salah | Tulis aturan label jelas; cek sampel acak secara manual |
| Preprocessing di web berbeda dengan training | Prediksi salah | Simpan seluruh pipeline dalam satu objek `Pipeline` |
| Scraping diblokir atau melanggar syarat layanan | Data tidak bisa diambil | Pakai dataset publik sebagai sumber utama |
| Ulasan sarkastik | Label meleset | Bahas sebagai keterbatasan di laporan |

## 11. Pertanyaan Terbuka

- Dataset final: publik atau scraping sendiri?
- Apakah netral dilabeli dari rating bintang 3, atau dilabeli manual?
- Apakah stemming dipakai di model utama atau hanya eksperimen?

Pertanyaan ini diselesaikan pada minggu 1.
