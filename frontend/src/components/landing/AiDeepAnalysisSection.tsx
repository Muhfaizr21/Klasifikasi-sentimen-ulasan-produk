import React from 'react';
import { AI_FEATURE_CARDS, AI_TEAM_PERSONAS, type WorkspaceTabTarget } from './landingData';
import { SteepHeadingBlock } from './SteepHeadingBlock';
import { useSteepInView } from './useSteepInView';

interface AiDeepAnalysisSectionProps {
  onEnterWorkspace: (initialTab?: WorkspaceTabTarget, initialQuery?: string) => void;
}

export const AiDeepAnalysisSection: React.FC<AiDeepAnalysisSectionProps> = ({
  onEnterWorkspace,
}) => {
  const [aiRef, aiInView] = useSteepInView();

  return (
    <section
      id="sentimen-ai"
      ref={aiRef}
      className="steep-section"
      style={{ backgroundColor: '#f2f2f3' }}
    >
      {/* Soft Lavender / Pink Galaxy Glow Behind AI Window */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '44%',
          width: '1100px',
          height: '1100px',
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(48% 48% at 50% 50%, rgba(235, 212, 250, 0.65) 0%, rgba(251, 215, 228, 0.42) 42%, rgba(242, 242, 243, 0) 72%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div className="steep-section-container is-narrow">
        <button
          type="button"
          className="steep-breadcrumb"
          onClick={() => onEnterWorkspace('ai-chat')}
        >
          <span>Sentimen AI</span>
          <span style={{ opacity: 0.35 }}>›</span>
        </button>

        <SteepHeadingBlock
          isInView={aiInView}
          size="xl"
          lines={[{ text: 'Buka analisis mendalam' }]}
          description="Sentimen AI melampaui jawaban sederhana untuk menghadirkan analisis komprehensif yang berakar langsung pada model semantik Anda."
          cta={
            <button
              type="button"
              className="steep-btn-secondary"
              onClick={() =>
                onEnterWorkspace(
                  'ai-chat',
                  'Mengapa ulasan positif naik bulan lalu dibandingkan bulan sebelumnya?'
                )
              }
            >
              <span>Buka Sentimen AI Chat</span>
              <span style={{ opacity: 0.55 }}>→</span>
            </button>
          }
        />

        {/* Central Report Window + 3 Team Persona Bubbles */}
        <div style={{ position: 'relative', marginTop: '56px', marginBottom: '72px' }}>
          {/* Responsive Persona Strip for Tablet & Mobile (<= 1180px) */}
          <div className="steep-ai-mobile-personas">
            {AI_TEAM_PERSONAS.map((persona) => (
              <div
                key={`mob-${persona.name}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  borderRadius: '18px',
                  backgroundColor: '#ffffff',
                  padding: '16px 18px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: persona.gradient,
                      color: '#fff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {persona.initial}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#17191c' }}>{persona.name}</span>
                  <span style={{ fontSize: '12px', color: 'rgba(23,25,28,0.45)' }}>{persona.role}</span>
                </div>
                <div style={{ fontSize: '12.5px', lineHeight: 1.45, color: '#17191c' }}>
                  {persona.question}
                </div>
              </div>
            ))}
          </div>

          {/* Floating Persona Bubbles on Wide Desktop (> 1180px) */}
          {AI_TEAM_PERSONAS.map((persona) => (
            <div
              key={persona.name}
              className="steep-ai-floating-persona"
              style={{
                position: 'absolute',
                ...persona.positionStyle,
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  width: 'fit-content',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '999px',
                  backgroundColor: '#ffffff',
                  padding: '6px 14px 6px 8px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: persona.gradient,
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {persona.initial}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#17191c' }}>{persona.name}</span>
                <span style={{ fontSize: '12px', color: 'rgba(23,25,28,0.45)' }}>{persona.role}</span>
              </div>
              <div
                style={{
                  borderRadius: '20px',
                  backgroundColor: '#ffffff',
                  padding: '16px 20px',
                  fontSize: '12.5px',
                  lineHeight: 1.45,
                  color: '#17191c',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                {persona.question}
              </div>
            </div>
          ))}

          {/* Central Elevated AI Window */}
          <div
            style={{
              maxWidth: '788px',
              margin: '0 auto',
              borderRadius: '24px',
              backgroundColor: '#ffffff',
              boxShadow: 'var(--shadow-window)',
              border: '1px solid rgba(4,23,43,0.06)',
              overflow: 'hidden',
            }}
          >
            {/* Window Top Bar */}
            <div className="steep-app-topbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#e5e5e7' }} />
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#e5e5e7' }} />
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#e5e5e7' }} />
                </div>
                <span style={{ color: '#777b86' }}>◧</span>
                <span style={{ color: '#979799' }}>‹</span>
                <span style={{ color: '#979799' }}>›</span>
                <span style={{ fontWeight: 600, color: '#17191c', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Sentimen vs tahun lalu ⌄
                </span>
              </div>
              <span style={{ fontWeight: 500, color: '#17191c', flexShrink: 0 }}>+ Chat baru</span>
            </div>

            {/* Window Body */}
            <div className="steep-ai-window-body">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 22 }}>
                <div
                  style={{
                    backgroundColor: '#f3f3f5',
                    borderRadius: '20px',
                    padding: '10px 20px',
                    fontSize: '12.5px',
                    color: '#17191c',
                    fontWeight: 440,
                  }}
                >
                  Mengapa ulasan positif naik bulan lalu dibandingkan bulan sebelumnya?
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#979799', marginBottom: '12px' }}>Penalaran ›</div>

              <p style={{ fontSize: '13px', lineHeight: 1.55, color: '#17191c', margin: '0 0 14px' }}>
                <span style={{ color: '#3b76dd', fontWeight: 500 }}>▤ Ulasan positif</span> naik{' '}
                <strong>44k → 60k (+36%) dari bulan ke bulan</strong>. Tiga dimensi menceritakan kisahnya:
              </p>

              <div style={{ marginBottom: '22px', paddingLeft: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#17191c', marginBottom: 4 }}>
                  1. Saluran · Organik adalah pendorong terbesar
                </div>
                <p style={{ fontSize: '12.5px', lineHeight: 1.55, color: '#3f424a', margin: 0 }}>
                  Ulasan organik meningkat lebih dari dua kali lipat: <strong>11k → 25k (+14k)</strong>. Kampanye
                  marketplace juga bertambah (<strong>+5k</strong>), sementara keluhan kurir turun drastis dari{' '}
                  <strong>8k → 2k (-6k)</strong>. Kenaikan bersih hampir seluruhnya didorong oleh kepuasan organik.
                </p>
              </div>

              {/* Embedded Chart Card */}
              <div
                style={{
                  borderRadius: '16px',
                  border: '1px solid rgba(23,25,28,0.08)',
                  padding: '18px 20px',
                  marginBottom: '22px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#17191c' }}>Tren ulasan positif</div>
                    <div style={{ fontSize: '11px', color: '#979799' }}>30 hari terakhir</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#777b86' }}>
                    <span>◧</span>
                    <span>→</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 14, fontSize: '11px', color: '#777b86', marginBottom: 12 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4a85e8' }} />
                    Ulasan Positif
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#efb095' }} />
                    Bulan lalu
                  </span>
                </div>

                <svg viewBox="0 0 620 170" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                  {[
                    { y: 25, l: '60k' },
                    { y: 65, l: '40k' },
                    { y: 105, l: '20k' },
                    { y: 145, l: '0' },
                  ].map((r) => (
                    <g key={r.l}>
                      <text x="0" y={r.y - 4} fill="#a3a6af" fontSize="9.5">
                        {r.l}
                      </text>
                      <line x1="0" y1={r.y} x2="605" y2={r.y} stroke="rgba(0,0,0,0.06)" />
                    </g>
                  ))}
                  <path
                    d="M30 112 L75 118 L120 100 L165 106 L210 92 L255 98 L300 94 L345 108 L390 92 L435 100 L480 96 L525 84 L570 90"
                    fill="none"
                    stroke="#efb095"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M30 92 L75 98 L120 104 L165 86 L210 84 L255 62 L300 56 L345 84 L390 82 L435 60 L480 44 L525 50 L570 36"
                    fill="none"
                    stroke="#4a85e8"
                    strokeWidth="1.7"
                  />
                  <text x="30" y="82" fill="#3b76dd" fontSize="9.5" fontWeight="600">
                    44k
                  </text>
                  {['Feb 28', 'Mar 3', 'Mar 6', 'Mar 9', 'Mar 12', 'Mar 15', 'Mar 18', 'Mar 21', 'Mar 24', 'Mar 27'].map(
                    (d, i) => (
                      <text key={d} x={30 + i * 58} y="160" textAnchor="middle" fill="#a3a6af" fontSize="9">
                        {d}
                      </text>
                    )
                  )}
                </svg>
              </div>

              {/* Bottom Follow-up Composer Box */}
              <div
                onClick={() =>
                  onEnterWorkspace(
                    'ai-chat',
                    'Bagaimana distribusi emosi pelanggan Marah (Anger) dan Senang (Happy) di korpus?'
                  )
                }
                style={{
                  borderRadius: '14px',
                  border: '1px solid rgba(23,25,28,0.08)',
                  padding: '12px 16px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ marginBottom: 6 }}>
                  <span
                    style={{
                      fontSize: '10.5px',
                      color: '#52555d',
                      backgroundColor: '#f3f3f5',
                      borderRadius: '999px',
                      padding: '2px 8px',
                    }}
                  >
                    ⓘ Bulan ini
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#17191c' }}>
                  Dari saluran mana pelanggan baru paling banyak berasal?
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Square Visual Feature Cards Below AI Window */}
        <div className="steep-ai-cards-grid">
          {AI_FEATURE_CARDS.map((card, idx) => (
            <div key={card.title} style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                onClick={() =>
                  onEnterWorkspace(
                    idx === 0 ? 'ai-chat' : idx === 1 ? 'target-kpi' : 'bedah-data'
                  )
                }
                style={{
                  minHeight: '280px',
                  borderRadius: '20px',
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.06)',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: '-15%',
                    bottom: '-15%',
                    width: '220px',
                    height: '220px',
                    borderRadius: '50%',
                    backgroundColor: card.accent,
                    opacity: 0.55,
                    filter: 'blur(24px)',
                    pointerEvents: 'none',
                  }}
                />
                <span
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 500,
                    color: '#52555d',
                    backgroundColor: '#f2f2f3',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    width: 'fit-content',
                  }}
                >
                  {card.badge}
                </span>

                <div
                  style={{
                    borderRadius: '16px',
                    backgroundColor: '#fafafb',
                    border: '1px solid rgba(0,0,0,0.05)',
                    padding: '22px',
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-signifier)', fontSize: '28px', color: '#17191c' }}>
                    {card.visualTitle}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#777b86', marginTop: 6 }}>
                    Terhubung langsung ke 5.459 ulasan PRDECT-ID
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '17px', fontWeight: 500, color: '#17191c', paddingTop: '18px', marginBottom: '4px' }}>
                {card.title}
              </div>
              <p style={{ fontSize: '14.5px', lineHeight: 1.5, color: 'rgba(23,25,28,0.6)', margin: 0 }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
