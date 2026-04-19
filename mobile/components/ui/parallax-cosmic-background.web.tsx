import React, { Fragment, useEffect, useState } from 'react';
import './cosmic-parallax.css';

export interface CosmicParallaxBgProps {
  head: string;
  text: string;
  loop?: boolean;
  className?: string;
  /** When false, only stars / horizon / earth render (app-wide backdrop). */
  showBranding?: boolean;
  /** Horizontal parallax offset in px (e.g. from active tab index). */
  ambientParallaxPx?: number;
}

const CosmicParallaxBg: React.FC<CosmicParallaxBgProps> = ({
  head,
  text,
  loop = true,
  className = '',
  showBranding = true,
  ambientParallaxPx = 0,
}) => {
  const [smallStars, setSmallStars] = useState<string>('');
  const [mediumStars, setMediumStars] = useState<string>('');
  const [bigStars, setBigStars] = useState<string>('');

  const textParts = text.split(',').map((part) => part.trim());

  const generateStarBoxShadow = (count: number): string => {
    const shadows: string[] = [];
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * 2000);
      const y = Math.floor(Math.random() * 2000);
      shadows.push(`${x}px ${y}px #FFF`);
    }
    return shadows.join(', ');
  };

  useEffect(() => {
    setSmallStars(generateStarBoxShadow(700));
    setMediumStars(generateStarBoxShadow(200));
    setBigStars(generateStarBoxShadow(100));

    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--animation-iteration', loop ? 'infinite' : '1');
    }
  }, [loop]);

  return (
    <div className={`cosmic-parallax-container ${className}`.trim()}>
      <div
        className="cosmic-parallax-shift"
        style={{ transform: `translate3d(${ambientParallaxPx}px, 0, 0)` }}
      >
        <div id="stars" style={{ boxShadow: smallStars }} className="cosmic-stars"></div>
        <div id="stars2" style={{ boxShadow: mediumStars }} className="cosmic-stars-medium"></div>
        <div id="stars3" style={{ boxShadow: bigStars }} className="cosmic-stars-large"></div>

        <div id="horizon">
          <div className="glow"></div>
        </div>
        <div id="earth"></div>
      </div>

      {showBranding ? (
        <>
          <div id="title">{head.toUpperCase()}</div>
          <div id="subtitle">
            {textParts.map((part, index) => (
              <Fragment key={index}>
                <span className={`subtitle-part-${index + 1}`}>{part.toUpperCase()}</span>
                {index < textParts.length - 1 ? ' ' : null}
              </Fragment>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};

export { CosmicParallaxBg };
