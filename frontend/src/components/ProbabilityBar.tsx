import type { SentimentClass } from '../types/sentiment'

interface ProbabilityBarProps {
  label: string
  sentimentKey: SentimentClass
  value: number
}

export function ProbabilityBar({ label, sentimentKey, value }: ProbabilityBarProps) {
  const clampedPercentage = Math.min(100, Math.max(0, value))

  return (
    <div>
      <div className="prob-item-header">
        <span>{label}</span>
        <span>{clampedPercentage.toFixed(2)}%</span>
      </div>
      <div className="prob-track">
        <div
          className={`prob-fill ${sentimentKey}`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  )
}

