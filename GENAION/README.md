# GENAION

> **THE ORIGIN OF INTELLIGENT CREATION**  
> *Sovereign · Local · Modular · Evolutionary*

GENAION es una plataforma y núcleo de inteligencia artificial autónoma, modular, local y evolutiva. Diseñada desde el primer principio para funcionar sin conexión a Internet, sin cuotas comerciales, sin APIs de pago y sin enviar datos privados a servidores externos.

Su primer entorno de ejecución es un teléfono Android (vía Termux o proot-distro con Ubuntu) y está estructurada para escalar hacia computadoras de escritorio, servidores locales, microcontroladores, robótica y drones.

---

## 1. Principios Fundamentales

- **Soberanía y Privacidad**: 100% de la inferencia y almacenamiento se ejecuta en el dispositivo local.
- **Independencia de Proveedores**: No requiere Gemini, OpenAI, Claude ni suscripciones periódicas.
- **Eficiencia y Adaptabilidad**: Detección real del hardware y perfiles de consumo para no colapsar la RAM ni la batería de teléfonos modestos.
- **Separación de Responsabilidades**: Memoria y base de conocimiento desacopladas del modelo LLM activo.
- **Sin Simulación Ficticia**: Todos los módulos, rutas y llamadas a bases de datos son código real y verificable.

---

## 2. Arquitectura del Sistema

```text
GENAION/
├── core/         # Núcleo coordinador, perfilador de hardware y configuraciones
├── brain/        # Gestor de modelos GGUF, integración llama.cpp y motor soberano
├── memory/       # Base de datos SQLite persistente con soporte FTS5 y exportación
├── learning/     # Ingesta de documentos, registro de correcciones y evaluación
├── skills/       # Sistema modular de habilidades (Sandbox, Diagnóstico, Matemáticas, Robótica)
├── perception/   # Interfaces preparadas para transcripción de audio, voz y visión
├── devices/      # Adaptadores para Android, Raspberry Pi, microcontroladores y drones
├── security/     # Contención de rutas, verificación de permisos y auditoría
├── scripts/      # Scripts de instalación nativos para Termux, Ubuntu y compilación
├── tests/        # Suite de pruebas unitarias y de integración
├── docs/         # Guías de arquitectura, modelos y despliegue
├── storage/      # Bases de datos y documentos locales
├── models/       # Directorio de modelos GGUF descargados por el usuario
├── main.py       # Punto de entrada unificado (Web local, CLI, Tests)
└── requirements.txt
```

---

## 3. Instalación Rápida en Android (Termux)

En tu teléfono Android con Termux instalado:

```bash
# 1. Clonar o copiar el repositorio
git clone <tu-repositorio-genaion>
cd GENAION

# 2. Ejecutar el script automatizado
bash scripts/install_termux.sh

# 3. Iniciar el sistema
python3 main.py
```

Abre el navegador en tu teléfono en: `http://localhost:8080` (o usa el modo consola con `python3 main.py --cli`).

---

## 4. Modelos GGUF Recomendados para Móvil

Coloca los modelos en la carpeta `models/`:

| Modelo | Tamaño | RAM Mínima | Perfil Recomendado |
|---|---|---|---|
| **SmolLM-360M-Instruct (Q4_K_M)** | 229 MB | ~1.0 GB | Móviles Android modestos (2-3 GB RAM) |
| **Qwen2.5-0.5B-Instruct (Q4_K_M)** | 398 MB | ~1.5 GB | Rápido, multilingüe (3-4 GB RAM) |
| **TinyLlama-1.1B-Chat (Q4_K_M)** | 669 MB | ~2.0 GB | Móviles estándar (4 GB RAM) |
| **Qwen2.5-1.5B-Instruct (Q4_K_M)** | 986 MB | ~3.0 GB | Mayor razonamiento y código (6 GB RAM) |
| **Llama-3.2-1B-Instruct (Q4_K_M)** | 840 MB | ~2.5 GB | Instrucciones complejas (4-6 GB RAM) |

---

## 5. Ejecutar Pruebas de Verificación

Para comprobar que todos los módulos y la base de datos funcionan en tu dispositivo:

```bash
python3 main.py --test
```

---

## 6. Licencia

Código abierto bajo Licencia MIT. Desarrollado para uso libre, soberano y evolutivo.
