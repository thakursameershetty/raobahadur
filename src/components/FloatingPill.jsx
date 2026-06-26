'use client';

import React from 'react';

export default function FloatingPill({ progress, onExpand }) {
  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-4 bg-zinc-900/90 border border-amber-500/30 rounded-full px-5 py-3 shadow-2xl backdrop-blur-md"
      style={{ boxShadow: '0 0 30px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(251,191,36,0.2)' }}
    >
      <div className="flex items-center gap-3">
        {/* Circular Progress Indicator */}
        <div className="relative w-7 h-7 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="14" cy="14" r="12" fill="none" stroke="#27272a" strokeWidth="2.5" />
            <circle
              cx="14"
              cy="14"
              r="12"
              fill="none"
              stroke="#C9A84C"
              strokeWidth="2.5"
              strokeDasharray="75.4"
              strokeDashoffset={75.4 - (75.4 * progress) / 100}
              className="transition-all duration-300 ease-out"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="flex flex-col justify-center">
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontSize: '16px', color: '#F0E6CC', lineHeight: '1.2' }}>Generating Portrait...</span>
          <span style={{ fontSize: '10px', color: '#7A7060', letterSpacing: '0.05em' }}>{progress}% Complete</span>
        </div>
      </div>

      <div className="w-px h-6 bg-zinc-700/50 mx-1"></div>

      <button
        onClick={onExpand}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-800 transition-colors text-zinc-300 hover:text-white"
        title="Expand Loading Screen"
      >
        <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>expand_content</span>
      </button>
    </div>
  );
}
