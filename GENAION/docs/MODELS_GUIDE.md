# GUÍA DE MODELOS GGUF PARA GENAION EN MÓVIL

GENAION utiliza el formato estándar abierto **GGUF** cuantizado con llama.cpp.

## Modelos Probados y Recomendados

### 1. SmolLM-360M-Instruct (Ultra Ligero)
- **Parámetros**: 360 Millones
- **Cuantización**: Q4_K_M
- **Tamaño**: 229 MB
- **Consumo RAM**: ~800 MB
- **Descarga**:
  ```bash
  curl -L -o models/smollm-360m-instruct-q4_k_m.gguf "https://huggingface.co/HuggingFaceTB/SmolLM-360M-Instruct-GGUF/resolve/main/smollm-360m-instruct-q4_k_m.gguf"
  ```

### 2. Qwen2.5-0.5B-Instruct (Rápido y Multilingüe)
- **Parámetros**: 500 Millones
- **Cuantización**: Q4_K_M
- **Tamaño**: 398 MB
- **Consumo RAM**: ~1.2 GB
- **Descarga**:
  ```bash
  curl -L -o models/qwen2.5-0.5b-instruct-q4_k_m.gguf "https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf"
  ```

### 3. TinyLlama-1.1B-Chat-v1.0 (Estándar 4GB RAM)
- **Parámetros**: 1.1 Billones
- **Cuantización**: Q4_K_M
- **Tamaño**: 669 MB
- **Consumo RAM**: ~1.8 GB
- **Descarga**:
  ```bash
  curl -L -o models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"
  ```

### 4. Qwen2.5-1.5B-Instruct (Razonamiento y Código)
- **Parámetros**: 1.5 Billones
- **Cuantización**: Q4_K_M
- **Tamaño**: 986 MB
- **Consumo RAM**: ~2.5 GB
- **Descarga**:
  ```bash
  curl -L -o models/qwen2.5-1.5b-instruct-q4_k_m.gguf "https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf"
  ```

## Activación
Una vez descargado cualquier archivo `.gguf` dentro del directorio `models/`:
1. Ve a la pestaña **Modelos GGUF** en la interfaz web de GENAION.
2. Pulsa el botón **Escanear Directorio**.
3. Haz clic en **Activar**. El motor cambiará de modelo sin necesidad de reiniciar el servidor.
