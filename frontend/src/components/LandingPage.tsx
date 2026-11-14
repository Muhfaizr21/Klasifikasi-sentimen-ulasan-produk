import React, { useEffect, useRef, useState } from 'react';
import '../styles/steep-landing.css';

export type WorkspaceTabTarget = 'prediksi' | 'batch' | 'komparasi' | 'evaluasi';

export interface LandingPageProps {
  corpusTotal?: number;
  accuracyPct?: string;
  f1MacroPct?: string;
  totalCategories?: number;
  onEnterWorkspace: (initialTab?: WorkspaceTabTarget, initialQuery?: string) => void;
}

/* --------------------------------------------------------------------------
   Math Helpers for Scroll-Scrubbed Timeline (Matches GSAP Timeline t in [0, 1.2])
   -------------------------------------------------------------------------- */
function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function invLerp(t: number, start: number, duration: number): number {
  if (duration <= 0) return t >= start ? 1 : 0;
  return clamp((t - start) / duration, 0, 1);
}

function easeOutQuad(x: number): number {
  return 1 - (1 - x) * (1 - x);
}

function lerp(a: number, b: number, p: number): number {
  return a + (b - a) * p;
}

function lerpColorHex(hexA: string, hexB: string, p: number): string {
  const cA = parseInt(hexA.replace('#', ''), 16);
  const cB = parseInt(hexB.replace('#', ''), 16);
  const r = Math.round(lerp((cA >> 16) & 255, (cB >> 16) & 255, p));
  const g = Math.round(lerp((cA >> 8) & 255, (cB >> 8) & 255, p));
  const b = Math.round(lerp(cA & 255, cB & 255, p));
  return `rgb(${r}, ${g}, ${b})`;
}

/* --------------------------------------------------------------------------
   Reusable Scroll-Triggered In-View Hook (Matches Steep's useInView 8239)
   -------------------------------------------------------------------------- */
function useSteepInView(rootMargin = '0px 0px -15% 0px'): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          } else if (entry.boundingClientRect.top > window.innerHeight * 0.85) {
            setIsInView(false);
          }
        });
      },
      { threshold: 0.08, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, isInView];
}

/* --------------------------------------------------------------------------
   Steep Word-by-Word Serif Heading Reveal (Matches Steep's Module 8722)
   -------------------------------------------------------------------------- */
interface SteepHeadingBlockProps {
  lines: Array<{ text: string; italicWord?: string }>;
  description?: string;
  cta?: React.ReactNode;
  centerAligned?: boolean;
  darkMode?: boolean;
  size?: 'md' | 'lg' | 'xl';
  isInView: boolean;
}

const SteepHeadingBlock: React.FC<SteepHeadingBlockProps> = ({
  lines,
  description,
  cta,
  centerAligned = false,
  darkMode = false,
  size = 'lg',
  isInView,
}) => {
  const fontSize =
    size === 'xl'
      ? 'clamp(44px, 5.2vw, 72px)'
      : size === 'lg'
      ? 'clamp(38px, 4.6vw, 64px)'
      : 'clamp(32px, 3.4vw, 44px)';

  const lineOffsets = lines.reduce<number[]>((acc, _line, i) => {
    const prevCount = i === 0 ? 0 : acc[i - 1] + lines[i - 1].text.split(' ').length;
    return [...acc, prevCount];
  }, []);
  const totalWords = lines.reduce((sum, l) => sum + l.text.split(' ').length, 0);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: centerAligned ? 'center' : 'flex-start',
        textAlign: centerAligned ? 'center' : 'left',
        color: darkMode ? 'rgba(255,255,255,0.92)' : '#17191c',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-signifier)',
          fontWeight: 400,
          fontSize,
          lineHeight: 1.22,
          letterSpacing: size === 'md' ? '-0.66px' : '-0.96px',
          margin: 0,
        }}
      >
        {lines.map((line, lineIdx) => {
          const words = line.text.split(' ');
          const baseIdx = lineOffsets[lineIdx] || 0;
          return (
            <React.Fragment key={lineIdx}>
              {lineIdx > 0 && <br />}
              {words.map((w, wIdx) => {
                const idx = baseIdx + wIdx;
                const isItalic =
                  line.italicWord &&
                  w.replace(/[.,?!]/g, '').toLowerCase() === line.italicWord.toLowerCase();
                return (
                  <React.Fragment key={wIdx}>
                    <span className="steep-split-word-mask">
                      <span
                        className={`steep-split-word ${isInView ? 'is-visible' : 'is-hidden'}`}
                        style={{
                          transitionDelay: `${idx * 65}ms`,
                          fontStyle: isItalic ? 'italic' : 'normal',
                        }}
                      >
                        {w}
                      </span>
                    </span>
                    {wIdx < words.length - 1 ? ' ' : ''}
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          );
        })}
      </h2>

      {description && (
        <p
          className={`steep-fade-up ${isInView ? 'is-visible' : 'is-hidden'}`}
          style={{
            transitionDelay: `${Math.max(120, totalWords * 32)}ms`,
            maxWidth: '580px',
            fontSize: '19px',
            lineHeight: 1.45,
            fontWeight: 410,
            color: darkMode ? 'rgba(255,255,255,0.55)' : 'rgba(23,25,28,0.62)',
            margin: '18px 0 0',
          }}
        >
          {description}
        </p>
      )}

      {cta && (
        <div
          className={`steep-fade-up ${isInView ? 'is-visible' : 'is-hidden'}`}
          style={{
            transitionDelay: `${Math.max(200, totalWords * 42)}ms`,
            marginTop: '24px',
          }}
        >
          {cta}
        </div>
      )}
    </div>
  );
};

/* --------------------------------------------------------------------------
   Animated SVG Layers for ProductIntroSection Cards (Matches Steep Chunk 7607)
   -------------------------------------------------------------------------- */
const IntroIllustrationOne: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => (
  <svg viewBox="0 0 250 220" fill="none" style={{ width: '62%', height: 'auto', overflow: 'visible' }}>
    {/* Platform Layer */}
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
    {/* Tray Layer */}
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
    {/* Bottle / Metric Cylinder Layer */}
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

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterWorkspace }) => {
  /* ------------------------------------------------------------------------
     1. Viewport Measurement & Smooth Scroll-Scrubbed Hero State (t in [0, 1.2])
     ------------------------------------------------------------------------ */
  const [winSize, setWinSize] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 900,
  });
  const [isNavScrolled, setIsNavScrolled] = useState(false);

  // Smoothed timeline value t in [0, 1.2] matching GSAP scrub: 0.7
  const [timelineT, setTimelineT] = useState(0);
  const targetTRef = useRef(0);
  const currentTRef = useRef(0);
  const heroSpacerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onResize = () => {
      setWinSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Exact Steep scaleFactor, containerHeight, yOffset formulas from index-7206f5d77eda4122.js
  const isDesktopHero = winSize.width >= 1024;
  const scaleFactor =
    winSize.width === 0 || winSize.width >= 1360
      ? 1
      : Math.max((winSize.width - 160) / 1200, 0.5);
  const yOffset = 200 * clamp((winSize.height - 800) / 400, 0, 1);
  const containerHeight = Math.round(1480 * scaleFactor);
  const pinScrollDistance = Math.round(1.2 * containerHeight);
  const totalHeroSpacerHeight = containerHeight + pinScrollDistance;

  useEffect(() => {
    let rafId = 0;

    const updateScrollTarget = () => {
      const y = window.scrollY || window.pageYOffset;
      setIsNavScrolled(y > 16);

      if (!heroSpacerRef.current || !isDesktopHero) {
        targetTRef.current = 0;
        return;
      }
      const rect = heroSpacerRef.current.getBoundingClientRect();
      const scrolledInHero = Math.max(0, -rect.top);
      const rawProgress = clamp(scrolledInHero / Math.max(1, pinScrollDistance), 0, 1);
      // Total GSAP timeline duration is 1.2s
      targetTRef.current = rawProgress * 1.2;
    };

    const tick = () => {
      const diff = targetTRef.current - currentTRef.current;
      if (Math.abs(diff) > 0.0008) {
        currentTRef.current += diff * 0.14; // Smooth scrub factor matching scrub: 0.7
        setTimelineT(currentTRef.current);
      } else if (currentTRef.current !== targetTRef.current) {
        currentTRef.current = targetTRef.current;
        setTimelineT(currentTRef.current);
      }
      rafId = requestAnimationFrame(tick);
    };

    updateScrollTarget();
    window.addEventListener('scroll', updateScrollTarget, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', updateScrollTarget);
      cancelAnimationFrame(rafId);
    };
  }, [isDesktopHero, pinScrollDistance]);

  /* ------------------------------------------------------------------------
     2. Compute Exact GSAP Coordinates at Current Timeline Time t in [0, 1.2]
     ------------------------------------------------------------------------ */
  const t = timelineT;

  // Announcement Banner (P): R={opacity:1, y:0} -> I={opacity:0, y:-40, duration:0.3} at 0
  const pBanner = easeOutQuad(invLerp(t, 0, 0.3));
  const bannerY = lerp(0, -40, pBanner);
  const bannerOpacity = lerp(1, 0, pBanner);

  // Atmospheric Background (g): K={y:0} -> Q={y:-130, duration:0.5} at 0
  const pBg = easeOutQuad(invLerp(t, 0, 0.5));
  const bgY = lerp(0, -130, pBg);

  // Hero Heading & CTA Block (m): E={opacity:1, y:-90+yOffset, scale:1} -> O={opacity:0, scale:0.5, y:-300, duration:0.5} at 0
  const pHeading = easeOutQuad(invLerp(t, 0, 0.5));
  const headingY = lerp(-90 + yOffset, -300, pHeading);
  const headingScale = lerp(1, 0.5, pHeading);
  const headingOpacity = lerp(1, 0, pHeading);

  // 1200x880 App Window (c): M={scale:0.8, y:800, opacity:0} -> z={scale:1, y:200, opacity:1, duration:0.5} at 0
  const pWindow = easeOutQuad(invLerp(t, 0, 0.5));
  const windowScale = lerp(0.8, 1, pWindow);
  const windowY = lerp(800, 200, pWindow);
  const windowOpacity = lerp(0, 1, pWindow);

  // Initial Home Dashboard inside App Window (w): opacity 1 -> 0 at start=0.6, duration=0.3
  const pHomeStart = easeOutQuad(invLerp(t, 0.6, 0.3));
  const homeStartOpacity = lerp(1, 0, pHomeStart);

  // Final AI Reasoning Report inside App Window (b): Y={opacity:0, top:28, left:300, y:200} -> ee={opacity:1, y:84, duration:0.5} at 0.7
  const pReport = easeOutQuad(invLerp(t, 0.7, 0.5));
  const reportOpacity = lerp(0, 1, pReport);
  const reportY = lerp(200, 84, pReport);

  // Pink Registrations/Accuracy Block (o, 294x235):
  // G={x:1100, y:-560+yOffset} -> L={x:860, y:-400} over [0, 0.5], shadowOpacity 1->0; opacity 1->0 over [0.7, 1.0]
  const pMoveO = easeOutQuad(invLerp(t, 0, 0.5));
  const pFadeO = easeOutQuad(invLerp(t, 0.7, 0.3));
  const pinkX = lerp(1100, 860, pMoveO);
  const pinkY = lerp(-560 + yOffset, -400, pMoveO);
  const pinkShadow = lerp(1, 0, pMoveO);
  const pinkOpacity = lerp(1, 0, pFadeO);

  // Blue Region/Category Block (n, 600x235):
  // B={x:-480, y:-750+yOffset} -> V={x:247, y:-400} over [0, 0.5], shadowOpacity 1->0; opacity 1->0 over [0.7, 1.0]
  const pMoveN = easeOutQuad(invLerp(t, 0, 0.5));
  const pFadeN = easeOutQuad(invLerp(t, 0.7, 0.3));
  const blueX = lerp(-480, 247, pMoveN);
  const blueY = lerp(-750 + yOffset, -400, pMoveN);
  const blueShadow = lerp(1, 0, pMoveN);
  const blueOpacity = lerp(1, 0, pFadeN);

  // White Activation Line-Chart Block (l, 294x200):
  // Z={x:-20, y:-280+yOffset} -> q={x:247, y:-154} over [0, 0.5], shadowOpacity 1->0; opacity 1->0 over [0.7, 1.0]
  const pMoveL = easeOutQuad(invLerp(t, 0, 0.5));
  const pFadeL = easeOutQuad(invLerp(t, 0.7, 0.3));
  const grayX = lerp(-20, 247, pMoveL);
  const grayY = lerp(-280 + yOffset, -154, pMoveL);
  const grayShadow = lerp(1, 0, pMoveL);
  const grayOpacity = lerp(1, 0, pFadeL);

  // Left Cursor JB (p, 61x67):
  // J={x:-70, y:-210+yOffset} -> U={x:217, y:-94} over [0, 0.5]; opacity 1->0 over [0.6, 0.9]
  const pMoveCursorL = easeOutQuad(invLerp(t, 0, 0.5));
  const pFadeCursorL = easeOutQuad(invLerp(t, 0.6, 0.3));
  const cursorLX = lerp(-70, 217, pMoveCursorL);
  const cursorLY = lerp(-210 + yOffset, -94, pMoveCursorL);
  const cursorLOpacity = lerp(1, 0, pFadeCursorL);

  // Right Cursor AF (f, 60x76):
  // $={scale:0.9, x:780, y:-150+yOffset} -> X={scale:1, x:728, y:-480} over [0, 0.5]; opacity 1->0 over [0.6, 0.9]
  const pMoveCursorR = easeOutQuad(invLerp(t, 0, 0.5));
  const pFadeCursorR = easeOutQuad(invLerp(t, 0.6, 0.3));
  const cursorRX = lerp(780, 728, pMoveCursorR);
  const cursorRY = lerp(-150 + yOffset, -480, pMoveCursorR);
  const cursorRScale = lerp(0.9, 1, pMoveCursorR);
  const cursorROpacity = lerp(1, 0, pFadeCursorR);

  // Floating AI Composer (u):
  // Phase 1 [0, 0.5]: H={x:660, y:-190+yOffset, width:400} -> W={x:248, y:-540, width:600}
  // Phase 2 [0.7, 1.2]: {x:594, y:-620, width:486, shadowOpacity: 1->0}
  const pAiPhase1 = easeOutQuad(invLerp(t, 0, 0.5));
  const pAiPhase2 = easeOutQuad(invLerp(t, 0.7, 0.5));
  const aiX = t <= 0.7 ? lerp(660, 248, pAiPhase1) : lerp(248, 594, pAiPhase2);
  const aiY = t <= 0.7 ? lerp(-190 + yOffset, -540, pAiPhase1) : lerp(-540, -620, pAiPhase2);
  const aiWidth = t <= 0.7 ? lerp(400, 600, pAiPhase1) : lerp(600, 486, pAiPhase2);
  const aiShadow = t <= 0.7 ? 1 : lerp(1, 0, pAiPhase2);
  const aiHeight = lerp(100, 45, pAiPhase2);
  const aiBgColor = lerpColorHex('#ffffff', '#F3F3F5', pAiPhase2);

  // AI Composer Inner Text & Icons:
  // .ai-button-text ("Tanyakan apa saja..."): opacity 1 -> 0 over [0, 0.5]
  const aiPlaceholderOpacity = lerp(1, 0, easeOutQuad(invLerp(t, 0, 0.35)));
  // .ai-button-text-typed ("Bagaimana dampak peluncuran kampanye terhadap sentimen ulasan bulan ini?"):
  // width 0% -> 100%, y: 0 -> -6 over [0.2, 0.6] (linear ease!)
  const pTyped = invLerp(t, 0.18, 0.42);
  const aiTypedWidthPct = lerp(0, 100, pTyped);
  const aiTypedY = lerp(0, -3, pTyped);
  // .ai-button-icons: opacity 1 -> 0 over [0.6, 0.8]
  const aiIconsOpacity = lerp(1, 0, easeOutQuad(invLerp(t, 0.6, 0.2)));

  // Logo Carousel (y): F={y:800} -> D={y:280} over [0, 0.5]
  const pCarousel = easeOutQuad(invLerp(t, 0, 0.5));
  const carouselY = lerp(800, 280, pCarousel);

  /* ------------------------------------------------------------------------
     3. Interactive Section States
     ------------------------------------------------------------------------ */
  const [activeIntroCard, setActiveIntroCard] = useState(0);
  const [activeProductTab, setActiveProductTab] = useState(0);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [activeSemanticTab, setActiveSemanticTab] = useState(0);

  const [introRef, introInView] = useSteepInView();
  const [productRef, productInView] = useSteepInView();
  const [storyRef, _storyInView] = useSteepInView();
  const [semanticRef, semanticInView] = useSteepInView();
  const [aiRef, aiInView] = useSteepInView();
  const [getStartedRef, getStartedInView] = useSteepInView();

  const marketplaceBrands = [
    'Tokopedia',
    'Shopee Indonesia',
    'Lazada',
    'Blibli',
    'ZALORA',
    'Sociolla',
    'Eraspace',
    'Ruparupa',
    'PRDECT-ID Corpus',
  ];

  const introCards = [
    {
      id: 0,
      title: 'Satu lapisan metrik sentimen terpadu',
      description:
        'Seluruh ulasan e-commerce diklasifikasikan dengan pipeline TF-IDF dan Multinomial Naive Bayes yang konsisten di setiap kategori produk.',
      activeBg: '#fbe1d1',
      activeText: '#5d2a1a',
      Illustration: IntroIllustrationOne,
    },
    {
      id: 1,
      title: 'Dibangun untuk kolaborasi tim produk',
      description:
        'Bandingkan dua produk secara berdampingan, lacak pergeseran keluhan pembeli, dan bagikan laporan evaluasi dalam satu klik.',
      activeBg: '#dce8f8',
      activeText: '#163252',
      Illustration: IntroIllustrationTwo,
    },
    {
      id: 2,
      title: 'Transparan dengan bobot kata kunci',
      description:
        'Tanpa kotak hitam. Setiap keputusan model menampilkan kontribusi log-likelihood per kata dan tingkat keyakinan probabilistik.',
      activeBg: '#dfece3',
      activeText: '#193b29',
      Illustration: IntroIllustrationThree,
    },
  ];

  const productTabs = [
    {
      id: 'single',
      label: 'Inspeksi Ulasan',
      title: 'Bedah probabilitas sentimen & kontribusi token secara instan',
      description:
        'Masukkan ulasan produk berbahasa Indonesia dan lihat distribusi probabilitas Positif, Netral, serta Negatif beserta bobot TF-IDF per kata.',
      ctaTab: 'prediksi' as const,
    },
    {
      id: 'compare',
      label: 'Komparasi 2 Produk',
      title: 'Evaluasi head-to-head indeks reputasi dua produk kompetitor',
      description:
        'Bandingkan skor reputasi, rasio kepuasan pembeli, dan bukti ulasan terverifikasi dari dua kandidat produk untuk keputusan pengadaan.',
      ctaTab: 'komparasi' as const,
    },
    {
      id: 'batch',
      label: 'Batch CSV & Koreksi',
      title: 'Unggah ribuan ulasan CSV & latih ulang model secara inkremental',
      description:
        'Proses dataset ulasan skala besar sekaligus dan gunakan fitur Online Learning (partial_fit) untuk mengoreksi prediksi langsung dari antarmuka.',
      ctaTab: 'batch' as const,
    },
    {
      id: 'metrics',
      label: 'Evaluasi & Metrik',
      title: 'Audit performa 5 skenario eksperimen & confusion matrix',
      description:
        'Tinjau perbandingan akurasi, Macro F1-Score, dan distribusi 5.459 ulasan PRDECT-ID lintas 29 kategori produk e-commerce Indonesia.',
      ctaTab: 'evaluasi' as const,
    },
  ];

  const customerStories = [
    {
      brand: 'Elektronik & Gadget',
      metricBadge: '1.373 Ulasan Terverifikasi',
      quote:
        '“Kami memetakan keluhan kualitas suara dan daya tahan baterai pada ribuan ulasan audio dalam hitungan detik, bukan lagi rekap manual mingguan.”',
      author: 'Riset Kategori Elektronik Konsumen · Korpus PRDECT-ID',
      querySample: 'Suara jernih bass mantap pengiriman cepat packing aman',
      bgAccent: '#fbe1d1',
      textAccent: '#5d2a1a',
    },
    {
      brand: 'Fashion & Apparel',
      metricBadge: '930 Ulasan Terverifikasi',
      quote:
        '“Deteksi otomatis pada ulasan bahan kain, ketepatan ukuran, dan kualitas jahitan membantu tim merespons tren kepuasan pembeli lebih cepat.”',
      author: 'Evaluasi Reputasi Kategori Fashion · Tokopedia & Shopee',
      querySample: 'Bahan adem jahitan rapi ukuran pas sesuai deskripsi',
      bgAccent: '#fbe1d1',
      textAccent: '#5d2a1a',
    },
    {
      brand: 'Rumah Tangga',
      metricBadge: '745 Ulasan Terverifikasi',
      quote:
        '“Komparasi dua produk peralatan dapur memperlihatkan selisih indeks reputasi secara objektif sebelum produk dijadikan katalog utama.”',
      author: 'Analisis Komparatif Kategori Rumah Tangga · Indeks Sentimen',
      querySample: 'Kualitas teflon tebal anti lengket pengiriman sangat aman',
      bgAccent: '#fbe1d1',
      textAccent: '#5d2a1a',
    },
  ];

  const semanticTabs = [
    {
      id: 'tfidf',
      label: 'Vektorisasi N-Gram',
      description:
        'Kombinasi unigram dan bigram (1, 2) menangkap negasi bahasa Indonesia seperti “tidak ramah” atau “kurang rapi” secara akurat.',
      code: `pipeline = Pipeline([\n  (" preprocess ", SastrawiStopwordNormalizer(slang_dict=True)),\n  (" vectorizer ", CountVectorizer(ngram_range=(1, 2), max_features=5000)),\n  (" classifier ", MultinomialNB(alpha=1.0, fit_prior=True))\n])`,
      metrics: [
        { label: 'Akurasi Pengujian', value: '85,90%' },
        { label: 'Macro F1-Score', value: '77,28%' },
        { label: 'Weighted F1-Score', value: '85,62%' },
      ],
    },
    {
      id: 'sastrawi',
      label: 'Normalisasi Sastrawi',
      description:
        'Kamus kata tidak baku e-commerce (“bgt”, “gk”, “mantul”, “cepet”) dinormalisasi sebelum proses stemming dan penghapusan stopword.',
      code: `normalizer = IndonesianReviewPreprocessor(\n  normalize_slang=True,\n  remove_stopwords=True,\n  preserve_negation_tokens=["tidak", "bukan", "kurang", "jangan"]\n)`,
      metrics: [
        { label: 'Reduksi Noise Token', value: '41,8%' },
        { label: 'Cakupan Kamus Slang', value: '1.200+ kata' },
        { label: 'Waktu Pra-pemrosesan', value: '< 4 ms' },
      ],
    },
    {
      id: 'online',
      label: 'Online Learning',
      description:
        'Koreksi label sentimen secara langsung dari ruang kerja menggunakan algoritma MultinomialNB.partial_fit() tanpa melatih ulang dari awal.',
      code: `# Pembaruan bobot inkremental saat pengguna mengoreksi label\nX_vec = vectorizer.transform([cleaned_review])\nclf.partial_fit(X_vec, [corrected_label], classes=CLASSES)\nsave_increment_checkpoint(clf, version="+1 Dilatih")`,
      metrics: [
        { label: 'Pembaruan Model', value: 'Real-time' },
        { label: 'Latensi Inferensi', value: '12 ms' },
        { label: 'Persistensi Memori', value: 'Joblib Artifact' },
      ],
    },
  ];

  return (
    <div className="steep-page">
      {/* ====================================================================
          1. FIXED WHISPER-QUIET TOP NAVIGATION
         ==================================================================== */}
      <header className={`steep-nav-header ${isNavScrolled ? 'is-scrolled' : ''}`}>
        <nav className="steep-nav" aria-label="Navigasi Utama">
          <button
            type="button"
            className="steep-brand"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span className="steep-brand-mark" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2.5C7.2 2.5 3.5 6.1 3.5 10.8C3.5 13.7 5 16.2 7.3 17.7L6.5 21.5L10.6 19.3C11.1 19.4 11.5 19.4 12 19.4C16.8 19.4 20.5 15.8 20.5 11.1C20.5 6.1 16.8 2.5 12 2.5Z"
                  stroke="#17191c"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <circle cx="9.2" cy="11" r="1.3" fill="#17191c" />
                <circle cx="14.8" cy="11" r="1.3" fill="#17191c" />
              </svg>
            </span>
            <span>Sentimen</span>
          </button>

          <div className="steep-nav-links">
            <a href="#fitur-produk" className="steep-nav-link">
              Produk
            </a>
            <a href="#arsitektur-semantik" className="steep-nav-link">
              Metodologi
            </a>
            <a href="#studi-korpus" className="steep-nav-link">
              Studi Korpus
            </a>
            <a href="#sentimen-ai" className="steep-nav-link">
              Sentimen AI
            </a>
          </div>

          <div className="steep-nav-actions">
            <button
              type="button"
              className="steep-nav-text-btn"
              onClick={() => onEnterWorkspace('komparasi')}
            >
              Uji Komparasi
            </button>
            <button
              type="button"
              className="steep-btn-filled is-sm"
              onClick={() => onEnterWorkspace('prediksi')}
            >
              Mulai Analisis
            </button>
          </div>
        </nav>
      </header>

      {/* ====================================================================
          2. PINNED SCROLL-SCRUBBED HERO SECTION (100% STEEP CHOREOGRAPHY)
         ==================================================================== */}
      {isDesktopHero ? (
        <div
          ref={heroSpacerRef}
          className="steep-hero-pin-spacer"
          style={{ height: `${totalHeroSpacerHeight}px` }}
        >
          <div className="steep-hero-sticky" style={{ height: `${containerHeight}px` }}>
            {/* Atmospheric Gradient Mesh (g ref: K={y:0} -> Q={y:-130}) */}
            <div
              className="steep-hero-bg-mesh"
              style={{ transform: `translate3d(0, ${bgY}px, 0)` }}
            />
            <div className="steep-noise-overlay" />

            {/* Top Announcement Pill (P ref at top: 103px: R -> I) */}
            <div
              style={{
                position: 'absolute',
                top: '103px',
                left: 0,
                right: 0,
                zIndex: 20,
                display: 'flex',
                justifyContent: 'center',
                transform: `translate3d(0, ${bannerY}px, 0)`,
                opacity: bannerOpacity,
                pointerEvents: bannerOpacity < 0.1 ? 'none' : 'auto',
              }}
            >
              <button
                type="button"
                className="steep-banner-pill"
                onClick={() => onEnterWorkspace('komparasi')}
              >
                <span style={{ position: 'relative', display: 'inline-flex', width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#17191c" strokeWidth="1.8">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span
                    style={{
                      position: 'absolute',
                      top: 1,
                      right: 1,
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: '#e5484d',
                    }}
                  />
                </span>
                <span>Baru di Sentimen: Komparasi Produk, Live Scraper & Online Learning</span>
                <span className="steep-banner-arrow">→</span>
              </button>
            </div>

            {/* 1200px Scaled Stage Centered at left: 50% (a ref) */}
            <div
              className="steep-hero-stage-1200"
              style={{
                transform: `translate3d(-50%, 0, 0) scale(${scaleFactor})`,
              }}
            >
              {/* Centered Hero Headline + Description + CTAs (m ref at top: 35%) */}
              <div
                style={{
                  position: 'absolute',
                  top: '35%',
                  left: 0,
                  width: '1200px',
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `translate3d(0, ${headingY}px, 0) scale(${headingScale})`,
                  opacity: headingOpacity,
                  pointerEvents: headingOpacity < 0.15 ? 'none' : 'auto',
                }}
              >
                <h1 className="steep-hero-display">
                  Untuk keputusan produk
                  <br />
                  yang berpijak pada data
                </h1>
                <p className="steep-hero-subhead">
                  Sentimen adalah platform analitik ulasan AI yang menghadirkan metrik reputasi
                  terukur ke dalam kerja sehari-hari, sehingga setiap tim memahami suara pelanggan dan
                  dapat bertindak cepat.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <button
                    type="button"
                    className="steep-btn-filled"
                    onClick={() => onEnterWorkspace('prediksi')}
                  >
                    Mulai Analisis
                  </button>
                  <button
                    type="button"
                    className="steep-btn-ghost"
                    onClick={() => onEnterWorkspace('komparasi')}
                  >
                    Bandingkan Produk
                  </button>
                </div>
              </div>

              {/* 1200x880 App Window (c ref: relative flow element inside stage a, height 880px!) */}
              <div
                style={{
                  width: '1200px',
                  height: '880px',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '24px',
                  backgroundColor: '#ffffff',
                  boxShadow: 'var(--shadow-window)',
                  transform: `translate3d(0, ${windowY}px, 0) scale(${windowScale})`,
                  opacity: windowOpacity,
                }}
              >
                {/* Clean Desktop App Shell (Sidebar + Top Header Bar) */}
                <div style={{ display: 'flex', width: '100%', height: '100%' }}>
                  {/* Left Sidebar (248px wide, #fafafb) */}
                  <div
                    style={{
                      width: '248px',
                      height: '100%',
                      backgroundColor: '#fafafb',
                      borderRight: '1px solid rgba(23,25,28,0.06)',
                      padding: '20px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      flexShrink: 0,
                    }}
                  >
                    <div>
                      {/* macOS Window Dots */}
                      <div style={{ display: 'flex', gap: 8, marginBottom: 24, paddingLeft: 6 }}>
                        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#e5e5e7' }} />
                        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#e5e5e7' }} />
                        <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#e5e5e7' }} />
                      </div>

                      {/* Workspace Selector Row */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 8px',
                          marginBottom: 18,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <span
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 6,
                              background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            S
                          </span>
                          <span style={{ fontSize: 14, fontWeight: 500, color: '#17191c' }}>Sentimen</span>
                          <span style={{ fontSize: 11, color: '#979799' }}>⌄</span>
                        </div>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#777b86" strokeWidth="1.8">
                          <circle cx="11" cy="11" r="7" />
                          <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                        </svg>
                      </div>

                      {/* Main Nav Items */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {[
                          { label: 'Beranda', active: true, icon: '⌂' },
                          { label: 'Sentimen AI', active: false, icon: '✧' },
                          { label: 'Model Naive Bayes', active: false, icon: '◈' },
                          { label: 'Metrik TF-IDF', active: false, icon: '▤' },
                          { label: 'Entitas Produk', active: false, icon: '❖' },
                          { label: 'Laporan Komparasi', active: false, icon: '☰' },
                          { label: 'Peta Marketplace', active: false, icon: '◫' },
                        ].map((item) => (
                          <div
                            key={item.label}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '8px 10px',
                              borderRadius: 8,
                              backgroundColor: item.active ? '#efeff1' : 'transparent',
                              color: item.active ? '#17191c' : '#52555d',
                              fontSize: 13.5,
                              fontWeight: item.active ? 500 : 420,
                            }}
                          >
                            <span style={{ width: 16, textAlign: 'center', opacity: 0.75 }}>{item.icon}</span>
                            <span>{item.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Teams Section */}
                      <div style={{ marginTop: 28 }}>
                        <div style={{ fontSize: 11.5, color: '#979799', padding: '0 10px 8px', fontWeight: 450 }}>
                          Kategori Tim
                        </div>
                        {[
                          { code: 'E', label: 'Elektronik', bg: '#fde2d2', color: '#8a3c1b' },
                          { code: 'F', label: 'Fashion', bg: '#dce8fc', color: '#1e4276' },
                          { code: 'R', label: 'Rumah Tangga', bg: '#d9f0e1', color: '#1b5435' },
                          { code: '⊞', label: 'Semua Kategori (29)', bg: 'transparent', color: '#52555d' },
                        ].map((team) => (
                          <div
                            key={team.label}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '7px 10px',
                              fontSize: 13.5,
                              color: '#52555d',
                            }}
                          >
                            <span
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: 4,
                                backgroundColor: team.bg,
                                color: team.color,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 10.5,
                                fontWeight: 600,
                              }}
                            >
                              {team.code}
                            </span>
                            <span>{team.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Favorites Section */}
                      <div style={{ marginTop: 24 }}>
                        <div style={{ fontSize: 11.5, color: '#979799', padding: '0 10px 8px', fontWeight: 450 }}>
                          Favorit
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', fontSize: 13.5, color: '#52555d' }}>
                          <span style={{ color: '#8b5cf6' }}>◫</span>
                          <span>Laporan PRDECT-ID</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: 11.5, color: '#979799', padding: '0 10px' }}>
                      v2.4 · 5.459 Korpus Aktif
                    </div>
                  </div>

                  {/* Right Main Workspace Area (952px wide) */}
                  <div style={{ flex: 1, position: 'relative', backgroundColor: '#ffffff', height: '100%' }}>
                    {/* Top Breadcrumb Bar */}
                    <div
                      style={{
                        height: '56px',
                        padding: '0 28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 500, color: '#17191c' }}>
                        <span style={{ color: '#979799', fontSize: 16 }}>‹</span>
                        <span>Beranda</span>
                      </div>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 13.5,
                          color: '#17191c',
                          fontWeight: 450,
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M12 20h9" strokeLinecap="round" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinejoin="round" />
                        </svg>
                        <span>Edit</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Initial Dashboard View (w ref: top: 88px, left: 248px, 906x790) — Fades out at t=[0.6, 0.9] */}
                <div
                  style={{
                    position: 'absolute',
                    top: '88px',
                    left: '248px',
                    width: '906px',
                    height: '790px',
                    padding: '0 28px',
                    opacity: homeStartOpacity,
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ fontSize: 22, fontFamily: 'var(--font-signifier)', color: '#17191c', marginBottom: 8 }}>
                    Selamat datang kembali, Tim Analitik
                  </div>
                  <div style={{ fontSize: 13.5, color: '#777b86', marginBottom: 140 }}>
                    Tanyakan apa saja ke Sentimen AI atau pantau metrik korpus utama di bawah ini.
                  </div>
                  {/* Placeholder slots where flying cards n, o, l land at t=0.5 */}
                  <div
                    style={{
                      marginTop: '245px',
                      marginLeft: '306px',
                      width: '544px',
                      height: '200px',
                      borderRadius: '16px',
                      backgroundColor: '#fafafb',
                      border: '1px solid rgba(23,25,28,0.05)',
                      padding: '20px 24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13.5, fontWeight: 500, color: '#17191c' }}>
                        Distribusi Kelas Sentimen (PRDECT-ID)
                      </span>
                      <span style={{ fontSize: 12, color: '#777b86' }}>5.459 ulasan</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                      <div style={{ padding: 12, borderRadius: 10, background: '#ffffff', border: '1px solid rgba(0,0,0,0.04)' }}>
                        <div style={{ fontSize: 11.5, color: '#777b86' }}>Positif</div>
                        <div style={{ fontSize: 20, fontWeight: 600, color: '#17191c', marginTop: 2 }}>46,1%</div>
                        <div style={{ fontSize: 11, color: '#18794e', marginTop: 2 }}>2.517 ulasan</div>
                      </div>
                      <div style={{ padding: 12, borderRadius: 10, background: '#ffffff', border: '1px solid rgba(0,0,0,0.04)' }}>
                        <div style={{ fontSize: 11.5, color: '#777b86' }}>Netral</div>
                        <div style={{ fontSize: 20, fontWeight: 600, color: '#17191c', marginTop: 2 }}>11,2%</div>
                        <div style={{ fontSize: 11, color: '#777b86', marginTop: 2 }}>613 ulasan</div>
                      </div>
                      <div style={{ padding: 12, borderRadius: 10, background: '#ffffff', border: '1px solid rgba(0,0,0,0.04)' }}>
                        <div style={{ fontSize: 11.5, color: '#777b86' }}>Negatif</div>
                        <div style={{ fontSize: 20, fontWeight: 600, color: '#17191c', marginTop: 2 }}>42,7%</div>
                        <div style={{ fontSize: 11, color: '#b42318', marginTop: 2 }}>2.329 ulasan</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Steep AI Reasoning & Trend Report (b ref: top: 28px, left: 300px, width: 800px, y: 200 -> 84) */}
                <div
                  style={{
                    position: 'absolute',
                    top: '28px',
                    left: '300px',
                    width: '800px',
                    height: '790px',
                    transform: `translate3d(0, ${reportY}px, 0)`,
                    opacity: reportOpacity,
                    pointerEvents: reportOpacity > 0.6 ? 'auto' : 'none',
                  }}
                >
                  {/* "Reasoning >" breadcrumb */}
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#979799',
                      marginBottom: '14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <span>Penalaran AI</span>
                    <span>›</span>
                  </div>

                  {/* Chart Card (Matches "Subscription trend" in media_1794680329072_0d9b439a.jpg 100%) */}
                  <div
                    style={{
                      borderRadius: '18px',
                      border: '1px solid rgba(23,25,28,0.07)',
                      backgroundColor: '#ffffff',
                      padding: '22px 26px 18px',
                      marginBottom: '28px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 500, color: '#17191c' }}>
                          Tren sentimen ulasan positif
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#979799', marginTop: 2 }}>
                          30 hari terakhir
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 10, color: '#777b86' }}>
                        <span
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            border: '1px solid rgba(0,0,0,0.06)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 13,
                          }}
                        >
                          📄
                        </span>
                        <span
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            border: '1px solid rgba(0,0,0,0.06)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 13,
                          }}
                        >
                          →
                        </span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', gap: 18, fontSize: '12.5px', color: '#777b86', marginBottom: 14 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#4a85e8' }} />
                        <span>Ulasan Positif</span>
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#efb095' }} />
                        <span>Bulan lalu</span>
                      </span>
                    </div>

                    {/* Dual Line SVG Chart matching media_1794680329072_0d9b439a.jpg */}
                    <svg viewBox="0 0 740 210" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                      {/* Horizontal Grid Lines & Y-Axis Labels */}
                      {[
                        { y: 30, label: '3k' },
                        { y: 78, label: '2k' },
                        { y: 126, label: '1k' },
                        { y: 174, label: '0' },
                      ].map((row) => (
                        <g key={row.label}>
                          <text x="0" y={row.y - 6} fill="#a3a6af" fontSize="11">
                            {row.label}
                          </text>
                          <line
                            x1="0"
                            y1={row.y}
                            x2="725"
                            y2={row.y}
                            stroke="rgba(23,25,28,0.06)"
                            strokeWidth="1"
                          />
                        </g>
                      ))}

                      {/* Vertical Dotted Date Grid Lines */}
                      {[32, 98, 164, 230, 296, 362, 428, 494, 560, 626, 692].map((vx, idx) => (
                        <line
                          key={idx}
                          x1={vx}
                          y1="15"
                          x2={vx}
                          y2="174"
                          stroke="rgba(23,25,28,0.05)"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                      ))}

                      {/* Peach Line (Last Month) */}
                      <path
                        d="M32 146 L65 154 L98 138 L131 128 L164 148 L197 134 L230 128 L263 128 L296 128 L329 144 L362 142 L395 118 L428 128 L461 136 L494 126 L527 114 L560 130 L593 124 L626 112"
                        fill="none"
                        stroke="#efb095"
                        strokeWidth="1.6"
                      />
                      {[
                        [32, 146], [65, 154], [98, 138], [131, 128], [164, 148], [197, 134],
                        [230, 128], [263, 128], [296, 128], [329, 144], [362, 142], [395, 118],
                        [428, 128], [461, 136], [494, 126], [527, 114], [560, 130], [593, 124], [626, 112],
                      ].map(([cx, cy], i) => (
                        <circle key={`p-${i}`} cx={cx} cy={cy} r="3" fill="#ffffff" stroke="#efb095" strokeWidth="1.5" />
                      ))}

                      {/* Blue Line (Subscribers / Ulasan Positif) */}
                      <path
                        d="M32 120 L65 128 L98 118 L131 136 L164 122 L197 104 L230 106 L263 82 L296 78 L329 74 L362 104 L395 98 L428 102 L461 78 L494 58 L527 62 L560 36 L593 44 L626 24"
                        fill="none"
                        stroke="#4a85e8"
                        strokeWidth="1.8"
                      />
                      {[
                        [32, 120], [65, 128], [98, 118], [131, 136], [164, 122], [197, 104],
                        [230, 106], [263, 82], [296, 78], [329, 74], [362, 104], [395, 98],
                        [428, 102], [461, 78], [494, 58], [527, 62], [560, 36], [593, 44], [626, 24],
                      ].map(([cx, cy], i) => (
                        <circle key={`b-${i}`} cx={cx} cy={cy} r="3.2" fill="#ffffff" stroke="#4a85e8" strokeWidth="1.7" />
                      ))}

                      {/* End Value Callout Pills (3.61k blue & 1.96k peach) */}
                      <g transform="translate(606, 0)">
                        <rect x="0" y="0" width="40" height="18" rx="4" fill="#eef4fe" />
                        <text x="20" y="12.5" textAnchor="middle" fill="#3b76dd" fontSize="10.5" fontWeight="600">
                          3.61k
                        </text>
                      </g>
                      <g transform="translate(606, 88)">
                        <rect x="0" y="0" width="40" height="18" rx="4" fill="#fdf1eb" />
                        <text x="20" y="12.5" textAnchor="middle" fill="#c96b46" fontSize="10.5" fontWeight="600">
                          1.96k
                        </text>
                      </g>

                      {/* X-Axis Dates */}
                      {[
                        { x: 32, d: 'Feb 28' },
                        { x: 98, d: 'Mar 3' },
                        { x: 164, d: 'Mar 6' },
                        { x: 230, d: 'Mar 9' },
                        { x: 296, d: 'Mar 12' },
                        { x: 362, d: 'Mar 15' },
                        { x: 428, d: 'Mar 18' },
                        { x: 494, d: 'Mar 21' },
                        { x: 560, d: 'Mar 24' },
                        { x: 626, d: 'Mar 27' },
                      ].map((item) => (
                        <text key={item.d} x={item.x} y="194" textAnchor="middle" fill="#a3a6af" fontSize="10.5">
                          {item.d}
                        </text>
                      ))}
                    </svg>
                  </div>

                  {/* High-level impact section */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#17191c', margin: '0 0 8px' }}>
                      Dampak tingkat tinggi
                    </h3>
                    <p style={{ fontSize: '14px', lineHeight: 1.55, color: '#2c2e33', margin: 0 }}>
                      Ulasan positif bersih melonjak dari <strong>1.962 → 3.609 (+83,9% MoM)</strong>, peningkatan
                      bulanan terbesar tahun ini. Waktu lonjakan menunjukkan hal ini didorong oleh pembaruan standar
                      pengemasan pada 9 Maret. Total indeks kepuasan berada di atas target kuartal bulan ini.
                    </p>
                  </div>

                  {/* Key findings section */}
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#17191c', margin: '0 0 12px' }}>
                      Temuan utama
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.8px', lineHeight: 1.5, color: '#2c2e33' }}>
                      <div>
                        <strong>Kepuasan pembeli baru melonjak</strong> · pendorong tunggal terbesar.{' '}
                        <span style={{ color: '#3b76dd', fontWeight: 500 }}>▤ Ulasan bintang lima</span> tumbuh dari{' '}
                        <strong>260 → 620 (+138% MoM)</strong>, menjadikannya kontributor terkuat terhadap pertumbuhan reputasi.
                      </div>
                      <div>
                        <strong>Penurunan keluhan logistik</strong> ·{' '}
                        <span style={{ color: '#3b76dd', fontWeight: 500 }}>▤ Kecepatan pengiriman</span> membaik secara
                        konsisten dari <strong>140 → 170 (+25% MoM)</strong>, menunjukkan kampanye kurir instan beresonansi kuat.
                      </div>
                      <div>
                        <strong>Stabilitas skor kualitas produk</strong> · ulasan bulan ini mempertahankan{' '}
                        <span style={{ color: '#3b76dd', fontWeight: 500 }}>▤ Indeks reputasi</span> yang stabil pada{' '}
                        <strong>85,9 poin</strong>.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================================================================
                  FLOATING BLOCK 1: Pink/Peach Registrations Card (o ref, 294x235)
                  Static origin: top 880px, left 0px
                 ================================================================ */}
              <div
                className="steep-floating-block"
                style={
                  {
                    width: '294px',
                    height: '235px',
                    transform: `translate3d(${pinkX}px, ${pinkY}px, 0)`,
                    opacity: pinkOpacity,
                    '--shadow-opacity': pinkShadow,
                    pointerEvents: 'none',
                  } as React.CSSProperties
                }
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '16px',
                    backgroundColor: '#fdf3ee',
                    padding: '20px 22px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                  }}
                >
                  <div style={{ fontSize: '15px', fontWeight: 500, color: '#5d2a1a' }}>
                    Akurasi Uji
                  </div>

                  {/* Radial Progress Ring on Right */}
                  <div style={{ position: 'absolute', right: '22px', top: '48px', width: '124px', height: '124px' }}>
                    <svg viewBox="0 0 120 120" style={{ width: '100%', height: '100%' }}>
                      <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(93,42,26,0.12)" strokeWidth="6" />
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        fill="none"
                        stroke="#5d2a1a"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray="301.6"
                        strokeDashoffset="42.5"
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: '26px', fontWeight: 500, color: '#5d2a1a', letterSpacing: '-0.03em' }}>
                        85,9%
                      </span>
                      <span style={{ fontSize: '11px', color: 'rgba(93,42,26,0.65)' }}>dari target</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '26px', fontWeight: 500, color: '#5d2a1a', letterSpacing: '-0.03em' }}>
                      5,4k
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(93,42,26,0.7)', marginTop: 2 }}>
                      ↑ 8,6% vs baseline
                    </div>
                  </div>
                </div>
              </div>

              {/* ================================================================
                  FLOATING BLOCK 2: Blue Region/Category Card (n ref, 600x235)
                  Static origin: top 880px, left 0px
                 ================================================================ */}
              <div
                className="steep-floating-block"
                style={
                  {
                    width: '600px',
                    height: '235px',
                    transform: `translate3d(${blueX}px, ${blueY}px, 0)`,
                    opacity: blueOpacity,
                    '--shadow-opacity': blueShadow,
                    pointerEvents: 'none',
                  } as React.CSSProperties
                }
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '16px',
                    backgroundColor: '#f1f6fd',
                    padding: '22px 26px',
                    display: 'grid',
                    gridTemplateColumns: '210px 1fr',
                    gap: '28px',
                  }}
                >
                  {/* Left Column: Big Metric + 5 Vertical Bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '30px', fontWeight: 500, color: '#163252', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                        3 503
                      </div>
                      <div style={{ fontSize: '12px', color: '#3b628b', marginTop: 4 }}>
                        ↑ 6,2% vs minggu lalu
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '104px', paddingTop: 12 }}>
                      {[
                        { day: 'S', h: 52 },
                        { day: 'S', h: 78 },
                        { day: 'R', h: 64 },
                        { day: 'K', h: 86 },
                        { day: 'J', h: 68, active: true },
                      ].map((bar, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                          <div
                            style={{
                              width: '10px',
                              height: `${bar.h}px`,
                              borderRadius: '999px',
                              backgroundColor: '#1d4f82',
                            }}
                          />
                          <span
                            style={{
                              fontSize: '10.5px',
                              color: bar.active ? '#163252' : '#6c8ba9',
                              fontWeight: bar.active ? 600 : 400,
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              border: bar.active ? '1px solid #1d4f82' : 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {bar.day}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Region / Category Breakdown Table */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div
                      style={{
                        fontSize: '14.5px',
                        fontWeight: 500,
                        color: '#163252',
                        paddingBottom: '8px',
                        borderBottom: '1px solid rgba(22,50,82,0.08)',
                      }}
                    >
                      Kategori Korpus
                    </div>
                    {[
                      { name: 'Elektronik & Gadget', val: '1 373' },
                      { name: 'Fashion & Pakaian', val: '930' },
                      { name: 'Rumah Tangga', val: '745' },
                      { name: 'Kesehatan & Kecantikan', val: '432' },
                      { name: 'Lainnya', val: '23' },
                    ].map((row) => (
                      <div
                        key={row.name}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '13px',
                          padding: '4px 0',
                          borderBottom: '1px solid rgba(22,50,82,0.05)',
                        }}
                      >
                        <span style={{ color: '#587898' }}>{row.name}</span>
                        <span style={{ color: '#163252', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                          {row.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ================================================================
                  FLOATING BLOCK 3: White Activation Card (l ref, 294x200)
                  Static origin: top 880px, left 0px
                 ================================================================ */}
              <div
                className="steep-floating-block"
                style={
                  {
                    width: '294px',
                    height: '200px',
                    transform: `translate3d(${grayX}px, ${grayY}px, 0)`,
                    opacity: grayOpacity,
                    '--shadow-opacity': grayShadow,
                    pointerEvents: 'none',
                  } as React.CSSProperties
                }
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '16px',
                    backgroundColor: '#ffffff',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14.5px', fontWeight: 500, color: '#17191c' }}>
                      Aktivasi & F1-Score
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 500, color: '#17191c', marginTop: 4, letterSpacing: '-0.03em' }}>
                      77,3%
                    </div>
                  </div>

                  <svg viewBox="0 0 250 76" style={{ width: '100%', height: '72px', overflow: 'visible' }}>
                    {[15, 55, 95, 135, 175, 225].map((vx) => (
                      <line
                        key={vx}
                        x1={vx}
                        y1="4"
                        x2={vx}
                        y2="52"
                        stroke="rgba(23,25,28,0.06)"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    ))}
                    <path
                      d="M15 44 C40 44, 50 32, 75 34 C100 36, 115 26, 140 28 C165 30, 180 42, 200 32 C212 26, 218 16, 225 12"
                      fill="none"
                      stroke="#2b2e33"
                      strokeWidth="1.8"
                    />
                    <circle cx="225" cy="12" r="3.8" fill="#17191c" />
                    <text x="15" y="68" fill="#979799" fontSize="10">Agu</text>
                    <text x="85" y="68" fill="#979799" fontSize="10">Sep</text>
                    <text x="155" y="68" fill="#979799" fontSize="10">Okt</text>
                  </svg>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -14 }}>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 500,
                        color: '#17191c',
                        border: '1px solid rgba(23,25,28,0.3)',
                        borderRadius: '999px',
                        padding: '1px 8px',
                      }}
                    >
                      Nov
                    </span>
                  </div>
                </div>
              </div>

              {/* ================================================================
                  LEFT CURSOR BUBBLE: Green JB Cursor (p ref, 61x67)
                 ================================================================ */}
              <div
                style={{
                  position: 'absolute',
                  top: '880px',
                  left: 0,
                  width: '61px',
                  height: '67px',
                  transform: `translate3d(${cursorLX}px, ${cursorLY}px, 0)`,
                  opacity: cursorLOpacity,
                  pointerEvents: 'none',
                  zIndex: 25,
                }}
              >
                <svg width="61" height="67" viewBox="0 0 61 67" fill="none">
                  <path d="M8 6L24 14L15 18L12 27L8 6Z" fill="#17191c" />
                  <circle cx="36" cy="42" r="20" fill="#bde8c6" stroke="#17191c" strokeWidth="1.3" />
                  <text x="36" y="46.5" textAnchor="middle" fill="#17191c" fontSize="13" fontWeight="500">
                    JB
                  </text>
                </svg>
              </div>

              {/* ================================================================
                  FLOATING BLOCK 4: AI Composer -> Morphs into User Prompt Pill (u ref)
                  Static origin: top 880px, left 0px
                 ================================================================ */}
              <div
                className="steep-floating-block"
                style={
                  {
                    width: `${aiWidth}px`,
                    transform: `translate3d(${aiX}px, ${aiY}px, 0)`,
                    '--shadow-opacity': aiShadow,
                    zIndex: 22,
                  } as React.CSSProperties
                }
              >
                <div
                  onClick={() => onEnterWorkspace('prediksi', 'Kualitas barang sangat bagus pengiriman super cepat')}
                  style={{
                    position: 'relative',
                    backgroundColor: aiBgColor,
                    borderRadius: '20px',
                    overflow: 'hidden',
                    display: 'flex',
                    width: '100%',
                    height: `${aiHeight}px`,
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '14px 14px 12px 20px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ position: 'relative', height: '22px' }}>
                    <span
                      style={{
                        color: '#777b86',
                        fontSize: '15px',
                        fontWeight: 420,
                        lineHeight: 1.4,
                        opacity: aiPlaceholderOpacity,
                      }}
                    >
                      Tanyakan apa saja...
                    </span>
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        color: '#17191c',
                        fontSize: '14.5px',
                        fontWeight: 430,
                        lineHeight: 1.4,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        width: `${aiTypedWidthPct}%`,
                        transform: `translate3d(0, ${aiTypedY}px, 0)`,
                      }}
                    >
                      Bagaimana dampak peluncuran kampanye terhadap sentimen ulasan bulan ini?
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: aiIconsOpacity,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#777b86', fontSize: '15px' }}>
                      <span>@</span>
                      <span>ⓘ</span>
                    </div>
                    <span
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#17191c',
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                      }}
                    >
                      ↑
                    </span>
                  </div>
                </div>
              </div>

              {/* ================================================================
                  RIGHT CURSOR BUBBLE: Blue AF Cursor (f ref, 60x76)
                 ================================================================ */}
              <div
                style={{
                  position: 'absolute',
                  top: '880px',
                  left: 0,
                  width: '60px',
                  height: '76px',
                  transform: `translate3d(${cursorRX}px, ${cursorRY}px, 0) scale(${cursorRScale})`,
                  opacity: cursorROpacity,
                  pointerEvents: 'none',
                  zIndex: 26,
                }}
              >
                <svg width="60" height="76" viewBox="0 0 60 76" fill="none">
                  <path d="M12 6L28 16L18 20L15 30L12 6Z" fill="#17191c" />
                  <circle cx="34" cy="48" r="20" fill="#cce0ff" stroke="#17191c" strokeWidth="1.3" />
                  <text x="34" y="52.5" textAnchor="middle" fill="#17191c" fontSize="13" fontWeight="500">
                    AF
                  </text>
                </svg>
              </div>

              {/* ================================================================
                  INFINITE LOGO MARQUEE CAROUSEL (y ref: F={y:800} -> D={y:280})
                 ================================================================ */}
              <div
                style={{
                  position: 'absolute',
                  top: '880px',
                  left: '-5%',
                  width: '110%',
                  zIndex: 40,
                  transform: `translate3d(0, ${carouselY}px, 0)`,
                }}
              >
                <div
                  style={{
                    padding: '32px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '24px',
                  }}
                >
                  <div style={{ fontSize: '14.5px', color: '#777b86', fontWeight: 420 }}>
                    Terintegrasi dengan ekosistem korpus & marketplace Indonesia
                  </div>
                  <div style={{ width: '100%', position: 'relative', overflow: 'hidden' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '18%',
                        background: 'linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0) 100%)',
                        zIndex: 2,
                        pointerEvents: 'none',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: '18%',
                        background: 'linear-gradient(270deg, #ffffff 0%, rgba(255,255,255,0) 100%)',
                        zIndex: 2,
                        pointerEvents: 'none',
                      }}
                    />
                    <div className="steep-marquee-track">
                      {[0, 1].map((dup) => (
                        <div
                          key={dup}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '56px',
                            paddingRight: '56px',
                            flexShrink: 0,
                          }}
                        >
                          {marketplaceBrands.map((brand) => (
                            <span
                              key={`${dup}-${brand}`}
                              style={{
                                fontFamily: 'var(--font-signifier)',
                                fontSize: '23px',
                                color: '#17191c',
                                opacity: 0.72,
                                whiteSpace: 'nowrap',
                                letterSpacing: '-0.02em',
                              }}
                            >
                              {brand}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile / Tablet Fallback Hero (< 1024px, matches et component in Steep) */
        <section style={{ paddingTop: '112px', paddingBottom: '64px', paddingInline: '20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div className="steep-hero-bg-mesh" />
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '680px', margin: '0 auto' }}>
            <button
              type="button"
              className="steep-banner-pill"
              onClick={() => onEnterWorkspace('komparasi')}
              style={{ marginBottom: '24px', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              <span>Baru: Komparasi 2 Produk & Live Scraper</span>
              <span>→</span>
            </button>
            <h1
              style={{
                fontFamily: 'var(--font-signifier)',
                fontWeight: 400,
                fontSize: 'clamp(44px, 10vw, 72px)',
                lineHeight: 1.08,
                letterSpacing: '-1.5px',
                margin: '0 0 18px',
              }}
            >
              Untuk keputusan produk yang berpijak pada data
            </h1>
            <p style={{ fontSize: '18px', lineHeight: 1.45, color: '#17191c', margin: '0 auto 26px', maxWidth: '540px' }}>
              Platform analitik sentimen AI yang mengubah ribuan ulasan e-commerce menjadi metrik
              reputasi terukur untuk tim produk dan riset.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className="steep-btn-filled" onClick={() => onEnterWorkspace('prediksi')}>
                Mulai Analisis
              </button>
              <button type="button" className="steep-btn-ghost" onClick={() => onEnterWorkspace('komparasi')}>
                Bandingkan Produk
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          3. PRODUCT INTRO SECTION (3 INTERACTIVE HOVER-SCALING CARDS — CHUNK 7607)
         ==================================================================== */}
      <section
        id="fitur-produk"
        ref={introRef}
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '96px 24px 80px' }}
      >
        <SteepHeadingBlock
          isInView={introInView}
          centerAligned
          size="lg"
          lines={[
            { text: 'Standar baru intelijen' },
            { text: 'sentimen produk', italicWord: 'sentimen' },
          ]}
        />

        <div
          className="steep-intro-cards-row"
          style={{
            marginTop: '64px',
            transform:
              activeIntroCard === 0
                ? 'translateX(2.5%)'
                : activeIntroCard === 2
                ? 'translateX(-2.5%)'
                : 'translateX(0%)',
          }}
        >
          {introCards.map((card, idx) => {
            const isActive = activeIntroCard === idx;
            const dist = Math.abs(idx - activeIntroCard);
            let shiftClass = '';
            if (!isActive && activeIntroCard !== 1) {
              const activeIsLeft = activeIntroCard < 1;
              if (dist === 1) shiftClass = activeIsLeft ? 'shift-right-sm' : 'shift-left-sm';
              else if (dist > 1) shiftClass = activeIsLeft ? 'shift-left-lg' : 'shift-right-lg';
            }
            const CardIllustration = card.Illustration;

            return (
              <div
                key={card.id}
                className="steep-intro-card-wrap"
                onMouseEnter={() => setActiveIntroCard(idx)}
                onClick={() => setActiveIntroCard(idx)}
              >
                <div
                  className={`steep-intro-card ${isActive ? 'is-active' : `is-idle ${shiftClass}`}`}
                  style={
                    isActive
                      ? { backgroundColor: card.activeBg, color: card.activeText }
                      : undefined
                  }
                >
                  <span
                    style={{
                      fontSize: '25px',
                      fontWeight: 450,
                      lineHeight: 1.18,
                      letterSpacing: '-0.24px',
                      maxWidth: '72%',
                    }}
                  >
                    {card.title}
                  </span>

                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: isActive ? '25%' : '34%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'top 0.48s cubic-bezier(0.22, 1, 0.36, 1)',
                      pointerEvents: 'none',
                    }}
                  >
                    <CardIllustration isPlaying={isActive} />
                  </div>

                  <p
                    style={{
                      margin: 'auto 0 0',
                      fontSize: '14.5px',
                      lineHeight: 1.42,
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? 'translateY(0)' : 'translateY(12px)',
                      transition: 'opacity 0.45s ease 0.08s, transform 0.45s ease 0.08s',
                    }}
                  >
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ====================================================================
          4. PRODUCT SECTION (TABBED WORKSPACE SHOWCASE WITH SLIDING UNDERLINE — CHUNK 5206)
         ==================================================================== */}
      <section
        ref={productRef}
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px 96px' }}
      >
        <SteepHeadingBlock
          isInView={productInView}
          size="lg"
          lines={[
            { text: 'Eksplorasi bebas tanpa' },
            { text: 'kekacauan spreadsheet', italicWord: 'kekacauan' },
          ]}
          description="Dari inspeksi satu kalimat ulasan hingga komparasi dua produk dan evaluasi ribuan baris CSV, seluruh alur kerja analitik berjalan di atas satu model probabilistik yang konsisten."
        />

        {/* Tab Bar with Sliding Active Line & Circular Prev/Next Buttons (Matches Module 2180) */}
        <div style={{ position: 'relative', margin: '36px 0 32px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {productTabs.map((tab, idx) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveProductTab(idx)}
                  style={{
                    width: '160px',
                    marginRight: '20px',
                    padding: '18px 0',
                    fontSize: '14.5px',
                    fontWeight: activeProductTab === idx ? 500 : 420,
                    color: activeProductTab === idx ? '#17191c' : 'rgba(23,25,28,0.48)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                className="steep-circle-btn"
                disabled={activeProductTab === 0}
                onClick={() => setActiveProductTab((p) => Math.max(0, p - 1))}
                aria-label="Tab sebelumnya"
              >
                ‹
              </button>
              <button
                type="button"
                className="steep-circle-btn"
                disabled={activeProductTab === productTabs.length - 1}
                onClick={() => setActiveProductTab((p) => Math.min(productTabs.length - 1, p + 1))}
                aria-label="Tab berikutnya"
              >
                ›
              </button>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: '2px',
              width: '160px',
              backgroundColor: '#17191c',
              transform: `translateX(${activeProductTab * 180}px)`,
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>

        {/* Active Tab Interactive Preview Card */}
        <div
          style={{
            borderRadius: '24px',
            backgroundColor: '#f2f2f3',
            padding: 'clamp(24px, 4vw, 48px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '36px',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#777b86', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              0{activeProductTab + 1} · {productTabs[activeProductTab].label}
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-signifier)',
                fontWeight: 400,
                fontSize: 'clamp(28px, 3vw, 40px)',
                lineHeight: 1.2,
                letterSpacing: '-0.5px',
                margin: '0 0 16px',
              }}
            >
              {productTabs[activeProductTab].title}
            </h3>
            <p style={{ fontSize: '16.5px', lineHeight: 1.5, color: '#52555d', margin: '0 0 28px' }}>
              {productTabs[activeProductTab].description}
            </p>
            <button
              type="button"
              className="steep-btn-filled"
              onClick={() => onEnterWorkspace(productTabs[activeProductTab].ctaTab)}
            >
              Buka {productTabs[activeProductTab].label} →
            </button>
          </div>

          {/* Interactive Artifact Surface inside Tab */}
          <div
            style={{
              borderRadius: '20px',
              backgroundColor: '#ffffff',
              boxShadow: 'var(--shadow-block)',
              padding: '28px',
            }}
          >
            {activeProductTab === 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: 13, color: '#777b86' }}>Ulasan Terverifikasi · Tokopedia</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#18794e', background: '#e6f6ed', padding: '2px 10px', borderRadius: 999 }}>
                    Positif · 96,4%
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-signifier)', fontSize: 21, lineHeight: 1.35, color: '#17191c', marginBottom: 20 }}>
                  “Barang original 100%, kualitas audio jernih dan pengiriman kurir sangat cepat sampai tujuan.”
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Probabilitas Positif', pct: 96.4, color: '#17191c' },
                    { label: 'Probabilitas Netral', pct: 2.8, color: '#979799' },
                    { label: 'Probabilitas Negatif', pct: 0.8, color: '#d9d9de' },
                  ].map((bar) => (
                    <div key={bar.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                        <span style={{ color: '#52555d' }}>{bar.label}</span>
                        <span style={{ fontWeight: 500 }}>{bar.pct}%</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 999, background: '#f2f2f3', overflow: 'hidden' }}>
                        <div style={{ width: `${bar.pct}%`, height: '100%', background: bar.color, borderRadius: 999 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeProductTab === 1 && (
              <div>
                <div style={{ fontSize: 13, color: '#777b86', marginBottom: 16 }}>
                  Duel Indeks Reputasi Produk Audio
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ padding: 16, borderRadius: 14, background: '#fafafb', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize: 12, color: '#777b86' }}>KANDIDAT A</div>
                    <div style={{ fontSize: 15, fontWeight: 600, margin: '4px 0 10px' }}>Eggel Fortis 2</div>
                    <div style={{ fontSize: 28, fontFamily: 'var(--font-signifier)' }}>74,2</div>
                    <div style={{ fontSize: 11.5, color: '#777b86' }}>Indeks Reputasi / 100</div>
                  </div>
                  <div style={{ padding: 16, borderRadius: 14, background: '#fbe1d1', color: '#5d2a1a' }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>KANDIDAT B · UNGGUL</div>
                    <div style={{ fontSize: 15, fontWeight: 600, margin: '4px 0 10px' }}>JBL Go 3 Speaker</div>
                    <div style={{ fontSize: 28, fontFamily: 'var(--font-signifier)' }}>94,0</div>
                    <div style={{ fontSize: 11.5, opacity: 0.8 }}>+19,8 poin keunggulan</div>
                  </div>
                </div>
              </div>
            )}

            {activeProductTab === 2 && (
              <div>
                <div style={{ fontSize: 13, color: '#777b86', marginBottom: 12 }}>
                  Pemrosesan Batch CSV & Koreksi Inkremental
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { text: 'Packing rapi, pengiriman cepat sesuai pesanan', sentiment: 'Positif', conf: '98,1%' },
                    { text: 'Standar saja sesuai harga, lumayan buat harian', sentiment: 'Netral', conf: '89,4%' },
                    { text: 'Barang datang lecet dan respon penjual lambat', sentiment: 'Negatif', conf: '97,2%' },
                  ].map((row, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        borderRadius: 12,
                        background: '#fafafb',
                        fontSize: 13,
                      }}
                    >
                      <span style={{ color: '#17191c', maxWidth: '68%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.text}
                      </span>
                      <span style={{ fontWeight: 500, color: '#52555d' }}>
                        {row.sentiment} ({row.conf})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeProductTab === 3 && (
              <div>
                <div style={{ fontSize: 13, color: '#777b86', marginBottom: 14 }}>
                  Ringkasan Eksperimen Pipeline Terbaik
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ padding: 14, borderRadius: 12, background: '#fafafb' }}>
                    <div style={{ fontSize: 12, color: '#777b86' }}>Macro F1-Score</div>
                    <div style={{ fontSize: 26, fontWeight: 600, marginTop: 4 }}>77,28%</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 12, background: '#fafafb' }}>
                    <div style={{ fontSize: 12, color: '#777b86' }}>Akurasi Uji</div>
                    <div style={{ fontSize: 26, fontWeight: 600, marginTop: 4 }}>85,90%</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 12, background: '#fafafb', gridColumn: 'span 2' }}>
                    <div style={{ fontSize: 12, color: '#777b86' }}>Arsitektur</div>
                    <div style={{ fontSize: 14.5, fontWeight: 500, marginTop: 4 }}>
                      CountVectorizer N-Gram (1, 2) + Sastrawi + MultinomialNB
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. CUSTOMER / CORPUS STORY SECTION (BLUSH PEACH #fbe1d1 — CHUNK 2291)
         ==================================================================== */}
      <section
        id="studi-korpus"
        ref={storyRef}
        style={{ backgroundColor: '#fbe1d1', color: '#5d2a1a', padding: '96px 24px' }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '48px',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 20 }}>
                Studi Korpus E-Commerce ›
              </div>

              <div style={{ minHeight: '210px' }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-signifier)',
                    fontWeight: 400,
                    fontSize: 'clamp(30px, 3.4vw, 44px)',
                    lineHeight: 1.24,
                    letterSpacing: '-0.66px',
                    color: '#5d2a1a',
                    margin: '0 0 18px',
                  }}
                >
                  {customerStories[activeStoryIndex].quote}
                </h2>
                <p style={{ fontSize: '16px', color: 'rgba(93,42,26,0.78)', margin: 0 }}>
                  {customerStories[activeStoryIndex].author}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 28, marginBottom: 40, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="steep-btn-filled"
                  style={{ backgroundColor: '#5d2a1a', borderColor: '#5d2a1a' }}
                  onClick={() => onEnterWorkspace('prediksi', customerStories[activeStoryIndex].querySample)}
                >
                  Uji Sampel Kategori Ini →
                </button>
                <button
                  type="button"
                  className="steep-btn-ghost"
                  style={{ color: '#5d2a1a' }}
                  onClick={() => onEnterWorkspace('evaluasi')}
                >
                  Lihat Distribusi 29 Kategori
                </button>
              </div>

              {/* Brand / Category Selector Bar with Sliding Top Indicator (Matches v component in Chunk 2291) */}
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  borderTop: '1px solid rgba(93,42,26,0.18)',
                  paddingTop: '16px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-1px',
                    left: `${activeStoryIndex * (100 / customerStories.length)}%`,
                    width: `${100 / customerStories.length}%`,
                    height: '2px',
                    backgroundColor: '#5d2a1a',
                    transition: 'left 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />
                {customerStories.map((item, idx) => (
                  <button
                    key={item.brand}
                    type="button"
                    onClick={() => setActiveStoryIndex(idx)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      color: '#5d2a1a',
                      opacity: activeStoryIndex === idx ? 1 : 0.45,
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

            {/* Right Visual Card */}
            <div
              style={{
                borderRadius: '24px',
                backgroundColor: 'rgba(255,255,255,0.58)',
                border: '1px solid rgba(93,42,26,0.1)',
                padding: '36px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '380px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-signifier)', fontSize: '22px', color: '#5d2a1a' }}>
                  {customerStories[activeStoryIndex].brand}
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
                  {customerStories[activeStoryIndex].metricBadge}
                </span>
              </div>

              <div style={{ margin: '28px 0' }}>
                <div style={{ fontSize: '56px', fontFamily: 'var(--font-signifier)', lineHeight: 1.05, color: '#5d2a1a' }}>
                  85,90%
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(93,42,26,0.75)', marginTop: 6 }}>
                  Akurasi klasifikasi terverifikasi pada pengujian 1.092 ulasan uji (rasio 80:20)
                </div>
              </div>

              <div
                style={{
                  padding: '16px 18px',
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  color: '#17191c',
                  fontSize: '13.5px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: '#52555d' }}>“{customerStories[activeStoryIndex].querySample}”</span>
                <span style={{ fontWeight: 600, color: '#5d2a1a', marginLeft: 12, whiteSpace: 'nowrap' }}>
                  Positif →
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. SEMANTIC PLATFORM SECTION (DARK INK #17191c — CHUNK 2092)
         ==================================================================== */}
      <section
        id="arsitektur-semantik"
        ref={semanticRef}
        style={{ backgroundColor: '#17191c', color: '#ffffff', padding: '104px 24px' }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <SteepHeadingBlock
            isInView={semanticInView}
            darkMode
            size="lg"
            lines={[
              { text: 'Fondasi NLP semantik' },
              { text: 'yang terukur dan terbuka', italicWord: 'semantik' },
            ]}
            description="Pipeline klasifikasi dirancang khusus untuk morfologi bahasa Indonesia dan ragam kata tidak baku di marketplace lokal."
          />

          {/* Dark Mode Tab Bar */}
          <div style={{ position: 'relative', margin: '36px 0 32px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {semanticTabs.map((tab, idx) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSemanticTab(idx)}
                  style={{
                    width: '170px',
                    marginRight: '20px',
                    padding: '16px 0',
                    background: 'transparent',
                    border: 'none',
                    color: activeSemanticTab === idx ? '#ffffff' : 'rgba(255,255,255,0.45)',
                    fontSize: '14.5px',
                    fontWeight: activeSemanticTab === idx ? 500 : 420,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '170px',
                height: '2px',
                backgroundColor: '#ffffff',
                transform: `translateX(${activeSemanticTab * 190}px)`,
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '36px',
              alignItems: 'center',
              marginTop: '24px',
            }}
          >
            <div>
              <p style={{ fontSize: '17px', lineHeight: 1.55, color: 'rgba(255,255,255,0.72)', margin: '0 0 28px' }}>
                {semanticTabs[activeSemanticTab].description}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 32 }}>
                {semanticTabs[activeSemanticTab].metrics.map((m) => (
                  <div
                    key={m.label}
                    style={{
                      padding: '16px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <div style={{ fontSize: '22px', fontFamily: 'var(--font-signifier)', color: '#fbe1d1' }}>
                      {m.value}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="steep-btn-secondary-dark"
                onClick={() => onEnterWorkspace('evaluasi')}
              >
                Pelajari Evaluasi Model →
              </button>
            </div>

            <div
              style={{
                borderRadius: '20px',
                backgroundColor: '#202328',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '28px',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '13.5px',
                lineHeight: 1.65,
                color: '#e5e7eb',
                overflowX: 'auto',
              }}
            >
              <div style={{ display: 'flex', gap: 7, marginBottom: 16 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.18)' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.18)' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.18)' }} />
              </div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{semanticTabs[activeSemanticTab].code}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. STEEP AI SECTION (MIST GRAY #f2f2f3 WITH FLOATING TEAM BUBBLES — CHUNK 856)
         ==================================================================== */}
      <section
        id="sentimen-ai"
        ref={aiRef}
        style={{ backgroundColor: '#f2f2f3', padding: '104px 24px', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#52555d', marginBottom: 12 }}>
            Sentimen AI ›
          </div>

          <SteepHeadingBlock
            isInView={aiInView}
            size="xl"
            lines={[
              { text: 'Analitik mendalam,' },
              { text: 'ditenagai kecerdasan buatan', italicWord: 'mendalam,' },
            ]}
            description="Ajukan satu pertanyaan atau tempel tautan produk marketplace. Sentimen AI membedah ratusan ulasan, mengekstrak kelebihan serta kekurangan, dan menyusun kesimpulan yang siap dibagikan."
          />

          {/* Central Report Preview with Floating Team Avatar Bubbles (Matches j & C in Chunk 4712/856) */}
          <div style={{ position: 'relative', marginTop: '56px', marginBottom: '64px' }}>
            {/* Floating Bubble 1: Left Top */}
            <div
              className="hidden lg:flex"
              style={{
                position: 'absolute',
                left: '0%',
                top: '14%',
                width: '290px',
                zIndex: 10,
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
                }}
              >
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#fbe1d1', color: '#5d2a1a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>
                  R
                </span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#17191c' }}>Rina</span>
                <span style={{ fontSize: '12px', color: 'rgba(23,25,28,0.45)' }}>Tim Produk</span>
              </div>
              <div
                style={{
                  borderRadius: '20px',
                  backgroundColor: '#ffffff',
                  padding: '14px 18px',
                  fontSize: '12.5px',
                  lineHeight: 1.45,
                  color: '#17191c',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
                }}
              >
                Apakah lonjakan keluhan pengiriman minggu ini memengaruhi skor reputasi kategori Elektronik?
              </div>
            </div>

            {/* Floating Bubble 2: Right Middle */}
            <div
              className="hidden lg:flex"
              style={{
                position: 'absolute',
                right: '0%',
                top: '42%',
                width: '310px',
                zIndex: 10,
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
                }}
              >
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#dce8fc', color: '#163252', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>
                  A
                </span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#17191c' }}>Arif</span>
                <span style={{ fontSize: '12px', color: 'rgba(23,25,28,0.45)' }}>Riset Pasar</span>
              </div>
              <div
                style={{
                  borderRadius: '20px',
                  backgroundColor: '#ffffff',
                  padding: '14px 18px',
                  fontSize: '12.5px',
                  lineHeight: 1.45,
                  color: '#17191c',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
                }}
              >
                Bandingkan sentimen ulasan TWS Lenovo Thinkplus LP40 vs Pro 4 TWS untuk rekomendasi katalog.
              </div>
            </div>

            {/* Central Elevated Report Card (max-w-[788px] mx-auto) */}
            <div
              style={{
                maxWidth: '788px',
                margin: '0 auto',
                borderRadius: '24px',
                backgroundColor: '#ffffff',
                boxShadow: 'var(--shadow-window)',
                padding: 'clamp(24px, 4vw, 40px)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 13, color: '#979799' }}>Laporan Otomatis · Sentimen AI</span>
                <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, background: '#f2f2f3', color: '#17191c' }}>
                  TF-IDF + MultinomialNB
                </span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-signifier)', fontWeight: 400, fontSize: 28, margin: '0 0 12px' }}>
                Sintesis Reputasi Lintas Marketplace
              </h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.55, color: '#52555d', margin: '0 0 24px' }}>
                Berdasarkan ekstraksi fitur TF-IDF pada 5.459 ulasan korpus aktif, faktor <strong>kecepatan kurir</strong>,{' '}
                <strong>keaslian produk</strong>, dan <strong>kerapian pengemasan</strong> menyumbang bobot informasi
                tertinggi terhadap klasifikasi kelas Positif.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                <div style={{ padding: 16, borderRadius: 16, background: '#fafafb' }}>
                  <div style={{ fontSize: 12, color: '#777b86' }}>Token Positif Dominan</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginTop: 6 }}>“original”, “cepat”, “rapi”</div>
                </div>
                <div style={{ padding: 16, borderRadius: 16, background: '#fafafb' }}>
                  <div style={{ fontSize: 12, color: '#777b86' }}>Token Negatif Dominan</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginTop: 6 }}>“rusak”, “kecewa”, “tipis”</div>
                </div>
                <div style={{ padding: 16, borderRadius: 16, background: '#fbe1d1', color: '#5d2a1a' }}>
                  <div style={{ fontSize: 12 }}>Rekomendasi Aksi</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginTop: 6 }}>Audit kualitas kemasan</div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Feature Columns Below AI Report */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '28px',
            }}
          >
            {[
              {
                title: 'Bebas halusinasi dengan metrik terukur',
                desc: 'Setiap kesimpulan diikat langsung pada probabilitas kelas Multinomial Naive Bayes dan skor frekuensi TF-IDF aktual.',
              },
              {
                title: 'Tarik ulasan live dari 8 marketplace',
                desc: 'Tempel URL atau nama produk dari Tokopedia, Shopee, Lazada, Blibli, ZALORA, Sociolla, Eraspace, atau Ruparupa.',
              },
              {
                title: 'Laporan komparasi siap ekspor PDF',
                desc: 'Cetak laporan perbandingan dua produk lengkap dengan indeks reputasi dan rincian ulasan untuk dokumentasi tim.',
              },
            ].map((feat) => (
              <div
                key={feat.title}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  padding: '24px',
                }}
              >
                <div style={{ fontSize: '17px', fontWeight: 500, color: '#17191c', marginBottom: 8 }}>
                  {feat.title}
                </div>
                <p style={{ fontSize: '14.5px', lineHeight: 1.5, color: 'rgba(23,25,28,0.6)', margin: 0 }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          8. GET STARTED SECTION (ARCHITECTURAL DOOR ILLUSTRATION — CHUNK 1070)
         ==================================================================== */}
      <section
        ref={getStartedRef}
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '112px 24px 128px' }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap-reverse',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '64px',
          }}
        >
          <div style={{ flex: '1 1 420px', maxWidth: '520px' }}>
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

          {/* Architectural Portal Illustration (Matches #door in Chunk 1070) */}
          <div style={{ width: '320px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 280 300" fill="none" style={{ width: '100%', height: 'auto' }}>
              <defs>
                <linearGradient id="portalGlow" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fbe1d1" />
                  <stop offset="55%" stopColor="#e8f0fe" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
              {/* Arch Frame */}
              <path
                d="M64 260 V116 C64 68 100 32 148 32 C196 32 232 68 232 116 V260 Z"
                fill="url(#portalGlow)"
                stroke="#17191c"
                strokeWidth="1.6"
              />
              {/* Slightly Open Architectural Door Leaf */}
              <path
                d="M64 260 L122 238 V54 L64 116 Z"
                fill="#ffffff"
                stroke="#17191c"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              {/* Floor Shadow / Steps */}
              <path d="M32 260 H256" stroke="#17191c" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M52 274 H236" stroke="#979799" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* ====================================================================
          9. MINIMAL EDITORIAL FOOTER
         ==================================================================== */}
      <footer
        style={{
          borderTop: '1px solid rgba(23,25,28,0.06)',
          padding: '48px 24px',
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
            gap: '20px',
            fontSize: '14px',
            color: '#777b86',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#17191c', fontWeight: 500 }}>
            <span>Sentimen</span>
            <span style={{ color: '#a3a6af' }}>·</span>
            <span style={{ fontWeight: 400, color: '#777b86' }}>
              Platform Analitik Sentimen Ulasan E-Commerce Indonesia
            </span>
          </div>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
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
    </div>
  );
};

export default LandingPage;
