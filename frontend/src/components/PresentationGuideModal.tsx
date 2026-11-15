import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { WorkspaceTabTarget } from './LandingPage'

interface PresentationGuideModalProps {
  open: boolean
  onClose: () => void
  onNavigateTab: (tab: WorkspaceTabTarget, sampleText?: string) => void
}

interface DemoStepItem {
  stepNumber: string
  duration: string
  title: string
  tabTarget: WorkspaceTabTarget
  sampleQuery?: string
  whatToShow: string
  scriptToSay: string
}

interface QaDefenseItem {
  id: string
  tag: string
  question: string
  shortAnswer: string
  academicDetail: string
}

const DEMO_FLOW_STEPS: DemoStepItem[] = [
  {
    stepNumber: '01',
    duration: '45 Detik',
    title: 'Pembukaan & Target Indikator Kinerja (Target KPI & NSS)',
    tabTarget: 'target-kpi',
    whatToShow:
      'Tunjukkan bahwa seluruh 5 indikator SLA sistem berstatus "Tercapai": Macro F1-Score 76,64% (Target >= 70%), Akurasi Uji Stratified 85,35% (Target >= 80%), dan NSS Korpus +3,4 pt dari 5.459 ulasan PRDECT-ID.',
    scriptToSay:
      '"Selamat siang Bapak/Ibu Dosen Penguji. Sistem kami mengklasifikasikan sentimen ulasan produk e-commerce Indonesia pada 5.459 data PRDECT-ID Tokopedia. Seluruh 5 indikator KPI utama telah melampaui target minimum, dengan Akurasi Uji 85,35% dan Macro F1-Score 76,64%."',
  },
  {
    stepNumber: '02',
    duration: '60 Detik',
    title: 'Metodologi Ilmiah, Confusion Matrix & 5 Eksperimen (Evaluasi Model)',
    tabTarget: 'evaluasi',
    whatToShow:
      'Perlihatkan pembagian data Stratified 80:20 (4.367 latih : 1.092 uji), klik salah satu sel di Confusion Matrix untuk mendemonstrasikan Error Analysis, lalu tunjukkan tabel perbandingan 5 eksperimen di bagian bawah.',
    scriptToSay:
      '"Sebelum menetapkan model akhir, kami menguji 5 konfigurasi eksperimen antara TF-IDF vs CountVectorizer dan MultinomialNB vs ComplementNB. Pemenangnya menggunakan N-Gram (1,2) dan Stopword Sastrawi dengan preservasi kata negasi."',
  },
  {
    stepNumber: '03',
    duration: '75 Detik',
    title: 'Uji Kalimat Real-Time, Kalkulator Rumus Bayes & Online Learning (Analisis Ulasan)',
    tabTarget: 'prediksi',
    sampleQuery:
      'Saya kira barangnya bagus, ternyata pas sampai tipis dan tutupnya rusak parah mengecewakan!',
    whatToShow:
      'Uji kalimat jebakan/kontrastif, buka "3 Tahap Penalaran NLP", tunjukkan "Simulasi Before vs After Preprocessing Sastrawi", buka "Kalkulator Rumus Bayes Langkah-demi-Langkah", dan tunjukkan tombol Online Learning (partial_fit).',
    scriptToSay:
      '"Di sini kami membuktikan bahwa sistem bukan kotak hitam. Setiap kalimat dipecah melalui normalisasi slang dan Sastrawi, dievaluasi konteks pragmatiknya, dan dijabarkan perhitungan rumus Teorema Bayes-nya dari Log-Prior hingga probabilitas akhir."',
  },
  {
    stepNumber: '04',
    duration: '45 Detik',
    title: 'Eksplorasi Psikografi 5 Emosi & 29 Kategori (Bedah Data & Peta Korpus)',
    tabTarget: 'bedah-data',
    whatToShow:
      'Saring ulasan berdasarkan 5 emosi pelanggan asli PRDECT-ID (Happy, Love, Sadness, Fear, Anger) dan rating bintang (★1 s.d. ★5) untuk melihat korelasi emosi terhadap keluhan produk.',
    scriptToSay:
      '"Keunggulan analisis kami tidak berhenti pada 3 kelas sentimen, melainkan membedah 5 dimensi psikografi emosi pelanggan (Happy, Love, Sadness, Fear, Anger) lintas 29 kategori produk Tokopedia."',
  },
  {
    stepNumber: '05',
    duration: '45 Detik',
    title: 'Sistem Pendukung Keputusan: Komparasi 2 Produk & Sentimen AI Chat',
    tabTarget: 'komparasi',
    whatToShow:
      'Klik salah satu tombol "Skenario Uji Cepat" (misal: Eggel Fortis 2 vs JBL Go 3) untuk menampilkan matriks perbandingan head-to-head, Indeks Reputasi (0-100), dan ekstraksi Pros & Cons otomatis.',
    scriptToSay:
      '"Sebagai luaran aplikatif bagi konsumen dan pelaku UMKM, kami menyediakan modul Komparasi 2 Produk head-to-head serta Sentimen AI Chat untuk menjawab pertanyaan analitik manajemen dari korpus."',
  },
  {
    stepNumber: '06',
    duration: '30 Detik',
    title: 'Pemrosesan Massal CSV & Katalog REST API (Batch CSV & Katalog API)',
    tabTarget: 'katalog-api',
    whatToShow:
      'Tunjukkan kode asli Scikit-Learn Pipeline serta terminal REST API Playground yang mengirim request JSON langsung ke backend Flask.',
    scriptToSay:
      '"Secara arsitektur perangkat lunak, backend Flask dan frontend React kami terpisah (decoupled) melalui REST API berformat JSON dan mendukung pemrosesan ratusan ulasan sekaligus melalui modul Batch CSV."',
  },
]

const QA_DEFENSE_LIST: QaDefenseItem[] = [
  {
    id: 'q1',
    tag: 'Algoritma & Pemilihan Model',
    question:
      '1. Mengapa memilih algoritma Multinomial Naive Bayes (MNB) dibandingkan Deep Learning seperti IndoBERT atau LSTM?',
    shortAnswer:
      'Karena MNB sangat cepat (< 25 ms di CPU biasa), transparan (Explainable AI via bobot log-likelihood tiap kata), tidak membutuhkan GPU mahal, dan mendukung Online Learning instan via partial_fit.',
    academicDetail:
      'Dalam klasifikasi teks pendek seperti ulasan e-commerce (rata-rata 8-25 kata), fitur leksikal unigram dan bigram (N-Gram 1,2) sudah sangat diskriminatif. Dengan MNB, kita mendapatkan akurasi uji 85,35% dan Macro F1 76,64% dengan waktu inferensi di bawah 25 milidetik serta interpretabilitas matematis penuh yang tidak dimiliki model black-box.',
  },
  {
    id: 'q2',
    tag: 'Evaluasi & Imbalanced Data',
    question:
      '2. Mengapa nilai F1-Score pada kelas Netral (50,20%) lebih rendah dibandingkan kelas Positif (92,57%) dan Negatif (87,16%)?',
    shortAnswer:
      'Karena karakteristik alami dataset e-commerce bersifat Imbalanced (kelas Netral/Bintang 3 hanya 11,2% dari total korpus) dan ulasan bintang 3 sering memuat kosakata campuran (memuji barang tapi mengeluhkan pengiriman).',
    academicDetail:
      'Dari 5.459 ulasan PRDECT-ID, kelas Positif berjumlah 2.517 (46,1%) dan Negatif 2.329 (42,7%), sedangkan Netral hanya 613 (11,2%). Pembeli yang memberi bintang 3 sering menulis kalimat campuran seperti "barang lumayan bagus tapi pengiriman agak lama", sehingga secara probabilitas leksikal beririsan dengan kelas Positif dan Negatif. Itulah alasan kami menggunakan Macro F1-Score (76,64%), bukan sekadar Akurasi, agar evaluasi tetap jujur terhadap kelas minoritas.',
  },
  {
    id: 'q3',
    tag: 'Fitur NLP & Negasi',
    question:
      '3. Naive Bayes kan mengasumsikan kata saling bebas (Bag-of-Words). Bagaimana sistem mengatasi kata negasi seperti "tidak bagus" atau "kurang rapi"?',
    shortAnswer:
      'Melalui 3 lapis pertahanan: (1) Ekstraksi Bigram N-Gram (1,2), (2) Pengecualian kata negasi dari daftar Stopword Sastrawi, dan (3) Kalibrasi aturan pragmatik untuk klausa kontras dan ekspektasi.',
    academicDetail:
      'Pada daftar stopword standar Sastrawi, kata "tidak", "bukan", "kurang", dan "belum" biasanya dihapus. Di pipeline kami (src/preprocess.py), kata-kata pengingkar tersebut secara eksplisit dipertahankan (Negation Preservation). Selanjutnya, vectorizer menggunakan ngram_range=(1, 2) sehingga pasangan kata "tidak bagus" disimpan sebagai satu fitur bigram utuh yang memiliki bobot negatif kuat.',
  },
  {
    id: 'q4',
    tag: 'Matematika Naive Bayes',
    question:
      '4. Apa fungsi parameter Alpha (Laplace / Lidstone Smoothing) pada Multinomial Naive Bayes jika ada kata baru yang belum pernah muncul di data latih?',
    shortAnswer:
      'Mencegah masalah Zero-Probability (peluang menjadi 0 total) ketika ada kata asing di kalimat uji, dengan menambahkan konstanta penghalus alpha pada pembilang dan penyebut.',
    academicDetail:
      'Rumus estimasi likelihood kata pada MultinomialNB adalah P(w_i | C_k) = (N_{w_i, C_k} + alpha) / (N_{C_k} + alpha * |V|), di mana |V| adalah ukuran kosakata (vocabulary). Tanpa alpha > 0, satu kata baru yang bernilai 0 akan membuat perkalian peluang seluruh kalimat menjadi 0 (atau log(0) = minus tak hingga).',
  },
  {
    id: 'q5',
    tag: 'Pragmatik & Kalimat Jebakan',
    question:
      '5. Bagaimana jika penguji mengetik kalimat sarkasme atau pembalikan ekspektasi seperti "Saya kira barangnya bagus dan tebal, ternyata tipis"?',
    shortAnswer:
      'Sistem dilengkapi lapisan Detektor Konteks Pragmatik (Pragmatic Context Analyzer) yang mengenali konstruksi "saya kira / kirain / ekspektasi" serta konjungsi kontrastif "ternyata / malah / tapi".',
    academicDetail:
      'Ketika klausa pembuka memuat penanda ekspektasi ("saya kira bagus") diikuti realita negatif ("ternyata tipis"), kata sifat setelah konjungsi realita diberikan bobot dominan dan sistem menampilkan kotak peringatan "Deteksi Kontras Ekspektasi vs Realita" beserta penjelasan linguistiknya.',
  },
  {
    id: 'q6',
    tag: 'Metodologi Pengujian',
    question:
      '6. Mengapa pembagian data menggunakan Stratified Split 80:20 dengan random_state=42?',
    shortAnswer:
      'Agar proporsi persentase kelas Positif (46,1%), Netral (11,2%), dan Negatif (42,7%) di data latih dan data uji tetap identik, serta eksperimen bersifat reproducible (konsisten saat diulang).',
    academicDetail:
      'Jika menggunakan random split biasa tanpa stratify=y pada dataset yang tidak seimbang, kelas minoritas (Netral) bisa terdistribusi secara timpang di data uji. Parameter random_state=42 mengunci generator angka acak sehingga kelima eksperimen diuji pada 1.092 sampel uji yang 100% sama.',
  },
  {
    id: 'q7',
    tag: 'Online Learning (partial_fit)',
    question:
      '7. Bagaimana cara kerja fitur "Latih Model Real-Time (Online Learning)" ketika ada tebakan yang dikoreksi oleh pengguna?',
    shortAnswer:
      'Menggunakan metode inkremental MultinomialNB.partial_fit() yang memperbarui matriks frekuensi kata secara langsung di memori dan menyimpan ulang model_sentimen.pkl tanpa melatih ulang dari nol.',
    academicDetail:
      'Karena Multinomial Naive Bayes berbasis perhitungan frekuensi cukup (sufficient statistics) per kelas, kita dapat menyuntikkan vektor ulasan baru beserta label koreksinya menggunakan partial_fit(X_new, [y_target], sample_weight=[...]) dalam waktu kurang dari 50 milidetik.',
  },
  {
    id: 'q8',
    tag: 'Preprocessing Bahasa Indonesia',
    question:
      '8. Mengapa di dalam ulasan e-commerce Indonesia normalisasi kamus slang harus dijalankan SEBELUM stopword removal Sastrawi?',
    shortAnswer:
      'Karena ulasan pembeli penuh singkatan tidak baku ("gk", "tdk", "bgt", "brg", "mantul", "kecewaaa"). Jika tidak dibakukan dulu, Sastrawi dan Vectorizer akan menganggapnya sebagai kata berbeda.',
    academicDetail:
      'Jika pembeli menulis "brg", "barangnya", dan "bRg", tanpa Case Folding dan Slang Normalization ketiganya akan menjadi 3 dimensi fitur yang terpisah (memperbesar sparsity matriks). Dengan menormalisasi "gk/ga/nggak" menjadi "tidak" lebih dulu, aturan proteksi negasi dan bigram "tidak bagus" dapat bekerja secara konsisten.',
  },
  {
    id: 'q9',
    tag: 'Metrik Bisnis & NSS',
    question:
      '9. Apa bedanya Akurasi Model (85,35%) dengan Net Sentiment Score / NSS (+3,4 pt)?',
    shortAnswer:
      'Akurasi mengukur seberapa pintar model AI menebak label dengan benar, sedangkan NSS mengukur kesehatan reputasi produk di mata pembeli ((% Positif - % Negatif) dari -100 s.d. +100).',
    academicDetail:
      'Akurasi dan Macro F1 adalah metrik evaluasi kinerja algoritma Machine Learning. Sebaliknya, Net Sentiment Score (NSS) dan Indeks Reputasi adalah metrik inteligensi bisnis (Business Intelligence) yang dihasilkan dari agregasi klasifikasi sentimen untuk membantu manajemen mengevaluasi kualitas kategori produk.',
  },
  {
    id: 'q10',
    tag: 'Dataset & Validitas Data',
    question:
      '10. Dari mana sumber dataset 5.459 ulasan yang digunakan pada sistem ini?',
    shortAnswer:
      'Berasal dari korpus publik terverifikasi PRDECT-ID (Product Review Dataset for Emotions Classification Tasks in Indonesian) dari transaksi nyata Tokopedia lintas 29 kategori produk.',
    academicDetail:
      'Setiap baris data pada PRDECT-ID dilengkapi teks ulasan asli pelanggan, nama produk, harga, lokasi kota toko, rating bintang (1 s.d. 5), label emosi pakar (Happy, Love, Sadness, Fear, Anger), dan label sentimen.',
  },
]

export const PresentationGuideModal: React.FC<PresentationGuideModalProps> = ({
  open,
  onClose,
  onNavigateTab,
}) => {
  const [activeMode, setActiveMode] = useState<'flow' | 'qa'>('flow')
  const [searchQa, setSearchQa] = useState('')

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  const filteredQa = QA_DEFENSE_LIST.filter((item) => {
    if (!searchQa.trim()) return true
    const q = searchQa.toLowerCase()
    return (
      item.question.toLowerCase().includes(q) ||
      item.shortAnswer.toLowerCase().includes(q) ||
      item.academicDetail.toLowerCase().includes(q) ||
      item.tag.toLowerCase().includes(q)
    )
  })

  return createPortal(
    <div
      className="cih-help-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="presentation-guide-title"
      onClick={onClose}
    >
      <div
        className="cih-help-modal-card"
        style={{ maxWidth: '860px', width: '95%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cih-help-modal-header">
          <div>
            <span className="cih-help-modal-kicker">
              MODE PRESENTASI &amp; CONTEKAN SIDANG · SHORTCUT: CTRL/CMD + K
            </span>
            <h2 id="presentation-guide-title" className="cih-help-modal-title">
              Panduan Alur Demo Presentasi &amp; Jawaban Pertanyaan Penguji
            </h2>
          </div>
          <button
            type="button"
            className="cih-help-modal-close"
            onClick={onClose}
            aria-label="Tutup panduan sidang"
          >
            ✕
          </button>
        </div>

        {/* Sub-navigation Tabs inside Modal */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '12px 24px',
            borderBottom: '1px solid var(--color-border-subtle, #e4e2dd)',
            background: '#ffffff',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveMode('flow')}
            className={`cih-endpoint-tab ${activeMode === 'flow' ? 'is-active' : ''}`}
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <span>1. Alur Demo Presentasi 5 Menit (6 Langkah)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('qa')}
            className={`cih-endpoint-tab ${activeMode === 'qa' ? 'is-active' : ''}`}
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <span>2. 10 Pertanyaan Jebakan Dosen Penguji &amp; Jawaban</span>
          </button>
        </div>

        <div className="cih-help-modal-body" style={{ maxHeight: '68vh' }}>
          {activeMode === 'flow' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {DEMO_FLOW_STEPS.map((item) => (
                <div
                  key={item.stepNumber}
                  className="cih-stat-card"
                  style={{ padding: '16px 18px', background: '#ffffff' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '12px',
                      flexWrap: 'wrap',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="cih-badge is-pos">LANGKAH {item.stepNumber}</span>
                      <span className="cih-badge is-neutral-outline">{item.duration}</span>
                      <strong style={{ fontSize: '0.96rem', color: '#27251e' }}>{item.title}</strong>
                    </div>
                    <button
                      type="button"
                      className="cih-btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                      onClick={() => {
                        onNavigateTab(item.tabTarget, item.sampleQuery)
                        onClose()
                      }}
                    >
                      <span>Buka Menu Ini Sekarang →</span>
                    </button>
                  </div>

                  <p style={{ margin: '0 0 10px', fontSize: '0.84rem', color: '#3f3d37', lineHeight: 1.55 }}>
                    <strong>Apa yang ditampilkan:</strong> {item.whatToShow}
                  </p>

                  <div className="cih-help-tip-box" style={{ padding: '10px 14px' }}>
                    <div className="cih-help-section-label" style={{ marginBottom: '4px' }}>
                      Kalimat Presentasi Siap Baca:
                    </div>
                    <p className="cih-help-tip-quote" style={{ fontSize: '0.82rem' }}>
                      {item.scriptToSay}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <input
                  type="text"
                  value={searchQa}
                  onChange={(e) => setSearchQa(e.target.value)}
                  placeholder="Cari topik pertanyaan (misal: IndoBERT, Netral, Sastrawi, Laplace, Negasi, NSS)..."
                  className="cih-input"
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              {filteredQa.map((qa) => (
                <div
                  key={qa.id}
                  className="cih-stat-card"
                  style={{ padding: '16px 18px', background: '#ffffff' }}
                >
                  <div style={{ marginBottom: '6px' }}>
                    <span className="cih-badge is-neutral-outline">{qa.tag}</span>
                  </div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '0.95rem', color: '#27251e', lineHeight: 1.4 }}>
                    {qa.question}
                  </h4>
                  <div
                    className="cih-help-tip-box"
                    style={{ padding: '10px 14px', marginBottom: '8px' }}
                  >
                    <div className="cih-help-section-label" style={{ marginBottom: '3px' }}>
                      Jawaban Inti (Langsung ke Poin):
                    </div>
                    <p style={{ margin: 0, fontSize: '0.84rem', fontWeight: 600, color: '#27251e', lineHeight: 1.5 }}>
                      {qa.shortAnswer}
                    </p>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#57554f', lineHeight: 1.58 }}>
                    <strong>Penjelasan Akademis Lengkap:</strong> {qa.academicDetail}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cih-help-modal-footer">
          <span className="cih-help-footer-note">
            Tips: Anda dapat membuka panduan ini kapan saja dengan menekan <code>Ctrl + K</code> (atau <code>⌘ + K</code> di Mac)
          </span>
          <button
            type="button"
            className="cih-btn-primary"
            style={{ padding: '7px 16px', fontSize: '0.8rem' }}
            onClick={onClose}
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
