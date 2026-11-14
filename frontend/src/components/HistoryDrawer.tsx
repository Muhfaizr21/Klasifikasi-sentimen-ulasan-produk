import type { PredictionResult, SentimentClass } from '../types/sentiment'

interface HistoryDrawerProps {
  history: PredictionResult[]
  onSelect: (item: PredictionResult) => void
  onClear: () => void
}

const BADGE_MAP: Record<SentimentClass, string> = {
  positif: 'Positif',
  netral: 'Netral',
  negatif: 'Negatif',
}

export function HistoryDrawer({ history, onSelect, onClear }: HistoryDrawerProps) {
  if (history.length === 0) {
    return null
  }

  return (
    <section className="card" aria-label="Riwayat Sesi Analisis">
      <div className="card-header">
        <div>
          <h2 className="card-title">Riwayat Analisis Terakhir ({history.length})</h2>
          <span className="card-subtitle">
            Pilih salah satu ulasan di bawah untuk menampilkan kembali rincian probabilitasnya
          </span>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={onClear}
        >
          Bersihkan Riwayat
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {history.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(item)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              backgroundColor: 'var(--color-parchment)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              textAlign: 'left',
              fontFamily: 'inherit',
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.84rem',
                  fontWeight: 400,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: 'var(--color-ink)',
                }}
              >
                &ldquo;{item.inputText}&rdquo;
              </p>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-ash)' }}>
                {item.latencyMs} ms · Keyakinan {item.confidence.toFixed(1)}%
              </span>
            </div>
            <span className={`sentiment-badge ${item.label}`}>
              {BADGE_MAP[item.label]}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
