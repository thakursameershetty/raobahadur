'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import './PortraitGenerator.css';

const loadingMsgs = [
  'Consulting the royal artist...',
  'Selecting the finest fabrics...',
  'Arranging the golden backdrop...',
  'Applying cinematic lighting...',
  'Placing the crown jewels...',
  'Adding royal finishing touches...'
];

const DEFAULT_PROMPT = `Create a cinematic movie poster using the exact structural composition of the second reference image. Preserve the background, ALL miniature figures (including the boy on the turban), and wardrobe perfectly intact. The prominent typography on the poster MUST clearly and accurately spell exactly "RAO BAHADUR" without any typos or extra letters. Crucially, the face MUST be the exact person from the first reference image, preserving his distinct facial structure and nose so he is instantly recognizable. Transform his expression to be dignified, noble, and intensely serious, with eyes fully open and a clear, focused gaze. Apply the cinematic styling to HIS face: add thick bushy silver eyebrows (kept relatively straight, avoiding a scowl), a massive, heavy, dense grey-and-black mustache that remains thick throughout but has ends curling dynamically upward in a royal handlebar style, and flowing salt-and-pepper hair beneath the turban. Maintain the perfectly upright posture and dramatic, shadowy lighting.`;

function getDeviceId() {
  if (typeof window === 'undefined') return 'server';
  let deviceId = localStorage.getItem('satyadev_device_id');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('satyadev_device_id', deviceId);
  }
  return deviceId;
}

// Utility to compress and convert any image to a PNG to satisfy API requirements
// Downscales to a max dimension to save huge amounts of bandwidth
const compressImageToPNG = (file, maxDimension = 1024) => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".png", {
            type: 'image/png',
            lastModified: Date.now(),
          });
          resolve(newFile);
        } else {
          reject(new Error("Canvas toBlob failed"));
        }
      }, 'image/png');
    };
    img.onerror = (err) => reject(err);
    img.src = url;
  });
};

export default function PortraitGenerator({ 
  onBack,
  isGenerating,
  setIsGenerating,
  generationProgress,
  setGenerationProgress,
  isMinimized,
  onMinimize
}) {
  const [screen, setScreen] = useState('config');
  const [userFile, setUserFile] = useState(null);
  const [userPreviewUrl, setUserPreviewUrl] = useState('');
  const [refFile, setRefFile] = useState(null);
  const [refPreviewUrl, setRefPreviewUrl] = useState('');

  const [userName, setUserName] = useState('');
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [size, setSize] = useState('1024x1792');
  const [quality, setQuality] = useState('medium');

  const [errorMsg, setErrorMsg] = useState('');
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [resultDataUrl, setResultDataUrl] = useState(null);

  const userFileInputRef = useRef(null);

  useEffect(() => {
    // Load Default Reference Image
    fetch('/rao_bahadur_poster.jpg')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.blob();
      })
      .then(blob => {
        const file = new File([blob], 'rao_bahadur_poster.jpg', { type: blob.type || 'image/jpeg' });
        setRefFile(file);
        setRefPreviewUrl(URL.createObjectURL(blob));
      })
      .catch(err => console.log('Could not load default reference image.', err));

    // Cleanup URLs on unmount
    return () => {
      if (userPreviewUrl) URL.revokeObjectURL(userPreviewUrl);
      if (refPreviewUrl) URL.revokeObjectURL(refPreviewUrl);
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isGenerating && !isMinimized) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % loadingMsgs.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isGenerating, isMinimized]);

  const handleNameChange = (e) => {
    // Remove all spaces to force a single word
    const newName = e.target.value.replace(/\s+/g, '').toUpperCase();
    const oldDisplay = userName ? `${userName.toUpperCase()} BAHADUR` : "RAO BAHADUR";
    const newDisplay = newName ? `${newName} BAHADUR` : "RAO BAHADUR";

    setUserName(newName);
    setPrompt(prev => prev.replace(oldDisplay, newDisplay));
  };

  const handleUserUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleSetUserFile(file);
  };

  const handleSetUserFile = (file) => {
    if (userPreviewUrl) URL.revokeObjectURL(userPreviewUrl);
    setUserFile(file);
    setUserPreviewUrl(URL.createObjectURL(file));
    setErrorMsg('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleSetUserFile(file);
    }
  };

  const checkReady = () => {
    return userFile !== null && refFile !== null && userName.trim() !== '';
  };

  const generatePortrait = async () => {
    if (!userFile || !refFile || isGenerating) return;

    setErrorMsg('');
    setScreen('result');
    setIsGenerating(true);
    setResultDataUrl(null);
    setLoadingMsgIdx(0);
    setGenerationProgress(0);

    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(95, Math.floor((elapsed / 35000) * 95));
      setGenerationProgress(newProgress);
    }, 500);

    const fullPrompt = prompt.trim() || DEFAULT_PROMPT;

    try {
      // Compress both images before sending (drastically reduces upload time)
      const compressedUserFile = await compressImageToPNG(userFile, 768);
      const compressedRefFile = await compressImageToPNG(refFile, 768);

      const formData = new FormData();
      formData.append('prompt', fullPrompt);
      formData.append('size', size);
      formData.append('n', 1);

      // Pass the raw quality string directly since this custom API accepts 'high', 'medium', 'low'
      formData.append('quality', quality);

      // User image first (index 0)
      formData.append('image[]', compressedUserFile);
      // Reference image second (index 1)
      formData.append('image[]', compressedRefFile);

      const res = await fetch('/api/image-edits', {
        method: 'POST',
        body: formData,
      });

      const responseText = await res.text();
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Raw Azure Response:", data);
      } catch (e) {
        console.error("Non-JSON Response:", responseText);
        if (!res.ok) {
          throw new Error(responseText.substring(0, 100) || `API error ${res.status}`);
        }
        throw new Error('Invalid response from server');
      }

      if (!res.ok || data?.error) {
        const errMsg = data?.error?.message || `API error ${res.status}: ${res.statusText}`;
        throw new Error(errMsg);
      }

      const item = data?.data?.[0] || data?.result?.data?.[0];
      const b64 = item?.b64_json;
      const imageUrl = item?.url;

      let finalImageUrl = null;
      if (b64) {
        finalImageUrl = `data:image/png;base64,${b64}`;
      } else if (imageUrl) {
        finalImageUrl = imageUrl;
      } else {
        throw new Error('No image returned. Open browser Console to see what Azure sent.');
      }

      setGenerationProgress(100);
      setResultDataUrl(finalImageUrl);

      // Auto-upload to Cloudinary/Prisma for history
      try {
        const fetchRes = await fetch(finalImageUrl);
        const blob = await fetchRes.blob();

        const uploadForm = new FormData();
        uploadForm.append('file', blob, 'generated-portrait.png');
        uploadForm.append('uploader', getDeviceId());

        await fetch('/api/images', {
          method: 'POST',
          body: uploadForm
        });
        console.log("Successfully uploaded to history.");
      } catch (uploadErr) {
        console.error("Failed to upload to history:", uploadErr);
        // We don't throw here, because we still want to show the generated image to the user
      }

    } catch (err) {
      setScreen('config');
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setGenerationProgress(0);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => setIsGenerating(false), 500); // Give 100% a moment to show
    }
  };

  const downloadResult = () => {
    if (!resultDataUrl) return;
    const a = document.createElement('a');
    a.href = resultDataUrl;
    a.download = 'rao-bahadur-royal-portrait.png';
    a.click();
  };

  const shareResult = async () => {
    if (!resultDataUrl) return;
    try {
      const res = await fetch(resultDataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'rao-bahadur-portrait.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Royal Portrait',
          text: 'Check out my Rao Bahadur Royal Portrait! Generate yours at: https://raobahadur.vercel.app',
          files: [file],
        });
      } else {
        const clipboardItem = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([clipboardItem]);
        alert('Portrait copied to clipboard!');
      }
    } catch (err) {
      console.error("Error sharing:", err);
      alert('Could not share or copy the image on this device.');
    }
  };

  return (
    <div className="portrait-generator-wrapper">
      <div className="pg-page">
        <div className="pg-container">

          {/* Header */}
          <header className="pg-header">
            {screen === 'config' && onBack && (
              <button className="pg-back-btn" onClick={onBack}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                BACK
              </button>
            )}

            <Link 
              href="/history" 
              className="pg-history-btn"
              onClick={(e) => {
                if (isGenerating) {
                  e.preventDefault();
                  onMinimize();
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              HISTORY
            </Link>

            <h1>{userName ? userName : "Rao Bahadur"}<br /><em>Portrait Generator</em></h1>
            <div className="pg-header-ornament">
              <div className="pg-ornament-line"></div>
              <div className="pg-ornament-diamond"></div>
              <div className="pg-ornament-line right"></div>
            </div>
            <div className="pg-privacy-msg">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>We don&apos;t store your photos.<br className="pg-mobile-break" /> Used for image generation only.</span>
            </div>
          </header>

          {/* Screen 1: Configuration */}
          {screen === 'config' && (
            <div id="screen1">
              <div className="pg-section-label">Upload images</div>
              <div className="pg-workspace">

                {/* User Photo */}
                <div className="pg-upload-panel">
                  <div className="pg-card-header">
                    <svg className="pg-card-header-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                    <span className="pg-card-header-title">Your photo</span>
                  </div>
                  <div
                    className="pg-upload-body"
                    onClick={() => userFileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {!userPreviewUrl ? (
                      <div className="pg-upload-placeholder">
                        <div className="pg-upload-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>
                        <p>Upload your photo</p>
                        <small>Clear face shot works best</small>
                      </div>
                    ) : (
                      <>
                        <img src={userPreviewUrl} alt="Your photo" />
                        <div className="pg-upload-overlay">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <polyline points="1 4 1 10 7 10" />
                            <path d="M3.51 15a9 9 0 1 0 .49-4.51" />
                          </svg>
                          Change photo
                        </div>
                      </>
                    )}
                    <input
                      type="file"
                      className="pg-file-hidden"
                      ref={userFileInputRef}
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleUserUpload}
                    />
                  </div>
                </div>

                {/* Reference Image */}
                <div className="pg-upload-panel">
                  <div className="pg-card-header">
                    <svg className="pg-card-header-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="pg-card-header-title">Reference style</span>
                  </div>
                  <div className="pg-upload-body" style={{ cursor: 'default' }}>
                    {!refPreviewUrl ? (
                      <div className="pg-upload-placeholder">
                        <div className="pg-upload-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                        <p>Reference image</p>
                        <small>Loading...</small>
                      </div>
                    ) : (
                      <>
                        <img src={refPreviewUrl} alt="Reference image" />
                        <div className="pg-ref-badge">Rao Bahadur style</div>
                      </>
                    )}
                  </div>
                </div>

              </div>

              {/* Style Prompt */}
              <div className="pg-section-label">Style settings</div>
              <div className="pg-field-group">
                <div className="pg-field-label">How do people call you ?</div>
                <input
                  type="text"
                  placeholder="e.g. RAO"
                  value={userName}
                  onChange={handleNameChange}
                  maxLength={15}
                  pattern="[A-Za-z]+"
                  title="Please enter a single word"
                />
              </div>
              <div className="pg-field-group">
                <div className="pg-field-label">Style prompt</div>
                <textarea
                  value={prompt}
                  readOnly
                  className="pg-readonly-prompt"
                  title="The prompt is auto-generated based on your name"
                />
              </div>

              <div className="pg-controls-row">
                <div>
                  <div className="pg-field-label">Output size</div>
                  <select value={size} onChange={(e) => setSize(e.target.value)}>
                    <option value="1024x1024">1024 × 1024 — Square</option>
                    <option value="1024x1792">1024 × 1792 — Portrait</option>
                    <option value="1792x1024">1792 × 1024 — Landscape</option>
                  </select>
                </div>
                <div>
                  <div className="pg-field-label">Quality</div>
                  <select value={quality} onChange={(e) => setQuality(e.target.value)}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low (faster)</option>
                  </select>
                </div>
              </div>

              {/* Error Box */}
              {errorMsg && (
                <div className="pg-error-box" style={{ display: 'flex' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Generate Button */}
              <button
                className="pg-btn-primary"
                onClick={generatePortrait}
                disabled={!checkReady() || isGenerating}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                </svg>
                Generate
              </button>
            </div>
          )}

          {/* Screen 2: Result */}
          {screen === 'result' && (
            <div id="screen2">
              <button
                className="pg-btn-download"
                style={{ marginBottom: '1.5rem', width: 'auto' }}
                onClick={() => setScreen('config')}
                disabled={isGenerating}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Editor
              </button>

              <div className="pg-section-label">Generated portrait</div>
              <div className="pg-result-card">
                <div className="pg-result-body">
                  {!isGenerating && !resultDataUrl && (
                    <div className="pg-result-placeholder">
                      <div className="pg-result-placeholder-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                      <p>Your royal portrait will appear here</p>
                      <small>Configure credentials, upload photos, then generate</small>
                    </div>
                  )}

                  {isGenerating && !isMinimized && (
                    <div className="pg-loading-area relative w-full h-full flex flex-col items-center justify-center p-8 bg-zinc-900/80 rounded-xl backdrop-blur-md" style={{ minHeight: '400px' }}>
                      {/* Minimize Button */}
                      <button 
                        onClick={onMinimize} 
                        className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
                        title="Minimize"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                          <path d="M440-120v-240H200v80h104L140-116l56 56 164-164v104h80Zm160-520v-104h-80v240h240v-80H656l164-164-56-56-164 164Z"/>
                        </svg>
                      </button>

                      {/* Circular Progress Indicator */}
                      <div className="relative w-40 h-40 mb-6 flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                          <circle cx="80" cy="80" r="70" fill="none" stroke="#27272a" strokeWidth="8" />
                          <circle 
                            cx="80" 
                            cy="80" 
                            r="70" 
                            fill="none" 
                            stroke="#f59e0b" 
                            strokeWidth="8" 
                            strokeDasharray="439.8" 
                            strokeDashoffset={439.8 - (439.8 * generationProgress) / 100}
                            className="transition-all duration-300 ease-out"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-white font-mono">{generationProgress}%</span>
                        </div>
                      </div>

                      <div className="pg-loading-msg">{loadingMsgs[loadingMsgIdx]}</div>
                      <div className="pg-loading-sub mt-2">Please wait, your portrait is being crafted...</div>
                    </div>
                  )}

                  {resultDataUrl && !isGenerating && (
                    <img src={resultDataUrl} alt="Generated royal portrait" />
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {resultDataUrl && !isGenerating && (
                <div className="pg-result-actions">
                  <button className="pg-btn-secondary" onClick={shareResult}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    Share
                  </button>
                  <button className="pg-btn-download" onClick={downloadResult}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
