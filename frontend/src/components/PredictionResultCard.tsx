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

