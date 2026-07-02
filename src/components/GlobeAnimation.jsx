"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const DUMMY_MESSAGES = [
  "Anna, Rao Bahadur kosam chala eager ga wait chestunnam. ❤️",
  "Mee acting ante chala ishtam. All the best! 🙌",
  "First day first show fix! 🍿",
  "Trailer chusi goosebumps vachayi. 🔥",
  "Mee hard work ki super success ravali.",
  "Blockbuster avvali anna! 💥",
  "Proud to be your fan. ❤️",
  "Waiting for another outstanding performance.",
  "Mee cinema miss avvanu. 🎬",
  "Wishing the whole team huge success. ✨",
  "Rao Bahadur release kosam counting days! ⏳",
  "Mee dedication ki hats off anna. 👏",
  "Trailer chusi expectations inka perigayi.",
  "Ee role lo mimmalni chudataniki excited ga unnanu. 🤩",
  "Another powerful performance loading! 💯",
  "Rao Bahadur definitely blockbuster avvali. 🚀",
  "Mee journey maaku inspiration anna.",
  "Mee movies lo emotion always next level. ❤️",
  "This movie will surely create magic. ✨",
  "All the very best to the entire cast and crew!",
  "Always proud to support your films. 🙌",
  "Can't wait to experience Rao Bahadur in theatres. 🍿",
  "Mee screen presence simply outstanding.",
  "Every frame of the teaser looked amazing. 🔥",
  "Rooting for your biggest success yet! ❤️",
  "Rao Bahadur will be worth the wait.",
  "Wishing you endless success, anna. 🌟",
  "Mee acting ki eppudu fan ne.",
  "Theatres lo whistles guarantee! 🎉",
  "Goosebumps from the very first glimpse. 🔥",
  "Mass and class performance expect chestunnam.",
  "Mee hard work definitely pay off avutundi. 💪",
  "Rao Bahadur history create cheyyali.",
  "All the best Satyadev anna! ❤️",
  "This one is going to be special.",
  "Waiting to witness another masterpiece. 🎥",
  "Mee script selections eppudu unique untayi.",
  "Pakka repeat watch movie anipisthundi. 😍",
  "Blockbuster vibes already! 💥",
  "Love and support always anna. ❤️",
  "Mee performance kosam andaroo wait chestunnaru.",
  "Rooting for Rao Bahadur from day one. 🚩",
  "Wishing you all the love and success. ❤️",
  "Proud moment for every Satyadev fan.",
  "The teaser raised the bar! 🚀",
  "Hope this becomes your career best. 🤞",
  "Rao Bahadur will make us proud. ❤️",
  "Mee talent deserves even bigger recognition.",
  "See you on First Day First Show! 🍿",
  "Best wishes to the entire Rao Bahadur team. 🎉"
];

export default function GlobeAnimation({ message, author, onBack, onNext }) {
  const mountRef = useRef(null);
  const shareRef = useRef(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (shareRef.current && !isSharing) {
      setIsSharing(true);
      await shareRef.current();
      setIsSharing(false);
    }
  };

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // 1. Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0d0603, 0.015);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // EXACT MATCH to globe.html (no alpha: true) to prevent double CSS blending
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });

    // EXACT MATCH to Three.js r128 legacy color handling (prevents overexposure/brightness)
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // --- FIX: CAMERA IS NOW DEAD CENTER ---
    camera.position.set(0, 0, 0.1);
    scene.add(camera);

    const controls = new OrbitControls(camera, renderer.domElement);
    // Controls look precisely at the center as well
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = -0.4;
    controls.enabled = false;

    // 2. Setup Core Point Image & Royal Aura
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous'; // Important for Cloudinary

    const isMobile = window.innerWidth < 768;
    // EXACT MATCH to globe.html URLs (the local files might have different crop/dimensions)
    const coreImageUrl = isMobile
      ? 'https://res.cloudinary.com/dbn2ye2zo/image/upload/v1782118968/satyadev_assets/mobile-layers/fourth.png'
      : 'https://res.cloudinary.com/dbn2ye2zo/image/upload/v1782118963/satyadev_assets/layers/third.png';

    const coreWidth = isMobile ? 18 : 36;
    const coreHeight = isMobile ? 31 : 21;
    const coreYOffset = isMobile ? -1 : 0; // Shift portrait slightly down on mobile

    const coreGeometry = new THREE.PlaneGeometry(coreWidth, coreHeight);
    let coreMesh;

    // Animation flags for auto-starting
    let isCoreLoaded = false;
    let hasStartedAnimation = false;

    textureLoader.load(
      coreImageUrl,
      (texture) => {
        const coreMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: THREE.DoubleSide
        });
        coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
        // Place exactly 20 units in front of the camera, adjusted for mobile
        coreMesh.position.set(0, coreYOffset, -20);
        camera.add(coreMesh);
        isCoreLoaded = true; // Signal that the central image is ready
      },
      undefined,
      (err) => {
        console.error("Failed to load core image, forcing animation start:", err);
        isCoreLoaded = true;
      }
    );

    // Failsafe: Force start animation after 1.5 seconds even if image hangs
    const forceStartTimeout = setTimeout(() => {
      isCoreLoaded = true;
    }, 1500);

    // Aura
    function createAuraTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
      gradient.addColorStop(0, 'rgba(231, 194, 106, 0.8)');
      gradient.addColorStop(0.5, 'rgba(139, 69, 19, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);
      return new THREE.CanvasTexture(canvas);
    }

    const auraGeometry = new THREE.PlaneGeometry(40, 40);
    const auraMaterial = new THREE.MeshBasicMaterial({
      map: createAuraTexture(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
    });
    const auraMesh = new THREE.Mesh(auraGeometry, auraMaterial);
    auraMesh.position.set(0, coreYOffset, -21);
    camera.add(auraMesh);

    // 3. Build the Elegant Inner Globe inside a Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const numCards = 300;
    const globeRadius = 38;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    let targetCard = null;
    let minDistanceToTarget = Infinity;

    // --- FIX: Target search coordinates adjusted for the newly centered globe ---
    // Make the new card appear in the viewing area near the turban
    const topAreaView = new THREE.Vector3(12, 18, -31);

    // Immediately initialize with user's message and dummy messages for zero latency
    const initialMessages = [message, ...DUMMY_MESSAGES].filter(Boolean);
    const textures = initialMessages.map(msg => createTextTexture(msg, author || "Believer"));
    if (textures.length === 0) {
      textures.push(createTextTexture("Belief...", "Believer"));
    }

    const cards = [];
    for (let i = 0; i < numCards; i++) {
      const y = 1 - (i / (numCards - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;

      // --- FIX: Pure spherical coordinates centered at (0,0,0) ---
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      const geometry = new THREE.PlaneGeometry(6, 4.5);
      const material = new THREE.MeshBasicMaterial({
        map: textures[i % textures.length], side: THREE.DoubleSide, transparent: true, opacity: 0.15
      });

      const card = new THREE.Mesh(geometry, material);
      card.position.set(x * globeRadius, y * globeRadius, z * globeRadius);

      // --- FIX: Cards look precisely at the exact center point ---
      card.lookAt(0, 0, 0);
      globeGroup.add(card);
      cards.push(card);

      const dist = card.position.distanceTo(topAreaView);
      if (dist < minDistanceToTarget) {
        minDistanceToTarget = dist;
        targetCard = card;
      }
    }

    // 4. Glowing Circular Particles Function
    function createCircleTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(231, 194, 106, 1)');
      gradient.addColorStop(1, 'rgba(231, 194, 106, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(32, 32, 32, 0, Math.PI * 2);
      ctx.fill();
      return new THREE.CanvasTexture(canvas);
    }

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 600;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.5, map: createCircleTexture(), transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false
    });
    const sparklesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(sparklesMesh);

    // 5. Infinite Scroll Logic
    function handleScroll(delta) {
      if (!controls.enabled) return;
      globeGroup.rotation.y += delta * 0.002;
      sparklesMesh.rotation.y += delta * 0.001;
      sparklesMesh.rotation.x += delta * 0.0005;
    }

    const onWheel = (e) => { e.preventDefault(); handleScroll(e.deltaY); };
    let touchStartY = 0;
    const onTouchStart = (e) => { touchStartY = e.touches[0].clientY; };
    const onTouchMove = (e) => {
      e.preventDefault();
      const touchY = e.touches[0].clientY;
      handleScroll((touchStartY - touchY) * 2);
      touchStartY = touchY;
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('resize', onResize);

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // 6. Elegant Canvas Text Texture
    function createTextTexture(text, authorText) {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 768;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const padding = 60;
      const radius = 50;

      ctx.shadowColor = 'rgba(231, 194, 106, 0.4)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 10;

      ctx.fillStyle = 'rgba(20, 20, 20, 0.85)';
      ctx.beginPath();
      ctx.moveTo(padding + radius, padding);
      ctx.arcTo(canvas.width - padding, padding, canvas.width - padding, canvas.height - padding, radius);
      ctx.arcTo(canvas.width - padding, canvas.height - padding, padding, canvas.height - padding, radius);
      ctx.arcTo(padding, canvas.height - padding, padding, padding, radius);
      ctx.arcTo(padding, padding, canvas.width - padding, padding, radius);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      ctx.lineWidth = 4;
      ctx.strokeStyle = '#E7C26A';
      ctx.stroke();

      ctx.fillStyle = '#E7C26A';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      const fontSize = isMobile ? 75 : 90;
      const interFontFamily = getComputedStyle(document.documentElement).getPropertyValue('--font-inter') || 'sans-serif';
      ctx.font = `500 ${fontSize}px ${interFontFamily}`;
      const lineHeight = fontSize * 1.4;

      const words = (text || "").split(' ');
      let line = '';
      let lineCount = 0;
      const maxLines = 4;
      let currentY = padding + 50;
      const maxWidth = canvas.width - (padding * 2) - 60;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
          if (lineCount >= maxLines - 1) {
            ctx.fillText(line + "...", padding + 40, currentY);
            lineCount++;
            break;
          } else {
            ctx.fillText(line, padding + 40, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
            lineCount++;
          }
        } else {
          line = testLine;
        }
      }
      if (lineCount < maxLines) {
        ctx.fillText(line, padding + 40, currentY);
      }

      if (authorText && authorText.trim() !== "") {
        const interFontFamily = getComputedStyle(document.documentElement).getPropertyValue('--font-inter') || 'sans-serif';
        ctx.font = `italic 400 ${fontSize * 0.65}px ${interFontFamily}`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`- ${authorText} ❤️`, canvas.width - padding - 40, canvas.height - padding - 40);
      }

      return new THREE.CanvasTexture(canvas);
    }

    // 7. Animation Variables
    let specialCard = null;
    let particle = null;
    let pathCurve = null;
    let animPhase = 0;
    let animationProgress = 0;
    let reqId;

    // --- FIX: Animation coordinate offsets to match true center ---
    const startPt = new THREE.Vector3(0, -15 + coreYOffset, -10);
    const centerPt = new THREE.Vector3(0, coreYOffset, -20);

    // 8. Auto-start Animation Logic equivalent to the UI Submission Logic
    targetCard.visible = false;

    const particleGeo = new THREE.PlaneGeometry(2, 2);
    const particleMat = new THREE.MeshBasicMaterial({
      map: createCircleTexture(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
    });
    particle = new THREE.Mesh(particleGeo, particleMat);
    particle.position.copy(startPt);
    scene.add(particle);

    const textTexture = createTextTexture(message, author);
    const specialCardGeometry = new THREE.PlaneGeometry(6, 4.5);
    const specialCardMat = new THREE.MeshBasicMaterial({ map: textTexture, transparent: true });
    specialCard = new THREE.Mesh(specialCardGeometry, specialCardMat);
    specialCard.visible = false;
    scene.add(specialCard);

    const targetWorldPos = new THREE.Vector3();
    targetCard.getWorldPosition(targetWorldPos);

    // Curve swoops up and to the right, toward the turban
    const controlPt = new THREE.Vector3(15, 10 + coreYOffset, -25);
    pathCurve = new THREE.QuadraticBezierCurve3(centerPt, controlPt, targetWorldPos);

    // 9. Render Loop
    function animate() {
      reqId = requestAnimationFrame(animate);
      sparklesMesh.rotation.y += 0.0005;
      sparklesMesh.rotation.x += 0.0002;

      // Auto-rotate the globe slowly for cinematic effect
      globeGroup.rotation.y += 0.001;

      // Ensure we only start phase 1 (the animation) once the core image is actually loaded and visible
      if (isCoreLoaded && !hasStartedAnimation) {
        hasStartedAnimation = true;
        animPhase = 1;
      }

      if (animPhase === 1) {
        animationProgress += 0.02; // Exactly matches globe.html
        let p = Math.min(1, animationProgress);
        const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

        particle.position.lerpVectors(startPt, centerPt, ease);
        particle.lookAt(camera.position);

        if (p >= 1) {
          animPhase = 2;
          animationProgress = 0;
          scene.remove(particle);
          specialCard.visible = true;
        }
      } else if (animPhase === 2) {
        animationProgress += 0.015; // Exactly matches globe.html
        let p = Math.min(1, animationProgress);

        auraMesh.scale.set(1 + (p * 2), 1 + (p * 2), 1);
        if (p < 0.3) {
          auraMesh.material.opacity = p / 0.3;
        } else {
          auraMesh.material.opacity = 1 - ((p - 0.3) / 0.7);
        }

        const easeOutQuart = 1 - Math.pow(1 - p, 4);
        const currentScale = 0.1 + (0.9 * easeOutQuart);
        specialCard.scale.set(currentScale, currentScale, currentScale);

        const currentPos = pathCurve.getPoint(easeOutQuart);
        specialCard.position.copy(currentPos);

        // --- FIX: Card faces true center during travel ---
        specialCard.lookAt(0, 0, 0);

        if (p >= 1) {
          animPhase = 0;
          auraMesh.material.opacity = 0;

          scene.remove(specialCard);
          globeGroup.add(specialCard);

          specialCard.position.copy(targetCard.position);
          specialCard.rotation.copy(targetCard.rotation);
          specialCard.scale.set(1, 1, 1);

          controls.enabled = true;

          globeGroup.traverse((child) => {
            if (child.isMesh) {
              if (child.material) child.material.opacity = 1;
            }
          });
        }
      }

      controls.update();
      renderer.render(scene, camera);
    }

    shareRef.current = async () => {
      return new Promise((resolve) => {
        renderer.render(scene, camera);
        const webglCanvas = renderer.domElement;

        const canvas = document.createElement('canvas');
        const width = webglCanvas.width;
        const height = webglCanvas.height;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(webglCanvas, 0, 0);

        const gradHeight = height * 0.45;
        const gradTop = height - gradHeight;
        const gradient = ctx.createLinearGradient(0, gradTop, 0, height);
        gradient.addColorStop(0, 'rgba(13,6,3,0)');
        gradient.addColorStop(0.4, 'rgba(13,6,3,0.85)');
        gradient.addColorStop(1, 'rgba(13,6,3,1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, gradTop, width, gradHeight);

        const isMobile = window.innerWidth < 768;
        const cormorant = '"Cormorant Garamond", serif';
        ctx.textAlign = 'center';

        const pixelRatio = window.devicePixelRatio || 1;
        const vhPixel = window.innerHeight * pixelRatio;

        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 8 * pixelRatio;
        ctx.shadowOffsetY = 2 * pixelRatio;
        ctx.fillStyle = '#e7c879';
        const topFontSize = (isMobile ? 16 : 18) * pixelRatio;
        ctx.font = `500 ${topFontSize}px ${cormorant}`;
        if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '0.3em';
        const topPos = 64 * pixelRatio;
        ctx.fillText('WALL OF BELIEF', width / 2, topPos);

        let h2FontSize = Math.max(24, Math.min(window.innerWidth * 0.06, 36)) * pixelRatio;
        ctx.font = `500 ${h2FontSize}px ${cormorant}`;
        if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '0.2em';
        const buttonsHeight = 40 * pixelRatio;
        const pFontSize = 16 * pixelRatio;
        const pBaseY = height - (vhPixel * 0.12) - buttonsHeight - (24 * pixelRatio);
        const h2BaseY = pBaseY - pFontSize - (16 * pixelRatio);

        ctx.fillText('TOGETHER WE RISE.', width / 2, h2BaseY);

        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = `400 ${pFontSize}px ${cormorant}`;
        if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '0.1em';
        ctx.shadowBlur = 4 * pixelRatio;
        ctx.fillText('I ROOT FOR SATYADEV ❤️', width / 2, pBaseY);

        // --- DRAW THE USER'S CARD AS A 2D OVERLAY ---
        const cardTexture = createTextTexture(message, author);
        if (cardTexture && cardTexture.image) {
          const cardCanvas = cardTexture.image;
          const cardAspect = cardCanvas.width / cardCanvas.height;

          // Make the card very small
          const cardWidth = Math.min(width * (isMobile ? 0.35 : 0.18), 180 * pixelRatio);
          const cardHeight = cardWidth / cardAspect;

          // Position below the text
          const cardX = (width - cardWidth) / 2;
          const cardY = pBaseY + (isMobile ? 24 : 32) * pixelRatio;

          ctx.drawImage(cardCanvas, cardX, cardY, cardWidth, cardHeight);
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

        try {
          fetch(dataUrl).then(response => response.blob()).then(blob => {
            const file = new File([blob], 'wall_of_belief.jpg', { type: 'image/jpeg' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              navigator.share({
                title: 'Satyadev - Wall of Belief',
                text: 'I rooted for Satyadev... You can also root for Satyadev here: irootforsatyadev.com',
                files: [file]
              }).finally(() => resolve());
            } else {
              const a = document.createElement('a');
              a.href = dataUrl;
              a.download = 'wall_of_belief.jpg';
              a.click();
              resolve();
            }
          });
        } catch (e) {
          console.error("Error sharing:", e);
          resolve();
        }
      });
    };

    animate();

    // Asynchronously fetch real database messages in the background AFTER 3 seconds (so swoop animation isn't stuttered)
    const bgFetchTimeout = setTimeout(() => {
      fetch('/api/feedback')
        .then(r => r.json())
        .then(data => {
          const fetched = (data.messages || []).map(m => m.message);
          if (fetched.length === 0) return;

          const newMessages = [message, ...fetched.slice(0, 25), ...DUMMY_MESSAGES].filter(Boolean);
          const newTextures = newMessages.map(msg => createTextTexture(msg, author || "Believer"));

          cards.forEach((card, i) => {
            card.material.map = newTextures[i % newTextures.length];
            card.material.needsUpdate = true;
          });
        })
        .catch(console.error);
    }, 3000);

    // Cleanup on unmount
    return () => {
      clearTimeout(forceStartTimeout);
      clearTimeout(bgFetchTimeout);
      cancelAnimationFrame(reqId);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', onResize);

      if (currentMount && renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }

      scene.clear();
      renderer.dispose();
    };
  }, [message, author]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      zIndex: 9999, backgroundColor: '#0d0603', cursor: 'grab',
      overscrollBehavior: 'none', touchAction: 'none'
    }}>
      <div ref={mountRef} />

      {/* Bottom Screen Gradient to hide the crop edge seamlessly */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '45vh',
        background: 'linear-gradient(to bottom, rgba(13,6,3,0) 0%, rgba(13,6,3,0.85) 40%, rgba(13,6,3,1) 100%)',
        pointerEvents: 'none',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: '12vh'
      }}>
        <h2 style={{
          color: '#e7c879',
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 'clamp(1.5rem, 6vw, 2.25rem)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          margin: '0 0 12px 0',
          textShadow: '0 2px 8px rgba(0,0,0,0.8)'
        }}>
          Together We Rise.
        </h2>
        <p style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: '1rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          margin: '0 0 24px 0',
          textShadow: '0 2px 4px rgba(0,0,0,0.8)'
        }}>
          I root for Satyadev ❤️
        </p>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="group relative overflow-hidden px-8 py-2 text-sm md:text-base tracking-[0.15em] uppercase font-semibold transition-all duration-500 ease-out whitespace-nowrap pointer-events-auto disabled:opacity-50"
            style={{
              fontFamily: 'var(--font-inter), sans-serif',
              border: '1px solid rgba(201,162,76,0.6)',
              background: 'rgba(7,22,27,0.4)',
              backdropFilter: 'blur(8px)',
              color: '#e7c879',
              borderRadius: '9999px',
              boxShadow: '0 0 20px rgba(201,162,76,0.15), inset 0 0 0 1px rgba(201,162,76,0.1)',
              cursor: isSharing ? 'wait' : 'pointer'
            }}
            onMouseEnter={e => {
              if (isSharing) return;
              e.currentTarget.style.background = 'rgba(201,162,76,0.22)';
              e.currentTarget.style.border = '1px solid rgba(201,162,76,0.95)';
              e.currentTarget.style.boxShadow = '0 0 35px rgba(201,162,76,0.45), inset 0 0 0 1px rgba(201,162,76,0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              if (isSharing) return;
              e.currentTarget.style.background = 'rgba(7,22,27,0.4)';
              e.currentTarget.style.border = '1px solid rgba(201,162,76,0.6)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(201,162,76,0.15), inset 0 0 0 1px rgba(201,162,76,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="material-symbols-rounded text-[18px] normal-case tracking-normal" style={{ textTransform: 'none' }}>share</span>
              {isSharing ? 'Sharing...' : 'Share'}
            </span>
          </button>

          <button
            onClick={onNext}
            className="group relative overflow-hidden px-8 py-2 text-sm md:text-base tracking-[0.15em] uppercase font-semibold transition-all duration-500 ease-out whitespace-nowrap pointer-events-auto"
            style={{
              fontFamily: 'var(--font-inter), sans-serif',
              border: '1px solid rgba(201,162,76,0.6)',
              background: 'rgba(7,22,27,0.4)',
              backdropFilter: 'blur(8px)',
              color: '#e7c879',
              borderRadius: '9999px',
              boxShadow: '0 0 20px rgba(201,162,76,0.15), inset 0 0 0 1px rgba(201,162,76,0.1)',
              cursor: 'pointer'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(201,162,76,0.22)';
              e.currentTarget.style.border = '1px solid rgba(201,162,76,0.95)';
              e.currentTarget.style.boxShadow = '0 0 35px rgba(201,162,76,0.45), inset 0 0 0 1px rgba(201,162,76,0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(7,22,27,0.4)';
              e.currentTarget.style.border = '1px solid rgba(201,162,76,0.6)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(201,162,76,0.15), inset 0 0 0 1px rgba(201,162,76,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Next
              <span className="material-symbols-rounded text-[18px] normal-case tracking-normal" style={{ textTransform: 'none' }}>chevron_right</span>
            </span>
          </button>
        </div>
      </div>

      {/* Top Header: Wall of Belief */}
      <div className="absolute top-[calc(env(safe-area-inset-top,1rem)+2rem)] md:top-12 left-0 w-full flex justify-center pointer-events-none z-[9998]">
        <h1 style={{
          color: '#e7c879',
          fontFamily: '"Cormorant Garamond", serif',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          textShadow: '0 2px 8px rgba(0,0,0,0.8)'
        }} className="text-base md:text-lg m-0">
          Wall of Belief
        </h1>
      </div>

      {/* Floating Back Button matching the rest of the site */}
      <button
        onClick={onBack}
        className="absolute top-[calc(env(safe-area-inset-top,1rem)+1.5rem)] left-6 md:top-10 md:left-12 z-[9999] flex items-center justify-center w-10 h-10 bg-zinc-900/60 backdrop-blur-md border border-zinc-700/50 text-zinc-300 rounded-full hover:bg-zinc-800 hover:text-amber-500 transition-all duration-700 hover:scale-105 group"
        style={{ cursor: 'pointer' }}
      >
        <span className="material-symbols-rounded transition-transform duration-300 group-hover:-translate-x-0.5">chevron_backward</span>
      </button>
    </div>
  );
}
