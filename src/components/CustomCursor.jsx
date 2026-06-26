'use client';

import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const scaleState = useRef({ clicked: false, hovering: false });
  const [visible, setVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Force system cursor to none programmatically
    try {
      document.documentElement.style.setProperty('cursor', 'none', 'important');
      document.body.style.setProperty('cursor', 'none', 'important');
    } catch (e) {
      console.warn('Failed to set cursor styles programmatically:', e);
    }

    // Check if device is touch-only
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(hover: none)').matches
      );
    };
    checkTouch();

    const updateTransform = () => {
      if (cursorRef.current) {
        const { x, y } = positionRef.current;
        const { clicked, hovering } = scaleState.current;
        const scale = clicked ? 0.8 : hovering ? 1.25 : 1.0;
        cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      }
    };

    const handleMouseMove = (e) => {
      positionRef.current = { x: e.clientX, y: e.clientY };
      updateTransform();
      setVisible(true);
    };

    const handleMouseDown = () => {
      scaleState.current.clicked = true;
      updateTransform();
    };
    
    const handleMouseUp = () => {
      scaleState.current.clicked = false;
      updateTransform();
    };
    
    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    // Dynamic hover check for interactive elements to scale up cursor
    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.closest('[role="button"]') ||
        target.closest('.interactive-3d')
      ) {
        scaleState.current.hovering = true;
      } else {
        scaleState.current.hovering = false;
      }
      updateTransform();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  if (isTouchDevice || !visible) return null;

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed z-[9999] top-0 left-0 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out will-change-transform"
      style={{
        transform: `translate3d(-100px, -100px, 0) scale(1.0)`
      }}
    >
      <img
        src="https://res.cloudinary.com/dbn2ye2zo/image/upload/f_auto,q_auto/v1782114367/satyadev_assets/assets/cursor/cursor.png"
        alt="Custom Cursor"
        className="w-10 h-10 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
      />
    </div>
  );
}
