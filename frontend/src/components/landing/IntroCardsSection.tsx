import React, { useState } from 'react';
import { SteepHeadingBlock } from './SteepHeadingBlock';
import { useSteepInView } from './useSteepInView';

const IntroIllustrationOne: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => (
  <svg viewBox="0 0 250 220" fill="none" style={{ width: '62%', height: 'auto', overflow: 'visible' }}>
    <g
      style={{
        transform: isPlaying ? 'translate(8px, 6px) rotate(-1deg)' : 'translate(0px, 0px) rotate(0deg)',
        transition: 'transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)',
        transformOrigin: 'center center',
      }}
    >
      <path
        d="M35 162 L125 198 L215 162 L125 126 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="rgba(255,255,255,0.28)"
      />
      <path d="M35 162 V176 L125 212 L215 176 V162" stroke="currentColor" strokeWidth="1.6" />
      <line x1="80" y1="144" x2="170" y2="180" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
    </g>
    <g
      style={{
        transform: isPlaying
          ? 'translate(-18px, 12px) rotate(-3deg)'
          : 'translate(-4px, -4px) rotate(0deg)',
        transition: 'transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)',
        transformOrigin: 'center center',
      }}
    >
      <rect
        x="48"
        y="84"
        width="104"
        height="66"
        rx="12"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="rgba(255,255,255,0.55)"
      />
      <path d="M64 128 L86 108 L108 118 L134 96" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="134" cy="96" r="3.5" fill="currentColor" />
    </g>
    <g
      style={{
        transform: isPlaying ? 'translate(-18px, -12px)' : 'translate(0px, 0px)',
        transition: 'transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)',
        transformOrigin: 'center center',
      }}
    >
      <ellipse cx="176" cy="46" rx="26" ry="9" stroke="currentColor" strokeWidth="1.6" fill="rgba(255,255,255,0.65)" />
      <path
        d="M150 46 V108 C150 113 161.6 117 176 117 C190.4 117 202 113 202 108 V46"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="rgba(255,255,255,0.45)"
      />
      <path d="M150 76 C150 81 161.6 85 176 85 C190.4 85 202 81 202 76" stroke="currentColor" strokeWidth="1.4" />
    </g>
  </svg>
);

const IntroIllustrationTwo: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => (
  <svg viewBox="0 0 250 220" fill="none" style={{ width: '62%', height: 'auto', overflow: 'visible' }}>
    <g
      style={{
        transform: isPlaying ? 'translate(-12px, -8px) rotate(-2deg)' : 'translate(0, 0)',
        transition: 'transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <rect
        x="42"
        y="46"
        width="126"
        height="86"
        rx="14"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="rgba(255,255,255,0.52)"
      />
      <line x1="62" y1="72" x2="128" y2="72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="62" y1="90" x2="146" y2="90" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="62" y1="106" x2="112" y2="106" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </g>
    <g
      style={{
        transform: isPlaying ? 'translate(14px, 12px) rotate(2.5deg)' : 'translate(0, 0)',
        transition: 'transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <rect
        x="88"
        y="96"
        width="124"
        height="84"
        rx="14"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="rgba(255,255,255,0.78)"
      />
      <circle cx="122" cy="138" r="18" stroke="currentColor" strokeWidth="1.8" />
      <path d="M122 120 A18 18 0 1 1 106 146" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <line x1="152" y1="128" x2="192" y2="128" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="152" y1="146" x2="180" y2="146" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
    </g>
  </svg>
);

const IntroIllustrationThree: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => (
  <svg viewBox="0 0 250 220" fill="none" style={{ width: '62%', height: 'auto', overflow: 'visible' }}>
    <g
      style={{
        transform: isPlaying ? 'translate(0px, -10px) scale(1.04)' : 'translate(0, 0) scale(1)',
        transition: 'transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)',
        transformOrigin: 'center center',
      }}
    >
      <circle cx="125" cy="108" r="56" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="125" cy="108" r="34" stroke="currentColor" strokeWidth="1.6" fill="rgba(255,255,255,0.55)" />
      <path d="M114 108 L122 116 L138 100" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <g
      style={{
        transform: isPlaying ? 'translate(-14px, 10px)' : 'translate(0, 0)',
        transition: 'transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <rect x="38" y="138" width="64" height="34" rx="10" stroke="currentColor" strokeWidth="1.5" fill="rgba(255,255,255,0.75)" />
      <text x="70" y="159" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="600">
        85,9%
      </text>
    </g>
    <g
      style={{
        transform: isPlaying ? 'translate(14px, -12px)' : 'translate(0, 0)',
        transition: 'transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <rect x="148" y="44" width="68" height="34" rx="10" stroke="currentColor" strokeWidth="1.5" fill="rgba(255,255,255,0.75)" />
      <text x="182" y="65" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="600">
        +12,4%
      </text>
    </g>
  </svg>
);

const INTRO_CARDS = [
  {
    id: 0,
    title: 'Dibangun di atas metrik',
    description:
      'Bukan sekadar dasbor statis. Tim data mengirimkan metrik sentimen terukur yang mentenagai seluruh analisis dan pelaporan.',
    activeBg: '#fbe1d1',
    activeText: '#5d2a1a',
    Illustration: IntroIllustrationOne,
  },
  {
    id: 1,
    title: 'Ditenagai oleh AI',
    description:
      'Dengan alur kerja berbasis AI di Sentimen, siapa pun dapat melakukan analisis mendalam dan membuat laporan dari metrik tepercaya.',
    activeBg: '#dce8f8',
    activeText: '#163252',
    Illustration: IntroIllustrationTwo,
  },
  {
    id: 2,
    title: 'Dirancang untuk kolaborasi',
    description:
      'Tim analis bekerja lebih cerdas. Tim produk bergerak lebih cepat. Seluruh organisasi membangun budaya keputusan berbasis data.',
    activeBg: '#dfece3',
    activeText: '#193b29',
    Illustration: IntroIllustrationThree,
  },
];

export const IntroCardsSection: React.FC = () => {
  const [activeIntroCard, setActiveIntroCard] = useState(0);
  const [introRef, introInView] = useSteepInView();

  return (
    <section id="fitur-produk" ref={introRef} className="steep-section">
      <div className="steep-section-container">
        <div style={{ marginBottom: '56px' }}>
          <SteepHeadingBlock
            isInView={introInView}
            centerAligned
            size="lg"
            lines={[
              { text: 'Analitik akhirnya berbicara' },
              { text: 'dalam bahasa yang sama', italicWord: 'sama' },
            ]}
          />
        </div>

        <div
          className={`steep-intro-cards-row ${
            activeIntroCard === 0 ? 'active-0' : activeIntroCard === 2 ? 'active-2' : ''
          }`}
        >
          {INTRO_CARDS.map((card, index) => {
            const isActive = activeIntroCard === index;
            const shiftClass =
              !isActive && activeIntroCard === 0
                ? 'shift-right-sm'
                : !isActive && activeIntroCard === 1
                ? index === 0
                  ? 'shift-left-lg'
                  : 'shift-right-lg'
                : !isActive && activeIntroCard === 2
                ? 'shift-left-sm'
                : '';

            return (
              <div
                key={card.id}
                onMouseEnter={() => setActiveIntroCard(index)}
                onClick={() => setActiveIntroCard(index)}
                className={`steep-intro-card ${isActive ? 'is-active' : 'is-idle'} ${shiftClass}`}
                style={{
                  backgroundColor: isActive ? card.activeBg : '#f2f2f3',
                  color: isActive ? card.activeText : '#17191c',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: '16px',
                  }}
                >
                  <card.Illustration isPlaying={isActive} />
                </div>

                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-signifier)',
                      fontWeight: 400,
                      fontSize: 'clamp(24px, 2.2vw, 31px)',
                      lineHeight: 1.18,
                      letterSpacing: '-0.02em',
                      margin: '0 0 8px',
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '15px',
                      lineHeight: 1.45,
                      margin: 0,
                      opacity: isActive ? 0.88 : 0.65,
                    }}
                  >
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
