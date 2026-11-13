import type {
  DatasetSample,
  HealthStatus,
  MetricsReport,
  PredictionResult,
  SentimentClass,
} from '../types/sentiment'

export async function requestSentimentPrediction(reviewText: string): Promise<PredictionResult> {
  const startTime = performance.now()

  const response = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teks: reviewText }),
  })

  const payload = await response.json()
  const latencyMs = Math.round(performance.now() - startTime)

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || payload.error || 'Prediksi gagal diproses.')
  }

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
    inputText: payload.text || reviewText,
    cleanText: payload.teks_bersih || reviewText,
    latencyMs,
  }
}

export async function fetchEvaluationMetrics(): Promise<MetricsReport> {
  const response = await fetch('/api/metrics')
  const payload = await response.json()

  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Gagal memuat metrik evaluasi model.')
  }

  return payload.metrics as MetricsReport
}

export async function fetchDatasetSamples(): Promise<DatasetSample[]> {
  const response = await fetch('/api/samples')
  const payload = await response.json()

  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Gagal memuat sampel dataset.')
  }

  return payload.samples as DatasetSample[]
}

export async function fetchBackendHealth(): Promise<HealthStatus> {
  const response = await fetch('/api/health')
  if (!response.ok) {
    throw new Error('Server backend tidak merespons.')
  }
  return (await response.json()) as HealthStatus
}
