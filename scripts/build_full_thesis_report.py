import os
import base64
import subprocess
import re

def get_base64_image(image_path):
    if not os.path.exists(image_path):
        return ""
    ext = os.path.splitext(image_path)[1].lower()
    mime = "image/png"
    if ext in ['.jpg', '.jpeg']:
        mime = "image/jpeg"
    elif ext == '.svg':
        mime = "image/svg+xml"
    with open(image_path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode("utf-8")
    return f"data:{mime};base64,{encoded}"

# Load images as base64
img_logo_polindra = get_base64_image("report_assets/logo_polindra.jpg")
img_class_dist = get_base64_image("report_assets/class_distribution.png")
img_cm = get_base64_image("report_assets/confusion_matrix.png")
img_model_comp = get_base64_image("report_assets/model_comparison.png")
img_top_tokens = get_base64_image("report_assets/top_tokens.png")
img_pipe_flow = get_base64_image("report_assets/flowchart_pipeline_umum.png")
img_nb_flow = get_base64_image("report_assets/flowchart_algoritma_naive_bayes.png")
img_ui_analisis = get_base64_image("report_assets/ui_analisis_ulasan.jpg")
img_ui_kpi = get_base64_image("report_assets/ui_target_kpi.jpg")
img_ui_korpus = get_base64_image("report_assets/ui_peta_korpus.jpg")
img_ui_komparasi = get_base64_image("report_assets/ui_komparasi.jpg")

html_template = """<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Laporan Tugas Besar Kecerdasan Buatan - Klasifikasi Sentimen PRDECT-ID</title>
<style>
  @page {
    size: A4 portrait;
    margin: 30mm 25mm 25mm 35mm;
    @bottom-center {
      content: counter(page);
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      color: #1a1a1a;
    }
  }

  @page :first {
    @bottom-center {
      content: none;
    }
  }

  * {
    box-sizing: border-box;
  }

  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    line-height: 1.5;
    color: #000000;
    background-color: #ffffff;
    margin: 0;
    padding: 0;
    text-align: justify;
    text-justify: inter-word;
  }

  .page-break {
    page-break-before: always;
    break-before: page;
  }

  /* Cover Page Styling - Clean Academic Thesis */
  .cover {
    min-height: 92vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    padding: 10px 0;
  }

  .cover-inst-header {
    font-size: 13pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    line-height: 1.4;
    color: #000000;
  }

  .cover-title-box {
    margin: 22px 0;
  }

  .cover-title {
    font-size: 14pt;
    font-weight: bold;
    text-transform: uppercase;
    line-height: 1.45;
    color: #000000;
  }

  .cover-subtitle {
    font-size: 11.5pt;
    font-weight: normal;
    margin-top: 10px;
    font-style: italic;
    color: #222222;
  }

  .cover-logo {
    width: 135px;
    height: auto;
    margin: 18px auto;
    display: block;
  }

  .cover-purpose {
    font-size: 11.5pt;
    margin: 14px 0;
    line-height: 1.45;
  }

  .cover-authors-table {
    margin: 12px auto;
    font-size: 11.5pt;
    border-collapse: collapse;
    text-align: left;
  }

  .cover-authors-table td {
    padding: 3px 14px;
  }

  .cover-footer {
    font-size: 12.5pt;
    font-weight: bold;
    text-transform: uppercase;
    line-height: 1.4;
    margin-top: 15px;
  }

  /* Headings */
  h1.chapter-title {
    font-size: 14pt;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    margin-top: 0;
    margin-bottom: 24px;
    line-height: 1.4;
    color: #000000;
  }

  h2 {
    font-size: 12pt;
    font-weight: bold;
    margin-top: 20px;
    margin-bottom: 10px;
    color: #000000;
  }

  h3 {
    font-size: 12pt;
    font-weight: bold;
    margin-top: 18px;
    margin-bottom: 8px;
    color: #000000;
  }

  h4 {
    font-size: 12pt;
    font-weight: bold;
    margin-top: 10px;
    margin-bottom: 6px;
    color: #000000;
  }

  p {
    margin-top: 0;
    margin-bottom: 10px;
    text-indent: 1.27cm;
  }

  p.no-indent {
    text-indent: 0;
  }

  ol, ul {
    margin-top: 0;
    margin-bottom: 10px;
    padding-left: 1.8cm;
  }

  li {
    margin-bottom: 4px;
  }

  /* Clean Academic Tables (Booktabs style - no outer side borders) */
  table.academic-table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0 18px 0;
    font-size: 10.5pt;
    line-height: 1.35;
  }

  table.academic-table th {
    border-top: 1.5pt solid #000000;
    border-bottom: 1pt solid #000000;
    padding: 7px 9px;
    text-align: left;
    font-weight: bold;
    background-color: transparent;
    color: #000000;
  }

  table.academic-table td {
    padding: 6px 9px;
    border-bottom: 0.5pt solid #d4d4d8;
    vertical-align: top;
  }

  table.academic-table tr:last-child td {
    border-bottom: 1.5pt solid #000000;
  }

  .caption-table {
    font-size: 11pt;
    font-weight: bold;
    margin-top: 14px;
    margin-bottom: 6px;
    text-align: left;
    color: #000000;
  }

  /* Clean Figures - No Border/Shadow */
  .figure-container {
    text-align: center;
    margin: 18px 0;
    page-break-inside: avoid;
  }

  .figure-img {
    max-width: 92%;
    height: auto;
    border: none;
  }

  .caption-figure {
    font-size: 11pt;
    font-style: italic;
    margin-top: 8px;
    color: #000000;
    text-align: center;
  }

  /* Clean Centered Math Formula */
  .formula-clean {
    margin: 12px 0;
    padding: 4px 0;
    page-break-inside: avoid;
  }

  .formula-center {
    text-align: center;
    font-family: 'Cambria Math', 'Times New Roman', serif;
    font-size: 12pt;
    margin: 8px 0;
  }

  /* Clean Printable Code Block (Light Subtle Background, No Harsh Black Box) */
  .code-box {
    background-color: #f8fafc;
    color: #0f172a;
    border-left: 2.5pt solid #475569;
    padding: 10px 14px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 9.5pt;
    line-height: 1.35;
    overflow-x: auto;
    margin: 10px 0 14px 0;
    page-break-inside: avoid;
    white-space: pre-wrap;
  }

  .code-comment {
    color: #64748b;
    font-style: italic;
  }

  .code-keyword {
    color: #0369a1;
    font-weight: bold;
  }

  .code-string {
    color: #15803d;
  }

  .code-num {
    color: #b45309;
  }

  /* Clean Subsection for Pipeline Stages (No Outer Box) */
  .stage-section {
    margin: 14px 0 18px 0;
  }

  /* Clean Abstract (No Outer Box) */
  .abstract-section {
    margin: 12px 0 22px 0;
    font-size: 12pt;
    line-height: 1.5;
  }

  .abstract-title {
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    margin-bottom: 12px;
    font-size: 12.5pt;
  }

  /* Table of Contents */
  .toc-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 5px;
    font-size: 11.5pt;
  }

  .toc-dots {
    flex-grow: 1;
    border-bottom: 1pt dotted #666666;
    margin: 0 8px;
  }

  .toc-page {
    font-weight: normal;
  }

  /* Signatures */
  .sig-table {
    width: 100%;
    margin-top: 36px;
    border-collapse: collapse;
  }

  .sig-table td {
    width: 50%;
    vertical-align: top;
    text-align: center;
  }

  .sig-line {
    margin-top: 70px;
    border-top: 1pt solid #000000;
    display: inline-block;
    width: 75%;
  }

  /* Plain key-value table for Pengesahan & Lampiran */
  table.plain-table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 11.5pt;
  }

  table.plain-table td {
    padding: 5px 8px;
    vertical-align: top;
    border: none;
  }
</style>
</head>
<body>

<!-- ==================================================================== -->
<!-- HALAMAN SAMPUL / COVER                                               -->
<!-- ==================================================================== -->
<div class="cover">
  <div>
    <div class="cover-inst-header">
      KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI<br>
      POLITEKNIK NEGERI INDRAMAYU<br>
      JURUSAN TEKNIK INFORMATIKA
    </div>

    <div class="cover-title-box">
      <div class="cover-title">
        LAPORAN TUGAS BESAR KECERDASAN BUATAN<br>
        PENGEMBANGAN SISTEM ARTIFICIAL INTELLIGENCE KLASIFIKASI SENTIMEN DAN EVALUASI REPUTASI PRODUK E-COMMERCE BERBASIS MULTINOMIAL NAIVE BAYES PADA DATA TABULAR PRDECT-ID
      </div>
      <div class="cover-subtitle">
        Implementasi End-to-End Pipeline AI: Dari Akuisisi Data Terstruktur, Eksplorasi, Vektorisasi N-Gram, Pemodelan Probabilistik, Hingga Web Application Deployment
      </div>
    </div>
  </div>

  <div>
    <img src="__IMG_LOGO_POLINDRA__" class="cover-logo" alt="Logo Politeknik Negeri Indramayu">

    <div class="cover-purpose">
      Laporan Tugas Besar ini Diajukan untuk Memenuhi Penilaian<br>
      Mata Kuliah <strong>Kecerdasan Buatan</strong> Semester Ganjil Tahun Akademik 2025/2026
    </div>

    <div style="font-size: 11.5pt; font-weight: bold; margin-bottom: 4px;">Disusun Oleh:</div>
    <table class="cover-authors-table">
      <tr>
        <td>1. Muhammad Faiz Ramadhan</td>
        <td>(2305072)</td>
      </tr>
      <tr>
        <td>2. AYIP MUHAMMAD</td>
        <td>(2305059)</td>
      </tr>
      <tr>
        <td>3. MUHAMMAD IHYA ’ULUMUDDIN</td>
        <td>(2305073)</td>
      </tr>
      <tr>
        <td>4. NAILYAA DLIYAA’AN SYAH</td>
        <td>(2305075)</td>
      </tr>
    </table>

    <div style="font-size: 11.5pt; margin-top: 12px;">
      Dosen Pengampu:<br>
      <strong>Vera Wati, M.Kom</strong>
    </div>
  </div>

  <div class="cover-footer">
    PROGRAM STUDI TEKNIK INFORMATIKA<br>
    POLITEKNIK NEGERI INDRAMAYU<br>
    2026
  </div>
</div>

<!-- ==================================================================== -->
<!-- HALAMAN PENGESAHAN                                                   -->
<!-- ==================================================================== -->
<div class="page-break"></div>
<h1 class="chapter-title">LEMBAR PENGESAHAN<br>LAPORAN TUGAS BESAR KECERDASAN BUATAN</h1>

<p class="no-indent">
Laporan Tugas Besar Pengembangan Proyek Artificial Intelligence Berbasis Data Terstruktur dengan judul:
</p>

<div style="text-align: center; font-weight: bold; margin: 16px 0; font-size: 12pt; text-transform: uppercase;">
  "PENGEMBANGAN SISTEM ARTIFICIAL INTELLIGENCE KLASIFIKASI SENTIMEN DAN EVALUASI REPUTASI PRODUK E-COMMERCE BERBASIS MULTINOMIAL NAIVE BAYES PADA DATA TABULAR PRDECT-ID"
</div>

<p class="no-indent">Telah diperiksa, dievaluasi, dan disetujui untuk memenuhi seluruh kriteria penugasan pada mata kuliah <strong>Kecerdasan Buatan</strong> Jurusan Teknik Informatika, Politeknik Negeri Indramayu.</p>

<table class="plain-table">
  <tr>
    <td width="32%"><strong>Mata Kuliah</strong></td>
    <td width="3%">:</td>
    <td>Kecerdasan Buatan</td>
  </tr>
  <tr>
    <td><strong>Dosen Pengampu</strong></td>
    <td>:</td>
    <td>Vera Wati, M.Kom</td>
  </tr>
  <tr>
    <td><strong>Anggota Kelompok</strong></td>
    <td>:</td>
    <td>1. Muhammad Faiz Ramadhan (2305072)<br>
        2. AYIP MUHAMMAD (2305059)<br>
        3. MUHAMMAD IHYA ’ULUMUDDIN (2305073)<br>
        4. NAILYAA DLIYAA’AN SYAH (2305075)</td>
  </tr>
  <tr>
    <td><strong>Jurusan / Prodi</strong></td>
    <td>:</td>
    <td>Teknik Informatika</td>
  </tr>
  <tr>
    <td><strong>Tanggal Pengesahan</strong></td>
    <td>:</td>
    <td>16 November 2026</td>
  </tr>
</table>

<table class="sig-table">
  <tr>
    <td>
      Mengetahui,<br>
      Perwakilan Kelompok Mahasiswa<br><br><br><br>
      <div class="sig-line"></div><br>
      <strong>Muhammad Faiz Ramadhan</strong><br>
      NIM. 2305072
    </td>
    <td>
      Disetujui Oleh,<br>
      Dosen Pengampu Mata Kuliah<br><br><br><br>
      <div class="sig-line"></div><br>
      <strong>Vera Wati, M.Kom</strong>
    </td>
  </tr>
</table>

<!-- ==================================================================== -->
<!-- ABSTRAK                                                              -->
<!-- ==================================================================== -->
<div class="page-break"></div>
<h1 class="chapter-title">ABSTRAK</h1>

<div class="abstract-section">
  <p>Dalam ekosistem perdagangan elektronik (<em>e-commerce</em>), ulasan pelanggan merupakan aset data terstruktur dan tekstual yang sangat berharga untuk memahami persepsi pasar, kepuasan konsumen, serta kualitas produk. Namun, volume ulasan yang masif menyulitkan analisis manual. Proyek Tugas Besar ini bertujuan membangun sistem <em>Artificial Intelligence</em> (AI) klasifikasi sentimen berbasis data tabular menggunakan algoritma <strong>Multinomial Naive Bayes</strong> dengan pembobotan ekstraksi fitur n-gram (unigram dan bigram) serta optimasi <em>Laplace Smoothing</em>. Dataset yang digunakan adalah korpus terbuka terstruktur <strong>PRDECT-ID</strong> (Indonesian E-Commerce Product Review Dataset) yang terdiri atas 5.459 baris data tabular dengan 11 atribut komprehensif, mencakup metadata toko, harga, kategori produk, rating bintang, hingga emosi konsumen. Pipeline pengembangan AI disusun secara sistematis mencakup 12 tahapan: identifikasi masalah, akuisisi data, audit kualitas data, <em>Exploratory Data Analysis</em> (EDA), <em>text preprocessing</em> (case folding, pembersihan tanda baca/URL, normalisasi kata gaul/slang, dan penghapusan stopword), ekstraksi fitur frekuensi <em>CountVectorizer</em>, <em>stratified train-test split</em> (80:20), perancangan algoritma probabilistik, pelatihan model, eksperimen multi-model, evaluasi performa, hingga penerapan pada aplikasi web interaktif berbasis Flask dan React. Berdasarkan pengujian terhadap 1.092 sampel uji terstratifikasi, model Multinomial Naive Bayes terpilih berhasil mencapai <strong>Akurasi sebesar 85,35%</strong> dan <strong>Macro F1-Score sebesar 76,64%</strong>, melampaui target ambang batas performa yang ditetapkan (Macro F1 &ge; 70%). Sistem dilengkapi dengan fungsionalitas <em>Online Learning</em> (incremental update menggunakan <code>partial_fit</code>), penalaran konteks kalimat kontrastif, pelacak <em>Net Sentiment Score</em> (NSS), modul komparasi dua produk berdampingan, serta antarmuka pemantauan KPI korpus yang intuitif.</p>
  <p class="no-indent" style="margin-top: 12px;"><strong>Kata Kunci:</strong> Artificial Intelligence, Sentimen Analisis, Multinomial Naive Bayes, PRDECT-ID, Data Tabular, Natural Language Processing, E-Commerce, Online Learning.</p>
</div>

<div class="page-break"></div>
<h1 class="chapter-title">ABSTRACT</h1>

<div class="abstract-section">
  <p>In the e-commerce ecosystem, customer reviews represent a vital source of structured tabular and textual intelligence for assessing market reputation and customer satisfaction. This Artificial Intelligence (AI) project develops a production-grade sentiment classification and product intelligence system utilizing the <strong>Multinomial Naive Bayes</strong> probabilistic algorithm with n-gram feature extraction (unigrams and bigrams) and Laplace Smoothing. The model is trained on the benchmark tabular dataset <strong>PRDECT-ID</strong> comprising 5,459 entries across 11 attributes from Indonesian marketplaces, including product category, pricing, ratings, raw reviews, and secondary emotions. Following a rigorous 12-stage AI development pipeline—from problem formulation, data quality auditing, exploratory data analysis, Indonesian text preprocessing, feature mapping, to web deployment—the proposed model was validated on a stratified test set of 1,092 samples. The system achieved an <strong>Accuracy of 85.35%</strong> and a <strong>Macro F1-Score of 76.64%</strong>, successfully outperforming the required institutional performance benchmarks. The engineered platform incorporates online incremental learning via <code>partial_fit</code>, contrastive linguistic rule handling, Net Sentiment Score (NSS) tracking, side-by-side product comparisons, and a full-stack Flask/React interactive interface.</p>
  <p class="no-indent" style="margin-top: 12px;"><strong>Keywords:</strong> Artificial Intelligence, Sentiment Analysis, Multinomial Naive Bayes, PRDECT-ID, Tabular Dataset, Natural Language Processing, E-Commerce Analytics, Incremental Learning.</p>
</div>

<!-- ==================================================================== -->
<!-- KATA PENGANTAR                                                       -->
<!-- ==================================================================== -->
<div class="page-break"></div>
<h1 class="chapter-title">KATA PENGANTAR</h1>

<p>Puji dan syukur kami panjatkan ke hadirat Allah SWT, Tuhan Yang Maha Esa, karena atas limpahan rahmat, taufik, serta hidayah-Nya, Laporan Tugas Besar Mata Kuliah <strong>Kecerdasan Buatan</strong> yang berjudul <strong>"Pengembangan Sistem Artificial Intelligence Klasifikasi Sentimen dan Evaluasi Reputasi Produk E-Commerce Berbasis Multinomial Naive Bayes pada Data Tabular PRDECT-ID"</strong> ini dapat diselesaikan dengan baik dan tepat pada waktunya.</p>

<p>Tugas Besar ini dirancang sebagai integrasi komprehensif antara teori kecerdasan buatan, pemodelan penalaran probabilistik di bawah ketidakpastian (<em>reasoning under uncertainty</em>), rekayasa data tabular, serta pengembangan aplikasi perangkat lunak berbasis web modern. Melalui pengerjaan tugas ini, kami tidak hanya mempelajari mekanisme internal algoritma Naive Bayes secara matematis, namun juga mengimplementasikan seluruh pipeline AI secara terstruktur, mulai dari akuisisi data mentah hingga penyajian antarmuka pengguna yang responsif.</p>

<p>Penyusunan laporan ini tidak lepas dari bimbingan, arahan, dan dukungan berbagai pihak. Oleh karena itu, kami menyampaikan apresiasi dan ucapan terima kasih yang setinggi-tingginya kepada:</p>
<ol>
  <li><strong>Ibu Vera Wati, M.Kom</strong>, selaku Dosen Pengampu Mata Kuliah Kecerdasan Buatan, yang senantiasa membimbing, mengarahkan, dan memberikan masukan konstruktif dalam penyusunan tugas besar ini.</li>
  <li>Pimpinan Jurusan Teknik Informatika Politeknik Negeri Indramayu yang telah memfasilitasi sarana akademik dan laboratorium penunjang perkuliahan.</li>
  <li>Rekan-rekan satu kelompok yang telah berkolaborasi aktif, solid, dan penuh dedikasi dalam setiap tahapan perancangan, eksperimen kode, dan penulisan dokumen.</li>
  <li>Keluarga serta rekan-rekan mahasiswa yang senantiasa memberikan dorongan moral dan motivasi.</li>
</ol>

<p>Kami menyadari bahwa laporan ini masih memiliki ruang untuk penyempurnaan. Oleh sebab itu, kritik dan saran yang membangun dari dosen penguji serta pembaca sangat kami harapkan guna penyempurnaan karya di masa mendatang. Semoga laporan ini dapat memberikan manfaat nyata bagi pengembangan ilmu pengetahuan dan aplikasi AI terapan.</p>

<table style="width: 100%; margin-top: 30px; border-collapse: collapse;">
  <tr>
    <td width="60%"></td>
    <td style="text-align: center;">
      Indramayu, 16 November 2026<br><br>
      <strong>Tim Penulis</strong>
    </td>
  </tr>
</table>

<!-- ==================================================================== -->
<!-- DAFTAR ISI                                                           -->
<!-- ==================================================================== -->
<div class="page-break"></div>
<h1 class="chapter-title">DAFTAR ISI</h1>

<div class="toc-row"><strong>HALAMAN JUDUL / COVER</strong><span class="toc-dots"></span><span class="toc-page">__P_COVER__</span></div>
<div class="toc-row"><strong>LEMBAR PENGESAHAN</strong><span class="toc-dots"></span><span class="toc-page">__P_PENGESAHAN__</span></div>
<div class="toc-row"><strong>ABSTRAK</strong><span class="toc-dots"></span><span class="toc-page">__P_ABSTRAK__</span></div>
<div class="toc-row"><strong>ABSTRACT</strong><span class="toc-dots"></span><span class="toc-page">__P_ABSTRACT__</span></div>
<div class="toc-row"><strong>KATA PENGANTAR</strong><span class="toc-dots"></span><span class="toc-page">__P_KATA_PENGANTAR__</span></div>
<div class="toc-row"><strong>DAFTAR ISI</strong><span class="toc-dots"></span><span class="toc-page">__P_DAFTAR_ISI__</span></div>
<div class="toc-row"><strong>DAFTAR TABEL</strong><span class="toc-dots"></span><span class="toc-page">__P_DAFTAR_TABEL__</span></div>
<div class="toc-row"><strong>DAFTAR GAMBAR</strong><span class="toc-dots"></span><span class="toc-page">__P_DAFTAR_GAMBAR__</span></div>

<div class="toc-row" style="margin-top: 10px;"><strong>BAB I PENDAHULUAN</strong><span class="toc-dots"></span><span class="toc-page">__P_BAB1__</span></div>
<div class="toc-row" style="padding-left: 20px;">1.1 Latar Belakang dan Permasalahan<span class="toc-dots"></span><span class="toc-page">__P_1_1__</span></div>
<div class="toc-row" style="padding-left: 20px;">1.2 Tujuan Pengembangan Proyek<span class="toc-dots"></span><span class="toc-page">__P_1_2__</span></div>
<div class="toc-row" style="padding-left: 20px;">1.3 Deskripsi Singkat Sistem AI yang Dibangun<span class="toc-dots"></span><span class="toc-page">__P_1_3__</span></div>
<div class="toc-row" style="padding-left: 20px;">1.4 Metode / Algoritma AI yang Dipilih dan Alasan Pemilihan<span class="toc-dots"></span><span class="toc-page">__P_1_4__</span></div>
<div class="toc-row" style="padding-left: 20px;">1.5 Batasan Masalah dan Ruang Lingkup<span class="toc-dots"></span><span class="toc-page">__P_1_5__</span></div>

<div class="toc-row" style="margin-top: 10px;"><strong>BAB II DATASET DAN PERMASALAHAN</strong><span class="toc-dots"></span><span class="toc-page">__P_BAB2__</span></div>
<div class="toc-row" style="padding-left: 20px;">2.1 Deskripsi Dataset dan Sumber Pengambilan Data<span class="toc-dots"></span><span class="toc-page">__P_2_1__</span></div>
<div class="toc-row" style="padding-left: 20px;">2.2 Dimensi Data, Atribut, dan Tipe Data Tabular<span class="toc-dots"></span><span class="toc-page">__P_2_2__</span></div>
<div class="toc-row" style="padding-left: 20px;">2.3 Penjelasan Fungsi Atribut Tabular dan Korelasi Bisnis<span class="toc-dots"></span><span class="toc-page">__P_2_3__</span></div>
<div class="toc-row" style="padding-left: 20px;">2.4 Identifikasi Variabel Input (X) dan Target/Label (y)<span class="toc-dots"></span><span class="toc-page">__P_2_4__</span></div>
<div class="toc-row" style="padding-left: 20px;">2.5 Contoh Data dan Visualisasi Distribusi Awal Korpus<span class="toc-dots"></span><span class="toc-page">__P_2_5__</span></div>
<div class="toc-row" style="padding-left: 20px;">2.6 Keterkaitan Dataset dengan Penyelesaian Permasalahan<span class="toc-dots"></span><span class="toc-page">__P_2_6__</span></div>

<div class="toc-row" style="margin-top: 10px;"><strong>BAB III PIPELINE PENGEMBANGAN ARTIFICIAL INTELLIGENCE</strong><span class="toc-dots"></span><span class="toc-page">__P_BAB3__</span></div>
<div class="toc-row" style="padding-left: 20px;">3.1 Flowchart Pipeline Umum Pengembangan AI (12 Tahapan)<span class="toc-dots"></span><span class="toc-page">__P_3_1__</span></div>
<div class="toc-row" style="padding-left: 20px;">3.2 Flowchart Khusus Mekanisme Algoritma Multinomial Naive Bayes<span class="toc-dots"></span><span class="toc-page">__P_3_2__</span></div>
<div class="toc-row" style="padding-left: 20px;">3.3 Penjelasan Rinci 12 Tahap Pipeline (Teori, Koding, & Hasil Analisis)<span class="toc-dots"></span><span class="toc-page">__P_3_3__</span></div>
<div class="toc-row" style="padding-left: 40px;">3.3.1 Tahap 1: Problem Identification<span class="toc-dots"></span><span class="toc-page">__P_3_3_1__</span></div>
<div class="toc-row" style="padding-left: 40px;">3.3.2 Tahap 2: Data Acquisition / Data Ingestion<span class="toc-dots"></span><span class="toc-page">__P_3_3_2__</span></div>
<div class="toc-row" style="padding-left: 40px;">3.3.3 Tahap 3: Data Understanding & Quality Assessment<span class="toc-dots"></span><span class="toc-page">__P_3_3_3__</span></div>
<div class="toc-row" style="padding-left: 40px;">3.3.4 Tahap 4: Exploratory Data Analysis (EDA)<span class="toc-dots"></span><span class="toc-page">__P_3_3_4__</span></div>
<div class="toc-row" style="padding-left: 40px;">3.3.5 Tahap 5: Data Preprocessing NLP Bahasa Indonesia<span class="toc-dots"></span><span class="toc-page">__P_3_3_5__</span></div>
<div class="toc-row" style="padding-left: 40px;">3.3.6 Tahap 6: Data Transformation & Feature Engineering<span class="toc-dots"></span><span class="toc-page">__P_3_3_6__</span></div>
<div class="toc-row" style="padding-left: 40px;">3.3.7 Tahap 7: Data Preparation / Problem Representation<span class="toc-dots"></span><span class="toc-page">__P_3_3_7__</span></div>
<div class="toc-row" style="padding-left: 40px;">3.3.8 Tahap 8: AI Method / Algorithm Design & Perhitungan Manual<span class="toc-dots"></span><span class="toc-page">__P_3_3_8__</span></div>
<div class="toc-row" style="padding-left: 40px;">3.3.9 Tahap 9: Algorithm / Model Implementation<span class="toc-dots"></span><span class="toc-page">__P_3_3_9__</span></div>
<div class="toc-row" style="padding-left: 40px;">3.3.10 Tahap 10: Testing & Multi-Experimentation Scenarios<span class="toc-dots"></span><span class="toc-page">__P_3_3_10__</span></div>
<div class="toc-row" style="padding-left: 40px;">3.3.11 Tahap 11: Evaluation & Error Analysis<span class="toc-dots"></span><span class="toc-page">__P_3_3_11__</span></div>
<div class="toc-row" style="padding-left: 40px;">3.3.12 Tahap 12: Final Output, Web Deployment, & Online Learning<span class="toc-dots"></span><span class="toc-page">__P_3_3_12__</span></div>

<div class="toc-row" style="margin-top: 10px;"><strong>BAB IV PENGUJIAN DAN EVALUASI</strong><span class="toc-dots"></span><span class="toc-page">__P_BAB4__</span></div>
<div class="toc-row" style="padding-left: 20px;">4.1 Skenario dan Data Kasus Pengujian<span class="toc-dots"></span><span class="toc-page">__P_4_1__</span></div>
<div class="toc-row" style="padding-left: 20px;">4.2 Hasil Implementasi dan Output Sistem<span class="toc-dots"></span><span class="toc-page">__P_4_2__</span></div>
<div class="toc-row" style="padding-left: 20px;">4.3 Metrik Evaluasi Kinerja (Akurasi, F1, Precision, Recall)<span class="toc-dots"></span><span class="toc-page">__P_4_3__</span></div>
<div class="toc-row" style="padding-left: 20px;">4.4 Perbandingan Hasil 5 Eksperimen Model<span class="toc-dots"></span><span class="toc-page">__P_4_4__</span></div>
<div class="toc-row" style="padding-left: 20px;">4.5 Analisis Kesalahan (Error Analysis) & Keterbatasan Sistem<span class="toc-dots"></span><span class="toc-page">__P_4_5__</span></div>

<div class="toc-row" style="margin-top: 10px;"><strong>BAB V KESIMPULAN DAN SARAN</strong><span class="toc-dots"></span><span class="toc-page">__P_BAB5__</span></div>
<div class="toc-row" style="padding-left: 20px;">5.1 Kesimpulan Hasil Pengembangan Proyek<span class="toc-dots"></span><span class="toc-page">__P_5_1__</span></div>
<div class="toc-row" style="padding-left: 20px;">5.2 Ketercapaian Tujuan dan Manfaat Sistem<span class="toc-dots"></span><span class="toc-page">__P_5_2__</span></div>
<div class="toc-row" style="padding-left: 20px;">5.3 Hasil Evaluasi Metode Naive Bayes<span class="toc-dots"></span><span class="toc-page">__P_5_3__</span></div>
<div class="toc-row" style="padding-left: 20px;">5.4 Saran dan Arah Pengembangan Selanjutnya<span class="toc-dots"></span><span class="toc-page">__P_5_4__</span></div>

<div class="toc-row" style="margin-top: 10px;"><strong>DAFTAR PUSTAKA</strong><span class="toc-dots"></span><span class="toc-page">__P_DAPUS__</span></div>
<div class="toc-row"><strong>LAMPIRAN</strong><span class="toc-dots"></span><span class="toc-page">__P_LAMPIRAN__</span></div>

<!-- ==================================================================== -->
<!-- DAFTAR TABEL & GAMBAR                                                -->
<!-- ==================================================================== -->
<div class="page-break"></div>
<h1 class="chapter-title">DAFTAR TABEL</h1>
<div class="toc-row">Tabel 2.1: Spesifikasi Metadata Struktur Atribut Tabular Dataset PRDECT-ID<span class="toc-dots"></span><span class="toc-page">__T_2_1__</span></div>
<div class="toc-row">Tabel 2.2: Contoh Baris Data Tabular Korpus Ulasan Tokopedia PRDECT-ID<span class="toc-dots"></span><span class="toc-page">__T_2_2__</span></div>
<div class="toc-row">Tabel 3.1: Audit Kualitas Data Tabular Sebelum dan Sesudah Pembersihan<span class="toc-dots"></span><span class="toc-page">__T_3_1__</span></div>
<div class="toc-row">Tabel 3.2: Contoh Normalisasi Kata Gaul (Slang Words) Bahasa Indonesia<span class="toc-dots"></span><span class="toc-page">__T_3_2__</span></div>
<div class="toc-row">Tabel 3.3: Komparasi Matriks Fitur Teks Sebelum dan Sesudah N-Gram<span class="toc-dots"></span><span class="toc-page">__T_3_3__</span></div>
<div class="toc-row">Tabel 3.4: Pembagian Data Uji dan Latih Menggunakan Stratified Split<span class="toc-dots"></span><span class="toc-page">__T_3_4__</span></div>
<div class="toc-row">Tabel 3.5: Korpus Mini Sederhana untuk Simulasi Perhitungan Manual Bayes<span class="toc-dots"></span><span class="toc-page">__T_3_5__</span></div>
<div class="toc-row">Tabel 3.6: Frekuensi Kemunculan Kata pada Korpus Mini Sederhana<span class="toc-dots"></span><span class="toc-page">__T_3_6__</span></div>
<div class="toc-row">Tabel 3.7: Hasil Perhitungan Probabilitas Posterior Ulasan Uji Manual<span class="toc-dots"></span><span class="toc-page">__T_3_7__</span></div>
<div class="toc-row">Tabel 4.1: Classification Report Model Multinomial Naive Bayes Terpilih<span class="toc-dots"></span><span class="toc-page">__T_4_1__</span></div>
<div class="toc-row">Tabel 4.2: Confusion Matrix Pengujian Model (Test Set N=1.092)<span class="toc-dots"></span><span class="toc-page">__T_4_2__</span></div>
<div class="toc-row">Tabel 4.3: Perbandingan Komprehensif Kinerja 5 Eksperimen Model AI<span class="toc-dots"></span><span class="toc-page">__T_4_3__</span></div>
<div class="toc-row">Tabel 4.4: Sampel Analisis Kasus Misklasifikasi Model dan Diagnosa Akar Masalah<span class="toc-dots"></span><span class="toc-page">__T_4_4__</span></div>

<div class="page-break"></div>
<h1 class="chapter-title">DAFTAR GAMBAR</h1>
<div class="toc-row">Gambar 2.1: Grafik Distribusi Frekuensi dan Proporsi Kelas Sentimen PRDECT-ID<span class="toc-dots"></span><span class="toc-page">__G_2_1__</span></div>
<div class="toc-row">Gambar 3.1: Flowchart Pipeline Umum Pengembangan Artificial Intelligence (12 Tahapan)<span class="toc-dots"></span><span class="toc-page">__G_3_1__</span></div>
<div class="toc-row">Gambar 3.2: Flowchart Khusus Mekanisme Algoritma Multinomial Naive Bayes<span class="toc-dots"></span><span class="toc-page">__G_3_2__</span></div>
<div class="toc-row">Gambar 4.1: Visualisasi Confusion Matrix Model Terpilih (CountVec + MNB)<span class="toc-dots"></span><span class="toc-page">__G_4_1__</span></div>
<div class="toc-row">Gambar 4.2: Grafik Perbandingan Akurasi dan Macro F1-Score 5 Eksperimen Model<span class="toc-dots"></span><span class="toc-page">__G_4_2__</span></div>
<div class="toc-row">Gambar 4.3: Fitur Kata Paling Berpengaruh (Top Log-Likelihood Ratio Positif vs Negatif)<span class="toc-dots"></span><span class="toc-page">__G_4_3__</span></div>
<div class="toc-row">Gambar L.1: Tangkapan Layar Modul Analisis Sentimen Tunggal dengan Bukti Matematis<span class="toc-dots"></span><span class="toc-page">__G_L_1__</span></div>
<div class="toc-row">Gambar L.2: Tangkapan Layar Modul Pelacak Target KPI & Net Sentiment Score (NSS)<span class="toc-dots"></span><span class="toc-page">__G_L_2__</span></div>
<div class="toc-row">Gambar L.3: Tangkapan Layar Modul Peta Korpus 30 Kategori Produk Tokopedia<span class="toc-dots"></span><span class="toc-page">__G_L_3__</span></div>
<div class="toc-row">Gambar L.4: Tangkapan Layar Modul Komparasi Reputasi 2 Produk Berdampingan<span class="toc-dots"></span><span class="toc-page">__G_L_4__</span></div>

<!-- ==================================================================== -->
<!-- BAB I PENDAHULUAN                                                    -->
<!-- ==================================================================== -->
<div class="page-break"></div>
<h1 class="chapter-title">BAB I<br>PENDAHULUAN</h1>

<h2>1.1 Latar Belakang dan Permasalahan</h2>
<p>
Perkembangan pesat platform perdagangan elektronik (<em>e-commerce</em>) di Indonesia seperti Tokopedia, Shopee, dan Blibli telah mengubah lanskap interaksi antara penjual dan pembeli. Salah satu fitur krusial dalam platform tersebut adalah kolom ulasan pelanggan (<em>customer reviews</em>). Ulasan ini merefleksikan tingkat kepuasan, mutu fisik produk, ketepatan pengemasan, kecepatan pengiriman kurir, hingga kredibilitas penjual. Berdasarkan studi perilaku konsumen digital, lebih dari 88% calon konsumen membaca ulasan sebelum mengambil keputusan transaksi, dan pihak penjual maupun pengelola marketplace membutuhkan umpan balik tersebut untuk melakukan mitigasi komplain secara cepat.
</p>
<p>
Meskipun demikian, volume ulasan yang masuk setiap harinya mencapai puluhan ribu teks dengan variasi bahasa yang sangat heterogen. Ulasan konsumen Indonesia memiliki karakteristik unik: dominasi bahasa informal (slang/bahasa gaul), penggunaan singkatan tak terstandarisasi (misalnya: <em>"bgt"</em> untuk banget, <em>"yg"</em> untuk yang, <em>"tdk"</em> untuk tidak), keberadaan kalimat sarkasme, hingga ulasan dengan polaritas majemuk/kontrastif (misalnya: <em>"harga murah tetapi barangnya cepat rusak"</em>). Pemantauan dan pembacaan manual atas data ulasan ini mustahil dilakukan secara efisien, rentan terhadap bias subjektif manusia, serta lambat dalam mendeteksi lonjakan komplain produk cacat.
</p>
<p>
Oleh karena itu, diperlukan penerapan sistem <em>Artificial Intelligence</em> (AI) berbasis pemrosesan bahasa alami (<em>Natural Language Processing</em>/NLP) dan klasifikasi probabilistik yang mampu memproses data tabular ulasan secara otomatis, akurat, terukur, dan beroperasi secara <em>real-time</em>. Melalui proyek ini, dikembangkan sebuah sistem cerdas yang mengintegrasikan dataset tabular terbuka <strong>PRDECT-ID</strong> ke dalam model <strong>Multinomial Naive Bayes</strong> yang diperkaya dengan mekanisme penalaran kontekstual dan antarmuka web modern.
</p>

<h2>1.2 Tujuan Pengembangan Proyek</h2>
<p>Tujuan yang ingin dicapai dalam pengembangan proyek AI Tugas Besar ini adalah sebagai berikut:</p>
<ol>
  <li>Mengimplementasikan pipeline pengembangan AI yang sistematis dan terstruktur dari tahap identifikasi masalah, akuisisi data tabular, audit kualitas, EDA, pembersihan teks, rekayasa fitur n-gram, hingga pemodelan probabilistik.</li>
  <li>Memilih dan menerapkan algoritma <strong>Multinomial Naive Bayes</strong> dengan pembobotan ekstraksi fitur n-gram serta <em>Laplace Smoothing</em> untuk mengklasifikasikan sentimen ulasan produk ke dalam tiga kelas: <strong>Positif</strong>, <strong>Netral</strong>, dan <strong>Negatif</strong>.</li>
  <li>Mencapai target kinerja model dengan metrik <strong>Macro F1-Score &ge; 70%</strong> dan <strong>Akurasi &ge; 80%</strong> pada data uji terpisah (<em>stratified testing set</em>) guna menjamin keandalan klasifikasi terhadap kelas minoritas (Netral).</li>
  <li>Mengembangkan fitur <strong>Online Incremental Learning</strong> menggunakan algoritma <code>partial_fit</code> agar model dapat beradaptasi secara dinamis terhadap kosakata dan ulasan baru tanpa harus melakukan pelatihan ulang penuh dari awal.</li>
  <li>Mengintegrasikan hasil pemodelan ke dalam aplikasi web interaktif yang siap pakai (<em>production-ready</em>) menggunakan arsitektur backend Python Flask dan frontend React SPA, dilengkapi modul komparasi reputasi produk dan pelacak <em>Net Sentiment Score</em> (NSS).</li>
</ol>

<h2>1.3 Deskripsi Singkat Sistem AI yang Dibangun</h2>
<p>
Sistem AI yang dibangun diberi nama <strong>"Sentimen Platform Analitik E-Commerce Indonesia"</strong>. Sistem ini merupakan platform analitik sentimen berbasis web terintegrasi yang dirancang untuk membantu penjual, analis bisnis, dan pengambil keputusan e-commerce. Sistem menerima input berupa teks ulasan tunggal, input berkas batch berformat CSV/Excel, maupun parameter URL produk. Pipeline AI di sisi server akan memproses teks tersebut melalui serangkaian normalisasi linguistik, mengekstraksi token unigram dan bigram, menghitung probabilitas log-likelihood posterior Naive Bayes, mengevaluasi aturan konjungsi kontrastif, serta menghasilkan output prediksi sentimen beserta skor keyakinan persentase (<em>confidence probability</em>).
</p>
<p>
Sistem juga menyajikan bukti matematis kontribusi bobot setiap kata, deteksi aspek produk (kualitas barang, layanan penjual, akurasi pesanan, pengemasan, dan harga), pemetaan emosi sekunder (<em>Happy, Sadness, Anger, Fear, Love</em>), pemantauan KPI korpus 30 kategori produk Tokopedia, serta tombol interaktif <em>Panduan Sidang</em> berikon tanda tanya (<strong>"?"</strong>) pada seluruh modul guna mempermudah pemahaman konsep teoritis saat presentasi dan evaluasi akademik.
</p>

<h2>1.4 Metode / Algoritma AI yang Dipilih dan Alasan Pemilihan</h2>
<p>
Dalam ruang lingkup materi perkuliahan Kecerdasan Buatan, proyek ini memilih ranah <strong>Reasoning Under Uncertainty (Pengambilan Keputusan Probabilistik)</strong> yang dikombinasikan dengan <strong>Machine Learning Tabular & Text Classification</strong> menggunakan algoritma <strong>Multinomial Naive Bayes (MNB)</strong>. Alasan ilmiah dan praktis pemilihan algoritma ini meliputi:
</p>
<ol>
  <li><strong>Kesesuaian Karakteristik Data Tekstual:</strong> Distribusi Multinomial sangat ideal untuk data diskrit yang merepresentasikan frekuensi kemunculan kata (<em>term frequencies</em>) di dalam sebuah dokumen ulasan.</li>
  <li><strong>Efisiensi Komputasi dan Latensi Rendah:</strong> Waktu pelatihan (<em>training time</em>) dan inferensi (<em>prediction time</em>) Naive Bayes beroperasi dalam kompleksitas linier O(N &times; |V|), menghasilkan respon inferensi sub-detik (&lt; 20 ms) yang sangat krusial untuk aplikasi web skala produksi.</li>
  <li><strong>Ketahanan terhadap Dimensi Tinggi:</strong> Ruang fitur teks bahasa Indonesia dengan unigram dan bigram menghasilkan matriks berdimensi ribuan kolom. Naive Bayes terbukti secara empiris memiliki performa tinggi pada ruang dimensi besar (<em>high-dimensional sparsity</em>) tanpa mengalami <em>overfitting</em> separah model regresi linier tanpa penalti.</li>
  <li><strong>Dukungan Incremental Learning:</strong> Multinomial Naive Bayes memiliki sifat matematis aditif pada penghitungan frekuensi kata, sehingga mendukung metode <code>partial_fit()</code> untuk pembelajaran berlanjut secara <em>real-time</em> saat menerima data umpan balik baru.</li>
  <li><strong>Transparansi dan Keterjelasan (Explainable AI):</strong> Setiap keputusan klasifikasi dapat diuraikan secara transparan melalui penjumlahan log-likelihood tiap kata, sehingga pengguna dapat memahami secara pasti kata mana yang mendorong keputusan model.</li>
</ol>

<h2>1.5 Batasan Masalah dan Ruang Lingkup</h2>
<p>Batasan masalah dalam pelaksanaan proyek tugas besar ini ditetapkan sebagai berikut:</p>
<ol>
  <li>Data yang digunakan bersumber dari dataset tabular terbuka PRDECT-ID yang berfokus pada ulasan produk e-commerce Indonesia (khususnya marketplace Tokopedia).</li>
  <li>Teks ulasan yang diolah berbahasa Indonesia, termasuk ragam bahasa percakapan sehari-hari dan istilah teknis belanja online.</li>
  <li>Kelas klasifikasi utama dibatasi pada 3 (tiga) kategori sentimen: <strong>Positif</strong>, <strong>Netral</strong>, dan <strong>Negatif</strong>.</li>
  <li>Algoritma utama yang diimplementasikan adalah Multinomial Naive Bayes, dengan eksperimen pembanding menggunakan Complement Naive Bayes serta variasi representasi vektor TF-IDF dan CountVectorizer.</li>
</ol>

<!-- ==================================================================== -->
<!-- BAB II DATASET DAN PERMASALAHAN                                      -->
<!-- ==================================================================== -->
<div class="page-break"></div>
<h1 class="chapter-title">BAB II<br>DATASET DAN PERMASALAHAN</h1>

<h2>2.1 Deskripsi Dataset dan Sumber Pengambilan Data</h2>
<p>
Dataset yang digunakan dalam penelitian tugas besar ini adalah <strong>PRDECT-ID</strong> (<em>Product Review Dataset for Indonesian E-Commerce Sentiment and Emotion Classification</em>). PRDECT-ID merupakan dataset benchmark akademik terbuka yang dikumpulkan dari ulasan produk nyata di platform marketplace Tokopedia. Dataset ini dapat diakses secara publik melalui platform repositori dataset sains terbuka (Kaggle dan GitHub). Dataset ini sepenuhnya berbasis data terstruktur (tabular) yang disimpan dalam format berkas <code>.csv</code> dengan pemisah koma.
</p>
<p>
Pemilihan dataset ini memenuhi seluruh ketentuan penugasan: bersumber dari portal data terbuka, berbentuk tabular dengan baris dan kolom yang terstruktur rapi, tidak mengandung elemen citra/video, serta memiliki atribut yang sangat relevan dengan permasalahan sentimen dan analitik bisnis perdagangan elektronik.
</p>

<h2>2.2 Dimensi Data, Atribut, dan Tipe Data Tabular</h2>
<p>
Dataset PRDECT-ID yang diakuisisi memiliki total <strong>5.459 baris data</strong> (setelah penggabungan dan sinkronisasi sampel korpus) dengan <strong>11 atribut tabular</strong>. Struktur tipe data terdiri atas kombinasi tipe numerik kontinu (<em>float64</em>), numerik diskrit (<em>int64</em>), dan teks kategorikal/objek (<em>string</em>).
</p>

<div class="caption-table">Tabel 2.1: Spesifikasi Metadata Struktur Atribut Tabular Dataset PRDECT-ID</div>
<table class="academic-table">
  <thead>
    <tr>
      <th width="5%">No</th>
      <th width="20%">Nama Atribut</th>
      <th width="15%">Tipe Data</th>
      <th width="25%">Rentang / Contoh Nilai</th>
      <th width="35%">Keterangan Fungsi</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td><code>Category</code></td>
      <td>String / Categorical</td>
      <td>30 Subkategori (Komputer, Fashion, Handphone, dll)</td>
      <td>Taksonomi pengelompokan jenis barang belanjaan.</td>
    </tr>
    <tr>
      <td>2</td>
      <td><code>Product Name</code></td>
      <td>String / Text</td>
      <td>"SSD NVMe Samsung 980 Pro", "Kaos Polos", dll</td>
      <td>Identitas nama barang yang diulas pelanggan.</td>
    </tr>
    <tr>
      <td>3</td>
      <td><code>Location</code></td>
      <td>String / Categorical</td>
      <td>Jakarta Barat, Surabaya, Bandung, dll</td>
      <td>Wilayah asal toko/penjual produk.</td>
    </tr>
    <tr>
      <td>4</td>
      <td><code>Price</code></td>
      <td>Integer (IDR)</td>
      <td>Rp 1.000 s/d Rp 45.000.000</td>
      <td>Harga satuan produk dalam mata uang Rupiah.</td>
    </tr>
    <tr>
      <td>5</td>
      <td><code>Overall Rating</code></td>
      <td>Float (1.0 - 5.0)</td>
      <td>4.5, 4.8, 5.0</td>
      <td>Nilai reputasi agregat toko secara keseluruhan.</td>
    </tr>
    <tr>
      <td>6</td>
      <td><code>Number Sold</code></td>
      <td>Integer</td>
      <td>0 s/d 50.000+</td>
      <td>Total akumulasi kuantitas barang yang terjual.</td>
    </tr>
    <tr>
      <td>7</td>
      <td><code>Total Review</code></td>
      <td>Integer</td>
      <td>0 s/d 15.000+</td>
      <td>Total ulasan yang telah terkumpul pada produk.</td>
    </tr>
    <tr>
      <td>8</td>
      <td><code>Customer Rating</code></td>
      <td>Integer (1 - 5)</td>
      <td>1, 2, 3, 4, 5 (Bintang)</td>
      <td>Rating kepuasan spesifik yang diberikan pengulas.</td>
    </tr>
    <tr>
      <td>9</td>
      <td><code>Customer Review</code></td>
      <td>String / Text</td>
      <td>"Barang bagus, pengiriman cepat, packing rapi..."</td>
      <td>Teks opini subjektif ulasan pelanggan (Fitur Utama).</td>
    </tr>
    <tr>
      <td>10</td>
      <td><code>Sentiment</code></td>
      <td>String / Label</td>
      <td>'Positive', 'Neutral', 'Negative'</td>
      <td><strong>Target Label Utama</strong> (Ground Truth Klasifikasi).</td>
    </tr>
    <tr>
      <td>11</td>
      <td><code>Emotion</code></td>
      <td>String / Label</td>
      <td>'Happy', 'Sadness', 'Anger', 'Fear', 'Love'</td>
      <td>Klasifikasi emosi psikologis sekunder pengulas.</td>
    </tr>
  </tbody>
</table>

<h2>2.3 Penjelasan Fungsi Atribut Tabular dan Korelasi Bisnis</h2>
<p>
Keberadaan atribut tabular numerik dan kategorikal pada PRDECT-ID memberikan dimensi analitik yang sangat kaya:
</p>
<ul>
  <li><strong>Atribut Teks Ulasan (<code>Customer Review</code>):</strong> Merupakan sumber informasi semantik utama yang diekstrak untuk menangkap polaritas sentimen kata per kata.</li>
  <li><strong>Atribut Rating Bintang (<code>Customer Rating</code>):</strong> Berkorelasi kuat dengan polaritas sentimen; rating 4-5 umumnya mencerminkan sentimen positif, rating 3 mencerminkan ulasan netral atau saran perbaikan, sedangkan rating 1-2 merefleksikan sentimen negatif atau kekecewaan mendalam.</li>
  <li><strong>Atribut Kategori & Harga (<code>Category</code> & <code>Price</code>):</strong> Memungkinkan sistem memetakan tingkat kepuasan pelanggan lintas sektor industri (misalnya membandingkan sektor Elektronik dengan Fashion) serta mengkaji apakah produk dengan harga tinggi memiliki ekspektasi kualitas yang lebih ketat.</li>
  <li><strong>Atribut Emosi (<code>Emotion</code>):</strong> Membantu manajemen mendeteksi keluhan berisiko tinggi. Sebagai contoh, ulasan negatif dengan emosi <em>Anger</em> (marah) diprioritaskan untuk penanganan komplain segera (SLA tanggap darurat).</li>
</ul>

<h2>2.4 Identifikasi Variabel Input (X) dan Target/Label (y)</h2>
<p>
Dalam perumusan tugas <em>Supervised Machine Learning</em> berbasis data tabular teks ulasan:
</p>
<ul>
  <li><strong>Variabel Input Bebas (X):</strong> Teks ulasan pada kolom <code>Customer Review</code> yang ditransformasikan melalui pipeline preprocessing dan ekstraksi fitur n-gram menjadi matriks frekuensi numerik berdimensi N &times; |V|, di mana N adalah jumlah dokumen dan |V| adalah jumlah kosakata unik.</li>
  <li><strong>Variabel Target Terikat (y):</strong> Label kelas kategorikal pada kolom <code>Sentiment</code> yang telah distandarisasi ke dalam 3 kelas:
    <div class="formula-center">C = {'positif', 'netral', 'negatif'}</div>
  </li>
</ul>

<h2>2.5 Contoh Data dan Visualisasi Distribusi Awal Korpus</h2>
<p>
Berikut disajikan sampel baris nyata dari dataset PRDECT-ID untuk mengilustrasikan keberagaman teks ulasan pelanggan belanja online Indonesia:
</p>

<div class="caption-table">Tabel 2.2: Contoh Baris Data Tabular Korpus Ulasan Tokopedia PRDECT-ID</div>
<table class="academic-table">
  <thead>
    <tr>
      <th>Category</th>
      <th>Product Name</th>
      <th>Price</th>
      <th>Rating</th>
      <th>Customer Review</th>
      <th>Sentiment</th>
      <th>Emotion</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Computers & Laptops</td>
      <td>SSD NVMe M.2 512GB</td>
      <td>Rp 650.000</td>
      <td>5</td>
      <td>Alhamdulillah berfungsi dengan baik. Packaging rapi dan pengiriman kilat!</td>
      <td><strong>Positif</strong></td>
      <td>Happy</td>
    </tr>
    <tr>
      <td>Handphone & Tablet</td>
      <td>Tempered Glass Full Cover</td>
      <td>Rp 25.000</td>
      <td>3</td>
      <td>Pengiriman standar, barang pas dipasang agak gelembung dikit tp lumayan lah</td>
      <td><strong>Netral</strong></td>
      <td>Sadness</td>
    </tr>
    <tr>
      <td>Perawatan Tubuh</td>
      <td>Lux Hand Sanitizer 50ml</td>
      <td>Rp 12.000</td>
      <td>1</td>
      <td>tidak ada tutupnya,walaupun saya beli harga murah tp jadi gabisa dibawa kemana mana karna barang rusak</td>
      <td><strong>Negatif</strong></td>
      <td>Anger</td>
    </tr>
  </tbody>
</table>

<p>
Berdasarkan audit sebaran kelas pada keseluruhan 5.459 sampel data, proporsi kelas terdistribusi sebagai berikut: kelas <strong>Positif sebanyak 2.517 sampel (46,1%)</strong>, kelas <strong>Negatif sebanyak 2.329 sampel (42,7%)</strong>, dan kelas <strong>Netral sebanyak 613 sampel (11,2%)</strong>. Distribusi ini divisualisasikan secara komparatif pada Gambar 2.1.
</p>

<div class="figure-container">
  <img src="__IMG_CLASS_DIST__" class="figure-img" alt="Distribusi Kelas Sentimen">
  <div class="caption-figure">Gambar 2.1: Grafik Distribusi Frekuensi dan Proporsi Kelas Sentimen Korpus PRDECT-ID (N=5.459)</div>
</div>

<h2>2.6 Keterkaitan Dataset dengan Penyelesaian Permasalahan</h2>
<p>
Dataset PRDECT-ID memiliki relevansi tinggi dengan permasalahan yang diangkat karena:
</p>
<ol>
  <li><strong>Mencerminkan Realitas Bahasa Nyata:</strong> Karakteristik teks yang penuh dengan ragam kolokial, istilah produk, dan ekspresi emosional menjadikannya representasi tepat untuk menguji ketangguhan metode NLP probabilistik.</li>
  <li><strong>Keseimbangan Positif-Negatif:</strong> Keseimbangan jumlah ulasan positif (46,1%) dan negatif (42,7%) memungkinkan model mempelajari batas keputusan (<em>decision boundary</em>) antara kepuasan dan komplain secara adil dan objektif.</li>
  <li><strong>Tantangan Kelas Minoritas (Netral):</strong> Proporsi kelas Netral yang hanya 11,2% menghadirkan tantangan nyata dalam penanganan <em>class imbalance</em>. Hal ini menuntut pemilihan metrik evaluasi yang tepat (Macro F1-Score) agar performa pada kelas minoritas tidak terabaikan oleh dominasi kelas mayoritas.</li>
</ol>

<!-- ==================================================================== -->
<!-- BAB III PIPELINE PENGEMBANGAN AI                                     -->
<!-- ==================================================================== -->
<div class="page-break"></div>
<h1 class="chapter-title">BAB III<br>PIPELINE PENGEMBANGAN ARTIFICIAL INTELLIGENCE</h1>

<h2>3.1 Flowchart Pipeline Umum Pengembangan AI (12 Tahapan Sistematis)</h2>
<p>
Sesuai instruksi baku tugas besar, arsitektur pengembangan AI dirancang secara bertingkat dan berkesinambungan mencakup 12 tahapan utama dari formulasi masalah hingga penyajian sistem akhir. Setiap tahapan memiliki input, proses komputasi, dan luaran spesifik yang terdokumentasi. Alur kerja sistematis ini diilustrasikan pada Gambar 3.1.
</p>

<div class="figure-container">
  <img src="__IMG_PIPE_FLOW__" class="figure-img" alt="Flowchart Pipeline Umum">
  <div class="caption-figure">Gambar 3.1: Flowchart Pipeline Umum Pengembangan AI (12 Tahapan Sistematis End-to-End)</div>
</div>

<div class="page-break"></div>
<h2>3.2 Flowchart Khusus Mekanisme Algoritma Multinomial Naive Bayes</h2>
<p>
Untuk memahami secara mendalam cara kerja komputasi internal dari model AI yang dipilih, disusun flowchart khusus mekanisme algoritma <strong>Multinomial Naive Bayes</strong> yang diperkaya dengan tahapan prapemrosesan teks, pembentukan vektor n-gram, kalkulasi prior dan likelihood dengan <em>Laplace Smoothing</em>, evaluasi aturan konjungsi kalimat kontrastif, hingga pembaruan inkremental secara <em>real-time</em> (Gambar 3.2).
</p>

<div class="figure-container">
  <img src="__IMG_NB_FLOW__" class="figure-img" alt="Flowchart Khusus Algoritma Naive Bayes">
  <div class="caption-figure">Gambar 3.2: Flowchart Khusus Mekanisme Algoritma Multinomial Naive Bayes dan Inferensi Log-Likelihood</div>
</div>

<div class="page-break"></div>
<h2>3.3 Penjelasan Rinci 12 Tahapan Pipeline Pengembangan AI</h2>
<p>
Setiap tahapan dalam pipeline pengembangan di bawah ini diuraikan secara komprehensif mengikuti 3 (tiga) komponen wajib: <strong>(A) Konsep dan Teori / Perhitungan Manual</strong>, <strong>(B) Implementasi Coding beserta Penjelasan Singkat</strong>, dan <strong>(C) Hasil Visualisasi serta Analisis</strong>.
</p>

<!-- TAHAP 1 -->
<div class="stage-section">
  <h3>3.3.1 Tahap 1: Problem Identification (Identifikasi Masalah)</h3>
  <h4>A. Konsep dan Teori</h4>
  <p>
  Tahap awal berfokus pada perumusan kebutuhan bisnis dan ilmiah. Dalam domain e-commerce, ulasan pelanggan adalah sinyal vital reputasi. Masalah diklasifikasikan sebagai <em>Supervised Multi-Class Text Classification</em> dengan 3 kelas target. Pengguna sasaran adalah pemilik toko, analis produk, dan pembeli yang memerlukan rekapitulasi sentimen instan tanpa harus membaca ribuan ulasan manual.
  </p>
  <h4>B. Implementasi Coding</h4>
  <p>
  Perumusan kriteria SLA diwujudkan dalam konfigurasi KPI pada modul backend analitik (<code>backend/app/main.py</code>):
  </p>
  <div class="code-box"><span class="code-comment"># Konfigurasi Target SLA dan Batas Kinerja Sistem (main.py)</span>
KPI_TARGETS = {
    <span class="code-string">"target_macro_f1"</span>: <span class="code-num">0.70</span>,          <span class="code-comment"># Target ambang batas F1-Score &gt;= 70%</span>
    <span class="code-string">"target_accuracy"</span>: <span class="code-num">0.80</span>,          <span class="code-comment"># Target akurasi pengujian &gt;= 80%</span>
    <span class="code-string">"max_critical_anger_ratio"</span>: <span class="code-num">0.15</span>, <span class="code-comment"># Ambang batas komplain emosi marah &lt;= 15%</span>
    <span class="code-string">"target_nss_score"</span>: <span class="code-num">0.0</span>           <span class="code-comment"># Net Sentiment Score harus bernilai positif</span>
}</div>
  <h4>C. Hasil dan Analisis</h4>
  <p>
  Berhasil ditetapkan acuan pengujian yang jelas: sistem harus menghasilkan model dengan Macro F1-Score &ge; 70% pada data uji terstratifikasi, mendukung respons inferensi di bawah 50 milidetik, serta menyediakan metrik operasional Net Sentiment Score (NSS) untuk analitik bisnis.
  </p>
</div>

<!-- TAHAP 2 -->
<div class="stage-section">
  <h3>3.3.2 Tahap 2: Data Acquisition / Ingestion (Akuisisi Data)</h3>
  <h4>A. Konsep dan Teori</h4>
  <p>
  Akuisisi data melibatkan pemuatan berkas tabular terstruktur dari repositori terbuka PRDECT-ID ke dalam struktur memori DataFrame Python menggunakan library <code>pandas</code>. Verifikasi integritas data dilakukan untuk memastikan jumlah baris, pemisah kolom, dan representasi karakter UTF-8 terpelihara secara presisi.
  </p>
  <h4>B. Implementasi Coding</h4>
  <div class="code-box"><span class="code-keyword">import</span> pandas <span class="code-keyword">as</span> pd

<span class="code-comment"># Memuat dataset tabular mentah ulasan e-commerce</span>
raw_df = pd.read_csv(<span class="code-string">"data/raw/prdect_id_tokopedia.csv"</span>, encoding=<span class="code-string">"utf-8"</span>)
print(f"Dimensi Awal: {raw_df.shape[0]} baris, {raw_df.shape[1]} kolom")
print(raw_df.head(3)[[<span class="code-string">"Product Name"</span>, <span class="code-string">"Customer Rating"</span>, <span class="code-string">"Customer Review"</span>, <span class="code-string">"Sentiment"</span>]])</div>
  <h4>C. Hasil dan Analisis</h4>
  <p>
  Sebanyak 5.400 baris data dari berkas mentah PRDECT-ID berhasil dimuat secara lengkap. Setelah penggabungan sampel validasi korpus terverifikasi, jumlah data final mencapai 5.459 baris dengan 11 kolom tanpa kegagalan encoding huruf.
  </p>
</div>

<!-- TAHAP 3 -->
<div class="stage-section">
  <h3>3.3.3 Tahap 3: Data Understanding & Quality Assessment (Audit Kualitas)</h3>
  <h4>A. Konsep dan Teori</h4>
  <p>
  Pemeriksaan kualitas data mencakup identifikasi nilai kosong (<em>missing values</em> / <code>NaN</code>), data duplikat yang berpotensi menyebabkan bias memori, inkonsistensi penamaan label kelas (misal huruf kapital vs kecil), serta keberadaan teks ulasan yang hanya berupa deretan spasi atau karakter non-alfanumerik.
  </p>
  <h4>B. Implementasi Coding</h4>
  <div class="code-box"><span class="code-comment"># Audit missing values, duplikasi, dan standardisasi label</span>
missing_counts = raw_df.isnull().sum()
duplicate_count = raw_df.duplicated(subset=[<span class="code-string">"Customer Review"</span>]).sum()

<span class="code-comment"># Standarisasi nilai target sentiment ke format huruf kecil konsisten</span>
raw_df[<span class="code-string">"Sentiment"</span>] = raw_df[<span class="code-string">"Sentiment"</span>].astype(str).str.strip().str.lower()
clean_df = raw_df.dropna(subset=[<span class="code-string">"Customer Review"</span>, <span class="code-string">"Sentiment"</span>])
clean_df = clean_df.drop_duplicates(subset=[<span class="code-string">"Customer Review"</span>])</div>
  <h4>C. Hasil dan Analisis</h4>
  <div class="caption-table">Tabel 3.1: Audit Kualitas Data Tabular Sebelum dan Sesudah Pembersihan</div>
  <table class="academic-table">
    <thead>
      <tr>
        <th>Parameter Kualitas Data</th>
        <th>Kondisi Sebelum Pembersihan</th>
        <th>Kondisi Sesudah Pembersihan</th>
        <th>Tindakan Remediasi</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Missing Values (NaN pada Ulasan)</td>
        <td>12 baris (0,22%)</td>
        <td>0 baris (0,00%)</td>
        <td>Penghapusan baris (listwise deletion) karena teks adalah input vital.</td>
      </tr>
      <tr>
        <td>Data Duplikat Eksak</td>
        <td>38 baris (0,70%)</td>
        <td>0 baris (0,00%)</td>
        <td>Deduping guna mencegah kebocoran data (<em>data leakage</em>) ke set uji.</td>
      </tr>
      <tr>
        <td>Inkonsistensi Huruf Label</td>
        <td>'Positive', 'negative', 'Positif'</td>
        <td>'positif', 'netral', 'negatif'</td>
        <td>Standardisasi lowercase dan translasi label ke Bahasa Indonesia baku.</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- TAHAP 4 -->
<div class="stage-section">
  <h3>3.3.4 Tahap 4: Exploratory Data Analysis (EDA)</h3>
  <h4>A. Konsep dan Teori</h4>
  <p>
  Eksplorasi data bertujuan memahami karakteristik distribusi panjang teks, perbandingan rating bintang terhadap sentimen, dan statistik ringkasan korpus. Analisis ini memberikan intuisi linguistik mengenai pola kata yang mendominasi ulasan positif dan ulasan negatif.
  </p>
  <h4>B. Implementasi Coding</h4>
  <div class="code-box"><span class="code-comment"># Analisis statistik panjang kata ulasan per kelas</span>
clean_df[<span class="code-string">"word_count"</span>] = clean_df[<span class="code-string">"Customer Review"</span>].apply(<span class="code-keyword">lambda</span> x: len(str(x).split()))
stats = clean_df.groupby(<span class="code-string">"Sentiment"</span>)[<span class="code-string">"word_count"</span>].describe()
print(stats[[<span class="code-string">"mean"</span>, <span class="code-string">"std"</span>, <span class="code-string">"min"</span>, <span class="code-string">"50%"</span>, <span class="code-string">"max"</span>]])</div>
  <h4>C. Hasil dan Analisis</h4>
  <p>
  Ulasan negatif memiliki rata-rata panjang kata lebih tinggi (rata-rata 18,4 kata per ulasan) dibandingkan ulasan positif (rata-rata 11,2 kata). Hal ini secara psikologis menunjukkan bahwa konsumen yang merasa kecewa cenderung menuliskan kronologi komplain yang lebih panjang dan detail mengenai kerusakan barang atau keterlambatan pengiriman.
  </p>
</div>

<!-- TAHAP 5 -->
<div class="stage-section">
  <h3>3.3.5 Tahap 5: Data Preprocessing NLP Bahasa Indonesia</h3>
  <h4>A. Konsep dan Teori</h4>
  <p>
  Tahap preprocessing membersihkan noise dan menstandarisasi ragam bahasa Indonesia. Urutan tahapan:
  </p>
  <ol>
    <li><em>Case Folding:</em> Mengubah seluruh karakter ke huruf kecil (lowercase).</li>
    <li><em>Regex Cleaning:</em> Menghapus URL, hashtag, mention, tanda baca, simbol aneh, dan angka numerik.</li>
    <li><em>Slang Word Normalization:</em> Mengganti singkatan atau kata gaul dengan bentuk bakunya menggunakan kamus leksikal (misal: <em>"yg"</em> &rarr; <em>"yang"</em>, <em>"ga"</em> &rarr; <em>"tidak"</em>).</li>
    <li><em>Selective Stopword Removal:</em> Menghapus kata hubung netral namun <strong>tetap mempertahankan</strong> kata negasi penting (seperti <em>"tidak"</em>, <em>"bukan"</em>, <em>"jangan"</em>, <em>"kurang"</em>) karena kata-kata ini membalikkan polaritas sentimen secara drastis.</li>
  </ol>
  <h4>B. Implementasi Coding</h4>
  <div class="code-box"><span class="code-keyword">import</span> re

SLANG_DICT = {
    <span class="code-string">"bgt"</span>: <span class="code-string">"banget"</span>, <span class="code-string">"yg"</span>: <span class="code-string">"yang"</span>, <span class="code-string">"gak"</span>: <span class="code-string">"tidak"</span>, <span class="code-string">"ga"</span>: <span class="code-string">"tidak"</span>,
    <span class="code-string">"tp"</span>: <span class="code-string">"tetapi"</span>, <span class="code-string">"bkn"</span>: <span class="code-string">"bukan"</span>, <span class="code-string">"tdk"</span>: <span class="code-string">"tidak"</span>, <span class="code-string">"sdh"</span>: <span class="code-string">"sudah"</span>,
    <span class="code-string">"dgn"</span>: <span class="code-string">"dengan"</span>, <span class="code-string">"krn"</span>: <span class="code-string">"karena"</span>, <span class="code-string">"baguuus"</span>: <span class="code-string">"bagus"</span>
}

<span class="code-keyword">def</span> preprocess_indonesian_text(text):
    text = str(text).lower()
    text = re.sub(r"http\S+|www\S+|https\S+", " ", text)
    text = re.sub(r"[^a-zA-Z\s]", " ", text)
    words = [SLANG_DICT.get(w, w) <span class="code-keyword">for</span> w <span class="code-keyword">in</span> text.split()]
    <span class="code-keyword">return</span> <span class="code-string">" "</span>.join(words)</div>
  <h4>C. Hasil dan Analisis</h4>
  <div class="caption-table">Tabel 3.2: Contoh Normalisasi Kata Gaul (Slang Words) Bahasa Indonesia</div>
  <table class="academic-table">
    <thead>
      <tr>
        <th>Teks Ulasan Mentah Asli</th>
        <th>Teks Hasil Preprocessing</th>
        <th>Analisis Manfaat Preprocessing</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>"barang bgs bgt!! respon sellernya cpt bgt packing rapih"</td>
        <td>"barang bagus banget respon seller cepat banget packing rapi"</td>
        <td>Menyatukan sinonim leksikal ke token baku sehingga frekuensi fitur tidak terfragmentasi.</td>
      </tr>
      <tr>
        <td>"kecewa parah, brg rusak ga bs nyala sm sekali!! tp toko ga respon"</td>
        <td>"kecewa parah barang rusak tidak bisa nyala sama sekali tetapi toko tidak respon"</td>
        <td>Mempertahankan kata negasi <em>'tidak'</em> dan konjungsi <em>'tetapi'</em> untuk penalaran kontekstual.</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- TAHAP 6 -->
<div class="stage-section">
  <h3>3.3.6 Tahap 6: Data Transformation & Feature Engineering</h3>
  <h4>A. Konsep dan Teori</h4>
  <p>
  Teks yang telah bersih ditransformasikan ke dalam representasi numerik menggunakan <strong>CountVectorizer</strong> dengan skema n-gram gabungan (unigram dan bigram, range 1-2). Penggunaan unigram mengekstrak kata tunggal (misal: <em>"bagus"</em>), sedangkan bigram menangkap pasangan dua kata berurutan yang sangat esensial untuk membedakan negasi (misal: <em>"tidak bagus"</em>, <em>"kurang rapi"</em>).
  </p>
  <h4>B. Implementasi Coding</h4>
  <div class="code-box"><span class="code-keyword">from</span> sklearn.feature_extraction.text <span class="code-keyword">import</span> CountVectorizer

<span class="code-comment"># Inisialisasi CountVectorizer unigram + bigram</span>
vectorizer = CountVectorizer(
    ngram_range=(<span class="code-num">1</span>, <span class="code-num">2</span>),
    min_df=<span class="code-num">2</span>,            <span class="code-comment"># Mengabaikan kata langka typo (muncul &lt; 2 kali)</span>
    max_df=<span class="code-num">0.85</span>          <span class="code-comment"># Mengabaikan korpus umum (muncul di &gt; 85% dokumen)</span>
)
X_matrix = vectorizer.fit_transform(clean_df[<span class="code-string">"cleaned_text"</span>])
print(f"Jumlah Kosakata Fitur Unik (Vocabulary Size): {len(vectorizer.vocabulary_)} fitur")</div>
  <h4>C. Hasil dan Analisis</h4>
  <div class="caption-table">Tabel 3.3: Komparasi Matriks Fitur Teks Sebelum dan Sesudah N-Gram</div>
  <table class="academic-table">
    <thead>
      <tr>
        <th>Skema Vektorisasi</th>
        <th>Ukuran Vocabulary (|V|)</th>
        <th>Kemampuan Menangkap Negasi</th>
        <th>Dampak pada Model</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Unigram Saja (1, 1)</td>
        <td>4.120 fitur</td>
        <td>Rendah (kata <em>"tidak"</em> dan <em>"bagus"</em> terpisah)</td>
        <td>Sering terjadi salah klasifikasi pada kalimat sindiran/negasi.</td>
      </tr>
      <tr>
        <td><strong>Unigram + Bigram (1, 2)</strong></td>
        <td><strong>14.890 fitur</strong></td>
        <td><strong>Tinggi (menangkap frasa <em>"tidak bagus"</em> secara utuh)</strong></td>
        <td><strong>Meningkatkan akurasi klasifikasi ulasan kompleks sebesar +2,8%.</strong></td>
      </tr>
    </tbody>
  </table>
</div>

<!-- TAHAP 7 -->
<div class="stage-section">
  <h3>3.3.7 Tahap 7: Data Preparation & Stratified Train-Test Split</h3>
  <h4>A. Konsep dan Teori</h4>
  <p>
  Untuk menguji kemampuan generalisasi model secara adil dan mencegah bias data (<em>data leakage</em>), dataset dibagi menjadi <strong>Data Latih (Training Set - 80%)</strong> dan <strong>Data Uji (Testing Set - 20%)</strong>. Pembagian wajib menggunakan teknik <strong>Stratified Splitting</strong> agar proporsi kelas minoritas (Netral 11,2%) tetap identik di kedua subset data.
  </p>
  <h4>B. Implementasi Coding</h4>
  <div class="code-box"><span class="code-keyword">from</span> sklearn.model_selection <span class="code-keyword">import</span> train_test_split

X = clean_df[<span class="code-string">"cleaned_text"</span>]
y = clean_df[<span class="code-string">"Sentiment"</span>]

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=<span class="code-num">0.20</span>,
    random_state=<span class="code-num">42</span>,
    stratify=y          <span class="code-comment"># Menjamin distribusi rasio kelas tetap proporsional</span>
)</div>
  <h4>C. Hasil dan Analisis</h4>
  <div class="caption-table">Tabel 3.4: Pembagian Data Uji dan Latih Menggunakan Stratified Split</div>
  <table class="academic-table">
    <thead>
      <tr>
        <th>Subset Data</th>
        <th>Jumlah Sampel</th>
        <th>Positif</th>
        <th>Negatif</th>
        <th>Netral</th>
        <th>Persentase</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Training Set</td>
        <td>4.367</td>
        <td>2.014 (46,1%)</td>
        <td>1.863 (42,7%)</td>
        <td>490 (11,2%)</td>
        <td>80,0%</td>
      </tr>
      <tr>
        <td>Testing Set</td>
        <td>1.092</td>
        <td>503 (46,1%)</td>
        <td>466 (42,7%)</td>
        <td>123 (11,2%)</td>
        <td>20,0%</td>
      </tr>
      <tr>
        <td><strong>Total Korpus</strong></td>
        <td><strong>5.459</strong></td>
        <td><strong>2.517</strong></td>
        <td><strong>2.329</strong></td>
        <td><strong>613</strong></td>
        <td><strong>100,0%</strong></td>
      </tr>
    </tbody>
  </table>
</div>

<!-- TAHAP 8 -->
<div class="stage-section">
  <h3>3.3.8 Tahap 8: AI Method Design & Perhitungan Manual Lengkap</h3>
  <h4>A. Konsep, Asumsi, dan Rumus Matematis</h4>
  <p>
  Multinomial Naive Bayes berakar dari Teorema Bayes dengan asumsi independensi bersyarat antar fitur (kata) terhadap kelas. Probabilitas posterior kelas c diberikan dokumen ulasan x dirumuskan sebagai:
  </p>
  <div class="formula-clean">
    <div class="formula-center">
      P(c | x) = P(c) &times; &prod; [ P(w<sub>i</sub> | c)<sup>x<sub>i</sub></sup> ] / P(x)
    </div>
    <p class="no-indent">Di mana P(c) = N<sub>c</sub> / N<sub>total</sub> adalah probabilitas prior kelas c, P(w<sub>i</sub> | c) adalah likelihood kemunculan kata w<sub>i</sub> pada kelas c, dan x<sub>i</sub> adalah frekuensi kata w<sub>i</sub> dalam dokumen x.</p>
  </div>
  <p>
  Untuk mengatasi masalah probabilitas nol (<em>zero-frequency problem</em>) ketika sebuah kata pada data uji tidak pernah muncul di data latih kelas tertentu, diterapkan <strong>Additive Laplace Smoothing</strong> (&alpha; = 1.0):
  </p>
  <div class="formula-clean">
    <div class="formula-center">
      P(w<sub>i</sub> | c) = [ count(w<sub>i</sub>, c) + &alpha; ] / [ &sum; count(w, c) + &alpha; &times; |V| ]
    </div>
    <p class="no-indent">Di mana |V| adalah total ukuran kosakata unik pada seluruh korpus latih.</p>
  </div>
  <p>
  Untuk menghindari masalah <em>arithmetic underflow</em> akibat perkalian banyak probabilitas pecahan bernilai kecil, komputasi diimplementasikan dalam domain logaritma alami (Log-Likelihood):
  </p>
  <div class="formula-clean">
    <div class="formula-center">
      c* = argmax<sub>c &isin; C</sub> [ ln P(c) + &sum; x<sub>i</sub> &times; ln P(w<sub>i</sub> | c) ]
    </div>
  </div>

  <h4>Contoh Perhitungan Manual Langkah Demi Langkah</h4>
  <p>
  Misalkan kita memiliki korpus mini mainan (<em>toy corpus</em>) berisi 5 ulasan untuk mengklasifikasikan kalimat uji baru: <em>"barang bagus respon cepat"</em>.
  </p>
  
  <div class="caption-table">Tabel 3.5: Korpus Mini Sederhana untuk Simulasi Perhitungan Manual Bayes</div>
  <table class="academic-table">
    <thead>
      <tr>
        <th>ID Dokumen</th>
        <th>Teks Dokumen Latih</th>
        <th>Kelas Sentimen</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>D1</td>
        <td>"barang bagus kualitas mantap"</td>
        <td>Positif</td>
      </tr>
      <tr>
        <td>D2</td>
        <td>"respon cepat pengiriman aman"</td>
        <td>Positif</td>
      </tr>
      <tr>
        <td>D3</td>
        <td>"barang rusak sangat kecewa"</td>
        <td>Negatif</td>
      </tr>
      <tr>
        <td>D4</td>
        <td>"pengiriman lama respon lambat"</td>
        <td>Negatif</td>
      </tr>
      <tr>
        <td>D5</td>
        <td>"kualitas standar biasa saja"</td>
        <td>Netral</td>
      </tr>
    </tbody>
  </table>

  <p class="no-indent"><strong>Langkah 1: Menghitung Kosakata Unik (V) dan Probabilitas Prior P(c):</strong></p>
  <p>
  Total dokumen N = 5. Total kosakata unik V = {'barang', 'bagus', 'kualitas', 'mantap', 'respon', 'cepat', 'pengiriman', 'aman', 'rusak', 'sangat', 'kecewa', 'lama', 'lambat', 'standar', 'biasa', 'saja'}. Maka |V| = 16.
  </p>
  <ul>
    <li>P(Positif) = 2/5 = 0,40 &rArr; ln(0,40) = -0,9163</li>
    <li>P(Negatif) = 2/5 = 0,40 &rArr; ln(0,40) = -0,9163</li>
    <li>P(Netral) = 1/5 = 0,20 &rArr; ln(0,20) = -1,6094</li>
  </ul>

  <p class="no-indent"><strong>Langkah 2: Menghitung Total Kata per Kelas:</strong></p>
  <ul>
    <li>Total kata di kelas Positif (T<sub>pos</sub>) = 4 + 4 = 8 kata.</li>
    <li>Total kata di kelas Negatif (T<sub>neg</sub>) = 4 + 4 = 8 kata.</li>
    <li>Total kata di kelas Netral (T<sub>net</sub>) = 4 kata.</li>
  </ul>

  <div class="caption-table">Tabel 3.6: Frekuensi Kemunculan Kata pada Korpus Mini Sederhana</div>
  <table class="academic-table">
    <thead>
      <tr>
        <th>Kata (w)</th>
        <th>count(w, Positif)</th>
        <th>count(w, Negatif)</th>
        <th>count(w, Netral)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>barang</td>
        <td>1</td>
        <td>1</td>
        <td>0</td>
      </tr>
      <tr>
        <td>bagus</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
      </tr>
      <tr>
        <td>respon</td>
        <td>1</td>
        <td>1</td>
        <td>0</td>
      </tr>
      <tr>
        <td>cepat</td>
        <td>1</td>
        <td>0</td>
        <td>0</td>
      </tr>
    </tbody>
  </table>

  <p class="no-indent"><strong>Langkah 3: Menghitung Likelihood dengan Laplace Smoothing (&alpha;=1):</strong></p>
  <p>Penyebut untuk tiap kelas:</p>
  <ul>
    <li>Positif: T<sub>pos</sub> + &alpha; &times; |V| = 8 + (1 &times; 16) = 24</li>
    <li>Negatif: T<sub>neg</sub> + &alpha; &times; |V| = 8 + (1 &times; 16) = 24</li>
    <li>Netral: T<sub>net</sub> + &alpha; &times; |V| = 4 + (1 &times; 16) = 20</li>
  </ul>

  <p>Kalkulasi nilai P(w<sub>i</sub> | c) untuk kalimat uji <em>"barang bagus respon cepat"</em>:</p>
  <ul>
    <li><strong>Untuk Kelas Positif:</strong>
      <ul>
        <li>P(barang | Pos) = (1 + 1)/24 = 2/24 = 0,0833 &rArr; ln = -2,4849</li>
        <li>P(bagus | Pos) = (1 + 1)/24 = 2/24 = 0,0833 &rArr; ln = -2,4849</li>
        <li>P(respon | Pos) = (1 + 1)/24 = 2/24 = 0,0833 &rArr; ln = -2,4849</li>
        <li>P(cepat | Pos) = (1 + 1)/24 = 2/24 = 0,0833 &rArr; ln = -2,4849</li>
        <li>Total Log-Score Positif = -0,9163 + (-2,4849 &times; 4) = -0,9163 - 9,9396 = <strong>-10,8559</strong></li>
      </ul>
    </li>
    <li><strong>Untuk Kelas Negatif:</strong>
      <ul>
        <li>P(barang | Neg) = (1 + 1)/24 = 2/24 = 0,0833 &rArr; ln = -2,4849</li>
        <li>P(bagus | Neg) = (0 + 1)/24 = 1/24 = 0,0417 &rArr; ln = -3,1781</li>
        <li>P(respon | Neg) = (1 + 1)/24 = 2/24 = 0,0833 &rArr; ln = -2,4849</li>
        <li>P(cepat | Neg) = (0 + 1)/24 = 1/24 = 0,0417 &rArr; ln = -3,1781</li>
        <li>Total Log-Score Negatif = -0,9163 + (-2,4849 - 3,1781 - 2,4849 - 3,1781) = <strong>-12,2423</strong></li>
      </ul>
    </li>
    <li><strong>Untuk Kelas Netral:</strong>
      <ul>
        <li>Semua kata memiliki frekuensi 0 pada kelas netral: (0+1)/20 = 1/20 = 0,0500 &rArr; ln = -2,9957</li>
        <li>Total Log-Score Netral = -1,6094 + (-2,9957 &times; 4) = <strong>-13,5922</strong></li>
      </ul>
    </li>
  </ul>

  <p class="no-indent"><strong>Langkah 4: Keputusan Klasifikasi (Argmax Posterior):</strong></p>
  <div class="caption-table">Tabel 3.7: Hasil Perhitungan Probabilitas Posterior Ulasan Uji Manual</div>
  <table class="academic-table">
    <thead>
      <tr>
        <th>Kelas Sentimen</th>
        <th>Log-Prior (ln P(c))</th>
        <th>Log-Likelihood (&sum; ln P(w<sub>i</sub> | c))</th>
        <th>Total Log Posterior</th>
        <th>Normalisasi Probabilitas Eksponensial</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Positif</strong></td>
        <td>-0,9163</td>
        <td>-9,9396</td>
        <td><strong>-10,8559</strong></td>
        <td><strong>77,4%</strong></td>
      </tr>
      <tr>
        <td>Negatif</td>
        <td>-0,9163</td>
        <td>-11,3260</td>
        <td>-12,2423</td>
        <td>19,3%</td>
      </tr>
      <tr>
        <td>Netral</td>
        <td>-1,6094</td>
        <td>-11,9828</td>
        <td>-13,5922</td>
        <td>3,3%</td>
      </tr>
    </tbody>
  </table>
  <p>
  Karena nilai log-posterior kelas Positif (-10,8559) merupakan nilai tertinggi (paling mendekati nol), maka algoritma memutuskan kalimat uji <em>"barang bagus respon cepat"</em> diklasifikasikan sebagai <strong>Sentimen Positif</strong> dengan keyakinan sebesar <strong>77,4%</strong>. Hasil perhitungan manual ini membuktikan secara matematis kebenaran mekanisme inferensi Naive Bayes.
  </p>
</div>

<!-- TAHAP 9 -->
<div class="stage-section">
  <h3>3.3.9 Tahap 9: Algorithm / Model Implementation (Implementasi Sistem)</h3>
  <h4>A. Konsep dan Teori</h4>
  <p>
  Pemodelan diimplementasikan menggunakan Python melalui library <code>scikit-learn</code> dengan class <code>MultinomialNB(alpha=1.0)</code>. Model dibungkus ke dalam pipeline bersama <code>CountVectorizer</code> dan diekspor ke format serialisasi biner <code>joblib / pickle</code> agar dapat dimuat seketika oleh server web Flask tanpa overhead waktu training ulang.
  </p>
  <h4>B. Implementasi Coding</h4>
  <div class="code-box"><span class="code-keyword">from</span> sklearn.naive_bayes <span class="code-keyword">import</span> MultinomialNB
<span class="code-keyword">from</span> sklearn.pipeline <span class="code-keyword">import</span> Pipeline
<span class="code-keyword">import</span> joblib

<span class="code-comment"># Membangun pipeline end-to-end terintegrasi</span>
pipeline = Pipeline([
    (<span class="code-string">"vectorizer"</span>, CountVectorizer(ngram_range=(<span class="code-num">1</span>, <span class="code-num">2</span>), min_df=<span class="code-num">2</span>)),
    (<span class="code-string">"classifier"</span>, MultinomialNB(alpha=<span class="code-num">1.0</span>))
])

<span class="code-comment"># Proses Training / Fitting pada 4.367 data latih</span>
pipeline.fit(X_train, y_train)

<span class="code-comment"># Simpan model untuk produksi web service</span>
joblib.dump(pipeline, <span class="code-string">"models/model_sentimen.pkl"</span>)
print(<span class="code-string">"Model berhasil dilatih dan disimpan ke models/model_sentimen.pkl"</span>)</div>
  <h4>C. Hasil dan Analisis</h4>
  <p>
  Pelatihan model berlangsung sangat cepat, membutuhkan waktu hanya 0,48 detik untuk memproses 4.367 baris data latih dengan 14.890 fitur pada lingkungan CPU Intel Core / Apple Silicon. Ukuran berkas model terkompresi sebesar 197 KB, menjadikannya sangat efisien untuk di-deploy pada server web.
  </p>
</div>

<!-- TAHAP 10 -->
<div class="stage-section">
  <h3>3.3.10 Tahap 10: Testing & Multi-Experimentation Scenarios</h3>
  <h4>A. Konsep dan Desain Skenario</h4>
  <p>
  Untuk menemukan konfigurasi terbaik, dirancang <strong>5 (lima) variasi eksperimen</strong> komparatif dengan menguji kombinasi:
  </p>
  <ol>
    <li>Eksperimen 1: TF-IDF Vectorizer + MultinomialNB (dengan stopword removal).</li>
    <li>Eksperimen 2: TF-IDF Vectorizer + ComplementNB (penanganan kelas tidak seimbang).</li>
    <li>Eksperimen 3: <strong>CountVectorizer + MultinomialNB (Model Terpilih)</strong>.</li>
    <li>Eksperimen 4: CountVectorizer + ComplementNB.</li>
    <li>Eksperimen 5: TF-IDF Vectorizer + MultinomialNB (tanpa stopword removal / raw text).</li>
  </ol>
  <h4>B. Implementasi Coding</h4>
  <div class="code-box"><span class="code-keyword">from</span> sklearn.naive_bayes <span class="code-keyword">import</span> ComplementNB
<span class="code-keyword">from</span> sklearn.feature_extraction.text <span class="code-keyword">import</span> TfidfVectorizer
<span class="code-keyword">from</span> sklearn.metrics <span class="code-keyword">import</span> classification_report, accuracy_score, f1_score

<span class="code-comment"># Menjalankan loop benchmarking 5 eksperimen</span>
results = []
<span class="code-keyword">for</span> exp_name, vec, clf <span class="code-keyword">in</span> EXPERIMENT_CONFIGS:
    pipe = Pipeline([( <span class="code-string">"vec"</span>, vec ), ( <span class="code-string">"clf"</span>, clf )])
    pipe.fit(X_train, y_train)
    y_pred = pipe.predict(X_test)
    results.append({
        <span class="code-string">"name"</span>: exp_name,
        <span class="code-string">"accuracy"</span>: accuracy_score(y_test, y_pred),
        <span class="code-string">"f1_macro"</span>: f1_score(y_test, y_pred, average=<span class="code-string">"macro"</span>)
    })</div>
  <h4>C. Hasil dan Analisis</h4>
  <p>
  Meskipun TF-IDF menghasilkan akurasi sedikit lebih tinggi (86,54%), <strong>CountVectorizer + MultinomialNB unggul mutlak pada metrik Macro F1-Score sebesar 76,64%</strong>. Hal ini dikarenakan CountVectorizer mempertahankan bobot frekuensi kata pada kelas minoritas (Netral), menghasilkan Recall Netral sebesar 51,2% (berbanding hanya 21,9% pada TF-IDF). Oleh karena itu, Eksperimen 3 ditetapkan sebagai model inti sistem.
  </p>
</div>

<!-- TAHAP 11 -->
<div class="stage-section">
  <h3>3.3.11 Tahap 11: Performance Evaluation & Error Analysis</h3>
  <h4>A. Konsep dan Teori</h4>
  <p>
  Evaluasi menggunakan metrik formal Confusion Matrix, Precision, Recall, Macro F1, dan Weighted F1. Error analysis menginvestigasi sampel data uji yang mengalami salah prediksi guna memetakan batasan intrinsik metode Naive Bayes.
  </p>
  <h4>B. Implementasi Coding</h4>
  <div class="code-box"><span class="code-keyword">from</span> sklearn.metrics <span class="code-keyword">import</span> confusion_matrix

cm = confusion_matrix(y_test, y_pred, labels=[<span class="code-string">"positif"</span>, <span class="code-string">"netral"</span>, <span class="code-string">"negatif"</span>])
print(<span class="code-string">"Confusion Matrix:\n"</span>, cm)
print(classification_report(y_test, y_pred, digits=<span class="code-num">4</span>))</div>
  <h4>C. Hasil dan Analisis</h4>
  <p>
  Dari 1.092 data uji, model memprediksi 932 sampel dengan benar (455 Positif benar, 414 Negatif benar, dan 63 Netral benar). Kesalahan utama terjadi pada ulasan netral yang diklasifikasikan sebagai negatif (46 sampel) karena ulasan netral sering memuat kritik halus seperti <em>"pengiriman agak lama tapi ya lumayan"</em>.
  </p>
</div>

<!-- TAHAP 12 -->
<div class="stage-section">
  <h3>3.3.12 Tahap 12: Final Output, Web Deployment & Online Learning</h3>
  <h4>A. Konsep dan Arsitektur Deployment</h4>
  <p>
  Model AI diintegrasikan ke dalam arsitektur aplikasi berbasis web:
  </p>
  <ul>
    <li><strong>Backend (Python Flask):</strong> Menyediakan RESTful API berlatensi rendah untuk inferensi tunggal (<code>/predict</code>), batch processing (<code>/api/predict/batch</code>), pemantauan metrik (<code>/api/metrics</code>), dan online training (<code>/api/learn</code>).</li>
    <li><strong>Frontend (React SPA + Tailwind CSS + Lucide Icons):</strong> Dashboard interaktif modern dengan 10 modul analitik komprehensif, fitur komparasi produk, serta panduan bantuan presentasi pada setiap komponen.</li>
    <li><strong>Mekanisme Online Incremental Learning (<code>partial_fit</code>):</strong> Saat pengguna memberikan koreksi sentimen atau menambahkan ulasan baru melalui antarmuka web, server mengeksekusi metode <code>classifier.partial_fit()</code>. Bobot frekuensi kata diperbarui secara atomik tanpa memerlukan pelatihan ulang dataset secara menyeluruh.</li>
  </ul>
  <h4>B. Implementasi Coding Online Learning</h4>
  <div class="code-box"><span class="code-comment"># Endpoint Incremental Online Learning (main.py)</span>
<span class="code-keyword">@app.route</span>(<span class="code-string">"/api/learn"</span>, methods=[<span class="code-string">"POST"</span>])
<span class="code-keyword">def</span> online_learn():
    data = request.json
    text = data.get(<span class="code-string">"text"</span>, <span class="code-string">""</span>)
    correct_label = data.get(<span class="code-string">"sentiment"</span>, <span class="code-string">""</span>).lower()
    
    <span class="code-comment"># Transformasi teks baru dengan vectorizer yang ada</span>
    X_new = model_pipeline.named_steps[<span class="code-string">"vectorizer"</span>].transform([text])
    
    <span class="code-comment"># Pembaruan probabilitas model secara instan (Inkremental)</span>
    model_pipeline.named_steps[<span class="code-string">"classifier"</span>].partial_fit(
        X_new, [correct_label], classes=[<span class="code-string">"positif"</span>, <span class="code-string">"netral"</span>, <span class="code-string">"negatif"</span>]
    )
    <span class="code-keyword">return</span> jsonify({<span class="code-string">"status"</span>: <span class="code-string">"success"</span>, <span class="code-string">"message"</span>: <span class="code-string">"Model berhasil disinkronisasi"</span>})</div>
  <h4>C. Hasil dan Analisis</h4>
  <p>
  Integrasi web berjalan stabil dan responsif. Pengujian online learning membuktikan bahwa setelah koreksi ulasan baru dimasukkan, model seketika mengenali pola ulasan sejenis berikutnya dengan perubahan probabilitas log-likelihood terverifikasi, menjamin sistem adaptif terhadap perkembangan kosakata konsumen.
  </p>
</div>

<!-- ==================================================================== -->
<!-- BAB IV PENGUJIAN DAN EVALUASI                                        -->
<!-- ==================================================================== -->
<div class="page-break"></div>
<h1 class="chapter-title">BAB IV<br>PENGUJIAN DAN EVALUASI</h1>

<h2>4.1 Skenario dan Data Kasus Pengujian</h2>
<p>
Pengujian sistem dilakukan secara formal untuk membuktikan keandalan, stabilitas, dan akurasi model AI dalam memproses data ulasan nyata. Skenario pengujian dibagi menjadi 3 bagian:
</p>
<ol>
  <li><strong>Pengujian Kuantitatif Model (Hold-Out Stratified Testing):</strong> Menguji model pada 1.092 sampel uji yang belum pernah dilihat sebelumnya selama masa pelatihan.</li>
  <li><strong>Pengujian Komparasi Multi-Eksperimen:</strong> Membandingkan 5 variasi kombinasi algoritma (MultinomialNB vs ComplementNB) dan vektorisasi (CountVectorizer vs TF-IDF).</li>
  <li><strong>Pengujian Kalimat Uji Kasus Khusus (Linguistic Edge Cases):</strong> Menguji ketahanan model terhadap kalimat dengan konjungsi transisi kontrastif (<em>"tetapi"</em>, <em>"walaupun"</em>, <em>"namun"</em>) dan kalimat sarkasme.</li>
</ol>

<h2>4.2 Hasil Implementasi dan Output Sistem</h2>
<p>
Sistem AI menghasilkan keluaran berupa label sentimen terprediksi, persentase keyakinan probabilitas, dekomposisi log-odds kontribusi setiap kata, indikator aspek yang dikeluhkan, serta pemetaan emosi sekunder.
</p>

<h2>4.3 Metrik Evaluasi Kinerja (Akurasi, F1-Score, Precision, Recall)</h2>
<p>
Berikut adalah laporan klasifikasi (<em>classification report</em>) lengkap dari model terpilih (CountVectorizer + MultinomialNB) pada data uji terpisah:
</p>

<div class="caption-table">Tabel 4.1: Classification Report Model Multinomial Naive Bayes Terpilih</div>
<table class="academic-table">
  <thead>
    <tr>
      <th>Kelas Sentimen</th>
      <th>Precision</th>
      <th>Recall</th>
      <th>F1-Score</th>
      <th>Jumlah Sampel Uji (Support)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Positif</strong></td>
      <td>0,9479 (94,8%)</td>
      <td>0,9046 (90,5%)</td>
      <td>0,9257 (92,6%)</td>
      <td>503</td>
    </tr>
    <tr>
      <td><strong>Netral</strong></td>
      <td>0,4922 (49,2%)</td>
      <td>0,5122 (51,2%)</td>
      <td>0,5020 (50,2%)</td>
      <td>123</td>
    </tr>
    <tr>
      <td><strong>Negatif</strong></td>
      <td>0,8554 (85,5%)</td>
      <td>0,8884 (88,8%)</td>
      <td>0,8716 (87,2%)</td>
      <td>466</td>
    </tr>
    <tr>
      <td><strong>Akurasi Keseluruhan</strong></td>
      <td colspan="3" style="text-align: center; font-weight: bold;">0,8535 (85,35%)</td>
      <td>1.092</td>
    </tr>
    <tr>
      <td><strong>Macro Average</strong></td>
      <td><strong>0,7652 (76,5%)</strong></td>
      <td><strong>0,7684 (76,8%)</strong></td>
      <td><strong>0,7664 (76,64%)</strong></td>
      <td>1.092</td>
    </tr>
    <tr>
      <td><strong>Weighted Average</strong></td>
      <td>0,8571 (85,7%)</td>
      <td>0,8535 (85,4%)</td>
      <td>0,8549 (85,5%)</td>
      <td>1.092</td>
    </tr>
  </tbody>
</table>

<div class="caption-table">Tabel 4.2: Confusion Matrix Pengujian Model (Test Set N=1.092)</div>
<table class="academic-table">
  <thead>
    <tr>
      <th rowspan="2" style="vertical-align: middle;">Kelas Sebenarnya (Ground Truth)</th>
      <th colspan="3" style="text-align: center;">Kelas Prediksi Model AI</th>
      <th rowspan="2" style="vertical-align: middle;">Total Sampel</th>
    </tr>
    <tr>
      <th>Positif</th>
      <th>Netral</th>
      <th>Negatif</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Positif</strong></td>
      <td><strong>455 (True Positif)</strong></td>
      <td>24</td>
      <td>24</td>
      <td>503</td>
    </tr>
    <tr>
      <td><strong>Netral</strong></td>
      <td>14</td>
      <td><strong>63 (True Netral)</strong></td>
      <td>46</td>
      <td>123</td>
    </tr>
    <tr>
      <td><strong>Negatif</strong></td>
      <td>11</td>
      <td>41</td>
      <td><strong>414 (True Negatif)</strong></td>
      <td>466</td>
    </tr>
  </tbody>
</table>

<div class="figure-container">
  <img src="__IMG_CM__" class="figure-img" style="max-width: 65%;" alt="Confusion Matrix Heatmap">
  <div class="caption-figure">Gambar 4.1: Visualisasi Confusion Matrix Model Terpilih (CountVectorizer + MultinomialNB)</div>
</div>

<h2>4.4 Perbandingan Hasil 5 Eksperimen Model</h2>
<p>
Eksperimen multi-model membuktikan pentingnya pemilihan representasi fitur yang tepat dalam klasifikasi teks. Hasil perbandingan 5 konfigurasi eksperimen dirangkum pada Tabel 4.3 dan Gambar 4.2.
</p>

<div class="caption-table">Tabel 4.3: Perbandingan Komprehensif Kinerja 5 Eksperimen Model AI</div>
<table class="academic-table">
  <thead>
    <tr>
      <th>No</th>
      <th>Nama Eksperimen</th>
      <th>Ekstraksi Fitur</th>
      <th>Algoritma</th>
      <th>Stopword</th>
      <th>Akurasi</th>
      <th>Macro F1</th>
      <th>Status Seleksi</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>TF-IDF + MultinomialNB</td>
      <td>TfidfVectorizer</td>
      <td>MultinomialNB</td>
      <td>Ya</td>
      <td>86,54%</td>
      <td>72,14%</td>
      <td>Diuji</td>
    </tr>
    <tr>
      <td>2</td>
      <td>TF-IDF + ComplementNB</td>
      <td>TfidfVectorizer</td>
      <td>ComplementNB</td>
      <td>Ya</td>
      <td>86,17%</td>
      <td>74,48%</td>
      <td>Diuji</td>
    </tr>
    <tr>
      <td><strong>3</strong></td>
      <td><strong>CountVec + MultinomialNB</strong></td>
      <td><strong>CountVectorizer</strong></td>
      <td><strong>MultinomialNB</strong></td>
      <td><strong>Ya</strong></td>
      <td><strong>85,35%</strong></td>
      <td><strong>76,64%</strong></td>
      <td><strong>TERPILIH (Best Balance)</strong></td>
    </tr>
    <tr>
      <td>4</td>
      <td>CountVec + ComplementNB</td>
      <td>CountVectorizer</td>
      <td>ComplementNB</td>
      <td>Ya</td>
      <td>85,35%</td>
      <td>71,26%</td>
      <td>Diuji</td>
    </tr>
    <tr>
      <td>5</td>
      <td>TF-IDF + MultinomialNB (Raw)</td>
      <td>TfidfVectorizer</td>
      <td>MultinomialNB</td>
      <td>Tidak</td>
      <td>85,90%</td>
      <td>70,89%</td>
      <td>Diuji</td>
    </tr>
  </tbody>
</table>

<div class="figure-container">
  <img src="__IMG_MODEL_COMP__" class="figure-img" alt="Perbandingan Eksperimen Model">
  <div class="caption-figure">Gambar 4.2: Grafik Komparasi Akurasi dan Macro F1-Score 5 Eksperimen Model AI</div>
</div>

<p>
Sebagaimana tampak pada Gambar 4.2, seluruh eksperimen berhasil melampaui target minimum institusional Macro F1-Score (garis putus-putus merah pada 70%). Namun, <strong>Eksperimen 3 mencapai Macro F1 tertinggi sebesar 76,64%</strong> (+4,5% lebih unggul dari TF-IDF standar).
</p>

<div class="page-break"></div>
<h2>4.5 Analisis Kesalahan (Error Analysis) dan Keterbatasan Sistem</h2>
<p>
Pemeriksaan kualitatif terhadap sampel data uji yang mengalami salah klasifikasi (<em>misclassification</em>) mengungkapkan pola linguistik yang menjadi batasan metode Naive Bayes.
</p>

<div class="figure-container">
  <img src="__IMG_TOP_TOKENS__" class="figure-img" alt="Top Log-Likelihood Tokens">
  <div class="caption-figure">Gambar 4.3: Fitur Kata Paling Berpengaruh Berdasarkan Log-Likelihood Ratio Positif vs Negatif</div>
</div>

<div class="caption-table">Tabel 4.4: Sampel Analisis Kasus Misklasifikasi Model dan Diagnosa Akar Masalah</div>
<table class="academic-table">
  <thead>
    <tr>
      <th>Teks Ulasan Sampel</th>
      <th>Ground Truth</th>
      <th>Prediksi AI</th>
      <th>Probabilitas</th>
      <th>Diagnosa Akar Penyebab Kesalahan</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>"makasih kak barang udah sampai walau kardus penyok dikit tp gpp"</td>
      <td>Netral</td>
      <td>Positif</td>
      <td>88,2%</td>
      <td>Kata apresiasi seperti <em>'makasih'</em> dan <em>'sampai'</em> mendominasi log-prior positif, menenggelamkan sentimen komplain minor.</td>
    </tr>
    <tr>
      <td>"wah bagus sekali ya, baru dipakai 2 menit layarnya langsung mati total"</td>
      <td>Negatif</td>
      <td>Positif</td>
      <td>91,4%</td>
      <td><strong>Sarkasme (Ironi):</strong> Keberadaan kata <em>'bagus sekali'</em> mengecoh model karena Naive Bayes mengabaikan semantik konteks ironis secara mandiri.</td>
    </tr>
    <tr>
      <td>"biasa aja sih, standar harga segitu mah"</td>
      <td>Netral</td>
      <td>Negatif</td>
      <td>64,1%</td>
      <td>Kelas netral memiliki variasi kata yang tumpang tindih dengan ulasan negatif berpolaritas rendah.</td>
    </tr>
  </tbody>
</table>

<p><strong>Keterbatasan Sistem:</strong></p>
<ol>
  <li><strong>Asumsi Independensi Bersyarat:</strong> Naive Bayes mengasumsikan kata-kata berdiri sendiri. Meskipun bigram membantu, ketergantungan jarak jauh (<em>long-distance dependencies</em>) seperti kalimat sarkasme bertingkat masih menjadi kelemahan alami model.</li>
  <li><strong>Sensitivitas Slang Baru:</strong> Kata-kata slang atau singkatan di luar kamus normalisasi leksikal akan diperlakukan sebagai kata baru yang hanya bersandar pada <em>Laplace Smoothing</em>.</li>
</ol>

<!-- ==================================================================== -->
<!-- BAB V KESIMPULAN DAN SARAN                                           -->
<!-- ==================================================================== -->
<div class="page-break"></div>
<h1 class="chapter-title">BAB V<br>KESIMPULAN DAN SARAN</h1>

<h2>5.1 Kesimpulan Hasil Pengembangan Proyek</h2>
<p>
Berdasarkan seluruh tahapan perancangan, implementasi, dan pengujian yang telah dilaksanakan dalam Tugas Besar Pengembangan Proyek Artificial Intelligence Berbasis Data Terstruktur ini, dapat disimpulkan bahwa:
</p>
<ol>
  <li>Pipeline pengembangan AI 12 tahapan berhasil diimplementasikan secara utuh dan disiplin, menghubungkan akuisisi data tabular terbuka PRDECT-ID (5.459 ulasan) dengan arsitektur web modern yang dapat digunakan langsung oleh pengguna akhir.</li>
  <li>Metode <strong>Multinomial Naive Bayes</strong> yang dikombinasikan dengan ekstraksi fitur unigram-bigram (CountVectorizer) dan optimasi <em>Laplace Smoothing</em> (&alpha;=1.0) terbukti sangat efektif untuk klasifikasi teks ulasan belanja online Indonesia berdimensi tinggi.</li>
  <li>Model terbaik (Eksperimen 3) berhasil mencatatkan kinerja prima pada 1.092 data uji terpisah dengan <strong>Akurasi sebesar 85,35%</strong> dan <strong>Macro F1-Score sebesar 76,64%</strong>. Hasil ini secara memuaskan melampaui seluruh indikator kinerja utama yang ditetapkan institusi (Macro F1 &ge; 70% dan Akurasi &ge; 80%).</li>
  <li>Fitur <strong>Online Incremental Learning</strong> berbasis algoritma <code>partial_fit</code> berhasil diterapkan di lingkungan web Flask, memungkinkan pembaruan bobot probabilitas model secara instan tanpa mengganggu ketersediaan layanan sistem.</li>
  <li>Aplikasi web yang dibangun menyediakan modul fungsional komprehensif, mulai dari analisis ulasan tunggal dengan pembuktian matematis, batch processing CSV, komparasi reputasi dua produk, pelacak Net Sentiment Score (NSS), hingga panduan sidang interaktif untuk presentasi evaluasi akademik.</li>
</ol>

<h2>5.2 Ketercapaian Tujuan dan Manfaat Sistem</h2>
<p>
Seluruh tujuan tugas besar yang digariskan pada Bab I telah tercapai 100%. Sistem ini memberikan nilai manfaat nyata:
</p>
<ul>
  <li><strong>Bagi Penjual/Merchant:</strong> Mempercepat identifikasi komplain produk cacat dan emosi marah pelanggan sehingga eskalasi retur barang dapat dicegah secara dini.</li>
  <li><strong>Bagi Konsumen:</strong> Membantu komparasi objektif antara dua kandidat produk berdasarkan ribuan ulasan pembeli terverifikasi secara berdampingan.</li>
  <li><strong>Bagi Pengembangan Akademik:</strong> Memberikan studi kasus nyata penerapan teori penalaran di bawah ketidakpastian (<em>reasoning under uncertainty</em>) pada data tabular bahasa Indonesia.</li>
</ul>

<h2>5.3 Evaluasi Kinerja Algoritma Naive Bayes</h2>
<p>
Multinomial Naive Bayes membuktikan keunggulannya dalam aspek efisiensi komputasi (waktu training 0,48 detik, latensi inferensi &lt; 20 ms, dan ukuran memori &lt; 200 KB) dengan akurasi yang kompetitif (85,35%). Pendekatan CountVectorizer terbukti lebih unggul daripada TF-IDF dalam menangani ketidakseimbangan kelas minoritas pada korpus ini.
</p>

<h2>5.4 Saran dan Arah Pengembangan Selanjutnya</h2>
<p>
Untuk pengembangan lebih lanjut dari sistem AI ini di masa mendatang, disarankan beberapa peningkatan:
</p>
<ol>
  <li><strong>Integrasi Model Kontekstual Lanjut (Hybrid/Ensemble):</strong> Mengembangkan arsitektur ensemble yang memadukan keunggulan latensi Naive Bayes dengan pemahaman semantik Transformer (seperti IndoBERT) khusus untuk mendeteksi kalimat sarkasme.</li>
  <li><strong>Ekspansi Kamus Slang Otomatis:</strong> Membangun modul pembaruan kamus bahasa gaul secara otomatis berbasis frekuensi kata baru dari modul online learning.</li>
  <li><strong>Integrasi API Resmi Marketplace:</strong> Menghubungkan sistem secara langsung ke Tokopedia Developer API atau Shopee Open Platform agar ulasan produk dapat disinkronkan secara otomatis tanpa pengunggahan manual.</li>
</ol>

<!-- ==================================================================== -->
<!-- DAFTAR PUSTAKA                                                       -->
<!-- ==================================================================== -->
<div class="page-break"></div>
<h1 class="chapter-title">DAFTAR PUSTAKA</h1>

<ol style="padding-left: 1.5cm; text-indent: -1.5cm; margin-left: 0.5cm;">
  <li style="margin-bottom: 12px;">Manning, C. D., Raghavan, P., & Schütze, H. (2008). <em>Introduction to Information Retrieval</em>. Cambridge University Press.</li>
  <li style="margin-bottom: 12px;">Russell, S., & Norvig, P. (2020). <em>Artificial Intelligence: A Modern Approach</em> (4th ed.). Pearson.</li>
  <li style="margin-bottom: 12px;">Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., Grisel, O., Blondel, M., Prettenhofer, P., Weiss, R., Dubourg, V., Vanderplas, J., Passos, A., Cournapeau, D., Brucher, M., Perrot, M., & Duchesnay, E. (2011). Scikit-learn: Machine Learning in Python. <em>Journal of Machine Learning Research</em>, 12, 2825–2830.</li>
  <li style="margin-bottom: 12px;">Rennie, J. D., Shih, L., Teevan, J., & Karger, D. R. (2003). Tackling the poor assumptions of naive bayes text classifiers. In <em>Proceedings of the 20th International Conference on Machine Learning (ICML-03)</em> (pp. 616–623).</li>
  <li style="margin-bottom: 12px;">Koto, F., Rahimi, A., Lau, J. H., & Baldwin, T. (2020). IndoLEM and IndoBERT: A Benchmark Dataset and Pre-trained Language Model for Indonesian NLP. In <em>Proceedings of the 28th International Conference on Computational Linguistics (COLING 2020)</em> (pp. 757–770).</li>
  <li style="margin-bottom: 12px;">Jurafsky, D., & Martin, J. H. (2023). <em>Speech and Language Processing: An Introduction to Natural Language Processing, Computational Linguistics, and Speech Recognition</em> (3rd ed. draft). Pearson.</li>
  <li style="margin-bottom: 12px;">Wati, V. (2026). <em>Instruksi Tugas Besar: Pengembangan Proyek Artificial Intelligence Berbasis Data Terstruktur</em>. Modul Perkuliahan Kecerdasan Buatan, Jurusan Teknik Informatika, Politeknik Negeri Indramayu.</li>
  <li style="margin-bottom: 12px;">Kaggle Datasets. (2024). <em>PRDECT-ID: Indonesian Product Review Dataset with Sentiment and Emotions for E-Commerce Analysis</em>. Open Access Repository.</li>
</ol>

<!-- ==================================================================== -->
<!-- LAMPIRAN                                                             -->
<!-- ==================================================================== -->
<div class="page-break"></div>
<h1 class="chapter-title">LAMPIRAN</h1>

<h2>Lampiran 1: Tautan Dataset dan Repositori Kode Sumber</h2>
<table class="plain-table">
  <tr>
    <td width="30%"><strong>Repositori Kode Sumber</strong></td>
    <td width="3%">:</td>
    <td><a href="https://github.com/Muhfaizr21/Klasifikasi-sentimen-ulasan-produk.git">https://github.com/Muhfaizr21/Klasifikasi-sentimen-ulasan-produk.git</a></td>
  </tr>
  <tr>
    <td><strong>Tautan Sumber Dataset</strong></td>
    <td>:</td>
    <td>Dataset PRDECT-ID Tokopedia (Kaggle / Open Data Repository)</td>
  </tr>
  <tr>
    <td><strong>Teknologi Backend</strong></td>
    <td>:</td>
    <td>Python 3.11, Flask 3.1, Scikit-Learn 1.9, Pandas, Joblib</td>
  </tr>
  <tr>
    <td><strong>Teknologi Frontend</strong></td>
    <td>:</td>
    <td>React 19, TypeScript, Vite 8, Tailwind CSS, Lucide Icons</td>
  </tr>
  <tr>
    <td><strong>Branch Utama</strong></td>
    <td>:</td>
    <td><code>main</code> (Aktif, Sinkron, & Bebas Konflik Port)</td>
  </tr>
</table>

<h2>Lampiran 2: Dokumentasi Antarmuka Pengguna (UI/UX Sistem)</h2>
<p class="no-indent">
Berikut disajikan dokumentasi tangkapan layar antarmuka pengguna sistem web cerdas yang telah dikembangkan dan siap pakai:
</p>

<div class="figure-container">
  <img src="__IMG_UI_ANALISIS__" class="figure-img" alt="UI Analisis Ulasan">
  <div class="caption-figure">Gambar L.1: Antarmuka Modul Analisis Sentimen Tunggal Lengkap dengan Penjabaran Bukti Matematis Log-Likelihood dan Tombol Panduan Sidang "?"</div>
</div>

<div class="figure-container">
  <img src="__IMG_UI_KPI__" class="figure-img" alt="UI Target KPI">
  <div class="caption-figure">Gambar L.2: Antarmuka Modul Pelacak Target KPI, Akurasi Uji Stratified, dan Net Sentiment Score (NSS) Korpus</div>
</div>

<div class="page-break"></div>
<div class="figure-container">
  <img src="__IMG_UI_KORPUS__" class="figure-img" alt="UI Peta Korpus">
  <div class="caption-figure">Gambar L.3: Antarmuka Modul Peta Korpus 30 Kategori Produk Tokopedia dengan Filter Sektor dan Volume Ulasan</div>
</div>

<div class="figure-container">
  <img src="__IMG_UI_KOMPARASI__" class="figure-img" alt="UI Komparasi Produk">
  <div class="caption-figure">Gambar L.4: Antarmuka Modul Komparasi Reputasi 2 Produk Berdampingan Berdasarkan Ulasan Terverifikasi</div>
</div>

<h2>Lampiran 3: Cuplikan Kode Sumber Script Otomasi Dev Bebas Bentrok Port</h2>
<div class="code-box"><span class="code-comment">#!/usr/bin/env bash</span>
<span class="code-comment"># frontend/scripts/dev.sh - Skrip Otomasi Sinkronisasi Port Backend & Frontend</span>
<span class="code-keyword">set</span> -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PYTHON_BIN="${PYTHON_BIN:-$HOME/.venvs/tubes/bin/python}"
BACKEND_PORT="${BACKEND_PORT:-5000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

<span class="code-comment"># Otomatis deteksi & tangani bentrok port macOS (AirPlay Receiver)</span>
<span class="code-keyword">while</span> lsof -Pi :"$BACKEND_PORT" -sTCP:LISTEN -t &gt;/dev/null <span class="code-num">2</span>&gt;&amp;<span class="code-num">1</span>; <span class="code-keyword">do</span>
  echo "[dev] Port $BACKEND_PORT sedang digunakan oleh sistem (misal AirPlay Receiver)."
  BACKEND_PORT=$((BACKEND_PORT + 1))
  echo "[dev] Otomatis mengalihkan Flask backend ke port $BACKEND_PORT..."
<span class="code-keyword">done</span>

<span class="code-keyword">export</span> VITE_BACKEND_PORT="$BACKEND_PORT"
<span class="code-comment"># Menjalankan Flask dan Vite secara paralel dan sinkron...</span></div>

</body>
</html>
"""

# Replace image placeholders
base_html = html_template.replace("__IMG_LOGO_POLINDRA__", img_logo_polindra)
base_html = base_html.replace("__IMG_CLASS_DIST__", img_class_dist)
base_html = base_html.replace("__IMG_CM__", img_cm)
base_html = base_html.replace("__IMG_MODEL_COMP__", img_model_comp)
base_html = base_html.replace("__IMG_TOP_TOKENS__", img_top_tokens)
base_html = base_html.replace("__IMG_PIPE_FLOW__", img_pipe_flow)
base_html = base_html.replace("__IMG_NB_FLOW__", img_nb_flow)
base_html = base_html.replace("__IMG_UI_ANALISIS__", img_ui_analisis)
base_html = base_html.replace("__IMG_UI_KPI__", img_ui_kpi)
base_html = base_html.replace("__IMG_UI_KORPUS__", img_ui_korpus)
base_html = base_html.replace("__IMG_UI_KOMPARASI__", img_ui_komparasi)

html_path = "Laporan_Tugas_Besar_Kecerdasan_Buatan.html"
pdf_path = "Laporan_Tugas_Besar_Kecerdasan_Buatan_Kelompok.pdf"
chrome_bin = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

def compile_pdf(html_str):
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_str)
    chrome_cmd = [
        chrome_bin,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        f"file://{os.path.abspath(html_path)}"
    ]
    subprocess.run(chrome_cmd, capture_output=True, text=True)

# Pass 1: Compile with placeholder page numbers
print("Pass 1: Compiling draft PDF to detect exact page numbers...")
compile_pdf(base_html)

# Extract exact page numbers using pypdf
import pypdf
reader = pypdf.PdfReader(pdf_path)
total_pages = len(reader.pages)
print(f"Draft PDF Pages: {total_pages}")

markers = {
    "__P_COVER__": "LAPORAN TUGAS BESAR KECERDASAN BUATAN",
    "__P_PENGESAHAN__": "LEMBAR PENGESAHAN",
    "__P_ABSTRAK__": "ABSTRAK",
    "__P_ABSTRACT__": "ABSTRACT",
    "__P_KATA_PENGANTAR__": "KATA PENGANTAR",
    "__P_DAFTAR_ISI__": "DAFTAR ISI",
    "__P_DAFTAR_TABEL__": "DAFTAR TABEL",
    "__P_DAFTAR_GAMBAR__": "DAFTAR GAMBAR",
    "__P_BAB1__": "BAB I",
    "__P_1_1__": "1.1 Latar Belakang",
    "__P_1_2__": "1.2 Tujuan Pengembangan",
    "__P_1_3__": "1.3 Deskripsi Singkat",
    "__P_1_4__": "1.4 Metode / Algoritma",
    "__P_1_5__": "1.5 Batasan Masalah",
    "__P_BAB2__": "BAB II",
    "__P_2_1__": "2.1 Deskripsi Dataset",
    "__P_2_2__": "2.2 Dimensi Data",
    "__P_2_3__": "2.3 Penjelasan Fungsi",
    "__P_2_4__": "2.4 Identifikasi Variabel",
    "__P_2_5__": "2.5 Contoh Data",
    "__P_2_6__": "2.6 Keterkaitan Dataset",
    "__P_BAB3__": "BAB III",
    "__P_3_1__": "3.1 Flowchart Pipeline Umum",
    "__P_3_2__": "3.2 Flowchart Khusus",
    "__P_3_3__": "3.3 Penjelasan Rinci",
    "__P_3_3_1__": "3.3.1 Tahap 1:",
    "__P_3_3_2__": "3.3.2 Tahap 2:",
    "__P_3_3_3__": "3.3.3 Tahap 3:",
    "__P_3_3_4__": "3.3.4 Tahap 4:",
    "__P_3_3_5__": "3.3.5 Tahap 5:",
    "__P_3_3_6__": "3.3.6 Tahap 6:",
    "__P_3_3_7__": "3.3.7 Tahap 7:",
    "__P_3_3_8__": "3.3.8 Tahap 8:",
    "__P_3_3_9__": "3.3.9 Tahap 9:",
    "__P_3_3_10__": "3.3.10 Tahap 10:",
    "__P_3_3_11__": "3.3.11 Tahap 11:",
    "__P_3_3_12__": "3.3.12 Tahap 12:",
    "__P_BAB4__": "BAB IV",
    "__P_4_1__": "4.1 Skenario dan Data",
    "__P_4_2__": "4.2 Hasil Implementasi",
    "__P_4_3__": "4.3 Metrik Evaluasi",
    "__P_4_4__": "4.4 Perbandingan Hasil",
    "__P_4_5__": "4.5 Analisis Kesalahan",
    "__P_BAB5__": "BAB V",
    "__P_5_1__": "5.1 Kesimpulan Hasil",
    "__P_5_2__": "5.2 Ketercapaian Tujuan",
    "__P_5_3__": "5.3 Evaluasi Kinerja",
    "__P_5_4__": "5.4 Saran dan Arah",
    "__P_DAPUS__": "DAFTAR PUSTAKA",
    "__P_LAMPIRAN__": "LAMPIRAN",
    "__T_2_1__": "Tabel 2.1:",
    "__T_2_2__": "Tabel 2.2:",
    "__T_3_1__": "Tabel 3.1:",
    "__T_3_2__": "Tabel 3.2:",
    "__T_3_3__": "Tabel 3.3:",
    "__T_3_4__": "Tabel 3.4:",
    "__T_3_5__": "Tabel 3.5:",
    "__T_3_6__": "Tabel 3.6:",
    "__T_3_7__": "Tabel 3.7:",
    "__T_4_1__": "Tabel 4.1:",
    "__T_4_2__": "Tabel 4.2:",
    "__T_4_3__": "Tabel 4.3:",
    "__T_4_4__": "Tabel 4.4:",
    "__G_2_1__": "Gambar 2.1:",
    "__G_3_1__": "Gambar 3.1:",
    "__G_3_2__": "Gambar 3.2:",
    "__G_4_1__": "Gambar 4.1:",
    "__G_4_2__": "Gambar 4.2:",
    "__G_4_3__": "Gambar 4.3:",
    "__G_L_1__": "Gambar L.1:",
    "__G_L_2__": "Gambar L.2:",
    "__G_L_3__": "Gambar L.3:",
    "__G_L_4__": "Gambar L.4:",
}

# Skip TOC pages when searching for body headings (TOC is roughly pages 5-9)
page_texts = [p.extract_text() or "" for p in reader.pages]

final_html = base_html
for placeholder, query in markers.items():
    found_page = "-"
    # Determine minimum page index to search (so we don't match TOC itself)
    start_idx = 0
    if placeholder in ["__P_COVER__"]:
        start_idx = 0
    elif placeholder in ["__P_PENGESAHAN__", "__P_ABSTRAK__", "__P_ABSTRACT__", "__P_KATA_PENGANTAR__", "__P_DAFTAR_ISI__", "__P_DAFTAR_TABEL__", "__P_DAFTAR_GAMBAR__"]:
        start_idx = 1
    else:
        start_idx = 8 # Body content starts after Daftar Gambar
        
    for idx in range(start_idx, len(page_texts)):
        if query in page_texts[idx]:
            found_page = str(idx + 1)
            break
    # fallback if start_idx was too high
    if found_page == "-":
        for idx in range(len(page_texts)):
            if query in page_texts[idx] and idx > 4:
                found_page = str(idx + 1)
                break
    final_html = final_html.replace(placeholder, found_page)

# Pass 2: Compile final PDF with exact page numbers in TOC
print("Pass 2: Compiling final clean PDF with exact TOC page numbers...")
compile_pdf(final_html)

if os.path.exists(pdf_path):
    reader2 = pypdf.PdfReader(pdf_path)
    size_mb = os.path.getsize(pdf_path) / (1024 * 1024)
    print(f"SUCCESS! Final Clean PDF created at: {pdf_path} ({len(reader2.pages)} pages, {size_mb:.2f} MB)")
else:
    print("FAILED to create PDF.")
