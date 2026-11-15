import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { HelpButton } from './HelpTooltipModal'

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

/* ==========================================================================
   CUSTOM PROFESSIONAL DROPDOWN (Zero Native OS Select Widget)
   ========================================================================== */
export interface SelectOptionItem {
  value: string
  label: string
  badge?: string
  group?: string
}

interface CustomSelectProps {
  value: string
  onChange: (nextVal: string) => void
  options: SelectOptionItem[]
  prefixLabel?: string
  ariaLabel?: string
  align?: 'left' | 'right'
  fullWidth?: boolean
  minWidth?: number
  searchable?: boolean
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  prefixLabel,
  ariaLabel,
  align = 'left',
  fullWidth = false,
  minWidth = 210,
  searchable = false,
}) => {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value) || options[0],
    [options, value]
  )

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options
    const q = searchQuery.toLowerCase()
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q) ||
        (opt.group && opt.group.toLowerCase().includes(q))
    )
  }, [options, searchable, searchQuery])

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      className={`cih-dropdown ${fullWidth ? 'is-full' : ''} ${open ? 'is-open' : ''}`}
      style={{ minWidth: fullWidth ? undefined : `${minWidth}px` }}
    >
      <button
        type="button"
        className="cih-dropdown-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel || prefixLabel || 'Pilih opsi'}
        onClick={() => {
          setOpen((prev) => !prev)
          setSearchQuery('')
        }}
      >
        <span className="cih-dropdown-trigger-text">
          {prefixLabel && <span className="cih-dropdown-prefix">{prefixLabel}:</span>}
          <span className="cih-dropdown-value">{selectedOption?.label ?? value}</span>
        </span>
        {selectedOption?.badge && (
          <span className="cih-dropdown-trigger-badge">{selectedOption.badge}</span>
        )}
        <svg
          className="cih-dropdown-chevron"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className={`cih-dropdown-popover ${align === 'right' ? 'align-right' : 'align-left'}`}
          role="listbox"
        >
          {searchable && (
            <div className="cih-dropdown-search-box">
              <Search size={13} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari dalam daftar..."
                className="cih-dropdown-search-input"
                autoFocus
              />
            </div>
          )}
          <div className="cih-dropdown-list">
            {filteredOptions.length === 0 ? (
              <div className="cih-dropdown-empty">Tidak ada opsi yang cocok</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`cih-dropdown-option ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => {
                      onChange(opt.value)
                      setOpen(false)
                    }}
                  >
                    <span className="cih-dropdown-option-main">
                      <span className="cih-dropdown-option-label">{opt.label}</span>
                      {opt.group && (
                        <span className="cih-dropdown-option-group">{opt.group}</span>
                      )}
                    </span>
                    <span className="cih-dropdown-option-right">
                      {opt.badge && (
                        <span className="cih-dropdown-option-badge">{opt.badge}</span>
                      )}
                      {isSelected && (
                        <svg
                          className="cih-dropdown-check"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.3"
                          aria-hidden="true"
                        >
                          <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

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

  const aiScopeOptions = useMemo<SelectOptionItem[]>(() => {
    const base: SelectOptionItem[] = [
      { value: 'Semua', label: 'Semua Kategori Korpus', badge: '5.459' },
      { value: 'Elektronik', label: 'Grup: Elektronik & Gadget', group: 'Makro' },
      { value: 'Fashion', label: 'Grup: Fashion & Kecantikan', group: 'Makro' },
      { value: 'Rumah Tangga', label: 'Grup: Rumah Tangga & Dapur', group: 'Makro' },
      { value: 'Otomotif & Hobi', label: 'Grup: Otomotif, Hobi & Medis', group: 'Makro' },
    ]
    if (analytics?.category_map) {
      analytics.category_map.forEach((c) => {
        base.push({
          value: c.id,
          label: c.label,
          badge: String(c.total),
          group: c.group,
        })
      })
    }
    return base
  }, [analytics?.category_map])

  const mapGroupOptions = useMemo<SelectOptionItem[]>(
    () => [
      { value: 'Semua', label: 'Semua Grup Makro', badge: `${analytics?.category_map.length || 30}` },
      { value: 'Elektronik', label: 'Elektronik & Gadget' },
      { value: 'Fashion', label: 'Fashion & Kecantikan' },
      { value: 'Rumah Tangga', label: 'Rumah Tangga & Dapur' },
      { value: 'Otomotif & Hobi', label: 'Otomotif, Hobi & Medis' },
    ],
    [analytics?.category_map.length]
  )

  const mapSortOptions = useMemo<SelectOptionItem[]>(
    () => [
      { value: 'total', label: 'Volume Ulasan Terbanyak' },
      { value: 'nss_desc', label: 'NSS Tertinggi (Terpuas)' },
      { value: 'nss_asc', label: 'NSS Terendah (Prioritas Audit)' },
      { value: 'rating', label: 'Rating Bintang Tertinggi' },
    ],
    []
  )

  const drillCategoryOptions = useMemo<SelectOptionItem[]>(() => {
    const list: SelectOptionItem[] = [
      {
        value: 'Semua',
        label: `Semua Kategori (${analytics?.category_map.length || 30})`,
        badge: '5.459',
      },
    ]
    analytics?.category_map.forEach((c) => {
      list.push({
        value: c.id,
        label: c.label,
        badge: String(c.total),
        group: c.group,
      })
    })
    return list
  }, [analytics?.category_map])

  const drillEmotionOptions = useMemo<SelectOptionItem[]>(
    () => [
      { value: 'Semua', label: 'Semua Emosi PRDECT-ID (5)' },
      { value: 'Happy', label: 'Senang (Happy)', badge: 'Positif' },
      { value: 'Love', label: 'Sangat Puas / Cinta (Love)', badge: 'Positif' },
      { value: 'Sadness', label: 'Kecewa / Sedih (Sadness)', badge: 'Negatif' },
      { value: 'Fear', label: 'Khawatir / Ragu (Fear)', badge: 'Negatif' },
      { value: 'Anger', label: 'Marah / Komplain (Anger)', badge: 'Negatif' },
    ],
    []
  )

  const drillRatingOptions = useMemo<SelectOptionItem[]>(
    () => [
      { value: 'Semua', label: 'Semua Rating (★1 s.d. ★5)' },
      { value: '5', label: '★ 5 Bintang (Sangat Puas)' },
      { value: '4', label: '★ 4 Bintang (Puas)' },
      { value: '3', label: '★ 3 Bintang (Netral / Standar)' },
      { value: '2', label: '★ 2 Bintang (Kurang Memuaskan)' },
      { value: '1', label: '★ 1 Bintang (Komplain Kritis)' },
    ],
    []
  )

  const drillSentimentOptions = useMemo<SelectOptionItem[]>(
    () => [
      { value: 'Semua', label: 'Semua Kelas Sentimen (3)' },
      { value: 'positif', label: 'Positif (Kepuasan)' },
      { value: 'netral', label: 'Netral (Observasional)' },
      { value: 'negatif', label: 'Negatif (Keluhan)' },
    ],
    []
  )

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

  return (
    <div className="compare-workspace cih-standalone-page">
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
          HALAMAN 1: ASISTEN ANALITIK KORPUS ("SENTIMEN AI CHAT")
         ===================================================================== */}
      {activeSubTab === 'ai-chat' && (
        <>
          <div className="compare-workspace-header">
            <div className="compare-header-left">
              <div className="cih-page-kicker">
                <Sparkles size={13} />
                <span>SENTIMEN AI · NATURAL LANGUAGE CORPUS ANALYST</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 className="compare-title">Asisten Analitik Korpus (Sentimen AI)</h1>
                <HelpButton topicId="ai_chat_overview" />
              </div>
              <p className="compare-subtitle">
                Tanyakan penyebab keluhan pengiriman, kualitas kemasan, atau psikografi emosi pelanggan
                dalam bahasa alami. Sistem menyintesis jawaban langsung dari{' '}
                {(analytics?.kpi_summary.total_samples ?? 5459).toLocaleString('id-ID')} ulasan
                PRDECT-ID beserta bobot log-probabilitas Multinomial Naive Bayes.
              </p>
            </div>
            <div className="compare-header-right">
              <CustomSelect
                prefixLabel="Cakupan"
                value={aiCategoryFilter}
                options={aiScopeOptions}
                align="right"
                searchable
                minWidth={255}
                onChange={(nextCat) => {
                  setAiCategoryFilter(nextCat)
                  void runAiQuery(questionInput, nextCat)
                }}
              />
            </div>
          </div>

          <div className="compare-scenarios-bar">
            <span className="compare-scenarios-label">Pertanyaan Cepat:</span>
            <div className="compare-scenarios-list">
              {PRESET_AI_QUESTIONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setQuestionInput(preset)
                    void runAiQuery(preset, aiCategoryFilter)
                  }}
                  className={`compare-scenario-chip ${questionInput === preset ? 'is-active' : ''}`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="cih-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span className="cih-filter-label" style={{ marginBottom: 0 }}>
                Kolom Kueri Bahasa Alami (Natural Language Query)
              </span>
              <HelpButton topicId="ai_chat_overview" />
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
                  placeholder="Ketik pertanyaan analitik tentang kategori, pengiriman, harga, atau emosi pelanggan..."
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
                    <span>Menyintesis Korpus...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Jalankan Analisis AI</span>
                  </>
                )}
              </button>
            </form>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div className="cih-meta-strip">
                      <span className="cih-badge is-pos">
                        Cakupan: {aiResult.matched_category_label}
                      </span>
                      <span className="cih-badge is-neutral-outline">
                        Dimensi Analisis: {aiResult.matched_aspect}
                      </span>
                      <span className="cih-badge is-neutral-outline">
                        Sampel Dianalisis: {aiResult.metrics_highlight.total_analyzed.toLocaleString('id-ID')} ulasan
                      </span>
                    </div>
                    <HelpButton topicId="ai_synthesis_box" />
                  </div>

                  <h2 className="cih-synthesis-headline">{aiResult.headline}</h2>

                  <div className="cih-narrative-box">{aiResult.narrative}</div>

                  <div className="cih-ledger-strip-4">
                    <div className="cih-ledger-cell">
                      <span className="cih-ledger-label">Sentimen Positif</span>
                      <span className="cih-ledger-val is-pos">
                        {aiResult.metrics_highlight.positif_pct}%
                      </span>
                    </div>
                    <div className="cih-ledger-cell">
                      <span className="cih-ledger-label">Sentimen Negatif</span>
                      <span className="cih-ledger-val is-neg">
                        {aiResult.metrics_highlight.negatif_pct}%
                      </span>
                    </div>
                    <div className="cih-ledger-cell">
                      <span className="cih-ledger-label">Net Sentiment (NSS)</span>
                      <span
                        className={`cih-ledger-val ${
                          aiResult.metrics_highlight.nss >= 0 ? 'is-teal' : 'is-neg'
                        }`}
                      >
                        {aiResult.metrics_highlight.nss >= 0 ? '+' : ''}
                        {aiResult.metrics_highlight.nss} pt
                      </span>
                    </div>
                    <div className="cih-ledger-cell">
                      <span className="cih-ledger-label">Rata-rata Rating</span>
                      <span className="cih-ledger-val is-amber">
                        ★ {aiResult.metrics_highlight.avg_rating.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <div className="cih-section-eyebrow">
                      Temuan Utama Korpus &amp; Psikografi Emosi Pelanggan
                    </div>
                    <div className="cih-findings-list">
                      {aiResult.key_findings.map((finding, idx) => (
                        <div key={idx} className="cih-finding-item">
                          <CheckCircle2 size={16} style={{ color: '#016a71', marginTop: '2px' }} />
                          <span>{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Evidence Reviews */}
                <div className="cih-panel">
                  <div className="cih-panel-head" style={{ marginBottom: '12px' }}>
                    <div>
                      <h3 className="cih-panel-title" style={{ fontSize: '0.96rem' }}>
                        <span>Kutipan Ulasan Empiris Terkait ({aiResult.evidence_reviews.length} Sampel)</span>
                      </h3>
                      <p className="cih-panel-desc">
                        Sampel ulasan nyata dari dataset PRDECT-ID yang mendukung kesimpulan di atas
                      </p>
                    </div>
                    <HelpButton topicId="ai_evidence_box" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {aiResult.evidence_reviews.map((rev, idx) => (
                      <div key={idx} className="cih-evidence-card">
                        <div className="cih-evidence-top">
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
                            <span className="cih-badge is-neutral-outline">
                              Emosi: {rev.emotion_label}
                            </span>
                            <span className="cih-evidence-meta">
                              {rev.category_label} · {rev.location}
                            </span>
                          </div>
                          {onInspectReview && (
                            <button
                              type="button"
                              onClick={() => onInspectReview(rev.text, rev.category_label)}
                              className="cih-link-action"
                            >
                              <span>Inspeksi XAI</span>
                              <ArrowRight size={13} />
                            </button>
                          )}
                        </div>
                        <p className="cih-evidence-quote">&ldquo;{rev.text}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Chart Breakdown & Driving Tokens */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="cih-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                    <h3 className="cih-panel-title" style={{ fontSize: '0.96rem' }}>
                      <BarChart3 size={16} style={{ color: '#016a71' }} />
                      <span>{aiResult.chart_title}</span>
                    </h3>
                    <HelpButton topicId="ai_chart_box" />
                  </div>
                  <p className="cih-panel-desc" style={{ marginBottom: '16px' }}>
                    Proporsi sentimen positif (hijau) berbanding negatif (merah) pada segmen yang dianalisis
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {aiResult.chart_bars.map((bar, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.8rem',
                            gap: '8px',
                          }}
                        >
                          <strong style={{ color: '#27251e' }}>{bar.label}</strong>
                          <span style={{ color: '#66645e', fontVariantNumeric: 'tabular-nums' }}>
                            {bar.value_label}
                          </span>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                    <h3 className="cih-panel-title" style={{ fontSize: '0.96rem' }}>
                      <span>Atribusi Token Pendorong (Multinomial Naive Bayes)</span>
                    </h3>
                    <HelpButton topicId="ai_tokens_box" />
                  </div>
                  <p className="cih-panel-desc" style={{ marginBottom: '16px' }}>
                    Kata kunci dengan rasio log-probabilitas tertinggi pada vektorisasi TF-IDF
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <div className="cih-token-group-title is-neg">
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
                      <div className="cih-token-group-title is-pos">
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
          HALAMAN 2: PETA PERSEBARAN SENTIMEN 29 KATEGORI (PETA KORPUS)
         ===================================================================== */}
      {activeSubTab === 'peta-korpus' && (
        <>
          <div className="compare-workspace-header">
            <div className="compare-header-left">
              <div className="cih-page-kicker">
                <Compass size={13} />
                <span>PETA KORPUS PRDECT-ID · DISTRIBUSI LINTAS SEKTOR</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 className="compare-title">
                  Peta Persebaran Sentimen {analytics?.category_map.length || 29} Kategori Produk
                </h1>
                <HelpButton topicId="map_overview" />
              </div>
              <p className="compare-subtitle">
                Pemetaan lengkap rasio Positif vs Netral vs Negatif, Net Sentiment Score (NSS),
                rata-rata rating bintang pelanggan, serta emosi dominan di setiap kategori Tokopedia
                PRDECT-ID.
              </p>
            </div>

            {analytics && (
              <div className="cih-header-stat-strip">
                <div className="cih-header-stat">
                  <span className="cih-header-stat-label">Total Korpus</span>
                  <span className="cih-header-stat-val">
                    {analytics.kpi_summary.total_samples.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="cih-header-stat">
                  <span className="cih-header-stat-label">Kategori Aktif</span>
                  <span className="cih-header-stat-val">{analytics.category_map.length}</span>
                </div>
                <div className="cih-header-stat">
                  <span className="cih-header-stat-label">NSS Global</span>
                  <span className="cih-header-stat-val" style={{ color: '#047857' }}>
                    +{analytics.kpi_summary.overall_nss.toFixed(1)} pt
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="cih-toolbar-card">
            <div className="cih-toolbar-search">
              <Search size={15} />
              <input
                type="text"
                value={mapSearch}
                onChange={(e) => setMapSearch(e.target.value)}
                placeholder="Cari nama kategori produk (misal: Komputer, Kecantikan, Kamera)..."
                className="cih-toolbar-search-input"
              />
              {mapSearch && (
                <button
                  type="button"
                  className="cih-toolbar-clear"
                  onClick={() => setMapSearch('')}
                >
                  Reset
                </button>
              )}
            </div>

            <div className="cih-toolbar-controls">
              <CustomSelect
                prefixLabel="Grup"
                value={mapGroupFilter}
                options={mapGroupOptions}
                minWidth={225}
                onChange={(val) => setMapGroupFilter(val)}
              />
              <CustomSelect
                prefixLabel="Urutkan"
                value={mapSortBy}
                options={mapSortOptions}
                align="right"
                minWidth={250}
                onChange={(val) =>
                  setMapSortBy(val as 'total' | 'nss_desc' | 'nss_asc' | 'rating')
                }
              />
              <HelpButton topicId="map_category_card" />
            </div>
          </div>

          {loadingAnalytics ? (
            <div className="cih-panel" style={{ padding: '48px 24px', textAlign: 'center', color: '#66645e' }}>
              Memuat peta persebaran kategori dari server...
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
                      <div className="cih-cat-group-tag">{cat.group}</div>
                      <div className="cih-cat-title">{cat.label}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        className={`cih-badge ${
                          cat.nss >= 5 ? 'is-pos' : cat.nss >= 0 ? 'is-net' : 'is-neg'
                        }`}
                      >
                        NSS {cat.nss >= 0 ? '+' : ''}
                        {cat.nss}%
                      </span>
                      <HelpButton
                        topicId="map_category_card"
                        customTopic={{
                          id: `cat_${cat.id}`,
                          category: `PETA KORPUS · ${cat.group.toUpperCase()}`,
                          title: `Kategori ${cat.label} (${cat.id})`,
                          simpleMeaning: `Kartu ini merangkum seluruh ulasan pelanggan pada kategori "${cat.label}" di dalam dataset PRDECT-ID (total ${cat.total} sampel ulasan terverifikasi).`,
                          formulaOrMechanism: `NSS Kategori = % Positif (${cat.positif_pct}%) - % Negatif (${cat.negatif_pct}%) = ${cat.nss >= 0 ? '+' : ''}${cat.nss} poin`,
                          howToRead: `Dari ${cat.total} ulasan pada kategori ${cat.label}: terdapat ${cat.positif} ulasan Positif (${cat.positif_pct}%), ${cat.netral} ulasan Netral (${cat.netral_pct}%), dan ${cat.negatif} ulasan Negatif (${cat.negatif_pct}%). Rata-rata rating bintang adalah ★ ${cat.avg_rating} dengan psikografi emosi dominan "${cat.top_emotion_label}".`,
                          presentationTip: `Pada kategori ${cat.label} yang termasuk dalam grup ${cat.group}, sistem kami mencatat Net Sentiment Score sebesar ${cat.nss >= 0 ? '+' : ''}${cat.nss} poin dari ${cat.total} sampel ulasan dengan rata-rata bintang ${cat.avg_rating}.`,
                        }}
                      />
                    </div>
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

                  <div className="cih-cat-pct-row">
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

                  <div className="cih-cat-footer">
                    <span>
                      Sampel: <strong style={{ color: '#27251e' }}>{cat.total}</strong> ·{' '}
                      <strong style={{ color: '#b45309' }}>★ {cat.avg_rating}</strong> ·{' '}
                      <span>{cat.top_emotion_label}</span>
                    </span>
                    <span className="cih-link-action">
                      <span>Bedah</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* =====================================================================
          HALAMAN 3: PANEL PELACAK TARGET KPI & NET SENTIMENT SCORE (NSS)
         ===================================================================== */}
      {activeSubTab === 'target-kpi' && analytics && (
        <>
          <div className="compare-workspace-header">
            <div className="compare-header-left">
              <div className="cih-page-kicker">
                <Target size={13} />
                <span>GOVERNED KPI TRACKER · NET SENTIMENT SCORE &amp; MODEL SLA</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 className="compare-title">Pelacak Target KPI &amp; Net Sentiment Score (NSS)</h1>
                <HelpButton topicId="net_sentiment_score" />
              </div>
              <p className="compare-subtitle">
                Pemantauan terukur atas 5 indikator kinerja utama sistem: kualitas generalisasi model
                (Macro F1-Score &amp; Akurasi Uji), Net Sentiment Score (NSS), rata-rata rating
                bintang pelanggan, dan ambang batas keluhan kritis.
              </p>
            </div>

            <div className="cih-header-stat-strip">
              <div className="cih-header-stat">
                <span className="cih-header-stat-label">Skor NSS Korpus</span>
                <span className="cih-header-stat-val" style={{ color: '#047857' }}>
                  +{analytics.kpi_summary.overall_nss.toFixed(1)} pt
                </span>
              </div>
              <div className="cih-header-stat">
                <span className="cih-header-stat-label">Macro F1-Score</span>
                <span className="cih-header-stat-val" style={{ color: '#016a71' }}>
                  {analytics.kpi_summary.f1_macro.toFixed(2)}%
                </span>
              </div>
              <div className="cih-header-stat">
                <span className="cih-header-stat-label">Akurasi Uji</span>
                <span className="cih-header-stat-val">
                  {analytics.kpi_summary.accuracy.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="cih-grid-3">
            {analytics.kpi_summary.kpi_targets.map((kpi) => (
              <div
                key={kpi.id}
                className="cih-panel"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span className="cih-quick-kpi-label">Indikator Terkelola</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={`cih-badge ${kpi.achieved ? 'is-pos' : 'is-net'}`}>
                        {kpi.status}
                      </span>
                      <HelpButton topicId={kpi.id} />
                    </div>
                  </div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#27251e' }}>
                    {kpi.label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '12px' }}>
                    <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#27251e', fontVariantNumeric: 'tabular-nums' }}>
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
                <div className="cih-formula-footer">Rumus: {kpi.formula}</div>
              </div>
            ))}
          </div>

          <div className="cih-grid-2">
            <div className="cih-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <h3 className="cih-panel-title">
                  <TrendingUp size={17} style={{ color: '#047857' }} />
                  <span>Top 5 Kategori dengan Net Sentiment Score (NSS) Tertinggi</span>
                </h3>
                <HelpButton topicId="kpi_top_5_nss" />
              </div>
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
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#27251e' }}>
                        {cat.label}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#57554f', marginTop: '2px' }}>
                        {cat.positif_pct}% Positif vs {cat.negatif_pct}% Negatif ({cat.total} ulasan
                        · ★{cat.avg_rating})
                      </div>
                    </div>
                    <span className="cih-badge is-pos">+{cat.nss} pt</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="cih-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <h3 className="cih-panel-title">
                  <TrendingDown size={17} style={{ color: '#be123c' }} />
                  <span>5 Kategori Prioritas Perbaikan (Rasio Keluhan Tertinggi)</span>
                </h3>
                <HelpButton topicId="kpi_bottom_5_nss" />
              </div>
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
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#27251e' }}>
                        {cat.label}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#57554f', marginTop: '2px' }}>
                        {cat.negatif_pct}% Negatif vs {cat.positif_pct}% Positif ({cat.total} ulasan
                        · ★{cat.avg_rating})
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
          HALAMAN 4: BEDAH DATA MULTI-DIMENSI (DRILL-DOWN EXPLORER)
         ===================================================================== */}
      {activeSubTab === 'bedah-data' && analytics && (
        <>
          <div className="compare-workspace-header">
            <div className="compare-header-left">
              <div className="cih-page-kicker">
                <SlidersHorizontal size={13} />
                <span>MULTI-DIMENSIONAL DRILL-DOWN · RATING, EMOTION &amp; CITY</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 className="compare-title">
                  Bedah Data Multi-Dimensi (Rating ★1–★5, Emosi &amp; Kota)
                </h1>
                <HelpButton topicId="drill_cross_filter" />
              </div>
              <p className="compare-subtitle">
                Eksplorasi silang atribut asli dataset PRDECT-ID: saring berdasarkan kategori produk,
                tingkat psikografi emosi pelanggan (Happy, Love, Sadness, Fear, Anger), rating
                bintang, dan kelas sentimen.
              </p>
            </div>

            <div className="cih-header-stat-strip">
              <div className="cih-header-stat">
                <span className="cih-header-stat-label">Sampel Tersaring</span>
                <span className="cih-header-stat-val" style={{ color: '#016a71' }}>
                  {analytics.drilldown.filtered_total.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="cih-header-stat">
                <span className="cih-header-stat-label">Rata-rata Rating</span>
                <span className="cih-header-stat-val" style={{ color: '#b45309' }}>
                  ★ {analytics.drilldown.filtered_avg_rating.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="cih-panel">
            <div className="cih-panel-head" style={{ marginBottom: '14px' }}>
              <div>
                <h3 className="cih-panel-title" style={{ fontSize: '0.96rem' }}>
                  <span>Parameter Filter Silang (Cross-Filter)</span>
                  <HelpButton topicId="drill_cross_filter" />
                </h3>
                <p className="cih-panel-desc">
                  Pilih kombinasi dimensi di bawah ini atau klik langsung bar grafik untuk memfokuskan sampel ulasan
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDrillFilterChange('Semua', 'Semua', 'Semua', 'Semua')}
                className="cih-reset-filter-btn"
              >
                Reset Semua Filter ({analytics.drilldown.filtered_total.toLocaleString('id-ID')} cocok)
              </button>
            </div>

            <div className="cih-grid-4">
              <div className="cih-filter-field">
                <span className="cih-filter-label">1. Kategori Produk</span>
                <CustomSelect
                  value={drillCategory}
                  options={drillCategoryOptions}
                  fullWidth
                  searchable
                  onChange={(nextVal) =>
                    handleDrillFilterChange(nextVal, drillEmotion, drillRating, drillSentiment)
                  }
                />
              </div>

              <div className="cih-filter-field">
                <span className="cih-filter-label">2. Emosi Pelanggan (PRDECT-ID)</span>
                <CustomSelect
                  value={drillEmotion}
                  options={drillEmotionOptions}
                  fullWidth
                  onChange={(nextVal) =>
                    handleDrillFilterChange(drillCategory, nextVal, drillRating, drillSentiment)
                  }
                />
              </div>

              <div className="cih-filter-field">
                <span className="cih-filter-label">3. Rating Bintang Pelanggan</span>
                <CustomSelect
                  value={drillRating}
                  options={drillRatingOptions}
                  fullWidth
                  onChange={(nextVal) =>
                    handleDrillFilterChange(drillCategory, drillEmotion, nextVal, drillSentiment)
                  }
                />
              </div>

              <div className="cih-filter-field">
                <span className="cih-filter-label">4. Kelas Sentimen</span>
                <CustomSelect
                  value={drillSentiment}
                  options={drillSentimentOptions}
                  fullWidth
                  align="right"
                  onChange={(nextVal) =>
                    handleDrillFilterChange(drillCategory, drillEmotion, drillRating, nextVal)
                  }
                />
              </div>
            </div>
          </div>

          <div className="cih-grid-3" style={{ opacity: drillLoading ? 0.6 : 1 }}>
            {/* Rating Breakdown */}
            <div className="cih-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <h3 className="cih-panel-title" style={{ fontSize: '0.94rem' }}>
                  <Star size={16} style={{ color: '#d97706' }} />
                  <span>Distribusi Rating Bintang (★1 s.d. ★5)</span>
                </h3>
                <HelpButton topicId="drill_rating_breakdown" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                        fontSize: '0.8rem',
                        marginBottom: '5px',
                      }}
                    >
                      <strong style={{ color: '#27251e' }}>★ {r.rating} Bintang</strong>
                      <span style={{ color: '#66645e', fontVariantNumeric: 'tabular-nums' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <h3 className="cih-panel-title" style={{ fontSize: '0.94rem' }}>
                  <Activity size={16} style={{ color: '#016a71' }} />
                  <span>Psikografi Emosi Pelanggan (PRDECT-ID)</span>
                </h3>
                <HelpButton topicId="drill_emotion_psychography" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                        fontSize: '0.8rem',
                        marginBottom: '5px',
                      }}
                    >
                      <strong style={{ color: '#27251e' }}>{emo.label}</strong>
                      <span style={{ color: '#66645e', fontVariantNumeric: 'tabular-nums' }}>
                        {emo.count.toLocaleString('id-ID')} ({emo.percentage}%) · ★{emo.avg_rating}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <h3 className="cih-panel-title" style={{ fontSize: '0.94rem' }}>
                  <MapPin size={16} style={{ color: '#016a71' }} />
                  <span>Sebaran Lokasi Toko / Kota Teratas</span>
                </h3>
                <HelpButton topicId="drill_city_locations" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analytics.drilldown.locations.map((loc) => (
                  <div key={loc.location} className="cih-location-row">
                    <strong style={{ color: '#27251e' }}>{loc.location}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#047857', fontWeight: 600 }}>{loc.positif_pct}% Pos</span>
                      <span style={{ color: '#be123c', fontWeight: 600 }}>{loc.negatif_pct}% Neg</span>
                      <span className="cih-badge is-neutral-outline">{loc.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="cih-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <h3 className="cih-panel-title" style={{ fontSize: '0.96rem' }}>
                <span>
                  Sampel Ulasan Hasil Bedah Data ({analytics.drilldown.filtered_total.toLocaleString('id-ID')}{' '}
                  ulasan cocok)
                </span>
              </h3>
              <HelpButton topicId="drill_samples_box" />
            </div>
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
                        <span className="cih-badge is-neutral-outline">{s.emotion_label}</span>
                      </div>
                      <span style={{ fontSize: '0.73rem', color: '#66645e' }}>{s.location}</span>
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#27251e', marginBottom: '4px' }}>
                      {s.product_name}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', fontStyle: 'italic', color: '#3f3d37', lineHeight: 1.55 }}>
                      &ldquo;{s.text}&rdquo;
                    </p>
                  </div>

                  <div className="cih-cat-footer">
                    <span>
                      Kategori: <strong>{s.category_label}</strong>
                      {s.price > 0 ? ` · Rp${s.price.toLocaleString('id-ID')}` : ''}
                    </span>
                    {onInspectReview && (
                      <button
                        type="button"
                        onClick={() => onInspectReview(s.text, s.category)}
                        className="cih-link-action"
                      >
                        <span>Uji di XAI Predictor</span>
                        <ArrowRight size={13} />
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
          HALAMAN 5: KATALOG METRIK SEMANTIK & REST API PLAYGROUND
         ===================================================================== */}
      {activeSubTab === 'katalog-api' && analytics && (
        <>
          <div className="compare-workspace-header">
            <div className="compare-header-left">
              <div className="cih-page-kicker">
                <Terminal size={13} />
                <span>SEMANTIC LAYER · GOVERNED METRICS &amp; REST API PLAYGROUND</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 className="compare-title">
                  Katalog Metrik Semantik &amp; Dokumentasi Interaktif API
                </h1>
                <HelpButton topicId="catalog_governed_metrics" />
              </div>
              <p className="compare-subtitle">
                Spesifikasi tunggal untuk formula metrik sentimen terkelola, definisi kode pipeline
                Scikit-Learn (TF-IDF + Multinomial Naive Bayes), dan terminal pengujian endpoint
                REST API secara langsung.
              </p>
            </div>
          </div>

          <div className="cih-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h3 className="cih-panel-title">
                <Layers size={18} style={{ color: '#016a71' }} />
                <span>Katalog Metrik Semantik Terkelola (Governed Metrics Catalog)</span>
              </h3>
              <HelpButton topicId="catalog_governed_metrics" />
            </div>
            <p className="cih-panel-desc" style={{ marginBottom: '16px' }}>
              Definisi metrik baku yang disinkronkan di seluruh dasbor evaluasi, laporan komparasi,
              dan Sentimen API.
            </p>

            <div className="cih-grid-2">
              {analytics.semantic_catalog.metrics_catalog.map((m) => (
                <div key={m.id} className="cih-stat-card" style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <code className="cih-metric-code-pill">{m.name}</code>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '0.98rem', color: '#27251e', fontVariantNumeric: 'tabular-nums' }}>
                        {m.current_value}
                      </strong>
                      <HelpButton topicId={m.id} />
                    </div>
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#27251e', marginBottom: '8px' }}>
                    {m.title}
                  </div>
                  <div className="cih-formula-box">{m.formula}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', color: '#66645e' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: 700 }}>
                  <Code2 size={16} style={{ color: '#2dd4bf' }} />
                  <span>Definisi Dalam Kode (Scikit-Learn Pipeline)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(analytics.semantic_catalog.pipeline_code)
                      setCopiedCode(true)
                      setTimeout(() => setCopiedCode(false), 2000)
                    }}
                    className="cih-copy-code-btn"
                  >
                    <Copy size={13} />
                    <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
                  </button>
                  <HelpButton topicId="catalog_pipeline_code" />
                </div>
              </div>
              <pre className="cih-code-box">{analytics.semantic_catalog.pipeline_code}</pre>
              <p style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '12px', marginBottom: 0 }}>
                Pipeline ini dimuat secara persisten dari <code>models/model_sentimen.pkl</code> dan
                mendukung pembaruan bobot instan via <code>partial_fit</code>.
              </p>
            </div>

            {/* Interactive REST API Playground */}
            <div className="cih-panel">
              <div className="cih-panel-head" style={{ marginBottom: '12px' }}>
                <div>
                  <h3 className="cih-panel-title" style={{ fontSize: '0.96rem' }}>
                    <Terminal size={16} style={{ color: '#016a71' }} />
                    <span>Sentimen REST API Playground (Uji Langsung)</span>
                  </h3>
                  <p className="cih-panel-desc">
                    Pilih endpoint dan jalankan request HTTP langsung ke server Flask backend.
                  </p>
                </div>
                <HelpButton topicId="catalog_api_playground" />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
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
                    className={`cih-endpoint-tab ${selectedEndpointIdx === idx ? 'is-active' : ''}`}
                  >
                    <span className="cih-endpoint-method">{ep.method}</span>
                    <span>{ep.path}</span>
                  </button>
                ))}
              </div>

              <div className="cih-stat-card" style={{ marginBottom: '14px', fontSize: '0.8rem', color: '#3f3d37' }}>
                <strong>
                  {analytics.semantic_catalog.api_endpoints[selectedEndpointIdx]?.title}:
                </strong>{' '}
                {analytics.semantic_catalog.api_endpoints[selectedEndpointIdx]?.description}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="cih-filter-label">
                    {selectedEndpointIdx === 1 ? 'Payload JSON: question' : 'Payload JSON: text (Ulasan)'}
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
                  <label className="cih-filter-label">Parameter Kategori (category)</label>
                  <CustomSelect
                    value={playgroundCategory}
                    options={drillCategoryOptions}
                    fullWidth
                    searchable
                    onChange={(val) => setPlaygroundCategory(val)}
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
                <span style={{ fontSize: '0.73rem', fontFamily: 'var(--font-mono, monospace)', color: '#66645e' }}>
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
