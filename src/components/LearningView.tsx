import React, { useState } from 'react';
import { BookOpen, CheckCircle, AlertTriangle, Plus, Play, ThumbsUp, ThumbsDown, FileText, Award } from 'lucide-react';
import { IngestedDocument, CorrectionEntry } from '../types';

interface LearningViewProps {
  documents: IngestedDocument[];
  corrections: CorrectionEntry[];
  onIngestDocument: (title: string, content: string, topic: string) => void;
  onRunEvaluation: () => Promise<any>;
}

export const LearningView: React.FC<LearningViewProps> = ({
  documents,
  corrections,
  onIngestDocument,
  onRunEvaluation,
}) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'corrections' | 'evaluation'>('documents');

  // Ingest form state
  const [docTitle, setDocTitle] = useState('');
  const [docTopic, setDocTopic] = useState('robótica');
  const [docContent, setDocContent] = useState('');
  const [showIngestForm, setShowIngestForm] = useState(false);

  // Evaluation state
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<any>(null);

  const handleIngest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim()) return;
    onIngestDocument(docTitle.trim(), docContent.trim(), docTopic.trim());
    setDocTitle('');
    setDocContent('');
    setShowIngestForm(false);
  };

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const res = await onRunEvaluation();
      setEvalResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Strict Architectural Clarification */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Principio de Transparencia de Aprendizaje GENAION</span>
            </div>
            <h2 className="text-base font-bold text-white">
              Aprendizaje Continuo, Base de Conocimiento y Evaluación
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              La incorporación de documentos y correcciones enriquece la base de datos de contexto (RAG soberano) y
              construye el dataset para futuros entrenamientos mediante LoRA/QLoRA cuando el hardware lo permita.{' '}
              <span className="text-slate-200 font-medium">
                No se altera en caliente la matriz de pesos del modelo GGUF cuantizado.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Navigation segmented controls */}
      <div className="flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-lg self-start">
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'documents' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Documentos Locales ({documents.length})
        </button>
        <button
          onClick={() => setActiveTab('corrections')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'corrections' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Dataset de Correcciones ({corrections.length})
        </button>
        <button
          onClick={() => setActiveTab('evaluation')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'evaluation' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Pruebas de Evaluación (Benchmarks)
        </button>
      </div>

      {/* Tab: Documents */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Conocimientos indexados en SQLite para inyección contextual
            </span>
            <button
              onClick={() => setShowIngestForm(!showIngestForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Incorporar Documento</span>
            </button>
          </div>

          {showIngestForm && (
            <form onSubmit={handleIngest} className="bg-slate-900 border border-cyan-500/40 rounded-xl p-4 space-y-3">
              <div className="text-xs font-bold text-slate-200">Indexar Documento en Base de Conocimientos</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Título del documento o guía técnica"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  required
                />
                <select
                  value={docTopic}
                  onChange={(e) => setDocTopic(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="robótica">Robótica y Sensores</option>
                  <option value="programacion">Programación y Algoritmos</option>
                  <option value="dispositivos">Dispositivos y Microcontroladores</option>
                  <option value="arquitectura">Arquitectura del Sistema</option>
                  <option value="general">Conocimiento General</option>
                </select>
              </div>
              <textarea
                rows={4}
                placeholder="Contenido en texto plano o markdown que el sistema debe recordar..."
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowIngestForm(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg"
                >
                  Indexar Documento
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documents.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                No hay documentos indexados. Añade notas técnicas o guías para que GENAION las consulte durante la inferencia.
              </div>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-cyan-400 font-mono uppercase">{doc.topic}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{doc.file_size} bytes</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200">{doc.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 font-mono text-[11px] line-clamp-3">{doc.snippet}...</p>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex justify-between">
                    <span>Indexado en SQLite FTS5</span>
                    <span>{new Date(doc.created_at * 1000).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Corrections */}
      {activeTab === 'corrections' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Registro de respuestas corregidas por el usuario. Construye pares de preferencia (Positive/Negative) para
            alimentar datasets de calibración.
          </p>

          <div className="space-y-3">
            {corrections.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                No hay correcciones registradas aún. Puedes corregir cualquier respuesta desde el botón "Corregir" en el chat.
              </div>
            ) : (
              corrections.map((c) => (
                <div key={c.id} className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Prompt: "{c.prompt}"</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(c.created_at * 1000).toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-2.5 bg-rose-950/20 border border-rose-900/30 rounded-lg">
                      <div className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold mb-1">
                        <ThumbsDown className="w-3 h-3" />
                        <span>Respuesta Original (Descartada)</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{c.original_response}</p>
                    </div>

                    <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/30 rounded-lg">
                      <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mb-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span>Respuesta Corregida (Ideal)</span>
                      </div>
                      <p className="text-slate-200 text-[11px] leading-relaxed">{c.corrected_response}</p>
                    </div>
                  </div>
                  {c.reason && (
                    <div className="text-[11px] text-slate-400 font-mono">
                      Motivo: <span className="text-slate-300">{c.reason}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Evaluation Benchmarks */}
      {activeTab === 'evaluation' && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Suite de Evaluación Automatizada de Rendimiento
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verifica la fidelidad identitaria, razonamiento aritmético, arquitectura y despliegue del modelo activo.
              </p>
            </div>

            <button
              onClick={handleEvaluate}
              disabled={evaluating}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-colors shrink-0"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{evaluating ? 'Ejecutando Pruebas...' : 'Ejecutar Evaluación'}</span>
            </button>
          </div>

          {evalResult && (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Puntuación de Coherencia:</span>
                </div>
                <div className="text-lg font-bold font-mono text-cyan-400 tabular-nums">
                  {evalResult.scorePct}% ({evalResult.passed} de {evalResult.total} pruebas superadas)
                </div>
              </div>

              <div className="space-y-2">
                {evalResult.results.map((r: any) => (
                  <div
                    key={r.id}
                    className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-300">{r.prompt}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-1">Salida: {r.output}</div>
                    </div>
                    <span
                      className={`text-xs font-bold font-mono shrink-0 ${
                        r.passed ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {r.passed ? '✓ PASÓ' : '✗ FALLÓ'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
