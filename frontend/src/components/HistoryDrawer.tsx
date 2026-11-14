import type { PredictionResult, SentimentClass } from '../types/sentiment'

interface HistoryDrawerProps {
  history: PredictionResult[]
  onSelect: (item: PredictionResult) => void
  onClear: () => void
}

const BADGE_MAP: Record<SentimentClass, string> = {
  positif: '😊 Positif',
  netral: '😐 Netral',
  negatif: '😠 Negatif',
}

export function HistoryDrawer({ history, onSelect, onClear }: HistoryDrawerProps) {
  if (history.length === 0) {
    return null
  }

  return (
    <section className="card" style={{ marginTop: '20px' }}>
      <div className="card-header">
        <h3 className="card-title">🕒 Riwayat Ulasan Terakhir ({history.length})</h3>
        <button
          type="button"
          className="btn-secondary"
          onClick={onClear}
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
        >
          Hapus Riwayat
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {history.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onSelect(item)}
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              background: 'var(--surface-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              transition: 'background 0.2s',
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: 'var(--text-main)',
                }}
              >
                &ldquo;{item.inputText}&rdquo;
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {item.latencyMs} ms • Keyakinan {item.confidence.toFixed(1)}%
              </span>
            </div>
            <span className={`sentiment-badge ${item.label}`} style={{ fontSize: '0.78rem' }}>
              {BADGE_MAP[item.label]}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
