'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './FilmstripTimeline.module.css';

const films = [
  {
    year: '2011',
    title: 'Mr. Perfect',
    desc: 'The beginning — small roles, quiet presence, a face worth watching.',
    frameNo: '01A',
    imgUrl: 'https://res.cloudinary.com/dbn2ye2zo/image/upload/q_auto,f_auto/v1782764107/mr_perfect_kutslo.jpg'
  },
  {
    year: '2015',
    title: 'Jyothi Lakshmi',
    desc: 'Audiences started noticing something rare — an actor who disappears into the role.',
    frameNo: '02A',
    imgUrl: 'https://res.cloudinary.com/dbn2ye2zo/image/upload/v1782766817/jyothi_lakshmi_nnwbdt.jpg'
  },
  {
    year: '2018',
    title: 'Bluff Master',
    desc: 'The industry took notice. Charisma, craft — the whole package on screen.',
    frameNo: '03A',
    imgUrl: 'https://res.cloudinary.com/dbn2ye2zo/image/upload/v1782766818/bluff_master_imupy7.jpg'
  },
  {
    year: '2020',
    title: 'Uma Maheswara Ugra Roopasya',
    desc: 'A tour de force. Proved he could carry an extraordinary story entirely on his shoulders.',
    frameNo: '04A',
    imgUrl: 'https://res.cloudinary.com/dbn2ye2zo/image/upload/q_auto,f_auto/v1782764107/uma_maheshwara_jxjwlr.jpg'
  },
  {
    year: '2026',
    title: 'Rao Bahadur',
    desc: 'This Friday will be very different from all other fridays',
    frameNo: '05A',
    imgUrl: 'https://res.cloudinary.com/dbn2ye2zo/image/upload/q_auto,f_auto/v1782764107/rao_bhadur_x5olpg.jpg'
  }
];

export default function FilmstripTimeline({ locked, onScrollToTop }) {
  const reelRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [frameStyles, setFrameStyles] = useState(films.map(() => ({})));

  const snapSoundRef = useRef(null);
  const lastActiveIndex = useRef(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      snapSoundRef.current = new Audio('/assets/sounds/snap.ogg');
      snapSoundRef.current.volume = 0.1;
    }
  }, []);

  useEffect(() => {
    const reel = reelRef.current;
    if (!reel) return;

    let raf;
    const updateReel = () => {
      const h = reel.clientHeight;
      const center = reel.scrollTop + h / 2;
      let closestIndex = 0;
      let closestDist = Infinity;
      const newFrameStyles = [];

      const slots = reel.querySelectorAll(`.${styles.slot}`);

      slots.forEach((slot, i) => {
        const slotCenter = slot.offsetTop + slot.offsetHeight / 2;
        const dist = slotCenter - center;
        const absDist = Math.abs(dist);

        if (absDist < closestDist) {
          closestDist = absDist;
          closestIndex = i;
        }

        if (absDist > h * 1.2) {
          newFrameStyles.push({ visibility: 'hidden' });
          return;
        }

        const maxD = h * 0.6;
        const n = Math.max(-1, Math.min(1, dist / maxD));
        const abs = Math.abs(n);

        const scale = 1 - abs * 0.10;
        const opacity = 1 - abs * 0.72;
        const rotateY = n * 3;

        newFrameStyles.push({
          visibility: 'visible',
          transform: `scale(${scale}) perspective(800px) rotateY(${rotateY}deg)`,
          opacity: opacity
        });
      });

      setFrameStyles(newFrameStyles);
      setActiveIndex(closestIndex);

      if (closestIndex !== lastActiveIndex.current) {
        lastActiveIndex.current = closestIndex;

        // Haptic feedback
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(15);
        }

        // Sound effect
        if (snapSoundRef.current) {
          snapSoundRef.current.currentTime = 0;
          snapSoundRef.current.play().catch(() => { });
        }
      }

      // Sync sprocket holes to create the infinite scroll effect
      const patternL = document.getElementById('holeL');
      const patternR = document.getElementById('holeR');
      if (patternL && patternR) {
        const yOffset = -(reel.scrollTop % 38);
        patternL.setAttribute('y', yOffset);
        patternR.setAttribute('y', yOffset);
      }
    };

    const handleScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateReel);
    };

    const checkScrollUp = (e) => {
      if (reel.scrollTop <= 0 && e.deltaY < -5) {
        if (onScrollToTop) onScrollToTop();
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e) => { touchStartY = e.touches[0].clientY; };
    const handleTouchEnd = (e) => {
      if (reel.scrollTop <= 0 && e.changedTouches[0].clientY - touchStartY > 30) {
        if (onScrollToTop) onScrollToTop();
      }
    };

    reel.addEventListener('scroll', handleScroll, { passive: true });
    reel.addEventListener('wheel', checkScrollUp, { passive: true });
    reel.addEventListener('touchstart', handleTouchStart, { passive: true });
    reel.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Initial update
    setTimeout(updateReel, 60);
    // Extra update to handle late image loads
    setTimeout(updateReel, 300);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      reel.removeEventListener('scroll', handleScroll);
      reel.removeEventListener('wheel', checkScrollUp);
      reel.removeEventListener('touchstart', handleTouchStart);
      reel.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onScrollToTop]);

  // Lock behavior
  useEffect(() => {
    if (locked && reelRef.current) {
      reelRef.current.scrollTop = 0;
      reelRef.current.style.overflowY = 'hidden';
    } else if (!locked && reelRef.current) {
      reelRef.current.style.overflowY = 'scroll';
    }
  }, [locked]);

  return (
    <div className={styles.container}>
      <div className={styles.filmstripCenter}>
        {/* Film edges */}
        <div className={`${styles.filmEdge} ${styles.filmEdgeLeft}`} />
        <div className={`${styles.filmEdge} ${styles.filmEdgeRight}`} />

        {/* Fixed sprocket holes */}
        <div className={`${styles.sprockets} ${styles.sprocketsLeft}`}>
          <svg viewBox="0 0 34 800" preserveAspectRatio="xMidYMin slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="holeL" x="0" y="0" width="34" height="38" patternUnits="userSpaceOnUse">
                <rect width="34" height="38" fill="#1a1612" />
                <rect x="6" y="8" width="22" height="22" rx="3" fill="#080808" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="34" height="800" fill="url(#holeL)" />
          </svg>
        </div>

        <div className={`${styles.sprockets} ${styles.sprocketsRight}`}>
          <svg viewBox="0 0 34 800" preserveAspectRatio="xMidYMin slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="holeR" x="0" y="0" width="34" height="38" patternUnits="userSpaceOnUse">
                <rect width="34" height="38" fill="#1a1612" />
                <rect x="6" y="8" width="22" height="22" rx="3" fill="#080808" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="34" height="800" fill="url(#holeR)" />
          </svg>
        </div>

        <div
          className={styles.reel}
          ref={reelRef}
        >
          <div className={styles.spacer}></div>
          {films.map((film, i) => (
            <div key={i} className={styles.slot}>
              <div
                className={`${styles.frame} ${i === activeIndex ? styles.isActive : ''}`}
                style={frameStyles[i] || {}}
              >
                <div className={styles.frameCounter}>{film.frameNo} &nbsp;▮</div>
                <div className={styles.frameImg}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={film.imgUrl} alt={film.title} loading={i === 0 ? 'eager' : 'lazy'} />
                </div>
                <div className={styles.lowerThird}>
                  <div className={styles.metaRow}>
                    <span className={styles.yearBadge}>{film.year}</span>
                  </div>
                  <div className={styles.filmTitle}>{film.title}</div>
                  <div className={styles.filmDesc}>{film.desc}</div>
                </div>
              </div>
            </div>
          ))}
          <div className={styles.spacer}></div>
        </div>
      </div>

      <div className={styles.headerEyebrow}>
        <span>SATYADEV</span>
        <span>A JOURNEY THROUGH FRAMES</span>
      </div>

      <div className={styles.rollIndicator}>
        {films.map((_, i) => (
          <div key={i} className={`${styles.rollDot} ${i === activeIndex ? styles.rollDotActive : ''}`} />
        ))}
      </div>
    </div>
  );
}
