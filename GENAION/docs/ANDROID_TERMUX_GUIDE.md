# GUÍA COMPLETA DE DESPLIEGUE EN ANDROID (TERMUX & PROOT)

## Requisitos Previos

- Teléfono Android con al menos 3GB de RAM (recomendado 4GB a 8GB).
- Al menos 3GB de almacenamiento interno libre.
- **Termux instalado desde F-Droid** (NUNCA desde Google Play Store, ya que esa versión está abandonada y sus repositorios están deprecados).

---

## Opción A: Despliegue Nativo en Termux (Recomendado)

### 1. Preparar Termux y Almacenamiento
Abre la aplicación Termux en tu teléfono:
```bash
termux-setup-storage
pkg update -y && pkg upgrade -y
```

### 2. Clonar o Descargar GENAION
```bash
pkg install git python sqlite -y
cd $HOME
# Clona tu repositorio o transfiere los archivos a Termux
git clone <URL_DE_TU_REPOSITORIO> GENAION
cd GENAION
```

### 3. Ejecutar el Script de Instalación Automatizado
```bash
bash scripts/install_termux.sh
```

El script verificará tu CPU (ARM64 `aarch64`), preparará directorios, inicializará SQLite e instalará las herramientas necesarias.

### 4. Iniciar GENAION
```bash
python3 main.py
```
Abre tu navegador (Chrome o Firefox para Android) y visita:
`http://localhost:8080`

Para usarlo en modo consola directa sin navegador:
```bash
python3 main.py --cli
```

---

## Opción B: Despliegue en Ubuntu mediante proot-distro

Si prefieres un entorno Debian/Ubuntu completo dentro de Android:
```bash
pkg install proot-distro -y
proot-distro install ubuntu
proot-distro login ubuntu

# Dentro de Ubuntu:
cd /root
git clone <URL_DE_TU_REPOSITORIO> GENAION
cd GENAION
bash scripts/install_ubuntu_proot.sh
python3 main.py
```
