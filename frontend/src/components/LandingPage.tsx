import React, { useState, useEffect, useRef } from 'react';
import '../styles/steep-landing.css';
import {
  clamp,
  type LandingPageProps,
  type WorkspaceTabTarget,
} from './landing/landingData';
import { useSteepInView } from './landing/useSteepInView';
import { LandingNavbar } from './landing/LandingNavbar';
import { HeroSection } from './landing/HeroSection';
import { IntroCardsSection } from './landing/IntroCardsSection';
import { ProductShowcaseSection } from './landing/ProductShowcaseSection';
import { CorpusStorySection } from './landing/CorpusStorySection';
import { SemanticPlatformSection } from './landing/SemanticPlatformSection';
import { AiDeepAnalysisSection } from './landing/AiDeepAnalysisSection';
import { GetStartedSection } from './landing/GetStartedSection';

export type { WorkspaceTabTarget, LandingPageProps };

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterWorkspace,
}) => {
  const [winSize, setWinSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 900,
  });
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [isNavOverDark, setIsNavOverDark] = useState(false);

  // Smoothed timeline value t in [0, 1.2] matching GSAP scrub: 0.7
  const [timelineT, setTimelineT] = useState(0);
  const targetTRef = useRef(0);
  const currentTRef = useRef(0);
  const heroSpacerRef = useRef<HTMLDivElement | null>(null);
  const [semanticRef, semanticInView] = useSteepInView();

  useEffect(() => {
    const onResize = () => {
      setWinSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Exact Steep scaleFactor, containerHeight, yOffset formulas
  const isDesktopHero = winSize.width >= 1024;
  const scaleFactor =
    winSize.width === 0 || winSize.width >= 1360
      ? 1
      : Math.max((winSize.width - 160) / 1200, 0.5);
  const containerHeight = Math.round(1480 * scaleFactor);
  const pinScrollDistance = Math.round(1.2 * containerHeight);
  const totalHeroSpacerHeight = containerHeight + pinScrollDistance;

  useEffect(() => {
    let rafId = 0;

    const updateScrollTarget = () => {
      const y = window.scrollY || window.pageYOffset;
      setIsNavScrolled(y > 16);

      if (semanticRef.current) {
        const sRect = semanticRef.current.getBoundingClientRect();
        setIsNavOverDark(sRect.top <= 64 && sRect.bottom >= 64);
      }

      if (!heroSpacerRef.current || !isDesktopHero) {
        targetTRef.current = 0;
        return;
      }
      const rect = heroSpacerRef.current.getBoundingClientRect();
      const scrolledInHero = Math.max(0, -rect.top);
      const rawProgress = clamp(scrolledInHero / Math.max(1, pinScrollDistance), 0, 1);
      targetTRef.current = rawProgress * 1.2;
    };

    const tick = () => {
      const diff = targetTRef.current - currentTRef.current;
      if (Math.abs(diff) > 0.0008) {
        currentTRef.current += diff * 0.14;
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
  }, [isDesktopHero, pinScrollDistance, semanticRef]);

  return (
    <div className="steep-page">
      <LandingNavbar
        isNavScrolled={isNavScrolled}
        isDarkSection={isNavOverDark}
        onEnterWorkspace={onEnterWorkspace}
      />

      <HeroSection
        winSize={winSize}
        heroSpacerRef={heroSpacerRef}
        t={timelineT}
        totalHeroSpacerHeight={totalHeroSpacerHeight}
        containerHeight={containerHeight}
        scaleFactor={scaleFactor}
        onEnterWorkspace={onEnterWorkspace}
      />

      <IntroCardsSection />

      <ProductShowcaseSection onEnterWorkspace={onEnterWorkspace} />

      <CorpusStorySection onEnterWorkspace={onEnterWorkspace} />

      <SemanticPlatformSection
        semanticRef={semanticRef}
        semanticInView={semanticInView}
        onEnterWorkspace={onEnterWorkspace}
      />

      <AiDeepAnalysisSection onEnterWorkspace={onEnterWorkspace} />

      <GetStartedSection onEnterWorkspace={onEnterWorkspace} />
    </div>
  );
};

export default LandingPage;
