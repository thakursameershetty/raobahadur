'use client';

import React from 'react';

export default function FloatingPill({ progress, onExpand }) {
  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-4 bg-zinc-900/90 border border-amber-500/30 rounded-full px-5 py-3 shadow-2xl backdrop-blur-md"
      style={{ boxShadow: '0 0 30px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(251,191,36,0.2)' }}
    >
      <div className="flex items-center gap-3">
        {/* Spinner */}
        <div className="relative w-6 h-6 flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-zinc-700 rounded-full"></div>
          <div
            className="absolute inset-0 border-2 border-amber-500 rounded-full border-t-transparent animate-spin"
          ></div>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-white tracking-wide">Generating Portrait...</span>
          <span className="text-[10px] text-zinc-400 font-mono">{progress}% Complete</span>
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
