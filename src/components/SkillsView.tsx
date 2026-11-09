import React, { useState } from 'react';
import { Wrench, Shield, CheckCircle, XCircle, Play, Code, Calculator, Activity, Cpu } from 'lucide-react';
import { SkillManifest } from '../types';

interface SkillsViewProps {
  skills: SkillManifest[];
  onToggleSkill: (id: string, active: boolean) => void;
  onExecuteSkill: (skillId: string, params: any) => Promise<any>;
}

export const SkillsView: React.FC<SkillsViewProps> = ({ skills, onToggleSkill, onExecuteSkill }) => {
  const [selectedSkillId, setSelectedSkillId] = useState<string>('skill_math_solver');
  const [testParam, setTestParam] = useState<string>('sqrt(144) * 8 + 4');
  const [testToken, setTestToken] = useState<string>('');
  const [testOutput, setTestOutput] = useState<any>(null);
  const [running, setRunning] = useState(false);

  const handleTestRun = async () => {
    setRunning(true);
    try {
      let params: any = {};
      if (selectedSkillId === 'skill_math_solver') {
        params = { expression: testParam };
      } else if (selectedSkillId === 'skill_code_sandbox') {
        params = { code: testParam };
      } else if (selectedSkillId === 'skill_robotics_interlock') {
        params = { command: testParam, token: testToken };
      }
      const res = await onExecuteSkill(selectedSkillId, params);
      setTestOutput(res);
    } catch (e: any) {
      setTestOutput({ status: 'error', error: e.message });
    } finally {
      setRunning(false);
    }
  };

  const handleSelectSkillForTest = (skillId: string) => {
    setSelectedSkillId(skillId);
    setTestOutput(null);
    if (skillId === 'skill_math_solver') {
      setTestParam('sqrt(144) * 8 + 4');
    } else if (skillId === 'skill_code_sandbox') {
      setTestParam('[x * 2 for x in [1, 2, 3, 4, 5]]');
    } else if (skillId === 'skill_system_diag') {
      setTestParam('');
    } else if (skillId === 'skill_robotics_interlock') {
      setTestParam('spin motor 1 at 2500rpm and arm drone rotors');
      setTestToken('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Wrench className="w-4 h-4 text-cyan-400" />
          Matriz de Habilidades y Herramientas Modulares
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Cada habilidad opera como un módulo autocontenido con permisos declarados, configuración independiente y
          mecanismo de ejecución y auto-prueba.
        </p>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className={`p-4 rounded-xl border transition-all ${
              selectedSkillId === skill.id
                ? 'bg-slate-900 border-cyan-500 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{skill.name}</span>
                  <span className="text-[11px] text-slate-500 font-mono">v{skill.version}</span>
                </div>
                <div className="text-[11px] text-cyan-400 font-mono mt-0.5 uppercase">{skill.category}</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleSkill(skill.id, !skill.isActive)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    skill.isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {skill.isActive ? 'Activa' : 'Desactivada'}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{skill.description}</p>

            {skill.permissions.length > 0 && (
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-slate-500">
                <Shield className="w-3 h-3 text-amber-400" />
                <span>Permisos: {skill.permissions.join(', ')}</span>
              </div>
            )}

            <div className="mt-3 flex justify-end">
              <button
                onClick={() => handleSelectSkillForTest(skill.id)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Probar en banco de pruebas &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Skill Sandbox Testbed */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Banco de Pruebas de Habilidades en Vivo
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Habilidad seleccionada: {selectedSkillId}</span>
        </div>

        <div className="space-y-3">
          {selectedSkillId !== 'skill_system_diag' && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                {selectedSkillId === 'skill_robotics_interlock'
                  ? 'Comando físico / Orden a actuador:'
                  : selectedSkillId === 'skill_code_sandbox'
                  ? 'Código o expresión Python para sandbox:'
                  : 'Expresión matemática:'}
              </label>
              <input
                type="text"
                value={testParam}
                onChange={(e) => setTestParam(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          )}

          {selectedSkillId === 'skill_robotics_interlock' && (
            <div>
              <label className="block text-xs text-amber-400 mb-1">
                Token de confirmación humana (Ingresa "GENAION-CONFIRM" para autorizar):
              </label>
              <input
                type="text"
                value={testToken}
                onChange={(e) => setTestToken(e.target.value)}
                placeholder="GENAION-CONFIRM"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleTestRun}
              disabled={running}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{running ? 'Ejecutando...' : 'Ejecutar Habilidad'}</span>
            </button>
          </div>

          {testOutput && (
            <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs">
              <div className="text-[11px] text-slate-500 mb-1">Salida de ejecución en tiempo real:</div>
              <pre className="text-emerald-400 whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(testOutput, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
