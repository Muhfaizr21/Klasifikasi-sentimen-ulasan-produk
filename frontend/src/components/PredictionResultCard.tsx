import type { PredictionResult, SentimentClass } from '../types/sentiment'
import { ProbabilityBar } from './ProbabilityBar'

const BADGE_LABELS: Record<SentimentClass, string> = {
  positif: '😊 Positif',
  netral: '😐 Netral',
  negatif: '😠 Negatif',
}

interface PredictionResultCardProps {
  result: PredictionResult
}

export function PredictionResultCard({ result }: PredictionResultCardProps) {
  const explanation = result.explanation || []

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Hasil Klasifikasi Sentimen</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Waktu inferensi: {result.latencyMs} ms • Keyakinan tertinggi:{' '}
            <strong>{result.confidence.toFixed(2)}%</strong>
          </span>
        </div>
        <span className={`sentiment-badge ${result.label}`}>
          {BADGE_LABELS[result.label]}
        </span>
      </div>

      <div className="result-grid">
        <div className="info-box">
          <div className="info-box-label">Ulasan Asli</div>
          <p className="info-box-content">{result.inputText}</p>
        </div>
        <div className="info-box">
          <div className="info-box-label">
            Hasil Preprocessing (Slang & Stopword Removal)
          </div>
          <p className="info-box-content mono">{result.cleanText || '(kosong)'}</p>
        </div>
      </div>

      {/* Word Importance / Explainability */}
      {explanation.length > 0 && (
        <div style={{ marginTop: '18px' }}>
          <div className="info-box-label" style={{ marginBottom: '8px' }}>
            🔍 Analisis Kata Kunci Berpengaruh (Naive Bayes Log-Likelihood)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {explanation.map((item, idx) => {
              const isPos = item.polarity === 'positif'
              const isNeg = item.polarity === 'negatif'
              const bg = isPos
                ? 'var(--pos-bg)'
                : isNeg
                  ? 'var(--neg-bg)'
                  : 'var(--neu-bg)'
              const color = isPos
                ? 'var(--pos-text)'
                : isNeg
                  ? 'var(--neg-text)'
                  : 'var(--neu-text)'
              const border = isPos
                ? 'var(--pos-border)'
                : isNeg
                  ? 'var(--neg-border)'
                  : 'var(--neu-border)'

              return (
                <span
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    background: bg,
                    color: color,
                    border: `1px solid ${border}`,
                  }}
                >
                  <span>{item.word}</span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      opacity: 0.8,
                      fontFamily: 'monospace',
                    }}
                  >
                    {item.score > 0 ? `+${item.score}` : item.score}
                  </span>
                </span>
              )
            })}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            *Skor positif (hijau) mendorong ke arah Positif, skor negatif (merah) mendorong ke arah Negatif.
          </span>
        </div>
      )}

      <div className="prob-list">
        <ProbabilityBar
          label="Sentimen Positif"
          sentimentKey="positif"
          value={result.probabilities.positif}
        />
        <ProbabilityBar
          label="Sentimen Netral"
          sentimentKey="netral"
          value={result.probabilities.netral}
        />
        <ProbabilityBar
          label="Sentimen Negatif"
          sentimentKey="negatif"
          value={result.probabilities.negatif}
        />
      </div>
    </section>
  )
}
