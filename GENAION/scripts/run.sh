#!/bin/bash
# ==============================================================================
# GENAION — SCRIPT DE INICIO CON CONTROL DE RECURSOS
# ==============================================================================

# Añadir directorios de binarios locales
export PATH="$HOME/.local/bin:$HOME/llama.cpp/build/bin:$PATH"

echo "=========================================================="
echo "    INICIANDO PLATAFORMA AUTÓNOMA GENAION"
echo "=========================================================="

python3 main.py "$@"
