/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TelemetryView } from './components/TelemetryView';
import { ChatView } from './components/ChatView';
import { ModelsView } from './components/ModelsView';
import { MemoryView } from './components/MemoryView';
import { LearningView } from './components/LearningView';
import { SkillsView } from './components/SkillsView';
import { TermuxView } from './components/TermuxView';
import { CodebaseView } from './components/CodebaseView';
import {
  SystemStatus,
  AuditLogItem,
  GGUFModel,
  CuratedModel,
  Conversation,
  Message,
  LongTermFact,
  IngestedDocument,
  CorrectionEntry,
  SkillManifest,
  DeviceItem,
  ProjectFile,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('telemetry');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [installedModels, setInstalledModels] = useState<GGUFModel[]>([]);
  const [curatedCatalog, setCuratedCatalog] = useState<CuratedModel[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [facts, setFacts] = useState<LongTermFact[]>([]);
  const [documents, setDocuments] = useState<IngestedDocument[]>([]);
  const [corrections, setCorrections] = useState<CorrectionEntry[]>([]);
  const [skills, setSkills] = useState<SkillManifest[]>([]);
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Initial Data Fetching
  const fetchAllData = async () => {
    try {
      // System status
      const resStatus = await fetch('/api/system/status');
      if (resStatus.ok) {
        const data = await resStatus.json();
        setStatus(data);
      }

      // Audit logs
      const resAudit = await fetch('/api/security/audit');
      if (resAudit.ok) {
        const data = await resAudit.json();
        setAuditLogs(data);
      }

      // Models
      const resModels = await fetch('/api/brain/models');
      if (resModels.ok) {
        const data = await resModels.json();
        setInstalledModels(data.installed || []);
        setCuratedCatalog(data.curatedCatalog || []);
      }

      // Conversations
      const resConvs = await fetch('/api/memory/conversations');
      if (resConvs.ok) {
        const data = await resConvs.json();
        setConversations(data);
        if (data.length > 0 && !activeConversationId) {
          setActiveConversationId(data[0].id);
          fetchMessages(data[0].id);
        }
      }

      // Facts
      const resFacts = await fetch('/api/memory/facts');
      if (resFacts.ok) {
        const data = await resFacts.json();
        setFacts(data);
      }

      // Documents
      const resDocs = await fetch('/api/learning/documents');
      if (resDocs.ok) {
        const data = await resDocs.json();
        setDocuments(data);
      }

      // Corrections
      const resCorrs = await fetch('/api/learning/corrections');
      if (resCorrs.ok) {
        const data = await resCorrs.json();
        setCorrections(data);
      }

      // Skills
      const resSkills = await fetch('/api/skills');
      if (resSkills.ok) {
        const data = await resSkills.json();
        setSkills(data);
      }

      // Devices
      const resDevs = await fetch('/api/devices');
      if (resDevs.ok) {
        const data = await resDevs.json();
        setDevices(data);
      }

      // Project files
      const resFiles = await fetch('/api/export/project-files');
      if (resFiles.ok) {
        const data = await resFiles.json();
        setProjectFiles(data.files || []);
      }
    } catch (e) {
      console.error('Error fetching data:', e);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/memory/conversations/${convId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error('Error fetching messages:', e);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handlers
  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId);
    fetchMessages(convId);
  };

  const handleNewConversation = async () => {
    try {
      const res = await fetch('/api/memory/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Nueva Conversación' }),
      });
      if (res.ok) {
        const newConv = await res.json();
        setConversations([newConv, ...conversations]);
        setActiveConversationId(newConv.id);
        setMessages([]);
        showToast('Nueva conversación creada');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    try {
      const res = await fetch(`/api/memory/conversations/${convId}`, { method: 'DELETE' });
      if (res.ok) {
        const remaining = conversations.filter((c) => c.id !== convId);
        setConversations(remaining);
        if (activeConversationId === convId) {
          if (remaining.length > 0) {
            setActiveConversationId(remaining[0].id);
            fetchMessages(remaining[0].id);
          } else {
            setActiveConversationId(null);
            setMessages([]);
          }
        }
        showToast('Conversación eliminada');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (prompt: string) => {
    setIsLoading(true);
    // Optimistic user message
    const tempUserMsg: Message = {
      id: `temp_${Date.now()}`,
      conversation_id: activeConversationId || 'pending',
      role: 'user',
      content: prompt,
      created_at: Date.now() / 1000,
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch('/api/brain/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversationId,
          prompt,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (!activeConversationId && data.conversationId) {
          setActiveConversationId(data.conversationId);
        }
        const assistantMsg: Message = {
          id: data.id,
          conversation_id: data.conversationId,
          role: 'assistant',
          content: data.content,
          model: data.model,
          tokens: data.tokens,
          created_at: data.timestamp / 1000,
          recalledFacts: data.recalledFacts,
          recalledDocs: data.recalledDocs,
          skillExecuted: data.skillExecuted,
        };
        setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, assistantMsg]);
        // Refresh conversations and audit
        fetchAllData();
      }
    } catch (e) {
      console.error('Error generating response:', e);
      showToast('Error en la inferencia local.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFact = async (category: string, key: string, value: string) => {
    try {
      const res = await fetch('/api/memory/facts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, key, value }),
      });
      if (res.ok) {
        showToast('Hecho guardado en memoria');
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteFact = async (id: string) => {
    try {
      const res = await fetch(`/api/memory/facts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFacts((prev) => prev.filter((f) => f.id !== id));
        showToast('Hecho eliminado de memoria');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportMemory = async () => {
    try {
      const res = await fetch('/api/memory/export');
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `genaion_memory_export_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Bóveda de memoria exportada');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleIngestDocument = async (title: string, content: string, topic: string) => {
    try {
      const res = await fetch('/api/learning/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, topic }),
      });
      if (res.ok) {
        showToast('Documento indexado con éxito');
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitCorrection = async (
    prompt: string,
    originalResponse: string,
    correctedResponse: string,
    reason: string
  ) => {
    try {
      const res = await fetch('/api/learning/corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, originalResponse, correctedResponse, reason }),
      });
      if (res.ok) {
        showToast('Corrección añadida al dataset de mejora');
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunEvaluation = async () => {
    const res = await fetch('/api/learning/evaluate', { method: 'POST' });
    if (res.ok) {
      return await res.json();
    }
    throw new Error('Falló la evaluación.');
  };

  const handleToggleSkill = async (id: string, active: boolean) => {
    try {
      const res = await fetch('/api/skills/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: active }),
      });
      if (res.ok) {
        setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: active } : s)));
        showToast(`Habilidad ${active ? 'activada' : 'desactivada'}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExecuteSkill = async (skillId: string, params: any) => {
    const res = await fetch('/api/skills/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillId, params }),
    });
    return await res.json();
  };

  const handleChangeProfile = async (profile: string) => {
    try {
      const res = await fetch('/api/system/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      if (res.ok) {
        showToast(`Perfil cambiado a ${profile}`);
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleActivateModel = async (fileName: string | null) => {
    try {
      const res = await fetch('/api/brain/models/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName }),
      });
      if (res.ok) {
        showToast(fileName ? `Modelo ${fileName} activado` : 'Modelo descargado de memoria');
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadBundle = () => {
    const manifest = {
      name: 'GENAION',
      version: '0.1.0',
      exportedAt: new Date().toISOString(),
      filesCount: projectFiles.length,
      files: projectFiles,
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GENAION_Complete_Source_v0.1.0.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Paquete completo de código exportado');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Header with Omnipresent Genius AI Entity */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onExportProject={handleDownloadBundle}
        activeModelName={status?.brain.activeModelName || 'GENAION Core'}
        isInferring={isLoading}
        systemState={status?.identity.state || 'READY'}
        cpuLoadPercent={status?.hardware.usedRamPercent || 20}
        temperatureC={status?.hardware.temperatureC || 38}
        thermalState={status?.hardware.thermalState || 'normal'}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {activeTab === 'telemetry' && (
          <TelemetryView
            status={status}
            auditLogs={auditLogs}
            onRefresh={fetchAllData}
            onChangeProfile={handleChangeProfile}
            onNavigate={(tab) => setActiveTab(tab)}
            isInferring={isLoading}
          />
        )}

        {activeTab === 'chat' && (
          <ChatView
            conversations={conversations}
            activeConversationId={activeConversationId}
            messages={messages}
            isLoading={isLoading}
            activeModelName={status?.brain.activeModelName || 'GENAION Core'}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
            onSendMessage={handleSendMessage}
            onSubmitCorrection={handleSubmitCorrection}
          />
        )}

        {activeTab === 'models' && (
          <ModelsView
            installedModels={installedModels}
            curatedCatalog={curatedCatalog}
            activeModel={status?.brain.activeModel || null}
            hardware={status?.hardware || null}
            onActivateModel={handleActivateModel}
            onRefresh={fetchAllData}
          />
        )}

        {activeTab === 'memory' && (
          <MemoryView
            facts={facts}
            conversations={conversations}
            auditLogs={auditLogs}
            onAddFact={handleAddFact}
            onDeleteFact={handleDeleteFact}
            onExportMemory={handleExportMemory}
          />
        )}

        {activeTab === 'learning' && (
          <LearningView
            documents={documents}
            corrections={corrections}
            onIngestDocument={handleIngestDocument}
            onRunEvaluation={handleRunEvaluation}
          />
        )}

        {activeTab === 'skills' && (
          <SkillsView
            skills={skills}
            onToggleSkill={handleToggleSkill}
            onExecuteSkill={handleExecuteSkill}
          />
        )}

        {activeTab === 'termux' && <TermuxView devices={devices} />}

        {activeTab === 'codebase' && (
          <CodebaseView files={projectFiles} onDownloadBundle={handleDownloadBundle} />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-cyan-500/60 text-slate-100 text-xs px-4 py-2.5 rounded-lg shadow-xl animate-fade-in font-medium">
          {toastMessage}
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 py-4 text-center text-xs text-slate-500 font-mono">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2">
          <span>GENAION · THE ORIGIN OF INTELLIGENT CREATION · Core v0.1.0</span>
          <span>Soberano · Local · SQLite · GGUF · Termux / Android</span>
        </div>
      </footer>
    </div>
  );
}
