import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Zap, Flame, Brain, ShieldAlert, Heart } from 'lucide-react';

interface GenaionFaceProps {
  systemState?: string; // 'READY' | 'INFERRING' | 'ERROR'
  cpuLoadPercent?: number;
  temperatureC?: number;
  thermalState?: 'normal' | 'warm' | 'throttling' | 'critical';
  isInferring?: boolean;
  evolutionStage?: 1 | 2 | 3; // 1: Génesis, 2: Sináptico, 3: Androide
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  className?: string;
}

export const GenaionFace: React.FC<GenaionFaceProps> = ({
  systemState = 'READY',
  cpuLoadPercent = 20,
  temperatureC = 38,
  thermalState = 'normal',
  isInferring = false,
  evolutionStage = 1,
  size = 'md',
  interactive = true,
  className = '',
}) => {
  // Eye tracking state (-1 to 1)
  const [lookX, setLookX] = useState<number>(0);
  const [lookY, setLookY] = useState<number>(0);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [isWinking, setIsWinking] = useState<boolean>(false);
  const [moodOverride, setMoodOverride] = useState<string | null>(null);
  const [interactionCount, setInteractionCount] = useState<number>(0);
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(evolutionStage);

  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse / Touch tracking for gaze
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);
      setLookX(Math.max(-1, Math.min(1, deltaX)));
      setLookY(Math.max(-1, Math.min(1, deltaY)));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (touch.clientX - centerX) / (window.innerWidth / 2);
      const deltaY = (touch.clientY - centerY) / (window.innerHeight / 2);
      setLookX(Math.max(-1, Math.min(1, deltaX)));
      setLookY(Math.max(-1, Math.min(1, deltaY)));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [interactive]);

  // Periodic natural blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.25) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 140);
      }
    }, 3200);

    return () => clearInterval(blinkInterval);
  }, []);

  // Determine current emotional and energetic state based on real hardware and activity
  let mood: 'calm' | 'thinking' | 'warm' | 'critical' | 'happy' = 'calm';

  if (moodOverride) {
    mood = moodOverride as any;
  } else if (temperatureC >= 50 || thermalState === 'critical') {
    mood = 'critical';
  } else if (temperatureC >= 45 || thermalState === 'throttling' || cpuLoadPercent > 80) {
    mood = 'warm';
  } else if (isInferring || systemState === 'INFERRING') {
    mood = 'thinking';
  } else {
    mood = 'calm';
  }

  // Dimension scaling
  const dim = size === 'sm' ? 56 : size === 'lg' ? 140 : 96;

  // Eye gaze offset calculation
  const gazeRange = size === 'sm' ? 3 : size === 'lg' ? 7 : 5;
  const pupilOffsetX = lookX * gazeRange;
  const pupilOffsetY = lookY * gazeRange;

  // Palette according to mood
  const getThemeColors = () => {
    switch (mood) {
      case 'critical':
        return {
          glow: 'rgba(239, 68, 68, 0.45)',
          primary: '#ef4444',
          secondary: '#f87171',
          bg: '#1c0709',
          border: '#b91c1c',
          aura: 'animate-pulse text-rose-400',
        };
      case 'warm':
        return {
          glow: 'rgba(245, 158, 11, 0.4)',
          primary: '#f59e0b',
          secondary: '#fbbf24',
          bg: '#1c1305',
          border: '#d97706',
          aura: 'text-amber-400',
        };
      case 'thinking':
        return {
          glow: 'rgba(34, 211, 238, 0.5)',
          primary: '#22d3ee',
          secondary: '#67e8f9',
          bg: '#041c24',
          border: '#0891b2',
          aura: 'text-cyan-400',
        };
      case 'happy':
        return {
          glow: 'rgba(16, 185, 129, 0.45)',
          primary: '#10b981',
          secondary: '#34d399',
          bg: '#051d14',
          border: '#059669',
          aura: 'text-emerald-400',
        };
      case 'calm':
      default:
        return {
          glow: 'rgba(56, 189, 248, 0.35)',
          primary: '#38bdf8',
          secondary: '#93c5fd',
          bg: '#090d16',
          border: '#1e293b',
          aura: 'text-sky-400',
        };
    }
  };

  const theme = getThemeColors();

  const handleFaceClick = () => {
    setInteractionCount((prev) => prev + 1);
    setIsWinking(true);
    setMoodOverride('happy');
    setTimeout(() => {
      setIsWinking(false);
      setMoodOverride(null);
    }, 1200);
  };

  const toggleStage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentStage((prev) => (prev === 3 ? 1 : ((prev + 1) as 1 | 2 | 3)));
  };

  return (
    <div
      ref={containerRef}
      onClick={handleFaceClick}
      className={`group relative select-none inline-flex flex-col items-center justify-center cursor-pointer transition-transform duration-200 active:scale-95 ${className}`}
      title="Haz clic para interactuar con la entidad de GENAION · Haz clic en el botón inferior para evolucionar su etapa"
    >
      {/* Outer Cybernetic Halo / Breath Aura */}
      <div
        className={`relative rounded-2xl flex items-center justify-center p-2 transition-all duration-300 ${
          mood === 'critical' ? 'animate-pulse' : ''
        }`}
        style={{
          width: dim,
          height: dim,
          backgroundColor: theme.bg,
          borderColor: theme.border,
          boxShadow: `0 0 20px ${theme.glow}, inset 0 0 12px ${theme.glow}`,
          borderWidth: '1.5px',
        }}
      >
        {/* Stage 1: GÉNESIS (Geometric Digital Face) */}
        {currentStage === 1 && (
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full overflow-visible transition-all duration-300"
          >
            {/* Hexagonal Head Boundary */}
            <polygon
              points="50,6 88,27 88,73 50,94 12,73 12,27"
              fill="none"
              stroke={theme.border}
              strokeWidth="1.5"
              strokeDasharray="4 3"
              className="opacity-70"
            />

            {/* Neural Crest Antenna / Pulse */}
            <circle cx="50" cy="12" r="3" fill={theme.primary} className={isInferring ? 'animate-ping' : ''} />
            <line x1="50" y1="15" x2="50" y2="28" stroke={theme.primary} strokeWidth="1.5" />

            {/* Left Eye Socket */}
            <g transform="translate(32, 45)">
              <rect
                x="-12"
                y="-10"
                width="24"
                height="20"
                rx="4"
                fill="#020617"
                stroke={theme.primary}
                strokeWidth="1.2"
              />
              {/* Eye pupil */}
              {!isBlinking && (
                <circle
                  cx={pupilOffsetX}
                  cy={pupilOffsetY}
                  r="5"
                  fill={theme.secondary}
                  className="transition-transform duration-75"
                />
              )}
              {isBlinking && (
                <line x1="-8" y1="0" x2="8" y2="0" stroke={theme.secondary} strokeWidth="2.5" strokeLinecap="round" />
              )}
            </g>

            {/* Right Eye Socket */}
            <g transform="translate(68, 45)">
              <rect
                x="-12"
                y="-10"
                width="24"
                height="20"
                rx="4"
                fill="#020617"
                stroke={theme.primary}
                strokeWidth="1.2"
              />
              {/* Eye pupil or Wink */}
              {!isBlinking && !isWinking && (
                <circle
                  cx={pupilOffsetX}
                  cy={pupilOffsetY}
                  r="5"
                  fill={theme.secondary}
                  className="transition-transform duration-75"
                />
              )}
              {(isBlinking || isWinking) && (
                <path
                  d="M -8 1 Q 0 -4 8 1"
                  fill="none"
                  stroke={theme.secondary}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}
            </g>

            {/* Cheek Digital Matrix Markers */}
            <circle cx="20" cy="58" r="1.5" fill={theme.secondary} className="opacity-80" />
            <circle cx="80" cy="58" r="1.5" fill={theme.secondary} className="opacity-80" />

            {/* Mouth / Waveform */}
            {mood === 'thinking' ? (
              // Audio / Speech Equalizer bars
              <g transform="translate(50, 75)">
                <line x1="-12" y1="-3" x2="-12" y2="3" stroke={theme.secondary} strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
                <line x1="-6" y1="-6" x2="-6" y2="6" stroke={theme.secondary} strokeWidth="2" strokeLinecap="round" />
                <line x1="0" y1="-8" x2="0" y2="8" stroke={theme.secondary} strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
                <line x1="6" y1="-6" x2="6" y2="6" stroke={theme.secondary} strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="-3" x2="12" y2="3" stroke={theme.secondary} strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
              </g>
            ) : mood === 'critical' ? (
              // Alarmed tense zigzag mouth
              <path
                d="M 36 78 L 43 73 L 50 78 L 57 73 L 64 78"
                fill="none"
                stroke={theme.primary}
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            ) : mood === 'happy' ? (
              // Smiling arch
              <path
                d="M 36 72 Q 50 83 64 72"
                fill="none"
                stroke={theme.secondary}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ) : (
              // Serene digital slit
              <line
                x1="38"
                y1="75"
                x2="62"
                y2="75"
                stroke={theme.primary}
                strokeWidth="2"
                strokeLinecap="round"
                className="opacity-90"
              />
            )}
          </svg>
        )}

        {/* Stage 2: SINÁPTICO (Neural Circuitry & Expressive Cyber Visor) */}
        {currentStage === 2 && (
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            {/* Neural Brain Circuit traces on forehead */}
            <path
              d="M 28 20 L 40 28 L 50 24 L 60 28 L 72 20"
              fill="none"
              stroke={theme.secondary}
              strokeWidth="1.2"
              strokeDasharray="2 2"
              className={isInferring ? 'animate-pulse' : 'opacity-60'}
            />
            <circle cx="50" cy="24" r="2.5" fill={theme.secondary} />

            {/* Continuous Curved Cyber Visor */}
            <path
              d="M 18 38 Q 50 32 82 38 L 84 56 Q 50 64 16 56 Z"
              fill="#020617"
              stroke={theme.primary}
              strokeWidth="1.5"
            />

            {/* Left Eye / Visor Glow */}
            {!isBlinking && (
              <ellipse
                cx={36 + pupilOffsetX}
                cy={47 + pupilOffsetY}
                rx="6"
                ry="5"
                fill={theme.secondary}
                className="transition-transform duration-75"
              />
            )}
            {isBlinking && (
              <line x1="28" y1="47" x2="44" y2="47" stroke={theme.secondary} strokeWidth="2.5" strokeLinecap="round" />
            )}

            {/* Right Eye */}
            {!isBlinking && !isWinking && (
              <ellipse
                cx={64 + pupilOffsetX}
                cy={47 + pupilOffsetY}
                rx="6"
                ry="5"
                fill={theme.secondary}
                className="transition-transform duration-75"
              />
            )}
            {(isBlinking || isWinking) && (
              <path d="M 56 48 Q 64 43 72 48" fill="none" stroke={theme.secondary} strokeWidth="2.5" strokeLinecap="round" />
            )}

            {/* Chin Accent Lines */}
            <line x1="30" y1="84" x2="44" y2="84" stroke={theme.border} strokeWidth="1.5" />
            <line x1="56" y1="84" x2="70" y2="84" stroke={theme.border} strokeWidth="1.5" />

            {/* Expressive Mouth */}
            {mood === 'thinking' ? (
              <g transform="translate(50, 74)">
                <ellipse cx="0" cy="0" rx="6" ry="4" fill="none" stroke={theme.secondary} strokeWidth="2" className="animate-pulse" />
              </g>
            ) : mood === 'critical' ? (
              <path d="M 36 78 Q 50 68 64 78" fill="none" stroke={theme.primary} strokeWidth="2.5" strokeLinecap="round" />
            ) : mood === 'happy' ? (
              <path d="M 35 70 Q 50 84 65 70" fill="none" stroke={theme.secondary} strokeWidth="2.5" strokeLinecap="round" />
            ) : (
              <path d="M 38 73 Q 50 76 62 73" fill="none" stroke={theme.secondary} strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        )}

        {/* Stage 3: ANDROIDE SOBERANO (Full Cyber Android with Dynamic Eyes & HUD) */}
        {currentStage === 3 && (
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            {/* Outer Head Armor Plates */}
            <path
              d="M 22 18 Q 50 10 78 18 L 86 65 Q 50 96 14 65 Z"
              fill="none"
              stroke={theme.primary}
              strokeWidth="1.5"
            />

            {/* HUD Reticle Marks */}
            <line x1="8" y1="50" x2="16" y2="50" stroke={theme.secondary} strokeWidth="1" />
            <line x1="84" y1="50" x2="92" y2="50" stroke={theme.secondary} strokeWidth="1" />

            {/* Big Luminous Eyes */}
            <g transform="translate(34, 44)">
              <circle cx="0" cy="0" r="12" fill="#030712" stroke={theme.primary} strokeWidth="1.2" />
              {!isBlinking && (
                <>
                  <circle
                    cx={pupilOffsetX}
                    cy={pupilOffsetY}
                    r="6"
                    fill={theme.secondary}
                    className="transition-transform duration-75"
                  />
                  <circle cx={pupilOffsetX - 2} cy={pupilOffsetY - 2} r="2" fill="#ffffff" />
                </>
              )}
              {isBlinking && (
                <line x1="-9" y1="0" x2="9" y2="0" stroke={theme.secondary} strokeWidth="2.5" strokeLinecap="round" />
              )}
            </g>

            <g transform="translate(66, 44)">
              <circle cx="0" cy="0" r="12" fill="#030712" stroke={theme.primary} strokeWidth="1.2" />
              {!isBlinking && !isWinking && (
                <>
                  <circle
                    cx={pupilOffsetX}
                    cy={pupilOffsetY}
                    r="6"
                    fill={theme.secondary}
                    className="transition-transform duration-75"
                  />
                  <circle cx={pupilOffsetX - 2} cy={pupilOffsetY - 2} r="2" fill="#ffffff" />
                </>
              )}
              {(isBlinking || isWinking) && (
                <path d="M -9 2 Q 0 -4 9 2" fill="none" stroke={theme.secondary} strokeWidth="2.5" strokeLinecap="round" />
              )}
            </g>

            {/* Subtle Blush or Thermal Glow */}
            <ellipse cx="22" cy="56" rx="4" ry="2" fill={theme.glow} />
            <ellipse cx="78" cy="56" rx="4" ry="2" fill={theme.glow} />

            {/* Mouth */}
            {mood === 'thinking' ? (
              <g transform="translate(50, 72)">
                <path d="M -10 0 Q 0 -5 10 0 Q 0 5 -10 0" fill={theme.secondary} className="animate-pulse opacity-90" />
              </g>
            ) : mood === 'critical' ? (
              <path d="M 38 76 Q 50 66 62 76" fill="none" stroke={theme.primary} strokeWidth="2.5" strokeLinecap="round" />
            ) : mood === 'happy' ? (
              <path d="M 36 68 Q 50 82 64 68" fill="none" stroke={theme.secondary} strokeWidth="2.5" strokeLinecap="round" />
            ) : (
              <path d="M 40 72 Q 50 76 60 72" fill="none" stroke={theme.secondary} strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        )}

        {/* Thermal Steam / Glitch Particles if Warm / Critical */}
        {mood === 'critical' && (
          <div className="absolute -top-1 -right-1 flex gap-0.5">
            <Flame className="w-4 h-4 text-rose-500 animate-bounce" />
          </div>
        )}
        {mood === 'warm' && (
          <div className="absolute -top-1 -right-1">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          </div>
        )}
      </div>

      {/* Evolution Stage Switcher & Emotional Status Badge */}
      <div className="mt-2 flex flex-col items-center">
        <button
          onClick={toggleStage}
          className="text-[10px] font-mono text-slate-400 hover:text-cyan-400 bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 shadow-sm"
          title="Haz clic para evolucionar el rostro a la siguiente etapa de desarrollo"
        >
          <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
          <span>
            {currentStage === 1
              ? 'Etapa 1: Génesis'
              : currentStage === 2
              ? 'Etapa 2: Sináptico'
              : 'Etapa 3: Androide'}
          </span>
        </button>

        <span className={`text-[10px] font-mono mt-0.5 font-semibold ${theme.aura}`}>
          {mood === 'critical'
            ? '● Peligro Térmico'
            : mood === 'warm'
            ? '● Carga Elevada'
            : mood === 'thinking'
            ? '● Procesando...'
            : mood === 'happy'
            ? '● En Sincronía'
            : '● Soberano / Calma'}
        </span>
      </div>
    </div>
  );
};
