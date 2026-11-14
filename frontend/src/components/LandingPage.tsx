import { useEffect, useRef, useState } from 'react'
import '../styles/steep-landing.css'

export type WorkspaceTabTarget = 'prediksi' | 'batch' | 'komparasi' | 'evaluasi'

interface LandingPageProps {
  corpusTotal: number
  accuracyPct: string
  f1MacroPct: string
  totalCategories: number
  onEnterWorkspace: (targetTab?: WorkspaceTabTarget, initialReviewText?: string) => void
}

interface ShowcaseTabItem {
  id: string
  label: string
  targetTab: WorkspaceTabTarget
  categoryTag: string
  title: string
  description: string
  bullets: string[]
  ctaLabel: string
  sampleHeadline: string
  sampleVerdict: string
  sampleConfidence: string
  tokens: { label: string; warm?: boolean }[]
  probabilities: { label: string; pct: number }[]
}

const SHOWCASE_TABS: ShowcaseTabItem[] = [
  {
    id: 'ai-single',
    label: 'Analisis AI',
    targetTab: 'prediksi',
    categoryTag: 'Inferensi Ulasan Tunggal',
    title: 'Uji kalimat ulasan dan baca kontribusi bobot tiap kata',
    description:
      'Setiap ulasan dinormalisasi dari singkatan percakapan pasar Indonesia, dipetakan ke matriks TF-IDF sublinear, lalu dihitung distribusi peluangnya pada tiga kelas sentimen.',
    bullets: [
      'Rincian log-likelihood per kata kunci secara transparan',
      'Sinkronisasi otomatis dengan katalog produk asli korpus PRDECT-ID',
      'Koreksi instan melalui pembelajaran inkremental partial_fit',
    ],
    ctaLabel: 'Buka Analisis Ulasan',
    sampleHeadline: '“Barang original, suara jernih, pengemasan rapi dan baterai awet seharian.”',
    sampleVerdict: 'Sentimen Positif',
    sampleConfidence: '99,4% keyakinan',
    tokens: [
      { label: 'awet +2.37' },
      { label: 'original +1.38' },
      { label: 'jernih +1.64' },
      { label: 'rapi +1.52' },
      { label: 'seharian +0.91', warm: true },
    ],
    probabilities: [
      { label: 'Peluang Positif', pct: 99.4 },
      { label: 'Peluang Netral', pct: 0.4 },
      { label: 'Peluang Negatif', pct: 0.2 },
    ],
  },
  {
    id: 'compare',
    label: 'Komparasi Produk',
    targetTab: 'komparasi',
    categoryTag: 'Evaluasi Berdampingan',
    title: 'Bandingkan indeks reputasi dua produk secara objektif',
    description:
      'Susun perbandingan langsung antara dua kandidat produk dari Tokopedia, Shopee, Lazada, maupun Blibli lengkap dengan distribusi sentimen dan bukti ulasan terverifikasi.',
    bullets: [
      'Perhitungan skor indeks reputasi skala 0 sampai 100',
      'Ekstraksi otomatis titik keunggulan dan keluhan dominan',
      'Filter lintas 30 subkategori industri e-commerce',
    ],
    ctaLabel: 'Buka Komparasi 2 Produk',
    sampleHeadline: 'Kandidat B unggul +18,4 poin indeks reputasi pada aspek daya tahan fisik',
    sampleVerdict: 'Indeks 91,2 / 100',
    sampleConfidence: 'Sangat Direkomendasikan',
    tokens: [
      { label: 'Kandidat A: 72,8' },
      { label: 'Kandidat B: 91,2', warm: true },
      { label: 'Selisih +18,4 poin' },
      { label: '30 Subkategori' },
    ],
    probabilities: [
      { label: 'Rasio Ulasan Positif (Kandidat B)', pct: 88.5 },
      { label: 'Rasio Ulasan Netral (Kandidat B)', pct: 7.5 },
      { label: 'Rasio Ulasan Negatif (Kandidat B)', pct: 4.0 },
    ],
  },
  {
    id: 'batch',
    label: 'Batch CSV',
    targetTab: 'batch',
    categoryTag: 'Pemrosesan Skala Besar',
    title: 'Klasifikasikan ratusan ulasan pelanggan dalam satu unggahan',
    description:
      'Unggah berkas CSV hasil ekspor toko atau riset pasar untuk memperoleh pelabelan massal beserta ringkasan proporsi kepuasan dan berkas hasil siap unduh.',
    bullets: [
      'Deteksi otomatis kolom teks ulasan pada berkas CSV',
      'Rekapitulasi persentase kelas positif, netral, dan negatif',
      'Ekspor laporan terstruktur untuk audit kualitas produk',
    ],
    ctaLabel: 'Jalankan Batch CSV',
    sampleHeadline: '500 baris ulasan selesai diklasifikasikan dalam 140 milidetik',
    sampleVerdict: 'Batch Selesai',
    sampleConfidence: '3.570 ulasan/detik',
    tokens: [
      { label: 'Positif: 342 baris' },
      { label: 'Netral: 64 baris' },
      { label: 'Negatif: 94 baris', warm: true },
      { label: 'Unduh CSV Hasil' },
    ],
    probabilities: [
      { label: 'Proporsi Sentimen Positif', pct: 68.4 },
      { label: 'Proporsi Sentimen Netral', pct: 12.8 },
      { label: 'Proporsi Sentimen Negatif', pct: 18.8 },
    ],
  },
  {
    id: 'evaluation',
    label: 'Evaluasi & Metrik',
    targetTab: 'evaluasi',
    categoryTag: 'Validasi Akademik',
    title: 'Audit performa model lewat Confusion Matrix dan 5 skenario uji',
    description:
      'Setiap keputusan arsitektur diuji secara terukur pada data uji terpisah rasio 80:20, membandingkan CountVectorizer, TF-IDF unigram-bigram, serta variasi smoothing Laplace.',
    bullets: [
      'Matriks konfusi interaktif tiga kelas sentimen',
      'Eksplorasi kamus kata kunci terkuat per polaritas',
      'Mode cetak laporan akademik berformat A4 bersih',
    ],
    ctaLabel: 'Lihat Evaluasi Model',
    sampleHeadline: 'Pipeline terbaik: CountVectorizer + MultinomialNB (N-Gram 1,2 · alpha=0.5)',
    sampleVerdict: 'Akurasi 85,90%',
    sampleConfidence: 'Macro F1 77,28%',
    tokens: [
      { label: 'Precision 79,4%' },
      { label: 'Recall 75,8%' },
      { label: '5 Eksperimen Pipeline' },
      { label: 'Uji 1.092 Sampel', warm: true },
    ],
    probabilities: [
      { label: 'Akurasi Klasifikasi Keseluruhan', pct: 85.9 },
      { label: 'Weighted F1-Score', pct: 85.9 },
      { label: 'Macro F1-Score', pct: 77.3 },
    ],
  },
]

const COMPOSER_PRESETS = [
  'Barang original 100%, pengemasan super rapi dan pengiriman cepat sampai.',
  'Bahannya tipis menerawang dan jahitan banyak yang lepas saat dicuci pertama.',
  'Kualitas standar sesuai harga, lumayan untuk pemakaian harian.',
]

const MARQUEE_ITEMS = [
  'Korpus PRDECT-ID Terverifikasi',
  'Tokopedia',
  'Shopee Indonesia',
  'Lazada',
  'Blibli',
  'ZALORA',
  'Sociolla',
  'TF-IDF N-Gram (1,2)',
  'Multinomial Naive Bayes',
  'Sastrawi NLP Bahasa Indonesia',
  'Online Learning partial_fit',
]

export function LandingPage({
  corpusTotal,
  accuracyPct,
  f1MacroPct,
  totalCategories,
  onEnterWorkspace,
}: LandingPageProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [navScrolled, setNavScrolled] = useState(false)
  const [composerText, setComposerText] = useState('')
  const [presetIndex, setPresetIndex] = useState(0)
  const [showModelHint, setShowModelHint] = useState(false)
  const [activeTabIdx, setActiveTabIdx] = useState(0)
  const [tabsPaused, setTabsPaused] = useState(false)

  // Scroll listener for subtle frosted nav
  useEffect(() => {
    const onScroll = () => {
      setNavScrolled(window.scrollY > 18)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // IntersectionObserver for Steep's staggered editorial entrance animations
  useEffect(() => {
    const container = rootRef.current
    if (!container) return
    const elements = Array.from(container.querySelectorAll('.steep-reveal'))

    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Auto-advancing showcase tabs (matches Steep's progressFill 6s cycle)
  useEffect(() => {
    if (tabsPaused) return
    const timer = window.setInterval(() => {
      setActiveTabIdx(prev => (prev + 1) % SHOWCASE_TABS.length)
    }, 6000)
    return () => window.clearInterval(timer)
  }, [tabsPaused, activeTabIdx])

  const scrollToId = (id: string) => {
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleCycleSample = () => {
    const nextSample = COMPOSER_PRESETS[presetIndex % COMPOSER_PRESETS.length]
    setComposerText(nextSample)
    setPresetIndex(prev => prev + 1)
  }

  const handleComposerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const query = composerText.trim() || COMPOSER_PRESETS[0]
    onEnterWorkspace('prediksi', query)
  }

  const currentShowcase = SHOWCASE_TABS[activeTabIdx]

  return (
    <div className="steep-landing" ref={rootRef}>
      <div className="steep-paper-grain" aria-hidden="true" />

      {/* 1. Whisper-Quiet Top Navigation */}
      <div className={`steep-nav-wrap ${navScrolled ? 'is-scrolled' : ''}`}>
        <header className="steep-nav">
          <button
            type="button"
            className="steep-brand"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span className="steep-brand-mark" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07L19.07 4.93" strokeLinecap="round" />
                <circle cx="12" cy="12" r="3.2" fill="#ffffff" stroke="currentColor" strokeWidth="1.7" />
              </svg>
            </span>
            <span>sentimen</span>
          </button>

          <nav className="steep-nav-links" aria-label="Navigasi Halaman Utama">
            <button type="button" className="steep-nav-link" onClick={() => scrollToId('fondasi')}>
              Arsitektur
            </button>
            <button type="button" className="steep-nav-link" onClick={() => scrollToId('eksplorasi')}>
              Modul Produk
            </button>
            <button type="button" className="steep-nav-link" onClick={() => scrollToId('transparansi')}>
              Riset &amp; Bukti
            </button>
            <button type="button" className="steep-nav-link" onClick={() => scrollToId('metrik')}>
              Fondasi Metrik
            </button>
          </nav>

          <div className="steep-nav-actions">
            <button
              type="button"
              className="steep-nav-link"
              onClick={() => onEnterWorkspace('evaluasi')}
            >
              Lihat Metrik
            </button>
            <button
              type="button"
              className="steep-pill-filled sm"
              onClick={() => onEnterWorkspace('prediksi')}
            >
              <span>Buka Workspace</span>
              <span className="steep-btn-arrow-mask" aria-hidden="true">
                <span className="steep-btn-arrow-glyph">→</span>
              </span>
            </button>
          </div>
        </header>
      </div>

      {/* 2. Hero Editorial Spread + Floating Product Artifacts */}
      <section className="steep-hero">
        <div className="steep-container">
          <div className="steep-hero-center">
            <button
              type="button"
              className="steep-announcement steep-reveal"
              onClick={() => onEnterWorkspace('komparasi')}
            >
              <span>Baru di Sentimen: Komparasi Lintas Marketplace &amp; Online Learning</span>
              <span className="steep-announcement-muted">→</span>
            </button>

            <h1
              className="steep-display steep-reveal"
              style={{ '--reveal-delay': '70ms' } as React.CSSProperties}
            >
              Untuk keputusan produk yang <em>berpijak</em> pada suara pelanggan
            </h1>

            <p
              className="steep-hero-sub steep-reveal"
              style={{ '--reveal-delay': '140ms' } as React.CSSProperties}
            >
              Sentimen mengubah ribuan ulasan e-commerce berbahasa Indonesia menjadi metrik
              probabilistik yang terukur, transparan, dan siap ditindaklanjuti dalam hitungan
              milidetik.
            </p>

            <div
              className="steep-btn-row steep-reveal"
              style={{ '--reveal-delay': '210ms' } as React.CSSProperties}
            >
              <button
                type="button"
                className="steep-pill-filled"
                onClick={() => onEnterWorkspace('prediksi')}
              >
                <span>Mulai Analisis</span>
                <span className="steep-btn-arrow-mask" aria-hidden="true">
                  <span className="steep-btn-arrow-glyph">→</span>
                </span>
              </button>
              <button
                type="button"
                className="steep-pill-ghost"
                onClick={() =>
                  onEnterWorkspace(
                    'prediksi',
                    'Barang original 100%, pengemasan rapi pakai bubble wrap tebal dan pengiriman cepat!'
                  )
                }
              >
                <span>Coba Sampel Langsung</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating UI Artifacts Collage */}
        <div className="steep-collage-stage">
          {/* Artifact 1: 5-Row Category Table + Avatar Presence */}
          <div
            className="steep-artifact float-slow steep-reveal"
            style={{ '--reveal-delay': '240ms' } as React.CSSProperties}
          >
            <div className="steep-avatar-presence pos-left" aria-hidden="true">
              <svg className="steep-cursor-pointer" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 2l11 4.2-4.8 1.8L6.4 13z" />
              </svg>
              <span className="steep-avatar-circle">FR</span>
            </div>

            <div className="steep-artifact-eyebrow">
              <span>Distribusi Kategori Korpus</span>
              <span>{totalCategories} Subkategori</span>
            </div>
            <div className="steep-artifact-metric-row">
              <span className="steep-artifact-metric">
                {corpusTotal.toLocaleString('id-ID')} Ulasan
              </span>
              <span className="steep-artifact-delta">↑ Terverifikasi</span>
            </div>

            <table className="steep-mini-table" aria-label="Sampel Distribusi Kategori">
              <thead>
                <tr>
                  <th>Kategori Produk</th>
                  <th>Indeks Positif</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Elektronik & Audio', pct: 84 },
                  { name: 'Fashion Pria & Wanita', pct: 79 },
                  { name: 'Rumah Tangga & Dapur', pct: 88 },
                  { name: 'Kesehatan & Perawatan', pct: 91 },
                  { name: 'Otomotif & Hobi', pct: 82 },
                ].map(row => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>
                      <span className="steep-mini-bar-wrap">
                        <span className="steep-mini-bar" aria-hidden="true">
                          <span
                            className="steep-mini-bar-fill"
                            style={{ width: `${row.pct}%` }}
                          />
                        </span>
                        <span>{row.pct}%</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Center Stack: Interactive AI Composer + Quick Prompt */}
          <div
            className="steep-center-stack steep-reveal"
            style={{ '--reveal-delay': '300ms' } as React.CSSProperties}
          >
            <form className="steep-composer-card" onSubmit={handleComposerSubmit}>
              <div className="steep-composer-label-row">
                <span>Uji Langsung Komposer Sentimen AI</span>
                <span>TF-IDF + MultinomialNB</span>
              </div>

              <textarea
                rows={3}
                className="steep-composer-input"
                placeholder="Tanyakan atau tempel ulasan produk berbahasa Indonesia..."
                value={composerText}
                onChange={e => setComposerText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleComposerSubmit(e)
                  }
                }}
              />

              {showModelHint && (
                <div
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-slate-gray)',
                    backgroundColor: 'var(--color-mist-gray)',
                    padding: '8px 12px',
                    borderRadius: '12px',
                  }}
                >
                  Tekan kirim untuk membuka ruang analisis lengkap beserta perhitungan bobot kata
                  log-likelihood dan foto katalog produk asli.
                </div>
              )}

              <div className="steep-composer-footer">
                <div className="steep-composer-tools">
                  <button
                    type="button"
                    className="steep-ghost-circle-btn"
                    onClick={handleCycleSample}
                    title="Muat contoh ulasan berikutnya"
                    aria-label="Muat contoh ulasan"
                  >
                    @
                  </button>
                  <button
                    type="button"
                    className="steep-ghost-circle-btn"
                    onClick={() => setShowModelHint(prev => !prev)}
                    title="Informasi arsitektur model"
                    aria-label="Informasi model"
                  >
                    i
                  </button>
                  <button
                    type="button"
                    className="steep-composer-preset-chip"
                    onClick={handleCycleSample}
                  >
                    Isi contoh ulasan
                  </button>
                </div>

                <button
                  type="submit"
                  className="steep-send-circle-btn"
                  aria-label="Analisis ulasan sekarang"
                  title="Analisis ulasan sekarang"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14m0 0l-5-5m5 5l-5 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </form>

            <div className="steep-artifact">
              <div className="steep-artifact-eyebrow">
                <span>Kecepatan Inferensi Rata-rata</span>
                <span>Real-time API</span>
              </div>
              <div className="steep-artifact-metric-row">
                <span className="steep-artifact-metric">&lt; 25 ms / ulasan</span>
                <span className="steep-artifact-delta">Macro F1 {f1MacroPct}%</span>
              </div>
            </div>
          </div>

          {/* Right Stack: Stat Card with Gestural Sienna Line Chart + Radial Ring */}
          <div
            className="steep-right-stack steep-reveal"
            style={{ '--reveal-delay': '360ms' } as React.CSSProperties}
          >
            <div className="steep-artifact float-delayed">
              <div className="steep-artifact-eyebrow">
                <span>Akurasi Data Uji (80:20)</span>
                <span>Eksperimen 1-5</span>
              </div>
              <div className="steep-artifact-metric-row">
                <span className="steep-artifact-metric">{accuracyPct}%</span>
                <span className="steep-artifact-delta">↑ +8,6% vs baseline</span>
              </div>

              {/* Minimal Gestural Line Chart in #5d2a1a Sienna Brown (Zero gridlines, zero axes) */}
              <svg
                className="steep-gestural-svg"
                viewBox="0 0 240 68"
                fill="none"
                aria-label="Kurva peningkatan akurasi eksperimen"
              >
                <path
                  d="M6 56 C 46 54, 68 42, 102 38 C 136 34, 158 19, 194 15 C 212 13, 224 10, 234 8"
                  stroke="#5d2a1a"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <circle cx="234" cy="8" r="3.5" fill="#5d2a1a" />
              </svg>
            </div>

            <div className="steep-artifact">
              <div className="steep-avatar-presence pos-right" aria-hidden="true">
                <svg className="steep-cursor-pointer" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 2l11 4.2-4.8 1.8L6.4 13z" />
                </svg>
                <span className="steep-avatar-circle neutral">AI</span>
              </div>

              <div className="steep-radial-row">
                <div>
                  <div className="steep-artifact-eyebrow" style={{ marginBottom: '6px' }}>
                    <span>Target Standar PRD</span>
                  </div>
                  <div className="steep-artifact-metric">{f1MacroPct}%</div>
                  <div className="steep-artifact-delta">Melampaui ambang 70,0%</div>
                </div>

                {/* Gestural Radial Ring in #5d2a1a Sienna Brown */}
                <svg width="58" height="58" viewBox="0 0 58 58" aria-hidden="true">
                  <circle
                    cx="29"
                    cy="29"
                    r="23"
                    fill="none"
                    stroke="#f2f2f3"
                    strokeWidth="4.5"
                  />
                  <circle
                    cx="29"
                    cy="29"
                    r="23"
                    fill="none"
                    stroke="#5d2a1a"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeDasharray="144.5"
                    strokeDashoffset="32"
                    transform="rotate(-90 29 29)"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Continuous Ecosystem Marquee */}
      <div className="steep-marquee-band">
        <p className="steep-marquee-caption">
          Mendukung analisis ulasan lintas marketplace dan arsitektur NLP Bahasa Indonesia
        </p>
        <div className="steep-marquee-viewport" aria-label="Ekosistem platform dan teknologi">
          <div className="steep-marquee-track">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
              <span key={idx} className="steep-marquee-item">
                <span>{item}</span>
                <span className="steep-marquee-dot" aria-hidden="true" />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Alternating Fog Section: "Standar baru dalam analitik sentimen" */}
      <section id="fondasi" className="steep-section fog">
        <div className="steep-container">
          <div className="steep-section-header steep-reveal">
            <span className="steep-tag">Arsitektur Sistem</span>
            <h2 className="steep-h2-lg">
              Pendekatan baru dalam <em>analitik</em> ulasan produk
            </h2>
            <p className="steep-subhead">
              Tidak sekadar label positif atau negatif. Setiap tahap pemrosesan teks dirancang agar
              tim produk, peneliti, dan pelaku usaha memahami alasan di balik persepsi pembeli.
            </p>
          </div>

          <div className="steep-neutral-grid-3">
            <article
              className="steep-neutral-card steep-reveal"
              style={{ '--reveal-delay': '60ms' } as React.CSSProperties}
            >
              <div>
                <span className="steep-tag">Pra-pemrosesan Bahasa</span>
                <h3 className="steep-neutral-card-title">
                  Normalisasi Slang &amp; Penanganan Negasi
                </h3>
                <p className="steep-neutral-card-body">
                  Mengurai bahasa percakapan khas belanja daring Indonesia, menyaring stopword
                  Sastrawi secara selektif tanpa menghilangkan kata penyangkal seperti tidak,
                  kurang, atau belum.
                </p>
              </div>
              <button
                type="button"
                className="steep-text-link"
                onClick={() => onEnterWorkspace('prediksi')}
              >
                <span className="steep-text-link-label">Uji pra-pemrosesan</span>
                <span className="steep-btn-arrow-glyph">→</span>
              </button>
            </article>

            <article
              className="steep-neutral-card steep-reveal"
              style={{ '--reveal-delay': '130ms' } as React.CSSProperties}
            >
              <div>
                <span className="steep-tag">Inferensi Probabilistik</span>
                <h3 className="steep-neutral-card-title">
                  Ekstraksi Fitur N-Gram &amp; Multinomial NB
                </h3>
                <p className="steep-neutral-card-body">
                  Mengombinasikan unigram dan bigram untuk menangkap frasa kunci seperti tidak
                  sesuai atau sangat rapi, menghasilkan distribusi probabilitas yang terkalibrasi.
                </p>
              </div>
              <button
                type="button"
                className="steep-text-link"
                onClick={() => onEnterWorkspace('evaluasi')}
              >
                <span className="steep-text-link-label">Bandingkan 5 pipeline</span>
                <span className="steep-btn-arrow-glyph">→</span>
              </button>
            </article>

            <article
              className="steep-neutral-card steep-reveal"
              style={{ '--reveal-delay': '200ms' } as React.CSSProperties}
            >
              <div>
                <span className="steep-tag">Adaptasi Real-Time</span>
                <h3 className="steep-neutral-card-title">
                  Pembelajaran Inkremental partial_fit
                </h3>
                <p className="steep-neutral-card-body">
                  Perbarui bobot probabilitas model secara langsung dari antarmuka saat menemukan
                  istilah produk baru di pasar tanpa perlu melatih ulang keseluruhan korpus.
                </p>
              </div>
              <button
                type="button"
                className="steep-text-link"
                onClick={() => onEnterWorkspace('prediksi')}
              >
                <span className="steep-text-link-label">Coba koreksi langsung</span>
                <span className="steep-btn-arrow-glyph">→</span>
              </button>
            </article>
          </div>
        </div>
      </section>

      {/* 5. Interactive Tabbed Product Showcase ("Engage everyone") */}
      <section id="eksplorasi" className="steep-section">
        <div className="steep-container">
          <div className="steep-section-header centered steep-reveal">
            <span className="steep-tag">Modul Terpadu</span>
            <h2 className="steep-h2-lg">
              Satu ruang kerja untuk <em>setiap</em> skala analisis
            </h2>
            <p className="steep-subhead">
              Dari inspeksi satu kalimat ulasan hingga komparasi reputasi antarmerek dan validasi
              metrik akademik.
            </p>
          </div>

          <div
            className="steep-tabs-bar steep-reveal"
            role="tablist"
            aria-label="Modul Ruang Kerja Sentimen"
            onMouseEnter={() => setTabsPaused(true)}
            onMouseLeave={() => setTabsPaused(false)}
          >
            {SHOWCASE_TABS.map((tab, idx) => {
              const isActive = idx === activeTabIdx
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`steep-tab-pill ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTabIdx(idx)}
                >
                  <span>{tab.label}</span>
                  {isActive && !tabsPaused && (
                    <span key={tab.id} className="steep-tab-progress" aria-hidden="true" />
                  )}
                </button>
              )
            })}
          </div>

          <div
            className="steep-showcase-shell steep-reveal"
            onMouseEnter={() => setTabsPaused(true)}
            onMouseLeave={() => setTabsPaused(false)}
          >
            <div key={currentShowcase.id + '-copy'} className="steep-showcase-copy">
              <span className="steep-tag">{currentShowcase.categoryTag}</span>
              <h3 className="steep-showcase-title">{currentShowcase.title}</h3>
              <p className="steep-showcase-desc">{currentShowcase.description}</p>

              <ul className="steep-showcase-bullets">
                {currentShowcase.bullets.map(bullet => (
                  <li key={bullet}>
                    <span className="steep-showcase-bullet-dot" aria-hidden="true" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="steep-text-link"
                onClick={() => onEnterWorkspace(currentShowcase.targetTab)}
              >
                <span className="steep-text-link-label">{currentShowcase.ctaLabel}</span>
                <span className="steep-btn-arrow-glyph">→</span>
              </button>
            </div>

            <div key={currentShowcase.id + '-artifact'} className="steep-showcase-artifact">
              <div className="steep-artifact-eyebrow">
                <span>Pratinjau Hasil Langsung</span>
                <span>{currentShowcase.sampleConfidence}</span>
              </div>

              <div className="steep-artifact-metric-row" style={{ marginBottom: '10px' }}>
                <span className="steep-artifact-metric">{currentShowcase.sampleVerdict}</span>
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: '15px',
                  lineHeight: 1.5,
                  color: 'var(--color-slate-gray)',
                }}
              >
                {currentShowcase.sampleHeadline}
              </p>

              <div className="steep-token-row">
                {currentShowcase.tokens.map(tok => (
                  <span
                    key={tok.label}
                    className={`steep-token-pill ${tok.warm ? 'warm' : ''}`}
                  >
                    {tok.label}
                  </span>
                ))}
              </div>

              <div className="steep-prob-list">
                {currentShowcase.probabilities.map(prob => (
                  <div key={prob.label}>
                    <div className="steep-prob-item-head">
                      <span>{prob.label}</span>
                      <span>{prob.pct.toFixed(1)}%</span>
                    </div>
                    <div className="steep-prob-track">
                      <div
                        className="steep-prob-fill"
                        style={{ width: `${Math.max(prob.pct, 2)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Single Editorial Blush Peach Card (#fbe1d1 on #ffffff Paper White) */}
      <section id="transparansi" className="steep-section" style={{ paddingTop: 0 }}>
        <div className="steep-container">
          <div className="steep-peach-card steep-reveal">
            <div>
              <span className="steep-peach-eyebrow">Prinsip Explainable AI</span>
              <blockquote className="steep-peach-quote">
                “Transparansi matematis bukan sekadar angka akurasi, melainkan{' '}
                <em>kejelasan</em> mengapa setiap kata menggeser probabilitas keputusan.”
              </blockquote>
              <p className="steep-peach-attribution">
                Studi Klasifikasi Sentimen Ulasan Produk E-Commerce Indonesia · Politeknik Negeri
                Indramayu
              </p>
              <button
                type="button"
                className="steep-peach-link"
                onClick={() => onEnterWorkspace('evaluasi')}
              >
                <span>Telusuri laporan eksperimen &amp; matriks konfusi</span>
                <span>→</span>
              </button>
            </div>

            <div className="steep-peach-metrics">
              <div>
                <div className="steep-peach-stat-val">
                  {corpusTotal.toLocaleString('id-ID')}
                </div>
                <div className="steep-peach-stat-lbl">Total ulasan terverifikasi dalam korpus</div>
              </div>
              <div>
                <div className="steep-peach-stat-val">{accuracyPct}%</div>
                <div className="steep-peach-stat-lbl">Akurasi pengujian stratified 80:20</div>
              </div>
              <div>
                <div className="steep-peach-stat-val">{totalCategories}</div>
                <div className="steep-peach-stat-lbl">Subkategori produk katalog PRDECT-ID</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Two-Column Semantic Foundation Section ("Ship metrics, not dashboards") */}
      <section id="metrik" className="steep-section fog">
        <div className="steep-container">
          <div className="steep-two-col">
            <div className="steep-reveal">
              <span className="steep-tag">Fondasi Metrik Terbuka</span>
              <h2 className="steep-h2-lg">
                Sajikan bukti terukur, <em>bukan</em> kotak hitam
              </h2>
              <p className="steep-subhead" style={{ marginTop: '20px' }}>
                Seluruh pipeline dibangun di atas definisi statistik yang konsisten sehingga hasil
                prediksi tunggal, batch CSV, dan komparasi produk selalu selaras.
              </p>

              <div className="steep-feature-list">
                <div className="steep-feature-item">
                  <h3 className="steep-feature-item-title">Katalog Produk Sinkron 1-ke-1</h3>
                  <p className="steep-feature-item-desc">
                    Sampel ulasan terhubung langsung dengan nama produk dan kategori asli pada
                    korpus PRDECT-ID beserta visual katalog nyata.
                  </p>
                </div>
                <div className="steep-feature-item">
                  <h3 className="steep-feature-item-title">
                    Komparasi 5 Konfigurasi Hyperparameter
                  </h3>
                  <p className="steep-feature-item-desc">
                    Bandingkan dampak pemilihan fitur unigram, bigram, sublinear TF-IDF, dan
                    parameter Laplace smoothing terhadap F1-Score secara berdampingan.
                  </p>
                </div>
                <div className="steep-feature-item">
                  <h3 className="steep-feature-item-title">Siap Dokumentasi &amp; Ekspor PDF</h3>
                  <p className="steep-feature-item-desc">
                    Cetak hasil analisis ulasan maupun duel komparasi produk ke dalam format
                    laporan akademik A4 yang rapi dengan satu klik.
                  </p>
                </div>
              </div>

              <div className="steep-btn-row">
                <button
                  type="button"
                  className="steep-pill-filled"
                  onClick={() => onEnterWorkspace('evaluasi')}
                >
                  <span>Eksplorasi Metrik</span>
                  <span className="steep-btn-arrow-mask" aria-hidden="true">
                    <span className="steep-btn-arrow-glyph">→</span>
                  </span>
                </button>
                <button
                  type="button"
                  className="steep-pill-ghost"
                  onClick={() => onEnterWorkspace('komparasi')}
                >
                  <span>Bandingkan 2 Produk</span>
                </button>
              </div>
            </div>

            {/* Right Visual Stage: 5 Pipeline Comparison Artifact */}
            <div
              className="steep-stage-mist steep-reveal"
              style={{ '--reveal-delay': '140ms' } as React.CSSProperties}
            >
              <div className="steep-artifact">
                <div className="steep-artifact-eyebrow">
                  <span>Komparasi 5 Skenario Pipeline NLP</span>
                  <span>Macro F1-Score</span>
                </div>
                <div className="steep-artifact-metric-row">
                  <span className="steep-artifact-metric">77,28% F1 Tertinggi</span>
                  <span className="steep-artifact-delta">CountVec + MNB (1,2)</span>
                </div>

                <div className="steep-bars-chart" aria-label="Perbandingan 5 eksperimen pipeline">
                  {[
                    { label: 'TF-IDF (1,1)', val: '73,1%', height: '68%', best: false },
                    { label: 'TF-IDF (1,2)', val: '75,4%', height: '78%', best: false },
                    { label: 'Sublinear', val: '76,1%', height: '84%', best: false },
                    { label: 'CV + MNB', val: '77,3%', height: '96%', best: true },
                    { label: 'Complement', val: '74,8%', height: '74%', best: false },
                  ].map(bar => (
                    <div key={bar.label} className="steep-bar-col">
                      <span className="steep-bar-lbl">{bar.val}</span>
                      <div
                        className={`steep-bar-rect ${bar.best ? '' : 'muted'}`}
                        style={{ height: bar.height }}
                      />
                      <span className="steep-bar-lbl">{bar.label}</span>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    color: 'var(--color-slate-gray)',
                  }}
                >
                  <span>Evaluasi pada 1.092 data uji terpisah</span>
                  <span>Target minimum PRD: 70,0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Closing Call-to-Action */}
      <section className="steep-section">
        <div className="steep-container">
          <div className="steep-closing-cta steep-reveal">
            <div className="steep-closing-copy">
              <h2 className="steep-h2-lg">
                Mulai eksplorasi <em>sentimen</em> sekarang
              </h2>
              <p className="steep-subhead">
                Masuk ke ruang kerja interaktif untuk menguji ulasan tunggal, menarik ulasan produk
                live dari marketplace, atau memproses ratusan baris CSV sekaligus.
              </p>
            </div>

            <div className="steep-btn-row">
              <button
                type="button"
                className="steep-pill-filled"
                onClick={() => onEnterWorkspace('prediksi')}
              >
                <span>Masuk ke Workspace</span>
                <span className="steep-btn-arrow-mask" aria-hidden="true">
                  <span className="steep-btn-arrow-glyph">→</span>
                </span>
              </button>
              <button
                type="button"
                className="steep-pill-ghost"
                onClick={() => onEnterWorkspace('batch')}
              >
                <span>Unggah Batch CSV</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Quiet Editorial Footer */}
      <footer className="steep-footer">
        <div className="steep-container">
          <div className="steep-footer-grid">
            <div>
              <div className="steep-brand" style={{ marginBottom: '12px' }}>
                <span className="steep-brand-mark" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07L19.07 4.93" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="3.2" fill="#ffffff" stroke="currentColor" strokeWidth="1.7" />
                  </svg>
                </span>
                <span>sentimen</span>
              </div>
              <p
                style={{
                  margin: 0,
                  maxWidth: '280px',
                  fontSize: '15px',
                  lineHeight: 1.5,
                  color: 'var(--color-slate-gray)',
                }}
              >
                Platform analitik sentimen ulasan produk e-commerce berbahasa Indonesia berbasis
                TF-IDF dan Multinomial Naive Bayes.
              </p>
            </div>

            <div>
              <h3 className="steep-footer-col-title">Modul Ruang Kerja</h3>
              <ul className="steep-footer-links">
                <li>
                  <button
                    type="button"
                    className="steep-footer-link"
                    onClick={() => onEnterWorkspace('prediksi')}
                  >
                    Analisis Ulasan Tunggal
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="steep-footer-link"
                    onClick={() => onEnterWorkspace('komparasi')}
                  >
                    Komparasi 2 Produk
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="steep-footer-link"
                    onClick={() => onEnterWorkspace('batch')}
                  >
                    Pemrosesan Batch CSV
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="steep-footer-link"
                    onClick={() => onEnterWorkspace('evaluasi')}
                  >
                    Evaluasi &amp; Confusion Matrix
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="steep-footer-col-title">Arsitektur &amp; Data</h3>
              <ul className="steep-footer-links">
                <li>
                  <button
                    type="button"
                    className="steep-footer-link"
                    onClick={() => scrollToId('fondasi')}
                  >
                    Pipeline Sastrawi NLP
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="steep-footer-link"
                    onClick={() => scrollToId('metrik')}
                  >
                    Korpus PRDECT-ID ({corpusTotal.toLocaleString('id-ID')})
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="steep-footer-link"
                    onClick={() => onEnterWorkspace('prediksi')}
                  >
                    Online Learning partial_fit
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="steep-footer-link"
                    onClick={() => onEnterWorkspace('evaluasi')}
                  >
                    Katalog Bobot Fitur Kata
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="steep-footer-col-title">Akses Cepat</h3>
              <ul className="steep-footer-links">
                <li>
                  <button
                    type="button"
                    className="steep-footer-link"
                    onClick={() => onEnterWorkspace('prediksi')}
                  >
                    Buka Aplikasi Analisis
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="steep-footer-link"
                    onClick={() =>
                      onEnterWorkspace(
                        'prediksi',
                        'Kualitas produk sangat memuaskan, bahan tebal dan pengiriman cepat.'
                      )
                    }
                  >
                    Jalankan Demo Cepat
                  </button>
                </li>
                <li>
                  <a
                    className="steep-footer-link"
                    href="https://github.com/Muhfaizr21/Klasifikasi-sentimen-ulasan-produk"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Repositori GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="steep-footer-bottom">
            <span>Sistem Klasifikasi Sentimen Ulasan Produk E-Commerce Indonesia</span>
            <span>Politeknik Negeri Indramayu · Kecerdasan Buatan</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
