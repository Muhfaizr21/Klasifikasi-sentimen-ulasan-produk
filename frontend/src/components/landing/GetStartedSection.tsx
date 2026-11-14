import React from 'react';
import type { WorkspaceTabTarget } from './landingData';
import { SteepHeadingBlock } from './SteepHeadingBlock';
import { useSteepInView } from './useSteepInView';

interface GetStartedSectionProps {
  onEnterWorkspace: (initialTab?: WorkspaceTabTarget, initialQuery?: string) => void;
}

export const GetStartedSection: React.FC<GetStartedSectionProps> = ({ onEnterWorkspace }) => {
  const [getStartedRef, getStartedInView] = useSteepInView();

  return (
    <>
      <section ref={getStartedRef} className="steep-section">
        <div className="steep-section-container is-narrow">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap-reverse',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '48px',
            }}
          >
            <div style={{ flex: '1 1 320px', maxWidth: '520px' }}>
              <SteepHeadingBlock
                isInView={getStartedInView}
                size="lg"
                lines={[
                  { text: 'Mulai analisis sentimen' },
                  { text: 'produk Anda hari ini', italicWord: 'sentimen' },
                ]}
                description="Langsung uji kalimat ulasan produk, unggah dataset CSV, atau jalankan duel komparasi dua produk e-commerce tanpa konfigurasi rumit."
                cta={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="steep-btn-filled"
                      onClick={() => onEnterWorkspace('prediksi')}
                    >
                      Buka Ruang Kerja Analitik
                    </button>
                    <button
                      type="button"
                      className="steep-btn-ghost"
                      onClick={() => onEnterWorkspace('evaluasi')}
                    >
                      Lihat Metrik Evaluasi →
                    </button>
                  </div>
                }
              />
            </div>

            {/* Architectural Portal Illustration */}
            <div style={{ width: 'min(100%, 300px)', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
              <svg viewBox="0 0 280 300" fill="none" style={{ width: '100%', height: 'auto' }}>
                <defs>
                  <linearGradient id="portalGlow" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fbe1d1" />
                    <stop offset="55%" stopColor="#e8f0fe" />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>
                </defs>
                <path
                  d="M64 260 V116 C64 68 100 32 148 32 C196 32 232 68 232 116 V260 Z"
                  fill="url(#portalGlow)"
                  stroke="#17191c"
                  strokeWidth="1.6"
                />
                <path
                  d="M64 260 L122 238 V54 L64 116 Z"
                  fill="#ffffff"
                  stroke="#17191c"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path d="M32 260 H256" stroke="#17191c" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M52 274 H236" stroke="#979799" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <footer
        style={{
          borderTop: '1px solid rgba(23,25,28,0.06)',
          padding: '40px 20px',
          backgroundColor: '#fafafb',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            fontSize: '14px',
            color: '#777b86',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#17191c', fontWeight: 500, flexWrap: 'wrap' }}>
            <span>Sentimen</span>
            <span style={{ color: '#a3a6af' }}>·</span>
            <span style={{ fontWeight: 400, color: '#777b86' }}>
              Platform Analitik Sentimen Ulasan E-Commerce Indonesia
            </span>
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <button type="button" className="steep-nav-link" onClick={() => onEnterWorkspace('prediksi')}>
              Inspeksi Ulasan
            </button>
            <button type="button" className="steep-nav-link" onClick={() => onEnterWorkspace('komparasi')}>
              Komparasi Produk
            </button>
            <button type="button" className="steep-nav-link" onClick={() => onEnterWorkspace('batch')}>
              Batch CSV
            </button>
            <button type="button" className="steep-nav-link" onClick={() => onEnterWorkspace('evaluasi')}>
              Evaluasi Model
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};
