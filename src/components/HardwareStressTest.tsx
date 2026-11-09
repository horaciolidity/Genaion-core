import React, { useState } from 'react';
import {
  Flame,
  Zap,
  Activity,
  Play,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Cpu,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { StressTestResult } from '../types';

interface HardwareStressTestProps {
  onTestComplete?: () => void;
  isARM?: boolean;
}

export const HardwareStressTest: React.FC<HardwareStressTestProps> = ({
  onTestComplete,
  isARM = true,
}) => {
  const [duration, setDuration] = useState<number>(5);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progressSeconds, setProgressSeconds] = useState<number>(0);
  const [result, setResult] = useState<StressTestResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const startStressTest = async () => {
    setIsRunning(true);
    setProgressSeconds(duration);
    setErrorMsg(null);
    setResult(null);

    // Live countdown timer ticker
    const timerInterval = setInterval(() => {
      setProgressSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const res = await fetch('/api/system/stress-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationSec: duration }),
      });

      if (!res.ok) {
        throw new Error('Error al ejecutar la prueba de estrés en el servidor.');
      }

      const data: StressTestResult = await res.json();
      setResult(data);

      if (onTestComplete) {
        onTestComplete();
      }
    } catch (err: any) {
      console.error('Error during stress test:', err);
      setErrorMsg(err.message || 'Fallo durante la ejecución de la prueba.');
    } finally {
      clearInterval(timerInterval);
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Prueba de Estrés de Hardware y Estabilidad a Plena Carga
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Somete la CPU y la memoria a una ráfaga computacional controlada para verificar la resistencia térmica antes de inferir modelos GGUF pesados.
          </p>
        </div>

        {/* Duration selector & Trigger button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            {[3, 5, 10].map((sec) => (
              <button
                key={sec}
                disabled={isRunning}
                onClick={() => setDuration(sec)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  duration === sec
                    ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sec}s {sec === 5 ? '(Móvil)' : sec === 10 ? '(PC)' : '(Rápida)'}
              </button>
            ))}
          </div>

          <button
            onClick={startStressTest}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-wait'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 shadow-sm'
            }`}
          >
            {isRunning ? (
              <>
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>Ejecutando ({progressSeconds}s)...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Iniciar Test de Estrés</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress state banner while running */}
      {isRunning && (
        <div className="p-4 bg-amber-950/20 border border-amber-500/40 rounded-xl space-y-2 animate-pulse">
          <div className="flex items-center justify-between text-xs text-amber-300 font-medium">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
              Ráfaga de cálculo matricial intensivo en curso...
            </span>
            <span className="font-mono tabular-nums">{progressSeconds}s restantes</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
              style={{
                width: `${Math.round(((duration - progressSeconds) / duration) * 100)}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Observa el gráfico de Recharts arriba y el avatar facial: reflejarán el pico de uso de CPU y el incremento de temperatura de unión.
          </p>
        </div>
      )}

      {/* Error display */}
      {errorMsg && (
        <div className="p-3 bg-rose-950/30 border border-rose-500/50 rounded-lg text-xs text-rose-300">
          {errorMsg}
        </div>
      )}

      {/* Results Summary Card */}
      {result && !isRunning && (
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Dictamen del Test de Estrés ({result.durationSec}s de Carga Plena)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400">Puntuación:</span>
              <span
                className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${
                  result.stabilityScore >= 90
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {result.stabilityScore} / 100
              </span>
            </div>
          </div>

          {/* Verdict description */}
          <div
            className={`p-3 rounded-lg border text-xs leading-relaxed ${
              result.status === 'SUCCESS'
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
            }`}
          >
            <div className="font-semibold mb-0.5">Diagnóstico de Capacidad:</div>
            <div>{result.stabilityVerdict}</div>
          </div>

          {/* Comparative Baseline vs Peak Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* CPU Delta */}
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800/80 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Carga CPU (Base &rarr; Pico)</div>
              <div className="text-base font-bold font-mono text-cyan-400 tabular-nums">
                {result.baselineCpu}% &rarr; {result.peakCpu}%
              </div>
              <div className="text-[10px] text-slate-500">
                Pico alcanzado a plena potencia
              </div>
            </div>

            {/* Thermal Delta */}
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800/80 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Térmica SoC (Base &rarr; Pico)</div>
              <div className="text-base font-bold font-mono text-amber-400 tabular-nums">
                {result.baselineTemp}°C &rarr; {result.peakTemp}°C
              </div>
              <div className="text-[10px] text-slate-500">
                Incremento: +{result.tempDelta}°C
              </div>
            </div>

            {/* RAM Footprint */}
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800/80 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Consumo RAM</div>
              <div className="text-base font-bold font-mono text-purple-400 tabular-nums">
                {result.peakRamGb} GB
              </div>
              <div className="text-[10px] text-slate-500">
                Colchón LMK: {result.lmkRiskMarginMb} MB libres
              </div>
            </div>

            {/* Throttling State */}
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800/80 space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Throttling Térmico</div>
              <div
                className={`text-base font-bold font-mono tabular-nums ${
                  result.thermalThrottlingTriggered ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {result.thermalThrottlingTriggered ? 'Activado (48°C+)' : 'No Detectado'}
              </div>
              <div className="text-[10px] text-slate-500">
                {result.thermalThrottlingTriggered ? 'Governor redujo hilos' : 'Sin pérdida de frecuencia'}
              </div>
            </div>
          </div>

          {/* Audit Log Confirmation footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Resultado registrado permanentemente en audit_log (SQLite)</span>
            </span>
            <span className="text-slate-500">
              Hora de registro: {new Date(result.completedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
