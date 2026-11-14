import React from 'react';

export interface SteepHeadingBlockProps {
  lines: Array<{ text: string; italicWord?: string }>;
  description?: string;
  cta?: React.ReactNode;
  centerAligned?: boolean;
  darkMode?: boolean;
  size?: 'md' | 'lg' | 'xl';
  isInView: boolean;
}

export const SteepHeadingBlock: React.FC<SteepHeadingBlockProps> = ({
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
      ? 'clamp(36px, 5.2vw, 72px)'
      : size === 'lg'
      ? 'clamp(32px, 4.6vw, 64px)'
      : 'clamp(28px, 3.4vw, 44px)';

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
          lineHeight: 1.2,
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
            fontSize: 'clamp(16px, 2vw, 19px)',
            lineHeight: 1.45,
            fontWeight: 410,
            color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(23,25,28,0.65)',
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
