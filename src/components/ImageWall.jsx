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
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 50,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '12px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            border: '1px solid rgba(201,162,76,0.45)',
            background: 'rgba(6,10,6,0.65)',
            color: '#e7c879',
            borderRadius: '9999px',
            padding: '8px 18px',
            backdropFilter: 'blur(6px)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(201,162,76,0.18)';
            e.currentTarget.style.border = '1px solid rgba(201,162,76,0.85)';
            e.currentTarget.style.boxShadow = '0 0 14px rgba(201,162,76,0.22)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(6,10,6,0.65)';
            e.currentTarget.style.border = '1px solid rgba(201,162,76,0.45)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          ← Back
        </button>
      )}
    </div>
  );
}
