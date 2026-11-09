#!/bin/bash
# ==============================================================================
# GENAION — SCRIPT DE INSTALACIÓN PARA UBUNTU PROOT (TERMUX)
# ==============================================================================

set -e

echo "[*] Actualizando paquetes de Ubuntu..."
apt-get update && apt-get upgrade -y

echo "[*] Instalando paquetes base..."
apt-get install -y python3 python3-pip python3-venv git sqlite3 libsqlite3-dev build-essential cmake curl wget

echo "[*] Creando estructura de directorios..."
mkdir -p storage/knowledge models config

echo "[*] Verificando entorno Python..."
python3 --version

echo "[*] Ejecutando pruebas de verificación GENAION..."
python3 main.py --test

echo ""
echo "[*] Ubuntu proot configurado. Inicia el sistema con:"
echo "    python3 main.py"
