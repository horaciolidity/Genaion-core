#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# GENAION — SCRIPT DE INSTALACIÓN NATIVO PARA ANDROID (TERMUX)
# ==============================================================================
# Este script prepara el entorno en Android sin necesidad de root:
# 1. Actualiza paquetes de Termux.
# 2. Instala dependencias base: Python, Git, SQLite, CMake, Clang, Ninja.
# 3. Prepara la estructura de directorios y base de datos SQLite con FTS5.
# 4. Configura el entorno virtual y dependencias.
# ==============================================================================

set -e

echo ""
echo "=========================================================="
echo "    INICIANDO INSTALACIÓN DE GENAION EN TERMUX (ANDROID)"
echo "            THE ORIGIN OF INTELLIGENT CREATION"
echo "=========================================================="
echo ""

# 1. Solicitar permisos de almacenamiento si no existen
if [ ! -d "$HOME/storage" ]; then
    echo "[*] Solicitando acceso a almacenamiento local de Android..."
    termux-setup-storage
fi

# 2. Actualizar repositorio de Termux
echo "[*] Actualizando repositorios de Termux..."
pkg update -y && pkg upgrade -y

# 3. Instalar herramientas de compilación y runtime
echo "[*] Instalando Python, Git, SQLite y herramientas de desarrollo..."
pkg install -y python git sqlite clang cmake ninja binutils make ndk-sysroot

# 4. Verificar versión de arquitectura (aarch64 / armv7l / x86_64)
ARCH=$(uname -m)
echo "[*] Arquitectura de CPU detectada: $ARCH"
if [ "$ARCH" != "aarch64" ]; then
    echo "[AVISO] Arquitectura no es ARM64 nativa ($ARCH). El rendimiento puede verse reducido."
fi

# 5. Crear directorios requeridos
echo "[*] Configurando directorios de trabajo de GENAION..."
mkdir -p storage/knowledge models config scripts

# 6. Instalar dependencias de Python
echo "[*] Instalando dependencias básicas de Python..."
python3 -m pip install --upgrade pip setuptools wheel

# 7. Ejecutar verificación de integridad
echo "[*] Ejecutando suite de pruebas de verificación..."
python3 main.py --test

echo ""
echo "=========================================================="
echo "    INSTALACIÓN COMPLETADA EXITOSAMENTE"
echo "=========================================================="
echo "Para iniciar GENAION:"
echo "  python3 main.py"
echo ""
echo "Luego abre el navegador de tu teléfono en: http://localhost:8080"
echo "Para modo consola interactiva:"
echo "  python3 main.py --cli"
echo "=========================================================="
