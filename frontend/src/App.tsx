import { useCallback, useEffect, useRef, useState } from 'react'
import { BatchUploadCard } from './components/BatchUploadCard'
import { EvaluationDashboard } from './components/EvaluationDashboard'
import { HistoryDrawer } from './components/HistoryDrawer'
import { PredictionResultCard } from './components/PredictionResultCard'
import { ProductSummaryCard } from './components/ProductSummaryCard'
import { ProductComparisonView } from './components/ProductComparisonView'
import {
  fetchBackendHealth,
  fetchCategories,
  fetchDatasetSamples,
  fetchEvaluationMetrics,
  fetchRealtimeStream,
  learnRealtimeReview,
  requestSentimentPrediction,
} from './services/sentimentApi'
import type {
  CategoriesResponse,
  DatasetSample,
  LiveStreamItem,
  MetricsReport,
  PredictionResult,
  ProductExecutiveSummary,
  ProductMediaInfo,
  SentimentClass,
} from './types/sentiment'

const DEFAULT_SAMPLES: DatasetSample[] = [
  {
    sentiment: 'positif',
    rating: 5,
    category: 'Electronics',
    category_label: 'Elektronik Konsumen',
    product_name: 'TWS Bluetooth Earphone Wireless Headset Tokopedia',
    source: 'PRDECT-ID (Tokopedia)',
    text: 'Barang original 100%, pengemasan super rapi pakai bubble wrap tebal dan pengiriman cepet bgt! Sangat puas belanja di toko ini, recommended seller!',
  },
  {
    sentiment: 'netral',
    rating: 3,
    category: "Men's Fashion",
    category_label: 'Fashion Pria',
    product_name: 'Kaos Pria Katun Combed 30s Polos Reguler Fit',
    source: 'HuggingFace E-Commerce',
    text: 'Lumayan, tapi jangan expect banyak. Kualitas standar sesuai harga lah.',
  },
  {
    sentiment: 'negatif',
    rating: 1,
    category: 'Kitchen',
    category_label: 'Peralatan Dapur',
    product_name: 'Wajan Penggorengan Teflon Anti Lengket Panci Dapur',
    source: 'PRDECT-ID (Tokopedia)',
    text: 'Kecewa berat! Barang rusak parah pas sampe, paking ancur dan penjual tidak responsif saat dikomplain. Nyesel beli disini!',
  },
]

const CATEGORY_PRESETS: Record<string, DatasetSample[]> = {
  Semua: DEFAULT_SAMPLES,
  Elektronik: [
    {
      sentiment: 'positif',
      rating: 5,
      category: 'Audio',
      category_label: 'Perangkat Audio & Speaker',
      product_name: 'Headset Bluetooth Bass Earphone Wireless',
      source: 'PRDECT-ID (Tokopedia)',
      text: 'Suara headset jernih, bass mantap dan baterai awet seharian. Pengiriman cepat dan segel resmi.',
    },
    {
      sentiment: 'netral',
      rating: 3,
      category: 'Phones and Tablets',
      category_label: 'Ponsel & Tablet',
      product_name: 'Kabel Charger USB Type C Fast Charging Smartphone',
      source: 'PRDECT-ID (Tokopedia)',
      text: 'Kabel charger berfungsi normal, cuma bahannya agak tipis sesuai harga murah.',
    },
    {
      sentiment: 'negatif',
      rating: 1,
      category: 'Electronics',
      category_label: 'Elektronik Konsumen',
      product_name: 'TWS Mini Bluetooth Speaker Portable Audio',
      source: 'PRDECT-ID (Tokopedia)',
      text: 'Baru dipakai dua hari sudah mati total, dikomplain malah disuruh servis sendiri. Mengecewakan!',
    },
  ],
  Fashion: [
    {
      sentiment: 'positif',
      rating: 5,
      category: "Men's Fashion",
      category_label: 'Fashion Pria',
      product_name: 'Kemeja Pria Lengan Pendek Katun Oxford Casual',
      source: 'PRDECT-ID (Tokopedia)',
      text: 'Bahannya adem, jahitan sangat rapi dan ukuran pas di badan. Bakal langganan di toko ini.',
    },
    {
      sentiment: 'netral',
      rating: 3,
      category: "Women's Fashion",
      category_label: 'Fashion Wanita',
      product_name: 'Blouse Wanita Lengan Panjang Casual Korea',
      source: 'HuggingFace E-Commerce',
      text: 'Model bajunya sesuai foto, tapi warnanya agak sedikit lebih gelap dari ekspektasi.',
    },
    {
      sentiment: 'negatif',
      rating: 1,
      category: 'Muslim Fashion',
      category_label: 'Busana Muslim',
      product_name: 'Hijab Pashmina Ceruty Babydoll Premium',
      source: 'PRDECT-ID (Tokopedia)',
      text: 'Bahan tipis menerawang dan jahitan banyak yang lepas. Sangat tidak sesuai deskripsi.',
    },
  ],
  'Rumah Tangga': [
    {
      sentiment: 'positif',
      rating: 5,
      category: 'Kitchen',
      category_label: 'Peralatan Dapur',
      product_name: 'Wajan Anti Lengket Granite Frying Pan Dapur',
      source: 'PRDECT-ID (Tokopedia)',
      text: 'Wajan anti lengket beneran bagus, panas merata dan mudah dibersihkan. Packing kayu aman.',
    },
    {
      sentiment: 'netral',
      rating: 3,
      category: 'Household',
      category_label: 'Perlengkapan Rumah Tangga',
      product_name: 'Kotak Penyimpanan Kontainer Plastik Serbaguna',
      source: 'PRDECT-ID (Tokopedia)',
      text: 'Kotak penyimpanan lumayan kokoh, hanya saja tutupnya agak seret saat dipasang.',
    },
    {
      sentiment: 'negatif',
      rating: 1,
      category: 'Household',
      category_label: 'Perlengkapan Rumah Tangga',
      product_name: 'Toples Kaca Kedap Udara Penyimpanan Dapur',
      source: 'PRDECT-ID (Tokopedia)',
      text: 'Barang pecah saat sampai karena cuma dibungkus plastik tipis tanpa bubble wrap.',
    },
  ],
}

const SENTIMENT_LABEL: Record<SentimentClass, string> = {
  positif: 'Positif',
  netral: 'Netral',
  negatif: 'Negatif',
}

const STORAGE_KEY = 'sentiment_review_history_v1'

export default function App() {
  const [activeTab, setActiveTab] = useState<'prediksi' | 'batch' | 'evaluasi' | 'komparasi'>('prediksi')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const [history, setHistory] = useState<PredictionResult[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)
  const [corpusTotal, setCorpusTotal] = useState<number>(5459)
  const [realtimeLearnedCount, setRealtimeLearnedCount] = useState<number>(0)
  const [learningLabel, setLearningLabel] = useState<SentimentClass | null>(null)
  const [learnedSuccessNote, setLearnedSuccessNote] = useState<string | null>(null)

  const [samples, setSamples] = useState<DatasetSample[]>(DEFAULT_SAMPLES)
  const [samplesLoading, setSamplesLoading] = useState(false)
  const [categoriesCatalog, setCategoriesCatalog] = useState<CategoriesResponse | null>(null)

  const [liveSearchQuery, setLiveSearchQuery] = useState('')
  const [liveResolvedQuery, setLiveResolvedQuery] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('semua')
  const [liveStreamItems, setLiveStreamItems] = useState<LiveStreamItem[]>([])
  const [liveProductShowcase, setLiveProductShowcase] = useState<ProductMediaInfo | null>(null)
  const [liveProductSummary, setLiveProductSummary] = useState<ProductExecutiveSummary | null>(null)
  const [liveStreamLoading, setLiveStreamLoading] = useState(false)
  const [liveExternalActive, setLiveExternalActive] = useState(false)
  const [liveStreamStatus, setLiveStreamStatus] = useState<string | null>(null)
  const [liveStreamError, setLiveStreamError] = useState<string | null>(null)

  const [metrics, setMetrics] = useState<MetricsReport | null>(null)
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [metricsError, setMetricsError] = useState<string | null>(null)

  const saveHistory = (newItem: PredictionResult) => {
    setHistory(prev => {
      const updated = [newItem, ...prev.filter(x => x.inputText !== newItem.inputText)].slice(0, 6)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // Ignore storage quota errors
      }
      return updated
    })
  }

  const clearHistory = () => {
    setHistory([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore storage errors
    }
  }

  const loadMetrics = useCallback(() => {
    setMetricsLoading(true)
    setMetricsError(null)
    fetchEvaluationMetrics()
      .then(data => {
        setMetrics(data)
        if (data.dataset_info?.total_samples) {
          setCorpusTotal(data.dataset_info.total_samples)
        }
      })
      .catch(err => setMetricsError(err instanceof Error ? err.message : 'Gagal memuat metrik evaluasi.'))
      .finally(() => setMetricsLoading(false))
  }, [])

  const handlePredict = useCallback(
    async (
      inputReview: string,
      options?: { productHint?: string; category?: string; platform?: string }
    ) => {
      const trimmed = inputReview.trim()
      if (!trimmed) {
        setError('Masukkan teks ulasan produk terlebih dahulu.')
        return
      }
      if (trimmed.length > 1000) {
        setError('Teks ulasan terlalu panjang (maksimal 1.000 karakter).')
        return
      }

      setLoading(true)
      setError(null)
      setLearnedSuccessNote(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })

      try {
        const prediction = await requestSentimentPrediction(trimmed, {
          productHint: options?.productHint ?? '',
          category: options?.category ?? selectedCategory,
          platform:
            options?.platform ??
            (selectedPlatform !== 'semua' ? selectedPlatform : 'Tokopedia'),
        })
        setResult(prediction)
        saveHistory(prediction)
        setBackendOnline(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Gagal menghubungi server backend. Pastikan server Flask aktif.'
        )
      } finally {
        setLoading(false)
      }
    },
    [selectedCategory, selectedPlatform]
  )

  const handleLearnRealtime = useCallback(
    async (targetLabel: SentimentClass) => {
      if (!result) return
      setLearningLabel(targetLabel)
      setLearnedSuccessNote(null)
      try {
        const res = await learnRealtimeReview(
          result.inputText,
          targetLabel,
          selectedCategory,
          result.productMedia?.title || liveResolvedQuery
        )
        setResult(res.prediction)
        saveHistory(res.prediction)
        setCorpusTotal(res.corpusTotal)
        setRealtimeLearnedCount(res.realtimeLearnedCount)
        setLearnedSuccessNote(
          `✓ Model berhasil dilatih secara real-time (partial_fit) ke kelas ${targetLabel.toUpperCase()} · Korpus aktif: ${res.corpusTotal.toLocaleString('id-ID')} data.`
        )
        loadMetrics()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal melatih model secara real-time.')
      } finally {
        setLearningLabel(null)
      }
    },
    [result, selectedCategory, liveResolvedQuery, loadMetrics]
  )

  const handleFetchRealtimeStream = useCallback(
    async (
      customQuery?: string,
      customCategory?: string,
      customPlatform?: string,
      userTriggered: boolean = false
    ) => {
      const q = customQuery !== undefined ? customQuery : liveSearchQuery
      const cat = customCategory !== undefined ? customCategory : selectedCategory
      const plat = customPlatform !== undefined ? customPlatform : selectedPlatform
      setLiveStreamLoading(true)
      setLiveStreamError(null)
      if (userTriggered) {
        setLiveStreamStatus(null)
      }
      try {
        const res = await fetchRealtimeStream(q, cat, 6, plat)
        const fetchedItems = res.items || []
        setLiveStreamItems(fetchedItems)
        if (res.product_showcase) {
          setLiveProductShowcase(res.product_showcase)
        }
        if (res.product_summary) {
          setLiveProductSummary(res.product_summary)
        }
        setLiveExternalActive(Boolean(res.external_live))
        setLiveResolvedQuery(res.query || q.trim())
        if (res.platform && res.platform !== 'semua') {
          setSelectedPlatform(res.platform)
        }
        if (res.corpus_total) setCorpusTotal(res.corpus_total)
        if (typeof res.realtime_learned_count === 'number') {
          setRealtimeLearnedCount(res.realtime_learned_count)
        }
        setBackendOnline(true)

        if (userTriggered && fetchedItems.length > 0) {
          const labelInfo = res.query ? ` untuk "${res.query}"` : ''
          const platInfo =
            res.platform && res.platform !== 'semua'
              ? res.platform.toUpperCase()
              : 'E-Commerce Indonesia'
          setLiveStreamStatus(
            `✓ Berhasil menarik ${fetchedItems.length} ulasan & foto produk real-time dari ${platInfo}${labelInfo}.`
          )
          if (q.trim().length > 0) {
            setText(fetchedItems[0].text)
            void handlePredict(fetchedItems[0].text, {
              productHint: res.query || fetchedItems[0].product_title,
              category: res.category || cat,
              platform: res.platform || plat,
            })
          }
        }
      } catch (err) {
        if (userTriggered) {
          setLiveStreamError(
            err instanceof Error
              ? err.message
              : 'Gagal menarik ulasan real-time dari server.'
          )
        }
      } finally {
        setLiveStreamLoading(false)
      }
    },
    [liveSearchQuery, selectedCategory, selectedPlatform, handlePredict]
  )

  const loadDynamicCategorySamples = useCallback((category: string) => {
    setSamplesLoading(true)
    fetchDatasetSamples(category)
      .then(res => {
        if (res.corpusTotal) setCorpusTotal(res.corpusTotal)
        if (typeof res.realtimeLearnedCount === 'number') {
          setRealtimeLearnedCount(res.realtimeLearnedCount)
        }
        if (res.samples.length > 0) {
          const picked: DatasetSample[] = []
          for (const cls of ['positif', 'netral', 'negatif'] as SentimentClass[]) {
            const match = res.samples.find(item => item.sentiment === cls)
            if (match) picked.push(match)
          }
          setSamples(picked.length > 0 ? picked : res.samples.slice(0, 3))
        }
      })
      .catch(() => {
        setSamples(CATEGORY_PRESETS[category] || DEFAULT_SAMPLES)
      })
      .finally(() => setSamplesLoading(false))
  }, [])

  const loadRandomSampleIntoInput = useCallback(() => {
    setSamplesLoading(true)
    fetchDatasetSamples(selectedCategory)
      .then(res => {
        if (res.corpusTotal) setCorpusTotal(res.corpusTotal)
        const data = res.samples
        if (data.length > 0) {
          const picked: DatasetSample[] = []
          for (const cls of ['positif', 'netral', 'negatif'] as SentimentClass[]) {
            const match = data.find(item => item.sentiment === cls)
            if (match) picked.push(match)
          }
          const nextSamples = picked.length > 0 ? picked : data.slice(0, 3)
          setSamples(nextSamples)
          const randomItem = data[Math.floor(Math.random() * data.length)]
          if (randomItem) {
            setActiveTab('prediksi')
            setText(randomItem.text)
            void handlePredict(randomItem.text, {
              productHint: randomItem.product_name,
              category: randomItem.category,
            })
          }
        }
      })
      .catch(() => {
        const fallback = samples[Math.floor(Math.random() * samples.length)] || DEFAULT_SAMPLES[0]
        setActiveTab('prediksi')
        setText(fallback.text)
        void handlePredict(fallback.text, {
          productHint: fallback.product_name,
          category: fallback.category,
        })
      })
      .finally(() => setSamplesLoading(false))
  }, [handlePredict, samples, selectedCategory])

  useEffect(() => {
    let active = true

    fetchBackendHealth()
      .then(status => {
        if (active) {
          setBackendOnline(status.models_loaded)
          if (status.corpus_total) setCorpusTotal(status.corpus_total)
          if (typeof status.realtime_learned_count === 'number') {
            setRealtimeLearnedCount(status.realtime_learned_count)
          }
        }
      })
      .catch(() => {
        if (active) setBackendOnline(false)
      })

    fetchCategories()
      .then(catRes => {
        if (active) {
          setCategoriesCatalog(catRes)
          if (catRes.corpus_total) setCorpusTotal(catRes.corpus_total)
        }
      })
      .catch(() => {})

    fetchEvaluationMetrics()
      .then(data => {
        if (active) {
          setMetrics(data)
          if (data.dataset_info?.total_samples) {
            setCorpusTotal(data.dataset_info.total_samples)
          }
        }
      })
      .catch(err => {
        if (active) setMetricsError(err instanceof Error ? err.message : 'Gagal memuat metrik.')
      })
      .finally(() => {
        if (active) setMetricsLoading(false)
      })

    fetchDatasetSamples('Semua')
      .then(res => {
        if (active) {
          if (res.corpusTotal) setCorpusTotal(res.corpusTotal)
          if (res.samples.length > 0) {
            const picked: DatasetSample[] = []
            for (const cls of ['positif', 'netral', 'negatif'] as SentimentClass[]) {
              const match = res.samples.find(item => item.sentiment === cls)
              if (match) picked.push(match)
            }
            setSamples(picked.length > 0 ? picked : res.samples.slice(0, 3))
          }
        }
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [])

  const startNewSession = () => {
    setActiveTab('prediksi')
    setText('')
    setResult(null)
    setError(null)
    setLearnedSuccessNote(null)
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 20)
  }

  const navigateToSection = (sectionId: string) => {
    setActiveTab('evaluasi')
    setTimeout(() => {
      const el = document.getElementById(sectionId)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setActiveTab('prediksi')
    loadDynamicCategorySamples(category)
    void handleFetchRealtimeStream(liveSearchQuery, category)
  }

  const f1BadgeText = metrics ? `${(metrics.f1_macro * 100).toFixed(1)}% F1` : '73.1% F1'

  return (
    <div className="workspace-shell">
      {/* Left Navigation Sidebar */}
      <aside
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}
        aria-label="Navigasi Ruang Kerja"
      >
        <div className="sidebar-top">
          <div className="sidebar-brand-row">
            <button
              type="button"
              className="brand-mark-btn"
              onClick={startNewSession}
              title="Kembali ke beranda analisis"
            >
              <svg
                className="brand-glyph"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.65"
                aria-hidden="true"
              >
                <path
                  d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07L19.07 4.93"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="12" r="3.2" fill="var(--color-sidebar)" stroke="currentColor" strokeWidth="1.65" />
              </svg>
              {!sidebarCollapsed && <span className="brand-mark-text">sentimen</span>}
            </button>

            <button
              type="button"
              className="icon-ghost-btn"
              onClick={() => setSidebarCollapsed(prev => !prev)}
              aria-label={sidebarCollapsed ? 'Perluas panel samping' : 'Ciutkan panel samping'}
              title={sidebarCollapsed ? 'Perluas panel samping' : 'Ciutkan panel samping'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <rect x="3" y="4" width="18" height="16" rx="2.5" />
                <path d="M9 4v16" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            className="new-session-btn"
            onClick={startNewSession}
            title="Mulai sesi analisis baru"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            {!sidebarCollapsed && <span>Baru</span>}
          </button>

          <nav className="sidebar-nav" aria-label="Menu Utama">
            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'prediksi' ? 'active' : ''}`}
              onClick={() => setActiveTab('prediksi')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.8-3.8" strokeLinecap="round" />
              </svg>
              {!sidebarCollapsed && <span>Analisis Ulasan</span>}
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'batch' ? 'active' : ''}`}
              onClick={() => setActiveTab('batch')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden="true">
                <rect x="3" y="4" width="18" height="12" rx="2" />
                <path d="M2 20h20M8 16v4m8-4v4" strokeLinecap="round" />
              </svg>
              {!sidebarCollapsed && <span>Batch CSV</span>}
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'komparasi' ? 'active' : ''}`}
              onClick={() => setActiveTab('komparasi')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden="true">
                <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {!sidebarCollapsed && <span>Komparasi 2 Produk</span>}
            </button>

            <button
              type="button"
              className={`sidebar-nav-item ${activeTab === 'evaluasi' ? 'active' : ''}`}
              onClick={() => setActiveTab('evaluasi')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden="true">
                <path d="M4 19h16M7 15V9m5 6V5m5 10v-4" strokeLinecap="round" />
              </svg>
              {!sidebarCollapsed && <span>Evaluasi Model</span>}
            </button>

            <button
              type="button"
              className="sidebar-nav-item"
              onClick={loadRandomSampleIntoInput}
              disabled={samplesLoading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden="true">
                <circle cx="12" cy="12" r="8" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
              {!sidebarCollapsed && (
                <span>{samplesLoading ? 'Memuat Sampel...' : 'Uji Sampel Acak'}</span>
              )}
            </button>
          </nav>

          {!sidebarCollapsed && (
            <div className="sidebar-subnav" aria-label="Pintasan Spesifikasi">
              <button
                type="button"
                className="sidebar-sublink"
                onClick={() => navigateToSection('pipeline-comparison')}
              >
                <span>Pipeline TF-IDF</span>
                <span>5 Eksperimen</span>
              </button>
              <button
                type="button"
                className="sidebar-sublink"
                onClick={() => navigateToSection('confusion-matrix')}
              >
                <span>Confusion Matrix</span>
                <span>{f1BadgeText}</span>
              </button>
              <button
                type="button"
                className="sidebar-sublink"
                onClick={() => navigateToSection('dataset-distribution')}
              >
                <span>Korpus PRDECT-ID</span>
                <span>{corpusTotal.toLocaleString('id-ID')} Data</span>
              </button>
              {realtimeLearnedCount > 0 && (
                <button
                  type="button"
                  className="sidebar-sublink"
                  onClick={() => setActiveTab('prediksi')}
                >
                  <span>Online Learning</span>
                  <span>+{realtimeLearnedCount} Dilatih</span>
                </button>
              )}
            </div>
          )}

          {!sidebarCollapsed && (
            <div className="sidebar-history" aria-label="Riwayat Sesi">
              <div className="sidebar-section-header">
                <span className="sidebar-section-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" aria-hidden="true">
                    <circle cx="12" cy="12" r="8.5" />
                    <path d="M12 7.5V12l3 1.8" strokeLinecap="round" />
                  </svg>
                  Riwayat
                </span>
                {history.length > 0 && (
                  <button
                    type="button"
                    className="sidebar-clear-btn"
                    onClick={clearHistory}
                  >
                    Hapus
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <p className="sidebar-empty-note">Belum ada sesi analisis</p>
              ) : (
                <div className="sidebar-history-list">
                  {history.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="sidebar-history-item"
                      onClick={() => {
                        setActiveTab('prediksi')
                        setText(item.inputText)
                        setResult(item)
                      }}
                    >
                      <span className={`sidebar-history-dot ${item.label}`} aria-hidden="true" />
                      <span className="sidebar-history-text">{item.inputText}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Status Identity */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-status-btn"
            onClick={() => setActiveTab('evaluasi')}
            title="Lihat status model dan evaluasi lengkap"
          >
            <span className="status-avatar" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 19c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" strokeLinecap="round" />
              </svg>
            </span>
            {!sidebarCollapsed && (
              <>
                <span className="status-meta">
                  <span className="status-primary">
                    {backendOnline === null
                      ? 'Memeriksa API...'
                      : backendOnline
                        ? 'Model Naive Bayes Aktif'
                        : 'API Backend Offline'}
                  </span>
                  <span className="status-secondary">Politeknik Negeri Indramayu</span>
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-ash)" strokeWidth="1.6" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-pane">
        <div>
          {/* Top Category Filter Bar (Dynamic from Corpus) */}
          <header className="top-category-bar" aria-label="Kategori Sampel dan Modul">
            <button
              type="button"
              className={`category-link ${activeTab === 'prediksi' && selectedCategory === 'Semua' ? 'active' : ''}`}
              onClick={() => handleCategorySelect('Semua')}
            >
              Semua Kategori
            </button>
            {(categoriesCatalog?.groups && categoriesCatalog.groups.length > 0
              ? categoriesCatalog.groups.map(g => g.id)
              : ['Elektronik', 'Fashion', 'Rumah Tangga', 'Otomotif & Hobi']
            ).map(cat => (
              <button
                key={cat}
                type="button"
                className={`category-link ${activeTab === 'prediksi' && selectedCategory === cat ? 'active' : ''}`}
                onClick={() => handleCategorySelect(cat)}
              >
                {cat}
              </button>
            ))}
            {categoriesCatalog && categoriesCatalog.categories.length > 0 && (
              <label className="top-category-select-wrap" aria-label="Pilih subkategori spesifik dari 30 kategori korpus">
                <select
                  className="top-category-select"
                  value={
                    categoriesCatalog.categories.some(c => c.id === selectedCategory)
                      ? selectedCategory
                      : ''
                  }
                  onChange={e => {
                    if (e.target.value) {
                      handleCategorySelect(e.target.value)
                    }
                  }}
                >
                  <option value="">
                    Subkategori ({categoriesCatalog.total_categories})
                  </option>
                  {categoriesCatalog.categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({c.count})
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button
              type="button"
              className={`category-link ${activeTab === 'batch' ? 'active' : ''}`}
              onClick={() => setActiveTab('batch')}
            >
              Batch CSV
            </button>
            <button
              type="button"
              className={`category-link ${activeTab === 'komparasi' ? 'active' : ''}`}
              onClick={() => setActiveTab('komparasi')}
            >
              Komparasi 2 Produk
            </button>
            <button
              type="button"
              className={`category-link ${activeTab === 'evaluasi' ? 'active' : ''}`}
              onClick={() => setActiveTab('evaluasi')}
            >
              Akademik &amp; Metrik
            </button>
          </header>

          <main className={`content-column ${activeTab === 'komparasi' ? 'is-compare-view' : ''}`}>
            {/* Non-Prediksi Tabs Header (kecuali tab komparasi yang memiliki hero tersendiri) */}
            {activeTab !== 'prediksi' && activeTab !== 'komparasi' && (
              <div className="hero-workspace compact">
                <h1 className="wordmark">sentimen</h1>
                <p className="wordmark-sub">
                  Klasifikasi Sentimen Ulasan Produk E-Commerce Indonesia · TF-IDF &amp; Multinomial Naive Bayes
                </p>
              </div>
            )}

            {activeTab === 'prediksi' && (
              <>
                {/* 1. JAWABAN AI DI ATAS (Tampil paling atas begitu ada hasil atau sedang memproses) */}
                {(result || loading || error) && (
                  <div className="prediction-stream-container answer-top-stage">
                    {error && (
                      <div className="error-banner" role="alert">
                        <span>{error}</span>
                      </div>
                    )}

                    {loading && (
                      <div className="card ai-thinking-card" role="status" aria-live="polite">
                        <div className="ai-thinking-header">
                          <span className="ai-pulse-dot streaming" />
                          <span className="ai-thinking-title">
                            Menjalankan Pipeline Analisis AI &amp; Penalaran Konteks...
                          </span>
                        </div>
                        <div className="ai-thinking-steps">
                          <span className="ai-thinking-pill active">1. Normalisasi Slang &amp; Stopword Sastrawi</span>
                          <span className="ai-thinking-pill active">2. Evaluasi Pragmatik &amp; Negasi</span>
                          <span className="ai-thinking-pill">3. Kalkulasi Log-Likelihood Naive Bayes</span>
                        </div>
                      </div>
                    )}

                    {!loading && result && (
                      <PredictionResultCard
                        result={result}
                        onFollowUpSelect={promptText => {
                          setText(promptText)
                          void handlePredict(promptText)
                        }}
                        onLearnRealtime={handleLearnRealtime}
                        learningLabel={learningLabel}
                        learnedSuccessNote={learnedSuccessNote}
                      />
                    )}
                  </div>
                )}

                {/* 2. KOLOM INPUT PERTANYAAN (Di tengah saat awal, atau pindah ke bawah jawaban setelah dijawab) */}
                <div className={`hero-workspace ${result || loading ? 'docked-below-answer' : ''}`}>
                  {!result && !loading && (
                    <>
                      <h1 className="wordmark">sentimen</h1>
                      <p className="wordmark-sub">
                        Klasifikasi Sentimen Ulasan Produk E-Commerce Indonesia · TF-IDF &amp; Multinomial Naive Bayes
                      </p>
                    </>
                  )}

                  {result && !loading && (
                    <div className="followup-composer-label">
                      <span>Tanyakan atau analisis ulasan produk lainnya</span>
                      <button
                        type="button"
                        className="new-query-link-btn"
                        onClick={startNewSession}
                      >
                        + Reset ke Halaman Utama
                      </button>
                    </div>
                  )}

                  <form
                    className="query-box"
                    onSubmit={event => {
                      event.preventDefault()
                      void handlePredict(text)
                    }}
                  >
                    <label htmlFor="review-text" className="sr-only">
                      Teks Ulasan Produk Pembeli
                    </label>
                    <textarea
                      id="review-text"
                      ref={textareaRef}
                      className={`query-textarea ${result ? 'compact-textarea' : ''}`}
                      placeholder={
                        result
                          ? 'Ketik ulasan produk lain untuk dianalisis oleh AI...'
                          : 'Ketik atau tempel ulasan produk berbahasa Indonesia untuk dianalisis...'
                      }
                      value={text}
                      onChange={event => setText(event.target.value)}
                      onKeyDown={event => {
                        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                          event.preventDefault()
                          void handlePredict(text)
                        }
                      }}
                      disabled={loading}
                      maxLength={1000}
                    />

                    <div className="query-toolbar">
                      <div className="query-toolbar-left">
                        <button
                          type="button"
                          className="toolbar-plus-btn"
                          onClick={loadRandomSampleIntoInput}
                          disabled={samplesLoading || loading}
                          title="Muat sampel ulasan acak dari dataset Tokopedia"
                          aria-label="Muat sampel ulasan acak dari dataset Tokopedia"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          className="mode-chip active"
                          onClick={() => textareaRef.current?.focus()}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" />
                            <path d="M20 20l-3.8-3.8" strokeLinecap="round" />
                          </svg>
                          <span>Analisis Ulasan</span>
                        </button>

                        <button
                          type="button"
                          className="mode-chip"
                          onClick={() => setActiveTab('batch')}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <rect x="3" y="4" width="18" height="12" rx="2" />
                            <path d="M2 20h20" strokeLinecap="round" />
                          </svg>
                          <span>Batch CSV</span>
                        </button>
                      </div>

                      <div className="query-toolbar-right">
                        <button
                          type="button"
                          className="model-selector-btn"
                          onClick={() => setActiveTab('evaluasi')}
                          title="Lihat detail model dan matriks evaluasi"
                        >
                          <span>TF-IDF + MNB ({f1BadgeText})</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>

                        <span className="char-count-badge" aria-live="polite">
                          {text.length}/1000
                        </span>

                        {text.length > 0 && (
                          <button
                            type="button"
                            className="model-selector-btn"
                            onClick={startNewSession}
                            disabled={loading}
                          >
                            Reset
                          </button>
                        )}

                        <button
                          type="submit"
                          className="submit-circle-btn"
                          disabled={loading || text.trim().length === 0}
                          aria-label={loading ? 'Sedang menganalisis sentimen' : 'Jalankan analisis sentimen'}
                          title="Jalankan analisis sentimen (Ctrl+Enter)"
                        >
                          {loading ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path d="M12 3v3m0 12v3M3 12h3m12 0h3" strokeLinecap="round" />
                            </svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path d="M5 12h14m0 0l-5-5m5 5l-5 5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Kartu Saran Sampel Dinamis & Live Stream Real-Time */}
                  <div className="suggestion-grid">
                    <div className="suggestion-card">
                      <div className="suggestion-header">
                        <span className="suggestion-title-group">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" />
                            <path d="M20 20l-3.8-3.8" strokeLinecap="round" />
                          </svg>
                          <span>Sampel Dinamis ({selectedCategory})</span>
                        </span>
                        <button
                          type="button"
                          className="sample-refresh-btn"
                          onClick={() => loadDynamicCategorySamples(selectedCategory)}
                          disabled={samplesLoading}
                          title="Tarik sampel acak baru dari server"
                        >
                          {samplesLoading ? 'Memuat...' : '↻ Acak Baru'}
                        </button>
                      </div>
                      <p className="suggestion-desc">
                        Data ditarik secara dinamis dari server ({corpusTotal.toLocaleString('id-ID')} korpus aktif). Klik untuk analisis:
                      </p>
                      <div className="sample-pill-row">
                        {samples.map((sample, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="sample-pill-btn"
                            title={
                              sample.product_name
                                ? `${sample.product_name} (${sample.category_label || sample.category})`
                                : sample.text
                            }
                            onClick={() => {
                              setText(sample.text)
                              void handlePredict(sample.text, {
                                productHint: sample.product_name,
                                category: sample.category,
                              })
                            }}
                          >
                            <span>{SENTIMENT_LABEL[sample.sentiment]}</span>
                            <span style={{ color: 'var(--color-ash)' }}>
                              · {sample.category_label || sample.category}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="suggestion-card">
                      <div className="suggestion-header">
                        <span className="suggestion-title-group">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span>Tarik Langsung E-Commerce Indonesia (Live)</span>
                        </span>
                        <span className="teal-pill-badge">
                          {liveExternalActive ? 'LIVE E-COMMERCE' : 'LIVE STREAM'}
                        </span>
                      </div>

                      <div className="sample-pill-row" style={{ marginBottom: '4px' }}>
                        {[
                          { id: 'semua', label: 'Semua' },
                          { id: 'tokopedia', label: 'Tokopedia' },
                          { id: 'shopee', label: 'Shopee' },
                          { id: 'lazada', label: 'Lazada' },
                          { id: 'blibli', label: 'Blibli' },
                          { id: 'zalora', label: 'ZALORA' },
                          { id: 'sociolla', label: 'Sociolla' },
                          { id: 'eraspace', label: 'Eraspace' },
                          { id: 'ruparupa', label: 'Ruparupa' },
                        ].map(plat => (
                          <button
                            key={plat.id}
                            type="button"
                            className={`sample-pill-btn ${selectedPlatform === plat.id ? 'active-platform' : ''}`}
                            onClick={() => {
                              setSelectedPlatform(plat.id)
                              void handleFetchRealtimeStream(liveSearchQuery, selectedCategory, plat.id, true)
                            }}
                          >
                            <span>{plat.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="live-fetch-bar">
                        <input
                          type="text"
                          className="live-fetch-input"
                          placeholder="Tempel link produk Tokopedia/Shopee atau ketik kata kunci..."
                          value={liveSearchQuery}
                          onChange={e => setLiveSearchQuery(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              void handleFetchRealtimeStream(liveSearchQuery, selectedCategory, selectedPlatform, true)
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="live-fetch-btn"
                          onClick={() =>
                            void handleFetchRealtimeStream(liveSearchQuery, selectedCategory, selectedPlatform, true)
                          }
                          disabled={liveStreamLoading}
                        >
                          {liveStreamLoading ? 'Menarik...' : 'Tarik Live'}
                        </button>
                      </div>

                      {liveStreamStatus && (
                        <p className="learned-success-banner" style={{ marginTop: '4px', padding: '6px 10px', fontSize: '12px' }}>
                          {liveStreamStatus}
                        </p>
                      )}
                      {liveStreamError && (
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--color-crimson)' }}>
                          {liveStreamError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Daftar Ulasan Hasil Tarikan Real-Time (Klik untuk Analisis di Atas) */}
                  {liveStreamItems.length > 0 && (
                    <div className="live-stream-panel">
                      <div className="live-stream-header">
                        <span className="live-stream-title">
                          <span className="ai-pulse-dot" />
                          <span>
                            Feed Ulasan E-Commerce Real-Time (
                            {selectedPlatform === 'semua' ? selectedCategory : selectedPlatform.toUpperCase()}
                            {liveResolvedQuery ? ` · "${liveResolvedQuery}"` : ''})
                          </span>
                        </span>
                        <span className="live-stream-meta">
                          Klik ulasan mana saja untuk membuka Analisis AI &amp; Foto Produk di atas
                        </span>
                      </div>

                      {/* Point 1: Ringkasan Sentimen Produk (Executive Summary: Pros & Cons, Reputation Score) */}
                      {liveProductSummary && (
                        <div style={{ marginBottom: '16px' }}>
                          <ProductSummaryCard summary={liveProductSummary} />
                        </div>
                      )}

                      {/* Real Product Showcase Banner in Live Stream */}
                      {liveProductShowcase &&
                        (liveProductShowcase.image_url || liveProductShowcase.thumbnail_url) && (
                          <div className="live-product-showcase">
                            <img
                              src={liveProductShowcase.image_url || liveProductShowcase.thumbnail_url}
                              alt={liveProductShowcase.title}
                              width="56"
                              height="56"
                              className="live-showcase-main-img"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              onError={e => {
                                const target = e.currentTarget
                                if (
                                  liveProductShowcase.thumbnail_url &&
                                  target.src !== liveProductShowcase.thumbnail_url
                                ) {
                                  target.src = liveProductShowcase.thumbnail_url
                                }
                              }}
                            />
                            <div className="live-showcase-info">
                              <span className="live-showcase-eyebrow">
                                KATALOG PRODUK REAL-TIME · {liveProductShowcase.platform.toUpperCase()} ·{' '}
                                {liveProductShowcase.category.toUpperCase()}
                              </span>
                              <div className="live-showcase-title">{liveProductShowcase.title}</div>
                              {liveProductShowcase.product_url && (
                                <a
                                  href={liveProductShowcase.product_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="ai-product-ext-link"
                                >
                                  Buka di Marketplace ↗
                                </a>
                              )}
                            </div>
                            {liveProductShowcase.gallery && liveProductShowcase.gallery.length > 1 && (
                              <div className="live-showcase-gallery">
                                {liveProductShowcase.gallery.slice(0, 4).map((g, gIdx) => (
                                  <img
                                    key={gIdx}
                                    src={g.thumbnail_url || g.image_url}
                                    alt={g.title || `Foto ${gIdx + 1}`}
                                    width="38"
                                    height="38"
                                    className="live-showcase-thumb"
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                      <div className="live-stream-grid">
                        {liveStreamItems.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="live-stream-item-btn"
                            onClick={() => {
                              setText(item.text)
                              void handlePredict(item.text, {
                                productHint: item.product_title || liveResolvedQuery,
                                category: item.category || selectedCategory,
                                platform: selectedPlatform !== 'semua' ? selectedPlatform : 'Tokopedia',
                              })
                            }}
                          >
                            <div className="live-stream-item-row">
                              {(item.thumbnail_url || item.image_url) && (
                                <img
                                  src={item.thumbnail_url || item.image_url}
                                  alt={item.product_title || item.category}
                                  width="48"
                                  height="48"
                                  className="live-stream-item-thumb"
                                  loading="lazy"
                                  referrerPolicy="no-referrer"
                                  onError={e => {
                                    const target = e.currentTarget
                                    if (item.image_url && target.src !== item.image_url) {
                                      target.src = item.image_url
                                    }
                                  }}
                                />
                              )}
                              <div className="live-stream-item-content">
                                <div className="live-stream-item-top">
                                  <span className={`sentiment-badge ${item.label}`}>
                                    {SENTIMENT_LABEL[item.label]} ({item.confidence.toFixed(0)}%)
                                  </span>
                                  <span className="live-stream-source">
                                    ★{item.rating || 5} · {item.source}
                                    {item.author ? ` · @${item.author}` : ''}
                                    {item.reviewed_at && item.reviewed_at !== 'Korpus'
                                      ? ` (${item.reviewed_at})`
                                      : ''}
                                  </span>
                                </div>
                                {item.product_title && (
                                  <div className="live-stream-product-name">{item.product_title}</div>
                                )}
                                <p className="live-stream-text">&ldquo;{item.text}&rdquo;</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="prediction-stream-container">
                  <HistoryDrawer
                    history={history}
                    onSelect={item => {
                      setText(item.inputText)
                      setResult(item)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    onClear={clearHistory}
                  />
                </div>
              </>
            )}

            {activeTab === 'batch' && <BatchUploadCard />}

            {activeTab === 'komparasi' && (
              <ProductComparisonView
                categoriesData={categoriesCatalog}
                onSelectReview={reviewText => {
                  setActiveTab('prediksi')
                  setText(reviewText)
                  void handlePredict(reviewText)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            )}

            {activeTab === 'evaluasi' && (
              <EvaluationDashboard
                metrics={metrics}
                loading={metricsLoading}
                error={metricsError}
                onRefresh={loadMetrics}
                onSelectWord={word => {
                  setActiveTab('prediksi')
                  setText(`Produk ini ${word}, kualitas bagus sesuai ekspektasi.`)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            )}
          </main>
        </div>

        <footer className="footer-note">
          Tugas Besar Kecerdasan Buatan · Politeknik Negeri Indramayu · Muhammad Faiz Ramadhan (2305072) &amp; Tim
        </footer>
      </div>
    </div>
  )
}
