import React, { useState } from 'react';
import { Folder, FileCode, Copy, Check, Download, ExternalLink } from 'lucide-react';
import { ProjectFile } from '../types';

interface CodebaseViewProps {
  files: ProjectFile[];
  onDownloadBundle: () => void;
}

export const CodebaseView: React.FC<CodebaseViewProps> = ({ files, onDownloadBundle }) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const selectedFile = files[selectedFileIndex] || null;

  const handleCopyCode = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleFile = (file: ProjectFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.path.split('/').pop() || 'file.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Folder className="w-4 h-4 text-cyan-400" />
            Explorador del Repositorio GENAION (Python)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Estructura modular completa de {files.length} archivos ejecutables preparados para git, Termux y servidores.
          </p>
        </div>

        <button
          onClick={onDownloadBundle}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Descargar Paquete Completo (JSON/Código)</span>
        </button>
      </div>

      {/* Explorer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[600px]">
        {/* File tree */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 overflow-y-auto space-y-1 text-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
            Archivos del Proyecto
          </div>
          {files.map((file, idx) => (
            <button
              key={file.path}
              onClick={() => setSelectedFileIndex(idx)}
              className={`w-full text-left p-2 rounded-lg flex items-center gap-2 transition-colors ${
                selectedFileIndex === idx
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate font-mono text-[11px]">{file.path}</span>
            </button>
          ))}
        </div>

        {/* Code viewer */}
        <div className="md:col-span-3 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
          {selectedFile ? (
            <>
              <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">{selectedFile.path}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500">{selectedFile.size} bytes</span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  <button
                    onClick={() => handleDownloadSingleFile(selectedFile)}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Descargar este archivo"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed">
                <pre className="whitespace-pre">{selectedFile.content}</pre>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              Selecciona un archivo para previsualizarlo
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
