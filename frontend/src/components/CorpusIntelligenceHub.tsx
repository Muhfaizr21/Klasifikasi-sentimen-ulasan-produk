import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  fetchCorpusAnalytics,
  requestAiAnalyst,
  requestSentimentPrediction,
} from '../services/sentimentApi'
import type {
  AiAnalystResponse,
  CategoryMapItem,
  CorpusAnalyticsResponse,
} from '../types/sentiment'

type IconProps = { size?: number; style?: React.CSSProperties }

const Sparkles: React.FC<IconProps> = ({ size = 16, style }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const Compass: React.FC<IconProps> = ({ size = 16, style }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
)
const Target: React.FC<IconProps> = ({ size = 16, style }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
)
const SlidersHorizontal: React.FC<IconProps> = ({ size = 16, style }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
  </svg>
)
const Terminal: React.FC<IconProps> = ({ size = 16, style }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="4 17 10 11 4 5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="19" x2="20" y2="19" strokeLinecap="round" />
  </svg>
)
const Database: React.FC<IconProps> = ({ size = 15, style }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <ellipse cx="12" cy="5" rx="8" ry="3" />
    <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
    <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
  </svg>
)
const MessageSquare: React.FC<IconProps> = ({ size = 16, style }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const RefreshCw: React.FC<IconProps> = ({ size = 16, style }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 12a9 9 0 1 1-2.64-6.36L21 8" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="21 3 21 8 16 8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const Send: React.FC<IconProps> = ({ size = 16, style }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <line x1="22" y1="2" x2="11" y2="13" strokeLinecap="round" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" strokeLinejoin="round" />
  </svg>
)
const CheckCircle2: React.FC<IconProps> = ({ size = 16, style }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" />
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const ArrowRight: React.FC<IconProps> = ({ size = 14, style }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const BarChart3: React.FC<IconProps> = ({ size = 16, style }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 19h16M7 15V9m5 6V5m5 10v-4" strokeLinecap="round" />
  </svg>
)
const Search: React.FC<IconProps> = ({ size = 15, style }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.8-3.8" strokeLinecap="round" />
  </svg>
)
const TrendingUp: React.FC<IconProps> = ({ size = 16, style }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="16 7 22 7 22 13" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const TrendingDown: React.FC<IconProps> = ({ size = 16, style }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="16 17 22 17 22 11" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const Filter: React.FC<IconProps> = ({ size = 16, style }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" strokeLinejoin="round" />
  </svg>
)
const Star: React.FC<IconProps> = ({ size = 16, style }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)
const Activity: React.FC<IconProps> = ({ size = 16, style }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const MapPin: React.FC<IconProps> = ({ size = 16, style }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)
const Layers: React.FC<IconProps> = ({ size = 16, style }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
)
const Code2: React.FC<IconProps> = ({ size = 16, style }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13.5 6l-3 12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const Copy: React.FC<IconProps> = ({ size = 14, style }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)
const Play: React.FC<IconProps> = ({ size = 14, style }) => (
  <svg width={size} height={size} style={style} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

export type IntelligenceSubTab =
  | 'ai-chat'
  | 'peta-korpus'
  | 'target-kpi'
  | 'bedah-data'
  | 'katalog-api'

interface CorpusIntelligenceHubProps {
  activeSubTab: IntelligenceSubTab
  onSubTabChange: (tab: IntelligenceSubTab) => void
  initialAiQuestion?: string
  onInspectReview?: (reviewText: string, category?: string) => void
}

const PRESET_AI_QUESTIONS = [
  'Apa penyebab utama keluhan pengiriman pada kategori Elektronik bulan ini?',
  'Mengapa ulasan kategori Kecantikan & Skincare memiliki keluhan kemasan?',
  'Bagaimana distribusi emosi pelanggan Marah (Anger) dan Senang (Happy) di korpus?',
  'Bandingkan kualitas produk dan originalitas pada kategori Komputer & Laptop!',
  'Bagaimana dampak harga dan promo terhadap kepuasan ulasan Fashion?',
]

export const CorpusIntelligenceHub: React.FC<CorpusIntelligenceHubProps> = ({
  activeSubTab,
  onSubTabChange,
  initialAiQuestion,
  onInspectReview,
}) => {
  const [analytics, setAnalytics] = useState<CorpusAnalyticsResponse | null>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)

  // AI Analyst Chat state
  const [questionInput, setQuestionInput] = useState<string>(
    initialAiQuestion || PRESET_AI_QUESTIONS[0]
  )
  const [aiCategoryFilter, setAiCategoryFilter] = useState<string>('Semua')
  const [aiResult, setAiResult] = useState<AiAnalystResponse | null>(null)
  const [aiLoading, setAiLoading] = useState<boolean>(false)
  const [aiError, setAiError] = useState<string | null>(null)

  // Peta Korpus filter & sort state
  const [mapGroupFilter, setMapGroupFilter] = useState<string>('Semua')
  const [mapSearch, setMapSearch] = useState<string>('')
  const [mapSortBy, setMapSortBy] = useState<'total' | 'nss_desc' | 'nss_asc' | 'rating'>('total')

  // Bedah Data (Drill-Down) filter state
  const [drillCategory, setDrillCategory] = useState<string>('Semua')
  const [drillEmotion, setDrillEmotion] = useState<string>('Semua')
  const [drillRating, setDrillRating] = useState<string>('Semua')
  const [drillSentiment, setDrillSentiment] = useState<string>('Semua')
  const [drillLoading, setDrillLoading] = useState<boolean>(false)

  // API Playground state
  const [selectedEndpointIdx, setSelectedEndpointIdx] = useState<number>(0)
  const [playgroundInput, setPlaygroundInput] = useState<string>(
    'Barang original pengiriman super cepat paking aman banget mantap!'
  )
  const [playgroundCategory, setPlaygroundCategory] = useState<string>('Computers and Laptops')
  const [playgroundOutput, setPlaygroundOutput] = useState<string>('')
  const [playgroundRunning, setPlaygroundRunning] = useState<boolean>(false)
  const [copiedCode, setCopiedCode] = useState<boolean>(false)

  const loadAnalytics = useCallback(
    async (filters?: {
      category?: string
      emotion?: string
      rating?: string
      sentiment?: string
    }) => {
      try {
        if (filters) {
          setDrillLoading(true)
        } else {
          setLoadingAnalytics(true)
        }
        setAnalyticsError(null)
        const data = await fetchCorpusAnalytics(filters)
        setAnalytics(data)
      } catch (err: unknown) {
        setAnalyticsError(err instanceof Error ? err.message : 'Gagal memuat analitik korpus.')
      } finally {
        setLoadingAnalytics(false)
        setDrillLoading(false)
      }
    },
    []
  )

  const runAiQuery = useCallback(
    async (qText: string, catFilter: string = aiCategoryFilter) => {
      const cleanQ = qText.trim()
      if (!cleanQ) return
      try {
        setAiLoading(true)
        setAiError(null)
        const res = await requestAiAnalyst(cleanQ, catFilter)
        setAiResult(res)
      } catch (err: unknown) {
        setAiError(err instanceof Error ? err.message : 'Gagal menjalankan kueri Sentimen AI.')
      } finally {
        setAiLoading(false)
      }
    },
    [aiCategoryFilter]
  )

  useEffect(() => {
    void loadAnalytics()
  }, [loadAnalytics])

  useEffect(() => {
    const qToRun = initialAiQuestion?.trim() || PRESET_AI_QUESTIONS[0]
    setQuestionInput(qToRun)
    void runAiQuery(qToRun, 'Semua')
  }, [initialAiQuestion, runAiQuery])

  const handleDrillFilterChange = (
    nextCat: string,
    nextEmo: string,
    nextRat: string,
    nextSent: string
  ) => {
    setDrillCategory(nextCat)
    setDrillEmotion(nextEmo)
    setDrillRating(nextRat)
    setDrillSentiment(nextSent)
    void loadAnalytics({
      category: nextCat,
      emotion: nextEmo,
      rating: nextRat,
      sentiment: nextSent,
    })
  }

  const handleSelectCategoryForDrilldown = (catId: string) => {
    onSubTabChange('bedah-data')
    handleDrillFilterChange(catId, 'Semua', 'Semua', 'Semua')
  }

  const filteredCategories = useMemo(() => {
    if (!analytics?.category_map) return []
    return analytics.category_map
      .filter((item) => {
        if (mapGroupFilter !== 'Semua' && item.group !== mapGroupFilter) return false
        if (mapSearch.trim()) {
          const q = mapSearch.toLowerCase()
          return (
            item.label.toLowerCase().includes(q) ||
            item.id.toLowerCase().includes(q) ||
            item.group.toLowerCase().includes(q)
          )
        }
        return true
      })
      .sort((a, b) => {
        if (mapSortBy === 'nss_desc') return b.nss - a.nss
        if (mapSortBy === 'nss_asc') return a.nss - b.nss
        if (mapSortBy === 'rating') return b.avg_rating - a.avg_rating
        return b.total - a.total
      })
  }, [analytics?.category_map, mapGroupFilter, mapSearch, mapSortBy])

  const handleRunPlayground = async () => {
    setPlaygroundRunning(true)
    try {
      if (selectedEndpointIdx === 0) {
        const res = await requestSentimentPrediction(playgroundInput, {
          category: playgroundCategory,
        })
        setPlaygroundOutput(JSON.stringify(res, null, 2))
      } else if (selectedEndpointIdx === 1) {
        const res = await requestAiAnalyst(playgroundInput, playgroundCategory || 'Semua')
        setPlaygroundOutput(JSON.stringify(res, null, 2))
      } else {
        const res = await fetchCorpusAnalytics({
          category: playgroundCategory || 'Semua',
        })
        setPlaygroundOutput(
          JSON.stringify(
            {
              success: res.success,
              total_categories: res.category_map.length,
              kpi_summary: res.kpi_summary,
              drilldown_summary: {
                filtered_total: res.drilldown.filtered_total,
                filtered_avg_rating: res.drilldown.filtered_avg_rating,
              },
            },
            null,
            2
          )
        )
      }
    } catch (err: unknown) {
      setPlaygroundOutput(
        JSON.stringify(
          { success: false, error: err instanceof Error ? err.message : 'Request error' },
          null,
          2
        )
      )
    } finally {
      setPlaygroundRunning(false)
    }
  }

  const subTabs: Array<{
    id: IntelligenceSubTab
    label: string
    badge: string
    icon: React.ReactNode
  }> = [
    {
      id: 'ai-chat',
      label: 'Sentimen AI Chat',
      badge: 'Tanya Jawab Korpus',
      icon: <Sparkles size={15} />,
    },
    {
      id: 'peta-korpus',
      label: 'Peta Korpus (29 Kategori)',
      badge: `${analytics?.category_map.length || 29} Kategori`,
      icon: <Compass size={15} />,
    },
    {
      id: 'target-kpi',
      label: 'Target KPI & NSS',
      badge: '5 Indikator',
      icon: <Target size={15} />,
    },
    {
      id: 'bedah-data',
      label: 'Bedah Data (Drill-Down)',
      badge: 'Rating & Emosi',
      icon: <SlidersHorizontal size={15} />,
    },
    {
      id: 'katalog-api',
      label: 'Katalog Semantik & API',
      badge: 'Live Playground',
      icon: <Terminal size={15} />,
    },
  ]

  return (
    <div className="cih-root">
      {/* Header Banner */}
      <div className="cih-header-card">
        <div className="cih-header-top">
          <div>
            <div className="cih-eyebrow">
              <Database size={14} />
              <span>Platform Semantik &amp; Analitik Korpus PRDECT-ID Terintegrasi</span>
            </div>
            <h2 className="cih-title">
              Pusat Intelijen Korpus, Target KPI &amp; Eksplorasi Multi-Dimensi
            </h2>
            <p className="cih-subtitle">
              Seluruh fitur analitik dari halaman depan terhubung langsung ke{' '}
              <strong>
                {(analytics?.kpi_summary.total_samples ?? 5459).toLocaleString('id-ID')} ulasan
                riil
              </strong>{' '}
              beserta atribut Emosi Pelanggan, Rating Bintang (★1 s.d. ★5), 29 Kategori Produk, dan
              Sentimen API.
            </p>
          </div>

          {analytics && (
            <div className="cih-quick-kpis">
              <div className="cih-quick-kpi">
                <div className="cih-quick-kpi-label">Skor NSS</div>
                <div
                  className="cih-quick-kpi-val"
                  style={{
                    color:
                      analytics.kpi_summary.overall_nss >= 0 ? '#047857' : '#be123c',
                  }}
                >
                  {analytics.kpi_summary.overall_nss >= 0 ? '+' : ''}
                  {analytics.kpi_summary.overall_nss.toFixed(1)} pt
                </div>
              </div>
              <div className="cih-quick-kpi">
                <div className="cih-quick-kpi-label">Macro F1</div>
                <div className="cih-quick-kpi-val" style={{ color: '#016a71' }}>
                  {analytics.kpi_summary.f1_macro.toFixed(2)}%
                </div>
              </div>
              <div className="cih-quick-kpi">
                <div className="cih-quick-kpi-label">Akurasi Uji</div>
                <div className="cih-quick-kpi-val">
                  {analytics.kpi_summary.accuracy.toFixed(2)}%
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="cih-subtabs">
          {subTabs.map((tab) => {
            const active = activeSubTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSubTabChange(tab.id)}
                className={`cih-subtab-btn ${active ? 'is-active' : ''}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className="cih-subtab-badge">{tab.badge}</span>
              </button>
            )
          })}
        </div>
      </div>

      {analyticsError && (
        <div className="error-banner" role="alert">
          <span>{analyticsError}</span>
          <button
            type="button"
            onClick={() => void loadAnalytics()}
            className="cih-btn-primary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            Muat Ulang
          </button>
        </div>
      )}

      {/* =====================================================================
          1. MODE TANYA-JAWAB ANALITIK KORPUS ("SENTIMEN AI CHAT")
         ===================================================================== */}
      {activeSubTab === 'ai-chat' && (
        <>
          <div className="cih-panel">
            <div className="cih-panel-head">
              <div>
                <h3 className="cih-panel-title">
                  <Sparkles size={18} style={{ color: '#016a71' }} />
                  <span>Tanya Jawab Analitik Korpus (Sentimen AI)</span>
                </h3>
                <p className="cih-panel-desc">
                  Tanyakan penyebab keluhan, perbandingan kategori, atau tren emosi pelanggan dalam
                  bahasa alami. AI menyintesis jawaban langsung dari 5.459 ulasan PRDECT-ID dan
                  bobot token Multinomial Naive Bayes.
                </p>
              </div>
              <select
                value={aiCategoryFilter}
                onChange={(e) => {
                  const nextCat = e.target.value
                  setAiCategoryFilter(nextCat)
                  void runAiQuery(questionInput, nextCat)
                }}
                aria-label="Filter cakupan kategori AI"
                className="cih-select"
              >
                <option value="Semua">Cakupan: Semua Kategori (29)</option>
                <option value="Elektronik">Grup: Elektronik &amp; Gadget</option>
                <option value="Fashion">Grup: Fashion &amp; Kecantikan</option>
                <option value="Rumah Tangga">Grup: Rumah Tangga &amp; Dapur</option>
                <option value="Otomotif & Hobi">Grup: Otomotif, Hobi &amp; Kesehatan</option>
                {analytics?.category_map.map((c) => (
                  <option key={c.id} value={c.id}>
                    Kategori: {c.label} ({c.total})
                  </option>
                ))}
              </select>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                void runAiQuery(questionInput, aiCategoryFilter)
              }}
              className="cih-form-row"
            >
              <div className="cih-input-wrap">
                <span className="cih-input-icon">
                  <MessageSquare size={16} />
                </span>
                <input
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="Contoh: Apa penyebab utama keluhan pengiriman pada kategori Elektronik?"
                  className="cih-input"
                />
              </div>
              <button
                type="submit"
                disabled={aiLoading || !questionInput.trim()}
                className="cih-btn-primary"
              >
                {aiLoading ? (
                  <>
                    <RefreshCw size={15} />
                    <span>Menganalisis Korpus...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Tanyakan ke AI</span>
                  </>
                )}
              </button>
            </form>

            <div className="cih-presets">
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#66645e' }}>
                Pertanyaan Populer:
              </span>
              {PRESET_AI_QUESTIONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setQuestionInput(preset)
                    void runAiQuery(preset, aiCategoryFilter)
                  }}
                  className="cih-preset-chip"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {aiError && (
            <div className="error-banner" role="alert">
              <span>{aiError}</span>
            </div>
          )}

          {aiResult && (
            <div className="cih-ai-layout">
              {/* Left Column: Narrative, Key Findings & Evidence Reviews */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="cih-panel">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    <span className="cih-badge is-pos">{aiResult.matched_category_label}</span>
                    <span className="cih-badge" style={{ background: '#f1f0ec', color: '#3f3d37' }}>
                      Aspek: {aiResult.matched_aspect}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.08rem', fontWeight: 700, margin: '0 0 6px', color: '#27251e' }}>
                    {aiResult.headline}
                  </h4>

                  <div className="cih-narrative-box">{aiResult.narrative}</div>

                  <div className="cih-grid-4">
                    <div className="cih-stat-card is-pos">
                      <div className="cih-quick-kpi-label" style={{ color: '#065f46' }}>
                        Sentimen Positif
                      </div>
                      <div className="cih-quick-kpi-val" style={{ color: '#047857' }}>
                        {aiResult.metrics_highlight.positif_pct}%
                      </div>
                    </div>
                    <div className="cih-stat-card is-neg">
                      <div className="cih-quick-kpi-label" style={{ color: '#9f1239' }}>
                        Sentimen Negatif
                      </div>
                      <div className="cih-quick-kpi-val" style={{ color: '#be123c' }}>
                        {aiResult.metrics_highlight.negatif_pct}%
                      </div>
                    </div>
                    <div className="cih-stat-card">
                      <div className="cih-quick-kpi-label">Net Sentiment (NSS)</div>
                      <div
                        className="cih-quick-kpi-val"
                        style={{
                          color: aiResult.metrics_highlight.nss >= 0 ? '#016a71' : '#be123c',
                        }}
                      >
                        {aiResult.metrics_highlight.nss >= 0 ? '+' : ''}
                        {aiResult.metrics_highlight.nss} pt
                      </div>
                    </div>
                    <div className="cih-stat-card is-warn">
                      <div className="cih-quick-kpi-label" style={{ color: '#92400e' }}>
                        Rata-rata Rating
                      </div>
                      <div className="cih-quick-kpi-val" style={{ color: '#b45309' }}>
                        ★ {aiResult.metrics_highlight.avg_rating.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '18px' }}>
                    <div
                      style={{
                        fontSize: '0.73rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: '#66645e',
                        marginBottom: '10px',
                      }}
                    >
                      Temuan Utama Korpus &amp; Psikografi Emosi
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {aiResult.key_findings.map((finding, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            fontSize: '0.84rem',
                            color: '#3f3d37',
                          }}
                        >
                          <CheckCircle2 size={16} style={{ color: '#016a71', marginTop: '2px' }} />
                          <span>{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Evidence Reviews */}
                <div className="cih-panel">
                  <h5 style={{ fontSize: '0.94rem', fontWeight: 700, margin: '0 0 12px', color: '#27251e' }}>
                    Bukti Empiris Ulasan Pelanggan Terkait ({aiResult.evidence_reviews.length} Sampel)
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {aiResult.evidence_reviews.map((rev, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '13px 15px',
                          borderRadius: '12px',
                          background: '#faf9f6',
                          border: '1px solid #e4e2dd',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                            marginBottom: '6px',
                          }}
                        >
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                            <span
                              className={`cih-badge ${
                                rev.sentiment === 'positif'
                                  ? 'is-pos'
                                  : rev.sentiment === 'negatif'
                                    ? 'is-neg'
                                    : 'is-net'
                              }`}
                            >
                              {rev.sentiment.toUpperCase()}
                            </span>
                            <span className="cih-badge is-net">★ {rev.rating}/5</span>
                            <span
                              className="cih-badge"
                              style={{ background: '#ffffff', border: '1px solid #e4e2dd', color: '#3f3d37' }}
                            >
                              Emosi: {rev.emotion_label}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#66645e' }}>
                              • {rev.category_label} ({rev.location})
                            </span>
                          </div>
                          {onInspectReview && (
                            <button
                              type="button"
                              onClick={() => onInspectReview(rev.text, rev.category_label)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'none',
                                border: 'none',
                                color: '#016a71',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              <span>Inspeksi XAI</span>
                              <ArrowRight size={13} />
                            </button>
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.84rem', fontStyle: 'italic', color: '#27251e' }}>
                          &ldquo;{rev.text}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Chart Breakdown & Driving Tokens */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="cih-panel">
                  <h4 className="cih-panel-title" style={{ fontSize: '0.95rem', marginBottom: '4px' }}>
                    <BarChart3 size={16} style={{ color: '#016a71' }} />
                    <span>{aiResult.chart_title}</span>
                  </h4>
                  <p className="cih-panel-desc" style={{ marginBottom: '14px' }}>
                    Proporsi sentimen positif (hijau) berbanding negatif (merah) pada segmen terkait
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {aiResult.chart_bars.map((bar, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.79rem',
                            gap: '8px',
                          }}
                        >
                          <strong style={{ color: '#27251e' }}>{bar.label}</strong>
                          <span style={{ color: '#66645e' }}>{bar.value_label}</span>
                        </div>
                        <div className="cih-bar-track">
                          {bar.positif_pct > 0 && (
                            <div
                              style={{ width: `${Math.min(100, bar.positif_pct)}%` }}
                              className="cih-bar-pos"
                              title={`Positif: ${bar.positif_pct}%`}
                            />
                          )}
                          {bar.negatif_pct > 0 && (
                            <div
                              style={{ width: `${Math.min(100, bar.negatif_pct)}%` }}
                              className="cih-bar-neg"
                              title={`Negatif: ${bar.negatif_pct}%`}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="cih-panel">
                  <h4 className="cih-panel-title" style={{ fontSize: '0.95rem', marginBottom: '4px' }}>
                    <span>Atribusi Token Pendorong (Multinomial Naive Bayes)</span>
                  </h4>
                  <p className="cih-panel-desc" style={{ marginBottom: '14px' }}>
                    Kata kunci dengan bobot log-probability tertinggi pada kamus TF-IDF
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#be123c', marginBottom: '8px' }}>
                        Token Pemicu Keluhan (Kelas Negatif)
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {aiResult.top_tokens.negatif.map((t, i) => (
                          <span key={i} className="cih-badge is-neg">
                            {t.word} ({t.score.toFixed(2)})
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#047857', marginBottom: '8px' }}>
                        Token Pendorong Kepuasan (Kelas Positif)
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {aiResult.top_tokens.positif.map((t, i) => (
                          <span key={i} className="cih-badge is-pos">
                            {t.word} ({t.score.toFixed(2)})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* =====================================================================
          2. PETA PERSEBARAN SENTIMEN 29 KATEGORI (PETA KORPUS)
         ===================================================================== */}
      {activeSubTab === 'peta-korpus' && (
        <div className="cih-panel">
          <div className="cih-panel-head">
            <div>
              <h3 className="cih-panel-title">
                <Compass size={18} style={{ color: '#016a71' }} />
                <span>
                  Peta Persebaran Sentimen {analytics?.category_map.length || 29} Kategori Produk
                </span>
              </h3>
              <p className="cih-panel-desc">
                Distribusi lengkap Positif vs Netral vs Negatif, Net Sentiment Score (NSS), rata-rata
                rating bintang, dan emosi dominan di setiap kategori e-commerce. Klik kartu kategori
                untuk membedah ulasan.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <span className="cih-input-icon">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  value={mapSearch}
                  onChange={(e) => setMapSearch(e.target.value)}
                  placeholder="Cari kategori..."
                  className="cih-input"
                  style={{ padding: '8px 12px 8px 32px', fontSize: '0.8rem', width: '180px' }}
                />
              </div>

              <select
                value={mapGroupFilter}
                onChange={(e) => setMapGroupFilter(e.target.value)}
                aria-label="Filter grup kategori"
                className="cih-select"
              >
                <option value="Semua">Semua Grup Makro</option>
                <option value="Elektronik">Elektronik</option>
                <option value="Fashion">Fashion &amp; Kecantikan</option>
                <option value="Rumah Tangga">Rumah Tangga</option>
                <option value="Otomotif & Hobi">Otomotif &amp; Hobi</option>
              </select>

              <select
                value={mapSortBy}
                onChange={(e) =>
                  setMapSortBy(
                    e.target.value as 'total' | 'nss_desc' | 'nss_asc' | 'rating'
                  )
                }
                aria-label="Urutkan kategori"
                className="cih-select"
              >
                <option value="total">Urutkan: Volume Terbanyak</option>
                <option value="nss_desc">Urutkan: NSS Tertinggi (Terpuas)</option>
                <option value="nss_asc">Urutkan: NSS Terendah (Kritis)</option>
                <option value="rating">Urutkan: Rating Bintang Tertinggi</option>
              </select>
            </div>
          </div>

          {loadingAnalytics ? (
            <div style={{ padding: '36px 0', textAlign: 'center', color: '#66645e' }}>
              Memuat peta persebaran 29 kategori...
            </div>
          ) : (
            <div className="cih-grid-3">
              {filteredCategories.map((cat: CategoryMapItem) => (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategoryForDrilldown(cat.id)}
                  className="cih-cat-card"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div>
                      <div
                        style={{
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          color: '#66645e',
                        }}
                      >
                        {cat.group}
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#27251e' }}>
                        {cat.label}
                      </div>
                    </div>
                    <span
                      className={`cih-badge ${
                        cat.nss >= 5 ? 'is-pos' : cat.nss >= 0 ? 'is-net' : 'is-neg'
                      }`}
                    >
                      NSS {cat.nss >= 0 ? '+' : ''}
                      {cat.nss}%
                    </span>
                  </div>

                  <div className="cih-bar-track">
                    <div
                      style={{ width: `${cat.positif_pct}%` }}
                      className="cih-bar-pos"
                      title={`Positif: ${cat.positif_pct}%`}
                    />
                    <div
                      style={{ width: `${cat.netral_pct}%` }}
                      className="cih-bar-net"
                      title={`Netral: ${cat.netral_pct}%`}
                    />
                    <div
                      style={{ width: `${cat.negatif_pct}%` }}
                      className="cih-bar-neg"
                      title={`Negatif: ${cat.negatif_pct}%`}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.73rem',
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ color: '#047857' }}>
                      {cat.positif_pct}% Pos ({cat.positif})
                    </span>
                    <span style={{ color: '#b45309' }}>
                      {cat.netral_pct}% Net ({cat.netral})
                    </span>
                    <span style={{ color: '#be123c' }}>
                      {cat.negatif_pct}% Neg ({cat.negatif})
                    </span>
                  </div>

                  <div
                    style={{
                      paddingTop: '8px',
                      borderTop: '1px solid #e4e2dd',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.74rem',
                      color: '#66645e',
                    }}
                  >
                    <span>
                      Total: <strong style={{ color: '#27251e' }}>{cat.total}</strong> •{' '}
                      <strong style={{ color: '#b45309' }}>★ {cat.avg_rating}</strong>
                    </span>
                    <span style={{ color: '#016a71', fontWeight: 700 }}>Bedah Data →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          3. PANEL PELACAK TARGET KPI & NET SENTIMENT SCORE (NSS)
         ===================================================================== */}
      {activeSubTab === 'target-kpi' && analytics && (
        <>
          <div className="cih-grid-3">
            {analytics.kpi_summary.kpi_targets.map((kpi) => (
              <div key={kpi.id} className="cih-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="cih-quick-kpi-label">Indikator Terkelola</span>
                    <span className={`cih-badge ${kpi.achieved ? 'is-pos' : 'is-net'}`}>
                      {kpi.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#27251e' }}>
                    {kpi.label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '10px' }}>
                    <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#27251e' }}>
                      {kpi.id === 'net_sentiment_score' && kpi.current_value > 0 ? '+' : ''}
                      {kpi.current_value}
                      {kpi.unit}
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#66645e' }}>
                      Target: {kpi.target_value}
                      {kpi.unit} ({kpi.delta >= 0 ? `+${kpi.delta}` : kpi.delta}
                      {kpi.unit})
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: '14px',
                    paddingTop: '10px',
                    borderTop: '1px solid #e4e2dd',
                    fontSize: '0.73rem',
                    color: '#66645e',
                    fontFamily: 'monospace',
                  }}
                >
                  Rumus: {kpi.formula}
                </div>
              </div>
            ))}
          </div>

          <div className="cih-grid-2">
            <div className="cih-panel">
              <h4 className="cih-panel-title" style={{ marginBottom: '12px' }}>
                <TrendingUp size={17} style={{ color: '#047857' }} />
                <span>Top 5 Kategori dengan Net Sentiment Score (NSS) Tertinggi</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {analytics.kpi_summary.top_nss_categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCategoryForDrilldown(cat.id)}
                    className="cih-stat-card is-pos"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#27251e' }}>
                        {cat.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#57554f' }}>
                        {cat.positif_pct}% Positif vs {cat.negatif_pct}% Negatif ({cat.total} ulasan
                        • ★{cat.avg_rating})
                      </div>
                    </div>
                    <span className="cih-badge is-pos">+{cat.nss} pt</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="cih-panel">
              <h4 className="cih-panel-title" style={{ marginBottom: '12px' }}>
                <TrendingDown size={17} style={{ color: '#be123c' }} />
                <span>5 Kategori Prioritas Perbaikan (Rasio Keluhan Tertinggi)</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {analytics.kpi_summary.critical_nss_categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCategoryForDrilldown(cat.id)}
                    className="cih-stat-card is-neg"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#27251e' }}>
                        {cat.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#57554f' }}>
                        {cat.negatif_pct}% Negatif vs {cat.positif_pct}% Positif ({cat.total} ulasan
                        • ★{cat.avg_rating})
                      </div>
                    </div>
                    <span className="cih-badge is-neg">
                      {cat.nss >= 0 ? `+${cat.nss}` : cat.nss} pt
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* =====================================================================
          4. BEDAH DATA (DRILL-DOWN EXPLORER RATING ★1-★5, EMOSI, & KOTA)
         ===================================================================== */}
      {activeSubTab === 'bedah-data' && analytics && (
        <>
          <div className="cih-panel">
            <div className="cih-panel-head">
              <div>
                <h3 className="cih-panel-title">
                  <Filter size={18} style={{ color: '#016a71' }} />
                  <span>Bedah Data Multi-Dimensi (Rating ★1–★5, Emosi PRDECT-ID &amp; Kota)</span>
                </h3>
                <p className="cih-panel-desc">
                  Eksplorasi silang atribut asli dataset PRDECT-ID: saring berdasarkan kategori,
                  tingkat emosi pelanggan, rating bintang, dan kelas sentimen.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDrillFilterChange('Semua', 'Semua', 'Semua', 'Semua')}
                className="cih-select"
              >
                Reset Filter ({analytics.drilldown.filtered_total.toLocaleString('id-ID')} cocok)
              </button>
            </div>

            <div className="cih-grid-4">
              <div>
                <label className="cih-quick-kpi-label" style={{ display: 'block', marginBottom: '5px' }}>
                  1. Kategori Produk
                </label>
                <select
                  value={drillCategory}
                  onChange={(e) =>
                    handleDrillFilterChange(
                      e.target.value,
                      drillEmotion,
                      drillRating,
                      drillSentiment
                    )
                  }
                  className="cih-select"
                  style={{ width: '100%' }}
                >
                  <option value="Semua">Semua Kategori (29)</option>
                  {analytics.category_map.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({c.total})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="cih-quick-kpi-label" style={{ display: 'block', marginBottom: '5px' }}>
                  2. Emosi Pelanggan (PRDECT-ID)
                </label>
                <select
                  value={drillEmotion}
                  onChange={(e) =>
                    handleDrillFilterChange(
                      drillCategory,
                      e.target.value,
                      drillRating,
                      drillSentiment
                    )
                  }
                  className="cih-select"
                  style={{ width: '100%' }}
                >
                  <option value="Semua">Semua Tingkat Emosi (5)</option>
                  <option value="Happy">Senang (Happy)</option>
                  <option value="Love">Sangat Puas / Cinta (Love)</option>
                  <option value="Sadness">Kecewa / Sedih (Sadness)</option>
                  <option value="Fear">Khawatir / Ragu (Fear)</option>
                  <option value="Anger">Marah / Komplain Keras (Anger)</option>
                </select>
              </div>

              <div>
                <label className="cih-quick-kpi-label" style={{ display: 'block', marginBottom: '5px' }}>
                  3. Rating Bintang Pelanggan
                </label>
                <select
                  value={drillRating}
                  onChange={(e) =>
                    handleDrillFilterChange(
                      drillCategory,
                      drillEmotion,
                      e.target.value,
                      drillSentiment
                    )
                  }
                  className="cih-select"
                  style={{ width: '100%' }}
                >
                  <option value="Semua">Semua Rating (★1 s.d. ★5)</option>
                  <option value="5">★ 5 Bintang (Sangat Puas)</option>
                  <option value="4">★ 4 Bintang (Puas)</option>
                  <option value="3">★ 3 Bintang (Standar)</option>
                  <option value="2">★ 2 Bintang (Kurang)</option>
                  <option value="1">★ 1 Bintang (Kecewa)</option>
                </select>
              </div>

              <div>
                <label className="cih-quick-kpi-label" style={{ display: 'block', marginBottom: '5px' }}>
                  4. Kelas Sentimen
                </label>
                <select
                  value={drillSentiment}
                  onChange={(e) =>
                    handleDrillFilterChange(
                      drillCategory,
                      drillEmotion,
                      drillRating,
                      e.target.value
                    )
                  }
                  className="cih-select"
                  style={{ width: '100%' }}
                >
                  <option value="Semua">Semua Sentimen</option>
                  <option value="positif">Positif</option>
                  <option value="netral">Netral</option>
                  <option value="negatif">Negatif</option>
                </select>
              </div>
            </div>
          </div>

          <div
            className="cih-grid-3"
            style={{ opacity: drillLoading ? 0.6 : 1 }}
          >
            {/* Rating Breakdown */}
            <div className="cih-panel">
              <h4 className="cih-panel-title" style={{ fontSize: '0.94rem', marginBottom: '12px' }}>
                <Star size={16} style={{ color: '#d97706' }} />
                <span>Distribusi Rating Bintang (★1 s.d. ★5)</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                {analytics.drilldown.ratings.map((r) => (
                  <div
                    key={r.rating}
                    onClick={() =>
                      handleDrillFilterChange(
                        drillCategory,
                        drillEmotion,
                        String(r.rating),
                        drillSentiment
                      )
                    }
                    style={{ cursor: 'pointer' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.79rem',
                        marginBottom: '4px',
                      }}
                    >
                      <strong style={{ color: '#27251e' }}>★ {r.rating} Bintang</strong>
                      <span style={{ color: '#66645e' }}>
                        {r.count.toLocaleString('id-ID')} ({r.percentage}%)
                      </span>
                    </div>
                    <div className="cih-bar-track">
                      <div
                        style={{ width: `${r.percentage}%` }}
                        className={
                          r.rating >= 4
                            ? 'cih-bar-pos'
                            : r.rating === 3
                              ? 'cih-bar-net'
                              : 'cih-bar-neg'
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emotion Breakdown */}
            <div className="cih-panel">
              <h4 className="cih-panel-title" style={{ fontSize: '0.94rem', marginBottom: '12px' }}>
                <Activity size={16} style={{ color: '#016a71' }} />
                <span>Psikografi Emosi Pelanggan (PRDECT-ID)</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                {analytics.drilldown.emotions.map((emo) => (
                  <div
                    key={emo.emotion}
                    onClick={() =>
                      handleDrillFilterChange(
                        drillCategory,
                        emo.emotion,
                        drillRating,
                        drillSentiment
                      )
                    }
                    style={{ cursor: 'pointer' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.79rem',
                        marginBottom: '4px',
                      }}
                    >
                      <strong style={{ color: '#27251e' }}>{emo.label}</strong>
                      <span style={{ color: '#66645e' }}>
                        {emo.count.toLocaleString('id-ID')} ({emo.percentage}%) • ★{emo.avg_rating}
                      </span>
                    </div>
                    <div className="cih-bar-track">
                      <div
                        style={{ width: `${emo.percentage}%` }}
                        className={
                          emo.dominant_sentiment === 'positif' ? 'cih-bar-pos' : 'cih-bar-neg'
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Store Locations */}
            <div className="cih-panel">
              <h4 className="cih-panel-title" style={{ fontSize: '0.94rem', marginBottom: '12px' }}>
                <MapPin size={16} style={{ color: '#016a71' }} />
                <span>Sebaran Lokasi Toko / Kota Teratas</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analytics.drilldown.locations.map((loc) => (
                  <div
                    key={loc.location}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      background: '#faf9f6',
                      border: '1px solid #e4e2dd',
                      fontSize: '0.78rem',
                    }}
                  >
                    <strong style={{ color: '#27251e' }}>{loc.location}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#047857', fontWeight: 600 }}>{loc.positif_pct}% Pos</span>
                      <span style={{ color: '#be123c', fontWeight: 600 }}>{loc.negatif_pct}% Neg</span>
                      <span className="cih-badge" style={{ background: '#ffffff', border: '1px solid #e4e2dd' }}>
                        {loc.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="cih-panel">
            <h4 className="cih-panel-title" style={{ fontSize: '0.95rem', marginBottom: '12px' }}>
              <span>
                Sampel Ulasan Hasil Bedah Data ({analytics.drilldown.filtered_total.toLocaleString('id-ID')}{' '}
                ulasan cocok)
              </span>
            </h4>
            <div className="cih-grid-2">
              {analytics.drilldown.samples.map((s, idx) => (
                <div key={idx} className="cih-cat-card" style={{ cursor: 'default' }}>
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        gap: '6px',
                        marginBottom: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                        <span
                          className={`cih-badge ${
                            s.sentiment === 'positif'
                              ? 'is-pos'
                              : s.sentiment === 'negatif'
                                ? 'is-neg'
                                : 'is-net'
                          }`}
                        >
                          {s.sentiment.toUpperCase()}
                        </span>
                        <span className="cih-badge is-net">★ {s.rating}</span>
                        <span
                          className="cih-badge"
                          style={{ background: '#ffffff', border: '1px solid #e4e2dd', color: '#3f3d37' }}
                        >
                          {s.emotion_label}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.73rem', color: '#66645e' }}>{s.location}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#27251e', marginBottom: '4px' }}>
                      {s.product_name}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.81rem', fontStyle: 'italic', color: '#3f3d37' }}>
                      &ldquo;{s.text}&rdquo;
                    </p>
                  </div>

                  <div
                    style={{
                      paddingTop: '8px',
                      borderTop: '1px solid #e4e2dd',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.73rem',
                      color: '#66645e',
                    }}
                  >
                    <span>
                      Kategori: <strong>{s.category_label}</strong>
                      {s.price > 0 ? ` • Rp${s.price.toLocaleString('id-ID')}` : ''}
                    </span>
                    {onInspectReview && (
                      <button
                        type="button"
                        onClick={() => onInspectReview(s.text, s.category)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#016a71',
                          fontWeight: 700,
                          fontSize: '0.76rem',
                          cursor: 'pointer',
                        }}
                      >
                        Uji di XAI Predictor →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* =====================================================================
          5. PANEL KATALOG METRIK & DOKUMENTASI INTERAKTIF API
         ===================================================================== */}
      {activeSubTab === 'katalog-api' && analytics && (
        <>
          <div className="cih-panel">
            <h3 className="cih-panel-title" style={{ marginBottom: '4px' }}>
              <Layers size={18} style={{ color: '#016a71' }} />
              <span>Katalog Metrik Semantik Terkelola (Governed Metrics Catalog)</span>
            </h3>
            <p className="cih-panel-desc" style={{ marginBottom: '16px' }}>
              Definisi metrik baku yang disinkronkan di seluruh dasbor, laporan komparasi, dan
              Sentimen API.
            </p>

            <div className="cih-grid-2">
              {analytics.semantic_catalog.metrics_catalog.map((m) => (
                <div key={m.id} className="cih-stat-card" style={{ padding: '15px 17px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <code
                      style={{
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#016a71',
                        background: 'rgba(1, 106, 113, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {m.name}
                    </code>
                    <strong style={{ fontSize: '0.96rem', color: '#27251e' }}>{m.current_value}</strong>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#27251e', marginBottom: '6px' }}>
                    {m.title}
                  </div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      background: '#ffffff',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #e4e2dd',
                      color: '#3f3d37',
                      marginBottom: '8px',
                    }}
                  >
                    {m.formula}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#66645e' }}>
                    <span>Dimensi: {m.dimension}</span>
                    <span>Owner: {m.owner}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cih-grid-2">
            {/* Pipeline Code Definition */}
            <div className="cih-panel" style={{ background: '#17191c', color: '#f8fafc', borderColor: '#262b33' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', fontWeight: 700 }}>
                  <Code2 size={16} style={{ color: '#2dd4bf' }} />
                  <span>Definisi Dalam Kode (Scikit-Learn)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(analytics.semantic_catalog.pipeline_code)
                    setCopiedCode(true)
                    setTimeout(() => setCopiedCode(false), 2000)
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    background: '#262b33',
                    color: '#e2e8f0',
                    border: '1px solid #374151',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  <Copy size={13} />
                  <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
                </button>
              </div>
              <pre className="cih-code-box">{analytics.semantic_catalog.pipeline_code}</pre>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '12px', marginBottom: 0 }}>
                Pipeline ini dimuat secara persisten dari <code>models/model_sentimen.pkl</code> dan
                mendukung pembaruan bobot instan via <code>partial_fit</code>.
              </p>
            </div>

            {/* Interactive REST API Playground */}
            <div className="cih-panel">
              <div className="cih-panel-head">
                <div>
                  <h4 className="cih-panel-title" style={{ fontSize: '0.96rem' }}>
                    <Terminal size={16} style={{ color: '#016a71' }} />
                    <span>Sentimen REST API Playground (Uji Langsung)</span>
                  </h4>
                  <p className="cih-panel-desc">
                    Pilih endpoint dan jalankan request HTTP langsung ke server Flask backend.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {analytics.semantic_catalog.api_endpoints.slice(0, 3).map((ep, idx) => (
                  <button
                    key={ep.path}
                    type="button"
                    onClick={() => {
                      setSelectedEndpointIdx(idx)
                      if (idx === 0) {
                        setPlaygroundInput(
                          'Barang original pengiriman super cepat paking aman banget mantap!'
                        )
                      } else if (idx === 1) {
                        setPlaygroundInput(
                          'Apa penyebab utama keluhan pengiriman pada kategori Elektronik?'
                        )
                      }
                    }}
                    className={`cih-subtab-btn ${selectedEndpointIdx === idx ? 'is-active' : ''}`}
                    style={{ fontFamily: 'monospace', fontSize: '0.76rem', padding: '6px 11px' }}
                  >
                    {ep.method} {ep.path}
                  </button>
                ))}
              </div>

              <div className="cih-stat-card" style={{ marginBottom: '12px', fontSize: '0.8rem', color: '#3f3d37' }}>
                <strong>
                  {analytics.semantic_catalog.api_endpoints[selectedEndpointIdx]?.title}:
                </strong>{' '}
                {analytics.semantic_catalog.api_endpoints[selectedEndpointIdx]?.description}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label className="cih-quick-kpi-label" style={{ display: 'block', marginBottom: '4px' }}>
                    {selectedEndpointIdx === 1 ? 'Payload: question' : 'Payload: text (Ulasan)'}
                  </label>
                  <input
                    type="text"
                    value={playgroundInput}
                    onChange={(e) => setPlaygroundInput(e.target.value)}
                    disabled={selectedEndpointIdx === 2}
                    className="cih-input"
                    style={{ paddingLeft: '12px' }}
                  />
                </div>
                <div>
                  <label className="cih-quick-kpi-label" style={{ display: 'block', marginBottom: '4px' }}>
                    Parameter: category
                  </label>
                  <input
                    type="text"
                    value={playgroundCategory}
                    onChange={(e) => setPlaygroundCategory(e.target.value)}
                    className="cih-input"
                    style={{ paddingLeft: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => void handleRunPlayground()}
                  disabled={playgroundRunning}
                  className="cih-btn-primary"
                >
                  <Play size={13} />
                  <span>{playgroundRunning ? 'Mengeksekusi Request...' : 'Kirim Request API'}</span>
                </button>
                <span style={{ fontSize: '0.73rem', fontFamily: 'monospace', color: '#66645e' }}>
                  Content-Type: application/json
                </span>
              </div>

              {playgroundOutput && (
                <pre className="cih-code-box" style={{ marginTop: '14px', maxHeight: '240px' }}>
                  {playgroundOutput}
                </pre>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
