import { useState, useEffect } from 'react'
import type { ClassMetric, MetricsReport, SentimentClass, TopFeatureWord } from '../types/sentiment'
import { fetchTopWords } from '../services/sentimentApi'

const ORDERED_CLASSES: SentimentClass[] = ['positif', 'netral', 'negatif']

interface EvaluationDashboardProps {
  metrics: MetricsReport | null
  loading: boolean
  error: string | null
  onRefresh?: () => void
  onSelectWord?: (word: string) => void
}

export function EvaluationDashboard({
  metrics,
  loading,
  error,
  onRefresh,
  onSelectWord,
}: EvaluationDashboardProps) {
  const [activePolarityFilter, setActivePolarityFilter] = useState<'all' | SentimentClass>('all')
  const [topWordsLimit, setTopWordsLimit] = useState<number>(30)
  const [wordsData, setWordsData] = useState<{
    positif: TopFeatureWord[]
    netral: TopFeatureWord[]
    negatif: TopFeatureWord[]
  } | null>(metrics?.top_features || null)
  const [fetchingWords, setFetchingWords] = useState<boolean>(false)
  const [selectedWordDetail, setSelectedWordDetail] = useState<TopFeatureWord | null>(null)

  // Sync if metrics updates with top_features
  useEffect(() => {
    if (metrics?.top_features) {
      setWordsData(metrics.top_features)
    }
  }, [metrics])

  // Fetch whenever user alters the limit
  useEffect(() => {
    let isMounted = true
    async function loadWords() {
      setFetchingWords(true)
      try {
        const res = await fetchTopWords(topWordsLimit)
        if (isMounted && res.success && res.words) {
          setWordsData(res.words)
        }
      } catch (err) {
        console.warn('Gagal memuat top words:', err)
      } finally {
        if (isMounted) setFetchingWords(false)
      }
    }
    loadWords()
    return () => {
      isMounted = false
    }
  }, [topWordsLimit])

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center' }} role="status">
        Memuat laporan evaluasi dari <code>models/metrics.json</code>...
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-banner" role="alert">
        <span>{error}</span>
      </div>
    )
  }

  if (!metrics) {
    return null
  }

  const matrixLabels = metrics.labels || ORDERED_CLASSES
  const distribution = metrics.dataset_info?.class_distribution || {}
  const totalSamples = metrics.dataset_info?.total_samples || 1

  return (
    <div id="evaluation-view">
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Macro F1-Score</div>
          <div className="kpi-value" style={{ color: 'var(--color-deep-teal)' }}>
            {(metrics.f1_macro * 100).toFixed(2)}%
          </div>
          <div className="kpi-sub">Target minimum PRD 70.0% tercapai</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Accuracy</div>
          <div className="kpi-value">{(metrics.accuracy * 100).toFixed(2)}%</div>
          <div className="kpi-sub">Weighted F1: {(metrics.f1_weighted * 100).toFixed(2)}%</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Arsitektur Pipeline Terbaik</div>
          <div className="kpi-value" style={{ fontSize: '1.05rem', marginTop: '8px' }}>
            {metrics.vectorizer_type} + {metrics.model_type}
          </div>
          <div className="kpi-sub">N-Gram (1, 2) · Stopword Sastrawi</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Korpus Ulasan Publik</div>
          <div className="kpi-value">{metrics.dataset_info?.total_samples ?? '-'}</div>
          <div className="kpi-sub">
            Latih: {metrics.dataset_info?.train_samples ?? '-'} · Uji:{' '}
            {metrics.dataset_info?.test_samples ?? '-'} (80:20)
          </div>
        </div>
      </div>

      <section className="card" id="dataset-distribution">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              Distribusi Korpus Ulasan (PRDECT-ID Tokopedia &amp; Hugging Face)
            </h2>
            <span className="card-subtitle">
              Total {metrics.dataset_info?.total_samples ?? 0} ulasan produk e-commerce Indonesia terverifikasi
            </span>
          </div>
          {onRefresh && (
            <button type="button" className="btn-secondary" onClick={onRefresh}>
              Segarkan Data Evaluasi
            </button>
          )}
        </div>

        <div className="prob-list">
          {ORDERED_CLASSES.map(cls => {
            const count = distribution[cls] || 0
            const pct = (count / totalSamples) * 100
            return (
              <div key={cls}>
                <div className="prob-item-header">
                  <span style={{ textTransform: 'capitalize' }}>
                    Kelas {cls} ({count} ulasan)
                  </span>
                  <span>{pct.toFixed(1)}%</span>
                </div>
                <div className="prob-track">
                  <div className={`prob-fill ${cls}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="card" id="class-metrics">
        <div className="card-header">
          <div>
            <h2 className="card-title">Metrik Pengujian per Kelas Sentimen</h2>
            <span className="card-subtitle">
              Dievaluasi pada 20% data uji terpisah (stratified split) dari <code>models/metrics.json</code>
            </span>
          </div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kelas Sentimen</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1-Score</th>
                <th>Data Uji (Support)</th>
              </tr>
            </thead>
            <tbody>
              {ORDERED_CLASSES.map(cls => {
                const row = metrics.classification_report[cls] as ClassMetric | undefined
                if (!row) return null
                return (
                  <tr key={cls}>
                    <td>
                      <span className={`sentiment-badge ${cls}`} style={{ textTransform: 'capitalize' }}>
                        {cls}
                      </span>
                    </td>
                    <td>{(row.precision * 100).toFixed(2)}%</td>
                    <td>{(row.recall * 100).toFixed(2)}%</td>
                    <td>
                      <strong style={{ fontWeight: 500 }}>{(row['f1-score'] * 100).toFixed(2)}%</strong>
                    </td>
                    <td>{row.support} ulasan</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" id="confusion-matrix">
        <div className="card-header">
          <div>
            <h2 className="card-title">Confusion Matrix (Data Uji Stratified 20%)</h2>
            <span className="card-subtitle">
              Baris menunjukkan label aktual; kolom menunjukkan kelas hasil prediksi model
            </span>
          </div>
        </div>

        <div className="cm-grid">
          <div />
          {matrixLabels.map(lbl => (
            <div key={`col-${lbl}`} className="cm-header" style={{ textTransform: 'capitalize' }}>
              Prediksi: {lbl}
            </div>
          ))}

          {metrics.confusion_matrix.map((rowValues, rowIdx) => {
            const rowLabel = matrixLabels[rowIdx]
            return (
              <div key={`row-${rowIdx}`} style={{ display: 'contents' }}>
                <div className="cm-row-label" style={{ textTransform: 'capitalize' }}>
                  Aktual: {rowLabel}
                </div>
                {rowValues.map((val, colIdx) => (
                  <div
                    key={`cell-${rowIdx}-${colIdx}`}
                    className={`cm-cell ${rowIdx === colIdx ? 'diagonal' : 'off-diagonal'}`}
                  >
                    {val}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </section>

      {/* Point 5: Visualisasi Word Cloud / Top Feature Weights Interaktif */}
      <section className="card" id="feature-importance-explorer">
        <div className="card-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="card-title">
              Explorer Fitur Leksikal &amp; Bobot Kata Naive Bayes (Word Importance)
            </h2>
            <span className="card-subtitle">
              Distribusi n-gram diskriminatif berdasarkan selisih log-likelihood pembobot korpus TF-IDF (5.459 ulasan)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div className="wordcloud-filter-group" role="tablist">
              <button
                type="button"
                className={`filter-chip ${activePolarityFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActivePolarityFilter('all')}
              >
                Semua Kelas
              </button>
              <button
                type="button"
                className={`filter-chip positif ${activePolarityFilter === 'positif' ? 'active' : ''}`}
                onClick={() => setActivePolarityFilter('positif')}
              >
                ● Positif
              </button>
              <button
                type="button"
                className={`filter-chip netral ${activePolarityFilter === 'netral' ? 'active' : ''}`}
                onClick={() => setActivePolarityFilter('netral')}
              >
                ● Netral
              </button>
              <button
                type="button"
                className={`filter-chip negatif ${activePolarityFilter === 'negatif' ? 'active' : ''}`}
                onClick={() => setActivePolarityFilter('negatif')}
              >
                ● Negatif
              </button>
            </div>

            <select
              className="select-limit-control"
              value={topWordsLimit}
              onChange={e => setTopWordsLimit(Number(e.target.value))}
              aria-label="Jumlah kata teratas"
            >
              <option value={15}>Top 15 kata</option>
              <option value={30}>Top 30 kata</option>
              <option value={50}>Top 50 kata</option>
            </select>
          </div>
        </div>

        {fetchingWords && (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-ink-muted)' }}>
            Memuat bobot leksikal terbaru...
          </div>
        )}

        {!fetchingWords && wordsData && (
          <div>
            {/* Word Cloud View */}
            <div className="wordcloud-wrapper">
              {ORDERED_CLASSES.filter(
                cls => activePolarityFilter === 'all' || activePolarityFilter === cls
              ).map(cls => {
                const words = wordsData[cls] || []
                if (words.length === 0) return null

                return (
                  <div key={cls} className="wordcloud-class-section">
                    <div className="wordcloud-class-header">
                      <span className={`sentiment-badge ${cls}`} style={{ textTransform: 'capitalize' }}>
                        Kata Kunci {cls}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)' }}>
                        {words.length} fitur diskriminatif
                      </span>
                    </div>

                    <div className="wordcloud-chips-grid">
                      {words.map((item, idx) => {
                        const isSelected = selectedWordDetail?.word === item.word
                        return (
                          <button
                            key={`${cls}-${item.word}-${idx}`}
                            type="button"
                            className={`wordcloud-chip ${cls} ${isSelected ? 'selected' : ''}`}
                            onClick={() => setSelectedWordDetail(item)}
                            title={`Bobot diskriminatif: ${item.score > 0 ? '+' : ''}${item.score.toFixed(2)}`}
                          >
                            <span className="wordcloud-text">{item.word}</span>
                            <span className="wordcloud-weight">
                              {item.score > 0 ? `+${item.score.toFixed(1)}` : item.score.toFixed(1)}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Selected Word Details Inspector */}
            {selectedWordDetail && (
              <div className="wordcloud-inspector-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-ink-muted)' }}>
                      Detail Fitur Leksikal
                    </span>
                    <h3 style={{ fontSize: '1.2rem', margin: '4px 0 2px 0', fontFamily: 'var(--font-serif)' }}>
                      "{selectedWordDetail.word}"
                    </h3>
                  </div>
                  <button
                    type="button"
                    className="btn-text-close"
                    onClick={() => setSelectedWordDetail(null)}
                    aria-label="Tutup detail kata"
                  >
                    ✕
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
                  <span className={`sentiment-badge ${selectedWordDetail.polarity}`}>
                    Kelas: {selectedWordDetail.polarity}
                  </span>
                  <span style={{ fontSize: '0.88rem', color: 'var(--color-ink-subtle)' }}>
                    Differential Log-Likelihood: <strong>{selectedWordDetail.score > 0 ? `+${selectedWordDetail.score.toFixed(3)}` : selectedWordDetail.score.toFixed(3)}</strong>
                  </span>
                  {onSelectWord && (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '4px 12px', fontSize: '0.82rem' }}
                      onClick={() => onSelectWord(selectedWordDetail.word)}
                    >
                      Uji Kalimat dengan Kata Ini
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {metrics.experiments && metrics.experiments.length > 0 && (
        <section className="card" id="pipeline-comparison">
          <div className="card-header">
            <div>
              <h2 className="card-title">Perbandingan 5 Konfigurasi Eksperimen</h2>
              <span className="card-subtitle">
                Perbandingan kombinasi ekstraksi fitur (TF-IDF vs CountVectorizer) dan algoritma (MultinomialNB vs ComplementNB)
              </span>
            </div>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Konfigurasi Eksperimen</th>
                  <th>Vectorizer</th>
                  <th>Classifier</th>
                  <th>Stopword Sastrawi</th>
                  <th>Accuracy</th>
                  <th>Macro F1</th>
                </tr>
              </thead>
              <tbody>
                {metrics.experiments.map((exp, idx) => (
                  <tr
                    key={idx}
                    style={
                      exp.experiment_name === metrics.experiment_name
                        ? { backgroundColor: 'var(--color-deep-teal-tint)' }
                        : undefined
                    }
                  >
                    <td>
                      <strong style={{ fontWeight: 500 }}>{exp.experiment_name}</strong>
                      {exp.experiment_name === metrics.experiment_name && (
                        <span className="teal-pill-badge" style={{ marginLeft: '8px' }}>
                          Model Aktif
                        </span>
                      )}
                    </td>
                    <td>{exp.vectorizer_type}</td>
                    <td>{exp.model_type}</td>
                    <td>{exp.use_stopwords ? 'Aktif' : 'Nonaktif'}</td>
                    <td>{(exp.accuracy * 100).toFixed(2)}%</td>
                    <td>
                      <strong style={{ fontWeight: 500 }}>{(exp.f1_macro * 100).toFixed(2)}%</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
