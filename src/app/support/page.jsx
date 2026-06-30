'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import FollowerCounter from '@/components/ui/FollowerCounter';
import CustomCursor from '@/components/CustomCursor';
import GlobeAnimation from '@/components/GlobeAnimation';

export default function SupportPage() {
  const router = useRouter();
  const [visitorCount, setVisitorCount] = useState(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCounterDone, setIsCounterDone] = useState(false);
  const [showGlobeView, setShowGlobeView] = useState(false);

  const hasIncremented = useRef(false);
  const mainRef = useRef(null);

  useEffect(() => {
    // 1. Instantly display the count from local storage + 1 for zero latency
    try {
      const localCount = localStorage.getItem('satyadev_visitorCount');
      if (localCount) {
        setVisitorCount(parseInt(localCount, 10) + 1);
      }
    } catch (e) { }

    // 2. Fire and forget POST request to actually increment the database in the background
    // We use a ref to prevent double-increment in React Strict Mode
    if (!hasIncremented.current) {
      hasIncremented.current = true;
      fetch('/api/visits', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          // Optional: Update to true live count just in case it's drastically different
          if (data && typeof data.count === 'number') {
            setVisitorCount(data.count);
          }
        })
        .catch(err => console.error('Error incrementing visit count:', err));
    }

    // 3. Realtime dynamic updates: Poll the server every 3 seconds for live count changes
    const pollInterval = setInterval(() => {
      fetch('/api/visits')
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.count === 'number') {
            // This will trigger the counter flip animation gracefully if the count has increased
            setVisitorCount(prev => (data.count > prev ? data.count : prev));
          }
        })
        .catch(e => console.error('Error fetching live count:', e));
    }, 3000);

    return () => clearInterval(pollInterval);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Instantly transition for zero latency!
    setIsSubmitted(true);
    setShowGlobeView(true);
    
    // Reset scroll position to top instantly so the background doesn't stay scrolled
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Fire and forget POST request in the background
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    }).catch(err => console.error('Error submitting message:', err));
  };

  return (
    <main
      ref={mainRef}
      className={`relative h-[100dvh] w-full bg-[#030807] overflow-x-hidden ${showGlobeView ? 'overflow-hidden' : 'overflow-y-auto'} flex flex-col items-center justify-start p-6 text-white font-sans pb-24`}
      style={{ cursor: 'none' }}
    >
      {/* Background Gradient similar to HeroSection */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,76,0.1)_0%,transparent_70%)] pointer-events-none" />

      {/* Floating Back Button */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-[calc(env(safe-area-inset-top,1rem)+1.5rem)] left-6 md:top-10 md:left-12 z-50 flex items-center justify-center w-10 h-10 bg-zinc-900/60 backdrop-blur-md border border-zinc-700/50 text-zinc-300 rounded-full hover:bg-zinc-800 hover:text-amber-500 transition-all duration-700 hover:scale-105 group"
      >
        <span className="material-symbols-rounded transition-transform duration-300 group-hover:-translate-x-0.5">chevron_backward</span>
      </button>

      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl pt-24 md:pt-32 px-4 pb-40">
        <motion.div
          className="w-full flex flex-col items-center"
          initial={{ y: 150 }}
          animate={{ y: isCounterDone ? 0 : 150 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="scale-[0.85] md:scale-110 mb-8 w-full flex justify-center h-[120px] items-center">
            <FollowerCounter targetCount={visitorCount} onComplete={() => setIsCounterDone(true)} />
          </div>

          <AnimatePresence>
            {isCounterDone && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onAnimationStart={() => {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(10);
                  }
                }}
                className="w-full flex flex-col items-center"
              >
                <div className="flex flex-col items-center gap-2 mb-10 text-xl md:text-3xl text-center font-light text-[#e7c879]/90 drop-shadow-md italic max-w-2xl mx-auto" style={{ fontFamily: 'var(--font-inter), sans-serif', letterSpacing: '0.02em' }}>
                  <span>Congratulations! You are among</span>
                  <span><span className="text-[#e7c879] font-medium">{visitorCount}</span> people rooting for Satyadev <span className="animate-heartbeat not-italic inline-block">❤️</span></span>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  onAnimationStart={() => {
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                      navigator.vibrate([5, 10]);
                    }
                  }}
                  className="w-full bg-black/30 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 md:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#e7c879]/30 to-transparent" />

                  <p className="text-lg md:text-xl font-light mb-10 text-[#e7c879] tracking-wide" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
                    If Satyadev could read a message from you, what would you say?
                  </p>

                  <form onSubmit={handleSubmit} className="relative flex flex-col gap-8">
                    <div className="relative group">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Share your thoughts..."
                        rows={3}
                        className="w-full bg-transparent border-b border-white/10 text-[#e7c879] placeholder:text-white/20 focus:outline-none focus:border-[#e7c879]/60 transition-colors py-2 resize-none text-lg md:text-xl font-light"
                        style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || isSubmitted || !message.trim()}
                      className="group relative overflow-hidden px-10 py-4 text-sm md:text-base tracking-normal uppercase font-bold transition-all duration-500 ease-out disabled:opacity-50 disabled:cursor-not-allowed rounded-full self-center mt-4"
                      style={{
                        fontFamily: 'var(--font-inter), sans-serif',
                        background: isSubmitting || isSubmitted ? 'rgba(201,162,76,0.4)' : 'linear-gradient(135deg, #e7c879 0%, #c9a24c 100%)',
                        color: '#020504',
                        boxShadow: isSubmitting || isSubmitted ? 'none' : '0 0 25px rgba(201,162,76,0.4), inset 0 0 10px rgba(255,255,255,0.4)',
                      }}
                      onMouseEnter={e => {
                        if (isSubmitting || isSubmitted || !message.trim()) return;
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 0 40px rgba(201,162,76,0.6), inset 0 0 15px rgba(255,255,255,0.5)';
                      }}
                      onMouseLeave={e => {
                        if (isSubmitting || isSubmitted || !message.trim()) return;
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 0 25px rgba(201,162,76,0.4), inset 0 0 10px rgba(255,255,255,0.4)';
                      }}
                    >
                      {isSubmitting ? 'Submitting...' : isSubmitted ? 'Thank You!' : 'Submit'}
                    </button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <CustomCursor />

      {showGlobeView && (
        <GlobeAnimation
          message={message}
          author="Believer"
          onBack={() => setShowGlobeView(false)}
          onNext={() => router.push('/love')}
        />
      )}
    </main>
  );
}
