export type SentimentClass = 'positif' | 'netral' | 'negatif'

export interface DatasetSample {
  text: string
  sentiment: SentimentClass
  rating: number
  category: string
  category_label?: string
  product_name?: string
  source: string
}

export interface HealthStatus {
  status: string
  models_loaded: boolean
  timestamp: string
  corpus_total?: number
  realtime_learned_count?: number
}

export interface ProductMediaGalleryItem {
  image_url: string
  thumbnail_url: string
  product_url?: string
  title?: string
}

export interface ProductMediaInfo {
  title: string
  query_used?: string
  category: string
  platform: string
  image_url: string
  thumbnail_url: string
  product_url?: string
  gallery?: ProductMediaGalleryItem[]
  is_catalog_verified?: boolean
  price?: number | null
  overall_rating?: number | null
  customer_rating?: number | null
  emotion?: string | null
}

export interface LiveStreamItem {
  text: string
  rating: number
  category: string
  source: string
  author?: string
  reviewed_at?: string
  label: SentimentClass
  confidence: number
  probabilities: ClassProbabilities
  clean_text: string
  image_url?: string
  thumbnail_url?: string
  product_title?: string
  product_url?: string
}

export interface LiveStreamResponse {
  success: boolean
  external_live: boolean
  platform?: string
  query: string
  category: string
  total_fetched: number
  corpus_total: number
  realtime_learned_count: number
  product_showcase?: ProductMediaInfo
  product_summary?: ProductExecutiveSummary
  items: LiveStreamItem[]
  timestamp: string
}

export interface ProductExecutiveSummary {
  product_title: string
  total_reviews: number
  average_rating: number
  reputation_score: number
  recommendation_badge: string
  sentiment_breakdown: Record<SentimentClass, number>
  pros: string[]
  cons: string[]
  executive_narrative: string
  image_url?: string
  thumbnail_url?: string
  product_url?: string
  platform?: string
  category?: string
}

export interface ProductComparisonItem {
  summary: ProductExecutiveSummary
  showcase?: ProductMediaInfo
  items?: LiveStreamItem[]
}

export interface ProductComparisonResponse {
  success: boolean
  product_a: ProductComparisonItem
  product_b: ProductComparisonItem
  winner: 'A' | 'B' | 'TIE'
  verdict: string
  score_diff: number
  timestamp: string
}

export interface TopFeatureWord {
  word: string
  score: number
  polarity: SentimentClass
}

export interface TopWordsResponse {
  success: boolean
  limit: number
  words: {
    positif: TopFeatureWord[]
    netral: TopFeatureWord[]
    negatif: TopFeatureWord[]
  }
}

export interface RealtimeLearnResponse {
  prediction: PredictionResult
  learnedLabel: SentimentClass
  addedNewRow: boolean
  corpusTotal: number
  realtimeLearnedCount: number
}

export interface ClassProbabilities {
  positif: number
  netral: number
  negatif: number
}

export interface WordExplanation {
  word: string
  polarity: SentimentClass | 'oov'
  score: number
}

export interface PragmaticNote {
  type: string
  title: string
  description: string
}

export interface ReasoningStep {
  step: number
  title: string
  badge: string
  detail: string
}

export interface DetectedAspect {
  name: string
  sentiment: SentimentClass
  evidence: string
}

export interface AIAnalysisReport {
  headline: string
  narrative: string
  paragraphs: string[]
  pragmatic_note?: PragmaticNote | null
  reasoning_steps: ReasoningStep[]
  aspects: DetectedAspect[]
  follow_ups: string[]
}

export interface PredictionResult {
  label: SentimentClass
  confidence: number
  probabilities: ClassProbabilities
  inputText: string
  cleanText: string
  latencyMs: number
  explanation?: WordExplanation[]
  analysis?: AIAnalysisReport
  productMedia?: ProductMediaInfo
}

export interface BatchItem {
  text: string
  label: SentimentClass
  confidence: number
  probabilities: ClassProbabilities
  clean_text: string
}

export interface BatchPredictionResponse {
  total: number
  distribution: Record<SentimentClass, number>
  percentages: Record<SentimentClass, number>
  results: BatchItem[]
}

export interface ClassMetric {
  precision: number
  recall: number
  'f1-score': number
  support: number
}

export interface ExperimentSummary {
  experiment_name: string
  model_type: string
  vectorizer_type: string
  use_stopwords: boolean
  accuracy: number
  f1_macro: number
  f1_weighted: number
}

export interface MetricsReport {
  experiment_name: string
  model_type: string
  vectorizer_type: string
  accuracy: number
  f1_macro: number
  f1_weighted: number
  labels: SentimentClass[]
  confusion_matrix: number[][]
  classification_report: Record<string, ClassMetric | number>
  dataset_info?: {
    total_samples: number
    train_samples: number
    test_samples: number
    class_distribution: Record<string, number>
  }
  experiments?: ExperimentSummary[]
  top_features?: {
    positif: TopFeatureWord[]
    netral: TopFeatureWord[]
    negatif: TopFeatureWord[]
  }
}

export interface CategoryGroupItem {
  id: string
  label: string
  count: number
  subcategories: number
}

export interface CategoryItem {
  id: string
  label: string
  raw_name: string
  group: string
  count: number
}

export interface CategoriesResponse {
  success: boolean
  corpus_total: number
  total_categories: number
  groups: CategoryGroupItem[]
  categories: CategoryItem[]
  timestamp?: string
}

export interface CategoryMapItem {
  id: string
  label: string
  group: string
  total: number
  positif: number
  netral: number
  negatif: number
  positif_pct: number
  netral_pct: number
  negatif_pct: number
  nss: number
  avg_rating: number
  top_emotion: string
  top_emotion_label: string
  emotions: Record<string, number>
}

export interface KpiTargetItem {
  id: string
  label: string
  current_value: number
  target_value: number
  unit: string
  formula: string
  status: string
  achieved: boolean
  delta: number
}

export interface KpiSummaryData {
  overall_nss: number
  satisfaction_index: number
  complaint_ratio: number
  accuracy: number
  f1_macro: number
  vocabulary_size: number
  total_samples: number
  positif_total: number
  netral_total: number
  negatif_total: number
  kpi_targets: KpiTargetItem[]
  top_nss_categories: CategoryMapItem[]
  critical_nss_categories: CategoryMapItem[]
}

export interface DrilldownRatingItem {
  rating: number
  label: string
  count: number
  percentage: number
  positif: number
  netral: number
  negatif: number
}

export interface DrilldownEmotionItem {
  emotion: string
  label: string
  count: number
  percentage: number
  avg_rating: number
  dominant_sentiment: SentimentClass
}

export interface DrilldownLocationItem {
  location: string
  count: number
  percentage: number
  positif_pct: number
  negatif_pct: number
}

export interface DrilldownSampleItem {
  text: string
  sentiment: SentimentClass
  rating: number
  emotion: string
  emotion_label: string
  category: string
  category_label: string
  location: string
  product_name: string
  price: number
  number_sold: number
}

export interface DrilldownData {
  active_filters: {
    category: string
    emotion: string
    rating: string
    sentiment: string
  }
  filtered_total: number
  filtered_positif: number
  filtered_netral: number
  filtered_negatif: number
  filtered_avg_rating: number
  ratings: DrilldownRatingItem[]
  emotions: DrilldownEmotionItem[]
  locations: DrilldownLocationItem[]
  samples: DrilldownSampleItem[]
}

export interface GovernedMetricItem {
  id: string
  name: string
  title: string
  formula: string
  current_value: string
  dimension: string
  owner: string
}

export interface ApiEndpointDocItem {
  method: string
  path: string
  title: string
  description: string
  sample_payload: Record<string, string>
}

export interface SemanticCatalogData {
  metrics_catalog: GovernedMetricItem[]
  api_endpoints: ApiEndpointDocItem[]
  pipeline_code: string
}

export interface CorpusAnalyticsResponse {
  success: boolean
  category_map: CategoryMapItem[]
  kpi_summary: KpiSummaryData
  drilldown: DrilldownData
  semantic_catalog: SemanticCatalogData
  timestamp?: string
}

export interface AiAnalystChartBar {
  label: string
  count: number
  positif_pct: number
  negatif_pct: number
  value_label: string
}

export interface AiAnalystEvidenceReview {
  text: string
  sentiment: SentimentClass
  rating: number
  emotion: string
  emotion_label: string
  category_label: string
  product_name: string
  location: string
}

export interface AiAnalystResponse {
  success: boolean
  question: string
  matched_category: string
  matched_category_label: string
  matched_aspect: string
  headline: string
  narrative: string
  key_findings: string[]
  metrics_highlight: {
    total_analyzed: number
    positif_pct: number
    netral_pct: number
    negatif_pct: number
    nss: number
    avg_rating: number
    anger_count: number
  }
  chart_title: string
  chart_bars: AiAnalystChartBar[]
  top_tokens: {
    positif: TopFeatureWord[]
    negatif: TopFeatureWord[]
  }
  evidence_reviews: AiAnalystEvidenceReview[]
  timestamp?: string
}


