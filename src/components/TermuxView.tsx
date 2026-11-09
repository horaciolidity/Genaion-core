import React, { useState } from 'react';
import { Smartphone, Terminal, Copy, Check, ShieldAlert, Cpu, Download, ExternalLink } from 'lucide-react';
import { DeviceItem } from '../types';

interface TermuxViewProps {
  devices: DeviceItem[];
}

export const TermuxView: React.FC<TermuxViewProps> = ({ devices }) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const steps = [
    {
      title: 'Paso 1: Instalar Termux desde F-Droid',
      desc: 'IMPORTANTE: No uses la versión obsoleta de Google Play Store. Descarga Termux actualizado desde F-Droid.',
      command: '# Abre tu navegador en Android e instala Termux desde:\nhttps://f-droid.org/packages/com.termux/',
      isLink: true,
    },
    {
      title: 'Paso 2: Clonar o Transferir GENAION a tu Teléfono',
      desc: 'Copia los archivos a Termux o clona tu repositorio en el almacenamiento interno de tu móvil.',
      command: 'termux-setup-storage\ncd $HOME\ngit clone https://github.com/tu-usuario/GENAION.git\ncd GENAION',
    },
    {
      title: 'Paso 3: Ejecutar el Script Automatizado de Instalación',
      desc: 'El script instala Python, SQLite con soporte FTS5, Clang, CMake y compila dependencias nativas.',
      command: 'bash scripts/install_termux.sh',
    },
    {
      title: 'Paso 4: Descargar un Modelo GGUF Ligero (Opcional)',
      desc: 'SmolLM-360M (229MB) o Qwen2.5-0.5B (398MB) son ideales para teléfonos de 3GB-4GB de RAM.',
      command: 'curl -L -o models/qwen2.5-0.5b-instruct-q4_k_m.gguf "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf"',
    },
    {
      title: 'Paso 5: Iniciar el Núcleo GENAION',
      desc: 'Inicia el servidor local y accede desde Chrome o Firefox en tu teléfono en http://localhost:8080.',
      command: 'python3 main.py\n# O para modo consola interactiva:\npython3 main.py --cli',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            Guía de Despliegue en Android (Termux & Ubuntu proot)
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Instrucciones verificadas paso a paso para transformar cualquier teléfono Android moderno o modesto en un
            servidor de inteligencia artificial soberano.
          </p>
        </div>
      </div>

      {/* Step by Step Terminal Installation Strip */}
      <div className="space-y-4">
        {steps.map((s, idx) => (
          <div key={idx} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400">{s.title}</span>
              <button
                onClick={() => copyToClipboard(s.command, idx)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 bg-slate-800 hover:bg-slate-750 rounded transition-colors"
              >
                {copiedStep === idx ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-emerald-400 whitespace-pre-wrap overflow-x-auto">
              {s.command}
            </div>
          </div>
        ))}
      </div>

      {/* Connected & Edge Devices Hub */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              Adaptadores de Dispositivos y Sensores
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Protocolos de comunicación para robótica, microcontroladores y sensores del teléfono.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {devices.map((dev) => (
            <div
              key={dev.id}
              className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-lg flex items-start justify-between gap-3 text-xs"
            >
              <div>
                <div className="font-semibold text-white">{dev.name}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">Protocolo: {dev.protocol}</div>
                <div className="text-[10px] text-slate-500 mt-1 uppercase font-mono">Tipo: {dev.type}</div>
              </div>
              <span
                className={`text-[11px] font-mono shrink-0 ${
                  dev.status === 'ready' || dev.status === 'listening' ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                ● {dev.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
