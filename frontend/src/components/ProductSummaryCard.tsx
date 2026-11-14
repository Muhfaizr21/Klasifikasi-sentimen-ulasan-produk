import type { ProductExecutiveSummary } from '../types/sentiment'

interface ProductSummaryCardProps {
  summary: ProductExecutiveSummary
  onPrint?: () => void
}

export function ProductSummaryCard({ summary, onPrint }: ProductSummaryCardProps) {
  const breakdown = summary.sentiment_breakdown || { positif: 0, netral: 0, negatif: 0 }
  const isHighReputation = summary.reputation_score >= 80
  const isModerate = summary.reputation_score >= 60 && summary.reputation_score < 80

  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      window.print()
    }
  }

  return (
    <div className="card product-summary-card" aria-label="Sintesis Eksekutif Reputasi Produk">
      <div className="product-summary-header">
        <div className="product-summary-header-left">
          <div className="product-summary-kicker">
            <span>SINTESIS REPUTASI PRODUK</span>
            {summary.category && <span>· {summary.category}</span>}
          </div>
          <h3 className="product-summary-title">{summary.product_title}</h3>
          <span className="product-summary-sub">
            Berdasarkan analisis agregat {summary.total_reviews} ulasan pembeli · Rata-rata Rating {summary.average_rating.toFixed(1)} / 5.0
          </span>
        </div>

        <div className="product-summary-header-right">
          <div className="reputation-score-box">
            <span className="reputation-score-num">{summary.reputation_score.toFixed(1)}</span>
            <span className="reputation-score-label">/ 100 INDEKS</span>
          </div>
          <span
            className={`recommendation-badge ${
              isHighReputation ? 'badge-high' : isModerate ? 'badge-med' : 'badge-low'
            }`}
          >
            {summary.recommendation_badge}
          </span>
          <button
            type="button"
            className="summary-print-btn"
            onClick={handlePrint}
            title="Cetak atau simpan laporan resmi ke format PDF"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Aggregate Sentiment Bar */}
      <div className="aggregate-sentiment-bar-wrapper">
        <div className="aggregate-sentiment-meta">
          <span className="agg-label pos">Positif {breakdown.positif.toFixed(1)}%</span>
          <span className="agg-label neu">Netral {breakdown.netral.toFixed(1)}%</span>
          <span className="agg-label neg">Negatif {breakdown.negatif.toFixed(1)}%</span>
        </div>
        <div className="aggregate-sentiment-track" role="progressbar" aria-label="Distribusi Sentimen Agregat">
          <div className="agg-fill pos" style={{ width: `${breakdown.positif}%` }} title={`Positif ${breakdown.positif}%`} />
          <div className="agg-fill neu" style={{ width: `${breakdown.netral}%` }} title={`Netral ${breakdown.netral}%`} />
          <div className="agg-fill neg" style={{ width: `${breakdown.negatif}%` }} title={`Negatif ${breakdown.negatif}%`} />
        </div>
      </div>

      {/* Narrative Synthesis */}
      <p className="product-summary-narrative">{summary.executive_narrative}</p>

      {/* Pros & Cons Columns */}
      <div className="pros-cons-grid">
        <div className="pros-box">
          <div className="pros-cons-title pos">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Aspek Apresiasi Utama</span>
          </div>
          <ul className="pros-cons-list">
            {summary.pros.map((pro, idx) => (
              <li key={idx} className="pro-item">
                <span className="pro-icon" aria-hidden="true">+</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="cons-box">
          <div className="pros-cons-title neg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Catatan Keluhan Pembeli</span>
          </div>
          <ul className="pros-cons-list">
            {summary.cons.length > 0 ? (
              summary.cons.map((con, idx) => (
                <li key={idx} className="con-item">
                  <span className="con-icon" aria-hidden="true">-</span>
                  <span>{con}</span>
                </li>
              ))
            ) : (
              <li className="con-item empty">
                <span className="con-icon" aria-hidden="true">·</span>
                <span>Tidak ditemukan pola keluhan berulang pada sampel ulasan</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
