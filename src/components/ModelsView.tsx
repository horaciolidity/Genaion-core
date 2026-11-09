import React, { useState } from 'react';
import { Cpu, HardDrive, Download, Check, AlertCircle, RefreshCw, Power, Sliders, Copy } from 'lucide-react';
import { GGUFModel, CuratedModel, HardwareStats } from '../types';

interface ModelsViewProps {
  installedModels: GGUFModel[];
  curatedCatalog: CuratedModel[];
  activeModel: { fileName: string | null } | null;
  hardware: HardwareStats | null;
  onActivateModel: (fileName: string | null) => void;
  onRefresh: () => void;
}

export const ModelsView: React.FC<ModelsViewProps> = ({
  installedModels,
  curatedCatalog,
  activeModel,
  hardware,
  onActivateModel,
  onRefresh,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [contextLength, setContextLength] = useState(hardware?.maxContext || 2048);
  const [threads, setThreads] = useState(hardware?.recommendedThreads || 4);

  const handleCopyCommand = (url: string, fileName: string, id: string) => {
    const cmd = `curl -L -o models/${fileName} "${url}"`;
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Administrador de Modelos GGUF & llama.cpp
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Control de modelos cuantizados locales. El sistema evalúa la RAM física disponible (
            <span className="font-mono text-slate-200">{hardware?.freeRamGb || 2} GB</span> libres) para evitar
            cierres forzados por falta de memoria (OOM) en Android.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors whitespace-nowrap self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Escanear Directorio models/</span>
        </button>
      </div>

      {/* Installed Local Models Section */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Modelos Instalados Localmente ({installedModels.length})
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Ruta: ./models/*.gguf</span>
        </div>

        {installedModels.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-800 rounded-lg text-slate-400 space-y-2">
            <HardDrive className="w-6 h-6 mx-auto text-slate-500" />
            <p className="text-xs font-medium text-slate-300">
              No se detectaron archivos .gguf en la carpeta <code>models/</code>
            </p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              GENAION opera actualmente con el motor soberano local incorporado. Puedes descargar cualquiera de los
              modelos recomendados abajo directamente desde tu terminal de Termux.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {installedModels.map((m) => (
              <div
                key={m.fileName}
                className={`p-4 rounded-xl border transition-all ${
                  m.isActive
                    ? 'bg-slate-800/90 border-cyan-500 shadow-sm'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white truncate max-w-[220px]" title={m.fileName}>
                      {m.fileName}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono">
                      <span>{m.sizeMb} MB</span>
                      <span>·</span>
                      <span>RAM necesaria: ~{m.estimatedRamNeededGb} GB</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onActivateModel(m.isActive ? null : m.fileName)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors ${
                      m.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{m.isActive ? 'Activo' : 'Activar'}</span>
                  </button>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className={m.isCompatible ? 'text-emerald-400' : 'text-amber-400'}>
                    {m.isCompatible ? '✓ Compatible con RAM actual' : '⚠ Riesgo de memoria en Android'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Curated GGUF Model Catalog */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <div className="mb-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Catálogo de Modelos Abiertos Optimizados para Móvil
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Modelos ligeros cuantizados a 4 bits probados para ejecutar en CPU de teléfonos Android sin sobrecalentamiento.
          </p>
        </div>

        <div className="space-y-3">
          {curatedCatalog.map((model) => (
            <div
              key={model.id}
              className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{model.name}</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {model.quantization} · {model.parameters}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{model.recommendedFor}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                  <span>Tamaño: {model.sizeMb} MB</span>
                  <span>·</span>
                  <span>RAM mín: {model.minRamGb} GB</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopyCommand(model.downloadUrl, model.fileName, model.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
                  title="Copiar comando curl para descargar en Termux"
                >
                  {copiedId === model.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Comando Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar comando Termux</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inference Parameters Customizer */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Parámetros de Inferencia de llama.cpp
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Temperatura</span>
              <span className="font-mono text-slate-200">{temperature}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Top-P</span>
              <span className="font-mono text-slate-200">{topP}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={topP}
              onChange={(e) => setTopP(parseFloat(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Ventana de Contexto</span>
              <span className="font-mono text-slate-200">{contextLength}</span>
            </div>
            <input
              type="range"
              min="512"
              max="4096"
              step="256"
              value={contextLength}
              onChange={(e) => setContextLength(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Hilos de CPU</span>
              <span className="font-mono text-slate-200">{threads}</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={threads}
              onChange={(e) => setThreads(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
