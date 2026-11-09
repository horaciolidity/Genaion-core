import React from 'react';
import { Cpu, HardDrive, ShieldCheck, Zap, Activity, RefreshCw, Smartphone, Server } from 'lucide-react';
import { SystemStatus, AuditLogItem } from '../types';
import { AndroidSystemMonitor } from './AndroidSystemMonitor';
import { HardwareStressTest } from './HardwareStressTest';
import { GenaionFace } from './GenaionFace';
import emblemImg from '../assets/images/genaion_core_emblem_1794264434067.jpg';

interface TelemetryViewProps {
  status: SystemStatus | null;
  auditLogs: AuditLogItem[];
  onRefresh: () => void;
  onChangeProfile: (profile: string) => void;
  onNavigate: (tab: string) => void;
  isInferring?: boolean;
}

export const TelemetryView: React.FC<TelemetryViewProps> = ({
  status,
  auditLogs,
  onRefresh,
  onChangeProfile,
  onNavigate,
  isInferring = false,
}) => {
  if (!status) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        <span>Sincronizando telemetría del núcleo GENAION...</span>
      </div>
    );
  }

  const { hardware, identity, brain, stats } = status;

  return (
    <div className="space-y-6">
      {/* Hero Core Banner */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 md:p-6 backdrop-blur-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <GenaionFace
              systemState={identity.state}
              cpuLoadPercent={hardware.usedRamPercent}
              temperatureC={hardware.temperatureC || 38}
              thermalState={hardware.thermalState || 'normal'}
              isInferring={isInferring}
              size="md"
            />
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <span>Versión {identity.version}</span>
                <span aria-hidden="true">·</span>
                <span>Fase 1: Core 0.1</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-medium">100% Autónomo Local</span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                {identity.name} — Centro de Telemetría
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                {identity.motto}. Núcleo soberano configurado para inferencia sin conexión a Internet,
                respetando la memoria física y la autonomía de batería de dispositivos Android y edge.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('chat')}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap"
            >
              Abrir Inferencia
            </button>
            <button
              onClick={onRefresh}
              className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors"
              title="Actualizar telemetría"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hardware Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* RAM Status */}
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Memoria RAM Física
            </span>
            <span className="font-mono tabular-nums">{hardware.usedRamPercent}%</span>
          </div>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            {hardware.freeRamGb} <span className="text-xs font-sans text-slate-400 font-normal">GB libres / {hardware.totalRamGb} GB</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                hardware.usedRamPercent > 85 ? 'bg-rose-500' : hardware.usedRamPercent > 65 ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
              style={{ width: `${hardware.usedRamPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Límite seguro: {hardware.tier === 'low_power_mobile' ? '1.5 GB GGUF' : '3.5 GB GGUF'}
          </p>
        </div>

        {/* CPU Cores & Arch */}
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Procesamiento CPU
            </span>
            <span className="font-mono">{hardware.arch}</span>
          </div>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            {hardware.cpuCores} <span className="text-xs font-sans text-slate-400 font-normal">Núcleos ({hardware.recommendedThreads} hilos rec.)</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 truncate font-mono">
            {hardware.cpuModel}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Plataforma: {hardware.platform} · {hardware.isArm ? 'ARM Nativo' : 'x86_64'}
          </p>
        </div>

        {/* Brain Model Active */}
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Motor Activo
            </span>
            <span className="text-[11px] text-slate-500">GGUF / Llama</span>
          </div>
          <div className="text-sm font-semibold text-white truncate" title={brain.activeModelName}>
            {brain.activeModelName}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Contexto: <span className="font-mono font-medium text-slate-200">{hardware.maxContext}</span> tokens
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-cyan-400">
            <button onClick={() => onNavigate('models')} className="hover:underline">
              Administrar modelos &rarr;
            </button>
          </div>
        </div>

        {/* Memory Vault (SQLite) */}
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-purple-400" />
              Bóveda SQLite
            </span>
            <span className="text-emerald-400 font-mono text-[11px]">WAL / FTS5</span>
          </div>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            {stats.messages} <span className="text-xs font-sans text-slate-400 font-normal">mensajes</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
            <span>{stats.conversations} chats</span>
            <span aria-hidden="true">·</span>
            <span>{stats.longTermFacts} hechos</span>
            <span aria-hidden="true">·</span>
            <span>{stats.documents} docs</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-cyan-400">
            <button onClick={() => onNavigate('memory')} className="hover:underline">
              Explorar memoria &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Live System Monitoring with Recharts (Android Termux) */}
      <AndroidSystemMonitor hardware={hardware} onRefreshParent={onRefresh} />

      {/* Hardware Peak Load Stress Test */}
      <HardwareStressTest onTestComplete={onRefresh} isARM={hardware.isArm} />

      {/* Hardware Profile Controller */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              Perfil de Hardware y Contención de Recursos
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Adapta la carga computacional según el dispositivo de ejecución actual.
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Nivel activo: <span className="text-cyan-400 font-semibold">{hardware.tier}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            {
              id: 'auto',
              name: 'Auto-Detección',
              desc: 'Detecta RAM y CPU automáticamente',
            },
            {
              id: 'android_4gb',
              name: 'Android Modesto (≤ 4GB)',
              desc: 'Hilos reducidos, contexto 1024, modelos ligeros',
            },
            {
              id: 'mobile_8gb',
              name: 'Móvil Equilibrado (6-8GB)',
              desc: 'Contexto 2048, modelos 1B-2B Q4_K_M',
            },
            {
              id: 'pc_server',
              name: 'PC / Servidor (12GB+)',
              desc: 'Contexto 4096+, máxima velocidad de hilos',
            },
          ].map((prof) => (
            <button
              key={prof.id}
              onClick={() => onChangeProfile(prof.id)}
              className={`text-left p-3 rounded-lg border transition-all ${
                hardware.activeProfile === prof.id
                  ? 'bg-slate-800 border-cyan-500/60 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-semibold text-slate-200">{prof.name}</div>
              <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">{prof.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Security Audit Log Stream */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Registro de Auditoría y Seguridad</h2>
          </div>
          <span className="text-[11px] text-slate-500">Últimas acciones registradas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-medium">
                <th className="pb-2">Hora</th>
                <th className="pb-2">Módulo</th>
                <th className="pb-2">Acción</th>
                <th className="pb-2">Detalles</th>
                <th className="pb-2 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {auditLogs.slice(0, 8).map((log) => (
                <tr key={log.id} className="text-slate-300 hover:bg-slate-800/30">
                  <td className="py-2 text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp * 1000).toLocaleTimeString()}
                  </td>
                  <td className="py-2 text-cyan-400 whitespace-nowrap">{log.module}</td>
                  <td className="py-2 text-slate-200 whitespace-nowrap">{log.action}</td>
                  <td className="py-2 text-slate-400 font-sans max-w-md truncate">{log.details}</td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <span
                      className={
                        log.status === 'SUCCESS' || log.status === 'AUTHORIZED'
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
