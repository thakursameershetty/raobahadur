'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './page.css';

export default function HistoryPage() {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const getDeviceId = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('satyadev_device_id');
  };

  const fetchImages = async () => {
    const deviceId = getDeviceId();
    if (!deviceId) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/images?deviceId=${deviceId}`);
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      setImages(data);
    } catch (err) {
      console.error(err);
      setError('Could not load your history.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const deviceId = getDeviceId();
    if (!deviceId) return;

    if (!confirm('Are you sure you want to delete this portrait?')) return;

    // Optimistic UI update
    setImages(prev => prev.filter(img => img.id !== id));

    try {
      const res = await fetch(`/api/images?id=${id}&deviceId=${deviceId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
    } catch (err) {
      console.error(err);
      // Revert if failed
      alert('Failed to delete portrait.');
      fetchImages();
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDownload = (url) => {
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const fileUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = 'rao-bahadur-royal-portrait.png';
        a.click();
        URL.revokeObjectURL(fileUrl);
      })
      .catch(err => {
        console.error("Download failed", err);
        alert("Failed to download image.");
      });
  };

  const handleShare = async (url) => {
    try {
      const res = await fetch(url);
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
    <div className="history-wrapper">
      <header className="history-header">
        <Link href="/?open=generator" className="history-back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Generator
        </Link>
        <h1>Your Royal Portraits</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>A lifetime collection of your generated portraits.</p>
      </header>

      {isLoading ? (
        <div className="history-loading">Loading your portraits...</div>
      ) : error ? (
        <div className="history-empty">{error}</div>
      ) : images.length === 0 ? (
        <div className="history-empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" style={{ marginBottom: '1rem', opacity: 0.5 }}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <p>You haven&apos;t generated any portraits yet.</p>
        </div>
      ) : (
        <div className="history-grid">
          {images.map(img => (
            <div key={img.id} className="history-card">
              <div className="history-img-wrapper">
                {/* We use standard img to bypass Next.js image optimization limits if any, since it's Cloudinary */}
                <img src={img.url} alt="Royal Portrait" className="history-img" loading="lazy" />
              </div>
              <div className="history-card-overlay">
                <span className="history-date">
                  {formatDate(img.createdAt)}
                </span>
                <div className="history-actions">
                  <button
                    className="history-action-btn"
                    onClick={() => handleShare(img.url)}
                    title="Share portrait"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                  </button>
                  <button
                    className="history-action-btn"
                    onClick={() => handleDownload(img.url)}
                    title="Download portrait"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                  <button
                    className="history-action-btn delete-btn"
                    onClick={() => handleDelete(img.id)}
                    title="Delete portrait"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
