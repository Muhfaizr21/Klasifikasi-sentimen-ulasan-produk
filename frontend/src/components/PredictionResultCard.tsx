import { useEffect, useMemo, useState } from 'react'
import type {
  AIAnalysisReport,
  PredictionResult,
  SentimentClass,
} from '../types/sentiment'
import { ProbabilityBar } from './ProbabilityBar'

const BADGE_LABELS: Record<SentimentClass, string> = {
  positif: 'Sentimen Positif',
  netral: 'Sentimen Netral',
  negatif: 'Sentimen Negatif',
}

interface PredictionResultCardProps {
  result: PredictionResult
  onFollowUpSelect?: (promptText: string) => void
  onLearnRealtime?: (targetLabel: SentimentClass) => Promise<void>
  learningLabel?: SentimentClass | null
  learnedSuccessNote?: string | null
}

/**
 * Fallback dynamic synthesizer in case a cached history item or older API payload
 * does not include `result.analysis`. Also detects pragmatic nuances client-side.
 */
function synthesizeClientAnalysis(result: PredictionResult): AIAnalysisReport {
  if (result.analysis && result.analysis.paragraphs?.length > 0) {
    return result.analysis
  }

  const raw = result.inputText.trim()
  const lower = raw.toLowerCase()
  const clean = result.cleanText || lower
  const tokens = result.explanation || []

  const hasExpectation =
    /\b(saya kira|aku kira|kirain|dikira|kupikir|saya pikir|ekspektasi)\b/i.test(lower)
  const hasPositiveConfirm =
    /\b(ternyata memang|ternyata bagus|beneran bagus|memang bagus|puas banget|sangat puas)\b/i.test(
      lower
    )
  const hasNegation = /\b(tidak|bukan|jangan|belum|kurang|ga|gak|nggak|tdk)\b/i.test(lower)
  const hasContrast = /\b(tapi|tetapi|namun|kok|malah|ternyata|padahal|cuma|sayang)\b/i.test(lower)

  const posTokens = tokens.filter(t => t.polarity === 'positif')
  const negTokens = tokens.filter(t => t.polarity === 'negatif')

  let pragmaticNote = null
  if (hasExpectation && !hasPositiveConfirm) {
    pragmaticNote = {
      type: 'expectation_reversal',
      title: 'Deteksi Kontras Ekspektasi vs Realita (Makna Implisit)',
      description:
        'Frasa pembuka "saya kira / kirain / dikira" dalam ulasan produk Indonesia umumnya menandakan ekspektasi awal pembeli yang berbanding terbalik dengan kenyataan saat barang diterima, meskipun terdapat kata bernilai positif di akhir kalimat.',
    }
  } else if (hasNegation) {
    pragmaticNote = {
      type: 'negation_inversion',
      title: 'Konstruksi Negasi Terdeteksi pada Kalimat',
      description:
        'Kalimat mengandung kata pengingkar (tidak/kurang/gak) yang memodifikasi polaritas kata sifat di belakangnya, sehingga sistem memperhitungkan pergeseran makna leksikal.',
    }
  } else if (hasContrast) {
    pragmaticNote = {
      type: 'contrast_clause',
      title: 'Struktur Kalimat Kontrastif / Evaluasi Bersyarat',
      description:
        'Terdapat partikel pembanding atau keheranan (kok/malah/tapi/cuma) yang menandakan adanya catatan khusus dari pembeli terhadap kondisi produk.',
    }
  }

  const topTokenStr =
    tokens.length > 0
      ? tokens
          .slice(0, 4)
          .map(t => `**\`${t.word}\`** (${t.score > 0 ? `+${t.score}` : t.score})`)
          .join(', ')
      : `**\`${clean}\`**`

  const p1 =
    hasExpectation && !hasPositiveConfirm && result.label === 'positif'
      ? `Berdasarkan analisis terhadap ulasan **"${raw}"**, model klasifikasi membaca dominasi leksikal **Sentimen Positif (${result.confidence.toFixed(2)}%)** karena kuatnya bobot kata positif di dalam kalimat. Namun secara **pragmatik bahasa Indonesia**, penggunaan frasa **"saya kira..."** tanpa disertai konfirmasi positif mengindikasikan **kekecewaan implisit (ekspektasi tidak sesuai realita)**.`
      : `Berdasarkan analisis terhadap ulasan **"${raw}"**, sistem mengklasifikasikan kalimat ini sebagai **${BADGE_LABELS[result.label]}** dengan tingkat keyakinan **${result.confidence.toFixed(2)}%**. Struktur kalimat secara langsung merefleksikan evaluasi pelanggan terhadap kualitas maupun fungsionalitas barang yang diterima.`

  const p2 =
    tokens.length > 0
      ? `Dari sudut pandang matematis **Multinomial Naive Bayes**, keputusan ini didorong oleh kontribusi log-likelihood dari token ${topTokenStr} setelah melalui normalisasi slang dan penyaringan stopword Sastrawi menjadi **\`${clean}\`**. Distribusi probabilitas akhir terpetakan pada **Positif ${result.probabilities.positif.toFixed(2)}%**, **Netral ${result.probabilities.netral.toFixed(2)}%**, dan **Negatif ${result.probabilities.negatif.toFixed(2)}%**.`
      : `Setelah melalui tahap pembersihan tanda baca dan stopword Sastrawi (**\`${clean}\`**), model memetakan distribusi probabilitas pada **Positif ${result.probabilities.positif.toFixed(2)}%**, **Netral ${result.probabilities.netral.toFixed(2)}%**, dan **Negatif ${result.probabilities.negatif.toFixed(2)}%**.`

  return {
    headline:
      hasExpectation && !hasPositiveConfirm
        ? 'Terdeteksi Frasa Ekspektasi ("Saya Kira...") dengan Kontras Makna Leksikal'
        : result.label === 'positif'
          ? 'Sentimen Positif: Indikasi Kepuasan Pelanggan terhadap Produk'
          : result.label === 'negatif'
            ? 'Sentimen Negatif: Indikasi Keluhan atau Ketidaksesuaian Produk'
            : 'Sentimen Netral: Evaluasi Produk Bersifat Standar / Moderat',
    narrative: `${p1}\n\n${p2}`,
    paragraphs: [p1, p2],
    pragmatic_note: pragmaticNote,
    reasoning_steps: [
      {
        step: 1,
        title: 'Normalisasi Teks & Sastrawi Stopword',
        badge: `${clean.split(/\s+/).filter(Boolean).length} Token Aktif`,
        detail: `Teks asli dibersihkan dan dinormalisasi menjadi representasi fitur: "${clean}".`,
      },
      {
        step: 2,
        title: 'Evaluasi Konteks Pragmatik & Bobot Kata',
        badge: `${tokens.length} Kata Kunci`,
        detail: pragmaticNote
          ? pragmaticNote.description
          : `Ditemukan ${posTokens.length} token positif dan ${negTokens.length} token negatif pada matriks TF-IDF.`,
      },
      {
        step: 3,
        title: 'Inferensi Probabilitas Naive Bayes',
        badge: `${result.label.toUpperCase()} (${result.confidence.toFixed(1)}%)`,
        detail: `Posterior kelas tertinggi berada pada ${BADGE_LABELS[result.label]} (${result.confidence.toFixed(2)}%) dalam waktu ${result.latencyMs} ms.`,
      },
    ],
    aspects: [
      {
        name: hasExpectation ? 'Kesesuaian Ekspektasi' : 'Kualitas & Fungsi Produk',
        sentiment: hasExpectation && !hasPositiveConfirm ? 'negatif' : result.label,
        evidence:
          tokens
            .slice(0, 3)
            .map(t => t.word)
            .join(', ') || clean,
      },
    ],
    follow_ups: [
      'Saya kira barangnya bagus, ternyata pas sampai tipis dan mengecewakan.',
      'Barangnya beneran bagus sesuai ekspektasi, pengiriman cepat dan aman!',
      'Kualitas standar sesuai harga, lumayan tapi pengemasannya agak tipis.',
    ],
  }
}

/**
 * Renders markdown-lite formatting (**bold** and `code`) cleanly into React nodes.
 */
function renderFormattedParagraph(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2)
      if (inner.startsWith('`') && inner.endsWith('`')) {
        return (
          <code key={idx} className="ai-inline-code">
            {inner.slice(1, -1)}
          </code>
        )
      }
      return (
        <strong key={idx} className="ai-inline-strong">
          {inner}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={idx} className="ai-inline-code">
          {part.slice(1, -1)}
        </code>
      )
    }
    return <span key={idx}>{part}</span>
  })
}

export function PredictionResultCard({
  result,
  onFollowUpSelect,
  onLearnRealtime,
  learningLabel,
  learnedSuccessNote,
}: PredictionResultCardProps) {
  const explanation = result.explanation || []
  const analysis = useMemo(() => synthesizeClientAnalysis(result), [result])

  const [reasoningOpen, setReasoningOpen] = useState(false)
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(true)
  const [copied, setCopied] = useState(false)
  const [selectedGalleryIdx, setSelectedGalleryIdx] = useState(0)

  const productMedia = result.productMedia
  const galleryItems = productMedia?.gallery && productMedia.gallery.length > 0
    ? productMedia.gallery
    : productMedia?.image_url || productMedia?.thumbnail_url
      ? [
          {
            image_url: productMedia.image_url,
            thumbnail_url: productMedia.thumbnail_url,
            title: productMedia.title,
            product_url: productMedia.product_url,
          },
        ]
      : []

  const activeGalleryItem = galleryItems[selectedGalleryIdx] || galleryItems[0] || null

  // Dynamic AI streaming effect when a new prediction arrives
  const fullText = useMemo(() => analysis.paragraphs.join('\n\n'), [analysis])
  const [streamedChars, setStreamedChars] = useState<number>(0)
  const [isStreaming, setIsStreaming] = useState<boolean>(true)

  useEffect(() => {
    setStreamedChars(0)
    setIsStreaming(true)
    setCopied(false)
    setSelectedGalleryIdx(0)

    const totalLen = fullText.length
    const stepSize = Math.max(4, Math.ceil(totalLen / 38))

    const timer = window.setInterval(() => {
      setStreamedChars(prev => {
        if (prev + stepSize >= totalLen) {
          window.clearInterval(timer)
          setIsStreaming(false)
          return totalLen
        }
        return prev + stepSize
      })
    }, 18)

    return () => window.clearInterval(timer)
  }, [fullText, result.inputText])

  const visibleNarrative = isStreaming ? fullText.slice(0, streamedChars) : fullText
  const visibleParagraphs = visibleNarrative.split('\n\n')

  // Check if client-side pragmatic detector noticed expectation reversal on an older uncalibrated result
  const effectiveSentiment: SentimentClass =
    analysis.pragmatic_note?.type === 'expectation_reversal' && result.label === 'positif'
      ? 'negatif'
      : result.label

  const handleCopySummary = () => {
    const summaryText = [
      `Ulasan: "${result.inputText}"`,
      `Kesimpulan AI: ${analysis.headline} (${BADGE_LABELS[effectiveSentiment]} - ${result.confidence.toFixed(2)}%)`,
      '',
      analysis.paragraphs.join('\n\n').replace(/\*\*|`/g, ''),
    ].join('\n')

    navigator.clipboard?.writeText(summaryText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <section className="ai-answer-thread" aria-label="Hasil Analisis AI Sentimen">
      {/* 1. User Query Header Bubble (Perplexity Thread Header) */}
      <div className="ai-query-header">
        <div className="ai-query-meta-row">
          <span className="ai-thread-tag">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
              <path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07L19.07 4.93" strokeLinecap="round" />
            </svg>
            <span>Analisis AI Sentimen</span>
          </span>
          <span className="ai-latency-pill">
            {result.latencyMs} ms · TF-IDF + Multinomial NB + Konteks Pragmatik
          </span>
        </div>
        <h2 className="ai-user-prompt-title">&ldquo;{result.inputText}&rdquo;</h2>
      </div>

      {/* 2. Collapsible Reasoning Steps Bar (Perplexity "Pro Search / Steps" pattern) */}
      <div className="ai-reasoning-box">
        <button
          type="button"
          className="ai-reasoning-toggle"
          onClick={() => setReasoningOpen(prev => !prev)}
          aria-expanded={reasoningOpen}
        >
          <div className="ai-reasoning-toggle-left">
            <span className={`ai-pulse-dot ${isStreaming ? 'streaming' : 'done'}`} />
            <span className="ai-reasoning-label">
              {isStreaming
                ? 'Menyusun sintesis jawaban kontekstual...'
                : `${analysis.reasoning_steps.length} Tahap Penalaran NLP Selesai`}
            </span>
            <span className="ai-reasoning-preview-pills">
              {analysis.reasoning_steps.map(s => (
                <span key={s.step} className="ai-step-mini-pill">
                  {s.badge}
                </span>
              ))}
            </span>
          </div>
          <span className="ai-reasoning-chevron">
            {reasoningOpen ? 'Sembunyikan' : 'Lihat Proses'}
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              style={{
                transform: reasoningOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s ease',
              }}
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>

        {reasoningOpen && (
          <div className="ai-reasoning-steps-list">
            {analysis.reasoning_steps.map(step => (
              <div key={step.step} className="ai-reasoning-step-item">
                <div className="ai-step-number">{step.step}</div>
                <div className="ai-step-body">
                  <div className="ai-step-header">
                    <span className="ai-step-title">{step.title}</span>
                    <span className="ai-step-badge">{step.badge}</span>
                  </div>
                  <p className="ai-step-detail">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Main AI Synthesis Answer Card */}
      <div className="card ai-synthesis-card">
        {/* Official Academic Print-Ready Header (Visible only when printed to PDF) */}
        <div className="academic-print-header">
          <div className="academic-print-title">POLITEKNIK NEGERI INDRAMAYU · JURUSAN TEKNIK INFORMATIKA</div>
          <div className="academic-print-subtitle">
            LAPORAN RESMI ANALISIS KLASIFIKASI SENTIMEN ULASAN PRODUK E-COMMERCE
          </div>
          <div className="academic-print-meta">
            <span>Model: Multinomial Naive Bayes (TF-IDF N-Gram 1-2)</span>
            <span>Pengembang: Muhammad Faiz Ramadhan (2306072) &amp; Tim</span>
            <span>Waktu Cetak: {new Date().toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Visual Produk Real-Time (E-Commerce Product Showcase) */}
        {productMedia && activeGalleryItem && (activeGalleryItem.image_url || activeGalleryItem.thumbnail_url) && (
          <div className="ai-product-media-bar" aria-label="Visual Produk E-Commerce">
            <div className="ai-product-main-visual">
              <img
                src={activeGalleryItem.image_url || activeGalleryItem.thumbnail_url}
                alt={productMedia.title || 'Gambar Produk E-Commerce'}
                width="80"
                height="80"
                className="ai-product-main-img"
                loading="eager"
                referrerPolicy="no-referrer"
                onError={e => {
                  const target = e.currentTarget
                  if (
                    activeGalleryItem.thumbnail_url &&
                    target.src !== activeGalleryItem.thumbnail_url
                  ) {
                    target.src = activeGalleryItem.thumbnail_url
                  }
                }}
              />
            </div>

            <div className="ai-product-meta">
              <div className="ai-product-meta-top">
                <span className="teal-pill-badge">
                  VISUAL PRODUK REAL · {(productMedia.platform || 'E-COMMERCE').toUpperCase()}
                </span>
                <span className="ai-product-cat-badge">{productMedia.category}</span>
              </div>
              <h4 className="ai-product-title">
                {activeGalleryItem.title || productMedia.title}
              </h4>
              <div className="ai-product-links-row">
                <span className="ai-product-subnote">
                  Foto produk asli dari katalog marketplace Indonesia
                </span>
                {(activeGalleryItem.product_url || productMedia.product_url) && (
                  <a
                    href={activeGalleryItem.product_url || productMedia.product_url}
                    target="_blank"
                    rel="noreferrer"
                    className="ai-product-ext-link"
                  >
                    Lihat Halaman Produk ↗
                  </a>
                )}
              </div>
            </div>

            {galleryItems.length > 1 && (
              <div className="ai-product-gallery-strip" aria-label="Galeri Varian Produk">
                {galleryItems.slice(0, 4).map((gItem, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`ai-product-thumb-btn ${selectedGalleryIdx === idx ? 'active' : ''}`}
                    onClick={() => setSelectedGalleryIdx(idx)}
                    title={gItem.title || `Foto produk ${idx + 1}`}
                  >
                    <img
                      src={gItem.thumbnail_url || gItem.image_url}
                      alt={gItem.title || `Varian ${idx + 1}`}
                      width="44"
                      height="44"
                      className="ai-product-thumb-img"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={e => {
                        const target = e.currentTarget
                        if (gItem.image_url && target.src !== gItem.image_url) {
                          target.src = gItem.image_url
                        }
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="ai-verdict-banner">
          <div className="ai-verdict-left">
            <span className="ai-verdict-eyebrow">Kesimpulan Analisis</span>
            <h3 className="ai-verdict-headline">{analysis.headline}</h3>
          </div>
          <div className="ai-verdict-right">
            <span className={`sentiment-badge ${effectiveSentiment}`}>
              {BADGE_LABELS[effectiveSentiment]}
            </span>
            <span className="ai-confidence-chip">
              Keyakinan <strong>{result.confidence.toFixed(2)}%</strong>
            </span>
          </div>
        </div>

        {/* Aspect Tags Row */}
        {analysis.aspects && analysis.aspects.length > 0 && (
          <div className="ai-aspect-row" aria-label="Aspek Ulasan Terdeteksi">
            <span className="ai-aspect-label">Aspek Terdeteksi:</span>
            {analysis.aspects.map((aspect, idx) => (
              <span key={idx} className={`ai-aspect-chip ${aspect.sentiment}`}>
                <span className={`ai-aspect-dot ${aspect.sentiment}`} />
                <span>{aspect.name}</span>
                <span className="ai-aspect-evidence">({aspect.evidence})</span>
              </span>
            ))}
          </div>
        )}

        {/* Dynamic Streaming Narrative Answer */}
        <div className="ai-narrative-body" aria-live="polite">
          {visibleParagraphs.map((para, index) => (
            <p key={index} className="ai-narrative-paragraph">
              {renderFormattedParagraph(para)}
              {isStreaming && index === visibleParagraphs.length - 1 && (
                <span className="ai-streaming-cursor" aria-hidden="true" />
              )}
            </p>
          ))}
        </div>

        {/* Pragmatic Context Highlight (When Sarcasm / Expectation Reversal / Negation is present) */}
        {analysis.pragmatic_note && (
          <div className="ai-pragmatic-callout">
            <div className="ai-pragmatic-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
              </svg>
            </div>
            <div className="ai-pragmatic-content">
              <div className="ai-pragmatic-title">{analysis.pragmatic_note.title}</div>
              <p className="ai-pragmatic-desc">{analysis.pragmatic_note.description}</p>
            </div>
          </div>
        )}

        {/* Action Toolbar under AI Narrative */}
        <div className="ai-answer-actions">
          <div className="ai-answer-actions-left">
            <button
              type="button"
              className="ai-action-btn"
              onClick={handleCopySummary}
              title="Salin penjelasan AI"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="9" y="9" width="11" height="11" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>{copied ? 'Tersalin!' : 'Salin Analisis'}</span>
            </button>

            <button
              type="button"
              className="ai-action-btn"
              onClick={() => window.print()}
              title="Cetak atau ekspor hasil analisis sebagai dokumen PDF"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <path d="M6 14h12v8H6z" />
              </svg>
              <span>Cetak / Ekspor PDF</span>
            </button>

            {isStreaming && (
              <button
                type="button"
                className="ai-action-btn"
                onClick={() => {
                  setStreamedChars(fullText.length)
                  setIsStreaming(false)
                }}
              >
                <span>Tampilkan Instan</span>
              </button>
            )}
          </div>

          <button
            type="button"
            className="ai-action-btn"
            onClick={() => setShowTechnicalDetails(prev => !prev)}
          >
            <span>
              {showTechnicalDetails ? 'Sembunyikan Bukti Matematis' : 'Lihat Bukti Matematis & Bobot Kata'}
            </span>
          </button>
        </div>

        {/* Real-Time Online Learning (partial_fit & Live Corpus Sync) */}
        {onLearnRealtime && (
          <div className="ai-realtime-learn-bar">
            <div className="ai-realtime-learn-info">
              <span className="ai-realtime-learn-title">
                Sinkronisasi &amp; Latih Model Real-Time (Online Learning <code>partial_fit</code>)
              </span>
              <span className="ai-realtime-learn-sub">
                Simpan ulasan ini ke korpus aktif &amp; perbarui bobot Naive Bayes secara instan:
              </span>
            </div>
            <div className="ai-realtime-learn-btns">
              {(['positif', 'netral', 'negatif'] as SentimentClass[]).map(cls => (
                <button
                  key={cls}
                  type="button"
                  className={`ai-learn-pill-btn ${cls} ${effectiveSentiment === cls ? 'current' : ''}`}
                  disabled={Boolean(learningLabel)}
                  onClick={() => void onLearnRealtime(cls)}
                >
                  <span>
                    {learningLabel === cls
                      ? 'Melatih...'
                      : `${effectiveSentiment === cls ? '✓ Konfirmasi' : 'Koreksi ke'} ${cls.charAt(0).toUpperCase() + cls.slice(1)}`}
                  </span>
                </button>
              ))}
            </div>
            {learnedSuccessNote && (
              <div className="ai-realtime-learn-toast" role="status">
                <span>{learnedSuccessNote}</span>
              </div>
            )}
          </div>
        )}

        {/* 4. Mathematical & Lexical Evidence Section */}
        {showTechnicalDetails && (
          <div className="ai-technical-section">
            <div className="result-grid">
              <div className="info-box">
                <div className="info-box-label">Ulasan Asli Pembeli</div>
                <p className="info-box-content">{result.inputText}</p>
              </div>
              <div className="info-box">
                <div className="info-box-label">
                  Hasil Preprocessing (Normalisasi Slang &amp; Stopword Sastrawi)
                </div>
                <p className="info-box-content mono">{result.cleanText || '(kosong)'}</p>
              </div>
            </div>

            {explanation.length > 0 && (
              <div style={{ marginTop: '14px' }}>
                <div className="info-box-label" style={{ marginBottom: '8px' }}>
                  Kontribusi Kata Kunci (Naive Bayes Log-Likelihood)
                </div>
                <div className="token-list">
                  {explanation.map((item, idx) => (
                    <span key={idx} className={`token-chip ${item.polarity}`}>
                      <span>{item.word}</span>
                      <span className="token-score">
                        {item.score > 0 ? `+${item.score}` : item.score}
                      </span>
                    </span>
                  ))}
                </div>
                <span className="card-subtitle" style={{ marginTop: '6px' }}>
                  Skor positif mendorong prediksi ke kelas Positif; skor negatif mendorong ke kelas Negatif; sistem menggabungkannya dengan aturan konteks kalimat.
                </span>
              </div>
            )}

            <div className="prob-list">
              <ProbabilityBar
                label="Probabilitas Positif"
                sentimentKey="positif"
                value={result.probabilities.positif}
              />
              <ProbabilityBar
                label="Probabilitas Netral"
                sentimentKey="netral"
                value={result.probabilities.netral}
              />
              <ProbabilityBar
                label="Probabilitas Negatif"
                sentimentKey="negatif"
                value={result.probabilities.negatif}
              />
            </div>
          </div>
        )}
      </div>

      {/* 5. Perplexity-Style "Related / Follow-up" Interactive Variations */}
      {onFollowUpSelect && analysis.follow_ups && analysis.follow_ups.length > 0 && (
        <div className="ai-followup-card">
          <div className="ai-followup-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
            </svg>
            <span>Uji Perbandingan Konteks Kalimat (Klik untuk Analisis Langsung)</span>
          </div>
          <div className="ai-followup-list">
            {analysis.follow_ups.map((itemText, idx) => (
              <button
                key={idx}
                type="button"
                className="ai-followup-item"
                onClick={() => onFollowUpSelect(itemText.trim())}
              >
                <span className="ai-followup-text">&ldquo;{itemText.trim()}&rdquo;</span>
                <span className="ai-followup-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
