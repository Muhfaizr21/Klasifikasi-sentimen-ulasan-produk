import React, { useState } from 'react';
import { SEMANTIC_FEATURES, SEMANTIC_TABS, type WorkspaceTabTarget } from './landingData';
import { SteepHeadingBlock } from './SteepHeadingBlock';
import { useSteepInView } from './useSteepInView';

interface SemanticPlatformSectionProps {
  semanticRef: React.RefObject<HTMLDivElement | null>;
  semanticInView: boolean;
  onEnterWorkspace: (initialTab?: WorkspaceTabTarget, initialQuery?: string) => void;
}

const DATA_SOURCES = [
  { name: 'BigQuery · PRDECT', col: '#4285F4', icon: '◈' },
  { name: 'Databricks · Tokopedia', col: '#FF3621', icon: '❖' },
  { name: 'Snowflake · Shopee', col: '#29B5E8', icon: '✦' },
  { name: 'Redshift · Batch CSV', col: '#8C4FFF', icon: '◫' },
  { name: 'Postgres · Live Stream', col: '#336791', icon: '◎' },
];

const METRICS_CATALOG = [
  { name: 'Indeks Reputasi Produk', formula: 'Weighted Positif vs Negatif (0–100)', status: 'Governed' },
  { name: 'Macro F1-Score Lintas Kelas', formula: 'Harmonic Mean Precision & Recall (77,28%)', status: 'Verified' },
  { name: 'Kontribusi Token Log-Prob', formula: 'Δ Log-Likelihood per N-Gram (1, 2)', status: 'Explainable' },
  { name: 'Distribusi Kategori Korpus', formula: '5.459 Sampel PRDECT-ID Tokopedia', status: 'Synced' },
];

export const SemanticPlatformSection: React.FC<SemanticPlatformSectionProps> = ({
  semanticRef,
  semanticInView,
  onEnterWorkspace,
}) => {
  const [activeSemanticTab, setActiveSemanticTab] = useState(0); // Default to "Platform semantik"
  const [, localInView] = useSteepInView();
  const isInView = semanticInView || localInView;

  return (
    <section
      id="arsitektur-semantik"
      ref={semanticRef}
      className="steep-section"
      style={{
        backgroundColor: '#121212',
        color: '#ffffff',
      }}
    >
      {/* Top-to-Bottom Subtle Sheen */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(255,255,255,0) 10%, rgba(255,255,255,0.04) 100%)',
          pointerEvents: 'none',
        }}
      />

      <div className="steep-section-container">
        <button
          type="button"
          className="steep-breadcrumb is-dark"
          onClick={() => onEnterWorkspace('katalog-api')}
        >
          <span>Platform semantik</span>
          <span style={{ opacity: 0.35 }}>›</span>
        </button>

        <SteepHeadingBlock
          isInView={isInView}
          darkMode
          size="xl"
          lines={[
            { text: 'Kirimkan metrik,' },
            { text: 'bukan sekadar dasbor' },
          ]}
          description="Platform semantik lengkap untuk mengelola dan mempublikasikan seluruh metrik sentimen Anda. Tanpa pengulangan yang sia-sia."
          cta={
            <button
              type="button"
              className="steep-btn-secondary-dark"
              onClick={() => onEnterWorkspace('katalog-api')}
            >
              <span>Buka Katalog & Playground API</span>
              <span style={{ opacity: 0.6 }}>→</span>
            </button>
          }
        />

        {/* 2-Column Dark Vertical Accordion + Responsive Architecture Diagram */}
        <div className="steep-showcase-layout" style={{ marginTop: '56px' }}>
          {/* Left Column: 5 Dark Vertical Accordion Items */}
          <div className="steep-v-tabs">
            {SEMANTIC_TABS.map((tab, idx) => {
              const isActive = activeSemanticTab === idx;
              return (
                <div key={tab.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <button
                    type="button"
                    onClick={() => setActiveSemanticTab(idx)}
                    className={`steep-v-tab-btn is-dark ${isActive ? 'is-active' : 'is-idle'}`}
                  >
                    <p className="steep-v-tab-title">{tab.label}</p>
                    <div className={`steep-v-tab-collapse ${isActive ? 'is-open' : 'is-closed'}`}>
                      <span className="steep-v-tab-desc">{tab.description}</span>
                    </div>
                    <span className="steep-v-tab-line-track is-dark">
                      <span className="steep-v-tab-line-fill is-dark" />
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Right Column: Responsive Dark Architecture Card */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>
            <div
              key={`sem-stage-${activeSemanticTab}`}
              className="steep-showcase-stage steep-dark-showcase-card"
              style={{
                backgroundImage:
                  'radial-gradient(62% 55% at 52% 95%, rgba(128, 59, 138, 0.45) 0%, rgba(76, 36, 94, 0.22) 48%, rgba(25, 24, 29, 0) 80%)',
              }}
            >
              {activeSemanticTab === 0 && (
                /* TAB 0: SEMANTIC PLATFORM ARCHITECTURE NODE DIAGRAM */
                <div style={{ width: '100%', position: 'relative' }}>
                  {/* SVG Dotted Curved Connector Lines (Desktop >= 1024px) */}
                  <svg
                    viewBox="0 0 860 420"
                    className="hidden lg:block"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                    }}
                  >
                    <path d="M 185 95 C 235 95, 240 185, 285 185" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" strokeDasharray="2 3" />
                    <path d="M 185 152 C 230 152, 240 198, 285 198" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" strokeDasharray="2 3" />
                    <path d="M 185 210 C 230 210, 245 210, 285 210" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" strokeDasharray="2 3" />
                    <path d="M 185 268 C 230 268, 240 222, 285 222" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" strokeDasharray="2 3" />
                    <path d="M 185 325 C 235 325, 240 235, 285 235" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" strokeDasharray="2 3" />

                    <path d="M 595 185 C 630 185, 635 125, 670 125" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" strokeDasharray="2 3" />
                    <path d="M 595 198 C 630 198, 635 165, 670 165" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" strokeDasharray="2 3" />
                    <path d="M 595 210 C 630 210, 635 210, 670 210" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" strokeDasharray="2 3" />
                    <path d="M 595 222 C 630 222, 635 265, 670 265" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" strokeDasharray="2 3" />
                    <path d="M 595 235 C 630 235, 635 305, 670 305" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" strokeDasharray="2 3" />
                  </svg>

                  {/* Responsive 3-Col on Desktop -> Stacked Vertical Flow on Tablet/Mobile */}
                  <div className="steep-semantic-diagram-grid">
                    {/* Column 1: 5 Data Source Pills */}
                    <div className="steep-semantic-sources-col">
                      {DATA_SOURCES.map((src) => (
                        <div
                          key={src.name}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 14px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(38, 36, 44, 0.85)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.9)',
                            minWidth: 0,
                          }}
                        >
                          <span
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 6,
                              backgroundColor: src.col,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 10,
                              color: '#fff',
                              flexShrink: 0,
                            }}
                          >
                            {src.icon}
                          </span>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {src.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Column 2: Center Elevated Semantic Platform Hub Box */}
                    <div
                      style={{
                        borderRadius: '20px',
                        backgroundColor: 'rgba(43, 39, 50, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '22px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                        minWidth: 0,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>
                        <span>◠</span>
                        <span>Sentimen</span>
                      </div>
                      <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', marginBottom: 18 }}>
                        Semantic platform
                      </div>

                      <div
                        style={{
                          borderRadius: '12px',
                          backgroundColor: 'rgba(62, 56, 72, 0.75)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          padding: '22px 14px',
                          textAlign: 'center',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#ffffff',
                          marginBottom: '10px',
                        }}
                      >
                        Semantic model (TF-IDF + MNB)
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
                        {['Context', 'Caching', 'Control'].map((sub) => (
                          <div
                            key={sub}
                            style={{
                              borderRadius: '12px',
                              backgroundColor: 'rgba(62, 56, 72, 0.75)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              padding: '18px 6px',
                              textAlign: 'center',
                              fontSize: '12px',
                              color: 'rgba(255,255,255,0.88)',
                            }}
                          >
                            {sub}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 3: Right Sentimen Outputs Card */}
                    <div className="steep-semantic-outputs-col">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                        <span>◠</span>
                        <span>Sentimen</span>
                      </div>
                      <div className="steep-semantic-outputs-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ opacity: 0.65 }}>◈</span>
                          <span>Chat</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ opacity: 0.65 }}>▤</span>
                          <span>Explore</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ opacity: 0.65 }}>◧</span>
                          <span>Reports</span>
                        </div>
                        <div
                          className="steep-semantic-outputs-divider"
                          style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', margin: '2px 0' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ opacity: 0.65 }}>⌘</span>
                          <span>API</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ opacity: 0.65 }}>❖</span>
                          <span>Integrations</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ opacity: 0.65 }}>✧</span>
                          <span>Agents</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSemanticTab === 1 && (
                /* TAB 1: SENTIMEN API */
                <div style={{ width: '100%', maxWidth: '720px' }}>
                  <div style={{ fontSize: 13, color: '#fbe1d1', marginBottom: 8 }}>REST API & JSON Endpoint</div>
                  <div style={{ fontSize: 'clamp(18px, 2.5vw, 22px)', fontFamily: 'var(--font-signifier)', marginBottom: 18 }}>
                    POST /api/predict & /api/compare-products
                  </div>
                  <pre
                    style={{
                      background: 'rgba(0,0,0,0.45)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 16,
                      padding: 20,
                      fontSize: 12.5,
                      lineHeight: 1.6,
                      color: '#e5e7eb',
                      overflowX: 'auto',
                    }}
                  >
                    {`{\n  "sentiment": "Positif",\n  "confidence": 0.9642,\n  "probabilities": { "Positif": 0.964, "Netral": 0.028, "Negatif": 0.008 },\n  "model_pipeline": "CountVectorizer(1,2) + Sastrawi + MultinomialNB",\n  "corpus_reference": "PRDECT-ID (5.459 ulasan)"\n}`}
                  </pre>
                  <div style={{ marginTop: 16 }}>
                    <button
                      type="button"
                      className="steep-btn-secondary-dark"
                      onClick={() => onEnterWorkspace('katalog-api')}
                    >
                      <span>Uji di Live API Playground</span>
                      <span style={{ opacity: 0.6 }}>→</span>
                    </button>
                  </div>
                </div>
              )}

              {activeSemanticTab === 2 && (
                /* TAB 2: METRICS CATALOG */
                <div style={{ width: '100%', maxWidth: '760px' }}>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                    Katalog Metrik Terpusat (29 Kategori Produk)
                  </div>
                  <div className="steep-win-grid-2">
                    {METRICS_CATALOG.map((cat) => (
                      <div
                        key={cat.name}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.09)',
                          padding: 18,
                          borderRadius: 14,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{cat.name}</span>
                          <span style={{ fontSize: 11, color: '#fbe1d1' }}>{cat.status}</span>
                        </div>
                        <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>{cat.formula}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 18 }}>
                    <button
                      type="button"
                      className="steep-btn-secondary-dark"
                      onClick={() => onEnterWorkspace('katalog-api')}
                    >
                      <span>Buka Katalog Metrik Terkelola</span>
                      <span style={{ opacity: 0.6 }}>→</span>
                    </button>
                  </div>
                </div>
              )}

              {activeSemanticTab === 3 && (
                /* TAB 3: DEFINE IN CODE */
                <div style={{ width: '100%', maxWidth: '720px' }}>
                  <div style={{ fontSize: 13, color: '#fbe1d1', marginBottom: 8 }}>Definisi Pipeline dalam Kode</div>
                  <pre
                    style={{
                      background: 'rgba(0,0,0,0.45)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 16,
                      padding: 20,
                      fontSize: 12.5,
                      lineHeight: 1.6,
                      color: '#e5e7eb',
                      overflowX: 'auto',
                    }}
                  >
                    {`metric: product_reputation_index\nmodel: multinomial_naive_bayes_v2\npreprocessing:\n  normalizer: sastrawi_slang_dictionary\n  ngram_range: [1, 2]\n  preserve_negation: ["tidak", "bukan", "kurang", "jangan"]\nevaluation:\n  test_accuracy: 0.8590\n  macro_f1: 0.7728`}
                  </pre>
                  <div style={{ marginTop: 16 }}>
                    <button
                      type="button"
                      className="steep-btn-secondary-dark"
                      onClick={() => onEnterWorkspace('katalog-api')}
                    >
                      <span>Lihat Kode Pipeline Scikit-Learn</span>
                      <span style={{ opacity: 0.6 }}>→</span>
                    </button>
                  </div>
                </div>
              )}

              {activeSemanticTab === 4 && (
                /* TAB 4: MANAGE IN APP */
                <div style={{ width: '100%', maxWidth: '720px' }}>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
                    Administrasi Model & Online Learning (partial_fit)
                  </div>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: 20 }}>
                    Koreksi hasil prediksi langsung dari antarmuka aplikasi dan perbarui bobot probabilitas Multinomial Naive
                    Bayes tanpa melatih ulang seluruh korpus dari nol.
                  </p>
                  <button
                    type="button"
                    className="steep-btn-secondary-dark"
                    onClick={() => onEnterWorkspace('prediksi')}
                  >
                    Buka Panel Online Learning →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4-Column Feature Strip Below Dark Showcase */}
        <div className="steep-feature-strip-4">
          {SEMANTIC_FEATURES.map((item) => (
            <div key={item.title} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                }}
              >
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: '15.5px', fontWeight: 500, color: '#ffffff', marginBottom: 4 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '14px', lineHeight: 1.48, color: 'rgba(255,255,255,0.58)' }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
