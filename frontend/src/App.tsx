import { useCallback, useEffect, useState } from 'react'
import { EvaluationDashboard } from './components/EvaluationDashboard'
import { HistoryDrawer } from './components/HistoryDrawer'
import { PredictionResultCard } from './components/PredictionResultCard'
import {
  fetchBackendHealth,
  fetchDatasetSamples,
  fetchEvaluationMetrics,
  requestSentimentPrediction,
} from './services/sentimentApi'
import type {
  DatasetSample,
  MetricsReport,
  PredictionResult,
  SentimentClass,
} from './types/sentiment'

const DEFAULT_SAMPLES: DatasetSample[] = [
  {
    sentiment: 'positif',
    rating: 5,
    category: 'Elektronik',
    source: 'PRDECT-ID (Tokopedia)',
    text: 'Barang original 100%, pengemasan super rapi pakai bubble wrap tebal dan pengiriman cepet bgt! Sangat puas belanja di toko ini, recommended seller!',
  },
  {
    sentiment: 'netral',
    rating: 3,
    category: 'Fashion',
    source: 'HuggingFace E-Commerce',
    text: 'Lumayan, tapi jangan expect banyak. Kualitas standar sesuai harga lah.',
  },
  {
    sentiment: 'negatif',
    rating: 1,
    category: 'Rumah Tangga',
    source: 'PRDECT-ID (Tokopedia)',
    text: 'Kecewa berat! Barang rusak parah pas sampe, paking ancur dan penjual tidak responsif saat dikomplain. Nyesel beli disini!',
  },
]

const CHIP_EMOJI: Record<SentimentClass, string> = {
  positif: '✨ Positif',
  netral: '⚖️ Netral',
  negatif: '⚠️ Negatif',
}

const STORAGE_KEY = 'sentiment_review_history_v1'

export default function App() {
  const [activeTab, setActiveTab] = useState<'prediksi' | 'evaluasi'>('prediksi')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [history, setHistory] = useState<PredictionResult[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)
  const [samples, setSamples] = useState<DatasetSample[]>(DEFAULT_SAMPLES)
  const [samplesLoading, setSamplesLoading] = useState(false)

  const [metrics, setMetrics] = useState<MetricsReport | null>(null)
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [metricsError, setMetricsError] = useState<string | null>(null)

  const saveHistory = (newItem: PredictionResult) => {
    setHistory(prev => {
      const updated = [newItem, ...prev.filter(x => x.inputText !== newItem.inputText)].slice(0, 5)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // Ignore
      }
      return updated
    })
  }

  const clearHistory = () => {
    setHistory([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore
    }
  }

  const loadMetrics = useCallback(() => {
    setMetricsLoading(true)
    setMetricsError(null)
    fetchEvaluationMetrics()
      .then(data => setMetrics(data))
      .catch(err => setMetricsError(err instanceof Error ? err.message : 'Gagal memuat metrik.'))
      .finally(() => setMetricsLoading(false))
  }, [])

  const loadRandomSamples = useCallback(() => {
    setSamplesLoading(true)
    fetchDatasetSamples()
      .then(data => {
        if (data.length > 0) {
          const picked: DatasetSample[] = []
          for (const cls of ['positif', 'netral', 'negatif'] as SentimentClass[]) {
            const match = data.find(item => item.sentiment === cls)
            if (match) picked.push(match)
          }
          setSamples(picked.length > 0 ? picked : data.slice(0, 3))
        }
      })
      .catch(() => {})
      .finally(() => setSamplesLoading(false))
  }, [])

  useEffect(() => {
    let active = true

    fetchBackendHealth()
      .then(status => {
        if (active) setBackendOnline(status.models_loaded)
      })
      .catch(() => {
        if (active) setBackendOnline(false)
      })

    fetchEvaluationMetrics()
      .then(data => {
        if (active) setMetrics(data)
      })
      .catch(err => {
        if (active) setMetricsError(err instanceof Error ? err.message : 'Gagal memuat metrik.')
      })
      .finally(() => {
        if (active) setMetricsLoading(false)
      })

    fetchDatasetSamples()
      .then(data => {
        if (active && data.length > 0) {
          const picked: DatasetSample[] = []
          for (const cls of ['positif', 'netral', 'negatif'] as SentimentClass[]) {
            const match = data.find(item => item.sentiment === cls)
            if (match) picked.push(match)
          }
          setSamples(picked.length > 0 ? picked : data.slice(0, 3))
        }
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [])

  const handlePredict = async (inputReview: string) => {
    const trimmed = inputReview.trim()
    if (!trimmed) {
      setError('Masukkan teks ulasan terlebih dahulu.')
      return
    }
    if (trimmed.length > 1000) {
      setError('Teks ulasan terlalu panjang (maksimal 1.000 karakter).')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const prediction = await requestSentimentPrediction(trimmed)
      setResult(prediction)
      saveHistory(prediction)
      setBackendOnline(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal menghubungi server backend. Pastikan server Flask aktif.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <nav className="topbar">
        <div className="brand">
          <div className="brand-icon">NB</div>
          <div>
            <h2 className="brand-title">Sentimen Ulasan Produk</h2>
            <p className="brand-subtitle">
              Politeknik Negeri Indramayu •{' '}
              <span
                style={{
                  color: backendOnline ? 'var(--primary)' : 'var(--neg-text)',
                  fontWeight: 600,
                }}
              >
                {backendOnline === null
                  ? 'Memeriksa API...'
                  : backendOnline
                    ? '● API & Model Terhubung (5.459 Data Tokopedia)'
                    : '○ API Offline'}
              </span>
            </p>
          </div>
        </div>

        <div className="nav-tabs" role="tablist">
          <button
            type="button"
            className={`nav-tab ${activeTab === 'prediksi' ? 'active' : ''}`}
            onClick={() => setActiveTab('prediksi')}
          >
            🔍 Demo Prediksi
          </button>
          <button
            type="button"
            className={`nav-tab ${activeTab === 'evaluasi' ? 'active' : ''}`}
            onClick={() => setActiveTab('evaluasi')}
          >
            📊 Evaluasi Model ({metrics ? `${(metrics.f1_macro * 100).toFixed(1)}% F1` : '...'})
          </button>
        </div>
      </nav>

      <header className="hero">
        <span className="hero-badge">
          ⚡ Naive Bayes Pipeline • Dataset PRDECT-ID Tokopedia & Hugging Face (5.459 Ulasan)
        </span>
        <h1>
          {activeTab === 'prediksi'
            ? 'Analisis Sentimen Ulasan Produk'
            : 'Evaluasi Performa Model Naive Bayes'}
        </h1>
        <p>
          {activeTab === 'prediksi'
            ? 'Klasifikasi otomatis ulasan marketplace (Tokopedia / Shopee) ke dalam sentimen Positif, Netral, atau Negatif lengkap dengan distribusi probabilitas kelas.'
            : 'Transparansi metrik pengujian pada data uji asli (stratified 80:20), Confusion Matrix, dan perbandingan 5 konfigurasi eksperimen.'}
        </p>
      </header>

      {activeTab === 'prediksi' ? (
        <main>
          <section className="card">
            <div className="card-header">
              <h3 className="card-title">Masukkan Ulasan Produk</h3>
              <button
                type="button"
                className="sample-chip"
                onClick={loadRandomSamples}
                disabled={samplesLoading}
                style={{ fontWeight: 600 }}
              >
                {samplesLoading ? 'Memuat...' : '🎲 Acak Sampel Asli Tokopedia'}
              </button>
            </div>

            <div className="sample-section">
              <span className="sample-label">
                Klik sampel ulasan asli dari dataset publik untuk menguji langsung:
              </span>
              <div className="sample-chips">
                {samples.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="sample-chip"
                    onClick={() => {
                      setText(sample.text)
                      handlePredict(sample.text)
                    }}
                  >
                    <strong>{CHIP_EMOJI[sample.sentiment]}</strong> ({sample.category} ★
                    {sample.rating}): &ldquo;
                    {sample.text.length > 55 ? `${sample.text.slice(0, 55)}...` : sample.text}
                    &rdquo;
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={event => {
                event.preventDefault()
                handlePredict(text)
              }}
            >
              <div className="textarea-wrapper">
                <label htmlFor="review-text" className="sample-label">
                  Teks Ulasan Pembeli
                </label>
                <textarea
                  id="review-text"
                  className="review-textarea"
                  placeholder="Ketik atau tempel ulasan produk berbahasa Indonesia di sini..."
                  value={text}
                  onChange={event => setText(event.target.value)}
                  disabled={loading}
                  maxLength={1000}
                />
                <div className="char-counter">
                  <span>Normalisasi slang & stopword Sastrawi aktif</span>
                  <span>{text.length} / 1000 karakter</span>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Menganalisis Sentimen...' : 'Analisis Sentimen Sekarang'}
                </button>
                {text && (
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={loading}
                    onClick={() => {
                      setText('')
                      setResult(null)
                      setError(null)
                    }}
                  >
                    Bersihkan
                  </button>
                )}
              </div>
            </form>
          </section>

          {error && <div className="error-banner">⚠️ {error}</div>}
          {result && <PredictionResultCard result={result} />}

          <HistoryDrawer
            history={history}
            onSelect={item => {
              setText(item.inputText)
              setResult(item)
            }}
            onClear={clearHistory}
          />
        </main>
      ) : (
        <EvaluationDashboard
          metrics={metrics}
          loading={metricsLoading}
          error={metricsError}
          onRefresh={loadMetrics}
        />
      )}

      <footer className="footer-note">
        Tugas Besar Kecerdasan Buatan • Politeknik Negeri Indramayu • Muhammad Faiz Ramadhan (2305072) & Tim
      </footer>
    </div>
  )
}
