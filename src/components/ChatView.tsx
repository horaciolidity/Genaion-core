import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Trash2, Cpu, Wrench, BookOpen, ThumbsDown, Check, CornerDownLeft, Loader2 } from 'lucide-react';
import { Conversation, Message } from '../types';
import { GenaionFace } from './GenaionFace';

interface ChatViewProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  activeModelName: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onSendMessage: (prompt: string) => void;
  onSubmitCorrection: (prompt: string, original: string, corrected: string, reason: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversations,
  activeConversationId,
  messages,
  isLoading,
  activeModelName,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onSendMessage,
  onSubmitCorrection,
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [correctingMessageId, setCorrectingMessageId] = useState<string | null>(null);
  const [correctionText, setCorrectionText] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctionSent, setCorrectionSent] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isLoading) return;
    onSendMessage(inputPrompt);
    setInputPrompt('');
  };

  const handleOpenCorrection = (msg: Message) => {
    setCorrectingMessageId(msg.id);
    setCorrectionText(msg.content);
    setCorrectionReason('');
    setCorrectionSent(false);
  };

  const handleSendCorrection = (originalMessage: Message) => {
    // Find preceding user prompt
    const msgIndex = messages.findIndex((m) => m.id === originalMessage.id);
    const userPrompt = msgIndex > 0 ? messages[msgIndex - 1].content : 'Instrucción anterior';
    onSubmitCorrection(userPrompt, originalMessage.content, correctionText, correctionReason);
    setCorrectionSent(true);
    setTimeout(() => {
      setCorrectingMessageId(null);
      setCorrectionSent(false);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-140px)] min-h-[580px]">
      {/* Conversations Sidebar (Hidden on mobile or compact) */}
      <div className="hidden md:flex flex-col bg-slate-900/50 border border-slate-800 rounded-xl p-3 overflow-hidden">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-300">Conversaciones</span>
          <button
            onClick={onNewConversation}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors"
            title="Nuevo chat"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {conversations.length === 0 ? (
            <p className="text-xs text-slate-500 p-2">Sin conversaciones aún.</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                  activeConversationId === conv.id
                    ? 'bg-slate-800 text-white font-medium border border-slate-700/80'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
                onClick={() => onSelectConversation(conv.id)}
              >
                <span className="truncate pr-2">{conv.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-opacity"
                  title="Eliminar conversación"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 mt-auto border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Motor: {activeModelName.slice(0, 15)}...</span>
        </div>
      </div>

      {/* Main Chat Feed */}
      <div className="md:col-span-3 flex flex-col bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        {/* Chat Header */}
        <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <GenaionFace
              isInferring={isLoading}
              size="sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Inferencia Soberana
                </span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-slate-400 truncate max-w-[200px]">
                  {activeModelName}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                {isLoading ? 'Coordinando razonamiento en tiempo real...' : 'Entidad viva · Atenta al cursor'}
              </div>
            </div>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onNewConversation}
              className="p-1.5 text-xs text-slate-950 bg-cyan-400 rounded font-semibold"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-4">
              <div className="p-3 bg-slate-800/80 rounded-full border border-slate-700">
                <Cpu className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  GENAION está listo para procesar instrucciones
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Ejecución local, sin APIs comerciales, con persistencia en SQLite y soporte para modelos GGUF.
                </p>
              </div>

              {/* Quick Prompt Starters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full text-left pt-2">
                {[
                  '¿Quién eres y cuál es tu propósito?',
                  '¿Cómo me instalo en Android con Termux?',
                  '¿Cuánto es 48 * 26 + 140?',
                  '¿Qué modelos GGUF me recomiendas para 4GB de RAM?',
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(prompt)}
                    className="p-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] md:max-w-[80%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-cyan-600/90 text-white shadow-sm'
                      : 'bg-slate-800/90 border border-slate-700/60 text-slate-200 shadow-sm'
                  }`}
                >
                  {/* Skill Execution Badge */}
                  {msg.skillExecuted && (
                    <div className="mb-2.5 pb-2 border-b border-slate-700/60 flex items-start gap-1.5 text-xs text-amber-300">
                      <Wrench className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">{msg.skillExecuted.name}: </span>
                        <span>{msg.skillExecuted.output}</span>
                      </div>
                    </div>
                  )}

                  {/* Recalled Memory Facts */}
                  {msg.recalledFacts && msg.recalledFacts.length > 0 && (
                    <div className="mb-2 pb-1.5 border-b border-slate-700/40 text-[11px] text-cyan-300/90 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>
                        Memoria recuperada: {msg.recalledFacts.map((f) => f.key).join(', ')}
                      </span>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Assistant Footer Info */}
                  {msg.role === 'assistant' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{msg.model || activeModelName}</span>
                      <div className="flex items-center gap-2">
                        {msg.tokens ? <span>{msg.tokens} tokens</span> : null}
                        <button
                          onClick={() => handleOpenCorrection(msg)}
                          className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-0.5"
                          title="Corregir respuesta para el dataset de aprendizaje"
                        >
                          <ThumbsDown className="w-3 h-3" />
                          <span className="font-sans">Corregir</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Correction Form Dropdown */}
                {correctingMessageId === msg.id && (
                  <div className="mt-2 w-full max-w-lg p-3 bg-slate-900 border border-amber-500/40 rounded-xl space-y-2 text-xs">
                    <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                      <span>Registrar Corrección de Aprendizaje</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Esta corrección se guardará en la base de datos de aprendizaje de GENAION
                      para mejorar el contexto y preparar futuros afinamientos.
                    </p>
                    <textarea
                      rows={3}
                      value={correctionText}
                      onChange={(e) => setCorrectionText(e.target.value)}
                      placeholder="Escribe la respuesta ideal..."
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                    <input
                      type="text"
                      value={correctionReason}
                      onChange={(e) => setCorrectionReason(e.target.value)}
                      placeholder="Motivo de la corrección (ej: dato inexacto, formato)"
                      className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setCorrectingMessageId(null)}
                        className="px-2.5 py-1 text-slate-400 hover:text-slate-200"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSendCorrection(msg)}
                        disabled={correctionSent}
                        className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded"
                      >
                        {correctionSent ? <Check className="w-3.5 h-3.5" /> : null}
                        <span>{correctionSent ? 'Guardado' : 'Guardar Corrección'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 p-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>GENAION coordinando inferencia local...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 focus-within:border-cyan-500/80 transition-colors">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Instrucción para GENAION..."
              disabled={isLoading}
              className="flex-1 bg-transparent py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="p-1.5 text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
              title="Enviar instrucción"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
