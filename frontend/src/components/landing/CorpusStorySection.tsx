import React, { useState } from 'react';
import { CUSTOMER_STORIES, type WorkspaceTabTarget } from './landingData';

interface CorpusStorySectionProps {
  onEnterWorkspace: (initialTab?: WorkspaceTabTarget, initialQuery?: string) => void;
}

export const CorpusStorySection: React.FC<CorpusStorySectionProps> = ({ onEnterWorkspace }) => {
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const currentStory = CUSTOMER_STORIES[activeStoryIndex];

  return (
    <section
      id="studi-korpus"
      className="steep-section"
      style={{ backgroundColor: '#fbe1d1', color: '#5d2a1a' }}
    >
      <div className="steep-section-container is-narrow">
        <div className="steep-story-grid">
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '0.02em', marginBottom: 24 }}>
              Kisah pelanggan & korpus ›
            </div>

            <div style={{ minHeight: '180px' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-signifier)',
                  fontWeight: 400,
                  fontSize: 'clamp(28px, 3.4vw, 44px)',
                  lineHeight: 1.24,
                  letterSpacing: '-0.66px',
                  color: '#5d2a1a',
                  margin: '0 0 18px',
                }}
              >
                {currentStory.quote}
              </h2>
              <p style={{ fontSize: '16px', color: 'rgba(93,42,26,0.78)', margin: 0 }}>
                {currentStory.author}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28, marginBottom: 40, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="steep-btn-filled"
                style={{ backgroundColor: '#5d2a1a', borderColor: '#5d2a1a' }}
                onClick={() => onEnterWorkspace('prediksi', currentStory.querySample)}
              >
                Baca studi kasus →
              </button>
              <button
                type="button"
                className="steep-btn-ghost"
                style={{ color: '#5d2a1a' }}
                onClick={() => onEnterWorkspace('evaluasi')}
              >
                Semua kategori
              </button>
            </div>

            {/* 4-Brand Selector Bar */}
            <div className="steep-story-switcher">
              <div
                className="steep-story-switcher-indicator"
                style={{
                  position: 'absolute',
                  top: '-1px',
                  left: `${activeStoryIndex * (100 / CUSTOMER_STORIES.length)}%`,
                  width: `${100 / CUSTOMER_STORIES.length}%`,
                  height: '2px',
                  backgroundColor: '#5d2a1a',
                  transition: 'left 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              />
              {CUSTOMER_STORIES.map((item, idx) => (
                <button
                  key={item.brand}
                  type="button"
                  onClick={() => setActiveStoryIndex(idx)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#5d2a1a',
                    opacity: activeStoryIndex === idx ? 1 : 0.48,
                    fontWeight: activeStoryIndex === idx ? 600 : 450,
                    fontSize: '14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    padding: '4px 8px 4px 0',
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  {item.brand}
                </button>
              ))}
            </div>
          </div>

          {/* Right Visual Stat Card */}
          <div
            key={`story-card-${activeStoryIndex}`}
            className="steep-showcase-stage"
            style={{
              borderRadius: '24px',
              backgroundColor: 'rgba(255,255,255,0.58)',
              border: '1px solid rgba(93,42,26,0.1)',
              padding: 'clamp(22px, 3.5vw, 36px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '340px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-signifier)', fontSize: '22px', color: '#5d2a1a' }}>
                {currentStory.brand}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  padding: '4px 12px',
                  borderRadius: 999,
                  backgroundColor: 'rgba(93,42,26,0.1)',
                  color: '#5d2a1a',
                }}
              >
                {currentStory.metricBadge}
              </span>
            </div>

            <div style={{ margin: '28px 0' }}>
              <div style={{ fontSize: 'clamp(42px, 6vw, 56px)', fontFamily: 'var(--font-signifier)', lineHeight: 1.05, color: '#5d2a1a' }}>
                85,90%
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(93,42,26,0.75)', marginTop: 6 }}>
                Akurasi klasifikasi terverifikasi pada pengujian 1.092 ulasan uji (rasio 80:20)
              </div>
            </div>

            <div
              style={{
                padding: '14px 16px',
                borderRadius: '16px',
                backgroundColor: '#ffffff',
                color: '#17191c',
                fontSize: '13.5px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <span style={{ color: '#52555d' }}>“{currentStory.querySample}”</span>
              <span style={{ fontWeight: 600, color: '#5d2a1a', whiteSpace: 'nowrap' }}>
                Positif →
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
