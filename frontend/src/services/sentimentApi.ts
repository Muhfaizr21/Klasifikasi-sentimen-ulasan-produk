import type {
  AiAnalystResponse,
  BatchPredictionResponse,
  CategoriesResponse,
  CorpusAnalyticsResponse,
  DatasetSample,
  HealthStatus,
  LiveStreamResponse,
  MetricsReport,
  PredictionResult,
  ProductComparisonResponse,
  RealtimeLearnResponse,
  SentimentClass,
  TopWordsResponse,
} from '../types/sentiment'

function mapPayloadToPredictionResult(
  payload: Record<string, any>,
  fallbackText: string,
  latencyMs: number
): PredictionResult {
  const probabilities = payload.probabilities || {
    positif: (payload.probabilitas?.positif ?? 0) * 100,
    netral: (payload.probabilitas?.netral ?? 0) * 100,
    negatif: (payload.probabilitas?.negatif ?? 0) * 100,
  }

  const label = (payload.label || 'netral') as SentimentClass
  const confidence =
    typeof payload.confidence === 'number'
      ? payload.confidence
      : Math.max(probabilities.positif || 0, probabilities.netral || 0, probabilities.negatif || 0)

  return {
    label,
    confidence,
    probabilities: {
      positif: Number(probabilities.positif || 0),
      netral: Number(probabilities.netral || 0),
      negatif: Number(probabilities.negatif || 0),
    },
    inputText: payload.text || fallbackText,
    cleanText: payload.teks_bersih || fallbackText,
    latencyMs,
    explanation: payload.explanation || [],
    analysis: payload.analysis,
    productMedia: payload.product_media,
  }
}

export interface PredictOptions {
  productHint?: string
  category?: string
  platform?: string
}

export async function requestSentimentPrediction(
  reviewText: string,
  options?: PredictOptions
): Promise<PredictionResult> {
  const startTime = performance.now()

  const response = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teks: reviewText,
      product_hint: options?.productHint || '',
      category: options?.category || '',
      platform: options?.platform || '',
    }),
  })

  const payload = await response.json()
  const latencyMs = Math.round(performance.now() - startTime)

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || payload.error || 'Prediksi gagal diproses.')
  }

  return mapPayloadToPredictionResult(payload, reviewText, latencyMs)
}

export async function learnRealtimeReview(
  reviewText: string,
  targetLabel: SentimentClass,
  category: string = 'Real-Time Input',
  productHint: string = ''
): Promise<RealtimeLearnResponse> {
  const startTime = performance.now()

  const response = await fetch('/api/learn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teks: reviewText,
      label: targetLabel,
      category,
      product_hint: productHint,
      persist: true,
    }),
  })

  const payload = await response.json()
  const latencyMs = Math.round(performance.now() - startTime)

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || payload.error || 'Gagal melatih model secara real-time.')
  }

  const predPayload = payload.prediction || payload
  return {
    prediction: mapPayloadToPredictionResult(predPayload, reviewText, latencyMs),
    learnedLabel: (payload.learned_label || targetLabel) as SentimentClass,
    addedNewRow: Boolean(payload.added_new_row),
    corpusTotal: Number(payload.corpus_total || 5459),
    realtimeLearnedCount: Number(payload.realtime_learned_count || 1),
  }
}

export async function fetchRealtimeStream(
  query: string = '',
  category: string = 'Semua',
  limit: number = 6,
  platform: string = 'semua'
): Promise<LiveStreamResponse> {
  const response = await fetch('/api/realtime/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, category, limit, platform }),
  })

  const payload = await response.json()
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || payload.error || 'Gagal menarik data ulasan real-time.')
  }

  return payload as LiveStreamResponse
}

export async function requestBatchPrediction(file: File): Promise<BatchPredictionResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/predict/batch', {
    method: 'POST',
    body: formData,
  })

  const payload = await response.json()
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || payload.error || 'Gagal memproses batch CSV.')
  }

  return payload as BatchPredictionResponse
}

export async function fetchEvaluationMetrics(): Promise<MetricsReport> {
  const response = await fetch('/api/metrics')
  const payload = await response.json()

  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Gagal memuat metrik evaluasi model.')
  }

  return payload.metrics as MetricsReport
}

export async function fetchDatasetSamples(
  category: string = 'Semua',
  query: string = ''
): Promise<{
  samples: DatasetSample[]
  corpusTotal?: number
  realtimeLearnedCount?: number
}> {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (query) params.set('q', query)

  const response = await fetch(`/api/samples?${params.toString()}`)
  const payload = await response.json()

  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Gagal memuat sampel dataset.')
  }

  return {
    samples: (payload.samples || []) as DatasetSample[],
    corpusTotal: typeof payload.corpus_total === 'number' ? payload.corpus_total : undefined,
    realtimeLearnedCount:
      typeof payload.realtime_learned_count === 'number' ? payload.realtime_learned_count : undefined,
  }
}

export async function fetchBackendHealth(): Promise<HealthStatus> {
  const response = await fetch('/api/health')
  if (!response.ok) {
    throw new Error('Server backend tidak merespons.')
  }
  return (await response.json()) as HealthStatus
}

export async function fetchTopWords(limit: number = 25): Promise<TopWordsResponse> {
  const response = await fetch(`/api/top-words?limit=${limit}`)
  const payload = await response.json()
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Gagal memuat kamus bobot kata.')
  }
  return payload as TopWordsResponse
}

export async function requestProductComparison(
  productA: string,
  productB: string,
  category: string = 'Semua',
  platform: string = 'semua'
): Promise<ProductComparisonResponse> {
  const response = await fetch('/api/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_a: productA,
      product_b: productB,
      category,
      platform,
    }),
  })

  const payload = await response.json()
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || payload.error || 'Gagal membandingkan kedua produk.')
  }

  return payload as ProductComparisonResponse
}

export async function fetchCategories(): Promise<CategoriesResponse> {
  const response = await fetch('/api/categories')
  const payload = await response.json()
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Gagal memuat daftar kategori dari korpus.')
  }
  return payload as CategoriesResponse
}

export async function fetchCorpusAnalytics(params?: {
  category?: string
  emotion?: string
  rating?: string
  sentiment?: string
}): Promise<CorpusAnalyticsResponse> {
  const qs = new URLSearchParams()
  if (params?.category) qs.set('category', params.category)
  if (params?.emotion) qs.set('emotion', params.emotion)
  if (params?.rating) qs.set('rating', params.rating)
  if (params?.sentiment) qs.set('sentiment', params.sentiment)

  const queryStr = qs.toString()
  const response = await fetch(`/api/corpus-analytics${queryStr ? `?${queryStr}` : ''}`)
  const payload = await response.json()
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || payload.error || 'Gagal memuat analitik korpus.')
  }
  return payload as CorpusAnalyticsResponse
}

export async function requestAiAnalyst(
  question: string,
  category: string = 'Semua'
): Promise<AiAnalystResponse> {
  const response = await fetch('/api/ai-analyst', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, category }),
  })
  const payload = await response.json()
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || payload.error || 'Gagal memproses pertanyaan analitik AI.')
  }
  return payload as AiAnalystResponse
}


