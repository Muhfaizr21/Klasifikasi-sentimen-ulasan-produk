import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export interface HelpTopicContent {
  id: string
  category: string
  title: string
  simpleMeaning: string
  formulaOrMechanism: string
  howToRead: string
  presentationTip: string
}

const HELP_TOPICS: Record<string, HelpTopicContent> = {
  /* ========================================================================
     1. HALAMAN TARGET KPI & NET SENTIMENT SCORE (target-kpi)
     ======================================================================== */
  f1_macro: {
    id: 'f1_macro',
    category: 'Target KPI & Evaluasi Model',
    title: 'Target Macro F1-Score (>= 70%)',
    simpleMeaning:
      'Macro F1-Score adalah nilai rapor keadilan model AI dalam menebak ketiga kelas sentimen (Positif, Netral, dan Negatif) secara setara tanpa pilih kasih, meskipun jumlah datanya tidak seimbang.',
    formulaOrMechanism:
      'Dihitung dengan mencari F1-Score (rata-rata harmonik Precision dan Recall) pada masing-masing kelas terlebih dahulu, lalu ketiganya dijumlahkan dan dibagi 3 rata: (F1_Positif + F1_Netral + F1_Negatif) / 3.',
    howToRead:
      'Angka saat ini (76.64%) berada di atas target minimum PRD (70%). Artinya, model tidak hanya pintar menebak kelas mayoritas (Positif/Negatif), tetapi juga mampu mengenali ulasan kelas minoritas (Netral) dengan baik.',
    presentationTip:
      '"Kami menggunakan Macro F1-Score sebagai indikator utama karena dataset e-commerce bersifat imbalanced (kelas Netral hanya 11,2%). Jika hanya melihat Akurasi biasa, kelas kecil akan tertutup. Dengan Macro F1 76,64%, model terbukti adil di semua kelas."',
  },
  kpi_macro_f1: {
    id: 'kpi_macro_f1',
    category: 'Target KPI & Evaluasi Model',
    title: 'Target Macro F1-Score (>= 70%)',
    simpleMeaning:
      'Macro F1-Score adalah nilai rapor keadilan model AI dalam menebak ketiga kelas sentimen (Positif, Netral, dan Negatif) secara setara tanpa pilih kasih, meskipun jumlah datanya tidak seimbang.',
    formulaOrMechanism:
      'Dihitung dengan mencari F1-Score (rata-rata harmonik Precision dan Recall) pada masing-masing kelas terlebih dahulu, lalu ketiganya dijumlahkan dan dibagi 3 rata: (F1_Positif + F1_Netral + F1_Negatif) / 3.',
    howToRead:
      'Angka saat ini (76.64%) berada di atas target minimum PRD (70%). Artinya, model tidak hanya pintar menebak kelas mayoritas (Positif/Negatif), tetapi juga mampu mengenali ulasan kelas minoritas (Netral) dengan baik.',
    presentationTip:
      '"Kami menggunakan Macro F1-Score sebagai indikator utama karena dataset e-commerce bersifat imbalanced (kelas Netral hanya 11,2%). Dengan Macro F1 76,64%, model terbukti adil di semua kelas."',
  },
  macro_f1_score: {
    id: 'macro_f1_score',
    category: 'Katalog Metrik Semantik',
    title: 'Macro-Averaged F1-Score (3 Kelas)',
    simpleMeaning:
      'Standar pengukuran akurasi seimbang yang merata-ratakan performa model pada kelas Positif, Netral, dan Negatif.',
    formulaOrMechanism: 'Rumus: (F1_positif + F1_netral + F1_negatif) / 3.',
    howToRead:
      'Nilai 76.64% diperoleh dari rata-rata F1-Score Positif (92.57%), Negatif (87.16%), dan Netral (50.20%) pada 1.092 data uji.',
    presentationTip:
      '"Metrik ini memberikan bobot 1/3 yang sama rata untuk setiap kelas sehingga performa pada kelas minoritas tetap terukur secara jujur."',
  },
  test_accuracy: {
    id: 'test_accuracy',
    category: 'Target KPI & Evaluasi Model',
    title: 'Target Akurasi Uji Stratified (>= 80%)',
    simpleMeaning:
      'Persentase total tebakan model yang benar ketika diuji menggunakan 1.092 ulasan yang belum pernah dilihat model saat pelatihan.',
    formulaOrMechanism:
      'Rumus: (Jumlah Prediksi Benar / Total 1.092 Data Uji) x 100. Kata "Stratified" berarti pembagian 80% data latih dan 20% data uji dilakukan dengan menjaga proporsi persentase Positif, Netral, dan Negatif tetap sama persis.',
    howToRead:
      'Capaian 85.35% (+5.35% di atas target 80%) berarti dari setiap 100 ulasan pembeli baru yang masuk, sekitar 85 hingga 86 ulasan berhasil ditebak sentimennya dengan tepat.',
    presentationTip:
      '"Pengujian dilakukan dengan teknik Stratified Split 80:20 pada 5.459 ulasan. Dari 1.092 data uji terpisah, model mencapai akurasi 85,35%, melampaui batas standar kelayakan sistem sebesar 80%."',
  },
  kpi_accuracy_stratified: {
    id: 'kpi_accuracy_stratified',
    category: 'Target KPI & Evaluasi Model',
    title: 'Target Akurasi Uji Stratified (>= 80%)',
    simpleMeaning:
      'Persentase total tebakan model yang benar ketika diuji menggunakan 1.092 ulasan yang belum pernah dilihat model saat pelatihan.',
    formulaOrMechanism:
      'Rumus: (Jumlah Prediksi Benar / Total 1.092 Data Uji) x 100 pada pembagian Stratified 80:20.',
    howToRead:
      'Capaian 85.35% berarti 932 dari 1.092 ulasan data uji berhasil ditebak dengan tepat oleh model.',
    presentationTip:
      '"Akurasi 85,35% menunjukkan proporsi prediksi benar secara keseluruhan pada data uji yang terpisah dari data latih."',
  },
  complaint_ratio: {
    id: 'complaint_ratio',
    category: 'Target KPI & Risiko Reputasi',
    title: 'Batas Rasio Keluhan Kritis Emosi Anger (<= 15%)',
    simpleMeaning:
      'Persentase ulasan pelanggan yang mengandung emosi kemarahan ekstrem (Anger) seperti kekecewaan karena barang palsu, rusak parah, atau kurir bermasalah.',
    formulaOrMechanism:
      'Rumus: (Jumlah Ulasan Berlabel Emosi Anger / Total 5.459 Ulasan Korpus PRDECT-ID) x 100. Berbeda dengan metrik lain yang semakin tinggi semakin bagus, metrik ini adalah batas ambang risiko (semakin rendah semakin aman).',
    howToRead:
      'Angka 12.3% berada di bawah batas bahaya maksimal 15% (tersisa margin aman 2.7%). Jika angka ini melewati 15%, berarti terjadi lonjakan komplain keras yang harus segera ditindaklanjuti.',
    presentationTip:
      '"Indikator ini memantau risiko komplain ekstrem berbasis atribut emosi Anger dari dataset PRDECT-ID. Selama rasionya di bawah 15% (saat ini 12,3%), tingkat komplain fatal di korpus masih dalam batas terkendali."',
  },
  critical_emotion_rate: {
    id: 'critical_emotion_rate',
    category: 'Katalog Metrik Semantik',
    title: 'Rasio Keluhan Emosi Kritis (Anger)',
    simpleMeaning:
      'Proporsi ulasan di dalam korpus yang mengekspresikan kemarahan tingkat tinggi (Anger) dibandingkan total keseluruhan ulasan.',
    formulaOrMechanism: "Rumus: (COUNT(emotion = 'Anger') / COUNT(total)) * 100.",
    howToRead:
      'Nilai 12.3% menunjukkan bahwa dari seluruh korpus, 12.3% ulasan tergolong komplain emosional keras yang memerlukan prioritas penanganan.',
    presentationTip:
      '"Metrik ini memisahkan keluhan biasa (Sadness/Fear) dari keluhan kritis (Anger) agar tim kualitas produk tahu mana yang harus ditangani lebih dulu."',
  },
  satisfaction_index: {
    id: 'satisfaction_index',
    category: 'Target KPI & Kesehatan Korpus',
    title: 'Target Indeks Kepuasan Korpus (>= 55%)',
    simpleMeaning:
      'Persentase gabungan ulasan pelanggan yang tidak bermasalah (yaitu ulasan Positif ditambah ulasan Netral) dari keseluruhan korpus e-commerce.',
    formulaOrMechanism:
      'Rumus: ((Jumlah Ulasan Positif + Jumlah Ulasan Netral) / Total 5.459 Ulasan Korpus) x 100.',
    howToRead:
      'Angka 57.3% menunjukkan bahwa mayoritas transaksi di dalam dataset (lebih dari separuh korpus) memberikan pengalaman belanja yang memuaskan atau setidaknya sesuai standar tanpa keluhan.',
    presentationTip:
      '"Indeks Kepuasan Korpus menggabungkan segmen Positif (46,1%) dan Netral (11,2%) menjadi 57,3%, menandakan mayoritas ulasan di korpus tidak mengandung komplain negatif."',
  },
  net_sentiment_score: {
    id: 'net_sentiment_score',
    category: 'Target KPI & Metrik Bisnis',
    title: 'Net Sentiment Score / NSS Korpus (>= +0.0 pt)',
    simpleMeaning:
      'Skor bersih reputasi produk yang didapat dari mengurangi persentase ulasan Positif dengan persentase ulasan Negatif (konsepnya mirip Net Promoter Score / NPS di dunia bisnis).',
    formulaOrMechanism:
      'Rumus: ((Jumlah Ulasan Positif - Jumlah Ulasan Negatif) / Total Ulasan) x 100. Rentang nilainya mulai dari -100 pt (semua ulasan negatif) hingga +100 pt (semua ulasan positif).',
    howToRead:
      'Skor +3.4 pt bernilai positif (di atas 0.0 pt). Ini berarti secara agregat jumlah ulasan positif (2.517) masih lebih banyak dibandingkan ulasan negatif (2.329) pada dataset riset ini.',
    presentationTip:
      '"Net Sentiment Score (NSS) merangkum kesehatan reputasi ke dalam satu angka tunggal dari -100 hingga +100. Nilai +3,4 poin menunjukkan saldo sentimen bersih korpus berada di zona positif."',
  },
  posterior_confidence: {
    id: 'posterior_confidence',
    category: 'Katalog Metrik Semantik & XAI',
    title: 'Probabilitas Posterior Naive Bayes',
    simpleMeaning:
      'Derajat keyakinan matematis model AI (dalam rentang 0 sampai 1 atau 0% sampai 100%) saat memutuskan apakah suatu ulasan tergolong Positif, Netral, atau Negatif.',
    formulaOrMechanism:
      'Rumus Teorema Bayes: P(C_k | X) = exp(log P(C_k) + sum(x_i * log P(w_i | C_k))) / Z, di mana P(C_k) adalah probabilitas awal kelas dan P(w_i | C_k) adalah peluang kemunculan kata pada kelas tersebut.',
    howToRead:
      'Nilai mendekati 1.0 (100%) berarti kata-kata di dalam kalimat sangat kuat mengarah ke satu kelas sentimen tertentu.',
    presentationTip:
      '"Probabilitas posterior dihitung dari penjumlahan log-likelihood setiap token unigram dan bigram di dalam kalimat uji."',
  },
  kpi_top_5_nss: {
    id: 'kpi_top_5_nss',
    category: 'Target KPI & Peringkat Sektor',
    title: 'Top 5 Kategori dengan Net Sentiment Score (NSS) Tertinggi',
    simpleMeaning:
      'Daftar 5 kategori produk di Tokopedia yang memiliki tingkat kepuasan bersih paling tinggi dan paling minim komplain.',
    formulaOrMechanism:
      'Mengurutkan seluruh 30 kategori berdasarkan skor NSS ((Positif - Negatif) / Total) dari nilai positif tertinggi ke terendah.',
    howToRead:
      'Klik salah satu baris kategori di kotak ini untuk langsung melompat ke halaman Bedah Data dan melihat contoh ulasan asli dari kategori tersebut.',
    presentationTip:
      '"Panel kiri menampilkan 5 kategori berkinerja terbaik dengan rasio kepuasan tertinggi sebagai benchmark kualitas layanan di marketplace."',
  },
  kpi_bottom_5_nss: {
    id: 'kpi_bottom_5_nss',
    category: 'Target KPI & Mitigasi Keluhan',
    title: '5 Kategori Prioritas Perbaikan (Rasio Keluhan Tertinggi)',
    simpleMeaning:
      'Daftar 5 kategori produk yang paling banyak menerima ulasan negatif dari pembeli sehingga skor NSS-nya bernilai minus.',
    formulaOrMechanism:
      'Mengurutkan seluruh 30 kategori berdasarkan skor NSS paling rendah (negatif terbesar) dan persentase ulasan negatif tertinggi.',
    howToRead:
      'Skor berwarna merah minus (misal -19.7 pt) berarti persentase ulasan negatif di kategori tersebut lebih banyak 19.7% dibanding ulasan positifnya. Klik baris kategori untuk mengaudit isi komplainnya.',
    presentationTip:
      '"Panel kanan secara otomatis memberi peringatan dini kepada manajemen mengenai 5 kategori produk yang paling membutuhkan audit kualitas barang dan pengemasan."',
  },

  /* ========================================================================
     2. HALAMAN EVALUASI MODEL AKADEMIK (evaluasi)
     ======================================================================== */
  eval_pipeline_winner: {
    id: 'eval_pipeline_winner',
    category: 'Evaluasi Model & Arsitektur NLP',
    title: 'Arsitektur Pipeline Terbaik (CountVectorizer + MultinomialNB)',
    simpleMeaning:
      'Kombinasi metode pengubah teks menjadi angka (Vectorizer) dan algoritma kecerdasan buatan (Classifier) yang menghasilkan skor Macro F1 tertinggi dari 5 eksperimen.',
    formulaOrMechanism:
      'Menggunakan CountVectorizer dengan N-Gram (1, 2) (membaca 1 kata tunggal dan pasangan 2 kata berurutan seperti "tidak bagus") + Stopword Sastrawi + algoritma probabilitas Multinomial Naive Bayes.',
    howToRead:
      'Dari 5 skenario pengujian di src/train.py, kombinasi ini dipilih otomatis sebagai model produksi karena memiliki keseimbangan terbaik dalam mengenali kelas Positif, Netral, dan Negatif.',
    presentationTip:
      '"Kami menggunakan N-Gram (1,2) agar pasangan kata negasi seperti \'tidak bagus\' atau \'kurang rapi\' terbaca sebagai satu kesatuan makna, lalu diklasifikasikan dengan Multinomial Naive Bayes."',
  },
  eval_corpus_split: {
    id: 'eval_corpus_split',
    category: 'Evaluasi Model & Metodologi Data',
    title: 'Korpus Ulasan Publik & Pembagian Data (80:20)',
    simpleMeaning:
      'Total data ulasan nyata yang digunakan dalam penelitian ini beserta pembagian porsi untuk melatih AI (80%) dan menguji AI (20%).',
    formulaOrMechanism:
      'Total 5.459 ulasan (gabungan PRDECT-ID Tokopedia & Hugging Face) dibagi menggunakan fungsi train_test_split(..., test_size=0.20, stratify=y, random_state=42): 4.367 data latih dan 1.092 data uji.',
    howToRead:
      'Model hanya boleh belajar dari 4.367 ulasan latih, dan sama sekali tidak boleh mengintip 1.092 ulasan uji agar hasil nilai akurasi dan F1-Score benar-benar jujur dan objektif.',
    presentationTip:
      '"Dataset berjumlah 5.459 ulasan dibagi dengan rasio 80:20 secara stratified dan random_state=42 agar eksperimen bersifat reproducible (dapat diulang dengan hasil konsisten)."',
  },
  eval_class_distribution: {
    id: 'eval_class_distribution',
    category: 'Evaluasi Model & Karakteristik Dataset',
    title: 'Distribusi Korpus Ulasan per Kelas Sentimen',
    simpleMeaning:
      'Perbandingan jumlah dan persentase ulasan Positif, Netral, dan Negatif di dalam seluruh dataset.',
    formulaOrMechanism:
      'Konversi dari rating bintang pembeli: Bintang 4 & 5 menjadi Positif (2.517 ulasan / 46.1%), Bintang 3 menjadi Netral (613 ulasan / 11.2%), dan Bintang 1 & 2 menjadi Negatif (2.329 ulasan / 42.7%).',
    howToRead:
      'Terlihat bahwa pembeli e-commerce cenderung memberikan rating ekstrem (sangat puas atau kecewa), sehingga kelas Netral (bintang 3) jumlahnya paling sedikit (11.2%). Fenomena ini disebut Imbalanced Dataset.',
    presentationTip:
      '"Grafik ini membuktikan karakteristik alami ulasan e-commerce di mana ulasan bintang 3 (Netral) merupakan kelas minoritas sebesar 11,2%, sehingga dibutuhkan metrik evaluasi Macro F1."',
  },
  eval_per_class_table: {
    id: 'eval_per_class_table',
    category: 'Evaluasi Model & Rincian Kelas',
    title: 'Metrik Pengujian per Kelas (Precision, Recall, F1-Score, Support)',
    simpleMeaning:
      'Rincian ketepatan model AI ketika menebak masing-masing kelas (Positif, Netral, dan Negatif) pada 1.092 data uji.',
    formulaOrMechanism:
      '1) Precision: Dari semua yang ditebak sebagai kelas X, berapa persen yang benar-benar X. 2) Recall: Dari semua data asli kelas X, berapa persen yang berhasil ditemukan model. 3) F1-Score: Rata-rata harmonik Precision & Recall. 4) Support: Jumlah sampel data uji asli pada kelas tersebut.',
    howToRead:
      'Kelas Positif mencapai F1-Score 92.57% dan kelas Negatif mencapai 87.16% karena jumlah sampel latihnya melimpah. Kelas Netral memiliki F1-Score 50.20% karena merupakan kelas minoritas dengan kosakata campuran.',
    presentationTip:
      '"Precision mengukur tingkat ketepatan tebakan model, sedangkan Recall mengukur kelengkapan model dalam menemukan kelas tersebut. Keduanya dirangkum menjadi F1-Score."',
  },
  eval_confusion_matrix: {
    id: 'eval_confusion_matrix',
    category: 'Evaluasi Model & Analisis Kesalahan',
    title: 'Confusion Matrix 3x3 (Data Uji Stratified 20%)',
    simpleMeaning:
      'Tabel silang untuk melihat berapa banyak ulasan yang ditebak BENAR oleh model (kotak berwarna di garis miring/diagonal) dan berapa yang SALAH tebak ke kelas lain.',
    formulaOrMechanism:
      'Baris mendatar (Aktual) adalah label asli dari dataset, sedangkan kolom menurun (Prediksi) adalah tebakan model AI. Jumlah seluruh angka di dalam 9 kotak ini adalah 1.092 (total data uji).',
    howToRead:
      'Perhatikan 3 kotak diagonal utama (kiri-atas ke kanan-bawah): 455 ulasan Positif ditebak benar sebagai Positif, 63 Netral ditebak benar Netral, dan 414 Negatif ditebak benar Negatif. Kotak di luar diagonal adalah jumlah tebakan yang meleset.',
    presentationTip:
      '"Cara membaca Confusion Matrix sangat mudah: angka pada diagonal utama (455, 63, dan 414) adalah jumlah prediksi yang tepat, sedangkan angka di luar diagonal menunjukkan letak kekeliruan antar kelas."',
  },
  eval_word_importance: {
    id: 'eval_word_importance',
    category: 'Explainable AI & Bobot Leksikal',
    title: 'Explorer Fitur Leksikal & Bobot Kata Naive Bayes',
    simpleMeaning:
      'Daftar kata kunci atau pasangan kata (n-gram) di dalam kamus AI yang paling kuat mendorong suatu kalimat menjadi Positif, Netral, atau Negatif.',
    formulaOrMechanism:
      'Dihitung dari selisih Log-Probability (log P(w|c)) antar kelas pada model Multinomial Naive Bayes. Semakin besar nilai positifnya, semakin kuat kata tersebut menjadi ciri khas kelas terkait.',
    howToRead:
      'Klik salah satu chip kata untuk melihat nilai bobot matematisnya, atau klik "Uji Kalimat dengan Kata Ini" untuk langsung membuktikan pengaruh kata tersebut di halaman prediksi.',
    presentationTip:
      '"Fitur ini membuktikan bahwa model kami bukan kotak hitam (black-box), melainkan Explainable AI di mana setiap bobot log-likelihood kata dapat diaudit secara transparan."',
  },
  eval_5_experiments: {
    id: 'eval_5_experiments',
    category: 'Eksperimen Komparasi Pipeline',
    title: 'Perbandingan 5 Konfigurasi Eksperimen Pipeline NLP',
    simpleMeaning:
      'Bukti ilmiah bahwa sebelum memilih model terbaik, sistem telah menguji dan membandingkan 5 kombinasi metode secara objektif.',
    formulaOrMechanism:
      'Membandingkan: 1) CountVectorizer vs TF-IDF Vectorizer, 2) Algoritma MultinomialNB vs ComplementNB, serta 3) Penggunaan Stopword Sastrawi vs Tanpa Stopword Removal pada data uji yang sama persis.',
    howToRead:
      'Baris yang diberi tanda "Model Aktif" adalah pemenang eksperimen dengan nilai Macro F1 tertinggi (76.64%), yaitu CountVectorizer + MultinomialNB dengan Stopword Sastrawi.',
    presentationTip:
      '"Sesuai metodologi ilmiah, kami melakukan 5 eksperimen terpisah. Hasilnya membuktikan bahwa penghapusan stopword Sastrawi dengan preservasi kata negasi meningkatkan Macro F1 secara signifikan."',
  },

  /* ========================================================================
     3. HALAMAN ANALISIS ULASAN TUNGGAL & XAI (prediksi)
     ======================================================================== */
  pred_input_composer: {
    id: 'pred_input_composer',
    category: 'Mesin Inferensi Real-Time',
    title: 'Pipeline Analisis Sentimen Ulasan Tunggal',
    simpleMeaning:
      'Kotak pengujian utama untuk mengetik kalimat ulasan produk bahasa Indonesia dan melihat bagaimana AI menganalisis sentimennya secara langsung.',
    formulaOrMechanism:
      'Saat ulasan dikirim, teks melewati 3 tahap: 1) Normalisasi kata slang/singkatan & penghapusan stopword PySastrawi, 2) Deteksi aturan pragmatik (negasi, kontras, atau frasa "saya kira..."), dan 3) Perhitungan probabilitas Multinomial Naive Bayes.',
    howToRead:
      'Ketik kalimat ulasan apa saja (atau tekan tombol + untuk memuat sampel acak), lalu tekan tombol panah kirim atau Ctrl+Enter.',
    presentationTip:
      '"Pada halaman ini, penguji dapat mengetik kalimat ulasan secara bebas, termasuk bahasa gaul e-commerce atau kalimat jebakan bersayap, dan sistem akan mengklasifikasikannya dalam waktu kurang dari 30 milidetik."',
  },
  pred_dynamic_samples: {
    id: 'pred_dynamic_samples',
    category: 'Pengujian Sampel Korpus',
    title: 'Sampel Dinamis dari Korpus PRDECT-ID (5.459 Ulasan)',
    simpleMeaning:
      'Pintasan untuk mengambil contoh ulasan asli dari database server sesuai kategori yang dipilih di bagian atas, lalu langsung mengujinya dengan sekali klik.',
    formulaOrMechanism:
      'Memanggil endpoint GET /api/samples yang menarik baris ulasan secara acak dari file data/raw/reviews.csv dan mencocokkannya dengan katalog produk Tokopedia.',
    howToRead:
      'Klik tombol "Acak Baru" untuk mengganti daftar contoh ulasan, atau klik salah satu tombol ulasan untuk langsung menjalankan prediksi AI.',
    presentationTip:
      '"Seluruh sampel di kotak ini ditarik secara dinamis dari 5.459 data korpus di server, bukan teks statis yang di-hardcode di tampilan."',
  },
  pred_live_scraper: {
    id: 'pred_live_scraper',
    category: 'Akuisisi Data Marketplace',
    title: 'Tarik Langsung E-Commerce Indonesia (Live Stream)',
    simpleMeaning:
      'Fitur untuk mencari nama produk atau menempelkan link produk dari Tokopedia, Shopee, Lazada, Blibli, dll., lalu menarik daftar ulasannya beserta foto produk dan ringkasan reputasinya.',
    formulaOrMechanism:
      'Memanggil endpoint POST /api/realtime/fetch yang mengekstrak slug/kata kunci produk, mengambil gambar katalog produk, dan menyusun kartu ringkasan eksekutif (Reputation Score, Pros, & Cons).',
    howToRead:
      'Pilih platform marketplace, ketik nama barang atau tempel URL produk, lalu klik "Tarik Live". Klik ulasan yang muncul di bawahnya untuk membedah kalimat tersebut.',
    presentationTip:
      '"Fitur ini mendemonstrasikan bagaimana model NLP kami diterapkan pada skenario nyata untuk memantau ulasan produk dari berbagai marketplace Indonesia beserta visual katalognya."',
  },
  pred_reasoning_steps: {
    id: 'pred_reasoning_steps',
    category: 'Explainable AI (Jejak Penalaran)',
    title: '3 Tahap Penalaran NLP (Step-by-Step Reasoning)',
    simpleMeaning:
      'Rincian langkah demi langkah bagaimana AI memproses kalimat kotor dari pembeli hingga menghasilkan kesimpulan sentimen akhir.',
    formulaOrMechanism:
      'Tahap 1: Pembersihan tanda baca, normalisasi kamus slang, & stopword Sastrawi. Tahap 2: Evaluasi klausa kontras ("tapi/namun"), negasi ("tidak/kurang"), dan pembalikan ekspektasi ("saya kira..."). Tahap 3: Kalkulasi probabilitas posterior.',
    howToRead:
      'Klik "Lihat Proses" untuk membuka rincian ketiga tahapan beserta jumlah token aktif yang ditemukan di dalam kalimat.',
    presentationTip:
      '"Panel ini memperlihatkan transparansi proses preprocessing hingga inferensi, sehingga kita tahu persis kata apa yang dinormalisasi dan bagaimana konteks kalimat dievaluasi."',
  },
  pred_verdict_confidence: {
    id: 'pred_verdict_confidence',
    category: 'Inferensi Probabilitas',
    title: 'Kesimpulan Analisis & Tingkat Keyakinan (Confidence)',
    simpleMeaning:
      'Hasil keputusan akhir sentimen (Positif, Netral, atau Negatif) beserta persentase seberapa yakin model terhadap keputusannya tersebut.',
    formulaOrMechanism:
      'Diambil dari nilai probabilitas posterior kelas tertinggi P(c|X) pada teorema Bayes yang telah dikalibrasi dengan detektor konteks pragmatik.',
    howToRead:
      'Semakin mendekati 100%, semakin kuat bukti kata kunci di dalam kalimat yang mendukung kelas sentimen tersebut.',
    presentationTip:
      '"Selain memberikan label kelas, model mengeluarkan derajat keyakinan (confidence score) dalam bentuk persentase probabilitas posterior dari ketiganya."',
  },
  pred_online_learning: {
    id: 'pred_online_learning',
    category: 'Incremental / Online Learning',
    title: 'Koreksi & Latih Model Real-Time (partial_fit)',
    simpleMeaning:
      'Fitur untuk mengoreksi AI secara langsung jika ada tebakan yang kurang tepat, sehingga AI langsung pintar saat itu juga tanpa perlu menunggu training ulang seluruh data dari awal.',
    formulaOrMechanism:
      'Menggunakan metode algoritma MultinomialNB.partial_fit(X_vec, [target_label]) di endpoint POST /api/learn dengan bobot penguatan (sample_weight), lalu memperbarui file model_sentimen.pkl secara instan.',
    howToRead:
      'Jika Anda ingin mengajari model bahwa kalimat ini seharusnya Positif/Netral/Negatif, cukup klik tombol kelas yang diinginkan. Coba analisis ulang kalimatnya, maka keputusannya akan langsung berubah.',
    presentationTip:
      '"Ini adalah keunggulan arsitektur kami: fitur Online Learning berbasis partial_fit memungkinkan koreksi human-in-the-loop secara instan tanpa perlu melatih ulang 5.459 data dari nol."',
  },
  pred_math_evidence: {
    id: 'pred_math_evidence',
    category: 'Bukti Matematis Naive Bayes',
    title: 'Bukti Matematis, Hasil Preprocessing, & Skor Log-Likelihood',
    simpleMeaning:
      'Perbandingan teks asli vs teks bersih setelah disaring Sastrawi, lengkap dengan skor angka pada setiap kata kunci dan grafik batang probabilitas 3 kelas.',
    formulaOrMechanism:
      'Setiap token yang masuk ke dalam kamus model diberi skor kontribusi berdasarkan selisih log-likelihood log P(w|Positif) - log P(w|Negatif).',
    howToRead:
      'Chip kata berwarna hijau (skor +) mendorong kalimat menjadi Positif, sedangkan chip merah (skor -) mendorong kalimat menjadi Negatif.',
    presentationTip:
      '"Di bagian ini terlihat bukti nyata kerja PySastrawi dan kamus slang: kata tidak baku diubah menjadi kata baku, lalu setiap kata dihitung bobot log-likelihood-nya."',
  },
  history_drawer_box: {
    id: 'history_drawer_box',
    category: 'Manajemen Sesi Pengujian',
    title: 'Riwayat Analisis Ulasan Lokal',
    simpleMeaning:
      'Daftar catatan kalimat ulasan yang baru saja Anda uji selama sesi ini sehingga bisa dibuka kembali kapan saja.',
    formulaOrMechanism:
      'Disimpan secara persisten pada LocalStorage browser lengkap dengan hasil probabilitas dan jejak analisisnya.',
    howToRead:
      'Klik salah satu baris riwayat untuk menampilkan kembali hasil analisis kalimat tersebut di bagian atas halaman.',
    presentationTip:
      '"Setiap pengujian ulasan tersimpan otomatis di riwayat sesi agar kita dapat membandingkan hasil pengujian kalimat sebelumnya dengan mudah."',
  },

  /* ========================================================================
     4. HALAMAN BATCH CSV (batch)
     ======================================================================== */
  batch_upload_guide: {
    id: 'batch_upload_guide',
    category: 'Pemrosesan Massal (Batch Processing)',
    title: 'Analisis Batch Ulasan Produk via File CSV',
    simpleMeaning:
      'Fitur untuk mengunggah file tabel CSV yang berisi ratusan ulasan sekaligus agar dianalisis otomatis dalam satu kali klik, lalu hasilnya bisa diunduh kembali menjadi file CSV baru.',
    formulaOrMechanism:
      'Memanggil POST /api/predict/batch. Server membaca kolom teks secara otomatis (ulasan/review/text), melakukan vektorisasi matriks sekaligus, dan mengembalikan rekapitulasi distribusi beserta label tiap baris.',
    howToRead:
      'Jika belum punya file CSV, klik tombol "Unduh Contoh CSV" di kanan atas, lalu unggah kembali file tersebut untuk mendemonstrasikan analisis massal di depan penguji.',
    presentationTip:
      '"Untuk kebutuhan industri yang memiliki ribuan ulasan harian, modul Batch CSV ini memungkinkan klasifikasi ratusan baris sekaligus dan mengekspor laporannya kembali ke format CSV."',
  },
  batch_kpi_summary: {
    id: 'batch_kpi_summary',
    category: 'Rekapitulasi Batch CSV',
    title: 'Ringkasan Distribusi Hasil Batch CSV',
    simpleMeaning:
      'Rekapitulasi cepat berapa total baris di dalam file CSV Anda yang terklasifikasi sebagai Positif, Netral, dan Negatif.',
    formulaOrMechanism:
      'Menjumlahkan hasil prediksi per kelas dari seluruh baris valid di dalam berkas CSV yang diunggah.',
    howToRead:
      'Menampilkan jumlah baris sekaligus persentase proporsinya terhadap total ulasan di dalam file CSV.',
    presentationTip:
      '"Begitu file CSV selesai diproses, sistem langsung menyajikan agregasi eksekutif jumlah dan persentase ketiga kelas sentimen."',
  },
  batch_table_results: {
    id: 'batch_table_results',
    category: 'Audit Baris & Ekspor Laporan',
    title: 'Tabel Hasil Prediksi Batch & Ekspor CSV',
    simpleMeaning:
      'Tabel rincian hasil tebakan sentimen dan persentase keyakinan AI untuk setiap baris kalimat di dalam file CSV yang Anda unggah.',
    formulaOrMechanism:
      'Menampilkan teks asli, badge sentimen hasil prediksi, dan skor confidence (%). Tombol Ekspor menghasilkan file CSV baru yang berisi kolom tambahan hasil analisis.',
    howToRead:
      'Klik tombol "Ekspor Laporan Hasil (.CSV)" untuk mengunduh tabel lengkap yang siap dibuka di Microsoft Excel atau Google Sheets.',
    presentationTip:
      '"Hasil prediksi massal dapat langsung diunduh kembali menjadi file CSV yang dilengkapi kolom label sentimen dan probabilitas tiap kelas."',
  },

  /* ========================================================================
     5. HALAMAN KOMPARASI 2 PRODUK (komparasi)
     ======================================================================== */
  compare_overview: {
    id: 'compare_overview',
    category: 'Komparasi Reputasi Head-to-Head',
    title: 'Matriks Komparasi Reputasi 2 Produk E-Commerce',
    simpleMeaning:
      'Fitur untuk mengadu dua produk sejenis (Kandidat A vs Kandidat B) secara berdampingan guna menentukan produk mana yang lebih direkomendasikan berdasarkan ulasan pembeli.',
    formulaOrMechanism:
      'Sistem mengumpulkan ulasan untuk masing-masing kandidat produk dari korpus aktif, menjalankan klasifikasi Naive Bayes pada seluruh sampelnya, lalu menghitung Indeks Reputasi (0-100) serta merangkum kelebihan (Pros) dan keluhan (Cons).',
    howToRead:
      'Gunakan tombol "Skenario Uji Cepat" di bagian atas untuk langsung menampilkan contoh perbandingan dua produk di depan dosen penguji, atau ketik dua nama produk sendiri.',
    presentationTip:
      '"Modul ini mengubah hasil klasifikasi sentimen menjadi pendukung keputusan (Decision Support System) dengan membandingkan dua produk secara head-to-head."',
  },
  compare_verdict_box: {
    id: 'compare_verdict_box',
    category: 'Keputusan Pemenang Komparasi',
    title: 'Kesimpulan Komparasi & Papan Skor Reputasi',
    simpleMeaning:
      'Keputusan otomatis produk mana yang menang (Kandidat A atau Kandidat B) beserta selisih poin indeks reputasinya.',
    formulaOrMechanism:
      'Membandingkan Reputation Score Kandidat A vs Kandidat B, menghitung delta selisih poinnya, dan menyintesis narasi rekomendasi.',
    howToRead:
      'Kotak skor yang diberi warna aksen hijau/teal menandakan kandidat produk yang unggul secara keseluruhan.',
    presentationTip:
      '"Banner kesimpulan ini langsung memberikan rekomendasi objektif produk mana yang lebih unggul beserta selisih poin indeksnya."',
  },
  compare_identity_box: {
    id: 'compare_identity_box',
    category: 'Identitas Katalog Produk',
    title: 'Identitas Katalog & Sampel Pasar',
    simpleMeaning:
      'Informasi profil kedua produk yang sedang dibandingkan, meliputi foto produk, kategori pasar, rata-rata bintang, dan jumlah sampel ulasan yang dianalisis.',
    formulaOrMechanism:
      'Mencocokkan nama kandidat produk dengan metadata katalog PRDECT-ID Tokopedia dan menghitung rata-rata rating bintangnya.',
    howToRead:
      'Memastikan kedua produk yang dibandingkan berada pada segmen kategori yang relevan.',
    presentationTip:
      '"Bagian pertama matriks memvalidasi identitas produk, kategori e-commerce, serta jumlah sampel ulasan yang dianalisis pada masing-masing kandidat."',
  },
  compare_reputation_index: {
    id: 'compare_reputation_index',
    category: 'Formula Indeks Reputasi',
    title: 'Indeks Reputasi (0 - 100) & Distribusi Sentimen',
    simpleMeaning:
      'Skor nilai akhir dari 0 sampai 100 yang menggabungkan persentase sentimen positif, netral, negatif, dan rata-rata rating bintang untuk menentukan produk pemenang.',
    formulaOrMechanism:
      'Dihitung dari pembobotan proporsi ulasan Positif (bobot penuh), Netral (bobot moderat), penalti ulasan Negatif, serta kalibrasi rating bintang pelanggan menjadi skala 0 s.d. 100.',
    howToRead:
      'Skor >= 80 mendapat predikat "Sangat Direkomendasikan", 60-79 "Layak Dipertimbangkan", dan < 60 "Perlu Perhatian Kualitas".',
    presentationTip:
      '"Indeks Reputasi menormalisasi distribusi 3 kelas sentimen dan rating bintang ke dalam skala 0 hingga 100 sehingga kedua kandidat produk dapat dibandingkan secara apel-ke-apel."',
  },
  compare_pros_cons_box: {
    id: 'compare_pros_cons_box',
    category: 'Ekstraksi Aspek Produk',
    title: 'Perbandingan Aspek Apresiasi (Pros) & Catatan Keluhan (Cons)',
    simpleMeaning:
      'Ringkasan poin-poin apa saja yang paling disukai pembeli (tanda +) dan apa saja yang sering dikeluhkan pembeli (tanda -) pada masing-masing produk.',
    formulaOrMechanism:
      'Mengekstrak klaster kata kunci aspek (kualitas bahan, keaslian/originalitas, pengiriman, kemasan, harga, daya tahan) dari ulasan positif dan negatif tiap produk.',
    howToRead:
      'Memudahkan calon pembeli atau pemilik toko melihat keunggulan kompetitif Kandidat A dibandingkan kelemahan Kandidat B.',
    presentationTip:
      '"Sistem mengekstrak poin kelebihan (Pros) dari ulasan positif dan poin keluhan (Cons) dari ulasan negatif secara otomatis untuk kedua produk."',
  },
  compare_evidence_box: {
    id: 'compare_evidence_box',
    category: 'Bukti Empiris Pelanggan',
    title: 'Bukti Kutipan Ulasan Pembeli Terverifikasi',
    simpleMeaning:
      'Kutipan asli ulasan pelanggan yang mendasari penilaian Kandidat A dan Kandidat B, lengkap dengan tombol untuk menginspeksi kalimat tersebut lebih lanjut.',
    formulaOrMechanism:
      'Menampilkan sampel ulasan representatif dengan tingkat keyakinan (confidence) tertinggi dari masing-masing kandidat produk.',
    howToRead:
      'Klik tombol "Analisis detail" pada salah satu kutipan ulasan untuk membuka bedah bobot kata XAI di halaman Analisis Ulasan.',
    presentationTip:
      '"Setiap kesimpulan komparasi disertai bukti kutipan ulasan asli yang dapat diklik langsung untuk diaudit di mesin XAI."',
  },

  /* ========================================================================
     6. HALAMAN SENTIMEN AI CHAT (ai-chat)
     ======================================================================== */
  aichat_overview: {
    id: 'aichat_overview',
    category: 'Natural Language Corpus Analyst',
    title: 'Cara Kerja Asisten Analitik Korpus (Sentimen AI Chat)',
    simpleMeaning:
      'Fitur tanya-jawab pintar di mana Anda bisa bertanya pakai bahasa sehari-hari (misal: "Apa penyebab keluhan pengiriman di kategori Elektronik?") dan sistem menjawabnya berdasarkan data nyata dari 5.459 ulasan.',
    formulaOrMechanism:
      'Endpoint POST /api/ai-analyst memetakan niat pertanyaan (aspek pengiriman, kemasan, harga, kualitas, atau emosi) dan entitas kategori, lalu menyaring korpus PRDECT-ID, menghitung metrik segmen terkait, dan mengekstrak bukti ulasan empiris.',
    howToRead:
      'Klik salah satu chip "Pertanyaan Cepat" atau pilih cakupan kategori di kanan atas, lalu baca ringkasan narasi eksekutif, grafik proporsi, dan bukti kutipan ulasannya.',
    presentationTip:
      '"Berbeda dengan prediksi ulasan tunggal, fitur Sentimen AI Chat ini menganalisis agregat seluruh korpus PRDECT-ID untuk menjawab pertanyaan analitik manajemen secara instan."',
  },
  aichat_synthesis_box: {
    id: 'aichat_synthesis_box',
    category: 'Sintesis Statistik Korpus',
    title: 'Ringkasan Jawaban Eksekutif, Ledger 4 Metrik, & Temuan Utama',
    simpleMeaning:
      'Kotak jawaban utama dari AI yang merangkum hasil bedah data korpus sesuai pertanyaan Anda, lengkap dengan persentase Positif, Negatif, NSS, rata-rata bintang, dan poin temuan penting.',
    formulaOrMechanism:
      'Menghitung statistik agregat secara real-time pada subset ulasan yang relevan dengan topik pertanyaan dan menyusun poin-poin temuan psikografi emosi.',
    howToRead:
      'Baca bagian kotak bergaris tepi hijau untuk kesimpulan utamanya, lalu lihat 4 kotak angka di bawahnya untuk ringkasan metrik segmen tersebut.',
    presentationTip:
      '"Setiap jawaban AI selalu didukung oleh angka statistik riil dari segmen korpus yang sedang ditanyakan, bukan halusinasi teks semata."',
  },
  aichat_evidence_box: {
    id: 'aichat_evidence_box',
    category: 'Validasi Empiris',
    title: 'Kutipan Ulasan Empiris Terkait Pertanyaan',
    simpleMeaning:
      'Contoh nyata ulasan pembeli dari dalam dataset yang membuktikan kebenaran jawaban AI di atas.',
    formulaOrMechanism:
      'Menyaring baris ulasan pada korpus PRDECT-ID yang mengandung token aspek dan kategori yang ditanyakan, lengkap dengan label emosi dan lokasi kotanya.',
    howToRead:
      'Klik tombol "Inspeksi XAI" di sebelah kanan ulasan untuk menguji kalimat tersebut secara mendalam di halaman Analisis Ulasan.',
    presentationTip:
      '"Untuk menjaga akuntabilitas akademik, setiap sintesis jawaban AI disertai kutipan ulasan empiris asli dari dataset PRDECT-ID."',
  },
  aichat_chart_box: {
    id: 'aichat_chart_box',
    category: 'Visualisasi Segmen',
    title: 'Grafik Proporsi Sentimen pada Segmen Terkait',
    simpleMeaning:
      'Perbandingan visual batang hijau (Positif) melawan batang merah (Negatif) pada kategori atau aspek yang sedang Anda tanyakan.',
    formulaOrMechanism:
      'Membandingkan rasio persentase ulasan positif dan negatif antar sub-kategori atau dimensi yang relevan dengan pertanyaan.',
    howToRead:
      'Semakin panjang bar hijau berarti segmen tersebut didominasi kepuasan; semakin panjang bar merah berarti segmen tersebut didominasi keluhan.',
    presentationTip:
      '"Grafik ini memvisualisasikan perbandingan proporsi sentimen positif dan negatif secara langsung pada topik yang ditanyakan."',
  },
  aichat_token_attribution: {
    id: 'aichat_token_attribution',
    category: 'Atribusi Leksikal Korpus',
    title: 'Atribusi Token Pendorong (Multinomial Naive Bayes)',
    simpleMeaning:
      'Daftar kata kunci pemicu komplain (merah) dan kata kunci pemicu kepuasan (hijau) yang paling sering muncul dan memiliki bobot probabilitas tertinggi pada topik yang sedang ditanyakan.',
    formulaOrMechanism:
      'Mengambil irisan kosakata pada segmen korpus yang difilter dengan bobot differential log-likelihood dari model Multinomial Naive Bayes.',
    howToRead:
      'Angka di dalam kurung menunjukkan kekuatan bobot kata tersebut dalam mendorong klasifikasi ke arah Negatif atau Positif.',
    presentationTip:
      '"Panel ini menunjukkan kata kunci spesifik yang menjadi akar masalah keluhan pelanggan maupun faktor utama kepuasan pada kategori yang sedang dianalisis."',
  },

  /* ========================================================================
     7. HALAMAN PETA KORPUS 29 KATEGORI (peta-korpus)
     ======================================================================== */
  map_overview: {
    id: 'map_overview',
    category: 'Pemetaan Lintas Sektor',
    title: 'Peta Persebaran Sentimen 30 Kategori Produk',
    simpleMeaning:
      'Katalog visual yang memetakan kondisi kepuasan dan keluhan pembeli di seluruh 29 kategori asli Tokopedia PRDECT-ID (ditambah kategori umum) secara menyeluruh.',
    formulaOrMechanism:
      'Mengagregasi 5.459 baris ulasan berdasarkan kolom Category, menghitung persentase Positif/Netral/Negatif, skor NSS, rata-rata Customer Rating, dan mencari modus (nilai terbanyak) pada kolom Emotion.',
    howToRead:
      'Setiap kartu menampilkan nama kategori, grup makro di atasnya, badge NSS di kanan atas, bar warna 3 sentimen, rata-rata bintang, dan emosi dominan. Klik kartu mana saja untuk langsung membedah isi ulasan kategori tersebut.',
    presentationTip:
      '"Halaman Peta Korpus ini memberikan pandangan helikopter (bird\'s-eye view) terhadap seluruh 30 kategori produk e-commerce lengkap dengan rasio sentimen dan emosi dominannya."',
  },
  map_toolbar_filter: {
    id: 'map_toolbar_filter',
    category: 'Navigasi & Pengurutan Peta',
    title: 'Pencarian Kategori, Filter Grup Makro, & Pengurutan Metrik',
    simpleMeaning:
      'Kontrol untuk mencari kategori tertentu, menyaring berdasarkan 4 kelompok besar (Elektronik, Fashion, Rumah Tangga, Otomotif & Hobi), atau mengurutkan kategori dari yang paling puas hingga paling kritis.',
    formulaOrMechanism:
      'Melakukan penyaringan dan pengurutan (sorting) instan berdasarkan jumlah sampel terbanyak, NSS tertinggi, NSS terendah, atau rating bintang tertinggi.',
    howToRead:
      'Coba ubah dropdown "Urutkan" menjadi "NSS Terendah (Prioritas Audit)" saat presentasi untuk langsung menunjukkan kategori mana yang paling banyak komplain.',
    presentationTip:
      '"Melalui toolbar ini, kita dapat mengelompokkan 30 kategori ke dalam 4 sektor makro atau mengurutkannya berdasarkan tingkat kepuasan NSS."',
  },

  /* ========================================================================
     8. HALAMAN BEDAH DATA MULTI-DIMENSI (bedah-data)
     ======================================================================== */
  drill_cross_filter: {
    id: 'drill_cross_filter',
    category: 'Eksplorasi Multi-Dimensi',
    title: 'Parameter Filter Silang (Cross-Filter 4 Dimensi)',
    simpleMeaning:
      'Alat penyaring canggih untuk membedah data ulasan dengan menggabungkan 4 filter sekaligus: Kategori Produk, Emosi Pelanggan, Rating Bintang (1-5), dan Kelas Sentimen.',
    formulaOrMechanism:
      'Mengirimkan parameter query ke GET /api/corpus-analytics yang melakukan pemfilteran DataFrame secara real-time dan menghitung ulang grafik rating, emosi, lokasi kota, serta daftar sampel ulasan yang cocok.',
    howToRead:
      'Ubah salah satu dropdown (misalnya pilih Emosi: Marah / Anger dan Rating: Bintang 1), maka seluruh grafik dan daftar ulasan di bawahnya akan langsung menyesuaikan.',
    presentationTip:
      '"Fitur Bedah Data ini mengekspos seluruh kekayaan atribut asli dataset PRDECT-ID, memungkinkan kita melakukan investigasi silang antara rating bintang, emosi psikografis, dan lokasi kota."',
  },
  drill_rating_breakdown: {
    id: 'drill_rating_breakdown',
    category: 'Distribusi Rating Pembeli',
    title: 'Distribusi Rating Bintang (★1 s.d. ★5)',
    simpleMeaning:
      'Grafik perbandingan jumlah ulasan berdasarkan bintang yang diberikan pembeli di Tokopedia (mulai dari Bintang 1 sampai Bintang 5) pada segmen data yang sedang dipilih.',
    formulaOrMechanism:
      'Menghitung frekuensi kolom Customer Rating (1 s.d. 5) pada subset korpus aktif. Anda juga dapat mengklik langsung baris bintang pada grafik ini untuk menyaring ulasan.',
    howToRead:
      'Bar hijau (★5 dan ★4) mewakili ulasan positif, bar kuning (★3) mewakili ulasan netral, dan bar merah (★2 dan ★1) mewakili ulasan negatif.',
    presentationTip:
      '"Grafik ini memperlihatkan hubungan langsung antara penilaian bintang pelanggan dari bintang 1 hingga bintang 5 dengan proporsi kelas sentimen."',
  },
  drill_emotion_psychography: {
    id: 'drill_emotion_psychography',
    category: 'Psikografi Emosi PRDECT-ID',
    title: 'Psikografi 5 Emosi Pelanggan (Happy, Love, Sadness, Fear, Anger)',
    simpleMeaning:
      'Pemetaan 5 tingkat perasaan/emosi manusia yang terkandung di dalam ulasan pembeli berdasarkan anotasi pakar pada dataset PRDECT-ID.',
    formulaOrMechanism:
      'Membaca atribut kolom Emotion asli dari dataset PRDECT-ID Tokopedia yang terdiri dari 5 emosi dasar: Senang (Happy), Cinta/Sangat Puas (Love), Sedih/Kecewa (Sadness), Khawatir/Ragu (Fear), dan Marah/Komplain Keras (Anger).',
    howToRead:
      'Bahkan di dalam sentimen Negatif sekalipun, kita bisa membedakan apakah pelanggan merasa Sedih/Kecewa (Sadness), Khawatir barang palsu (Fear), atau Marah Besar (Anger). Klik salah satu baris emosi untuk menyaring ulasannya.',
    presentationTip:
      '"Keunggulan analisis kami adalah tidak berhenti di 3 kelas sentimen, tetapi juga memetakan 5 dimensi psikografi emosi pelanggan asli dari PRDECT-ID: Happy, Love, Sadness, Fear, dan Anger."',
  },
  drill_city_locations: {
    id: 'drill_city_locations',
    category: 'Geografi Toko & Logistik',
    title: 'Sebaran Lokasi Toko / Kota Teratas',
    simpleMeaning:
      'Daftar kota asal pengiriman toko/penjual yang paling banyak memiliki transaksi pada segmen yang sedang dipilih, lengkap dengan rasio kepuasan dan keluhannya.',
    formulaOrMechanism:
      'Mengelompokkan atribut kolom Location dari dataset PRDECT-ID dan menghitung persentase ulasan Positif vs Negatif di tiap kota.',
    howToRead:
      'Menunjukkan pusat distribusi seller e-commerce (seperti Jakarta Barat, Jakarta Pusat, Tangerang, Surabaya, Bandung) beserta perbandingan persentase kepuasan pembelinya.',
    presentationTip:
      '"Panel lokasi ini membantu mengidentifikasi apakah keluhan pengiriman atau kerusakan barang terkonsentrasi pada wilayah logistik kota tertentu."',
  },
  drill_samples_box: {
    id: 'drill_samples_box',
    category: 'Bukti Ulasan Tersaring',
    title: 'Sampel Ulasan Hasil Bedah Data Multi-Dimensi',
    simpleMeaning:
      'Daftar ulasan produk nyata yang lolos dari saringan filter Kategori, Emosi, Rating Bintang, dan Sentimen yang Anda pilih di atas.',
    formulaOrMechanism:
      'Menampilkan teks ulasan beserta nama produk asli Tokopedia, harga barang (Rp), kota penjual, rating bintang, dan label emosinya.',
    howToRead:
      'Klik tombol "Uji di XAI Predictor" pada kartu ulasan mana saja untuk langsung membedah bobot kata Naive Bayes dari kalimat tersebut.',
    presentationTip:
      '"Setiap ulasan hasil filter menampilkan nama produk asli, harga, lokasi toko, dan dapat langsung dikirim ke halaman XAI Predictor dengan satu klik."',
  },

  /* ========================================================================
     9. HALAMAN KATALOG METRIK & REST API (katalog-api)
     ======================================================================== */
  catalog_governed_metrics: {
    id: 'catalog_governed_metrics',
    category: 'Semantic Layer & Standarisasi',
    title: 'Katalog Metrik Semantik Terkelola (Governed Metrics Catalog)',
    simpleMeaning:
      'Kamus rumus resmi sistem yang memastikan bahwa perhitungan angka NSS, F1-Score, Akurasi, dan Indeks Kepuasan selalu konsisten di seluruh halaman aplikasi.',
    formulaOrMechanism:
      'Mengikat definisi matematis dari setiap indikator kinerja utama ke dalam satu lapisan semantik terpusat di backend.',
    howToRead:
      'Setiap kartu menampilkan kode variabel metrik, nilai aktual saat ini, nama indikator, kotak rumus perhitungannya, serta dimensi dan pemilik metrik.',
    presentationTip:
      '"Katalog Metrik Semantik ini menjamin Single Source of Truth, sehingga angka yang tampil di Landing Page, Dashboard Evaluasi, dan REST API selalu sinkron dari rumus yang sama."',
  },
  catalog_pipeline_code: {
    id: 'catalog_pipeline_code',
    category: 'Implementasi Kode Scikit-Learn',
    title: 'Definisi Dalam Kode (Scikit-Learn Pipeline)',
    simpleMeaning:
      'Potongan kode asli Python yang digunakan di dalam proyek ini untuk membangun pipeline ekstraksi fitur dan pelatihan model Naive Bayes.',
    formulaOrMechanism:
      'Menggunakan objek Pipeline dari pustaka scikit-learn yang menggabungkan tahap preprocess_text (Sastrawi + Slang Dict), CountVectorizer(ngram_range=(1,2)), dan MultinomialNB(alpha=1.0).',
    howToRead:
      'Anda dapat menjelaskan baris demi baris kode ini saat dosen penguji menanyakan bagaimana cara kerja kodingan pelatihan model di belakang layar.',
    presentationTip:
      '"Panel ini menampilkan arsitektur kode Python Scikit-Learn yang sesungguhnya berjalan di file src/train.py dan disimpan ke dalam artefak models/model_sentimen.pkl."',
  },
  catalog_api_playground: {
    id: 'catalog_api_playground',
    category: 'Integrasi Backend & JSON API',
    title: 'Sentimen REST API Playground (Uji Endpoint Langsung)',
    simpleMeaning:
      'Terminal penguji interaktif untuk mengirim perintah (request) ke server backend Flask dan melihat balasan data mentah berformat JSON secara langsung tanpa perlu membuka aplikasi Postman.',
    formulaOrMechanism:
      'Mengirimkan HTTP Request (POST /api/predict, POST /api/ai-analyst, atau GET /api/corpus-analytics) dengan header Content-Type: application/json langsung ke server Flask.',
    howToRead:
      'Pilih salah satu dari 3 endpoint di atas, ubah isi teks ulasan atau pertanyaan, lalu klik "Kirim Request API" untuk menampilkan struktur JSON respons asli dari server.',
    presentationTip:
      '"Melalui REST API Playground ini, kami mendemonstrasikan arsitektur client-server yang terpisah (decoupled), di mana mesin NLP Flask dapat diintegrasikan oleh aplikasi pihak ketiga via JSON API."',
  },
}

interface HelpButtonProps {
  topicId: keyof typeof HELP_TOPICS | string
  label?: string
  customTopic?: HelpTopicContent
}

export const HelpButton: React.FC<HelpButtonProps> = ({
  topicId,
  label,
  customTopic,
}) => {
  const [open, setOpen] = useState(false)
  const topic = customTopic || HELP_TOPICS[topicId]

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  if (!topic) return null

  return (
    <>
      <button
        type="button"
        className="cih-help-btn"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        title={`Penjelasan: ${topic.title}`}
        aria-label={label || `Buka penjelasan ${topic.title}`}
      >
        <span>?</span>
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="cih-help-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`help-modal-title-${topic.id}`}
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
            }}
          >
            <div
              className="cih-help-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cih-help-modal-header">
                <div>
                  <span className="cih-help-modal-kicker">
                    PANDUAN KONSEP &amp; PRESENTASI · {topic.category.toUpperCase()}
                  </span>
                  <h3
                    id={`help-modal-title-${topic.id}`}
                    className="cih-help-modal-title"
                  >
                    {topic.title}
                  </h3>
                </div>
                <button
                  type="button"
                  className="cih-help-modal-close"
                  onClick={() => setOpen(false)}
                  aria-label="Tutup penjelasan"
                >
                  ✕
                </button>
              </div>

              <div className="cih-help-modal-body">
                <div className="cih-help-section">
                  <div className="cih-help-section-label">
                    1. Pengertian Sederhana (Bahasa Mudah Dipahami)
                  </div>
                  <p className="cih-help-section-text">{topic.simpleMeaning}</p>
                </div>

                <div className="cih-help-section">
                  <div className="cih-help-section-label">
                    2. Rumus &amp; Cara Kerja di Sistem Ini
                  </div>
                  <div className="cih-help-formula-box">
                    {topic.formulaOrMechanism}
                  </div>
                </div>

                <div className="cih-help-section">
                  <div className="cih-help-section-label">
                    3. Cara Membaca &amp; Makna Angka di Kotak Ini
                  </div>
                  <p className="cih-help-section-text">{topic.howToRead}</p>
                </div>

                <div className="cih-help-section is-tip">
                  <div className="cih-help-section-label">
                    4. Contekan Kalimat Presentasi / Sidang (Siap Baca)
                  </div>
                  <p className="cih-help-tip-quote">{topic.presentationTip}</p>
                </div>
              </div>

              <div className="cih-help-modal-footer">
                <span className="cih-help-modal-foot-note">
                  Tekan <code>ESC</code> atau klik di luar kotak untuk menutup
                </span>
                <button
                  type="button"
                  className="cih-btn-primary"
                  style={{ padding: '7px 16px', fontSize: '0.8rem' }}
                  onClick={() => setOpen(false)}
                >
                  Mengerti &amp; Tutup
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
