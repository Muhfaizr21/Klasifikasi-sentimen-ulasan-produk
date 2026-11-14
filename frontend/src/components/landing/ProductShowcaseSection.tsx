import React, { useState } from 'react';
import { PRODUCT_TABS, type WorkspaceTabTarget } from './landingData';
import { SteepHeadingBlock } from './SteepHeadingBlock';
import { useSteepInView } from './useSteepInView';

interface ProductShowcaseSectionProps {
  onEnterWorkspace: (initialTab?: WorkspaceTabTarget, initialQuery?: string) => void;
}

export const ProductShowcaseSection: React.FC<ProductShowcaseSectionProps> = ({
  onEnterWorkspace,
}) => {
  const [activeProductTab, setActiveProductTab] = useState(2); // Default to "Laporan"
  const [productRef, productInView] = useSteepInView();

  const currentTab = PRODUCT_TABS[activeProductTab];

  return (
    <section
      ref={productRef}
      className="steep-section"
      style={{ backgroundColor: '#FAFAFB' }}
    >
      {/* Ambient Radial Glow Behind Right Window */}
      <div
        style={{
          position: 'absolute',
          left: '63%',
          top: '61%',
          width: '920px',
          height: '920px',
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(50% 50% at 50% 50%, rgba(226, 240, 198, 0.72) 0%, rgba(251, 225, 209, 0.45) 45%, rgba(250, 250, 251, 0) 75%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div className="steep-section-container">
        <button
          type="button"
          className="steep-breadcrumb"
          onClick={() => onEnterWorkspace('prediksi')}
        >
          <span>Produk</span>
          <span style={{ opacity: 0.35 }}>›</span>
        </button>

        <SteepHeadingBlock
          isInView={productInView}
          size="xl"
          lines={[{ text: 'Libatkan setiap tim' }]}
          description="Alur kerja berbasis AI yang membuka analisis mendalam dan pelaporan terukur bagi seluruh pengguna."
          cta={
            <button
              type="button"
              className="steep-btn-secondary"
              onClick={() => onEnterWorkspace(currentTab.ctaTab)}
            >
              <span>Pelajari lebih lanjut</span>
              <span style={{ opacity: 0.55 }}>→</span>
            </button>
          }
        />

        {/* 2-Column Vertical Accordion + Responsive App Window Showcase */}
        <div className="steep-showcase-layout" style={{ marginTop: '56px' }}>
          {/* Left Column: 6 Vertical Accordion Items */}
          <div className="steep-v-tabs">
            {PRODUCT_TABS.map((tab, idx) => {
              const isActive = activeProductTab === idx;
              return (
                <div key={tab.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <button
                    type="button"
                    onClick={() => setActiveProductTab(idx)}
                    className={`steep-v-tab-btn ${isActive ? 'is-active' : 'is-idle'}`}
                  >
                    <p className="steep-v-tab-title">{tab.label}</p>
                    <div className={`steep-v-tab-collapse ${isActive ? 'is-open' : 'is-closed'}`}>
                      <span className="steep-v-tab-desc">{tab.description}</span>
                    </div>
                    <span className="steep-v-tab-line-track">
                      <span className="steep-v-tab-line-fill" />
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right Column: Responsive Desktop App Window */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>
            <div key={`prod-stage-${activeProductTab}`} className="steep-showcase-stage steep-app-window">
              {/* Left Mini Sidebar (Hidden automatically on <= 768px via .steep-app-sidebar) */}
              <div className="steep-app-sidebar">
                <div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 18, paddingLeft: 4 }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#e5e5e7' }} />
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#e5e5e7' }} />
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#e5e5e7' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ width: 16, height: 16, borderRadius: 4, background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)', display: 'inline-block' }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#17191c' }}>Codify</span>
                      <span style={{ fontSize: 10, color: '#979799' }}>⌄</span>
                    </div>
                    <span style={{ fontSize: 11, color: '#979799' }}>⌕</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      { label: 'Beranda', icon: '⌂', active: activeProductTab === 0 },
                      { label: 'Model', icon: '◈', active: activeProductTab === 3 },
                      { label: 'Metrik', icon: '▤', active: activeProductTab === 1 || activeProductTab === 4 },
                      { label: 'Entitas', icon: '❖', active: false },
                      { label: 'Laporan', icon: '☰', active: activeProductTab === 2 },
                      { label: 'Peta', icon: '◫', active: activeProductTab === 5 },
                    ].map((nav) => (
                      <div
                        key={nav.label}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 8px',
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: nav.active ? 500 : 420,
                          backgroundColor: nav.active ? '#efeff1' : 'transparent',
                          color: nav.active ? '#17191c' : '#686b73',
                        }}
                      >
                        <span style={{ width: 13, opacity: 0.75 }}>{nav.icon}</span>
                        <span>{nav.label}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontSize: 10, color: '#979799', padding: '0 8px 6px' }}>Tim</div>
                    {[
                      { c: 'L', name: 'Eksekutif', bg: '#fde2d2', col: '#8a3c1b' },
                      { c: 'P', name: 'Produk', bg: '#dce8fc', col: '#1e4276' },
                      { c: 'S', name: 'Penjualan', bg: '#d9f0e1', col: '#1b5435' },
                      { c: '⊞', name: 'Semua tim', bg: 'transparent', col: '#686b73' },
                    ].map((tm) => (
                      <div key={tm.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', fontSize: 11.5, color: '#686b73' }}>
                        <span style={{ width: 15, height: 15, borderRadius: 3, background: tm.bg, color: tm.col, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 600 }}>
                          {tm.c}
                        </span>
                        <span>{tm.name}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 10, color: '#979799', padding: '0 8px 6px' }}>Favorit</div>
                    {[
                      { icon: '◫', name: 'Laporan kota', col: '#8b5cf6' },
                      { icon: '↗', name: 'Rekap mingguan', col: '#10b981' },
                      { icon: '✓', name: 'Inisiatif', col: '#3b82f6' },
                      { icon: '●', name: 'Pengguna', col: '#6366f1' },
                    ].map((fav) => (
                      <div key={fav.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', fontSize: 11, color: '#686b73' }}>
                        <span style={{ color: fav.col, fontSize: 10 }}>{fav.icon}</span>
                        <span>{fav.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Main Content Canvas */}
              <div className="steep-app-main">
                {/* Window Top Header Bar */}
                <div className="steep-app-topbar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#777b86', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    <span>‹</span>
                    <span>{currentTab.label}</span>
                    <span>/</span>
                    <span style={{ color: '#8b5cf6' }}>★</span>
                    <span style={{ color: '#17191c', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {activeProductTab === 2
                        ? 'Laporan eksekutif'
                        : activeProductTab === 0
                        ? 'Analisis sentimen kuartal'
                        : activeProductTab === 1
                        ? 'Eksplorasi korpus PRDECT-ID'
                        : activeProductTab === 3
                        ? 'Inspeksi baris ulasan'
                        : activeProductTab === 4
                        ? 'Target akurasi & F1'
                        : 'Peta distribusi marketplace'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {[
                        { l: 'S', bg: '#4ccb7a' },
                        { l: 'T', bg: '#f58442' },
                        { l: 'E', bg: '#4a85e8' },
                      ].map((av, i) => (
                        <span
                          key={av.l}
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: av.bg,
                            color: '#fff',
                            fontSize: 9.5,
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1.5px solid #fff',
                            marginLeft: i > 0 ? -5 : 0,
                          }}
                        >
                          {av.l}
                        </span>
                      ))}
                    </div>
                    <span style={{ color: '#52555d', fontSize: 11.5 }}>⧩ Filter</span>
                    <span style={{ color: '#52555d', fontSize: 11.5 }}>↑ Bagikan</span>
                  </div>
                </div>

                {/* Dynamic Body Content */}
                <div className="steep-app-body">
                  {activeProductTab === 2 && (
                    /* TAB 2: REPORTS ("Leadership report") */
                    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                      <div style={{ color: '#7c5dfa', fontSize: '24px', marginBottom: 6 }}>★</div>
                      <h3 style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 600, color: '#17191c', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
                        Laporan eksekutif
                      </h3>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
                        <span style={{ fontSize: 11, color: '#52555d', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 999, padding: '3px 10px' }}>
                          ⊕ Periode waktu ⌄
                        </span>
                        <span style={{ fontSize: 11, color: '#52555d', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 999, padding: '3px 10px' }}>
                          ⊕ Kategori produk ⌄
                        </span>
                        <span style={{ fontSize: 11, color: '#52555d', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 999, padding: '3px 8px' }}>
                          +
                        </span>
                      </div>

                      <div style={{ position: 'relative', marginBottom: 22 }}>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#17191c', marginBottom: 6 }}>
                          Ringkasan eksekutif
                        </div>
                        <p style={{ fontSize: '12px', lineHeight: 1.55, color: '#3f424a', margin: 0, maxWidth: '580px' }}>
                          Secara keseluruhan, indeks reputasi kuartal keempat meningkat kuat sebesar 10,4% dibandingkan tahun lalu.
                          Pertumbuhan didorong oleh momentum kepuasan yang solid pada pembeli baru maupun pelanggan berulang. Kategori
                          Elektronik menyumbang sekitar sepertiga dari total ulasan positif.
                        </p>
                        <div style={{ position: 'absolute', left: '198px', bottom: '-18px', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                          <span style={{ fontSize: 10, color: '#4a85e8' }}>↖</span>
                          <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#6ba1f7', color: '#fff', fontSize: 9, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            A
                          </span>
                        </div>
                      </div>

                      {/* Responsive 2-Col -> 1-Col on Mobile */}
                      <div className="steep-win-grid-2" style={{ marginBottom: 16 }}>
                        <div
                          style={{
                            borderRadius: '14px',
                            border: '1.5px solid #5ec27f',
                            padding: '16px 18px',
                            position: 'relative',
                            minHeight: '190px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#17191c' }}>Ulasan Terverifikasi</div>
                            <div style={{ fontSize: '10.5px', color: '#979799' }}>3 bulan terakhir</div>
                          </div>

                          <div style={{ textAlign: 'center', margin: '16px 0' }}>
                            <div style={{ fontSize: '34px', fontWeight: 450, color: '#17191c', letterSpacing: '-0.03em' }}>
                              42.3K
                            </div>
                            <div style={{ fontSize: '11px', color: '#18794e', marginTop: 2 }}>
                              ↑ 10,4% <span style={{ color: '#979799' }}>vs tahun lalu</span>
                            </div>
                          </div>

                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                            <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#4ccb7a', color: '#fff', fontSize: 8.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                              JL
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            borderRadius: '14px',
                            border: '1px solid rgba(23,25,28,0.08)',
                            padding: '16px 18px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#17191c' }}>Sentimen per marketplace</div>
                            <div style={{ fontSize: '10.5px', color: '#979799', marginBottom: 8 }}>Tahun berjalan</div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: '9.5px', color: '#777b86' }}>
                              {[
                                { n: 'ID-TKP', c: '#4ccb7a' },
                                { n: 'ID-SHP', c: '#6ba1f7' },
                                { n: 'ID-LZD', c: '#a47cf3' },
                                { n: 'ID-BLI', c: '#f2748d' },
                                { n: 'ID-ZLR', c: '#f5b042' },
                                { n: 'ID-SOC', c: '#70d6c2' },
                              ].map((lg) => (
                                <span key={lg.n} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: lg.c }} />
                                  {lg.n}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '105px', paddingTop: 12, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                            {[
                              { m: 'Okt', bars: [12, 10, 14, 16, 18] },
                              { m: 'Nov', bars: [14, 12, 18, 20, 24] },
                              { m: 'Des', bars: [10, 12, 14, 15, 18] },
                            ].map((col) => (
                              <div key={col.m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: '44px', display: 'flex', flexDirection: 'column', borderRadius: '4px 4px 0 0', overflow: 'hidden' }}>
                                  <div style={{ height: col.bars[0], background: '#70d6c2' }} />
                                  <div style={{ height: col.bars[1], background: '#f5b042' }} />
                                  <div style={{ height: col.bars[2], background: '#f2748d' }} />
                                  <div style={{ height: col.bars[3], background: '#a47cf3' }} />
                                  <div style={{ height: col.bars[4], background: '#6ba1f7' }} />
                                </div>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '9.5px', color: '#979799', paddingTop: 4 }}>
                            <span>Okt</span>
                            <span>Nov</span>
                            <span>Des</span>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          borderRadius: '14px',
                          border: '1px solid rgba(23,25,28,0.08)',
                          padding: '14px 18px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 8,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#17191c' }}>Retensi sentimen per kohort</div>
                          <div style={{ fontSize: '10.5px', color: '#979799' }}>Tahun berjalan</div>
                        </div>
                        <span style={{ fontSize: '10.5px', color: '#777b86' }}>Bulan sejak peluncuran</span>
                      </div>
                    </div>
                  )}

                  {activeProductTab === 0 && (
                    /* TAB 0: AI */
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                        <div style={{ background: '#f3f3f5', borderRadius: 18, padding: '8px 18px', fontSize: 12.5, color: '#17191c' }}>
                          Apa penyebab utama keluhan pengiriman pada kategori Elektronik bulan ini?
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: '#979799', marginBottom: 12 }}>Penalaran AI ›</div>
                      <div style={{ borderRadius: 16, border: '1px solid rgba(0,0,0,0.08)', padding: 20, marginBottom: 18 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Distribusi probabilitas & token kunci</div>
                        <p style={{ fontSize: 12.5, color: '#52555d', lineHeight: 1.5, margin: '0 0 14px' }}>
                          Model Multinomial Naive Bayes mengidentifikasi 3 token pendorong utama pada ulasan negatif:
                          <strong> “terlambat”</strong>, <strong>“kemasan penyok”</strong>, dan <strong>“kurir”</strong>.
                        </p>
                        <div className="steep-win-grid-3">
                          {[
                            { t: 'Akurasi Model', v: '85,90%', c: '#18794e' },
                            { t: 'Macro F1-Score', v: '77,28%', c: '#3b76dd' },
                            { t: 'Korpus Dianalisis', v: '5.459', c: '#17191c' },
                          ].map((k) => (
                            <div key={k.t} style={{ background: '#fafafb', padding: 12, borderRadius: 10 }}>
                              <div style={{ fontSize: 11, color: '#777b86' }}>{k.t}</div>
                              <div style={{ fontSize: 20, fontWeight: 600, color: k.c, marginTop: 2 }}>{k.v}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button type="button" className="steep-btn-filled is-sm" onClick={() => onEnterWorkspace('prediksi')}>
                        Coba Inspeksi AI Sekarang →
                      </button>
                    </div>
                  )}

                  {activeProductTab === 1 && (
                    /* TAB 1: EXPLORE */
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
                        <div>
                          <div style={{ fontSize: 18, fontWeight: 600 }}>Tren Kepuasan Lintas 29 Kategori</div>
                          <div style={{ fontSize: 12, color: '#777b86' }}>Dikelompokkan berdasarkan sentimen Positif vs Negatif</div>
                        </div>
                        <span style={{ fontSize: 11.5, background: '#eef4fe', color: '#3b76dd', padding: '4px 12px', borderRadius: 999, fontWeight: 500 }}>
                          Live Korpus PRDECT-ID
                        </span>
                      </div>
                      <svg viewBox="0 0 640 210" style={{ width: '100%', height: 'auto', marginBottom: 16 }}>
                        {[30, 80, 130, 180].map((y) => (
                          <line key={y} x1="0" y1={y} x2="620" y2={y} stroke="rgba(0,0,0,0.06)" />
                        ))}
                        <path d="M20 140 C120 120, 200 70, 310 85 C420 100, 500 40, 600 32" fill="none" stroke="#4a85e8" strokeWidth="2.4" />
                        <path d="M20 165 C120 155, 200 135, 310 142 C420 148, 500 115, 600 108" fill="none" stroke="#efb095" strokeWidth="2" />
                      </svg>
                      <button type="button" className="steep-btn-filled is-sm" onClick={() => onEnterWorkspace('prediksi')}>
                        Buka Eksplorasi Ulasan →
                      </button>
                    </div>
                  )}

                  {activeProductTab === 3 && (
                    /* TAB 3: DRILL DOWN */
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Bedah Baris Ulasan & Kontribusi Token</div>
                      <div style={{ fontSize: 12, color: '#777b86', marginBottom: 16 }}>
                        Inspeksi tingkat baris pada dataset PRDECT-ID Tokopedia & Batch CSV
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                        {[
                          { prod: 'TWS Bluetooth Earphone', rev: 'Suara jernih bass mantap pengiriman cepat', sent: 'Positif (98,4%)' },
                          { prod: 'Kaos Katun Bambu Pria', rev: 'Bahan adem jahitan rapi ukuran pas di badan', sent: 'Positif (96,1%)' },
                          { prod: 'Wajan Anti Lengket 24cm', rev: 'Lapisan mengelupas setelah dua kali dipakai', sent: 'Negatif (94,8%)' },
                        ].map((r, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, padding: '12px 16px', borderRadius: 12, background: '#fafafb', fontSize: 12.5 }}>
                            <div>
                              <div style={{ fontWeight: 600, color: '#17191c' }}>{r.prod}</div>
                              <div style={{ color: '#52555d', marginTop: 2 }}>“{r.rev}”</div>
                            </div>
                            <span style={{ fontWeight: 600, color: r.sent.startsWith('Pos') ? '#18794e' : '#b42318' }}>{r.sent}</span>
                          </div>
                        ))}
                      </div>
                      <button type="button" className="steep-btn-filled is-sm" onClick={() => onEnterWorkspace('batch')}>
                        Buka Batch CSV →
                      </button>
                    </div>
                  )}

                  {activeProductTab === 4 && (
                    /* TAB 4: TARGETS */
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Pencapaian Target PRD & Evaluasi Model</div>
                      <div style={{ fontSize: 12, color: '#777b86', marginBottom: 18 }}>
                        Perbandingan metrik aktual terhadap ambang batas minimum spesifikasi akademik
                      </div>
                      <div className="steep-win-grid-2" style={{ marginBottom: 18 }}>
                        <div style={{ padding: 18, borderRadius: 14, border: '1px solid rgba(0,0,0,0.08)' }}>
                          <div style={{ fontSize: 12, color: '#777b86' }}>Macro F1-Score (Target ≥ 70,0%)</div>
                          <div style={{ fontSize: 32, fontWeight: 600, color: '#18794e', margin: '6px 0' }}>77,28%</div>
                          <div style={{ fontSize: 11.5, color: '#18794e' }}>✓ Melampaui target +7,28%</div>
                        </div>
                        <div style={{ padding: 18, borderRadius: 14, border: '1px solid rgba(0,0,0,0.08)' }}>
                          <div style={{ fontSize: 12, color: '#777b86' }}>Akurasi Pengujian (1.092 sampel)</div>
                          <div style={{ fontSize: 32, fontWeight: 600, color: '#17191c', margin: '6px 0' }}>85,90%</div>
                          <div style={{ fontSize: 11.5, color: '#52555d' }}>Weighted F1: 85,62%</div>
                        </div>
                      </div>
                      <button type="button" className="steep-btn-filled is-sm" onClick={() => onEnterWorkspace('evaluasi')}>
                        Lihat Evaluasi Lengkap →
                      </button>
                    </div>
                  )}

                  {activeProductTab === 5 && (
                    /* TAB 5: MAPS */
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Peta Distribusi 8 Marketplace Indonesia</div>
                      <div style={{ fontSize: 12, color: '#777b86', marginBottom: 18 }}>
                        Cakupan penarikan ulasan langsung (live scraper) dan korpus terverifikasi
                      </div>
                      <div className="steep-win-grid-4" style={{ marginBottom: 20 }}>
                        {[
                          { m: 'Tokopedia', c: '5.459 ulasan', col: '#18794e' },
                          { m: 'Shopee ID', c: 'Live Stream', col: '#d9532f' },
                          { m: 'Lazada', c: 'Live Stream', col: '#2b4c9b' },
                          { m: 'Blibli', c: 'Live Stream', col: '#0072bc' },
                          { m: 'ZALORA', c: 'Fashion', col: '#17191c' },
                          { m: 'Sociolla', c: 'Kecantikan', col: '#d45b87' },
                          { m: 'Eraspace', c: 'Gadget', col: '#1e3a8a' },
                          { m: 'Ruparupa', c: 'Rumah Tangga', col: '#d97706' },
                        ].map((mp) => (
                          <div key={mp.m} style={{ padding: 14, borderRadius: 12, background: '#fafafb', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: mp.col }}>{mp.m}</div>
                            <div style={{ fontSize: 11, color: '#777b86', marginTop: 4 }}>{mp.c}</div>
                          </div>
                        ))}
                      </div>
                      <button type="button" className="steep-btn-filled is-sm" onClick={() => onEnterWorkspace('prediksi')}>
                        Coba Tarik Ulasan Live →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
