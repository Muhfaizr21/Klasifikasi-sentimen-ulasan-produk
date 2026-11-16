import matplotlib.pyplot as plt
import matplotlib.patches as patches

# 1. Flowchart Pipeline Umum (12 Tahap Wajib E.1 - E.12)
fig, ax = plt.subplots(figsize=(10, 14), dpi=300)
ax.set_xlim(0, 100)
ax.set_ylim(0, 140)
ax.axis('off')

# Title
ax.text(50, 136, "FLOWCHART PIPELINE UMUM PENGEMBANGAN AI\n(12 Tahapan Sistematis End-to-End)", 
        ha='center', va='center', fontsize=12, fontweight='bold', color='#0f172a')

stages = [
    ("1. Problem Identification", "Identifikasi sentimen ulasan e-commerce & kebutuhan feedback real-time", "#e0f2fe", "#0284c7"),
    ("2. Data Acquisition / Ingestion", "Akuisisi dataset PRDECT-ID Tokopedia (5.459 ulasan tabular)", "#e0f2fe", "#0284c7"),
    ("3. Data Understanding & Quality", "Audit kualitas: dimensi, missing value, duplikasi, & inkonsistensi", "#e0e7ff", "#4338ca"),
    ("4. Exploratory Data Analysis (EDA)", "Analisis distribusi kelas, panjang teks ulasan, & korelasi rating", "#e0e7ff", "#4338ca"),
    ("5. Data Preprocessing", "Case folding, cleaning simbol/URL, normalisasi slang, & stopword removal", "#fef3c7", "#d97706"),
    ("6. Feature Engineering & Vectorization", "Ekstraksi N-Gram (Unigram + Bigram) & Pembentukan Matriks Frekuensi", "#fef3c7", "#d97706"),
    ("7. Data Representation & Train-Test Split", "Pembagian Stratified Train (80% / 4.367) & Test (20% / 1.092)", "#f1f5f9", "#475569"),
    ("8. AI Method & Architecture Design", "Multinomial Naive Bayes + Laplace Smoothing + Polarity Rules", "#dcfce7", "#16a34a"),
    ("9. Model Training & Implementation", "Pelatihan probabilitas prior P(c) & likelihood P(w|c) pada training set", "#dcfce7", "#16a34a"),
    ("10. Testing & Multi-Experimentation", "Evaluasi 5 variasi eksperimen (TF-IDF vs CountVec, MNB vs CNB)", "#fae8ff", "#9333ea"),
    ("11. Performance Evaluation & Error Analysis", "Metrik Macro F1 (76.64%), Akurasi (85.35%), Confusion Matrix, & Misklasifikasi", "#fae8ff", "#9333ea"),
    ("12. Deployment & Final Output", "Aplikasi Web Interaktif (Flask + React), Online Learning (partial_fit), & Dashboard KPI", "#ffe4e6", "#e11d48")
]

y_pos = 125
box_height = 6.2
box_width = 82
x_pos = 9

for i, (title, desc, fill, stroke) in enumerate(stages):
    # Box
    rect = patches.FancyBboxPatch((x_pos, y_pos - box_height), box_width, box_height,
                                  boxstyle="round,pad=1.2,rounding_size=2.0",
                                  facecolor=fill, edgecolor=stroke, linewidth=1.6)
    ax.add_patch(rect)
    
    # Text
    ax.text(x_pos + 3, y_pos - box_height/2 + 1.1, title, fontsize=9.5, fontweight='bold', color='#0f172a', va='center')
    ax.text(x_pos + 3, y_pos - box_height/2 - 1.2, desc, fontsize=8.2, color='#334155', va='center')
    
    # Arrow to next
    if i < len(stages) - 1:
        ax.annotate('', xy=(50, y_pos - box_height - 3.8), xytext=(50, y_pos - box_height - 0.2),
                    arrowprops=dict(arrowstyle="->", color="#64748b", lw=1.8))
        
    y_pos -= 10.2

plt.tight_layout()
plt.savefig('report_assets/flowchart_pipeline_umum.png', bbox_inches='tight')
plt.close()
print("Saved flowchart_pipeline_umum.png")


# 2. Flowchart Khusus Mekanisme Algoritma Multinomial Naive Bayes
fig, ax = plt.subplots(figsize=(10, 13), dpi=300)
ax.set_xlim(0, 100)
ax.set_ylim(0, 130)
ax.axis('off')

ax.text(50, 126, "FLOWCHART KHUSUS MEKANISME MULTINOMIAL NAIVE BAYES\n(Preprocessing, Vektorisasi N-Gram, Laplace Smoothing, & Inferensi)", 
        ha='center', va='center', fontsize=11.5, fontweight='bold', color='#0f172a')

steps = [
    ("Input Teks Ulasan Pelanggan", "String mentah ulasan produk Tokopedia / E-Commerce", "#f8fafc", "#64748b", "ellipse"),
    ("Pipeline Preprocessing NLP", "1. Lowercase  2. Hapus URL/Angka/Tanda Baca  3. Slang Normalizer  4. Stopwords Removal", "#e0f2fe", "#0284c7", "rect"),
    ("Tokenisasi & N-Gram Extraction", "Membentuk Unigram (w_i) dan Bigram (w_i, w_i+1) untuk menangkap konteks", "#fef3c7", "#d97706", "rect"),
    ("CountVectorizer Feature Mapping", "Vektor frekuensi kata x = [x_1, x_2, ..., x_m] terhadap Vocabulary V (Dimensi = 14.890)", "#fef3c7", "#d97706", "rect"),
    ("Kalkulasi Prior Probability P(c)", "P(c) = N_c / N_total  (Positif: 46.1%, Negatif: 42.7%, Netral: 11.2%)", "#e0e7ff", "#4338ca", "rect"),
    ("Kalkulasi Likelihood dengan Laplace Smoothing", "P(w_i | c) = (count(w_i, c) + alpha) / (total_kata_c + alpha * |V|), dengan alpha = 1.0", "#dcfce7", "#16a34a", "rect"),
    ("Agregasi Log-Likelihood & Log-Prior", "Log P(c|x) = ln P(c) + sum_{i=1}^m [ x_i * ln P(w_i | c) ]  (Mencegah underflow numerik)", "#dcfce7", "#16a34a", "rect"),
    ("Evaluasi Aturan Konjungsi Kontrastif", "Apakah ulasan memuat kata transisi 'tetapi', 'namun', atau 'walaupun'?", "#fdf4ff", "#a855f7", "diamond"),
    ("Argmax Keputusan Sentimen Akhir", "c* = argmax_{c in {Positif, Netral, Negatif}} [ Log P(c|x) ]", "#fee2e2", "#dc2626", "rect"),
    ("Online Learning / Realtime Adaptation (Opsional)", "Memperbarui count(w_i, c) secara real-time via partial_fit() tanpa retrain ulang", "#f1f5f9", "#475569", "rect")
]

y_pos = 117
box_w = 84
box_h = 7.0

for i, (stitle, sdesc, fill, stroke, shape) in enumerate(steps):
    if shape == "ellipse":
        patch = patches.FancyBboxPatch((15, y_pos - box_h), 70, box_h,
                                      boxstyle="round,pad=1.5,rounding_size=3.5",
                                      facecolor=fill, edgecolor=stroke, linewidth=1.6)
        ax.add_patch(patch)
        ax.text(50, y_pos - box_h/2 + 1.0, stitle, fontsize=9.5, fontweight='bold', color='#0f172a', ha='center', va='center')
        ax.text(50, y_pos - box_h/2 - 1.2, sdesc, fontsize=8, color='#334155', ha='center', va='center')
    elif shape == "diamond":
        patch = patches.FancyBboxPatch((10, y_pos - box_h), 80, box_h,
                                      boxstyle="round,pad=1.0,rounding_size=2.0",
                                      facecolor=fill, edgecolor=stroke, linewidth=1.6, linestyle='--')
        ax.add_patch(patch)
        ax.text(50, y_pos - box_h/2 + 1.0, stitle, fontsize=9.5, fontweight='bold', color='#6b21a8', ha='center', va='center')
        ax.text(50, y_pos - box_h/2 - 1.2, sdesc, fontsize=8, color='#4b5563', ha='center', va='center')
    else:
        patch = patches.FancyBboxPatch((10, y_pos - box_h), 80, box_h,
                                      boxstyle="round,pad=1.0,rounding_size=2.0",
                                      facecolor=fill, edgecolor=stroke, linewidth=1.6)
        ax.add_patch(patch)
        ax.text(13, y_pos - box_h/2 + 1.1, stitle, fontsize=9.5, fontweight='bold', color='#0f172a', va='center')
        ax.text(13, y_pos - box_h/2 - 1.2, sdesc, fontsize=8, color='#334155', va='center')
        
    if i < len(steps) - 1:
        ax.annotate('', xy=(50, y_pos - box_h - 3.5), xytext=(50, y_pos - box_h - 0.2),
                    arrowprops=dict(arrowstyle="->", color="#64748b", lw=1.8))
    y_pos -= 11.2

plt.tight_layout()
plt.savefig('report_assets/flowchart_algoritma_naive_bayes.png', bbox_inches='tight')
plt.close()
print("Saved flowchart_algoritma_naive_bayes.png")
