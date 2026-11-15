import { useState, useEffect } from 'react'
import { fetchCategories, requestProductComparison } from '../services/sentimentApi'
import type { CategoriesResponse, ProductComparisonResponse } from '../types/sentiment'
import { HelpButton } from './HelpTooltipModal'

const PRESET_SCENARIOS = [
  {
    id: 'speaker',
    tag: 'Audio',
    label: 'Eggel Fortis 2 vs JBL Go 3',
    a: 'Eggel Fortis 2 Speaker',
    b: 'JBL Go 3 Portable Speaker',
    category: 'Electronics',
  },
  {
    id: 'tws',
    tag: 'Earphone',
    label: 'Pro 4 TWS vs Lenovo Thinkplus LP40',
    a: 'Pro 4 TWS Bluetooth Earphone',
    b: 'Lenovo Thinkplus LP40 TWS',
    category: 'Phones and Tablets',
  },
  {
    id: 'laptop',
    tag: 'Komputer',
    label: 'SSD NVMe Samsung vs Kingston NV2',
    a: 'SSD NVMe Samsung 980 500GB',
    b: 'SSD Kingston NV2 PCIe 4.0',
    category: 'Computers and Laptops',
  },
  {
    id: 'fashion',
    tag: 'Pakaian',
    label: 'Kaos Erigo vs Roughneck 1991',
    a: 'Kaos Erigo Casual Cotton',
    b: 'Roughneck 1991 T-Shirt Pria',
    category: "Men's Fashion",
  },
  {
    id: 'dapur',
    tag: 'Dapur',
    label: 'Wajan Teflon vs Wajan Stainless',
    a: 'Wajan Teflon Anti Lengket',
    b: 'Wajan Wok Stainless Steel',
    category: 'Kitchen',
  },
]

interface ProductComparisonViewProps {
  onSelectReview?: (reviewText: string) => void
  categoriesData?: CategoriesResponse | null
}

export function ProductComparisonView({
  onSelectReview,
  categoriesData: externalCategories,
}: ProductComparisonViewProps = {}) {
  const [productA, setProductA] = useState('')
  const [productB, setProductB] = useState('')
  const [category, setCategory] = useState('Otomatis')
  const [selectedPresetId, setSelectedPresetId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ProductComparisonResponse | null>(null)
  const [localCategories, setLocalCategories] = useState<CategoriesResponse | null>(null)

  const categoriesCatalog = externalCategories || localCategories

  useEffect(() => {
    if (externalCategories) return
    let active = true
    fetchCategories()
      .then(data => {
        if (active) setLocalCategories(data)
      })
      .catch(() => {
        // Keep graceful fallback options if endpoint is unreachable
      })
    return () => {
      active = false
    }
  }, [externalCategories])

  const handleCompare = async (aInput?: string, bInput?: string, catInput?: string) => {
    const a = (aInput ?? productA).trim()
    const b = (bInput ?? productB).trim()
    const cat = catInput ?? category

    if (!a || !b) {
      setError('Masukkan nama atau tautan untuk kedua kandidat produk sebelum menjalankan komparasi.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const compRes = await requestProductComparison(a, b, cat)
      setResult(compRes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membandingkan kedua produk.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetComparison = () => {
    setProductA('')
    setProductB('')
    setSelectedPresetId('')
    setResult(null)
    setError(null)
  }

  const handleSwapCandidates = () => {
    if (loading) return
    const nextA = productB
    const nextB = productA
    setProductA(nextA)
    setProductB(nextB)
    setSelectedPresetId('')
    if (nextA.trim() && nextB.trim()) {
      void handleCompare(nextA, nextB, category)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const activeCategoryLabel = (() => {
    if (category === 'Otomatis' || category === 'Semua') {
      return 'Deteksi Otomatis'
    }
    const foundGranular = categoriesCatalog?.categories.find(c => c.id === category)
    if (foundGranular) return `${foundGranular.label} (${foundGranular.count} sampel)`
    const foundGroup = categoriesCatalog?.groups.find(g => g.id === category)
    if (foundGroup) return `${foundGroup.label} (${foundGroup.count} sampel)`
    return category
  })()

  return (
    <div className="compare-workspace" aria-label="Matriks Komparasi Reputasi Produk">
      {/* Editorial Workspace Header (Left-aligned, zero slop eyebrow pills) */}
      <header className="compare-workspace-header">
        <div className="compare-workspace-heading">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 className="compare-workspace-title">Komparasi Reputasi Produk</h1>
            <HelpButton topicId="compare_control_panel" />
          </div>
          <p className="compare-workspace-subtitle">
            Evaluasi berdampingan atas indeks reputasi, distribusi sentimen Multinomial Naive Bayes, dan bukti ulasan terverifikasi dari dua produk e-commerce.
          </p>
        </div>

        <div className="compare-workspace-meta">
          {categoriesCatalog && (
            <span className="compare-corpus-stat" title="Kategori ditarik secara dinamis dari korpus PRDECT-ID dan memori real-time">
              {categoriesCatalog.total_categories} kategori korpus · {categoriesCatalog.corpus_total.toLocaleString('id-ID')} ulasan
            </span>
          )}
          {result && (
            <button
              type="button"
              className="btn-secondary compare-export-btn"
              onClick={handlePrint}
              title="Cetak atau simpan matriks perbandingan ke PDF"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>Ekspor PDF</span>
            </button>
          )}
        </div>
      </header>

      {/* Control & Query Ledger Card */}
      <section className="card compare-control-panel" aria-label="Konfigurasi Kandidat Produk">
        {/* Preset Scenarios Bar */}
        <div className="compare-scenarios-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="compare-scenarios-label">Skenario Uji Cepat</span>
            <HelpButton topicId="compare_control_panel" />
          </div>
          <div className="compare-scenarios-list" role="list">
            {PRESET_SCENARIOS.map(preset => {
              const isSelected = selectedPresetId === preset.id
              return (
                <button
                  key={preset.id}
                  type="button"
                  role="listitem"
                  className={`compare-scenario-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedPresetId(preset.id)
                    setProductA(preset.a)
                    setProductB(preset.b)
                    setCategory(preset.category)
                    void handleCompare(preset.a, preset.b, preset.category)
                  }}
                  disabled={loading}
                >
                  <span className="compare-scenario-tag">{preset.tag}</span>
                  <span className="compare-scenario-text">{preset.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Form Inputs aligned into the 2-column grid */}
        <form
          className="compare-query-form"
          onSubmit={e => {
            e.preventDefault()
            setSelectedPresetId('')
            void handleCompare()
          }}
        >
          <div className="compare-inputs-row">
            {/* Candidate A Input */}
            <div className="compare-input-col">
              <div className="compare-input-label-row">
                <label htmlFor="compare-product-a-input" className="compare-input-label">
                  <span className="compare-candidate-index">A</span>
                  <span>Kandidat Produk Pertama</span>
                </label>
                <span className="compare-input-hint">Nama produk atau URL Tokopedia / Shopee</span>
              </div>
              <div className="compare-field-shell">
                <svg className="compare-field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.8-3.8" strokeLinecap="round" />
                </svg>
                <input
                  id="compare-product-a-input"
                  type="text"
                  className="compare-field-input"
                  placeholder="Contoh: Eggel Fortis 2 Speaker atau tautan produk..."
                  value={productA}
                  onChange={e => setProductA(e.target.value)}
                  disabled={loading}
                />
                {productA && !loading && (
                  <button
                    type="button"
                    className="compare-field-clear"
                    onClick={() => setProductA('')}
                    aria-label="Bersihkan input Kandidat A"
                    title="Bersihkan input"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Swap Button in Center Divider */}
            <div className="compare-swap-col">
              <button
                type="button"
                className="compare-swap-btn"
                onClick={handleSwapCandidates}
                disabled={loading}
                aria-label="Tukar posisi Kandidat A dan Kandidat B"
                title="Tukar posisi Kandidat A dan B"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Candidate B Input */}
            <div className="compare-input-col">
              <div className="compare-input-label-row">
                <label htmlFor="compare-product-b-input" className="compare-input-label">
                  <span className="compare-candidate-index">B</span>
                  <span>Kandidat Produk Kedua</span>
                </label>
                <span className="compare-input-hint">Nama produk atau URL Tokopedia / Shopee</span>
              </div>
              <div className="compare-field-shell">
                <svg className="compare-field-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.8-3.8" strokeLinecap="round" />
                </svg>
                <input
                  id="compare-product-b-input"
                  type="text"
                  className="compare-field-input"
                  placeholder="Contoh: JBL Go 3 Portable Speaker atau tautan produk..."
                  value={productB}
                  onChange={e => setProductB(e.target.value)}
                  disabled={loading}
                />
                {productB && !loading && (
                  <button
                    type="button"
                    className="compare-field-clear"
                    onClick={() => setProductB('')}
                    aria-label="Bersihkan input Kandidat B"
                    title="Bersihkan input"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Category & Submit Footer */}
          <div className="compare-toolbar-footer">
            <div className="compare-category-control">
              <label htmlFor="compare-category-select" className="compare-category-label">
                Filter Kategori Korpus
              </label>
              <div className="compare-select-wrapper">
                <select
                  id="compare-category-select"
                  className="compare-category-select"
                  value={category}
                  onChange={e => {
                    const nextCat = e.target.value
                    setCategory(nextCat)
                    if (productA.trim() && productB.trim()) {
                      void handleCompare(productA, productB, nextCat)
                    }
                  }}
                  disabled={loading}
                >
                  <option value="Otomatis">Deteksi Otomatis dari Kata Kunci Produk</option>
                  <option value="Semua">
                    Semua Kategori ({categoriesCatalog ? categoriesCatalog.corpus_total.toLocaleString('id-ID') : '5.459'} ulasan)
                  </option>

                  {categoriesCatalog && categoriesCatalog.groups.length > 0 ? (
                    <optgroup label="Kelompok Utama E-Commerce">
                      {categoriesCatalog.groups.map(grp => (
                        <option key={grp.id} value={grp.id}>
                          {grp.label} ({grp.count.toLocaleString('id-ID')} ulasan · {grp.subcategories} subkategori)
                        </option>
                      ))}
                    </optgroup>
                  ) : (
                    <optgroup label="Kelompok Utama E-Commerce">
                      <option value="Elektronik">Elektronik</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Rumah Tangga">Rumah Tangga</option>
                      <option value="Otomotif & Hobi">Otomotif &amp; Hobi</option>
                    </optgroup>
                  )}

                  {categoriesCatalog && categoriesCatalog.categories.length > 0 && (
                    <optgroup label={`Kategori Spesifik Dataset (${categoriesCatalog.categories.length} Kategori)`}>
                      {categoriesCatalog.categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label} · {cat.raw_name} ({cat.count.toLocaleString('id-ID')} ulasan)
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
              <span className="compare-active-filter-pill">
                Aktif: {activeCategoryLabel}
              </span>
            </div>

            <div className="compare-submit-actions">
              {(productA || productB || result) && (
                <button
                  type="button"
                  className="btn-secondary compare-reset-btn"
                  onClick={handleResetComparison}
                  disabled={loading}
                >
                  Reset
                </button>
              )}
              <button
                type="submit"
                className="btn-primary compare-submit-btn"
                disabled={loading || !productA.trim() || !productB.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    <span>Memproses Matriks Sentimen...</span>
                  </>
                ) : (
                  <span>Jalankan Komparasi</span>
                )}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="error-banner" role="alert" style={{ marginTop: '12px' }}>
            <span>{error}</span>
          </div>
        )}
      </section>

      {/* Default Empty State (Before user selects or enters products) */}
      {!loading && !result && (
        <section className="card compare-empty-state" aria-label="Panduan Awal Komparasi Produk">
          <div className="compare-empty-header">
            <span className="compare-empty-kicker">MATRIKS KOMPARASI SIAP DIGUNAKAN</span>
            <h2 className="compare-empty-title">Belum ada kandidat produk yang dipilih</h2>
            <p className="compare-empty-desc">
              Ketik nama produk atau tempel tautan Tokopedia dan Shopee pada kolom Kandidat A serta Kandidat B di atas, atau pilih salah satu Skenario Uji Cepat untuk memuat matriks perbandingan secara langsung.
            </p>
          </div>
          <div className="compare-empty-steps">
            <div className="compare-empty-step">
              <span className="compare-empty-step-num">01</span>
              <div>
                <div className="compare-empty-step-title">Masukkan 2 Kandidat Produk</div>
                <p className="compare-empty-step-text">
                  Mendukung nama produk spesifik maupun tautan produk langsung dari marketplace Indonesia.
                </p>
              </div>
            </div>
            <div className="compare-empty-step">
              <span className="compare-empty-step-num">02</span>
              <div>
                <div className="compare-empty-step-title">Pilih Filter Kategori Korpus</div>
                <p className="compare-empty-step-text">
                  Gunakan deteksi otomatis atau saring spesifik ke salah satu dari 30 subkategori dataset PRDECT-ID.
                </p>
              </div>
            </div>
            <div className="compare-empty-step">
              <span className="compare-empty-step-num">03</span>
              <div>
                <div className="compare-empty-step-title">Evaluasi Matriks Berdampingan</div>
                <p className="compare-empty-step-text">
                  Bandingkan indeks reputasi, proporsi sentimen positif/netral/negatif, poin kelebihan, dan kutipan ulasan asli.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Loading Skeleton State */}
      {loading && !result && (
        <section className="card compare-loading-state" aria-live="polite">
          <div className="compare-loading-inner">
            <span className="spinner" aria-hidden="true" />
            <div>
              <h2 className="compare-loading-title">Menyusun matriks perbandingan produk...</h2>
              <p className="compare-loading-sub">
                Menarik sampel ulasan korpus PRDECT-ID, menghitung distribusi probabilitas Multinomial Naive Bayes, dan memetakan aspek kelebihan serta keluhan.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Unified Comparison Matrix / Split Ledger */}
      {result && (
        <section
          className={`card compare-ledger ${loading ? 'is-refreshing' : ''}`}
          aria-label="Hasil Perbandingan Kandidat A dan Kandidat B"
        >
          {/* Row 1: Executive Decision Verdict Banner */}
          <div className="compare-verdict-row">
            <div className="compare-verdict-summary">
              <div className="compare-verdict-kicker-row">
                <span className="compare-verdict-kicker">KESIMPULAN KOMPARASI</span>
                <span className="compare-verdict-delta">
                  {result.winner === 'TIE'
                    ? 'Selisih 0.0 poin (Seimbang)'
                    : `Selisih +${Math.abs(result.score_diff).toFixed(1)} poin indeks`}
                </span>
                <HelpButton topicId="compare_verdict_banner" />
              </div>
              <h2 className="compare-verdict-headline">
                {result.winner === 'A'
                  ? `Kandidat A unggul: ${result.product_a.summary.product_title}`
                  : result.winner === 'B'
                    ? `Kandidat B unggul: ${result.product_b.summary.product_title}`
                    : 'Kedua kandidat memiliki reputasi konsumen yang seimbang'}
              </h2>
              <p className="compare-verdict-prose">{result.verdict}</p>
            </div>

            <div className="compare-verdict-scoreboard" aria-label="Ringkasan Skor Kandidat">
              <div className={`compare-score-chip ${result.winner === 'A' ? 'is-leading' : ''}`}>
                <span className="compare-score-chip-label">KANDIDAT A</span>
                <span className="compare-score-chip-val">{result.product_a.summary.reputation_score.toFixed(1)}</span>
              </div>
              <div className="compare-score-chip-divider" aria-hidden="true">:</div>
              <div className={`compare-score-chip ${result.winner === 'B' ? 'is-leading' : ''}`}>
                <span className="compare-score-chip-label">KANDIDAT B</span>
                <span className="compare-score-chip-val">{result.product_b.summary.reputation_score.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Row 2: Product Identity & Catalog Metadata */}
          <div className="compare-matrix-section">
            <div className="compare-section-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="compare-section-num">01</span>
                <span className="compare-section-title">Identitas Katalog &amp; Sampel Pasar</span>
              </div>
              <HelpButton topicId="compare_section_identity" />
            </div>
            <div className="compare-split-row">
              {[
                { side: 'A' as const, data: result.product_a, isWinner: result.winner === 'A' },
                { side: 'B' as const, data: result.product_b, isWinner: result.winner === 'B' },
              ].map(({ side, data, isWinner }) => {
                const { summary, showcase } = data
                return (
                  <div key={side} className={`compare-cell ${isWinner ? 'cell-leading' : ''}`}>
                    <div className="compare-cell-topline">
                      <span className="compare-candidate-tag">KANDIDAT {side}</span>
                      {isWinner && <span className="compare-lead-indicator">Indeks Tertinggi</span>}
                    </div>
                    <div className="compare-identity-block">
                      <div className="compare-thumb-frame">
                        {showcase?.image_url ? (
                          <img
                            src={showcase.image_url}
                            alt={summary.product_title}
                            width="64"
                            height="64"
                            className="compare-thumb-img"
                            loading="lazy"
                            onError={e => {
                              ;(e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="compare-thumb-fallback" aria-hidden="true">
                            <span>{side}</span>
                          </div>
                        )}
                      </div>
                      <div className="compare-identity-info">
                        <h3 className="compare-product-name">{summary.product_title}</h3>
                        <div className="compare-meta-inline">
                          <span>{summary.platform || 'E-Commerce Indonesia'}</span>
                          <span aria-hidden="true">·</span>
                          <span>{CATEGORY_LABELS_FALLBACK[summary.category || ''] || summary.category || 'Umum'}</span>
                          <span aria-hidden="true">·</span>
                          <span className="compare-tabular">
                            Rating {summary.average_rating.toFixed(1)} / 5.0 ({summary.total_reviews} ulasan)
                          </span>
                        </div>
                        {showcase?.product_url && (
                          <a
                            href={showcase.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="compare-catalog-link"
                          >
                            <span>Lihat referensi katalog</span>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <path d="M7 17L17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Row 3: Reputation Index & Sentiment Distribution */}
          <div className="compare-matrix-section">
            <div className="compare-section-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="compare-section-num">02</span>
                <span className="compare-section-title">Indeks Reputasi &amp; Distribusi Probabilitas Sentimen</span>
              </div>
              <HelpButton topicId="compare_section_reputation" />
            </div>
            <div className="compare-split-row">
              {[
                {
                  side: 'A' as const,
                  data: result.product_a,
                  otherScore: result.product_b.summary.reputation_score,
                  isWinner: result.winner === 'A',
                },
                {
                  side: 'B' as const,
                  data: result.product_b,
                  otherScore: result.product_a.summary.reputation_score,
                  isWinner: result.winner === 'B',
                },
              ].map(({ side, data, otherScore, isWinner }) => {
                const { summary } = data
                const breakdown = summary.sentiment_breakdown || { positif: 0, netral: 0, negatif: 0 }
                const diff = +(summary.reputation_score - otherScore).toFixed(1)
                const isHigh = summary.reputation_score >= 80
                const isMed = summary.reputation_score >= 60 && summary.reputation_score < 80

                return (
                  <div key={side} className={`compare-cell ${isWinner ? 'cell-leading' : ''}`}>
                    <div className="compare-metric-header">
                      <div className="compare-index-readout">
                        <span className="compare-index-number">{summary.reputation_score.toFixed(1)}</span>
                        <div className="compare-index-unit">
                          <span>/ 100 INDEKS REPUTASI</span>
                          {diff !== 0 && (
                            <span className={`compare-index-delta ${diff > 0 ? 'pos' : 'neg'}`}>
                              {diff > 0 ? `+${diff.toFixed(1)} vs Kandidat ${side === 'A' ? 'B' : 'A'}` : `${diff.toFixed(1)} vs Kandidat ${side === 'A' ? 'B' : 'A'}`}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`recommendation-badge ${
                          isHigh ? 'badge-high' : isMed ? 'badge-med' : 'badge-low'
                        }`}
                      >
                        {summary.recommendation_badge}
                      </span>
                    </div>

                    {/* Sentiment Bar + Tabular Breakdown */}
                    <div className="compare-dist-block">
                      <div className="compare-dist-track" role="progressbar" aria-label={`Distribusi sentimen Kandidat ${side}`}>
                        <div className="agg-fill pos" style={{ width: `${breakdown.positif}%` }} />
                        <div className="agg-fill neu" style={{ width: `${breakdown.netral}%` }} />
                        <div className="agg-fill neg" style={{ width: `${breakdown.negatif}%` }} />
                      </div>
                      <div className="compare-dist-legend">
                        <div className="compare-dist-stat">
                          <span className="compare-dist-dot pos" aria-hidden="true" />
                          <span className="compare-dist-name">Positif</span>
                          <span className="compare-dist-val">{breakdown.positif.toFixed(1)}%</span>
                        </div>
                        <div className="compare-dist-stat">
                          <span className="compare-dist-dot neu" aria-hidden="true" />
                          <span className="compare-dist-name">Netral</span>
                          <span className="compare-dist-val">{breakdown.netral.toFixed(1)}%</span>
                        </div>
                        <div className="compare-dist-stat">
                          <span className="compare-dist-dot neg" aria-hidden="true" />
                          <span className="compare-dist-name">Negatif</span>
                          <span className="compare-dist-val">{breakdown.negatif.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    <p className="compare-cell-narrative">{summary.executive_narrative}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Row 4: Pros & Cons Aligned Row */}
          <div className="compare-matrix-section">
            <div className="compare-section-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="compare-section-num">03</span>
                <span className="compare-section-title">Perbandingan Aspek Apresiasi &amp; Catatan Keluhan</span>
              </div>
              <HelpButton topicId="compare_section_pros_cons" />
            </div>
            <div className="compare-split-row">
              {[
                { side: 'A' as const, summary: result.product_a.summary, isWinner: result.winner === 'A' },
                { side: 'B' as const, summary: result.product_b.summary, isWinner: result.winner === 'B' },
              ].map(({ side, summary, isWinner }) => (
                <div key={side} className={`compare-cell ${isWinner ? 'cell-leading' : ''}`}>
                  <div className="compare-attr-group">
                    <h4 className="compare-attr-heading pos">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Aspek Apresiasi Utama (Kandidat {side})</span>
                    </h4>
                    <ul className="compare-attr-list">
                      {summary.pros.map((pro, i) => (
                        <li key={i} className="compare-attr-item">
                          <span className="compare-attr-marker pos" aria-hidden="true">+</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="compare-attr-group compare-attr-group-cons">
                    <h4 className="compare-attr-heading neg">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>Catatan Keluhan Pembeli (Kandidat {side})</span>
                    </h4>
                    <ul className="compare-attr-list">
                      {summary.cons.length > 0 ? (
                        summary.cons.map((con, i) => (
                          <li key={i} className="compare-attr-item">
                            <span className="compare-attr-marker neg" aria-hidden="true">-</span>
                            <span>{con}</span>
                          </li>
                        ))
                      ) : (
                        <li className="compare-attr-item muted">
                          <span className="compare-attr-marker" aria-hidden="true">·</span>
                          <span>Tidak ditemukan keluhan mayor berulang pada sampel ulasan</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 5: Verified Customer Review Evidence */}
          <div className="compare-matrix-section">
            <div className="compare-section-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="compare-section-num">04</span>
                <span className="compare-section-title">Bukti Kutipan Ulasan Pembeli Terverifikasi</span>
              </div>
              <HelpButton topicId="compare_section_evidence" />
            </div>
            <div className="compare-split-row">
              {[
                { side: 'A' as const, items: result.product_a.items, isWinner: result.winner === 'A' },
                { side: 'B' as const, items: result.product_b.items, isWinner: result.winner === 'B' },
              ].map(({ side, items, isWinner }) => (
                <div key={side} className={`compare-cell ${isWinner ? 'cell-leading' : ''}`}>
                  <div className="compare-evidence-list">
                    {(items || []).slice(0, 3).map((item, idx) => (
                      <article key={idx} className="compare-evidence-card">
                        <div className="compare-evidence-top">
                          <span className={`sentiment-badge ${item.label}`}>
                            {item.label.charAt(0).toUpperCase() + item.label.slice(1)} ({item.confidence.toFixed(0)}%)
                          </span>
                          <span className="compare-evidence-meta">
                            Rating {item.rating}/5 · {item.category || 'Korpus'}
                          </span>
                          {onSelectReview && (
                            <button
                              type="button"
                              className="compare-evidence-inspect-btn"
                              onClick={() => onSelectReview(item.text)}
                            >
                              Analisis detail
                            </button>
                          )}
                        </div>
                        <p className="compare-evidence-quote">"{item.text}"</p>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

const CATEGORY_LABELS_FALLBACK: Record<string, string> = {
  'Computers and Laptops': 'Komputer & Laptop',
  Electronics: 'Elektronik Konsumen',
  'Phones and Tablets': 'Ponsel & Tablet',
  Camera: 'Kamera & Fotografi',
  Gaming: 'Gaming & Konsol',
  'Muslim Fashion': 'Busana Muslim',
  "Men's Fashion": 'Fashion Pria',
  "Women's Fashion": 'Fashion Wanita',
  'Kids and Baby Fashion': 'Fashion Anak & Bayi',
  Beauty: 'Kecantikan & Skincare',
  'Body Care': 'Perawatan Tubuh',
  Household: 'Perlengkapan Rumah',
  Kitchen: 'Peralatan Dapur',
  Carpentry: 'Pertukangan & Perkakas',
  'Office & Stationery': 'Alat Tulis & Kantor',
  'Mother and Baby': 'Ibu & Bayi',
  'Food and Drink': 'Makanan & Minuman',
  Automotive: 'Otomotif',
  Sport: 'Olahraga & Outdoor',
  Books: 'Buku & Literatur',
  Health: 'Kesehatan & Medis',
  'Movies and Music': 'Film, Audio & Musik',
  'Party Supplies and Craft': 'Kerajinan & Perlengkapan Pesta',
  'Toys and Hobbies': 'Mainan & Hobi',
  'Animal Care': 'Perawatan Hewan',
  'Tour and Travel': 'Perjalanan & Travel',
  'Precious Metal': 'Logam Mulia',
  Property: 'Properti',
  'Other Products': 'Produk Lainnya',
  'General E-Commerce': 'E-Commerce Umum',
}
