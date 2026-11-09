import React, { useState } from 'react';
import { HardDrive, Search, Plus, Trash2, Download, Tag, BookOpen, Clock, ShieldCheck } from 'lucide-react';
import { LongTermFact, Conversation, AuditLogItem } from '../types';

interface MemoryViewProps {
  facts: LongTermFact[];
  conversations: Conversation[];
  auditLogs: AuditLogItem[];
  onAddFact: (category: string, key: string, value: string) => void;
  onDeleteFact: (id: string) => void;
  onExportMemory: () => void;
}

export const MemoryView: React.FC<MemoryViewProps> = ({
  facts,
  conversations,
  auditLogs,
  onAddFact,
  onDeleteFact,
  onExportMemory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'facts' | 'conversations' | 'audit'>('facts');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // New fact modal / form
  const [newCategory, setNewCategory] = useState('preferencias');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const categories = Array.from(new Set(facts.map((f) => f.category)));

  const filteredFacts = facts.filter((f) => {
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      f.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    onAddFact(newCategory.trim(), newKey.trim(), newValue.trim());
    setNewKey('');
    setNewValue('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-purple-400" />
            Bóveda de Memoria Persistente SQLite (FTS5)
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            La memoria de GENAION reside exclusivamente en el dispositivo, es completamente independiente del modelo LLM
            activo y persiste de forma determinista entre reinicios de la aplicación.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={onExportMemory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar JSON de Memoria</span>
          </button>
        </div>
      </div>

      {/* Sub-nav Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-lg self-start">
          <button
            onClick={() => setActiveSubTab('facts')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSubTab === 'facts' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hechos a Largo Plazo ({facts.length})
          </button>
          <button
            onClick={() => setActiveSubTab('conversations')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSubTab === 'conversations' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Conversaciones ({conversations.length})
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSubTab === 'audit' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Registro de Acciones
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar en la memoria..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Content depending on subTab */}
      {activeSubTab === 'facts' && (
        <div className="space-y-4">
          {/* Category filter pills & Add button */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1 text-xs text-slate-400">
              <span className="text-[11px] text-slate-500 mr-1">Filtrar:</span>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-purple-900/40 text-purple-300 border border-purple-700/60 font-semibold'
                    : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                    selectedCategory === cat
                      ? 'bg-purple-900/40 text-purple-300 border border-purple-700/60 font-semibold'
                      : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Hecho de Memoria</span>
            </button>
          </div>

          {/* Add Fact Form */}
          {showAddForm && (
            <form onSubmit={handleAddSubmit} className="bg-slate-900 border border-cyan-500/40 rounded-xl p-4 space-y-3">
              <div className="text-xs font-bold text-slate-200">Guardar Nuevo Hecho en Memoria de Largo Plazo</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Categoría (ej: preferencias, hardware, usuario)"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Clave (ej: idioma_preferido, modelo_favorito)"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Valor o hecho a recordar"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg"
                >
                  Guardar en SQLite
                </button>
              </div>
            </form>
          )}

          {/* Facts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredFacts.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                No se encontraron hechos que coincidan con la búsqueda.
              </div>
            ) : (
              filteredFacts.map((fact) => (
                <div
                  key={fact.id}
                  className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl flex flex-col justify-between hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] text-purple-400 font-mono flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {fact.category}
                      </span>
                      <button
                        onClick={() => onDeleteFact(fact.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Eliminar de memoria"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-xs font-bold text-slate-200">{fact.key}</div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{fact.value}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between font-mono">
                    <span>Confianza: {fact.confidence * 100}%</span>
                    <span>{new Date(fact.updated_at * 1000).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Conversations Tab */}
      {activeSubTab === 'conversations' && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <div className="space-y-3">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-lg flex items-center justify-between gap-4"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200">{conv.title}</div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 font-mono">
                    <span>ID: {conv.id}</span>
                    <span>·</span>
                    <span>Actualizado: {new Date(conv.updated_at * 1000).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeSubTab === 'audit' && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="pb-2">Fecha y Hora</th>
                  <th className="pb-2">Módulo</th>
                  <th className="pb-2">Acción</th>
                  <th className="pb-2">Detalles</th>
                  <th className="pb-2 text-right">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="text-slate-300">
                    <td className="py-2.5 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp * 1000).toLocaleString()}
                    </td>
                    <td className="py-2.5 text-cyan-400">{log.module}</td>
                    <td className="py-2.5 text-white">{log.action}</td>
                    <td className="py-2.5 text-slate-400 font-sans max-w-sm truncate">{log.details}</td>
                    <td className="py-2.5 text-right">
                      <span className={log.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
