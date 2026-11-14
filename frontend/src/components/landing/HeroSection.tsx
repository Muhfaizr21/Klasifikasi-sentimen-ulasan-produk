import React from 'react';
import {
  clamp,
  easeOutQuad,
  invLerp,
  lerp,
  lerpColorHex,
  MARKETPLACE_BRANDS,
  type WorkspaceTabTarget,
} from './landingData';

interface HeroSectionProps {
  winSize: { width: number; height: number };
  heroSpacerRef: React.RefObject<HTMLDivElement | null>;
  t: number;
  totalHeroSpacerHeight: number;
  containerHeight: number;
  scaleFactor: number;
  onEnterWorkspace: (initialTab?: WorkspaceTabTarget, initialQuery?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  winSize,
  heroSpacerRef,
  t,
  totalHeroSpacerHeight,
  containerHeight,
  scaleFactor,
  onEnterWorkspace,
}) => {
  const isDesktopHero = winSize.width >= 1024;
  const isTallViewport = winSize.height >= 900;

  // Atmospheric Background Mesh
  const bgY = lerp(0, -130, easeOutQuad(invLerp(t, 0, 1.2)));

  // Top Announcement Banner Pill
  const pBanner = easeOutQuad(invLerp(t, 0, 0.3));
  const bannerY = lerp(0, -100, pBanner);
  const bannerOpacity = lerp(1, 0, pBanner);

  // Center Hero Heading Block
  const pHeading = easeOutQuad(invLerp(t, 0, 0.4));
  const headingY = lerp(0, -200, pHeading);
  const headingScale = lerp(1, 0.9, pHeading);
  const headingOpacity = lerp(1, 0, easeOutQuad(invLerp(t, 0, 0.25)));

  // Main 1200x880 Desktop App Window (reaches 100% scale by t=0.35, docks at t=0.45)
  const pDock = easeOutQuad(invLerp(t, 0, 0.45));
  const pWinScale = easeOutQuad(invLerp(t, 0.02, 0.33));
  const windowY = lerp(280, 110, pDock);
  const windowScale = lerp(0.68, 1, pWinScale);
  const windowOpacity = lerp(0, 1, easeOutQuad(invLerp(t, 0.03, 0.25)));
  const homeContentFadeIn = easeOutQuad(invLerp(t, 0.24, 0.16));
  const homeStartOpacity = homeContentFadeIn * lerp(1, 0, easeOutQuad(invLerp(t, 0.58, 0.22)));
  const homeStartY = t <= 0.55 ? 0 : lerp(0, -204, easeOutQuad(invLerp(t, 0.6, 0.4)));

  // Final AI Reasoning & Chart Report View
  const reportY = lerp(200, 84, easeOutQuad(invLerp(t, 0.65, 0.45)));
  const reportOpacity = lerp(0, 1, easeOutQuad(invLerp(t, 0.65, 0.35)));

  // Bento Grid Constants inside 1200x880 Window (Sidebar = 248px, Padding = 38px -> X: 286..1162, Width: 876px)
  // Row 0 (AI Composer): Y = 224 (top: 114 in window, -656 from 880), H = 76 (bottom = 300)
  // Row 1 (Pink 294 + Gap 22 + Blue 560 = 876): Y = 344 (top: 234 in window, -536 from 880), H = 235 (bottom = 579)
  // Row 2 (Gray 294 + Gap 22 + Dist 560 = 876): Y = 601 (top: 491 in window, -279 from 880), H = 200 (bottom = 801)

  // Floating Block 1: Pink/Peach Registrations Card (294x235)
  const pinkStartX = isTallViewport ? 980 : 1020;
  const pinkStartY = isTallViewport ? -520 : -500;
  const pinkX = lerp(pinkStartX, 286, pDock);
  const pinkY =
    t <= 0.55
      ? lerp(pinkStartY, -536, pDock)
      : lerp(-536, -740, easeOutQuad(invLerp(t, 0.6, 0.4)));
  const pinkShadow = lerp(1, 0, easeOutQuad(invLerp(t, 0.4, 0.06)));
  const pinkOpacity = lerp(1, 0, easeOutQuad(invLerp(t, 0.58, 0.22)));

  // Floating Block 2: Blue Region/Category Card (560x235)
  const blueStartX = isTallViewport ? -120 : -160;
  const blueStartY = isTallViewport ? -700 : -680;
  const blueX = lerp(blueStartX, 602, pDock);
  const blueY =
    t <= 0.55
      ? lerp(blueStartY, -536, pDock)
      : lerp(-536, -740, easeOutQuad(invLerp(t, 0.6, 0.4)));
  const blueShadow = lerp(1, 0, easeOutQuad(invLerp(t, 0.4, 0.06)));
  const blueOpacity = lerp(1, 0, easeOutQuad(invLerp(t, 0.58, 0.22)));

  // Floating Block 3: White Activation Card (294x200)
  const grayStartX = isTallViewport ? 60 : 20;
  const grayStartY = isTallViewport ? -240 : -250;
  const grayX = lerp(grayStartX, 286, pDock);
  const grayY =
    t <= 0.55
      ? lerp(grayStartY, -279, pDock)
      : lerp(-279, -483, easeOutQuad(invLerp(t, 0.6, 0.4)));
  const grayShadow = lerp(1, 0, easeOutQuad(invLerp(t, 0.4, 0.06)));
  const grayOpacity = lerp(1, 0, easeOutQuad(invLerp(t, 0.58, 0.22)));

  // Left Cursor Bubble (Green JB)
  const curLStartX = isTallViewport ? -50 : -110;
  const curLStartY = isTallViewport ? -500 : -480;
  const cursorLX = lerp(curLStartX, 650, pDock);
  const cursorLY = lerp(curLStartY, -240, pDock);
  const cursorLOpacity = lerp(1, 0, easeOutQuad(invLerp(t, 0.2, 0.25)));

  // Right Cursor Bubble (Blue AF) -> Aims cleanly at the Send Button (X=1122, Y=-608) above Row 1
  const curRStartX = isTallViewport ? 720 : 760;
  const curRStartY = isTallViewport ? -140 : -160;
  let cursorRX = curRStartX;
  let cursorRY = curRStartY;
  if (t <= 0.45) {
    cursorRX = lerp(curRStartX, 1060, pDock);
    cursorRY = lerp(curRStartY, -604, pDock);
  } else {
    const p2 = easeOutQuad(invLerp(t, 0.45, 0.1));
    cursorRX = lerp(1060, 1122, p2);
    cursorRY = lerp(-604, -608, p2);
  }
  let cursorRScale = 1;
  if (t >= 0.52 && t <= 0.56) {
    cursorRScale = lerp(1, 0.88, easeOutQuad(invLerp(t, 0.52, 0.04)));
  } else if (t > 0.56 && t <= 0.6) {
    cursorRScale = lerp(0.88, 1, easeOutQuad(invLerp(t, 0.56, 0.04)));
  }
  const cursorROpacity = lerp(1, 0, easeOutQuad(invLerp(t, 0.6, 0.2)));

  // AI Composer Bar (876px wide when docked at X=286..1162) -> Morphs into User Prompt Pill
  const aiStartX = isTallViewport ? 620 : 660;
  const aiStartY = isTallViewport ? -210 : -230;
  let aiX = aiStartX;
  let aiY = aiStartY;
  let aiWidth = 420;
  if (t <= 0.55) {
    aiX = lerp(aiStartX, 286, pDock);
    aiY = lerp(aiStartY, -656, pDock);
    aiWidth = lerp(420, 876, pDock);
  } else {
    const p2 = easeOutQuad(invLerp(t, 0.6, 0.38));
    aiX = lerp(286, 622, p2);
    aiY = lerp(-656, -730, p2);
    aiWidth = lerp(876, 540, p2);
  }
  const aiHeight = lerp(76, 44, easeOutQuad(invLerp(t, 0.6, 0.38)));
  const aiBgColor = lerpColorHex('#fdf1eb', '#f3f3f5', easeOutQuad(invLerp(t, 0.6, 0.3)));
  const aiShadow = lerp(1, 0, easeOutQuad(invLerp(t, 0.4, 0.06)));
  const aiPlaceholderOpacity = lerp(1, 0, easeOutQuad(invLerp(t, 0, 0.1)));
  const aiTypedWidthPct = clamp(invLerp(t, 0.04, 0.35) * 100, 0, 100);
  const aiTypedY = lerp(0, -1, easeOutQuad(invLerp(t, 0.6, 0.4)));
  const aiIconsOpacity = lerp(1, 0, easeOutQuad(invLerp(t, 0.6, 0.2)));

  // Logo Carousel
  const pCarousel = easeOutQuad(invLerp(t, 0, 0.5));
  const carouselY = lerp(800, 280, pCarousel);

  if (!isDesktopHero) {
    return (
      <section
        style={{
          paddingTop: '96px',
          paddingBottom: '56px',
          paddingInline: '16px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="steep-hero-bg-mesh" />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '680px', margin: '0 auto' }}>
          <button
            type="button"
            className="steep-banner-pill"
            onClick={() => onEnterWorkspace('komparasi')}
            style={{
              marginBottom: '20px',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <span>Baru: Komparasi 2 Produk & Live Scraper</span>
            <span>→</span>
          </button>

          <h1
            style={{
              fontFamily: 'var(--font-signifier)',
              fontWeight: 400,
              fontSize: 'clamp(38px, 9.5vw, 64px)',
              lineHeight: 1.08,
              letterSpacing: '-1.2px',
              margin: '0 0 16px',
              color: '#17191c',
            }}
          >
            Untuk keputusan produk yang berpijak pada data
          </h1>

          <p
            style={{
              fontSize: 'clamp(16px, 2.5vw, 18px)',
              lineHeight: 1.45,
              color: '#17191c',
              margin: '0 auto 24px',
              maxWidth: '540px',
            }}
          >
            Platform analitik sentimen AI yang mengubah ribuan ulasan e-commerce menjadi metrik
            reputasi terukur untuk tim produk dan riset.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
            <button type="button" className="steep-btn-filled" onClick={() => onEnterWorkspace('prediksi')}>
              Mulai Analisis
            </button>
            <button type="button" className="steep-btn-ghost" onClick={() => onEnterWorkspace('komparasi')}>
              Bandingkan Produk
            </button>
          </div>

          {/* Responsive Mobile/Tablet Hero Preview Cards */}
          <div className="steep-win-grid-2" style={{ textAlign: 'left', marginBottom: 24 }}>
            <div
              style={{
                borderRadius: 18,
                backgroundColor: '#f1f6fd',
                padding: '18px 20px',
                border: '1px solid rgba(22,50,82,0.06)',
              }}
            >
              <div style={{ fontSize: 12, color: '#3b628b', fontWeight: 500 }}>Korpus PRDECT-ID</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: '#163252', margin: '4px 0' }}>5.459</div>
              <div style={{ fontSize: 12, color: '#3b628b' }}>↑ 29 Kategori Produk Tokopedia</div>
            </div>
            <div
              style={{
                borderRadius: 18,
                backgroundColor: '#fdf3ee',
                padding: '18px 20px',
                border: '1px solid rgba(93,42,26,0.08)',
              }}
            >
              <div style={{ fontSize: 12, color: '#5d2a1a', fontWeight: 500 }}>Akurasi Klasifikasi</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: '#5d2a1a', margin: '4px 0' }}>85,90%</div>
              <div style={{ fontSize: 12, color: 'rgba(93,42,26,0.75)' }}>Macro F1: 77,28% · TF-IDF + MNB</div>
            </div>
          </div>

          {/* Interactive AI Prompt Preview Pill on Mobile */}
          <div
            onClick={() => onEnterWorkspace('prediksi', 'Kualitas barang sangat bagus pengiriman super cepat')}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 18,
              padding: '14px 18px',
              boxShadow: 'var(--shadow-block)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              textAlign: 'left',
              cursor: 'pointer',
              marginBottom: 32,
            }}
          >
            <div style={{ fontSize: 13.5, color: '#17191c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              “Bagaimana dampak kampanye terhadap sentimen ulasan bulan ini?”
            </div>
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                backgroundColor: '#17191c',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 13,
              }}
            >
              ↑
            </span>
          </div>

          {/* Mobile Marquee */}
          <div style={{ overflow: 'hidden', position: 'relative', paddingTop: 8 }}>
            <div className="steep-marquee-track">
              {[0, 1].map((dup) => (
                <div
                  key={dup}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '36px',
                    paddingRight: '36px',
                    flexShrink: 0,
                  }}
                >
                  {MARKETPLACE_BRANDS.map((brand) => (
                    <span
                      key={`${dup}-${brand}`}
                      style={{
                        fontFamily: 'var(--font-signifier)',
                        fontSize: '19px',
                        color: '#17191c',
                        opacity: 0.68,
                        whiteSpace: 'nowrap',
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
      </section>
    );
  }

  return (
    <div
      ref={heroSpacerRef}
      className="steep-hero-pin-spacer"
      style={{ height: `${totalHeroSpacerHeight}px` }}
    >
      <div className="steep-hero-sticky" style={{ height: `${containerHeight}px` }}>
        <div
          className="steep-hero-bg-mesh"
          style={{ transform: `translate3d(0, ${bgY}px, 0)` }}
        />
        <div className="steep-noise-overlay" />

        {/* Top Announcement Pill */}
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
            <span
              style={{
                position: 'relative',
                display: 'inline-flex',
                width: 18,
                height: 18,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
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

        {/* 1200px Scaled Stage Centered at left: 50% */}
        <div
          className="steep-hero-stage-1200"
          style={{
            transform: `translate3d(-50%, 0, 0) scale(${scaleFactor})`,
          }}
        >
          {/* Centered Hero Headline + Description + CTAs */}
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

          {/* 1200x880 App Window */}
          <div
            style={{
              width: '1200px',
              height: '880px',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '24px',
              backgroundColor: '#ffffff',
              boxShadow: 'var(--shadow-window)',
              transformOrigin: 'top center',
              transform: `translate3d(0, ${windowY}px, 0) scale(${windowScale})`,
              opacity: windowOpacity,
            }}
          >
            <div style={{ display: 'flex', width: '100%', height: '100%' }}>
              {/* Left Sidebar (248px) */}
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
                  <div style={{ display: 'flex', gap: 8, marginBottom: 24, paddingLeft: 6 }}>
                    <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#e5e5e7' }} />
                    <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#e5e5e7' }} />
                    <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#e5e5e7' }} />
                  </div>

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

              {/* Right Main Workspace Area */}
              <div style={{ flex: 1, position: 'relative', backgroundColor: '#ffffff', height: '100%' }}>
                <div
                  style={{
                    height: '56px',
                    padding: '0 38px',
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

            {/* Initial Dashboard View (aligned to the exact 876px bento grid: X = 286..1162) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: homeStartOpacity,
                transform: `translate3d(0, ${homeStartY}px, 0)`,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '72px',
                  left: '286px',
                  fontSize: 22,
                  fontFamily: 'var(--font-signifier)',
                  color: '#17191c',
                  lineHeight: 1.25,
                }}
              >
                Selamat datang kembali, Tim Analitik
              </div>

              <div
                style={{
                  position: 'absolute',
                  top: '491px',
                  left: '602px',
                  width: '560px',
                  height: '200px',
                  borderRadius: '16px',
                  backgroundColor: '#fafafb',
                  border: '1px solid rgba(23,25,28,0.06)',
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

            {/* Final Steep AI Reasoning & Trend Report */}
            <div
              style={{
                position: 'absolute',
                top: '28px',
                left: '286px',
                width: '876px',
                height: '790px',
                transform: `translate3d(0, ${reportY}px, 0)`,
                opacity: reportOpacity,
                pointerEvents: reportOpacity > 0.6 ? 'auto' : 'none',
              }}
            >
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

                <svg viewBox="0 0 740 210" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
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
                      <line x1="0" y1={row.y} x2="725" y2={row.y} stroke="rgba(23,25,28,0.06)" strokeWidth="1" />
                    </g>
                  ))}

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

          {/* Floating Block 1: Pink/Peach Registrations Card */}
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
              <div style={{ fontSize: '15px', fontWeight: 500, color: '#5d2a1a' }}>Akurasi Uji</div>

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

          {/* Floating Block 2: Blue Region/Category Card */}
          <div
            className="steep-floating-block"
            style={
              {
                width: '560px',
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
                padding: '22px 24px',
                display: 'grid',
                gridTemplateColumns: '190px 1fr',
                gap: '24px',
              }}
            >
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

          {/* Floating Block 3: White Activation Card */}
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
                border: '1px solid rgba(23,25,28,0.06)',
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

          {/* Left Cursor Bubble: Green JB */}
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

          {/* Floating Block 4: AI Composer */}
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

          {/* Right Cursor Bubble: Blue AF */}
          <div
            style={{
              position: 'absolute',
              top: '880px',
              left: 0,
              width: '56px',
              height: '66px',
              transform: `translate3d(${cursorRX}px, ${cursorRY}px, 0) scale(${cursorRScale})`,
              opacity: cursorROpacity,
              pointerEvents: 'none',
              zIndex: 26,
            }}
          >
            <svg width="56" height="66" viewBox="0 0 56 66" fill="none">
              <path d="M10 5L25 14L16 18L13 27L10 5Z" fill="#17191c" />
              <circle cx="31" cy="43" r="17.5" fill="#cce0ff" stroke="#17191c" strokeWidth="1.3" />
              <text x="31" y="47.5" textAnchor="middle" fill="#17191c" fontSize="12" fontWeight="500">
                AF
              </text>
            </svg>
          </div>

          {/* Infinite Logo Marquee Carousel */}
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
                      {MARKETPLACE_BRANDS.map((brand) => (
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
  );
};
