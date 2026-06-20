'use client';

import { useEffect, useRef, useState } from 'react';
import TimberText from './TimberText';
import { ASSETS } from '@/lib/assets';

export default function HeroSection({ isWallOpen, onOpenWall }) {
  const containerRef = useRef(null);
  const requestRef = useRef();

  // Mouse/Gyro tracking state
  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);

  // Total visitor count state
  const [visitorCount, setVisitorCount] = useState(null);

  // Mobile state detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Increment and fetch the live visitor count on page mount
    fetch('/api/visits', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.count === 'number') {
          setVisitorCount(data.count);
        }
      })
      .catch(err => console.error('Error tracking visit:', err));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const layers = container.querySelectorAll('.parallax-layer');
    let gyroActive = false;

    const handleMouseMove = (e) => {
      if (gyroActive) return; // Skip mouse parallax if gyroscope is active
      const rect = container.getBoundingClientRect();
      const xPos = e.clientX - rect.left;
      const yPos = e.clientY - rect.top;
      targetX.current = rect.width / 2 - xPos;
      targetY.current = rect.height / 2 - yPos;
    };

    const handleOrientation = (e) => {
      if (e.beta !== null && e.gamma !== null) {
        gyroActive = true;
        const beta = e.beta;
        const gamma = e.gamma;

        // Neutral position: phone held at a standard ~70 degree tilt relative to ground
        const neutralBeta = 70;
        const neutralGamma = 0;

        let diffBeta = beta - neutralBeta;
        let diffGamma = gamma - neutralGamma;

        // Clamp tilt values to prevent excessive shifting
        diffBeta = Math.max(-30, Math.min(30, diffBeta));
        diffGamma = Math.max(-30, Math.min(30, diffGamma));

        // Gamma maps to horizontal (X), Beta maps to vertical (Y)
        targetX.current = diffGamma * 12;
        targetY.current = diffBeta * 12;
      }
    };

    const handleResize = () => {
      if (!gyroActive) {
        targetX.current = 0;
        targetY.current = 0;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    window.addEventListener('deviceorientation', handleOrientation);

    // iOS WebKit permission requester
    const requestPermissionAndRegister = async () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (
        isTouch &&
        typeof window !== 'undefined' &&
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        try {
          const state = await DeviceOrientationEvent.requestPermission();
          if (state === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
          return true; // Successfully prompted or handled
        } catch (err) {
          console.warn('Orientation permission request failed:', err);
          return false; // Failed, probably due to invalid gesture like touchstart
        }
      }
      return true; // Not required on this device
    };

    const triggerPermission = async () => {
      const handled = await requestPermissionAndRegister();
      if (handled) {
        window.removeEventListener('click', triggerPermission);
        window.removeEventListener('touchend', triggerPermission);
      }
    };

    window.addEventListener('click', triggerPermission);
    window.addEventListener('touchend', triggerPermission);

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
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('click', triggerPermission);
      window.removeEventListener('touchend', triggerPermission);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex justify-center items-center overflow-hidden bg-[#030807]"
      onClick={() => {}}
    >
      <img
        src={isMobile ? ASSETS.mobileLayers.last : ASSETS.layers.last}
        className="absolute top-[-5%] left-[0%] w-[110%] h-[110%] object-cover parallax-layer pointer-events-none"
        data-speed="0.02"
        alt="Background"
        style={{
          transform: 'translate3d(calc(var(--x, 0) * 1px), calc(var(--y, 0) * 1px - var(--scroll-progress, 0) * 20vh), 0)'
        }}
      />

      <img
        src={isMobile ? ASSETS.mobileLayers.fourth : ASSETS.layers.fourth}
        className="absolute top-[-5%] left-[0%] w-[110%] h-[110%] object-cover parallax-layer pointer-events-none"
        data-speed="0.035"
        alt="Background"
        style={{
          transform: 'translate3d(calc(var(--x, 0) * 1px), calc(var(--y, 0) * 1px - var(--scroll-progress, 0) * 50vh), 0)'
        }}
      />

      <img
        src={isMobile ? ASSETS.mobileLayers.third : ASSETS.layers.third}
        className="absolute top-[-5%] left-[0%] w-[110%] h-[110%] object-cover parallax-layer pointer-events-none"
        data-speed="0.05"
        alt="Feathers"
        style={{
          transform: 'translate3d(calc(var(--x, 0) * 1px), calc(var(--y, 0) * 1px - var(--scroll-progress, 0) * 90vh), 0)'
        }}
      />

      <img
        src={isMobile ? ASSETS.mobileLayers.second : ASSETS.layers.second}
        className="absolute top-[-5%] left-[0%] w-[110%] h-[110%] object-cover parallax-layer pointer-events-none"
        data-speed="0.08"
        alt="Back Elements"
        style={{
          transform: 'translate3d(calc(var(--x, 0) * 1px), calc(var(--y, 0) * 1px - var(--scroll-progress, 0) * 140vh), 0)'
        }}
      />

      <img
        src={isMobile ? ASSETS.mobileLayers.top : ASSETS.layers.top}
        className="absolute top-[-5%] left-[0%] w-[110%] h-[110%] object-cover parallax-layer pointer-events-none"
        data-speed="0.12"
        alt="Satyadev"
        style={{
          transform: 'translate3d(calc(var(--x, 0) * 1px), calc(var(--y, 0) * 1px - var(--scroll-progress, 0) * 200vh), 0)'
        }}
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
        className={`absolute flex flex-col parallax-layer pointer-events-none z-30 transition-all duration-300 ${isMobile ? 'bottom-[24%] left-1/2 items-center' : 'top-[8%] left-[5%] items-start'
          }`}
        data-speed="0.15"
        style={{
          transform: isMobile
            ? 'translate3d(calc(var(--x, 0) * 1px - 50%), calc(var(--y, 0) * 1px - var(--scroll-progress, 0) * 250vh), 0)'
            : 'translate3d(calc(var(--x, 0) * 1px), calc(var(--y, 0) * 1px - var(--scroll-progress, 0) * 250vh), 0)'
        }}
      >
        <div className={`flex flex-col drop-shadow-2xl ${isMobile ? 'items-center text-center' : 'items-start text-left'}`}>
          <h3
            className={`font-serif text-[18px] tracking-[0.45em] text-[#e5d4ab] uppercase drop-shadow-lg mb-1 ${isMobile ? '' : 'ml-1'}`}
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            Satyadev
          </h3>
          <p
            className={`font-serif text-[10px] tracking-[0.3em] text-[#c9b282] uppercase mb-4 ${isMobile ? '' : 'ml-1'}`}
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            In & As
          </p>
          <TimberText
            text="RAO"
            fontSize={isMobile ? 32 : 60}
            tracking={isMobile ? 3 : 6}
            glow={true}
            className={isMobile ? 'mb-1 !justify-center' : 'mb-1 !justify-start'}
          />
          <TimberText
            text="BAHADUR"
            fontSize={isMobile ? 32 : 60}
            tracking={isMobile ? 3 : 6}
            glow={true}
            className={isMobile ? '!justify-center -translate-x-1.5' : '!justify-start'}
          />
        </div>
      </div>

      {/* Top Center (Mobile) / Top-right (Desktop): Visitor Count */}
      <div className="absolute top-4 left-0 right-0 md:left-auto md:right-8 md:top-8 z-50 flex flex-col items-center md:items-end pointer-events-auto">
        <h2
          className="text-amber-500 text-lg md:text-3xl mb-0.5 tracking-wider drop-shadow-md text-center"
          style={{ fontFamily: 'var(--font-raobahadur), serif' }}
        >
          I root for Satyadev
        </h2>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-white/90 font-mono text-[9px] md:text-sm tracking-widest uppercase drop-shadow-md text-center">
            Total Visits: <span className="font-bold text-white">{visitorCount !== null ? visitorCount.toLocaleString() : '...'}</span>
          </span>
        </div>
      </div>

      {/* Bottom Center: Show the Love Button */}
      {!isWallOpen && (
        <div className="absolute bottom-28 md:bottom-16 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex flex-col items-center">
          <button
            onClick={onOpenWall}
            className="group relative overflow-hidden px-6 py-2.5 text-xs md:px-8 md:py-3.5 md:text-sm tracking-[0.25em] uppercase font-semibold transition-all duration-500 ease-out whitespace-nowrap"
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
