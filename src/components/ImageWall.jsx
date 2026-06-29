'use client';

export default function ImageWall({ onBack }) {
  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Royal Photo Booth — full screen */}
      <iframe
        src="/royal_photo_booth_v3.html"
        className="absolute inset-0 w-full h-full border-0"
        title="Royal Photo Booth"
        allow="camera"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />

      {/* Floating back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-[calc(env(safe-area-inset-top,1rem)+1.5rem)] left-6 md:top-10 md:left-12 z-50 flex items-center justify-center w-10 h-10 bg-zinc-900/60 backdrop-blur-md border border-zinc-700/50 text-zinc-300 rounded-full hover:bg-zinc-800 hover:text-amber-500 transition-all duration-700 hover:scale-105 group"
        >
          <span className="material-symbols-rounded transition-transform duration-300 group-hover:-translate-x-0.5">chevron_backward</span>
        </button>
      )}
    </div>
  );
}
