# ARQUITECTURA TÉCNICA DE GENAION

> **THE ORIGIN OF INTELLIGENT CREATION**  
> *Versión 0.1.0 — Núcleo Soberano Modular*

## 1. Visión y Desacoplamiento

GENAION fue concebido para romper la dependencia de APIs centralizadas y de pago. La plataforma no es un simple envoltorio (wrapper), sino un sistema operativo cognitivo modular que desacopla tres capas críticas:

1. **Capa de Modelo (Inferencia)**: Intercambiable en caliente (GGUF cuantizado vía llama.cpp o motor embebido soberano).
2. **Capa de Memoria**: Persistente, determinista y estructurada en SQLite con FTS5 (Full-Text Search), independiente de los pesos del LLM.
3. **Capa de Habilidades y Dispositivos**: Módulos con permisos y contención estricta que impiden la ejecución de comandos físicos destructivos sin confirmación humana.

---

## 2. Diagrama de Módulos

```
                 ┌─────────────────────────────────┐
                 │       GENAION CORE 0.1          │
                 │   (Orquestador y Planificador)  │
                 └───────────────┬─────────────────┘
                                 │
     ┌───────────────────┬───────┴──────────┬───────────────────┐
     │                   │                  │                   │
┌────▼────────┐  ┌───────▼───────┐  ┌───────▼───────┐  ┌────────▼──────┐
│GENAION BRAIN│  │GENAION MEMORY │  │GENAION SKILLS │  │GENAION LEARN  │
│  llama.cpp  │  │ SQLite + FTS5 │  │ Sandbox/Math/ │  │ Ingesta Docs/ │
│ GGUF Runner │  │ Conversaciones│  │  Interlock    │  │ Correcciones  │
└─────────────┘  └───────────────┘  └───────────────┘  └───────────────┘
         │               │                  │                   │
┌────────▼────┐  ┌───────▼───────┐  ┌───────▼───────┐  ┌────────▼──────┐
│  HARDWARE   │  │ AUDIT & PERMS │  │ DEVICE ADAPT  │  │  PERCEPTION   │
│  PROFILER   │  │  Seguridad y  │  │ Android HAL / │  │ Whisper / STT │
│ RAM/CPU/ARM │  │  Contención   │  │ Serial / MQTT │  │ TTS (Fase 4)  │
└─────────────┘  └───────────────┘  └───────────────┘  └───────────────┘
```

---

## 3. Respeto al Hardware y Contención Térmica

Para evitar que un teléfono Android sufra congelamientos o el kernel active el OOM-killer (Out-Of-Memory):
- **Perfil Móvil Modesto (≤ 4GB RAM)**: Limita el contexto a 1024 tokens y recomienda modelos GGUF Q4_K_M de ≤ 1.5GB (como SmolLM-360M o Qwen2.5-0.5B).
- **Perfil Equilibrado (6-8GB RAM)**: Contexto de 2048 tokens con modelos de 1.1B a 1.5B (TinyLlama-1.1B o Qwen2.5-1.5B).
- **Control de Hilos**: Limita `threads = CPU_CORES - 1` para no asfixiar el hilo del sistema operativo y mantener la pantalla responsiva.

---

## 4. Habilidades Integradas y Contención de Robótica

Cada habilidad hereda de `BaseSkill`:
- `skill_code_sandbox`: Ejecuta código algorítmico sin acceso a red ni llamadas destructivas del sistema.
- `skill_system_diag`: Inspecciona memoria física, hilos y CPU en tiempo real.
- `skill_math_solver`: Precisión determinista para operaciones aritméticas.
- `skill_robotics_interlock`: Bloquea órdenes a actuadores, motores, relés o drones a menos que se presente el token `GENAION-CONFIRM`.
