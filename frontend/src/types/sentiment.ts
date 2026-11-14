export type SentimentClass = 'positif' | 'netral' | 'negatif'

export interface DatasetSample {
  text: string
  sentiment: SentimentClass
  rating: number
  category: string
  source: string
}

export interface HealthStatus {
  status: string
  models_loaded: boolean
  timestamp: string
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

export interface PredictionResult {
  label: SentimentClass
  confidence: number
  probabilities: ClassProbabilities
  inputText: string
  cleanText: string
  latencyMs: number
  explanation?: WordExplanation[]
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
}
