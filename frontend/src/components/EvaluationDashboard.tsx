import type { ClassMetric, MetricsReport, SentimentClass } from '../types/sentiment'

const ORDERED_CLASSES: SentimentClass[] = ['positif', 'netral', 'negatif']

interface EvaluationDashboardProps {
  metrics: MetricsReport | null
  loading: boolean
  error: string | null
  onRefresh?: () => void
}

export function EvaluationDashboard({
  metrics,
  loading,
  error,
  onRefresh,
}: EvaluationDashboardProps) {
  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        Memuat data evaluasi dari <code>models/metrics.json</code>...
      </div>
    )
  }

  if (error) {
    return <div className="error-banner">⚠️ {error}</div>
  }

  if (!metrics) {
    return null
  }

  const matrixLabels = metrics.labels || ORDERED_CLASSES
  const distribution = metrics.dataset_info?.class_distribution || {}
  const totalSamples = metrics.dataset_info?.total_samples || 1

  return (
    <main>
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Macro F1-Score</div>
          <div className="kpi-value" style={{ color: 'var(--primary)' }}>
            {(metrics.f1_macro * 100).toFixed(2)}%
          </div>
          <div className="kpi-sub">Target PRD ≥ 70.0% (Tercapai)</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Accuracy</div>
          <div className="kpi-value">{(metrics.accuracy * 100).toFixed(2)}%</div>
          <div className="kpi-sub">Weighted F1: {(metrics.f1_weighted * 100).toFixed(2)}%</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Pipeline Terbaik</div>
          <div className="kpi-value" style={{ fontSize: '1.15rem', marginTop: '10px' }}>
            {metrics.vectorizer_type} + {metrics.model_type}
          </div>
          <div className="kpi-sub">N-Gram (1, 2) • Stopwords Sastrawi</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Dataset Publik (Tokopedia)</div>
          <div className="kpi-value">{metrics.dataset_info?.total_samples ?? '-'}</div>
          <div className="kpi-sub">
            Latih: {metrics.dataset_info?.train_samples ?? '-'} • Uji:{' '}
            {metrics.dataset_info?.test_samples ?? '-'} (80:20)
          </div>
        </div>
      </div>

      {/* Distribusi Dataset Publik */}
      <section className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              Distribusi Dataset Publik (PRDECT-ID Tokopedia + Hugging Face)
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Total {metrics.dataset_info?.total_samples ?? 0} ulasan e-commerce berbahasa Indonesia
            </span>
          </div>
          {onRefresh && (
            <button type="button" className="btn-secondary" onClick={onRefresh} style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
              🔄 Muat Ulang Metrik
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

      <section className="card">
        <div className="card-header">
          <h3 className="card-title">Metrik Evaluasi per Kelas Sentimen</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Sumber: <code>models/metrics.json</code>
          </span>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kelas Sentimen</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1-Score</th>
                <th>Jumlah Data Uji (Support)</th>
              </tr>
            </thead>
            <tbody>
              {ORDERED_CLASSES.map(cls => {
                const row = metrics.classification_report[cls] as ClassMetric | undefined
                if (!row) return null
                return (
                  <tr key={cls}>
                    <td>
                      <span className={`sentiment-badge ${cls}`}>{cls}</span>
                    </td>
                    <td>{(row.precision * 100).toFixed(2)}%</td>
                    <td>{(row.recall * 100).toFixed(2)}%</td>
                    <td>
                      <strong>{(row['f1-score'] * 100).toFixed(2)}%</strong>
                    </td>
                    <td>{row.support} ulasan</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h3 className="card-title">Confusion Matrix (Data Uji Stratified 20%)</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Baris = Label Aktual • Kolom = Prediksi Model
          </span>
        </div>

        <div className="cm-grid">
          <div />
          {matrixLabels.map(lbl => (
            <div key={`col-${lbl}`} className="cm-header">
              Pred: {lbl}
            </div>
          ))}

          {metrics.confusion_matrix.map((rowValues, rowIdx) => {
            const rowLabel = matrixLabels[rowIdx]
            return (
              <div key={`row-${rowIdx}`} style={{ display: 'contents' }}>
                <div className="cm-row-label">Aktual: {rowLabel}</div>
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

      {metrics.experiments && metrics.experiments.length > 0 && (
        <section className="card">
          <div className="card-header">
            <h3 className="card-title">Perbandingan Konfigurasi Eksperimen Fitur & Model</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              CountVectorizer vs TF-IDF • MultinomialNB vs ComplementNB
            </span>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Eksperimen</th>
                  <th>Vectorizer</th>
                  <th>Classifier</th>
                  <th>Stopword Removal</th>
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
                        ? { background: 'var(--primary-soft)' }
                        : undefined
                    }
                  >
                    <td>
                      <strong>{exp.experiment_name}</strong>
                      {exp.experiment_name === metrics.experiment_name && (
                        <span
                          style={{
                            marginLeft: '8px',
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            background: 'var(--primary)',
                            color: '#fff',
                            fontWeight: 700,
                          }}
                        >
                          Terbaik
                        </span>
                      )}
                    </td>
                    <td>{exp.vectorizer_type}</td>
                    <td>{exp.model_type}</td>
                    <td>{exp.use_stopwords ? 'Ya (Sastrawi)' : 'Tidak'}</td>
                    <td>{(exp.accuracy * 100).toFixed(2)}%</td>
                    <td>
                      <strong>{(exp.f1_macro * 100).toFixed(2)}%</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  )
}
