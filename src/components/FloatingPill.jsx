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
        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
          <path d="M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z" />
        </svg>
      </button>
    </div>
  );
}
