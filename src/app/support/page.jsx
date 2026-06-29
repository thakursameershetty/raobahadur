'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import FollowerCounter from '@/components/ui/FollowerCounter';
import CustomCursor from '@/components/CustomCursor';

export default function SupportPage() {
  const router = useRouter();
  const [visitorCount, setVisitorCount] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCounterDone, setIsCounterDone] = useState(false);

  useEffect(() => {
    // Fetch current visitor count
    fetch('/api/visits')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.count === 'number') {
          setVisitorCount(data.count);
        }
      })
      .catch(err => console.error('Error fetching visit count:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (res.ok) {
        setIsSubmitted(true);
        // Redirect to ImageWall generator page after a short delay
        setTimeout(() => {
          router.push('/?open=generator');
        }, 1000);
      } else {
        console.error('Failed to submit message');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="relative min-h-[100dvh] w-full bg-[#030807] overflow-hidden flex flex-col items-center justify-start p-6 text-white font-sans"
      style={{ cursor: 'none' }}
    >
      {/* Background Gradient similar to HeroSection */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,162,76,0.1)_0%,transparent_70%)] pointer-events-none" />

      {/* Floating Back Button */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-[calc(env(safe-area-inset-top,1rem)+1.5rem)] left-6 md:top-10 md:left-12 z-50 flex items-center gap-2 px-4 py-2 bg-[rgba(7,22,27,0.6)] backdrop-blur-md border border-[rgba(201,162,76,0.3)] text-[#e7c879] text-xs font-mono uppercase tracking-normal rounded-full hover:bg-[rgba(201,162,76,0.15)] hover:border-[rgba(201,162,76,0.6)] transition-all duration-300 hover:scale-105 group shadow-[0_0_15px_rgba(201,162,76,0.1)]"
      >
        <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">←</span>
        Back
      </button>

      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl mt-4 px-4 h-full">
        <motion.div
          className="w-full flex flex-col items-center"
          initial={{ y: "35vh" }}
          animate={{ y: isCounterDone ? "5vh" : "35vh" }}
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
                  <span><span className="text-[#e7c879] font-medium">{visitorCount}</span> people rooting for Satyadev ❤️</span>
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

                  <p className="text-xl md:text-2xl font-light mb-10 text-white/90 tracking-wide" style={{ fontFamily: '"Cormorant Garamond", serif' }}>
                    Why are you rooting for Satyadev?
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
    </main>
  );
}
