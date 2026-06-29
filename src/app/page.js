'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';
import { milestones } from '../data/milestones';
import CustomCursor from '../components/CustomCursor';
import HeroSection from '../components/HeroSection';
import FloatingPill from '../components/FloatingPill';

const getMilestoneOffset = (index, total) => {
  if (index === total - 1) return 1.0;
  return (index + 1) / (total + 1);
};

// Dynamically import the 3D Canvas component with SSR disabled
const SatyadevTimeline = dynamic(() => import('../components/SatyadevTimeline'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-t-amber-500 border-zinc-800 rounded-full animate-spin"></div>
        <p className="text-zinc-500 text-sm font-mono tracking-widest uppercase animate-pulse">
          Loading 3D Engine...
        </p>
      </div>
    </div>
  ),
});

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
        {/* Dynamic 3D Scene – locked while hero is visible */}
        <div className="absolute inset-0 w-full h-full z-0">
          <SatyadevTimeline
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
          className={`absolute top-8 left-6 md:top-10 md:left-12 z-40 flex items-center gap-2 px-4 py-2 bg-zinc-900/60 backdrop-blur-md border border-zinc-700/50 text-zinc-300 text-xs font-mono uppercase tracking-widest rounded-full hover:bg-zinc-800 hover:text-amber-500 transition-all duration-700 hover:scale-105 group ${scrollPhase === 'timeline' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
        >
          <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">←</span>
          Back
        </button>

        {/* Cinematic Ambient Overlay Gradient (Vignette) */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_90%)] z-20" />

        {/* Bottom Progress Bar with Year Nodes */}
        <div id="timeline-container" className="absolute bottom-8 left-6 right-6 md:left-16 md:right-16 z-20 opacity-0 pointer-events-none transition-opacity duration-1000">
          <div className="relative w-full h-[3px] bg-zinc-800/40 rounded-full backdrop-blur-sm">
            {/* Progress Fill */}
            <div
              id="timeline-progress-fill"
              className="absolute top-0 left-0 h-full w-0 bg-gradient-to-r from-amber-500 to-red-600 transition-all duration-100 ease-out rounded-full"
            />

            {/* Year Tick Marks and Labels */}
            {milestones.map((m, index) => {
              const percentage = getMilestoneOffset(index, milestones.length) * 100;
              return (
                <div
                  key={index}
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ left: `${percentage}%` }}
                >
                  {/* Visual Tick Dot */}
                  <div
                    id={`progress-tick-${index}`}
                    className="absolute w-2 h-2 rounded-full bg-zinc-700 -translate-x-1/2 -translate-y-1/2 border border-black transition-all duration-300"
                  />
                  {/* Floating Year Label */}
                  <span
                    id={`progress-year-${index}`}
                    className="absolute left-0 text-[10px] font-mono font-bold tracking-tighter text-zinc-500 opacity-60 transition-all duration-300 pointer-events-none select-none"
                    style={{ transform: 'translate(-50%, -20px)' }}
                  >
                    {m.year}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
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
