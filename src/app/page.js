'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';
import CustomCursor from '../components/CustomCursor';
import HeroSection from '../components/HeroSection';
import FloatingPill from '../components/FloatingPill';

const FilmstripTimeline = dynamic(() => import('../components/FilmstripTimeline'), { ssr: false });

// Lazy-load PortraitGenerator so it doesn't mount until needed
const PortraitGenerator = dynamic(() => import('../components/PortraitGenerator'), { ssr: false });

export default function Home() {
  const [isWallOpen, setIsWallOpen] = useState(false);
  // 'hero' = hero visible & timeline locked at start
  // 'timeline' = hero faded out & timeline scroll active
  const [scrollPhase, setScrollPhase] = useState('hero');
  const touchStartYRef = useRef(0);

  // Global state for non-blocking UI generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  // Check for open=generator query parameter on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('open=generator')) {
      setIsWallOpen(true);
      // Clean up the URL so a refresh doesn't trigger it again if unwanted
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Detect first downward scroll/swipe → transition to timeline phase
  useEffect(() => {
    // If we're not in the hero phase OR the portrait generator is open, ignore global scroll
    if (scrollPhase !== 'hero' || isWallOpen) return;

    const handleWheel = (e) => {
      if (e.deltaY > 5) setScrollPhase('timeline');
    };
    const handleTouchStart = (e) => {
      touchStartYRef.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e) => {
      if (touchStartYRef.current - e.changedTouches[0].clientY > 30) {
        setScrollPhase('timeline');
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scrollPhase, isWallOpen]);

  return (
    <main
      className="relative w-full h-[100dvh] bg-black overflow-hidden font-sans select-none"
      style={{ cursor: 'none' }}
    >
      {/* ─── Main Landing Page (Hero + 3D Timeline) ─── */}
      <div className="relative w-full h-full">
        {/* Filmstrip Scene – locked while hero is visible */}
        <div className="absolute inset-0 w-full h-full z-0">
          <FilmstripTimeline
            locked={scrollPhase === 'hero'}
            onScrollToTop={() => setScrollPhase('hero')}
          />
        </div>

        {/* Hero Section – fades out on first scroll */}
        <div
          id="hero-section"
          className={`absolute inset-0 w-full h-full pointer-events-none z-30 will-change-transform
            transition-all duration-700 ease-in-out
            ${scrollPhase === 'hero' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'}`}
        >
          <HeroSection
            isWallOpen={isWallOpen}
            onOpenWall={() => setIsWallOpen(true)}
            isGenerating={isGenerating}
            onExpandLoading={() => {
              setIsWallOpen(true);
              setIsMinimized(false);
            }}
          />
        </div>

        {/* Back to Hero Button - Visible only in timeline phase */}
        <button
          onClick={() => setScrollPhase('hero')}
          className={`absolute top-[calc(env(safe-area-inset-top,1rem)+1.5rem)] left-6 md:top-10 md:left-12 z-40 flex items-center justify-center w-10 h-10 bg-zinc-900/60 backdrop-blur-md border border-zinc-700/50 text-zinc-300 rounded-full hover:bg-zinc-800 hover:text-amber-500 transition-all duration-700 hover:scale-105 group ${scrollPhase === 'timeline' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
        >
          <span className="material-symbols-rounded transition-transform duration-300 group-hover:-translate-x-0.5">chevron_backward</span>
        </button>

        {/* Cinematic Ambient Overlay Gradient (Vignette) */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_90%)] z-20" />
      </div>

      {/* ─── Full Screen Portrait Generator Overlay ─── */}
      <div
        className={`absolute inset-0 z-40 transition-all duration-700 ease-in-out transform ${isWallOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full opacity-0 scale-95'
          }`}
        style={{ pointerEvents: isWallOpen ? 'auto' : 'none' }}
      >
        <PortraitGenerator
          onBack={() => setIsWallOpen(false)}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
          generationProgress={generationProgress}
          setGenerationProgress={setGenerationProgress}
          isMinimized={isMinimized}
          onMinimize={() => {
            setIsMinimized(true);
            setIsWallOpen(false);
          }}
        />
      </div>

      {/* ─── Floating Minimized Loading Pill ─── */}
      {isGenerating && isMinimized && (
        <FloatingPill
          progress={generationProgress}
          onExpand={() => {
            setIsMinimized(false);
            setIsWallOpen(true);
          }}
        />
      )}

      {/* Hardware-independent HTML custom cursor rendering */}
      <CustomCursor />
    </main>
  );
}
