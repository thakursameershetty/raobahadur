'use client';

import { useEffect, useRef, useState } from 'react';

export default function HeroSection() {
  const containerRef = useRef(null);
  const requestRef = useRef();

  // Mouse tracking state
  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);

  // Live visitor count state
  const [visitorCount, setVisitorCount] = useState(1432);

  useEffect(() => {
    // Simulate live visitor count ticking up
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        setVisitorCount(prev => prev + Math.floor(Math.random() * 4));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const layers = container.querySelectorAll('.parallax-layer');

    const handleMouseMove = (e) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      targetX.current = centerX - e.clientX;
      targetY.current = centerY - e.clientY;
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
      className="relative w-screen h-screen flex justify-center items-center overflow-hidden bg-[#030807]"
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
        style={{ background: 'radial-gradient(circle, transparent 50%, rgba(0, 0, 0, 0.8) 100%)' }}
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

      {/* Live Visitor Count */}
      <div className="absolute top-8 right-8 z-50 flex flex-col items-end bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl transition-all duration-500 hover:bg-black/30">
        <h2
          className="text-amber-500 text-3xl mb-1 tracking-wider drop-shadow-md"
          style={{ fontFamily: 'var(--font-raobahadur), serif' }}
        >
          Love Satyadev
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-white/90 font-mono text-sm tracking-widest uppercase">
            Live Viewers: <span className="font-bold text-white">{visitorCount.toLocaleString()}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
