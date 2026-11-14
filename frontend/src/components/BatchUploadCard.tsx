import { useState } from 'react'
import { requestBatchPrediction } from '../services/sentimentApi'
import type { BatchPredictionResponse, SentimentClass } from '../types/sentiment'

const BADGE_MAP: Record<SentimentClass, string> = {
  positif: '😊 Positif',
  netral: '😐 Netral',
  negatif: '😠 Negatif',
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
    <section className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">📁 Batch Prediction (Upload CSV Ulasan)</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Klasifikasikan hingga 500 ulasan produk sekaligus secara otomatis
          </span>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={downloadSampleTemplate}
          style={{ fontSize: '0.82rem', padding: '8px 14px' }}
        >
          📄 Unduh Template CSV
        </button>
      </div>

      <div
        style={{
          border: '2px dashed var(--border-strong)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          textAlign: 'center',
          background: 'var(--surface-muted)',
          marginBottom: '16px',
        }}
      >
        <input
          type="file"
          accept=".csv"
          id="batch-file-input"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <label
          htmlFor="batch-file-input"
          style={{ cursor: 'pointer', display: 'inline-block' }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📤</div>
          <span style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'underline' }}>
            {file ? file.name : 'Klik untuk memilih file CSV ulasan'}
          </span>
          <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Kolom didukung: <code>text</code>, <code>ulasan</code>, <code>review</code>, atau kolom teks pertama.
          </p>
        </label>
      </div>

      {file && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? 'Memproses Batch Ulasan...' : `Analisis ${file.name}`}
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
            Batal
          </button>
        </div>
      )}

      {error && <div className="error-banner">⚠️ {error}</div>}

      {result && (
        <div style={{ marginTop: '20px' }}>
          {/* Summary KPIs */}
          <div className="kpi-grid" style={{ marginBottom: '18px' }}>
            <div className="kpi-card">
              <div className="kpi-label">Total Diproses</div>
              <div className="kpi-value">{result.total}</div>
              <div className="kpi-sub">Baris ulasan berhasil dianalisis</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Ulasan Positif</div>
              <div className="kpi-value" style={{ color: 'var(--pos-bar)' }}>
                {result.distribution.positif}
              </div>
              <div className="kpi-sub">{result.percentages.positif}% dari total</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Ulasan Netral</div>
              <div className="kpi-value" style={{ color: 'var(--neu-bar)' }}>
                {result.distribution.netral}
              </div>
              <div className="kpi-sub">{result.percentages.netral}% dari total</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Ulasan Negatif</div>
              <div className="kpi-value" style={{ color: 'var(--neg-bar)' }}>
                {result.distribution.negatif}
              </div>
              <div className="kpi-sub">{result.percentages.negatif}% dari total</div>
            </div>
          </div>

          {/* Action to download results */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
              Pratinjau Hasil Prediksi ({result.results.length} ulasan)
            </h4>
            <button
              type="button"
              className="btn-primary"
              onClick={downloadResultsCSV}
              style={{ fontSize: '0.82rem', padding: '8px 16px', width: 'auto' }}
            >
              ⬇️ Unduh Hasil Lengkap (.CSV)
            </button>
          </div>

          {/* Table of results */}
          <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>No</th>
                  <th>Teks Ulasan</th>
                  <th style={{ width: '110px' }}>Prediksi</th>
                  <th style={{ width: '100px' }}>Keyakinan</th>
                </tr>
              </thead>
              <tbody>
                {result.results.slice(0, 50).map((row, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td style={{ fontSize: '0.86rem' }}>{row.text}</td>
                    <td>
                      <span className={`sentiment-badge ${row.label}`} style={{ fontSize: '0.74rem' }}>
                        {BADGE_MAP[row.label]}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                      {row.confidence.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.results.length > 50 && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '6px' }}>
              *Menampilkan 50 baris pertama. Unduh file CSV untuk melihat seluruh {result.results.length} ulasan.
            </p>
          )}
        </div>
      )}
    </section>
  )
}
