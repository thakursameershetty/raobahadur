'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScrollControls, useScroll, useTexture, Text, Image as DreiImage, Environment, Float, Sparkles, MeshReflectorMaterial, Scroll } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { milestones } from '../data/milestones';

// Custom Shader Material for the cloth bending/rippling poster images
const createClothMaterial = () => {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      map: { value: null },
      resolution: { value: new THREE.Vector2(512, 512) },
      opacity: { value: 1.0 },
      blurAmount: { value: 0.0 },
      scrollForce: { value: 0.0 },
      time: { value: 0.0 },
      isHovered: { value: 0.0 },
    },
    vertexShader: `
      uniform float scrollForce;
      uniform float time;
      uniform float isHovered;
      varying vec2 vUv;
      varying vec3 vNormal;
      
      void main() {
        vUv = uv;
        vNormal = normal;
        
        vec3 pos = position;
        
        // Create smooth curving based on scroll force
        float curveIntensity = scrollForce * 0.3;
        
        // Base curve across the plane based on distance from center
        float distanceFromCenter = length(pos.xy);
        float curve = distanceFromCenter * distanceFromCenter * curveIntensity;
        
        // Add gentle cloth-like ripples
        float ripple1 = sin(pos.x * 2.0 + scrollForce * 3.0) * 0.02;
        float ripple2 = sin(pos.y * 2.5 + scrollForce * 2.0) * 0.015;
        float clothEffect = (ripple1 + ripple2) * abs(curveIntensity) * 2.0;
        
        // Flag waving effect (active by default, amplified on hover)
        float waveSpeed = isHovered > 0.5 ? 8.0 : 4.0;
        float waveAmp = isHovered > 0.5 ? 0.12 : 0.06;
        
        float wavePhase = pos.x * 3.0 + time * waveSpeed;
        float waveAmplitude = sin(wavePhase) * waveAmp;
        float dampening = smoothstep(-0.5, 0.5, pos.x);
        float flagWave = waveAmplitude * dampening;
        
        float secondaryWave = sin(pos.x * 5.0 + time * (waveSpeed * 1.5)) * (waveAmp * 0.35) * dampening;
        flagWave += secondaryWave;
        
        // Apply Z displacement for curving effect (inverted) with cloth ripples and flag wave
        pos.z -= (curve + clothEffect + flagWave);
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform vec2 resolution;
      uniform float opacity;
      uniform float blurAmount;
      uniform float scrollForce;
      varying vec2 vUv;
      varying vec3 vNormal;
      
      void main() {
        vec4 color = texture2D(map, vUv);
        
        // Simple blur approximation
        if (blurAmount > 0.0) {
          vec2 texelSize = 1.0 / resolution;
          vec4 blurred = vec4(0.0);
          float total = 0.0;
          
          for (float x = -2.0; x <= 2.0; x += 1.0) {
            for (float y = -2.0; y <= 2.0; y += 1.0) {
              vec2 offset = vec2(x, y) * texelSize * blurAmount;
              float weight = 1.0 / (1.0 + length(vec2(x, y)));
              blurred += texture2D(map, vUv + offset) * weight;
              total += weight;
            }
          }
          color = blurred / total;
        }
        
        // Add subtle lighting effect based on curving
        float curveHighlight = abs(scrollForce) * 0.05;
        color.rgb += vec3(curveHighlight * 0.1);
        
        gl_FragColor = vec4(color.rgb, color.a * opacity);
      }
    `,
  });
};

// Custom Shader Material for the synchronized border glow
const createBorderMaterial = () => {
  return new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      color: { value: new THREE.Color("#111111") },
      opacity: { value: 0.8 },
      scrollForce: { value: 0.0 },
      time: { value: 0.0 },
      isHovered: { value: 0.0 },
    },
    vertexShader: `
      uniform float scrollForce;
      uniform float time;
      uniform float isHovered;
      varying vec3 vNormal;
      
      void main() {
        vNormal = normal;
        
        vec3 pos = position;
        float curveIntensity = scrollForce * 0.3;
        float distanceFromCenter = length(pos.xy);
        float curve = distanceFromCenter * distanceFromCenter * curveIntensity;
        
        float ripple1 = sin(pos.x * 2.0 + scrollForce * 3.0) * 0.02;
        float ripple2 = sin(pos.y * 2.5 + scrollForce * 2.0) * 0.015;
        float clothEffect = (ripple1 + ripple2) * abs(curveIntensity) * 2.0;
        
        // Flag waving effect (active by default, amplified on hover)
        float waveSpeed = isHovered > 0.5 ? 8.0 : 4.0;
        float waveAmp = isHovered > 0.5 ? 0.12 : 0.06;
        
        float wavePhase = pos.x * 3.0 + time * waveSpeed;
        float waveAmplitude = sin(wavePhase) * waveAmp;
        float dampening = smoothstep(-0.5, 0.5, pos.x);
        float flagWave = waveAmplitude * dampening;
        
        float secondaryWave = sin(pos.x * 5.0 + time * (waveSpeed * 1.5)) * (waveAmp * 0.35) * dampening;
        flagWave += secondaryWave;
        
        pos.z -= (curve + clothEffect + flagWave);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform float opacity;
      void main() {
        gl_FragColor = vec4(color, opacity);
      }
    `,
  });
};

// Module-level ref shared between SatyadevTimeline (prop sync) and CameraRig (useFrame read)
// Using a plain object avoids any R3F fiber/context boundary issues
const lockRef = { current: true };

// Winding camera path to fly PAST the new cards instead of colliding
const PATH_POINTS = [
  new THREE.Vector3(0, 0, 5),       // Start (Perfectly centered)
  new THREE.Vector3(0, 0, 0),       // NEW: Straight runway so the camera looks dead center initially
  new THREE.Vector3(1.2, 0, -13),   // Now it banks right to fly past Jyothi Lakshmi
  new THREE.Vector3(-1.2, 0, -26),  // Opposite Bluff Master
  new THREE.Vector3(1.2, 0, -39),   // Opposite Ragala 24 Gantallo
  new THREE.Vector3(-1.2, 0, -52),  // Opposite 47 Days
  new THREE.Vector3(1.2, 0, -65),   // Opposite Uma Maheswara Ugra Roopasya
  new THREE.Vector3(-1.2, 0, -78),  // Opposite Guvva Gorinka
  new THREE.Vector3(1.2, 0, -91),   // Opposite Thimmarusu: Assignment Vali
  new THREE.Vector3(-1.2, 0, -104), // Opposite Skylab
  new THREE.Vector3(1.2, 0, -117),  // Opposite Godse
  new THREE.Vector3(-1.2, 0, -130), // Opposite Gurthunda Seethakalam
  new THREE.Vector3(1.2, 0, -143),  // Opposite Krishnamma
  new THREE.Vector3(-1.2, 0, -156), // Opposite Zebra
  new THREE.Vector3(1.2, 0, -169),  // Opposite Kingdom
  new THREE.Vector3(0, 0, -181),    // Approaching Rao Bahadur (Climax)
  new THREE.Vector3(0, 0, -183),    // Looking at Rao Bahadur (Climax)
];

const getMilestoneOffset = (index, total) => {
  if (index === total - 1) return 1.0;
  return (index + 1) / (total + 1);
};

function CameraRig({ onScrollToTop }) {
  const scroll = useScroll();
  const curve = useMemo(() => new THREE.CatmullRomCurve3(PATH_POINTS), []);
  const easedOffsetRef = useRef(0);
  const { size } = useThree();
  const isMobile = size.width < 768;

  // Smooth scroll listener for clicking sidebar navigation items
  useEffect(() => {
    const handleScrollRequest = (e) => {
      const index = e.detail;
      const targetOffset = getMilestoneOffset(index, milestones.length);
      const scrollElement = scroll.el;
      if (scrollElement) {
        scrollElement.scrollTo({
          top: targetOffset * (scrollElement.scrollHeight - scrollElement.clientHeight),
          behavior: 'smooth'
        });
      }
    };

    window.addEventListener('scroll-to-milestone', handleScrollRequest);
    return () => {
      window.removeEventListener('scroll-to-milestone', handleScrollRequest);
    };
  }, [scroll]);

  // Listener to detect scrolling up when at the top of the timeline
  useEffect(() => {
    if (!onScrollToTop || !scroll.el) return;

    const handleWheel = (e) => {
      // If we are at the top and scrolling up
      if (scroll.el.scrollTop <= 0 && e.deltaY < -5) {
        onScrollToTop();
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e) => {
      if (scroll.el.scrollTop <= 0 && e.changedTouches[0].clientY - touchStartY > 30) {
        onScrollToTop();
      }
    };

    scroll.el.addEventListener('wheel', handleWheel, { passive: true });
    scroll.el.addEventListener('touchstart', handleTouchStart, { passive: true });
    scroll.el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      scroll.el.removeEventListener('wheel', handleWheel);
      scroll.el.removeEventListener('touchstart', handleTouchStart);
      scroll.el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scroll.el, onScrollToTop]);

  useFrame((state) => {
    // ── LOCKED STATE: hold camera at the start, skip all scroll-driven logic ──
    if (lockRef.current) {
      state.camera.position.lerp(new THREE.Vector3(0, 0, 5), 0.1);
      state.camera.fov = 60;
      state.camera.updateProjectionMatrix();
      
      // Smoothly reset the eased offset and parallax progress back to 0 when returning to Hero
      if (easedOffsetRef.current > 0.0001) {
        easedOffsetRef.current = THREE.MathUtils.lerp(easedOffsetRef.current, 0, 0.15);
        const progressFill = document.getElementById('timeline-progress-fill');
        if (progressFill) progressFill.style.width = `${easedOffsetRef.current * 100}%`;
        
        const heroSection = document.getElementById('hero-section');
        if (heroSection) {
          const heroProgress = Math.min(easedOffsetRef.current / 0.042, 1);
          heroSection.style.setProperty('--scroll-progress', heroProgress);
        }
      }
      return;
    }

    // Dynamic FOV adjustment to prevent horizontal clipping on portrait viewports
    const aspect = state.size.width / state.size.height;
    if (aspect < 1.0) {
      state.camera.fov = Math.min(85, 60 + (1.0 - aspect) * 40);
    } else {
      state.camera.fov = 60;
    }
    state.camera.updateProjectionMatrix();

    // Self-recovery block: Reset camera if coordinates or quaternion become NaN
    if (isNaN(state.camera.position.x) || isNaN(state.camera.position.y) || isNaN(state.camera.position.z)) {
      state.camera.position.set(0, 0, 5);
    }
    if (isNaN(state.camera.quaternion.x) || isNaN(state.camera.quaternion.y) || isNaN(state.camera.quaternion.z) || isNaN(state.camera.quaternion.w)) {
      state.camera.quaternion.set(0, 0, 0, 1);
    }

    // scroll.offset goes from 0 (top) to 1 (bottom)
    const scrollOffset = scroll.offset;

    // Safety check for NaN scroll offset (e.g. during mount/layout calculation)
    if (typeof scrollOffset !== 'number' || isNaN(scrollOffset)) {
      return;
    }

    // Self-recovery check for easedOffset
    if (isNaN(easedOffsetRef.current) || easedOffsetRef.current === undefined) {
      easedOffsetRef.current = 0;
    }

    // Smoothly ease the scroll offset value itself, clamped to [0,1] for curve.getPoint()
    easedOffsetRef.current = Math.max(0, Math.min(1, THREE.MathUtils.lerp(easedOffsetRef.current, scrollOffset, 0.15)));

    // Get the point on the curve based on the smoothed scroll position
    const pointOnCurve = curve.getPoint(easedOffsetRef.current);
    if (!pointOnCurve || isNaN(pointOnCurve.x) || isNaN(pointOnCurve.y) || isNaN(pointOnCurve.z)) {
      return;
    }

    // On mobile, keep the camera centered in the 3D space and shifted slightly back
    if (isMobile) {
      pointOnCurve.x = 0;
      pointOnCurve.z += 1.6;
    }

    // Set the camera position directly to the eased point (already smoothed)
    state.camera.position.copy(pointOnCurve);

    // Make the camera look slightly ahead along the curve path relative to eased position
    const lookAtPoint = curve.getPoint(Math.min(easedOffsetRef.current + 0.04, 1));
    if (!lookAtPoint || isNaN(lookAtPoint.x) || isNaN(lookAtPoint.y) || isNaN(lookAtPoint.z)) {
      return;
    }

    if (isMobile) {
      lookAtPoint.x = 0;
      lookAtPoint.z += 1.6;
    }

    // Calculate new target rotation matrix if eye and target are not identical
    const distance = state.camera.position.distanceTo(lookAtPoint);
    if (distance > 0.005) {
      const targetRotationMatrix = new THREE.Matrix4();
      targetRotationMatrix.lookAt(state.camera.position, lookAtPoint, state.camera.up);

      const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(targetRotationMatrix);
      if (!isNaN(targetQuaternion.x) && !isNaN(targetQuaternion.y) && !isNaN(targetQuaternion.z) && !isNaN(targetQuaternion.w)) {
        // Smoothly rotate camera to look at the target path
        state.camera.quaternion.slerp(targetQuaternion, 0.08);
      }
    }

    // High performance direct DOM updates based on eased offset to stay in sync with camera movement
    const progressFill = document.getElementById('timeline-progress-fill');
    if (progressFill) {
      progressFill.style.width = `${easedOffsetRef.current * 100}%`;
    }

    const heroSection = document.getElementById('hero-section');
    if (heroSection && scroll.el) {
      // Keep scroll progress for parallax layers inside HeroSection
      const heroProgress = Math.min(easedOffsetRef.current / 0.042, 1);
      heroSection.style.setProperty('--scroll-progress', heroProgress);
      // Note: opacity & transform are owned by page.js (CSS transition) — do not override here
    }

    const timelineContainer = document.getElementById('timeline-container');
    if (timelineContainer) {
      if (easedOffsetRef.current > 0.02) {
        timelineContainer.style.opacity = '1';
        timelineContainer.style.pointerEvents = 'auto';
      } else {
        timelineContainer.style.opacity = '0';
        timelineContainer.style.pointerEvents = 'none';
      }
    }

    // Find the milestone index whose target offset is closest to easedOffsetRef.current
    let activeIndex = 0;
    let minDistance = Infinity;
    milestones.forEach((_, index) => {
      const milestoneT = getMilestoneOffset(index, milestones.length);
      const dist = Math.abs(easedOffsetRef.current - milestoneT);
      if (dist < minDistance) {
        minDistance = dist;
        activeIndex = index;
      }
    });

    milestones.forEach((_, index) => {
      // Bottom progress year labels sync
      const yearLabel = document.getElementById(`progress-year-${index}`);
      if (yearLabel) {
        if (index === activeIndex) {
          yearLabel.style.color = '#f59e0b';
          yearLabel.style.opacity = '1';
          yearLabel.style.transform = 'translate(-50%, -20px) scale(1.15)';
        } else {
          yearLabel.style.color = '#71717a';
          yearLabel.style.opacity = '0.6';
          yearLabel.style.transform = 'translate(-50%, -20px) scale(1)';
        }
      }

      // Bottom progress ticks sync
      const tick = document.getElementById(`progress-tick-${index}`);
      if (tick) {
        if (index === activeIndex) {
          tick.style.backgroundColor = '#f59e0b';
          tick.style.transform = 'translate(-50%, -50%) scale(1.4)';
        } else if (index < activeIndex) {
          tick.style.backgroundColor = '#ea580c';
          tick.style.transform = 'translate(-50%, -50%) scale(1)';
        } else {
          tick.style.backgroundColor = '#3f3f46';
          tick.style.transform = 'translate(-50%, -50%) scale(1)';
        }
      }
    });
  });

  return null;
}

function Milestone({ year, title, desc, position: rawPosition, rotation, image, isClimax }) {
  const scroll = useScroll();
  const easedOffsetRef = useRef(0);
  const prevOffsetRef = useRef(0);

  const { size } = useThree();
  const isMobile = size.width < 768;

  // Dynamically shift normal milestones closer to the runway center on mobile
  const position = useMemo(() => {
    if (!isMobile || isClimax) return rawPosition;
    const adjusted = [...rawPosition];
    adjusted[0] = rawPosition[0] > 0 ? 1.4 : -1.4;
    return adjusted;
  }, [rawPosition, isMobile, isClimax]);

  // Load the texture using useTexture hook
  const texture = useTexture(image);

  // Create the cloth shader material memoized per milestone
  const material = useMemo(() => {
    const mat = createClothMaterial();
    mat.uniforms.map.value = texture;
    return mat;
  }, [texture]);

  // Create the border shader material memoized per milestone
  const borderMaterial = useMemo(() => {
    const mat = createBorderMaterial();
    mat.uniforms.color.value = new THREE.Color(isClimax ? "#8b0000" : "#111111");
    return mat;
  }, [isClimax]);

  // Synchronize color updates
  useEffect(() => {
    material.uniforms.isHovered.value = 0.0;
    borderMaterial.uniforms.isHovered.value = 0.0;

    borderMaterial.uniforms.color.value.set(
      isClimax ? "#8b0000" : "#111111"
    );
  }, [isClimax, material, borderMaterial]);

  // Update texture resolution once loaded
  useEffect(() => {
    if (texture && texture.image) {
      material.uniforms.resolution.value.set(texture.image.width, texture.image.height);
    }
  }, [texture, material]);

  useFrame((state, delta) => {
    const scrollOffset = scroll.offset;
    if (isNaN(scrollOffset)) return;

    if (isNaN(easedOffsetRef.current)) {
      easedOffsetRef.current = 0;
    }
    // Smoothly ease, clamped to [0,1]
    easedOffsetRef.current = Math.max(0, Math.min(1, THREE.MathUtils.lerp(easedOffsetRef.current, scrollOffset, 0.15)));

    // Calculate scroll velocity
    const dt = Math.max(delta, 0.001);
    const velocity = (easedOffsetRef.current - prevOffsetRef.current) / dt;
    prevOffsetRef.current = easedOffsetRef.current;

    // Update uniforms
    const time = state.clock.getElapsedTime();
    material.uniforms.time.value = time;
    borderMaterial.uniforms.time.value = time;

    const targetForce = velocity * 0.12; // Adjusted scale factor for optimal cloth curvature
    material.uniforms.scrollForce.value = THREE.MathUtils.lerp(
      material.uniforms.scrollForce.value,
      targetForce,
      0.1
    );
    borderMaterial.uniforms.scrollForce.value = THREE.MathUtils.lerp(
      borderMaterial.uniforms.scrollForce.value,
      targetForce,
      0.1
    );
  });

  // Responsive Layout Scaling Logic
  const isLeftSide = position[0] < 0;

  let textXOffset, textYOffset, textZOffset, textAnchor, textAlign;
  let backdropXOffset, backdropYOffset, backdropWidth, backdropHeight;
  let borderScale, posterScale;

  if (isMobile) {
    posterScale = [2.4, 3.3, 1];
    borderScale = [2.48, 3.38, 1];

    if (isClimax) {
      // Center the text below the poster for climax on mobile
      textXOffset = 0;
      textYOffset = -2.4;
      textZOffset = 0.05;
      textAnchor = 'center';
      textAlign = 'center';

      backdropXOffset = 0;
      backdropYOffset = -0.4;
      backdropWidth = 2.8;
      backdropHeight = 1.6;
    } else {
      // Normal milestone on mobile
      textXOffset = isLeftSide ? 1.55 : -1.55;
      textYOffset = 0;
      textZOffset = 0.05;
      textAnchor = isLeftSide ? 'left' : 'right';
      textAlign = isLeftSide ? 'left' : 'right';

      backdropXOffset = isLeftSide ? 1.3 : -1.3;
      backdropYOffset = 0.2;
      backdropWidth = 2.5;
      backdropHeight = 2.5;
    }
  } else {
    // Desktop layout (existing code)
    posterScale = [4, 5.5, 1];
    borderScale = [4.1, 5.6, 1];

    textXOffset = isLeftSide ? 2.6 : -2.6;
    textYOffset = 0;
    textZOffset = 0.05;
    textAnchor = isLeftSide ? 'left' : 'right';
    textAlign = isLeftSide ? 'left' : 'right';

    backdropXOffset = isLeftSide ? 1.6 : -1.6;
    backdropYOffset = 0.4;
    backdropWidth = 3.8;
    backdropHeight = 4.0;
  }

  return (
    <group
      position={position}
      rotation={rotation}
    >
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        {/* Poster Image using cloth shader material */}
        <mesh
          scale={posterScale}
          material={material}
        >
          <planeGeometry args={[1, 1, 32, 32]} />
        </mesh>

        {/* 3D Border Glow using synchronized bending material */}
        <mesh
          position={[0, 0, -0.01]}
          scale={borderScale}
          material={borderMaterial}
        >
          <planeGeometry args={[1, 1, 32, 32]} />
        </mesh>

        {/* Climax Spotlight Accent */}
        {isClimax && (
          <>
            <pointLight position={[0, 0, 3]} intensity={12} color="#ff0000" distance={15} decay={1.5} />
            <spotLight
              position={[0, 5, 5]}
              angle={0.6}
              penumbra={1}
              intensity={8}
              color="#ff3333"
              castShadow
            />
          </>
        )}

        {/* 3D Text Labels — beside the poster in 3D space */}
        <group position={[textXOffset, textYOffset, textZOffset]}>
          {/* Dark glass backdrop panel — sits behind all text */}
          <mesh position={[backdropXOffset, backdropYOffset, -0.08]}>
            <planeGeometry args={[backdropWidth, backdropHeight]} />
            <meshBasicMaterial color="#050505" transparent opacity={0.72} />
          </mesh>
          {/* Soft edge glow panel slightly behind for depth */}
          <mesh position={[backdropXOffset, backdropYOffset, -0.12]}>
            <planeGeometry args={[backdropWidth + 0.4, backdropHeight + 0.4]} />
            <meshBasicMaterial color="#0a0a0a" transparent opacity={0.4} />
          </mesh>

          {/* Thin decorative rule line */}
          {!isClimax && (
            <mesh position={[isLeftSide ? -0.05 : 0.05, 0, 0]}>
              <planeGeometry args={[isMobile ? 0.015 : 0.02, isMobile ? 2.0 : 3.2]} />
              <meshBasicMaterial color={isClimax ? '#ef4444' : '#f59e0b'} transparent opacity={0.9} />
            </mesh>
          )}

          {/* Year badge */}
          <Text
            position={[
              isClimax && isMobile ? 0 : (isLeftSide ? 0.18 : -0.18),
              isClimax && isMobile ? 0.4 : 1.1,
              0
            ]}
            fontSize={isMobile ? 0.2 : 0.3}
            color={isClimax ? '#ef4444' : '#f59e0b'}
            font="/fonts/Inter-Bold.ttf"
            anchorX={isClimax && isMobile ? 'center' : textAnchor}
            anchorY="middle"
            letterSpacing={0.1}
          >
            {year}
          </Text>

          {/* Title */}
          <Text
            position={[
              isClimax && isMobile ? 0 : (isLeftSide ? 0.18 : -0.18),
              isClimax && isMobile ? 0.0 : 0.52,
              0
            ]}
            fontSize={isMobile ? 0.2 : 0.3}
            color="#ffffff"
            font="/fonts/Inter-Bold.ttf"
            anchorX={isClimax && isMobile ? 'center' : textAnchor}
            anchorY="middle"
            maxWidth={isMobile ? (isClimax ? 2.6 : 2.2) : 3.2}
            textAlign={isClimax && isMobile ? 'center' : textAlign}
            letterSpacing={0.02}
          >
            {title.toUpperCase()}
          </Text>

          {/* Description */}
          <Text
            position={[
              isClimax && isMobile ? 0 : (isLeftSide ? 0.18 : -0.18),
              isClimax && isMobile ? -0.3 : -0.3,
              0
            ]}
            fontSize={isMobile ? 0.11 : 0.15}
            color="#d4d4d8"
            font="/fonts/Inter-Regular.ttf"
            anchorX={isClimax && isMobile ? 'center' : textAnchor}
            anchorY="top"
            maxWidth={isMobile ? (isClimax ? 2.6 : 2.2) : 3.2}
            textAlign={isClimax && isMobile ? 'center' : textAlign}
            lineHeight={isMobile ? 1.4 : 1.6}
          >
            {desc}
          </Text>
        </group>
      </Float>
    </group>
  );
}

// Helper component inside Canvas to handle WebGL context loss
function ContextHelper({ onContextLost }) {
  const { gl } = useThree();

  useEffect(() => {
    const canvasEl = gl.domElement;
    if (!canvasEl) return;

    const handleContextLost = (e) => {
      e.preventDefault();
      console.warn("WebGL Context Lost detected! Re-mounting canvas...");
      onContextLost();
    };

    canvasEl.addEventListener('webglcontextlost', handleContextLost);
    return () => {
      canvasEl.removeEventListener('webglcontextlost', handleContextLost);
    };
  }, [gl, onContextLost]);

  return null;
}

export default function SatyadevTimeline({ locked = false, onScrollToTop }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  // Sync the locked prop into the module-level ref so CameraRig can read it
  // This runs synchronously before the next useFrame, keeping them in sync
  lockRef.current = locked;

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleContextLost = () => {
    setCanvasKey((prev) => prev + 1);
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-[100dvh] bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-t-amber-500 border-zinc-800 rounded-full animate-spin"></div>
          <p className="text-zinc-500 text-sm font-mono tracking-widest uppercase">Initializing 3D Canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[100dvh] bg-black relative" style={{ cursor: 'none' }}>
      <Canvas
        key={canvasKey}
        camera={{ position: [0, 0, 5], fov: 60 }}
        shadows={{ type: THREE.PCFShadowMap }}
        gl={{ antialias: true, alpha: false, stencil: false }}
        style={{ cursor: 'none' }}
      >
        <ContextHelper onContextLost={handleContextLost} />
        <Suspense fallback={null}>
          <color attach="background" args={['#020202']} />

          {/* Cinematic Fog for atmospheric depth */}
          <fog attach="fog" args={['#020202', 15, 60]} />

          {/* Lighting setup */}
          <ambientLight intensity={0.25} />
          <directionalLight
            position={[5, 10, 3]}
            intensity={1.5}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#555" />

          {/* Soft dust particles floating in the environment */}
          <Sparkles
            count={600}
            position={[0, 0, -90]}
            scale={[20, 15, 210]}
            size={1.8}
            speed={0.6}
            noise={0.4}
            color="#d4af37"
          />

          {/* Main interactive scroll rig */}
          <ScrollControls pages={8} damping={0.2}>
            <CameraRig onScrollToTop={onScrollToTop} />
            {milestones.map((m, index) => (
              <Milestone key={index} {...m} />
            ))}
          </ScrollControls>

          {/* Reflective Dark Floor */}
          <mesh position={[0, -2.75, -90]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[100, 300]} />
            <MeshReflectorMaterial
              blur={[400, 100]} // Blurs the reflection (width, height)
              resolution={1024} // Resolution of the reflection off-buffer
              mixBlur={1} // How much blur mixes with surface roughness
              mixStrength={80} // Strength of the reflections
              roughness={1}
              depthScale={1.2} // Scales the depth factor
              minDepthThreshold={0.4} // Fades out the reflection at a distance
              maxDepthThreshold={1.4}
              color="#020202" // Matches your background/fog color
              metalness={0.5}
              mirror={1}
            />
          </mesh>

          {/* Subtle environment lighting reflections */}
          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  );
}
