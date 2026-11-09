import React from 'react';
import { Cpu, Terminal, Shield, Download, Menu, X } from 'lucide-react';
import emblemImg from '../assets/images/genaion_core_emblem_1794264434067.jpg';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onExportProject: () => void;
  activeModelName: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  onExportProject,
  activeModelName,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src={emblemImg}
            alt="GENAION Core Emblem"
            className="w-8 h-8 rounded-full border border-slate-700/60 object-cover shadow-sm shrink-0"
          />
          <button
            onClick={() => setActiveTab('telemetry')}
            className="text-left group flex flex-col focus:outline-none"
          >
            <span className="text-base font-extrabold tracking-wider text-slate-100 group-hover:text-cyan-400 transition-colors whitespace-nowrap">
              GENAION
            </span>
          </button>
        </div>

        {/* Zone 2: 4-5 Clean Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'telemetry' ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Telemetría
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'chat' ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Inferencia Local
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'models' ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Modelos GGUF
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'memory' ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Bóveda SQLite
          </button>
          <button
            onClick={() => setActiveTab('learning')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'learning' ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Aprendizaje
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'skills' ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Habilidades
          </button>
          <button
            onClick={() => setActiveTab('termux')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'termux' ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Android Termux
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onExportProject}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar GENAION</span>
            <span className="sm:hidden">Código</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-md transition-colors"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation for Android touch screens */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
          {[
            { id: 'telemetry', label: 'Telemetría' },
            { id: 'chat', label: 'Inferencia' },
            { id: 'models', label: 'Modelos GGUF' },
            { id: 'memory', label: 'Bóveda SQLite' },
            { id: 'learning', label: 'Aprendizaje' },
            { id: 'skills', label: 'Habilidades' },
            { id: 'termux', label: 'Android Termux' },
            { id: 'codebase', label: 'Código Python' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 rounded-md transition-colors ${
                activeTab === item.id
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
