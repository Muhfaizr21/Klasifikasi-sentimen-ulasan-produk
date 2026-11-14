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
     3. Interactive Section States (With Auto-Advancing Progress Timers)
     ------------------------------------------------------------------------ */
  const [activeIntroCard, setActiveIntroCard] = useState(0);
  const [activeProductTab, setActiveProductTab] = useState(2); // Default to "Reports" (Laporan) matching Screenshot 1
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [activeSemanticTab, setActiveSemanticTab] = useState(0); // Default to "Semantic platform" matching Screenshot 2

  const [introRef, introInView] = useSteepInView();
  const [productRef, productInView] = useSteepInView();
  const [storyRef, _storyInView] = useSteepInView();
  const [semanticRef, semanticInView] = useSteepInView();
  const [aiRef, aiInView] = useSteepInView();
  const [getStartedRef, getStartedInView] = useSteepInView();

  const handleSelectProductTab = (idx: number) => {
    setActiveProductTab(idx);
  };

  const handleSelectSemanticTab = (idx: number) => {
    setActiveSemanticTab(idx);
  };

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

  const productTabs = [
    {
      id: 'AI',
      label: 'AI',
      duration: 11,
      description:
        'Ajukan pertanyaan kompleks dan dapatkan wawasan yang mendalam serta andal. Seluruhnya ditenagai oleh metrik terukur.',
      ctaTab: 'prediksi' as const,
    },
    {
      id: 'explore',
      label: 'Eksplorasi',
      duration: 10,
      description:
        'Selami metrik sentimen dan eksplorasi visualisasi lintas kategori dalam hitungan detik dengan dukungan AI.',
      ctaTab: 'prediksi' as const,
    },
    {
      id: 'reports',
      label: 'Laporan',
      duration: 12,
      description:
        'Buat atau hasilkan berbagai jenis konten. Mulai dari dasbor dan tinjauan bisnis hingga analisis komparasi mendalam.',
      ctaTab: 'komparasi' as const,
    },
    {
      id: 'drilldown',
      label: 'Bedah Data',
      duration: 10,
      description:
        'Klik pada metrik mana pun dan bedah rincian tingkat baris dari ulasan pelanggan, token TF-IDF, atau produk.',
      ctaTab: 'batch' as const,
    },
    {
      id: 'targets',
      label: 'Target KPI',
      duration: 9,
      description:
        'Muat data target akurasi dan kepuasan secara terpusat agar selalu tersedia untuk setiap metrik di ruang kerja Anda.',
      ctaTab: 'evaluasi' as const,
    },
    {
      id: 'maps',
      label: 'Peta Korpus',
      duration: 9,
      description:
        'Peta distribusi marketplace yang intuitif untuk dieksplorasi semua orang. Buka peta dan telusuri metrik secara instan.',
      ctaTab: 'evaluasi' as const,
    },
  ];

  const customerStories = [
    {
      brand: 'Voi · Elektronik',
      metricBadge: '1.373 Ulasan Terverifikasi',
      quote: '“Saya belum pernah melihat adopsi analitik sentimen secepat ini sepanjang karier produk saya.”',
      author: 'Mengapa tim kategori Elektronik beralih dari rekap spreadsheet ke Sentimen',
      querySample: 'Suara jernih bass mantap pengiriman cepat packing aman',
      bgAccent: '#fbe1d1',
      textAccent: '#5d2a1a',
    },
    {
      brand: 'Juni · Fashion',
      metricBadge: '930 Ulasan Terverifikasi',
      quote: '“Sentimen mencapai keseimbangan sempurna antara kekuatan model statistik dan kemudahan penggunaan.”',
      author: 'Dari buta data menjadi dipimpin oleh wawasan ulasan pelanggan di kategori Fashion',
      querySample: 'Bahan adem jahitan rapi ukuran pas sesuai deskripsi',
      bgAccent: '#fbe1d1',
      textAccent: '#5d2a1a',
    },
    {
      brand: 'Bounce · Rumah Tangga',
      metricBadge: '745 Ulasan Terverifikasi',
      quote: '“Kami menguji 5 skenario arsitektur pipeline sebelum memilih konfigurasi N-Gram terbaik.”',
      author: 'Bagaimana tim evaluasi beralih dari dasbor statis ke metrik reputasi terukur',
      querySample: 'Kualitas teflon tebal anti lengket pengiriman sangat aman',
      bgAccent: '#fbe1d1',
      textAccent: '#5d2a1a',
    },
    {
      brand: 'Once Upon · Kesehatan',
      metricBadge: '432 Ulasan Terverifikasi',
      quote: '“Kini ada satu tempat terpusat di mana setiap anggota tim dapat mencari jawaban yang objektif.”',
      author: 'Perjalanan membangun analitik berbasis metrik pada kategori Kesehatan & Kecantikan',
      querySample: 'Produk original segel rapi cocok di kulit pengiriman cepat',
      bgAccent: '#fbe1d1',
      textAccent: '#5d2a1a',
    },
  ];

  const semanticTabs = [
    {
      id: 'Semantic platform',
      label: 'Platform semantik',
      duration: 12,
      description:
        'Definisikan metrik, dimensi, serta entitas produk dan tenagai seluruh analisis maupun pelaporan dengan blok pembangun yang terukur.',
    },
    {
      id: 'Steep API',
      label: 'Sentimen API',
      duration: 9,
      description:
        'Gunakan metrik Anda di mana saja. Ekspor data, hubungkan ke notebook Python, atau sematkan di aplikasi Anda sendiri.',
    },
    {
      id: 'Metrics catalog',
      label: 'Katalog metrik',
      duration: 10,
      description:
        'Kelola dan publikasikan seluruh metrik korpus di satu tempat. Tidak ada lagi dokumentasi yang tidak pernah dilihat.',
    },
    {
      id: 'Define in code',
      label: 'Definisi dalam kode',
      duration: 9,
      description:
        'Kelola model semantik TF-IDF dan kamus Sastrawi di dalam kode dengan tinjauan sejawat serta kontrol versi yang kuat.',
    },
    {
      id: 'Manage in app',
      label: 'Kelola di aplikasi',
      duration: 9,
      description:
        'Kelola model semantik dan koreksi label Online Learning secara efisien menggunakan antarmuka admin yang komprehensif.',
    },
  ];

  return (
    <div className="steep-page">
      {/* ====================================================================
          1. FIXED WHISPER-QUIET TOP NAVIGATION
         ==================================================================== */}
      <header
        className={`steep-nav-header ${isNavScrolled ? 'is-scrolled' : ''} ${
          semanticInView ? 'is-dark-section' : ''
        }`}
      >
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
                          ◧
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
          4. PRODUCT SECTION ("ENGAGE EVERYONE" — VERTICAL ACCORDION + 960x640 WINDOW — CHUNK 5206)
         ==================================================================== */}
      <section
        ref={productRef}
        style={{
          backgroundColor: '#FAFAFB',
          padding: '96px 24px 128px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Warm Lime/Peach/Sky Ambient Glow Behind Right Window (bg-home-showcase.jpg) */}
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

        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div
            onClick={() => onEnterWorkspace('prediksi')}
            style={{
              fontSize: '13px',
              fontWeight: 450,
              color: '#17191c',
              marginBottom: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
            }}
          >
            <span>Produk</span>
            <span style={{ opacity: 0.35 }}>›</span>
          </div>

          <SteepHeadingBlock
            isInView={productInView}
            size="xl"
            lines={[{ text: 'Libatkan setiap tim' }]}
            description="Alur kerja berbasis AI yang membuka analisis mendalam dan pelaporan terukur bagi seluruh pengguna."
            cta={
              <button
                type="button"
                className="steep-btn-secondary"
                onClick={() => onEnterWorkspace(productTabs[activeProductTab].ctaTab)}
              >
                <span>Pelajari lebih lanjut</span>
                <span style={{ opacity: 0.55 }}>→</span>
              </button>
            }
          />

          {/* 2-Column Vertical Accordion + 960x640 App Window Showcase (Matches Screenshot 1 100%) */}
          <div className="steep-showcase-layout" style={{ marginTop: '56px' }}>
            {/* Left Column: 6 Vertical Accordion Items */}
            <div className="steep-v-tabs">
              {productTabs.map((tab, idx) => {
                const isActive = activeProductTab === idx;
                return (
                  <div key={tab.id} style={{ display: 'flex', flexDirection: 'column' }}>
                    <button
                      type="button"
                      onClick={() => handleSelectProductTab(idx)}
                      className={`steep-v-tab-btn ${isActive ? 'is-active' : 'is-idle'}`}
                    >
                      <p className="steep-v-tab-title">{tab.label}</p>
                      <div className={`steep-v-tab-collapse ${isActive ? 'is-open' : 'is-closed'}`}>
                        <span className="steep-v-tab-desc">
                          {tab.description}
                        </span>
                      </div>
                      <span className="steep-v-tab-line-track">
                        <span className="steep-v-tab-line-fill" />
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Right Column: 960x640 Desktop App Window (Matches Screenshot 1 Leadership Report & All 6 Views) */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>
              <div
                key={`prod-stage-${activeProductTab}`}
                className="steep-showcase-stage"
                style={{
                  width: '100%',
                  maxWidth: '960px',
                  minHeight: '590px',
                  borderRadius: '22px',
                  backgroundColor: '#ffffff',
                  boxShadow: 'var(--shadow-window)',
                  border: '1px solid rgba(4,23,43,0.06)',
                  display: 'flex',
                  overflow: 'hidden',
                }}
              >
                {/* Left Mini Sidebar inside 960x640 App Window */}
                <div
                  className="hidden sm:flex"
                  style={{
                    width: '176px',
                    backgroundColor: '#fafafb',
                    borderRight: '1px solid rgba(23,25,28,0.06)',
                    padding: '16px 12px',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                  }}
                >
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

                {/* Right Main Content Canvas of 960x640 App Window */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', minWidth: 0 }}>
                  {/* Window Top Header Bar */}
                  <div
                    style={{
                      height: '48px',
                      padding: '0 24px',
                      borderBottom: '1px solid rgba(23,25,28,0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#777b86' }}>
                      <span>‹</span>
                      <span>{productTabs[activeProductTab].label}</span>
                      <span>/</span>
                      <span style={{ color: '#8b5cf6' }}>★</span>
                      <span style={{ color: '#17191c', fontWeight: 500 }}>
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                      <span style={{ color: '#979799' }}>☆</span>
                      <span style={{ color: '#979799' }}>•••</span>
                    </div>
                  </div>

                  {/* Dynamic Body Content for Each of the 6 Vertical Accordion Tabs */}
                  {activeProductTab === 2 && (
                    /* TAB 2: REPORTS ("Leadership report" — Matches Screenshot 1 100%!) */
                    <div style={{ padding: '26px 36px', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                      <div style={{ color: '#7c5dfa', fontSize: '24px', marginBottom: 6 }}>★</div>
                      <h3 style={{ fontSize: '26px', fontWeight: 600, color: '#17191c', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
                        Laporan eksekutif
                      </h3>

                      {/* Filter Pills */}
                      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
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

                      {/* Executive summary with Blue Cursor "A" */}
                      <div style={{ position: 'relative', marginBottom: 22 }}>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#17191c', marginBottom: 6 }}>
                          Ringkasan eksekutif
                        </div>
                        <p style={{ fontSize: '12px', lineHeight: 1.55, color: '#3f424a', margin: 0, maxWidth: '580px' }}>
                          Secara keseluruhan, indeks reputasi kuartal keempat meningkat kuat sebesar 10,4% dibandingkan tahun lalu.
                          Pertumbuhan didorong oleh momentum kepuasan yang solid pada pembeli baru maupun pelanggan berulang. Kategori
                          Elektronik menyumbang sekitar sepertiga dari total ulasan positif.
                        </p>
                        {/* Floating Blue Cursor A */}
                        <div style={{ position: 'absolute', left: '198px', bottom: '-20px', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                          <span style={{ fontSize: 10, color: '#4a85e8' }}>↖</span>
                          <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#6ba1f7', color: '#fff', fontSize: 9, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            A
                          </span>
                        </div>
                      </div>

                      {/* Two Side-by-Side Cards: Green-bordered 42.3K card + Stacked Bar Chart card */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        {/* Left Card: Green Bordered Revenue / Volume Card with Green JL Cursor */}
                        <div
                          style={{
                            borderRadius: '14px',
                            border: '1.5px solid #5ec27f',
                            padding: '16px 18px',
                            position: 'relative',
                            minHeight: '195px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#17191c' }}>Ulasan Terverifikasi</div>
                            <div style={{ fontSize: '10.5px', color: '#979799' }}>3 bulan terakhir</div>
                          </div>

                          <div style={{ textAlign: 'center', margin: '18px 0' }}>
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

                        {/* Right Card: Stacked Bar Chart ("Revenue by market") */}
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

                      {/* Bottom Cohort Card Preview */}
                      <div
                        style={{
                          borderRadius: '14px',
                          border: '1px solid rgba(23,25,28,0.08)',
                          padding: '14px 18px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
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
                    <div style={{ padding: '28px 36px', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                        <div style={{ background: '#f3f3f5', borderRadius: 999, padding: '8px 18px', fontSize: 12.5, color: '#17191c' }}>
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
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
                    <div style={{ padding: '28px 36px', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
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
                    <div style={{ padding: '28px 36px', flex: 1 }}>
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
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: '#fafafb', fontSize: 12.5 }}>
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
                    <div style={{ padding: '28px 36px', flex: 1 }}>
                      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Pencapaian Target PRD & Evaluasi Model</div>
                      <div style={{ fontSize: 12, color: '#777b86', marginBottom: 18 }}>
                        Perbandingan metrik aktual terhadap ambang batas minimum spesifikasi akademik
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
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
                    <div style={{ padding: '28px 36px', flex: 1 }}>
                      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Peta Distribusi 8 Marketplace Indonesia</div>
                      <div style={{ fontSize: 12, color: '#777b86', marginBottom: 18 }}>
                        Cakupan penarikan ulasan langsung (live scraper) dan korpus terverifikasi
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
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
      </section>

      {/* ====================================================================
          5. CUSTOMER / CORPUS STORY SECTION (CHUNKS 2291 — 4 BRAND SWITCHER)
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
              <div style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '0.02em', marginBottom: 24 }}>
                Kisah pelanggan & korpus ›
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

              {/* 4-Brand Selector Bar with Sliding Top Indicator (Matches v component in Chunk 2291) */}
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

            {/* Right Square Visual Card */}
            <div
              key={`story-card-${activeStoryIndex}`}
              className="steep-showcase-stage"
              style={{
                borderRadius: '24px',
                backgroundColor: 'rgba(255,255,255,0.58)',
                border: '1px solid rgba(93,42,26,0.1)',
                padding: '36px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '390px',
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
          6. SEMANTIC PLATFORM SECTION ("SHIP METRICS, NOT DASHBOARDS" — SCREENSHOT 2 — CHUNK 2092)
         ==================================================================== */}
      <section
        id="arsitektur-semantik"
        ref={semanticRef}
        style={{
          backgroundColor: '#121212',
          color: '#ffffff',
          padding: '112px 24px 128px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Top-to-Bottom Sheen + Noise (Matches Chunk 2092) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(255,255,255,0) 10%, rgba(255,255,255,0.04) 100%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div
            onClick={() => onEnterWorkspace('evaluasi')}
            style={{
              fontSize: '13px',
              fontWeight: 450,
              color: 'rgba(255,255,255,0.85)',
              marginBottom: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
            }}
          >
            <span>Platform semantik</span>
            <span style={{ opacity: 0.35 }}>›</span>
          </div>

          <SteepHeadingBlock
            isInView={semanticInView}
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
                onClick={() => onEnterWorkspace('evaluasi')}
              >
                <span>Pelajari lebih lanjut</span>
                <span style={{ opacity: 0.6 }}>→</span>
              </button>
            }
          />

          {/* 2-Column Dark Vertical Accordion + 960x640 Architecture Diagram (Matches Screenshot 2 100%!) */}
          <div className="steep-showcase-layout" style={{ marginTop: '56px' }}>
            {/* Left Column: 5 Dark Vertical Accordion Items */}
            <div className="steep-v-tabs">
              {semanticTabs.map((tab, idx) => {
                const isActive = activeSemanticTab === idx;
                return (
                  <div key={tab.id} style={{ display: 'flex', flexDirection: 'column' }}>
                    <button
                      type="button"
                      onClick={() => handleSelectSemanticTab(idx)}
                      className={`steep-v-tab-btn is-dark ${isActive ? 'is-active' : 'is-idle'}`}
                    >
                      <p className="steep-v-tab-title">{tab.label}</p>
                      <div className={`steep-v-tab-collapse ${isActive ? 'is-open' : 'is-closed'}`}>
                        <span className="steep-v-tab-desc">
                          {tab.description}
                        </span>
                      </div>
                      <span className="steep-v-tab-line-track is-dark">
                        <span className="steep-v-tab-line-fill is-dark" />
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Right Column: 960x640 Dark Architectural Diagram Card with Deep Plum Glow (Matches Screenshot 2 100%!) */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>
              <div
                key={`sem-stage-${activeSemanticTab}`}
                className="steep-showcase-stage"
                style={{
                  width: '100%',
                  maxWidth: '960px',
                  minHeight: '560px',
                  borderRadius: '24px',
                  background:
                    'radial-gradient(65% 55% at 52% 95%, rgba(126, 58, 118, 0.55) 0%, rgba(62, 34, 68, 0.28) 48%, rgba(22, 22, 25, 0.96) 100%), #161619',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.45)',
                  padding: 'clamp(24px, 4vw, 48px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {activeSemanticTab === 0 && (
                  /* TAB 0: SEMANTIC PLATFORM ARCHITECTURE NODE DIAGRAM (Matches Screenshot 2 100%!) */
                  <div style={{ width: '100%', position: 'relative' }}>
                    {/* SVG Dotted Curved Connector Lines Between Left Sources -> Center Hub -> Right Outputs */}
                    <svg
                      viewBox="0 0 860 420"
                      className="hidden md:block"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                      }}
                    >
                      {/* Left 5 source curves into center hub */}
                      <path d="M 185 95 C 235 95, 240 185, 285 185" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" strokeDasharray="2 3" />
                      <path d="M 185 152 C 230 152, 240 198, 285 198" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" strokeDasharray="2 3" />
                      <path d="M 185 210 C 230 210, 245 210, 285 210" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" strokeDasharray="2 3" />
                      <path d="M 185 268 C 230 268, 240 222, 285 222" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" strokeDasharray="2 3" />
                      <path d="M 185 325 C 235 325, 240 235, 285 235" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" strokeDasharray="2 3" />

                      {/* Center hub curves out to Right card */}
                      <path d="M 595 185 C 630 185, 635 125, 670 125" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" strokeDasharray="2 3" />
                      <path d="M 595 198 C 630 198, 635 165, 670 165" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" strokeDasharray="2 3" />
                      <path d="M 595 210 C 630 210, 635 210, 670 210" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" strokeDasharray="2 3" />
                      <path d="M 595 222 C 630 222, 635 265, 670 265" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" strokeDasharray="2 3" />
                      <path d="M 595 235 C 630 235, 635 305, 670 305" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" strokeDasharray="2 3" />
                    </svg>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '28px',
                        alignItems: 'center',
                        position: 'relative',
                        zIndex: 2,
                      }}
                    >
                      {/* Left Column: 5 Data Source Pills */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '185px' }}>
                        {[
                          { name: 'BigQuery · PRDECT', col: '#4285F4', icon: '◈' },
                          { name: 'Databricks · Tokopedia', col: '#FF3621', icon: '❖' },
                          { name: 'Snowflake · Shopee', col: '#29B5E8', icon: '✦' },
                          { name: 'Redshift · Batch CSV', col: '#8C4FFF', icon: '◫' },
                          { name: 'Postgres · Live Stream', col: '#336791', icon: '◎' },
                        ].map((src) => (
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

                      {/* Center Column: Elevated Semantic Platform Hub Box */}
                      <div
                        style={{
                          borderRadius: '20px',
                          backgroundColor: 'rgba(43, 39, 50, 0.9)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          padding: '24px',
                          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>
                          <span>◠</span>
                          <span>Sentimen</span>
                        </div>
                        <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', marginBottom: 20 }}>
                          Semantic platform
                        </div>

                        {/* Top Wide Inner Box: Semantic model */}
                        <div
                          style={{
                            borderRadius: '12px',
                            backgroundColor: 'rgba(62, 56, 72, 0.75)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            padding: '24px 16px',
                            textAlign: 'center',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#ffffff',
                            marginBottom: '12px',
                          }}
                        >
                          Semantic model (TF-IDF + MNB)
                        </div>

                        {/* Bottom 3 Inner Boxes: Context, Caching, Control */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                          {['Context', 'Caching', 'Control'].map((sub) => (
                            <div
                              key={sub}
                              style={{
                                borderRadius: '12px',
                                backgroundColor: 'rgba(62, 56, 72, 0.75)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                padding: '22px 8px',
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

                      {/* Right Column: Steep / Sentimen Outputs Card */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                          <span>◠</span>
                          <span>Sentimen</span>
                        </div>
                        <div
                          style={{
                            width: '175px',
                            borderRadius: '18px',
                            backgroundColor: 'rgba(43, 39, 50, 0.9)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '18px 20px',
                            boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            fontSize: '12.5px',
                            color: 'rgba(255,255,255,0.88)',
                          }}
                        >
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
                          <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', margin: '2px 0' }} />
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
                  /* TAB 1: STEEP / SENTIMEN API */
                  <div style={{ width: '100%', maxWidth: '720px' }}>
                    <div style={{ fontSize: 13, color: '#fbe1d1', marginBottom: 8 }}>REST API & JSON Endpoint</div>
                    <div style={{ fontSize: 22, fontFamily: 'var(--font-signifier)', marginBottom: 18 }}>
                      POST /api/predict & /api/compare-products
                    </div>
                    <pre
                      style={{
                        background: 'rgba(0,0,0,0.45)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 16,
                        padding: 22,
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: '#e5e7eb',
                        overflowX: 'auto',
                      }}
                    >
                      {`{\n  "sentiment": "Positif",\n  "confidence": 0.9642,\n  "probabilities": { "Positif": 0.964, "Netral": 0.028, "Negatif": 0.008 },\n  "model_pipeline": "CountVectorizer(1,2) + Sastrawi + MultinomialNB",\n  "corpus_reference": "PRDECT-ID (5.459 ulasan)"\n}`}
                    </pre>
                  </div>
                )}

                {activeSemanticTab === 2 && (
                  /* TAB 2: METRICS CATALOG */
                  <div style={{ width: '100%', maxWidth: '760px' }}>
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
                      Katalog Metrik Terpusat (29 Kategori Produk)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                      {[
                        { name: 'Indeks Reputasi Produk', formula: 'Weighted Positif vs Negatif (0–100)', status: 'Governed' },
                        { name: 'Macro F1-Score Lintas Kelas', formula: 'Harmonic Mean Precision & Recall (77,28%)', status: 'Verified' },
                        { name: 'Kontribusi Token Log-Prob', formula: 'Δ Log-Likelihood per N-Gram (1, 2)', status: 'Explainable' },
                        { name: 'Distribusi Kategori Korpus', formula: '5.459 Sampel PRDECT-ID Tokopedia', status: 'Synced' },
                      ].map((cat) => (
                        <div key={cat.name} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', padding: 18, borderRadius: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{cat.name}</span>
                            <span style={{ fontSize: 11, color: '#fbe1d1' }}>{cat.status}</span>
                          </div>
                          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>{cat.formula}</div>
                        </div>
                      ))}
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
                        padding: 22,
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: '#e5e7eb',
                        overflowX: 'auto',
                      }}
                    >
                      {`metric: product_reputation_index\nmodel: multinomial_naive_bayes_v2\npreprocessing:\n  normalizer: sastrawi_slang_dictionary\n  ngram_range: [1, 2]\n  preserve_negation: ["tidak", "bukan", "kurang", "jangan"]\nevaluation:\n  test_accuracy: 0.8590\n  macro_f1: 0.7728`}
                    </pre>
                  </div>
                )}

                {activeSemanticTab === 4 && (
                  /* TAB 4: MANAGE IN APP */
                  <div style={{ width: '100%', maxWidth: '720px' }}>
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
                      Administrasi Model & Online Learning (partial_fit)
                    </div>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: 20 }}>
                      Koreksi hasil prediksi langsung dari antarmuka aplikasi dan perbarui bobot probabilitas
                      Multinomial Naive Bayes tanpa melatih ulang seluruh korpus dari nol.
                    </p>
                    <button type="button" className="steep-btn-secondary-dark" onClick={() => onEnterWorkspace('prediksi')}>
                      Buka Panel Online Learning →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4-Column Feature Strip Below Dark Showcase (Matches Module 4564 in Chunk 6140) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '32px',
              marginTop: '72px',
              paddingTop: '40px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {[
              {
                icon: '◈',
                title: 'Izin akses terperinci',
                desc: 'Kendalikan siapa yang dapat mengakses metrik korpus dan melakukan pelatihan ulang model.',
              },
              {
                icon: '✦',
                title: 'Caching cerdas',
                desc: 'Kurangi beban komputasi server. Respons prediksi instan di bawah 15ms bagi pengguna.',
              },
              {
                icon: '❖',
                title: 'Integrasi scikit-learn + Sastrawi',
                desc: 'Integrasi mulus ke lapisan pemrosesan bahasa alami bahasa Indonesia mandiri.',
              },
              {
                icon: '◎',
                title: 'Siap standar terbuka',
                desc: 'Kompatibel dengan standar industri terbaru untuk ekspor CSV, PDF, dan REST API.',
              },
            ].map((item) => (
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

      {/* ====================================================================
          7. STEEP AI SECTION ("UNLOCK DEEP ANALYSIS" — SCREENSHOT 3 — CHUNK 856)
         ==================================================================== */}
      <section
        id="sentimen-ai"
        ref={aiRef}
        style={{
          backgroundColor: '#f2f2f3',
          padding: '112px 24px 128px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Soft Lavender / Pink Galaxy Glow Behind AI Window (Matches bg-ai-section.jpg in Screenshot 3) */}
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

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div
            onClick={() => onEnterWorkspace('prediksi')}
            style={{
              fontSize: '13px',
              fontWeight: 450,
              color: '#17191c',
              marginBottom: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
            }}
          >
            <span>Sentimen AI</span>
            <span style={{ opacity: 0.35 }}>›</span>
          </div>

          <SteepHeadingBlock
            isInView={aiInView}
            size="xl"
            lines={[{ text: 'Buka analisis mendalam' }]}
            description="Sentimen AI melampaui jawaban sederhana untuk menghadirkan analisis komprehensif yang berakar langsung pada model semantik Anda."
            cta={
              <button
                type="button"
                className="steep-btn-secondary"
                onClick={() => onEnterWorkspace('prediksi')}
              >
                <span>Pelajari lebih lanjut</span>
                <span style={{ opacity: 0.55 }}>→</span>
              </button>
            }
          />

          {/* Central Report Window + 3 Floating Team Bubbles (Matches Screenshot 3 100%!) */}
          <div style={{ position: 'relative', marginTop: '64px', marginBottom: '80px' }}>
            {/* Floating Bubble 1: Mary Finance (Top-Left, left-[0%] top-[19%] w-[300px]) */}
            <div
              className="hidden lg:flex"
              style={{
                position: 'absolute',
                left: '0%',
                top: '19%',
                width: '300px',
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
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #5d2a1a, #c96b46)',
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  M
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#17191c' }}>Mary</span>
                <span style={{ fontSize: '12px', color: 'rgba(23,25,28,0.45)' }}>Finance</span>
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
                Apakah pertumbuhan ulasan positif sejalan dengan ekspektasi pendapatan kuartal ini?
              </div>
            </div>

            {/* Floating Bubble 2: Carl Sales (Bottom-Left, left-[0%] bottom-[4%] w-[340px]) */}
            <div
              className="hidden lg:flex"
              style={{
                position: 'absolute',
                left: '0%',
                bottom: '4%',
                width: '340px',
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
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #163252, #4a85e8)',
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  C
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#17191c' }}>Carl</span>
                <span style={{ fontSize: '12px', color: 'rgba(23,25,28,0.45)' }}>Sales</span>
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
                Analisis segmen pelanggan untuk memahami kategori mana yang berkinerja terbaik dan paling potensial tumbuh
              </div>
            </div>

            {/* Floating Bubble 3: Josephine Marketing (Middle-Right, right-[2%] top-[45%] w-[380px]) */}
            <div
              className="hidden lg:flex"
              style={{
                position: 'absolute',
                right: '0%',
                top: '45%',
                width: '360px',
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
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6b21a8, #d946ef)',
                    color: '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  J
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#17191c' }}>Josephine</span>
                <span style={{ fontSize: '12px', color: 'rgba(23,25,28,0.45)' }}>Marketing</span>
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
                Kampanye mana yang mendorong konversi ulasan tertinggi? Apakah kita perlu mengalokasikan ulang anggaran?
              </div>
            </div>

            {/* Central Elevated AI Window (max-w-[788px] mx-auto — Matches Screenshot 3 100%!) */}
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
              <div
                style={{
                  height: '48px',
                  padding: '0 22px',
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#e5e5e7' }} />
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#e5e5e7' }} />
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#e5e5e7' }} />
                  </div>
                  <span style={{ color: '#777b86' }}>◧</span>
                  <span style={{ color: '#979799' }}>‹</span>
                  <span style={{ color: '#979799' }}>›</span>
                  <span style={{ fontWeight: 600, color: '#17191c' }}>Sentimen vs tahun lalu ⌄</span>
                </div>
                <span style={{ fontWeight: 500, color: '#17191c' }}>+ Chat baru</span>
              </div>

              {/* Window Body */}
              <div style={{ padding: '28px 36px 32px' }}>
                {/* Right-Aligned User Prompt Bubble */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 22 }}>
                  <div
                    style={{
                      backgroundColor: '#f3f3f5',
                      borderRadius: '999px',
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

                {/* Embedded Chart Card ("Registration trend") */}
                <div
                  style={{
                    borderRadius: '16px',
                    border: '1px solid rgba(23,25,28,0.08)',
                    padding: '18px 22px',
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

                  <svg viewBox="0 0 640 165" style={{ width: '100%', height: 'auto' }}>
                    {[
                      { y: 28, l: '60k' },
                      { y: 68, l: '40k' },
                      { y: 108, l: '20k' },
                      { y: 144, l: '0' },
                    ].map((r) => (
                      <g key={r.l}>
                        <text x="0" y={r.y - 4} fill="#a3a6af" fontSize="9.5">
                          {r.l}
                        </text>
                        <line x1="0" y1={r.y} x2="620" y2={r.y} stroke="rgba(0,0,0,0.06)" />
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

                {/* Bottom Follow-up Composer Box inside AI Window */}
                <div
                  onClick={() => onEnterWorkspace('prediksi')}
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

          {/* 3 Square Visual Feature Cards Below AI Window (Matches Module 627 in Chunk 4712) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px',
            }}
          >
            {[
              {
                title: 'Jawaban yang dapat dipercaya',
                desc: 'Sentimen AI ditenagai oleh model semantik Anda sehingga setiap jawaban mencerminkan metrik yang terukur.',
                badge: 'TF-IDF + MultinomialNB Verified',
                accent: '#fbe1d1',
                visualTitle: '85,90% Akurasi',
              },
              {
                title: 'Hasilkan laporan instan',
                desc: 'Ubah percakapan analisis apa pun menjadi laporan yang siap dibagikan, diedit, dan dikembangkan bersama tim.',
                badge: 'Ekspor PDF & Eksekutif',
                accent: '#dce8fc',
                visualTitle: 'Laporan Reputasi',
              },
              {
                title: 'Dukung tim di tempat mereka bekerja',
                desc: 'Agen dan analis di seluruh tim bekerja dari metrik terukur yang sama melalui REST API dan Batch CSV.',
                badge: '8 Marketplace + CSV',
                accent: '#dfece3',
                visualTitle: 'Sinkronisasi Korpus',
              },
            ].map((card) => (
              <div key={card.title} style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  onClick={() => onEnterWorkspace('prediksi')}
                  style={{
                    aspectRatio: '1 / 1',
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
