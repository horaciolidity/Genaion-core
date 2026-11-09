#!/bin/bash
# ==============================================================================
# GENAION — COMPILACIÓN E INSTALACIÓN DE LLAMA.CPP LOCAL
# ==============================================================================
# Clona y compila llama.cpp optimizado para la CPU del dispositivo (ARM NEON / AVX).
# ==============================================================================

set -e

LLAMA_DIR="$HOME/llama.cpp"

if [ -d "$LLAMA_DIR" ]; then
    echo "[*] llama.cpp ya existe en $LLAMA_DIR. Actualizando..."
    cd "$LLAMA_DIR" && git pull
else
    echo "[*] Clonando llama.cpp desde el repositorio oficial..."
    git clone --depth 1 https://github.com/ggerganov/llama.cpp "$LLAMA_DIR"
    cd "$LLAMA_DIR"
fi

echo "[*] Compilando con CMake..."
cmake -B build
cmake --build build --config Release -j $(nproc || echo 2)

if [ -f "$LLAMA_DIR/build/bin/llama-cli" ]; then
    echo "[EXITO] llama-cli compilado correctamente en $LLAMA_DIR/build/bin/llama-cli"
    # Crear enlace simbólico para que GENAION lo detecte automáticamente
    mkdir -p "$HOME/.local/bin"
    ln -sf "$LLAMA_DIR/build/bin/llama-cli" "$HOME/.local/bin/llama-cli"
    echo "[*] Enlace creado en ~/.local/bin/llama-cli"
else
    echo "[ERROR] No se pudo encontrar el binario generado."
    exit 1
fi
