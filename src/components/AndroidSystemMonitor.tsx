import React, { useState, useEffect, useRef } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  Cpu,
  Flame,
  Zap,
  ShieldAlert,
  Play,
  Pause,
  RefreshCw,
  Sliders,
  Smartphone,
  Gauge,
  Thermometer,
  AlertTriangle,
  Bell,
  BellOff,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { TelemetrySample, AndroidThermalInfo, HardwareStats, AlertThresholds } from '../types';

interface AndroidSystemMonitorProps {
  hardware: HardwareStats | null;
  onRefreshParent?: () => void;
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  cpuWarningPercent: 75,
  cpuCriticalPercent: 88,
  thermalWarningC: 44,
  thermalCriticalC: 50,
  ramWarningPercent: 85,
  soundAlertsEnabled: false,
};

export const AndroidSystemMonitor: React.FC<AndroidSystemMonitorProps> = ({
  hardware,
  onRefreshParent,
}) => {
  const [history, setHistory] = useState<TelemetrySample[]>([]);
  const [currentSample, setCurrentSample] = useState<TelemetrySample | null>(null);
  const [androidThermal, setAndroidThermal] = useState<AndroidThermalInfo | null>(null);
  const [isLivePolling, setIsLivePolling] = useState<boolean>(true);
  const [pollIntervalMs, setPollIntervalMs] = useState<number>(2500);
  const [chartView, setChartView] = useState<'all' | 'compute' | 'thermal'>('all');
  const [simulatingLoad, setSimulatingLoad] = useState<boolean>(false);

  // Configuration and Alert Thresholds
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [thresholds, setThresholds] = useState<AlertThresholds>(() => {
    try {
      const saved = localStorage.getItem('genaion_alert_thresholds');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_THRESHOLDS;
  });

  const [tempThresholds, setTempThresholds] = useState<AlertThresholds>(thresholds);
  const [configSavedToast, setConfigSavedToast] = useState<boolean>(false);
  const [alertsMuted, setAlertsMuted] = useState<boolean>(false);
  const lastBeepTimeRef = useRef<number>(0);

  const fetchLiveTelemetry = async () => {
    try {
      const res = await fetch('/api/system/telemetry/live');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
        setCurrentSample(data.current || null);
        setAndroidThermal(data.androidThermal || null);
      }
    } catch (e) {
      console.error('Error fetching live telemetry:', e);
    }
  };

  useEffect(() => {
    fetchLiveTelemetry();
  }, []);

  useEffect(() => {
    if (!isLivePolling) return;
    const interval = setInterval(() => {
      fetchLiveTelemetry();
    }, pollIntervalMs);
    return () => clearInterval(interval);
  }, [isLivePolling, pollIntervalMs]);

  // Play subtle synth beep for critical alert if enabled
  const triggerAudioWarning = (freq = 700) => {
    if (!thresholds.soundAlertsEnabled || alertsMuted) return;
    const now = Date.now();
    if (now - lastBeepTimeRef.current < 8000) return; // limit frequency to once per 8s
    lastBeepTimeRef.current = now;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // AudioContext could be blocked by browser policy until interaction
    }
  };

  // Evaluate current metrics against user thresholds
  const latestCpu = currentSample?.cpuLoadPercent ?? 20;
  const latestRam = currentSample?.ramUsedPercent ?? 50;
  const latestTemp = currentSample?.temperatureC ?? 38;
  const latestBatTemp = currentSample?.batteryTempC ?? 32;
  const latestFreeMb = currentSample?.freeRamMb ?? 2048;

  const isCpuCritical = latestCpu >= thresholds.cpuCriticalPercent;
  const isCpuWarning = latestCpu >= thresholds.cpuWarningPercent && !isCpuCritical;

  const isThermalCritical = latestTemp >= thresholds.thermalCriticalC;
  const isThermalWarning = latestTemp >= thresholds.thermalWarningC && !isThermalCritical;

  const isRamWarning = latestRam >= thresholds.ramWarningPercent;

  const hasAnyAlert = (isCpuCritical || isCpuWarning || isThermalCritical || isThermalWarning || isRamWarning) && !alertsMuted;
  const isCriticalAlert = isCpuCritical || isThermalCritical;

  // Audio tone trigger
  useEffect(() => {
    if (isCriticalAlert) {
      triggerAudioWarning(850);
    } else if (isCpuWarning || isThermalWarning) {
      triggerAudioWarning(520);
    }
  }, [latestCpu, latestTemp, isCriticalAlert, isCpuWarning, isThermalWarning]);

  // Save thresholds
  const handleSaveConfig = () => {
    setThresholds(tempThresholds);
    localStorage.setItem('genaion_alert_thresholds', JSON.stringify(tempThresholds));
    setConfigSavedToast(true);
    setTimeout(() => {
      setConfigSavedToast(false);
      setShowConfig(false);
    }, 1200);

    // Also persist in SQLite memory facts as backup
    fetch('/api/memory/facts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'alert_thresholds',
        key: 'hardware_limits_config',
        value: JSON.stringify(tempThresholds),
      }),
    }).catch(() => {});
  };

  const handleResetDefaults = () => {
    setTempThresholds(DEFAULT_THRESHOLDS);
  };

  // Simulate momentary burst (e.g. prompt evaluation in llama.cpp)
  const triggerInferenceBurst = () => {
    setSimulatingLoad(true);
    const now = new Date();
    const timeLabel = now.toTimeString().split(' ')[0];
    const burstCpu = Math.min(96, (currentSample?.cpuLoadPercent || 30) + 48);
    const burstTemp = Math.min(56, (currentSample?.temperatureC || 38) + 8);
    const burstRam = Math.min(94, (currentSample?.ramUsedPercent || 48) + 12);

    const burstPoint: TelemetrySample = {
      timestamp: now.toISOString(),
      timeLabel,
      cpuLoadPercent: burstCpu,
      ramUsedPercent: burstRam,
      ramUsedGb: Number(((hardware?.totalRamGb || 4) * (burstRam / 100)).toFixed(2)),
      freeRamMb: Math.max(300, (currentSample?.freeRamMb || 1800) - 400),
      temperatureC: burstTemp,
      batteryTempC: (currentSample?.batteryTempC || 32) + 2,
      thermalState: burstTemp >= 52 ? 'critical' : burstTemp >= 46 ? 'throttling' : 'warm',
      lmkRiskScore: Math.min(85, (currentSample?.lmkRiskScore || 15) + 35),
    };

    setHistory((prev) => [...prev.slice(-35), burstPoint]);
    setCurrentSample(burstPoint);

    setTimeout(() => {
      setSimulatingLoad(false);
      fetchLiveTelemetry();
    }, 4500);
  };

  // Custom Recharts Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 p-2.5 rounded-lg shadow-xl text-xs backdrop-blur-md">
          <div className="text-[11px] font-mono text-slate-400 mb-1 border-b border-slate-800 pb-1">
            Hora: {label}
          </div>
          <div className="space-y-1 font-mono text-[11px] tabular-nums">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}:
                </span>
                <span className="font-bold text-white">
                  {entry.value}
                  {entry.unit || ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-6">
      {/* Header and Controller Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Monitor de Carga de CPU, Térmica y RAM en Android (Termux)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Telemetría de alta resolución para procesadores ARM móvil, prevención de LowMemoryKiller (LMK) y control térmico adaptativo.
          </p>
        </div>

        {/* Polling & Configuration Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart View Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setChartView('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                chartView === 'all'
                  ? 'bg-slate-800 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos los Gráficos
            </button>
            <button
              onClick={() => setChartView('compute')}
              className={`px-2.5 py-1 rounded transition-colors ${
                chartView === 'compute'
                  ? 'bg-slate-800 text-cyan-300 font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CPU & RAM
            </button>
            <button
              onClick={() => setChartView('thermal')}
              className={`px-2.5 py-1 rounded transition-colors ${
                chartView === 'thermal'
                  ? 'bg-slate-800 text-amber-300 font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Térmica (°C)
            </button>
          </div>

          {/* Configuration Thresholds Button */}
          <button
            onClick={() => {
              setTempThresholds(thresholds);
              setShowConfig(!showConfig);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              showConfig
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
            }`}
            title="Configurar límites y umbrales de alerta de hardware"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Configurar Umbrales</span>
          </button>

          {/* Polling Toggle */}
          <button
            onClick={() => setIsLivePolling(!isLivePolling)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              isLivePolling
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
            }`}
            title={isLivePolling ? 'Pausar muestreo' : 'Reanudar muestreo'}
          >
            {isLivePolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isLivePolling ? 'En Vivo (2.5s)' : 'Pausado'}</span>
          </button>

          {/* Simulate Load Trigger */}
          <button
            onClick={triggerInferenceBurst}
            disabled={simulatingLoad}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
            title="Simula la carga computacional de inferencia de un modelo GGUF en Termux"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{simulatingLoad ? 'Simulando Carga...' : 'Simular Ráfaga'}</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC ALERT BANNER WHEN THRESHOLDS ARE EXCEEDED */}
      {hasAnyAlert && (
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
            isCriticalAlert
              ? 'bg-rose-950/40 border-rose-600/70 text-rose-200'
              : 'bg-amber-950/40 border-amber-500/70 text-amber-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                isCriticalAlert ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-0.5 text-xs">
              <div className="font-bold flex items-center gap-2">
                <span>
                  {isCriticalAlert ? 'ALERTA CRÍTICA DE HARDWARE (TERMINAL ANDROID)' : 'ADVERTENCIA DE RENDIMIENTO Y TÉRMICA'}
                </span>
                <span className="text-[11px] font-mono opacity-80">
                  [{new Date().toLocaleTimeString()}]
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {isThermalCritical && (
                  <span>
                    La temperatura del SoC ({latestTemp}°C) ha rebasado tu umbral crítico ({thresholds.thermalCriticalC}°C).
                    Riesgo inminente de estrangulamiento térmico y caída de FPS en Termux.{' '}
                  </span>
                )}
                {isThermalWarning && !isThermalCritical && (
                  <span>
                    La temperatura del SoC ({latestTemp}°C) superó el umbral de advertencia ({thresholds.thermalWarningC}°C).{' '}
                  </span>
                )}
                {isCpuCritical && (
                  <span>
                    La carga de CPU ({latestCpu}%) ha superado tu límite crítico ({thresholds.cpuCriticalPercent}%).
                    Considera reducir los hilos de inferencia a {Math.max(1, (hardware?.recommendedThreads || 4) - 1)}.{' '}
                  </span>
                )}
                {isCpuWarning && !isCpuCritical && (
                  <span>
                    La carga de CPU ({latestCpu}%) superó el nivel de advertencia ({thresholds.cpuWarningPercent}%).{' '}
                  </span>
                )}
                {isRamWarning && (
                  <span>
                    El consumo de RAM ({latestRam}%) superó el {thresholds.ramWarningPercent}%. Posible activación del LowMemoryKiller de Android.{' '}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setShowConfig(true)}
              className="px-2.5 py-1 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded transition-colors text-slate-200"
            >
              Ajustar Umbrales
            </button>
            <button
              onClick={() => {
                setAlertsMuted(true);
                setTimeout(() => setAlertsMuted(false), 60000);
              }}
              className="px-2.5 py-1 text-xs bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded transition-colors text-slate-400 hover:text-slate-200"
              title="Silenciar alertas visuales durante 60 segundos"
            >
              Silenciar 1m
            </button>
          </div>
        </div>
      )}

      {/* THRESHOLD CONFIGURATION DRAWER / PANEL */}
      {showConfig && (
        <div className="p-4 bg-slate-950/90 border border-cyan-500/40 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Configuración de Umbrales de Alerta (CPU, Térmica y RAM)
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetDefaults}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800"
                title="Restablecer valores recomendados para Android Termux"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer</span>
              </button>
              <button
                onClick={() => setShowConfig(false)}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-0.5"
              >
                Cerrar
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Personaliza los límites a partir de los cuales GENAION emitirá alertas visuales y sonoras en la interfaz.
            Las líneas de referencia discontinuas en los gráficos Recharts se ajustarán automáticamente a tus nuevos valores.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* CPU Warning */}
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg space-y-2">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-medium">Aviso Carga CPU (%)</span>
                <span className="font-mono text-amber-400 font-bold tabular-nums">
                  {tempThresholds.cpuWarningPercent}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="90"
                step="2"
                value={tempThresholds.cpuWarningPercent}
                onChange={(e) =>
                  setTempThresholds({
                    ...tempThresholds,
                    cpuWarningPercent: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>50%</span>
                <span>Recomendado: 75%</span>
                <span>90%</span>
              </div>
            </div>

            {/* CPU Critical */}
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg space-y-2">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-medium">Límite Crítico CPU (%)</span>
                <span className="font-mono text-rose-400 font-bold tabular-nums">
                  {tempThresholds.cpuCriticalPercent}%
                </span>
              </div>
              <input
                type="range"
                min="75"
                max="99"
                step="1"
                value={tempThresholds.cpuCriticalPercent}
                onChange={(e) =>
                  setTempThresholds({
                    ...tempThresholds,
                    cpuCriticalPercent: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-rose-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>75%</span>
                <span>Recomendado: 88%</span>
                <span>99%</span>
              </div>
            </div>

            {/* Thermal Warning */}
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg space-y-2">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-medium">Aviso Térmico SoC (°C)</span>
                <span className="font-mono text-amber-400 font-bold tabular-nums">
                  {tempThresholds.thermalWarningC}°C
                </span>
              </div>
              <input
                type="range"
                min="38"
                max="52"
                step="1"
                value={tempThresholds.thermalWarningC}
                onChange={(e) =>
                  setTempThresholds({
                    ...tempThresholds,
                    thermalWarningC: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>38°C</span>
                <span>Recomendado: 44°C</span>
                <span>52°C</span>
              </div>
            </div>

            {/* Thermal Critical */}
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg space-y-2">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-medium">Límite Crítico Térmico (°C)</span>
                <span className="font-mono text-rose-400 font-bold tabular-nums">
                  {tempThresholds.thermalCriticalC}°C
                </span>
              </div>
              <input
                type="range"
                min="46"
                max="62"
                step="1"
                value={tempThresholds.thermalCriticalC}
                onChange={(e) =>
                  setTempThresholds({
                    ...tempThresholds,
                    thermalCriticalC: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-rose-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>46°C</span>
                <span>Throttling Android: 50°C</span>
                <span>62°C</span>
              </div>
            </div>

            {/* RAM Warning */}
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg space-y-2">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-medium">Aviso Consumo RAM (%)</span>
                <span className="font-mono text-purple-400 font-bold tabular-nums">
                  {tempThresholds.ramWarningPercent}%
                </span>
              </div>
              <input
                type="range"
                min="65"
                max="95"
                step="2"
                value={tempThresholds.ramWarningPercent}
                onChange={(e) =>
                  setTempThresholds({
                    ...tempThresholds,
                    ramWarningPercent: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-purple-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>65%</span>
                <span>Recomendado: 85%</span>
                <span>95%</span>
              </div>
            </div>

            {/* Sound alerts toggle */}
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-medium flex items-center gap-1.5">
                  {tempThresholds.soundAlertsEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  Tono de Alerta Sonora
                </span>
                <input
                  type="checkbox"
                  checked={tempThresholds.soundAlertsEnabled}
                  onChange={(e) =>
                    setTempThresholds({
                      ...tempThresholds,
                      soundAlertsEnabled: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-2 leading-tight">
                Emite un breve tono sintetizado suave (Web Audio API) si el dispositivo alcanza niveles críticos en Termux.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setShowConfig(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveConfig}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
            >
              {configSavedToast ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{configSavedToast ? 'Guardado en SQLite' : 'Guardar Umbrales'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Real-time Android KPI Indicators with Adaptive Warning Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* CPU Load Metric */}
        <div
          className={`border rounded-lg p-3 transition-all ${
            isCpuCritical
              ? 'bg-rose-950/20 border-rose-500/80 shadow-sm'
              : isCpuWarning
              ? 'bg-amber-950/20 border-amber-500/70 shadow-sm'
              : 'bg-slate-950/80 border-slate-800/90'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Carga de CPU
            </span>
            <span className="font-mono text-[11px] text-slate-500">{hardware?.arch || 'ARM64'}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div
              className={`text-xl font-bold font-mono tabular-nums ${
                isCpuCritical ? 'text-rose-400' : isCpuWarning ? 'text-amber-400' : 'text-cyan-400'
              }`}
            >
              {latestCpu}%
            </div>
            {(isCpuCritical || isCpuWarning) && (
              <span
                className={`text-[9px] font-mono font-bold px-1 rounded ${
                  isCpuCritical ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {isCpuCritical ? `> ${thresholds.cpuCriticalPercent}% CRÍT` : `> ${thresholds.cpuWarningPercent}%`}
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {hardware?.cpuCores || 8} núcleos · Governor: {androidThermal?.governor?.split(' ')[0] || 'schedutil'}
          </div>
        </div>

        {/* RAM Usage & Free Margin */}
        <div
          className={`border rounded-lg p-3 transition-all ${
            isRamWarning
              ? 'bg-purple-950/20 border-purple-500/70 shadow-sm'
              : 'bg-slate-950/80 border-slate-800/90'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              Uso de RAM
            </span>
            <span className="font-mono text-[11px] text-slate-500 tabular-nums">{latestFreeMb} MB lib</span>
          </div>
          <div className="flex items-baseline justify-between">
            <div
              className={`text-xl font-bold font-mono tabular-nums ${
                isRamWarning ? 'text-purple-300 font-extrabold' : 'text-purple-400'
              }`}
            >
              {latestRam}%
            </div>
            {isRamWarning && (
              <span className="text-[9px] font-mono font-bold px-1 rounded bg-purple-500/20 text-purple-300">
                {`> ${thresholds.ramWarningPercent}% LMK`}
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {currentSample?.ramUsedGb || 1.8} GB en uso / {hardware?.totalRamGb || 4} GB
          </div>
        </div>

        {/* Junction Thermal Status */}
        <div
          className={`border rounded-lg p-3 transition-all ${
            isThermalCritical
              ? 'bg-rose-950/20 border-rose-500/80 shadow-sm'
              : isThermalWarning
              ? 'bg-amber-950/20 border-amber-500/70 shadow-sm'
              : 'bg-slate-950/80 border-slate-800/90'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              Térmica SoC
            </span>
            <span
              className={`text-[10px] font-mono uppercase font-semibold ${
                isThermalCritical
                  ? 'text-rose-400'
                  : isThermalWarning
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {isThermalCritical ? 'CRÍTICO' : isThermalWarning ? 'ALTO' : 'NORMAL'}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div
              className={`text-xl font-bold font-mono tabular-nums ${
                isThermalCritical ? 'text-rose-400' : isThermalWarning ? 'text-amber-400' : 'text-amber-400'
              }`}
            >
              {latestTemp}°C
            </div>
            {(isThermalCritical || isThermalWarning) && (
              <span
                className={`text-[9px] font-mono font-bold px-1 rounded ${
                  isThermalCritical ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {isThermalCritical ? `> ${thresholds.thermalCriticalC}°C` : `> ${thresholds.thermalWarningC}°C`}
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            Batería: {latestBatTemp}°C · Límite seguro: {thresholds.thermalWarningC}°C
          </div>
        </div>

        {/* Android LMK Protection Risk */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              Riesgo LMK Android
            </span>
            <span
              className={`text-[10px] font-mono uppercase font-semibold ${
                androidThermal?.lmkRiskLevel === 'imminent' || androidThermal?.lmkRiskLevel === 'high'
                  ? 'text-rose-400'
                  : androidThermal?.lmkRiskLevel === 'moderate'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {androidThermal?.lmkRiskLevel || 'low'}
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            {Math.max(0, 100 - (currentSample?.lmkRiskScore || 10))}%{' '}
            <span className="text-xs font-sans text-slate-400 font-normal">seguro</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            Umbral OOM minfree: {androidThermal?.lmkMinFreeMb || 384} MB
          </div>
        </div>
      </div>

      {/* Chart 1: CPU Load & RAM Consumption Trends (% over time) */}
      {(chartView === 'all' || chartView === 'compute') && (
        <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <span>Tendencia de Carga de CPU y Consumo de RAM (%)</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Monitoreo continuo con líneas dinámicas para umbrales configurados ({thresholds.cpuWarningPercent}% y {thresholds.cpuCriticalPercent}%)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
                CPU (%)
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-400" />
                RAM (%)
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="timeLabel"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                {/* Dynamic Warning Reference Line */}
                <ReferenceLine
                  y={thresholds.cpuWarningPercent}
                  stroke="#eab308"
                  strokeDasharray="4 4"
                  label={{
                    value: `Aviso CPU (${thresholds.cpuWarningPercent}%)`,
                    fill: '#eab308',
                    fontSize: 10,
                    position: 'insideTopLeft',
                  }}
                />
                {/* Dynamic Critical Reference Line */}
                <ReferenceLine
                  y={thresholds.cpuCriticalPercent}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: `Crítico CPU (${thresholds.cpuCriticalPercent}%)`,
                    fill: '#ef4444',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cpuLoadPercent"
                  name="Carga CPU"
                  unit="%"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#cpuGradient)"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="ramUsedPercent"
                  name="Uso RAM"
                  unit="%"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#ramGradient)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Chart 2: Thermal Status & Junction Temperatures (°C) */}
      {(chartView === 'all' || chartView === 'thermal') && (
        <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <span>Comportamiento Térmico del SoC y Batería (°C)</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Líneas de corte configuradas: Aviso a {thresholds.thermalWarningC}°C · Crítico a {thresholds.thermalCriticalC}°C
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                SoC (°C)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                Batería (°C)
              </span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="timeLabel"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  domain={[25, 65]}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(v) => `${v}°C`}
                />
                <Tooltip content={<CustomTooltip />} />
                {/* Dynamic Warning Reference Line */}
                <ReferenceLine
                  y={thresholds.thermalWarningC}
                  stroke="#eab308"
                  strokeDasharray="4 4"
                  label={{
                    value: `Aviso Térmico (${thresholds.thermalWarningC}°C)`,
                    fill: '#eab308',
                    fontSize: 10,
                    position: 'insideTopLeft',
                  }}
                />
                {/* Dynamic Critical Reference Line */}
                <ReferenceLine
                  y={thresholds.thermalCriticalC}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: `Límite Crítico (${thresholds.thermalCriticalC}°C)`,
                    fill: '#ef4444',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="temperatureC"
                  name="Temperatura SoC"
                  unit="°C"
                  stroke="#f59e0b"
                  strokeWidth={2.2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="batteryTempC"
                  name="Temperatura Batería"
                  unit="°C"
                  stroke="#10b981"
                  strokeWidth={1.8}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Android Termux Thermal & LMK Diagnostics Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Thermal Zones Matrix */}
        <div className="p-4 bg-slate-950/70 border border-slate-800/90 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Zonas Térmicas Android (/sys/class/thermal)
            </span>
            <span className="text-[11px] font-mono text-slate-500">4 sensores monitoreados</span>
          </div>

          <div className="space-y-2">
            {(androidThermal?.thermalZones || []).map((zone, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 bg-slate-900/60 rounded border border-slate-800/80 text-xs"
              >
                <div className="font-mono text-slate-300 truncate max-w-[200px]">{zone.zone}</div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        zone.tempC >= thresholds.thermalCriticalC
                          ? 'bg-rose-500'
                          : zone.tempC >= thresholds.thermalWarningC
                          ? 'bg-amber-400'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (zone.tempC / 65) * 100)}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-slate-100 tabular-nums w-12 text-right">
                    {zone.tempC}°C
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ARM Topology & Android LMK Shield */}
        <div className="p-4 bg-slate-950/70 border border-slate-800/90 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
              Topología ARM y Protección LMK
            </span>
            <span className="text-[11px] font-mono text-slate-500">Android Kernel Watermark</span>
          </div>

          {/* LMK Safety Bar */}
          <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800/80 space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Margen Libre sobre MinFree OOM:</span>
              <span className="font-mono font-bold text-emerald-400 tabular-nums">
                {Math.max(0, latestFreeMb - (androidThermal?.lmkMinFreeMb || 384))} MB de colchón
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  latestFreeMb < (androidThermal?.lmkMinFreeMb || 384)
                    ? 'bg-rose-500'
                    : latestFreeMb < 700
                    ? 'bg-amber-400'
                    : 'bg-emerald-500'
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(10, ((latestFreeMb - 300) / (hardware?.totalRamGb ? hardware.totalRamGb * 1024 - 300 : 3000)) * 100)
                  )}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Si la memoria libre desciende por debajo de {androidThermal?.lmkMinFreeMb || 384} MB, el kernel Android matará los procesos en segundo plano. GENAION ajusta la memoria del modelo para nunca cruzar esta línea.
            </p>
          </div>

          {/* ARM Cluster Cores */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-0.5">
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400">Núcleos LITTLE</div>
              <div className="text-sm font-bold font-mono text-cyan-400 mt-0.5">
                {androidThermal?.clusterInfo.littleCores || 4}x A55
              </div>
              <div className="text-[9px] text-slate-500">Eficiencia</div>
            </div>
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400">Núcleos BIG</div>
              <div className="text-sm font-bold font-mono text-amber-400 mt-0.5">
                {androidThermal?.clusterInfo.bigCores || 3}x A78/710
              </div>
              <div className="text-[9px] text-slate-500">Rendimiento</div>
            </div>
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400">Núcleo PRIME</div>
              <div className="text-sm font-bold font-mono text-purple-400 mt-0.5">
                {androidThermal?.clusterInfo.primeCores ? '1x X-Core' : 'N/A'}
              </div>
              <div className="text-[9px] text-slate-500">Ráfaga Max</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
