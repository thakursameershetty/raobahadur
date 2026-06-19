'use client';

import { useEffect, useRef, useState } from 'react';
import TimberText from './TimberText';

export default function HeroSection({ isWallOpen, onOpenWall }) {
  const containerRef = useRef(null);
  const requestRef = useRef();

  // Mouse tracking state
  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);

  // Total visitor count state
  const [visitorCount, setVisitorCount] = useState(1432);

  useEffect(() => {
    // Basic simulation for total visits incrementing occasionally
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setVisitorCount(prev => prev + 1);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const layers = container.querySelectorAll('.parallax-layer');

    const handleMouseMove = (e) => {
      // Use container's own bounding rect so parallax stays correct at 50% width
      const rect = container.getBoundingClientRect();
      const xPos = e.clientX - rect.left;
      const yPos = e.clientY - rect.top;
      targetX.current = rect.width / 2 - xPos;
      targetY.current = rect.height / 2 - yPos;
    };

    const handleResize = () => {
      targetX.current = 0;
      targetY.current = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    const animate = () => {
      currentX.current += (targetX.current - currentX.current) * 0.08;
      currentY.current += (targetY.current - currentY.current) * 0.08;

      layers.forEach(layer => {
        const speed = parseFloat(layer.getAttribute('data-speed'));
        const x = currentX.current * speed;
        const y = currentY.current * speed;
        layer.style.setProperty('--x', x);
        layer.style.setProperty('--y', y);
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex justify-center items-center overflow-hidden bg-[#030807] pointer-events-none"
    >
      <img
        src="/layers/last.png"
        className="absolute top-[-5%] left-[0%] w-[110%] h-[110%] object-cover parallax-layer pointer-events-none"
        data-speed="0.02"
        alt="Background"
        style={{ transform: 'translate3d(calc(var(--x, 0) * 1px), calc(calc(var(--y, 0) * 1px) - calc(var(--scroll-progress, 0) * 20vh)), 0)' }}
      />

      <img
        src="/layers/fourth.png"
        className="absolute top-[-5%] left-[0%] w-[110%] h-[110%] object-cover parallax-layer pointer-events-none"
        data-speed="0.035"
        alt="Background"
        style={{ transform: 'translate3d(calc(var(--x, 0) * 1px), calc(calc(var(--y, 0) * 1px) - calc(var(--scroll-progress, 0) * 50vh)), 0)' }}
      />

      <img
        src="/layers/third.png"
        className="absolute top-[-5%] left-[0%] w-[110%] h-[110%] object-cover parallax-layer pointer-events-none"
        data-speed="0.05"
        alt="Feathers"
        style={{ transform: 'translate3d(calc(var(--x, 0) * 1px), calc(calc(var(--y, 0) * 1px) - calc(var(--scroll-progress, 0) * 90vh)), 0)' }}
      />

      <img
        src="/layers/second.png"
        className="absolute top-[-5%] left-[0%] w-[110%] h-[110%] object-cover parallax-layer pointer-events-none"
        data-speed="0.08"
        alt="Back Elements"
        style={{ transform: 'translate3d(calc(var(--x, 0) * 1px), calc(calc(var(--y, 0) * 1px) - calc(var(--scroll-progress, 0) * 140vh)), 0)' }}
      />

      <img
        src="/layers/top.png"
        className="absolute top-[-5%] left-[0%] w-[110%] h-[110%] object-cover parallax-layer pointer-events-none"
        data-speed="0.12"
        alt="Satyadev"
        style={{ transform: 'translate3d(calc(var(--x, 0) * 1px), calc(calc(var(--y, 0) * 1px) - calc(var(--scroll-progress, 0) * 200vh)), 0)' }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: 'radial-gradient(circle, transparent 10%, rgba(0, 0, 0, 0.8) 100%)' }}
      ></div>

      {/* Blackish Fluid Gradient Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background: 'linear-gradient(to top, #020202 0%, #020202 50%, transparent 100%)',
          transform: 'translateY(calc(100vh - (var(--scroll-progress, 0) * 150vh)))',
          opacity: 'calc(var(--scroll-progress, 0) * 2)'
        }}
      ></div>

      {/* The Parallax Title Layer */}
      <div
        className="absolute top-[8%] left-[5%] flex flex-col items-start parallax-layer pointer-events-none z-30"
        data-speed="0.15"
        style={{ transform: 'translate3d(calc(var(--x, 0) * 1px), calc(calc(var(--y, 0) * 1px) - calc(var(--scroll-progress, 0) * 250vh)), 0)' }}
      >
        <div className="flex flex-col items-start drop-shadow-2xl">
          <h3 className="font-serif text-[18px] tracking-[0.45em] text-[#e5d4ab] uppercase drop-shadow-lg mb-1 ml-1" style={{ fontFamily: '"Cormorant Garamond", serif' }}>Satyadev</h3>
          <p className="font-serif text-[10px] tracking-[0.3em] text-[#c9b282] uppercase mb-4 ml-1" style={{ fontFamily: '"Cormorant Garamond", serif' }}>In & As</p>
          <TimberText text="RAO" fontSize={60} tracking={6} glow={true} className="mb-1 !justify-start" />
          <TimberText text="BAHADUR" fontSize={60} tracking={6} glow={true} className="!justify-start" />
        </div>
      </div>

      {/* Top-right: Visitor Count */}
      <div className="absolute top-8 right-8 z-50 flex flex-col items-end pointer-events-auto">
        <h2
          className="text-amber-500 text-3xl mb-1 tracking-wider drop-shadow-md"
          style={{ fontFamily: 'var(--font-raobahadur), serif' }}
        >
          I root for Satyadev
        </h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-white/90 font-mono text-sm tracking-widest uppercase drop-shadow-md">
            Total Visits: <span className="font-bold text-white">{visitorCount.toLocaleString()}</span>
          </span>
        </div>
      </div>

      {/* Bottom Center: Show the Love Button */}
      {!isWallOpen && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex flex-col items-center">
          <button
            onClick={onOpenWall}
            className="group relative overflow-hidden px-8 py-3.5 text-sm tracking-[0.25em] uppercase font-semibold transition-all duration-500 ease-out"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              border: '1px solid rgba(201,162,76,0.6)',
              background: 'rgba(7,22,27,0.4)',
              backdropFilter: 'blur(8px)',
              color: '#e7c879',
              borderRadius: '9999px',
              boxShadow: '0 0 20px rgba(201,162,76,0.15), inset 0 0 0 1px rgba(201,162,76,0.1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(201,162,76,0.22)';
              e.currentTarget.style.border = '1px solid rgba(201,162,76,0.95)';
              e.currentTarget.style.boxShadow = '0 0 35px rgba(201,162,76,0.45), inset 0 0 0 1px rgba(201,162,76,0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(7,22,27,0.4)';
              e.currentTarget.style.border = '1px solid rgba(201,162,76,0.6)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(201,162,76,0.15), inset 0 0 0 1px rgba(201,162,76,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Show the Love <span className="text-red-500 animate-pulse">❤️</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
