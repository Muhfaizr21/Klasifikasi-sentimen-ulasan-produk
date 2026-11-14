import React, { useState } from 'react';
import type { WorkspaceTabTarget } from './landingData';

interface LandingNavbarProps {
  isNavScrolled: boolean;
  isDarkSection: boolean;
  onEnterWorkspace: (initialTab?: WorkspaceTabTarget, initialQuery?: string) => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  isNavScrolled,
  isDarkSection,
  onEnterWorkspace,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAnchorClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`steep-nav-header ${isNavScrolled ? 'is-scrolled' : ''} ${
        isDarkSection ? 'is-dark-section' : ''
      }`}
    >
      <nav className="steep-nav" aria-label="Navigasi Utama">
        <button
          type="button"
          className="steep-brand"
          onClick={() => {
            setMobileMenuOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
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
          <button
            type="button"
            className="steep-mobile-menu-btn"
            aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Responsive Mobile Navigation Drawer (< 1024px) */}
      <div className={`steep-mobile-drawer ${mobileMenuOpen ? 'is-open' : ''}`}>
        <a href="#fitur-produk" className="steep-nav-link" onClick={handleAnchorClick}>
          Produk & Alur Kerja
        </a>
        <a href="#arsitektur-semantik" className="steep-nav-link" onClick={handleAnchorClick}>
          Metodologi & Platform Semantik
        </a>
        <a href="#studi-korpus" className="steep-nav-link" onClick={handleAnchorClick}>
          Studi Korpus PRDECT-ID
        </a>
        <a href="#sentimen-ai" className="steep-nav-link" onClick={handleAnchorClick}>
          Sentimen AI
        </a>
        <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
          <button
            type="button"
            className="steep-btn-ghost is-sm"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => {
              setMobileMenuOpen(false);
              onEnterWorkspace('komparasi');
            }}
          >
            Uji Komparasi
          </button>
          <button
            type="button"
            className="steep-btn-filled is-sm"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => {
              setMobileMenuOpen(false);
              onEnterWorkspace('prediksi');
            }}
          >
            Mulai Analisis
          </button>
        </div>
      </div>
    </header>
  );
};
