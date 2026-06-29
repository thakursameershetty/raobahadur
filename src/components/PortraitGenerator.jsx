'use client';

import React, { useState } from 'react';
import './PortraitGenerator.css';

export default function PortraitGenerator({ onBack }) {
  const [screen, setScreen] = useState('dataCollection');
  const [userName, setUserName] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const prepareGeneration = () => {
    if (!userName.trim()) {
      alert("Please enter your name.");
      return;
    }

    const upperName = userName.trim().toUpperCase();
    const prompt = `Create a cinematic movie poster using the exact structural composition of the Reference Image. Preserve the background, ALL miniature figures (including the boy on the turban), and wardrobe perfectly intact. The prominent typography on the poster MUST clearly and accurately spell exactly "${upperName} BAHADUR" without any typos or extra letters. Crucially, the face MUST be the exact person from the User Image, preserving his distinct facial structure and nose so he is instantly recognizable. Transform his expression to be dignified, noble, and intensely serious, with eyes fully open and a clear, focused gaze. Apply the cinematic styling to HIS face: add thick bushy silver eyebrows (kept relatively straight, avoiding a scowl), a massive, heavy, dense grey-and-black mustache that remains thick throughout but has ends curling dynamically upward in a royal handlebar style, and flowing salt-and-pepper hair beneath the turban. Maintain the perfectly upright posture and dramatic, shadowy lighting.

[SYSTEM INSTRUCTION REGARDING ATTACHED IMAGES]
I will attach two images for this request:
1. A regular photo of a person's face (The "User Image").
2. A cinematic movie poster featuring a man in royal attire with a turban (The "Reference Image").

Before generating anything, you MUST verify the attached images:
- If NO images are attached, STOP and reply EXACTLY with: "Please upload both your photo and the downloaded reference image from the website to proceed."
- If ONLY ONE image is attached, analyze it to determine if it is the User Image (a regular face) or the Reference Image (the royal poster). Then, politely ask me to upload the specific missing image.
- If BOTH images are attached, proceed immediately with the image generation using the detailed instructions above.

[POST-GENERATION INSTRUCTION - CHAT RESPONSE ONLY]
CRITICAL: DO NOT render, paint, or write the promotional text inside the actual image pixels. The ONLY text inside the image should be "${upperName} BAHADUR".
After the image generation is complete, in your standard text reply (outside of the image), you must output this exact message:
"Share this masterpiece with your people and spread the love! ✨ Create your own royal portrait at https://raobahadur.vercel.app/"`;

    setGeneratedPrompt(prompt);
    setScreen('redirectDashboard');
  };

  const copyDynamicPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }).catch(() => {
      alert("Failed to copy. Your browser might be blocking clipboard access.");
    });
  };

  const downloadRefAsset = () => {
    const aRef = document.createElement('a');
    aRef.href = '/rao_bahadur_poster.jpg';
    aRef.download = 'rao_bahadur_poster.jpg';
    document.body.appendChild(aRef);
    aRef.click();
    document.body.removeChild(aRef);
  };

  const redirectToAI = () => {
    const encodedPrompt = encodeURIComponent(generatedPrompt);
    window.open(`https://chatgpt.com/?q=${encodedPrompt}`, '_blank');
  };

  return (
    <div className="portrait-generator-wrapper">
      <div className="pg-page">
        <div className="pg-container">
          {/* Header */}
          <header className="pg-header">
            {onBack && (
              <button
                onClick={onBack}
                className="absolute top-[calc(env(safe-area-inset-top,1rem)+1.5rem)] left-6 md:top-10 md:left-12 z-40 flex items-center justify-center w-10 h-10 bg-zinc-900/60 backdrop-blur-md border border-zinc-700/50 text-zinc-300 rounded-full hover:bg-zinc-800 hover:text-amber-500 transition-all duration-700 hover:scale-105 group"
              >
                <span className="material-symbols-rounded transition-transform duration-300 group-hover:-translate-x-0.5">chevron_backward</span>
              </button>
            )}

            <h1>Show The Love ❤️</h1>
            <p>Configure your custom cinematic portrait.</p>
            <div className="pg-header-ornament" style={{ marginTop: '1.25rem' }}>
              <div className="pg-ornament-line"></div>
              <div className="pg-ornament-diamond"></div>
              <div className="pg-ornament-line right"></div>
            </div>
          </header>

          {/* Screen 1: Data Collection */}
          {screen === 'dataCollection' && (
            <div>
              <div className="pg-field-group">
                <label className="pg-field-label">How do people call you ?</label>
                <input
                  type="text"
                  placeholder="Enter your name..."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>

              <div className="pg-field-group">
                <label className="pg-field-label">Reference Image</label>
                <div style={{ maxWidth: '380px', margin: '0 auto 1.5rem auto' }}>
                  <div className="pg-upload-panel" style={{ cursor: 'default' }}>
                    <div className="pg-upload-body" style={{ height: 'auto', display: 'block' }}>
                      <img src="/rao_bahadur_poster.jpg" alt="Reference" style={{ width: '100%', height: 'auto', position: 'relative' }} />
                    </div>
                  </div>
                </div>
              </div>

              <button className="pg-btn-primary" onClick={prepareGeneration} style={{ width: '100%' }}>
                Prepare Portrait Kit
              </button>
            </div>
          )}

          {/* Screen 2: Redirect Dashboard */}
          {screen === 'redirectDashboard' && (
            <div>
              <button className="pg-btn-download" style={{ width: 'auto', padding: '8px 16px', fontSize: '13px', marginBottom: '1.5rem' }} onClick={() => setScreen('dataCollection')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: '6px', display: 'inline-block' }}>
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back
              </button>

              <div className="pg-result-card" style={{ padding: '2rem 1.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--gold-light)', fontSize: '1.8rem', marginBottom: '8px' }}>Your Kit is Ready</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    First, download the reference image. Then copy the prompt and generate with ChatGPT.<br />
                    <strong style={{ color: 'var(--gold-light)' }}>Make sure to upload your photo along with this reference image!</strong>
                  </p>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span className="pg-field-label">Reference</span>
                      <img src="/rao_bahadur_poster.jpg" alt="Reference Image" style={{ width: '120px', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
                    </div>
                  </div>
                  <button className="pg-btn-download" style={{ width: 'auto', marginTop: '15px', gap: '8px' }} onClick={downloadRefAsset}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download Reference Image
                  </button>
                </div>

                <div className="pg-field-group">
                  <label className="pg-field-label">Custom Prompt</label>
                  <textarea
                    readOnly
                    value={generatedPrompt}
                    style={{ minHeight: '120px', fontSize: '13px', backgroundColor: 'var(--ink-3)', outline: 'none' }}
                  />
                </div>

                <button
                  className="pg-btn-secondary"
                  onClick={copyDynamicPrompt}
                  style={isCopied ? { borderColor: 'var(--success-text)', color: 'var(--success-text)' } : {}}
                >
                  {isCopied ? '✓ Prompt Copied Successfully!' : 'Copy Custom Prompt'}
                </button>

                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', textAlign: 'center' }}>
                  <label className="pg-field-label">Ready to Generate?</label>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '1rem' }}>
                    Upload both your photo and the downloaded reference image, and paste the custom prompt into ChatGPT.
                  </p>
                  <button
                    className="pg-btn-primary"
                    onClick={redirectToAI}
                    style={{ background: '#10a37f', borderColor: '#10a37f', color: 'white', fontFamily: "'Inter', sans-serif", letterSpacing: 'normal' }}
                  >
                    <img src="/chatgpt-logo.png" alt="ChatGPT Logo" style={{ width: '22px', height: '22px', marginRight: '6px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                    Generate with ChatGPT
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
