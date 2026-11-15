import { useState } from 'react'
import { requestBatchPrediction } from '../services/sentimentApi'
import type { BatchPredictionResponse, SentimentClass } from '../types/sentiment'
import { HelpButton } from './HelpTooltipModal'

const BADGE_MAP: Record<SentimentClass, string> = {
  positif: 'Positif',
  netral: 'Netral',
  negatif: 'Negatif',
}

export function BatchUploadCard() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<BatchPredictionResponse | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Pilih file CSV ulasan terlebih dahulu.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await requestBatchPrediction(file)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memproses batch ulasan.')
    } finally {
      setLoading(false)
    }
  }

  const downloadSampleTemplate = () => {
    const csvContent =
      'ulasan\n' +
      'Barang original 100%, pengemasan rapi dan cepat sampai!\n' +
      'Kualitas standar sesuai harga, lumayan lah buat cadangan.\n' +
      'Barang rusak parah saat dibuka, seller tidak mau tanggung jawab penipu!\n' +
      'Bahan adem dan jahitan rapi, recommended seller bintang lima.\n' +
      'Pengiriman agak lambat tapi barangnya bagus tidak mengecewakan.\n'

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'template_ulasan_produk.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadResultsCSV = () => {
    if (!result) return

    let csv = 'Ulasan,Sentimen,Keyakinan (%),Positif (%),Netral (%),Negatif (%)\n'
    for (const item of result.results) {
      const escapedText = `"${item.text.replace(/"/g, '""')}"`
      csv += `${escapedText},${item.label},${item.confidence.toFixed(2)},${item.probabilities.positif.toFixed(2)},${item.probabilities.netral.toFixed(2)},${item.probabilities.negatif.toFixed(2)}\n`
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `hasil_analisis_sentimen_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <section className="card" aria-label="Analisis Batch CSV">
      <div className="card-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h2 className="card-title">Analisis Batch Ulasan Produk (CSV)</h2>
            <HelpButton topicId="batch_upload_overview" />
          </div>
          <span className="card-subtitle">
            Klasifikasikan hingga 500 baris ulasan pelanggan sekaligus dan unduh rekapitulasi CSV
          </span>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={downloadSampleTemplate}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Unduh Contoh CSV
        </button>
      </div>

      <div className="upload-zone">
        <input
          type="file"
          accept=".csv"
          id="batch-file-input"
          className="sr-only"
          onChange={handleFileChange}
        />
        <label
          htmlFor="batch-file-input"
          style={{ cursor: 'pointer', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-graphite)" strokeWidth="1.5" aria-hidden="true">
            <path d="M9 17v-6m0 0L6 14m3-3l3 3m3-10H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V9l-5-5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontWeight: 500, color: 'var(--color-deep-teal)', textDecoration: 'underline' }}>
            {file ? file.name : 'Pilih file CSV ulasan dari perangkat Anda'}
          </span>
          <span className="card-subtitle">
            Kolom yang dikenali otomatis: <code>ulasan</code>, <code>text</code>, <code>review</code>, atau kolom teks pertama.
          </span>
        </label>
      </div>

      {file && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? 'Memproses Batch Ulasan...' : `Proses File ${file.name}`}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setFile(null)
              setResult(null)
              setError(null)
            }}
            disabled={loading}
          >
            Batalkan Pilihan
          </button>
        </div>
      )}

      {error && (
        <div className="error-banner" role="alert">
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div style={{ marginTop: '18px' }}>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                <div className="kpi-label">Total Ulasan Diproses</div>
                <HelpButton topicId="batch_kpi_summary" />
              </div>
              <div className="kpi-value">{result.total}</div>
              <div className="kpi-sub">Baris data valid</div>
            </div>
            <div className="kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                <div className="kpi-label">Sentimen Positif</div>
                <HelpButton topicId="batch_kpi_summary" />
              </div>
              <div className="kpi-value" style={{ color: 'var(--pos-text)' }}>
                {result.distribution.positif}
              </div>
              <div className="kpi-sub">{result.percentages.positif}% dari total</div>
            </div>
            <div className="kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                <div className="kpi-label">Sentimen Netral</div>
                <HelpButton topicId="batch_kpi_summary" />
              </div>
              <div className="kpi-value" style={{ color: 'var(--neu-text)' }}>
                {result.distribution.netral}
              </div>
              <div className="kpi-sub">{result.percentages.netral}% dari total</div>
            </div>
            <div className="kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                <div className="kpi-label">Sentimen Negatif</div>
                <HelpButton topicId="batch_kpi_summary" />
              </div>
              <div className="kpi-value" style={{ color: 'var(--neg-text)' }}>
                {result.distribution.negatif}
              </div>
              <div className="kpi-sub">{result.percentages.negatif}% dari total</div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="card-title" style={{ fontSize: '0.9rem' }}>
                Tabel Hasil Prediksi ({result.results.length} Ulasan)
              </h3>
              <HelpButton topicId="batch_results_table" />
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={downloadResultsCSV}
            >
              Ekspor Laporan Hasil (.CSV)
            </button>
          </div>

          <div className="table-responsive" style={{ maxHeight: '360px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '48px' }}>No</th>
                  <th>Teks Ulasan</th>
                  <th style={{ width: '110px' }}>Sentimen</th>
                  <th style={{ width: '96px' }}>Keyakinan</th>
                </tr>
              </thead>
              <tbody>
                {result.results.slice(0, 50).map((row, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{row.text}</td>
                    <td>
                      <span className={`sentiment-badge ${row.label}`}>
                        {BADGE_MAP[row.label]}
                      </span>
                    </td>
                    <td>{row.confidence.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.results.length > 50 && (
            <p className="card-subtitle" style={{ textAlign: 'center', marginTop: '8px' }}>
              Menampilkan 50 baris pertama. Ekspor laporan CSV untuk memeriksa seluruh {result.results.length} baris.
            </p>
          )}
        </div>
      )}
    </section>
  )
}
