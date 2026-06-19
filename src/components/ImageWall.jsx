'use client';

import { useRef, useState, useEffect } from 'react';

export default function ImageWall({ onBack }) {
  const iframeRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.data) return;
      if (event.data.type === 'MODAL_STATE') {
        setIsModalOpen(event.data.isOpen);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);


  const triggerUploadModal = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.postMessage('OPEN_UPLOAD_MODAL', '*');
    }
  };

  return (
    <div className="w-full h-full relative bg-[#07161b] overflow-hidden">
      {/* Header strip */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 md:px-6 pt-4 md:pt-5 pb-3 pointer-events-none flex flex-col items-center gap-3"
        style={{ background: 'linear-gradient(to bottom, rgba(7,22,27,0.95) 0%, transparent 100%)' }}
      >
        <div className="text-center flex flex-col items-center">
          <h2
            className="text-lg md:text-[22px] font-semibold tracking-[0.3em] uppercase text-center"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              background: 'linear-gradient(105deg, #9c7a35 0%, #f0d693 35%, #c9a24c 55%, #f6e4a8 70%, #9c7a35 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Wall of Love
          </h2>
          <p className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase mt-1" style={{ color: 'rgba(201,162,76,0.5)', fontFamily: "'Cormorant Garamond', serif" }}>
            Upload · Snap · Pin your tribute
          </p>
        </div>

        <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 pointer-events-auto mt-1">
          {onBack && (
            <button
              onClick={onBack}
              className="group px-5 py-2.5 text-xs tracking-[0.2em] uppercase transition-all duration-300 flex items-center gap-2"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                border: '1px solid rgba(201,162,76,0.4)',
                background: 'rgba(7,22,27,0.6)',
                color: '#e7c879',
                borderRadius: '9999px',
                backdropFilter: 'blur(4px)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(201,162,76,0.18)';
                e.currentTarget.style.border = '1px solid rgba(201,162,76,0.85)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(201,162,76,0.2)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(7,22,27,0.6)';
                e.currentTarget.style.border = '1px solid rgba(201,162,76,0.4)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span>←</span> Back
            </button>
          )}

          {/* New Upload Modal Trigger Button */}
          <button
            onClick={triggerUploadModal}
            className="px-5 py-2.5 text-xs tracking-[0.2em] uppercase transition-all duration-300 flex items-center gap-2"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              border: '1px solid rgba(201,162,76,0.85)',
              background: 'rgba(201,162,76,0.15)',
              color: '#f0d693',
              borderRadius: '9999px',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 0 15px rgba(201,162,76,0.1)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(201,162,76,0.3)';
              e.currentTarget.style.border = '1px solid rgba(201,162,76,1.0)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(201,162,76,0.35)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(201,162,76,0.15)';
              e.currentTarget.style.border = '1px solid rgba(201,162,76,0.85)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(201,162,76,0.1)';
            }}
          >
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* The sandboxed gallery wall — full fidelity, no conflicts */}
      <iframe
        ref={iframeRef}
        src="/image-wall.html"
        className={`absolute inset-0 w-full h-full border-0 ${isModalOpen ? 'z-50' : 'z-0'}`}
        title="Image Wall"
        allow="camera"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />

      {/* Responsive Static Overlays */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
        {/* Desktop Layer */}
        <img
          src="/wall-layers/wall-layer-desktop.png"
          alt=""
          className="hidden md:block absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.95 }}
        />
        {/* Tablet Layer */}
        <img
          src="/wall-layers/wall-layer-tablet.png"
          alt=""
          className="hidden sm:block md:hidden absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.95 }}
        />
        {/* Mobile Layer */}
        <img
          src="/wall-layers/wall-layer-mobile.png"
          alt=""
          className="block sm:hidden absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.95 }}
        />
      </div>

      {/* Vertical gold divider accent on the left edge */}
      <div className="absolute top-0 left-0 bottom-0 w-[1px] z-20 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,162,76,0.4) 20%, rgba(201,162,76,0.4) 80%, transparent)' }}
      />
    </div>
  );
}
