import React, { useState, useEffect, useRef } from 'react';
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
  const [scrollY, setScrollY] = useState(0);
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [isNavOverDark, setIsNavOverDark] = useState(false);

  const heroSpacerRef = useRef<HTMLDivElement | null>(null);
  const [semanticRef, semanticInView] = useSteepInView();

  useEffect(() => {
    const handleResize = () => {
      setWinSize({ width: window.innerWidth, height: window.innerHeight });
    };

    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrollY(y);
        setIsNavScrolled(y > 24);
        if (semanticRef.current) {
          const rect = semanticRef.current.getBoundingClientRect();
          setIsNavOverDark(rect.top <= 64 && rect.bottom >= 64);
        }
        rafId = null;
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [semanticRef]);

  // Scroll-scrubbed Hero Timeline math (matching Steep's 1200x880 stage)
  const containerHeight = clamp(winSize.height - 64, 720, 1080);
  const scaleX = (winSize.width - 48) / 1200;
  const scaleY = (containerHeight - 24) / 880;
  const scaleFactor = clamp(Math.min(scaleX, scaleY, 1.05), 0.72, 1.05);

  const scrollDistance = 760;
  const totalHeroSpacerHeight = containerHeight + scrollDistance;
  const t = clamp(scrollY / 600, 0, 1.25);

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
        t={t}
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
