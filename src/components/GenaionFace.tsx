import React, { useState, useEffect, useRef, useId } from 'react';

interface GenaionFaceProps {
  systemState?: string; // 'READY' | 'INFERRING' | 'ERROR'
  cpuLoadPercent?: number;
  temperatureC?: number;
  thermalState?: 'normal' | 'warm' | 'throttling' | 'critical';
  isInferring?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'compact';
  interactive?: boolean;
  className?: string;
  showStatusLabel?: boolean;
}

export const GenaionFace: React.FC<GenaionFaceProps> = ({
  systemState = 'READY',
  cpuLoadPercent = 20,
  temperatureC = 38,
  thermalState = 'normal',
  isInferring = false,
  size = 'md',
  interactive = true,
  className = '',
  showStatusLabel = true,
}) => {
  const uniqueId = useId().replace(/:/g, '');

  // Dynamic Gaze Tracking (-1 to 1) with dampening
  const [targetLookX, setTargetLookX] = useState<number>(0);
  const [targetLookY, setTargetLookY] = useState<number>(0);
  const [currentLookX, setCurrentLookX] = useState<number>(0);
  const [currentLookY, setCurrentLookY] = useState<number>(0);

  // Biological & Contemplative Micro-saccades
  const [saccadeX, setSaccadeX] = useState<number>(0);
  const [saccadeY, setSaccadeY] = useState<number>(0);

  // Deep Reflection / Pondering State (periodic thoughtful gaze)
  const [isReflecting, setIsReflecting] = useState<boolean>(false);
  const [reflectAngle, setReflectAngle] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Natural Blink State (0 = wide open, 1 = shut)
  const [blinkProgress, setBlinkProgress] = useState<number>(0);
  const [isWinking, setIsWinking] = useState<boolean>(false);

  // Continuous Deep Optical Physics Loops
  const [irisRotation, setIrisRotation] = useState<number>(0);
  const [breathPhase, setBreathPhase] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isHappy, setIsHappy] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastMouseMoveRef = useRef<number>(Date.now());

  // Smooth Gaze Interpolation Loop with Parallax Inertia
  useEffect(() => {
    let animId: number;
    const lerp = () => {
      const finalTargetX = isReflecting ? reflectAngle.x : targetLookX;
      const finalTargetY = isReflecting ? reflectAngle.y : targetLookY;

      setCurrentLookX((prev) => prev + (finalTargetX - prev) * 0.12);
      setCurrentLookY((prev) => prev + (finalTargetY - prev) * 0.12);
      animId = requestAnimationFrame(lerp);
    };
    animId = requestAnimationFrame(lerp);
    return () => cancelAnimationFrame(animId);
  }, [targetLookX, targetLookY, isReflecting, reflectAngle]);

  // Window-wide Mouse & Touch Gaze Tracking
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      lastMouseMoveRef.current = Date.now();
      setIsReflecting(false);

      if (!containerRef.current) {
        const dx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
        const dy = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
        setTargetLookX(Math.max(-1, Math.min(1, dx)));
        setTargetLookY(Math.max(-1, Math.min(1, dy)));
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) / (window.innerWidth / 2.2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2.2);
      setTargetLookX(Math.max(-1, Math.min(1, dx)));
      setTargetLookY(Math.max(-1, Math.min(1, dy)));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      lastMouseMoveRef.current = Date.now();
      setIsReflecting(false);

      const touch = e.touches[0];
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (touch.clientX - centerX) / (window.innerWidth / 2.2);
      const dy = (touch.clientY - centerY) / (window.innerHeight / 2.2);
      setTargetLookX(Math.max(-1, Math.min(1, dx)));
      setTargetLookY(Math.max(-1, Math.min(1, dy)));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [interactive]);

  // Contemplation & Reflection Routine:
  // When idle or inferring, the eye thoughtfully wanders upward-diagonally, reflecting deeply
  useEffect(() => {
    const reflectInterval = setInterval(() => {
      const idleTime = Date.now() - lastMouseMoveRef.current;
      if (idleTime > 2400 || isInferring) {
        const randomGlanceX = (Math.random() - 0.5) * 0.7;
        const randomGlanceY = -0.45 - Math.random() * 0.35;
        setReflectAngle({ x: randomGlanceX, y: randomGlanceY });
        setIsReflecting(true);

        setTimeout(() => {
          setIsReflecting(false);
        }, 1500 + Math.random() * 900);
      }
    }, 4200);

    return () => clearInterval(reflectInterval);
  }, [isInferring]);

  // Micro-saccades (Ocular living tremor every 1.5 - 2.8s)
  useEffect(() => {
    let saccadeTimer: any;
    const triggerSaccade = () => {
      const sx = (Math.random() - 0.5) * 1.6;
      const sy = (Math.random() - 0.5) * 1.3;
      setSaccadeX(sx);
      setSaccadeY(sy);
      const nextDelay = 1500 + Math.random() * 2400;
      saccadeTimer = setTimeout(triggerSaccade, nextDelay);
    };
    triggerSaccade();
    return () => clearTimeout(saccadeTimer);
  }, []);

  // Natural Asymmetric Blink Physics
  useEffect(() => {
    let blinkTimeout: any;
    let animFrame: any;

    const triggerBlink = () => {
      const startTime = performance.now();
      const totalDuration = 175; // 175ms natural blink
      const closeRatio = 0.35;

      const step = (now: number) => {
        const elapsed = now - startTime;
        const p = Math.min(1, elapsed / totalDuration);

        let progress = 0;
        if (p < closeRatio) {
          progress = Math.sin((p / closeRatio) * (Math.PI / 2));
        } else {
          const openP = (p - closeRatio) / (1 - closeRatio);
          progress = Math.cos(openP * (Math.PI / 2));
        }

        setBlinkProgress(progress);

        if (p < 1) {
          animFrame = requestAnimationFrame(step);
        } else {
          setBlinkProgress(0);
          scheduleNextBlink();
        }
      };
      animFrame = requestAnimationFrame(step);
    };

    const scheduleNextBlink = () => {
      const delay = 2700 + Math.random() * 3500;
      blinkTimeout = setTimeout(triggerBlink, delay);
    };

    scheduleNextBlink();

    return () => {
      clearTimeout(blinkTimeout);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  // Internal Iris Rotation & Living Singularity Breathing Loop
  useEffect(() => {
    const breathInterval = setInterval(() => {
      setBreathPhase((prev) => (prev + 1) % 360);
      setIrisRotation((prev) => (prev + (isInferring ? 1.4 : 0.35)) % 360);
    }, 40);
    return () => clearInterval(breathInterval);
  }, [isInferring]);

  // Determine emotional and hardware status
  let mood: 'calm' | 'thinking' | 'warm' | 'critical' | 'happy' = 'calm';
  if (isHappy) {
    mood = 'happy';
  } else if (temperatureC >= 50 || thermalState === 'critical') {
    mood = 'critical';
  } else if (temperatureC >= 45 || thermalState === 'throttling' || cpuLoadPercent > 80) {
    mood = 'warm';
  } else if (isInferring || systemState === 'INFERRING' || isReflecting) {
    mood = 'thinking';
  } else {
    mood = 'calm';
  }

  // Dimensions based on size prop (Centered 1:1 circular/eye ratio)
  const isCompact = size === 'compact' || size === 'sm';
  const width = size === 'compact' ? 44 : size === 'sm' ? 62 : size === 'lg' ? 200 : 130;
  const height = size === 'compact' ? 44 : size === 'sm' ? 62 : size === 'lg' ? 200 : 130;

  // Eye shift calculation (centered at 50, 50)
  const maxShiftX = size === 'compact' ? 4.5 : size === 'sm' ? 6 : 9.5;
  const maxShiftY = size === 'compact' ? 3.5 : size === 'sm' ? 4.8 : 7.5;
  const eyeX = currentLookX * maxShiftX + saccadeX;
  const eyeY = currentLookY * maxShiftY + saccadeY;

  // Multi-tier Parallax Depth: Internal layers shift at different ratios
  const irisX = eyeX;
  const irisY = eyeY;
  const pupilX = eyeX * 1.15; // Deeper layer moves slightly more (inverted parallax perspective)
  const pupilY = eyeY * 1.15;
  const causticX = -eyeX * 0.45; // Counter-reflection moves inversely to light source
  const causticY = -eyeY * 0.45;

  // Deep Pupil Dilation Physics (living breath + cognitive dilation)
  const dilationBreath = Math.sin(breathPhase * 0.05) * 0.7;
  const basePupilRadius = isInferring || isReflecting
    ? 9.6 + dilationBreath
    : mood === 'critical'
    ? 6.2 + dilationBreath
    : 7.8 + dilationBreath;

  // Luminous Palette with deep oceanic / cosmic jewel tones
  const palette = {
    critical: {
      deepCore: '#450a0a',
      irisCore: '#ef4444',
      irisMid: '#991b1b',
      irisOuter: '#f87171',
      limbalRing: '#7f1d1d',
      caustic: '#fca5a5',
      energyGlow: 'rgba(239, 68, 68, 0.75)',
      statusText: '● ALERTA TÉRMICA',
      statusClass: 'text-rose-400',
    },
    warm: {
      deepCore: '#451a03',
      irisCore: '#f59e0b',
      irisMid: '#92400e',
      irisOuter: '#fbbf24',
      limbalRing: '#78350f',
      caustic: '#fde68a',
      energyGlow: 'rgba(245, 158, 11, 0.7)',
      statusText: '● CARGA ELEVADA',
      statusClass: 'text-amber-400',
    },
    thinking: {
      deepCore: '#083344',
      irisCore: '#06b6d4',
      irisMid: '#0369a1',
      irisOuter: '#67e8f9',
      limbalRing: '#0e7490',
      caustic: '#a5f3fc',
      energyGlow: 'rgba(34, 211, 238, 0.85)',
      statusText: '● REFLEXIÓN COGNITIVA',
      statusClass: 'text-cyan-400',
    },
    happy: {
      deepCore: '#022c22',
      irisCore: '#10b981',
      irisMid: '#047857',
      irisOuter: '#34d399',
      limbalRing: '#065f46',
      caustic: '#6ee7b7',
      energyGlow: 'rgba(16, 185, 129, 0.75)',
      statusText: '● CONEXIÓN ACTIVA',
      statusClass: 'text-emerald-400',
    },
    calm: {
      deepCore: '#082f49',
      irisCore: '#0284c7',
      irisMid: '#0369a1',
      irisOuter: '#38bdf8',
      limbalRing: '#075985',
      caustic: '#bae6fd',
      energyGlow: 'rgba(56, 189, 248, 0.7)',
      statusText: '● OJO SOBERANO',
      statusClass: 'text-sky-400',
    },
  }[mood];

  // Click interaction: slow, mesmerizing aperture pulse & wink
  const handleInteraction = () => {
    setIsWinking(true);
    setIsHappy(true);
    setTimeout(() => {
      setIsWinking(false);
      setIsHappy(false);
    }, 1400);
  };

  // Eyelid Aperture Physics (Pure Eye centered at 50, 50)
  // Eye Corners: (18, 50) and (82, 50)
  const effectiveBlink = isWinking ? 1 : blinkProgress;
  const reflectSquint = isReflecting ? 2.5 : 0;

  const eyelidTop = 24 + effectiveBlink * 26 + reflectSquint;
  const eyelidBottom = 76 - effectiveBlink * 26 - reflectSquint;

  return (
    <div
      ref={containerRef}
      onClick={handleInteraction}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative select-none inline-flex flex-col items-center justify-center cursor-pointer transition-transform duration-200 active:scale-95 ${className}`}
      title="GENAION — Ojo Soberano Profundo. Libre de bordes, contemplativo y omnisciente. Haz clic para interactuar."
    >
      {/* 
        PURE EYE ONLY:
        Zero eyebrow, zero mouth, zero bounding boxes or frames.
        Ultra-deep, multi-layered cosmic/biological aperture floating in pure space.
      */}
      <div
        className="relative flex items-center justify-center transition-all duration-300"
        style={{ width, height }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible drop-shadow-lg"
        >
          <defs>
            {/* Luminous Glow for Deep Energy Emission */}
            <filter id={`deepEyeGlow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Deep Volumetric Iris Radial Gradient (Simulates optical sphere refraction) */}
            <radialGradient id={`deepIrisGrad-${uniqueId}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000000" />
              <stop offset="25%" stopColor={palette.deepCore} />
              <stop offset="50%" stopColor={palette.irisMid} />
              <stop offset="78%" stopColor={palette.irisCore} />
              <stop offset="92%" stopColor={palette.irisOuter} />
              <stop offset="100%" stopColor={palette.limbalRing} />
            </radialGradient>

            {/* Glassy Cornea 3D Sphere Refraction (Optical curvature highlight) */}
            <radialGradient id={`cornea3D-${uniqueId}`} cx="36%" cy="32%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="35%" stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="75%" stopColor="#000000" stopOpacity="0" />
              <stop offset="100%" stopColor={palette.irisOuter} stopOpacity="0.35" />
            </radialGradient>

            {/* Counter-Caustic Refraction Gradient (Internal reflection at bottom of iris) */}
            <radialGradient id={`causticGrad-${uniqueId}`} cx="50%" cy="85%" r="45%">
              <stop offset="0%" stopColor={palette.caustic} stopOpacity="0.75" />
              <stop offset="60%" stopColor={palette.irisOuter} stopOpacity="0.25" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            {/* Eye Eyelid Contour Clip Path (Almond-round aperture centered at 50, 50) */}
            <clipPath id={`deepApertureClip-${uniqueId}`}>
              <path
                d={`M 18 50 
                    C 28 ${eyelidTop}, 72 ${eyelidTop}, 82 50 
                    C 72 ${eyelidBottom}, 28 ${eyelidBottom}, 18 50 Z`}
              />
            </clipPath>
          </defs>

          {/* Deep Orbital Sclera Background */}
          <path
            d="M 18 50 C 28 24, 72 24, 82 50 C 72 76, 28 76, 18 50 Z"
            fill="#010409"
            stroke={palette.irisCore}
            strokeWidth="1.2"
            filter={`url(#deepEyeGlow-${uniqueId})`}
            className="transition-colors duration-300"
          />

          {/* ===================== EYE INTERIOR (CLIPPED) ===================== */}
          <g clipPath={`url(#deepApertureClip-${uniqueId})`}>
            {/* Deep Ambient Space Void */}
            <circle
              cx={50 + irisX}
              cy={50 + irisY}
              r="22"
              fill={palette.deepCore}
              opacity="0.35"
            />

            {/* Limbal Ring (Anatomical depth boundary) */}
            <circle
              cx={50 + irisX}
              cy={50 + irisY}
              r="19"
              fill="none"
              stroke={palette.limbalRing}
              strokeWidth="2.8"
              opacity="0.95"
            />

            {/* Deep Hypnotic Volumetric Iris */}
            <circle
              cx={50 + irisX}
              cy={50 + irisY}
              r="18"
              fill={`url(#deepIrisGrad-${uniqueId})`}
              className="transition-transform duration-75"
            />

            {/* Internal Caustic Optical Bounce (Light exiting bottom edge of iris) */}
            <circle
              cx={50 + irisX + causticX}
              cy={50 + irisY + causticY}
              r="17"
              fill={`url(#causticGrad-${uniqueId})`}
              pointerEvents="none"
            />

            {/* Micro-Filaments / Ciliary Crypts (Dynamic rotational energy) */}
            <g transform={`rotate(${irisRotation}, ${50 + irisX}, ${50 + irisY})`}>
              {[
                0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165,
                180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345,
              ].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const innerDist = deg % 30 === 0 ? 8 : 9.5;
                const outerDist = deg % 30 === 0 ? 17.5 : 16.5;
                const x1 = 50 + irisX + Math.cos(rad) * innerDist;
                const y1 = 50 + irisY + Math.sin(rad) * innerDist;
                const x2 = 50 + irisX + Math.cos(rad) * outerDist;
                const y2 = 50 + irisY + Math.sin(rad) * outerDist;
                return (
                  <line
                    key={deg}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={palette.irisOuter}
                    strokeWidth={deg % 30 === 0 ? '0.8' : '0.4'}
                    opacity={deg % 30 === 0 ? '0.85' : '0.5'}
                  />
                );
              })}
            </g>

            {/* Middle Collarette Ring (Contraction furrow inside human/cyber iris) */}
            <circle
              cx={50 + irisX}
              cy={50 + irisY}
              r="12.5"
              fill="none"
              stroke={palette.irisOuter}
              strokeWidth="0.5"
              strokeDasharray={isInferring ? '2.5, 1.5' : '4, 2'}
              opacity="0.65"
              className={isInferring ? 'animate-pulse' : ''}
            />

            {/* Concentric Thought Ring (Pulsates outwards during cognitive reflection) */}
            <circle
              cx={50 + pupilX}
              cy={50 + pupilY}
              r={basePupilRadius + 3.2}
              fill="none"
              stroke={palette.irisCore}
              strokeWidth="0.6"
              strokeDasharray="3, 2"
              opacity={isInferring ? 0.9 : 0.45}
            />

            {/* Deep Abyss Pupil (Black Hole Singularity with Depth) */}
            <circle
              cx={50 + pupilX}
              cy={50 + pupilY}
              r={basePupilRadius}
              fill="#000000"
              stroke={palette.irisOuter}
              strokeWidth="0.8"
              className="transition-all duration-300"
            />

            {/* Singularity Inner Event Horizon (Breathes and glows in the deep core) */}
            <circle
              cx={50 + pupilX}
              cy={50 + pupilY}
              r={basePupilRadius * 0.45}
              fill="none"
              stroke={palette.irisCore}
              strokeWidth="0.6"
              opacity="0.9"
            />

            {/* 3D Glassy Cornea Dome Sphere Overlay */}
            <circle
              cx={50 + irisX}
              cy={50 + irisY}
              r="18"
              fill={`url(#cornea3D-${uniqueId})`}
              pointerEvents="none"
            />

            {/* Primary Specular Caustic Glint (Lively eye moisture & light focus) */}
            <circle
              cx={50 + irisX - 4.5}
              cy={50 + irisY - 4.2}
              r="2.6"
              fill="#ffffff"
              className="opacity-95"
            />

            {/* Secondary Ambient Specular Glint (Opposite bounce) */}
            <circle
              cx={50 + irisX + 3.8}
              cy={50 + irisY + 3.5}
              r="1.3"
              fill="#ffffff"
              className="opacity-75"
            />

            {/* Tertiary Micro-Glint (Gives unmistakable liquid sentience) */}
            <circle
              cx={50 + irisX - 2.0}
              cy={50 + irisY + 5.0}
              r="0.75"
              fill="#ffffff"
              className="opacity-65"
            />
          </g>

          {/* Upper Lash Margin (Fluid organic contour) */}
          <path
            d={`M 18 50 C 28 ${eyelidTop}, 72 ${eyelidTop}, 82 50`}
            fill="none"
            stroke={palette.irisOuter}
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Lower Eyelid Margin */}
          <path
            d={`M 18 50 C 28 ${eyelidBottom}, 72 ${eyelidBottom}, 82 50`}
            fill="none"
            stroke={palette.irisCore}
            strokeWidth="1.2"
            strokeLinecap="round"
            className="opacity-70"
          />
        </svg>
      </div>

      {/* Dynamic Status Text Indicator (Hidden in ultra-compact navbar mode) */}
      {showStatusLabel && !isCompact && (
        <div className="mt-1 flex items-center gap-1.5 pointer-events-none">
          <span className={`text-[10px] font-mono tracking-wider font-semibold ${palette.statusClass}`}>
            {isReflecting ? '● REFLEXIÓN...' : palette.statusText}
          </span>
        </div>
      )}
    </div>
  );
};
