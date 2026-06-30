'use client';

import * as React from "react";
import { createPortal } from "react-dom";
import {
  motion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";

const fontSize = 60;
const padding = 15;
const height = fontSize + padding;

function Number({ mv, number }) {
  let y = useTransform(mv, (latest) => {
    let placeValue = latest % 10;
    let offset = (10 + number - placeValue) % 10;
    let memo = offset * height;
    if (offset > 5) {
      memo -= 10 * height;
    }
    return memo;
  });

  return (
    <motion.span
      style={{ y }}
      className="absolute inset-0 flex items-center justify-center font-bold"
    >
      {number}
    </motion.span>
  );
}

function Digit({ place, value }) {
  let valueRoundedToPlace = Math.floor(value / place);
  let animatedValue = useSpring(valueRoundedToPlace, { stiffness: 150, damping: 20 });

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  return (
    <div style={{ height }} className="relative w-[1ch] tabular-nums">
      {[...Array(10).keys()].map((i) => (
        <Number key={i} mv={animatedValue} number={i} />
      ))}
    </div>
  );
}

export function Counter({ value }) {
  // Determine places dynamically based on string length, minimum 4 digits
  const strVal = value.toString();
  const numDigits = Math.max(4, strVal.length);

  const places = [];
  for (let i = numDigits - 1; i >= 0; i--) {
    places.push(Math.pow(10, i));
  }

  return (
    <div
      style={{ fontSize, fontFamily: 'var(--font-inter), sans-serif' }}
      className="flex items-center justify-center space-x-0.5 overflow-hidden px-2 leading-none text-[#e7c879] drop-shadow-[0_0_15px_rgba(201,162,76,0.5)] font-bold tracking-tighter"
    >
      {places.map((place) => (
        <Digit key={place} place={place} value={value} />
      ))}
    </div>
  );
}

export default function FollowerCounter({ targetCount, className, onComplete }) {
  const [count, setCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // For confetti
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    // Fast fluctuating animation while waiting for targetCount
    if (targetCount === null) {
      const timer = setInterval(() => {
        setCount(Math.floor(Math.random() * 9999));
      }, 50);
      return () => clearInterval(timer);
    }

    // Animate up to the target count
    if (targetCount > 0) {
      let current = 0;
      const step = Math.max(1, Math.ceil(targetCount / 30));
      const snapSound = typeof Audio !== 'undefined' ? new Audio('/assets/sounds/snap.ogg') : null;

      const timer = setInterval(() => {
        current += step;
        if (current >= targetCount) {
          setCount(targetCount);
          clearInterval(timer);
          setShowConfetti(true);
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([15, 30, 15]); // stronger finish haptic
          }
          if (snapSound) {
            const finalSnap = snapSound.cloneNode();
            finalSnap.volume = 0.2;
            finalSnap.play().catch(e => console.warn('Audio play failed:', e));
          }
          if (onComplete) onComplete();
        } else {
          setCount(current);
          // Removed audio and haptics on every tick to fix extreme lag on mobile devices
        }
      }, 30);
      return () => clearInterval(timer);
    }
  }, [targetCount]);

  return (
    <div className={`relative flex flex-col items-center justify-center w-full ${className || ''}`}>
      <Counter value={count} />
      {showConfetti && typeof document !== 'undefined' && createPortal(
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={400}
          gravity={0.15}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}
        />,
        document.body
      )}
    </div>
  );
}
