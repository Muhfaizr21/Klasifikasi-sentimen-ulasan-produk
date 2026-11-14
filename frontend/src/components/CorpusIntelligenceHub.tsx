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

type IconProps = { className?: string }

const Sparkles: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const Compass: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
)
const Target: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
)
const SlidersHorizontal: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
  </svg>
)
const Terminal: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="4 17 10 11 4 5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="19" x2="20" y2="19" strokeLinecap="round" />
  </svg>
)
const Database: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <ellipse cx="12" cy="5" rx="8" ry="3" />
    <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
    <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
  </svg>
)
const MessageSquare: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const RefreshCw: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 12a9 9 0 1 1-2.64-6.36L21 8" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="21 3 21 8 16 8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const Send: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <line x1="22" y1="2" x2="11" y2="13" strokeLinecap="round" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" strokeLinejoin="round" />
  </svg>
)
const CheckCircle2: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" />
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const ArrowRight: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const BarChart3: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 19h16M7 15V9m5 6V5m5 10v-4" strokeLinecap="round" />
  </svg>
)
const Search: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.8-3.8" strokeLinecap="round" />
  </svg>
)
const TrendingUp: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="16 7 22 7 22 13" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const TrendingDown: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="16 17 22 17 22 11" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const Filter: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" strokeLinejoin="round" />
  </svg>
)
const Star: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)
const Activity: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const MapPin: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)
const Layers: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
)
const Code2: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13.5 6l-3 12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const Copy: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)
const Play: React.FC<IconProps> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
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
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'peta-korpus',
      label: 'Peta Korpus (29 Kategori)',
      badge: `${analytics?.category_map.length || 29} Kategori`,
      icon: <Compass className="w-4 h-4" />,
    },
    {
      id: 'target-kpi',
      label: 'Target KPI & NSS',
      badge: '5 Indikator',
      icon: <Target className="w-4 h-4" />,
    },
    {
      id: 'bedah-data',
      label: 'Bedah Data (Drill-Down)',
      badge: 'Rating & Emosi',
      icon: <SlidersHorizontal className="w-4 h-4" />,
    },
    {
      id: 'katalog-api',
      label: 'Katalog Semantik & API',
      badge: 'Live Playground',
      icon: <Terminal className="w-4 h-4" />,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
              <Database className="w-3.5 h-3.5" />
              <span>Platform Semantik & Analitik Korpus PRDECT-ID Terintegrasi</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Pusat Intelijen Korpus, Target KPI & Eksplorasi Multi-Dimensi
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Seluruh fitur analitik dari halaman depan terhubung langsung ke{' '}
              <span className="font-semibold text-slate-800">
                {(analytics?.kpi_summary.total_samples ?? 5459).toLocaleString('id-ID')} ulasan
                riil
              </span>{' '}
              beserta atribut Emosi Pelanggan, Rating Bintang (★1 s.d. ★5), 29 Kategori Produk, dan
              Sentimen API.
            </p>
          </div>

          {/* Quick KPI Pills */}
          {analytics && (
            <div className="grid grid-cols-3 gap-2.5 shrink-0">
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] font-medium text-slate-500 uppercase">Skor NSS</div>
                <div
                  className={`text-base font-bold ${
                    analytics.kpi_summary.overall_nss >= 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {analytics.kpi_summary.overall_nss >= 0 ? '+' : ''}
                  {analytics.kpi_summary.overall_nss.toFixed(1)} pt
                </div>
              </div>
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] font-medium text-slate-500 uppercase">Macro F1</div>
                <div className="text-base font-bold text-teal-700">
                  {analytics.kpi_summary.f1_macro.toFixed(2)}%
                </div>
              </div>
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] font-medium text-slate-500 uppercase">Akurasi Uji</div>
                <div className="text-base font-bold text-slate-900">
                  {analytics.kpi_summary.accuracy.toFixed(2)}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5 Feature Sub-Navigation Pills */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
          {subTabs.map((tab) => {
            const active = activeSubTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSubTabChange(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    active ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {analyticsError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
          <span>{analyticsError}</span>
          <button
            type="button"
            onClick={() => void loadAnalytics()}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
          >
            Muat Ulang
          </button>
        </div>
      )}

      {/* =====================================================================
          1. MODE TANYA-JAWAB ANALITIK KORPUS ("SENTIMEN AI CHAT")
         ===================================================================== */}
      {activeSubTab === 'ai-chat' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  <span>Tanya Jawab Analitik Korpus (Sentimen AI)</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
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
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800"
              >
                <option value="Semua">Cakupan: Semua Kategori (29)</option>
                <option value="Elektronik">Grup: Elektronik & Gadget</option>
                <option value="Fashion">Grup: Fashion & Kecantikan</option>
                <option value="Rumah Tangga">Grup: Rumah Tangga & Dapur</option>
                <option value="Otomotif & Hobi">Grup: Otomotif, Hobi & Kesehatan</option>
                {analytics?.category_map.map((c) => (
                  <option key={c.id} value={c.id}>
                    Kategori: {c.label} ({c.total})
                  </option>
                ))}
              </select>
            </div>

            {/* Question Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                void runAiQuery(questionInput, aiCategoryFilter)
              }}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <div className="relative flex-1">
                <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="Contoh: Apa penyebab utama keluhan pengiriman pada kategori Elektronik?"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-50/60 text-sm text-slate-900 focus:bg-white focus:border-teal-600 focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                disabled={aiLoading || !questionInput.trim()}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer shrink-0"
              >
                {aiLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menganalisis Korpus...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Tanyakan ke AI</span>
                  </>
                )}
              </button>
            </form>

            {/* Preset Analytical Prompts */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Pertanyaan Populer:</span>
              {PRESET_AI_QUESTIONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setQuestionInput(preset)
                    void runAiQuery(preset, aiCategoryFilter)
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 border border-slate-200/80 transition-colors cursor-pointer text-left"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {aiError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {aiError}
            </div>
          )}

          {/* AI Analyst Response Output */}
          {aiResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left 7 Cols: Narrative, Key Findings & Evidence Reviews */}
              <div className="lg:col-span-7 space-y-5">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold">
                      {aiResult.matched_category_label}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                      Aspek: {aiResult.matched_aspect}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 mb-2">{aiResult.headline}</h4>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                    {aiResult.narrative}
                  </p>

                  {/* Metrics Highlight Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
                      <div className="text-[11px] font-semibold text-emerald-800 uppercase">
                        Sentimen Positif
                      </div>
                      <div className="text-lg font-bold text-emerald-700">
                        {aiResult.metrics_highlight.positif_pct}%
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/70">
                      <div className="text-[11px] font-semibold text-rose-800 uppercase">
                        Sentimen Negatif
                      </div>
                      <div className="text-lg font-bold text-rose-600">
                        {aiResult.metrics_highlight.negatif_pct}%
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase">
                        Net Sentiment (NSS)
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          aiResult.metrics_highlight.nss >= 0 ? 'text-teal-700' : 'text-rose-600'
                        }`}
                      >
                        {aiResult.metrics_highlight.nss >= 0 ? '+' : ''}
                        {aiResult.metrics_highlight.nss} pt
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70">
                      <div className="text-[11px] font-semibold text-amber-900 uppercase">
                        Rata-rata Rating
                      </div>
                      <div className="text-lg font-bold text-amber-700">
                        ★ {aiResult.metrics_highlight.avg_rating.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Key Findings List */}
                  <div className="mt-5">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                      Temuan Utama Korpus & Psikografi Emosi
                    </h5>
                    <ul className="space-y-2">
                      {aiResult.key_findings.map((finding, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700"
                        >
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Evidence Reviews from Corpus */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
                  <h5 className="text-sm font-bold text-slate-900 mb-3">
                    Bukti Empiris Ulasan Pelanggan Terkait ({aiResult.evidence_reviews.length}{' '}
                    Sampel)
                  </h5>
                  <div className="space-y-3">
                    {aiResult.evidence_reviews.map((rev, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${
                                rev.sentiment === 'positif'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : rev.sentiment === 'negatif'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {rev.sentiment}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-amber-600">
                              ★ {rev.rating}/5
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700">
                              Emosi: {rev.emotion_label}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              • {rev.category_label} ({rev.location})
                            </span>
                          </div>
                          {onInspectReview && (
                            <button
                              type="button"
                              onClick={() => onInspectReview(rev.text, rev.category_label)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
                            >
                              <span>Inspeksi XAI</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 italic">"{rev.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right 5 Cols: Visual Breakdown Chart & Naive Bayes Driving Tokens */}
              <div className="lg:col-span-5 space-y-5">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
                  <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-teal-600" />
                    <span>{aiResult.chart_title}</span>
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Proporsi sentimen positif (hijau) berbanding negatif (merah) pada segmen terkait
                  </p>

                  <div className="space-y-3.5">
                    {aiResult.chart_bars.map((bar, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 truncate pr-2">
                            {bar.label}
                          </span>
                          <span className="text-slate-500 font-medium shrink-0">
                            {bar.value_label}
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex">
                          {bar.positif_pct > 0 && (
                            <div
                              style={{ width: `${Math.min(100, bar.positif_pct)}%` }}
                              className="bg-emerald-500 h-full"
                              title={`Positif: ${bar.positif_pct}%`}
                            />
                          )}
                          {bar.negatif_pct > 0 && (
                            <div
                              style={{ width: `${Math.min(100, bar.negatif_pct)}%` }}
                              className="bg-rose-500 h-full"
                              title={`Negatif: ${bar.negatif_pct}%`}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Driving Tokens from MultinomialNB */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
                  <h4 className="text-sm font-bold text-slate-900 mb-1">
                    Atribusi Token Pendorong (Multinomial Naive Bayes)
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Kata kunci dengan bobot log-probability tertinggi pada kamus TF-IDF
                  </p>

                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-semibold text-rose-700 mb-2">
                        Token Pemicu Keluhan (Kelas Negatif)
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {aiResult.top_tokens.negatif.map((t, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium"
                          >
                            {t.word}{' '}
                            <span className="text-[10px] text-rose-500">
                              ({t.score.toFixed(2)})
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-emerald-700 mb-2">
                        Token Pendorong Kepuasan (Kelas Positif)
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {aiResult.top_tokens.positif.map((t, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium"
                          >
                            {t.word}{' '}
                            <span className="text-[10px] text-emerald-600">
                              ({t.score.toFixed(2)})
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          2. PETA PERSEBARAN SENTIMEN 29 KATEGORI (PETA KORPUS)
         ===================================================================== */}
      {activeSubTab === 'peta-korpus' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-teal-600" />
                <span>
                  Peta Persebaran Sentimen {analytics?.category_map.length || 29} Kategori Produk
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Distribusi lengkap Positif vs Netral vs Negatif, Net Sentiment Score (NSS), rata-rata
                rating bintang, dan emosi dominan di setiap kategori e-commerce. Klik kategori untuk
                membedah ulasan.
              </p>
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={mapSearch}
                  onChange={(e) => setMapSearch(e.target.value)}
                  placeholder="Cari kategori..."
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-hidden"
                />
              </div>

              <select
                value={mapGroupFilter}
                onChange={(e) => setMapGroupFilter(e.target.value)}
                aria-label="Filter grup kategori"
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700"
              >
                <option value="Semua">Semua Grup Makro</option>
                <option value="Elektronik">Elektronik</option>
                <option value="Fashion">Fashion & Kecantikan</option>
                <option value="Rumah Tangga">Rumah Tangga</option>
                <option value="Otomotif & Hobi">Otomotif & Hobi</option>
              </select>

              <select
                value={mapSortBy}
                onChange={(e) =>
                  setMapSortBy(
                    e.target.value as 'total' | 'nss_desc' | 'nss_asc' | 'rating'
                  )
                }
                aria-label="Urutkan kategori"
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700"
              >
                <option value="total">Urutkan: Volume Terbanyak</option>
                <option value="nss_desc">Urutkan: NSS Tertinggi (Terpuas)</option>
                <option value="nss_asc">Urutkan: NSS Terendah (Kritis)</option>
                <option value="rating">Urutkan: Rating Bintang Tertinggi</option>
              </select>
            </div>
          </div>

          {loadingAnalytics ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Memuat peta persebaran 29 kategori...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCategories.map((cat: CategoryMapItem) => (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategoryForDrilldown(cat.id)}
                  className="p-4 rounded-xl border border-slate-200/90 hover:border-teal-500/70 bg-slate-50/40 hover:bg-white transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {cat.group}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {cat.label}
                      </h4>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-bold shrink-0 ${
                        cat.nss >= 10
                          ? 'bg-emerald-100 text-emerald-800'
                          : cat.nss >= 0
                            ? 'bg-teal-50 text-teal-800'
                            : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      NSS {cat.nss >= 0 ? '+' : ''}
                      {cat.nss}%
                    </span>
                  </div>

                  {/* Stacked Sentiment Bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden flex my-2.5">
                    <div
                      style={{ width: `${cat.positif_pct}%` }}
                      className="bg-emerald-500 h-full"
                      title={`Positif: ${cat.positif_pct}%`}
                    />
                    <div
                      style={{ width: `${cat.netral_pct}%` }}
                      className="bg-amber-400 h-full"
                      title={`Netral: ${cat.netral_pct}%`}
                    />
                    <div
                      style={{ width: `${cat.negatif_pct}%` }}
                      className="bg-rose-500 h-full"
                      title={`Negatif: ${cat.negatif_pct}%`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                    <span className="text-emerald-700">{cat.positif_pct}% Pos ({cat.positif})</span>
                    <span className="text-amber-700">{cat.netral_pct}% Net ({cat.netral})</span>
                    <span className="text-rose-600">{cat.negatif_pct}% Neg ({cat.negatif})</span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Total: <strong className="text-slate-800">{cat.total}</strong> ulasan •{' '}
                      <strong className="text-amber-600">★ {cat.avg_rating}</strong>
                    </span>
                    <span className="text-teal-700 font-semibold group-hover:underline">
                      Bedah Data →
                    </span>
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
        <div className="space-y-5">
          {/* KPI Target Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.kpi_summary.kpi_targets.map((kpi) => (
              <div
                key={kpi.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Indikator Terkelola
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        kpi.achieved
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {kpi.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{kpi.label}</h4>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {kpi.id === 'net_sentiment_score' && kpi.current_value > 0 ? '+' : ''}
                      {kpi.current_value}
                      {kpi.unit}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Target: {kpi.target_value}
                      {kpi.unit} ({kpi.delta >= 0 ? `+${kpi.delta}` : kpi.delta}
                      {kpi.unit})
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                  Rumus: {kpi.formula}
                </div>
              </div>
            ))}
          </div>

          {/* Top 5 Highest NSS vs Bottom 5 Critical NSS Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Top 5 Kategori dengan Net Sentiment Score (NSS) Tertinggi</span>
              </h4>
              <div className="space-y-2.5">
                {analytics.kpi_summary.top_nss_categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCategoryForDrilldown(cat.id)}
                    className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/70 flex items-center justify-between cursor-pointer hover:bg-emerald-50"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{cat.label}</div>
                      <div className="text-[11px] text-slate-600">
                        {cat.positif_pct}% Positif vs {cat.negatif_pct}% Negatif ({cat.total} ulasan
                        • ★{cat.avg_rating})
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold">
                      +{cat.nss} pt
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4 text-rose-600" />
                <span>5 Kategori Prioritas Perbaikan (Rasio Keluhan Tertinggi)</span>
              </h4>
              <div className="space-y-2.5">
                {analytics.kpi_summary.critical_nss_categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCategoryForDrilldown(cat.id)}
                    className="p-3 rounded-xl bg-rose-50/50 border border-rose-200/70 flex items-center justify-between cursor-pointer hover:bg-rose-50"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{cat.label}</div>
                      <div className="text-[11px] text-slate-600">
                        {cat.negatif_pct}% Negatif vs {cat.positif_pct}% Positif ({cat.total} ulasan
                        • ★{cat.avg_rating})
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold">
                      {cat.nss >= 0 ? `+${cat.nss}` : cat.nss} pt
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          4. BEDAH DATA (DRILL-DOWN EXPLORER RATING ★1-★5, EMOSI, & KOTA)
         ===================================================================== */}
      {activeSubTab === 'bedah-data' && analytics && (
        <div className="space-y-5">
          {/* Interactive Multi-Dimension Filter Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-teal-600" />
                  <span>Bedah Data Multi-Dimensi (Rating ★1–★5, Emosi PRDECT-ID & Kota)</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Eksplorasi silang atribut asli dataset PRDECT-ID: saring berdasarkan kategori,
                  tingkat emosi pelanggan, rating bintang, dan kelas sentimen.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDrillFilterChange('Semua', 'Semua', 'Semua', 'Semua')}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer self-start"
              >
                Reset Filter ({analytics.drilldown.filtered_total.toLocaleString('id-ID')} cocok)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800"
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
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800"
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
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800"
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
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800"
                >
                  <option value="Semua">Semua Sentimen</option>
                  <option value="positif">Positif</option>
                  <option value="netral">Netral</option>
                  <option value="negatif">Negatif</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3-Column Breakdown: Ratings ★1-★5, Emotions, and Store Locations */}
          <div
            className={`grid grid-cols-1 lg:grid-cols-3 gap-5 ${
              drillLoading ? 'opacity-60 pointer-events-none' : ''
            }`}
          >
            {/* Rating Breakdown */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-amber-500" />
                <span>Distribusi Rating Bintang (★1 s.d. ★5)</span>
              </h4>
              <div className="space-y-3">
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
                    className="space-y-1 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 group-hover:text-teal-700">
                        ★ {r.rating} Bintang
                      </span>
                      <span className="text-slate-500">
                        {r.count.toLocaleString('id-ID')} ({r.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        style={{ width: `${r.percentage}%` }}
                        className={`h-full ${
                          r.rating >= 4
                            ? 'bg-emerald-500'
                            : r.rating === 3
                              ? 'bg-amber-400'
                              : 'bg-rose-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emotion Breakdown */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Psikografi Emosi Pelanggan (PRDECT-ID)</span>
              </h4>
              <div className="space-y-3">
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
                    className="space-y-1 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 group-hover:text-teal-700">
                        {emo.label}
                      </span>
                      <span className="text-slate-500">
                        {emo.count.toLocaleString('id-ID')} ({emo.percentage}%) • ★{emo.avg_rating}
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        style={{ width: `${emo.percentage}%` }}
                        className={`h-full ${
                          emo.dominant_sentiment === 'positif' ? 'bg-teal-600' : 'bg-rose-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Store Cities Breakdown */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Sebaran Lokasi Toko / Kota Teratas</span>
              </h4>
              <div className="space-y-2.5">
                {analytics.drilldown.locations.map((loc) => (
                  <div
                    key={loc.location}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-200/60"
                  >
                    <span className="font-semibold text-slate-800 truncate pr-2">
                      {loc.location}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-emerald-700 font-semibold">{loc.positif_pct}% Pos</span>
                      <span className="text-rose-600 font-semibold">{loc.negatif_pct}% Neg</span>
                      <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-mono">
                        {loc.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Filtered Sample Reviews Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-3">
              Sampel Ulasan Hasil Bedah Data ({analytics.drilldown.filtered_total.toLocaleString('id-ID')}{' '}
              ulasan cocok)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analytics.drilldown.samples.map((s, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-2.5"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            s.sentiment === 'positif'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.sentiment === 'negatif'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.sentiment}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-bold text-amber-600">
                          ★ {s.rating}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] font-medium text-slate-700">
                          {s.emotion_label}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">{s.location}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 truncate mb-1">
                      {s.product_name}
                    </div>
                    <p className="text-xs text-slate-700 italic line-clamp-3">"{s.text}"</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Kategori: <strong>{s.category_label}</strong>
                      {s.price > 0 ? ` • Rp${s.price.toLocaleString('id-ID')}` : ''}
                    </span>
                    {onInspectReview && (
                      <button
                        type="button"
                        onClick={() => onInspectReview(s.text, s.category)}
                        className="text-teal-700 font-bold hover:underline cursor-pointer"
                      >
                        Uji di XAI Predictor →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          5. PANEL KATALOG METRIK & DOKUMENTASI INTERAKTIF API
         ===================================================================== */}
      {activeSubTab === 'katalog-api' && analytics && (
        <div className="space-y-5">
          {/* Governed Metrics Catalog */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Layers className="w-5 h-5 text-teal-600" />
              <span>Katalog Metrik Semantik Terkelola (Governed Metrics Catalog)</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-4">
              Definisi metrik baku yang disinkronkan di seluruh dasbor, laporan komparasi, dan
              Sentimen API.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.semantic_catalog.metrics_catalog.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <code className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {m.name}
                    </code>
                    <span className="text-sm font-extrabold text-slate-900">{m.current_value}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-800">{m.title}</div>
                  <div className="text-xs font-mono text-slate-600 bg-white p-2 rounded-lg border border-slate-200/70">
                    {m.formula}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Dimensi: {m.dimension}</span>
                    <span>Owner: {m.owner}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Code Definition & Live API Playground */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Pipeline Code Definition */}
            <div className="lg:col-span-5 bg-slate-900 text-slate-100 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Definisi Dalam Kode (Scikit-Learn)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(analytics.semantic_catalog.pipeline_code)
                      setCopiedCode(true)
                      setTimeout(() => setCopiedCode(false), 2000)
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
                  </button>
                </div>
                <pre className="text-xs font-mono text-teal-200/95 bg-slate-950/80 p-4 rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
                  {analytics.semantic_catalog.pipeline_code}
                </pre>
              </div>
              <p className="text-[11px] text-slate-400 mt-4">
                Pipeline ini dimuat secara persisten dari <code>models/model_sentimen.pkl</code> dan
                mendukung pembaruan bobot instan via <code>partial_fit</code>.
              </p>
            </div>

            {/* Interactive REST API Playground */}
            <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-teal-600" />
                    <span>Sentimen REST API Playground (Uji Langsung)</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Pilih endpoint dan jalankan request HTTP langsung ke server Flask backend.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
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
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold cursor-pointer ${
                        selectedEndpointIdx === idx
                          ? 'bg-teal-700 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {ep.method} {ep.path}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                <strong className="text-slate-900">
                  {analytics.semantic_catalog.api_endpoints[selectedEndpointIdx]?.title}:
                </strong>{' '}
                {analytics.semantic_catalog.api_endpoints[selectedEndpointIdx]?.description}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    {selectedEndpointIdx === 1
                      ? 'Payload: question'
                      : 'Payload: text (Ulasan)'}
                  </label>
                  <input
                    type="text"
                    value={playgroundInput}
                    onChange={(e) => setPlaygroundInput(e.target.value)}
                    disabled={selectedEndpointIdx === 2}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Parameter: category
                  </label>
                  <input
                    type="text"
                    value={playgroundCategory}
                    onChange={(e) => setPlaygroundCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => void handleRunPlayground()}
                  disabled={playgroundRunning}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{playgroundRunning ? 'Mengeksekusi Request...' : 'Kirim Request API'}</span>
                </button>
                <span className="text-[11px] font-mono text-slate-400">
                  Content-Type: application/json
                </span>
              </div>

              {playgroundOutput && (
                <pre className="text-xs font-mono bg-slate-950 text-emerald-300 p-4 rounded-xl max-h-64 overflow-y-auto border border-slate-800">
                  {playgroundOutput}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
