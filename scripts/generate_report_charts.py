import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import json
import os

os.makedirs('report_assets', exist_ok=True)

# Set styling for academic thesis
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.size'] = 10
plt.rcParams['axes.titlesize'] = 12
plt.rcParams['axes.labelsize'] = 11

# 1. Class Distribution Chart
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4.5), dpi=300)
labels = ['Positif', 'Negatif', 'Netral']
counts = [2517, 2329, 613]
colors = ['#10b981', '#ef4444', '#f59e0b']

# Bar Chart
bars = ax1.bar(labels, counts, color=colors, width=0.55, edgecolor='#333333', linewidth=1)
ax1.set_title('Distribusi Jumlah Sampel per Kelas Sentimen', pad=12, fontweight='bold')
ax1.set_ylabel('Jumlah Sampel Ulasan')
ax1.set_ylim(0, 3000)
ax1.grid(axis='y', linestyle='--', alpha=0.6)
for bar in bars:
    yval = bar.get_height()
    ax1.text(bar.get_x() + bar.get_width()/2.0, yval + 50, f'{yval:,} ({yval/sum(counts)*100:.1f}%)', 
             ha='center', va='bottom', fontsize=9, fontweight='semibold')

# Pie Chart
wedges, texts, autotexts = ax2.pie(counts, labels=labels, autopct='%1.1f%%', colors=colors, 
                                   startangle=140, explode=(0.04, 0.04, 0.08),
                                   wedgeprops={'edgecolor': '#333333', 'linewidth': 1})
for autotext in autotexts:
    autotext.set_color('white')
    autotext.set_fontweight('bold')
ax2.set_title('Proporsi Relatif Kelas Sentimen Korpus PRDECT-ID', pad=12, fontweight='bold')

plt.tight_layout()
plt.savefig('report_assets/class_distribution.png', bbox_inches='tight')
plt.close()
print("Saved class_distribution.png")

# 2. Confusion Matrix Heatmap
cm = np.array([
    [455, 24, 24],
    [14, 63, 46],
    [11, 41, 414]
])
fig, ax = plt.subplots(figsize=(6.5, 5.2), dpi=300)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=True, ax=ax,
            xticklabels=['Positif', 'Netral', 'Negatif'],
            yticklabels=['Positif', 'Netral', 'Negatif'],
            annot_kws={'size': 13, 'weight': 'bold'},
            linewidths=1.2, linecolor='#e2e8f0')
ax.set_title('Confusion Matrix Model Multinomial Naive Bayes\n(CountVectorizer + Unigram-Bigram, Test N=1.092)', pad=14, fontweight='bold')
ax.set_xlabel('Kelas Prediksi Model', fontweight='bold', labelpad=10)
ax.set_ylabel('Kelas Sebenarnya (Ground Truth)', fontweight='bold', labelpad=10)

plt.tight_layout()
plt.savefig('report_assets/confusion_matrix.png', bbox_inches='tight')
plt.close()
print("Saved confusion_matrix.png")

# 3. Model Comparison Bar Chart
experiments = [
    'Exp 1: TF-IDF + MNB',
    'Exp 2: TF-IDF + CNB',
    'Exp 3: CountVec + MNB (Dipilih)',
    'Exp 4: CountVec + CNB',
    'Exp 5: TF-IDF + MNB (Raw)'
]
accuracy = [86.54, 86.17, 85.35, 85.35, 85.90]
f1_macro = [72.14, 74.48, 76.64, 71.26, 70.89]

x = np.arange(len(experiments))
width = 0.35

fig, ax = plt.subplots(figsize=(10.5, 5), dpi=300)
rects1 = ax.bar(x - width/2, accuracy, width, label='Akurasi Uji (%)', color='#0284c7', edgecolor='#1e293b')
rects2 = ax.bar(x + width/2, f1_macro, width, label='Macro F1-Score (%)', color='#0d9488', edgecolor='#1e293b')

ax.set_ylabel('Persentase Nilai (%)', fontweight='bold')
ax.set_title('Perbandingan Kinerja 5 Eksperimen Model Klasifikasi Sentimen', pad=14, fontweight='bold')
ax.set_xticks(x)
ax.set_xticklabels(experiments, rotation=15, ha='right', fontsize=9.5)
ax.legend(loc='lower right', frameon=True, shadow=True)
ax.set_ylim(60, 95)
ax.axhline(70, color='#dc2626', linestyle='--', linewidth=1.2, label='Target Minimum Macro F1 (70%)')
ax.grid(axis='y', linestyle=':', alpha=0.7)

for rect in rects1:
    h = rect.get_height()
    ax.annotate(f'{h:.2f}%', xy=(rect.get_x() + rect.get_width()/2, h), xytext=(0, 3),
                textcoords="offset points", ha='center', va='bottom', fontsize=8.5, fontweight='bold')
for rect in rects2:
    h = rect.get_height()
    ax.annotate(f'{h:.2f}%', xy=(rect.get_x() + rect.get_width()/2, h), xytext=(0, 3),
                textcoords="offset points", ha='center', va='bottom', fontsize=8.5, fontweight='bold', color='#065f46')

plt.tight_layout()
plt.savefig('report_assets/model_comparison.png', bbox_inches='tight')
plt.close()
print("Saved model_comparison.png")

# 4. Top Indicative Tokens (Log-Likelihood Difference)
tokens_pos = ['bagus', 'cepat', 'sesuai', 'mantap', 'puas', 'terima kasih', 'original', 'rapi']
scores_pos = [3.82, 3.45, 3.21, 3.10, 2.85, 2.72, 2.65, 2.41]

tokens_neg = ['rusak', 'kecewa', 'jelek', 'pecah', 'palsu', 'tidak sesuai', 'lama', 'hilang']
scores_neg = [-3.91, -3.74, -3.52, -3.38, -3.12, -2.95, -2.81, -2.60]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4.5), dpi=300)
ax1.barh(tokens_pos[::-1], scores_pos[::-1], color='#10b981', edgecolor='#065f46')
ax1.set_title('Top Kata/Fitur Sentimen Positif (Log-Odds Bobot)', fontweight='bold')
ax1.set_xlabel('Relative Log-Likelihood Ratio')
ax1.grid(axis='x', linestyle='--', alpha=0.6)

ax2.barh(tokens_neg[::-1], [abs(x) for x in scores_neg[::-1]], color='#ef4444', edgecolor='#991b1b')
ax2.set_title('Top Kata/Fitur Sentimen Negatif (Log-Odds Bobot)', fontweight='bold')
ax2.set_xlabel('|Relative Log-Likelihood Ratio|')
ax2.grid(axis='x', linestyle='--', alpha=0.6)

plt.tight_layout()
plt.savefig('report_assets/top_tokens.png', bbox_inches='tight')
plt.close()
print("Saved top_tokens.png")
