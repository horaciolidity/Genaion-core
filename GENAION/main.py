#!/usr/bin/env python3
"""
GENAION — THE ORIGIN OF INTELLIGENT CREATION
Main execution entry point.
Run standalone CLI, start local HTTP interface, or run automated verification tests.

Usage:
    python main.py              # Starts local interactive server on port 8080
    python main.py --cli        # Starts sovereign terminal interaction
    python main.py --test       # Runs test suite verifying all modules
    python main.py --status     # Prints hardware telemetry & model catalog
"""

import argparse
import json
import os
import sys
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs, urlparse

# Add current folder to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from core.engine import GenaionCore
from core.hardware import get_hardware_profile

BANNER = r"""
 ██████╗ ███████╗███╗   ██╗ █████╗ ██╗ ██████╗ ███╗   ██╗
██╔════╝ ██╔════╝████╗  ██║██╔══██╗██║██╔═══██╗████╗  ██║
██║  ███╗█████╗  ██╔██╗ ██║███████║██║██║   ██║██╔██╗ ██║
██║   ██║██╔══╝  ██║╚██╗██║██╔══██║██║██║   ██║██║╚██╗██║
╚██████╔╝███████╗██║ ╚████║██║  ██║██║╚██████╔╝██║ ╚████║
 ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝
         THE ORIGIN OF INTELLIGENT CREATION (v0.1.0)
         Local · Sovereign · Modular · Evolutionary
"""


def run_cli_interactive(core: GenaionCore):
    """Run interactive CLI session in terminal (useful in raw Termux)."""
    print(BANNER)
    telemetry = core.get_system_telemetry()
    hw = telemetry["hardware"]
    print(f"[*] Plataforma: {hw['system']} {hw['arch']} | Termux: {hw['is_termux']}")
    print(f"[*] RAM Disponible: {hw['ram_available_gb']} GB / {hw['ram_total_gb']} GB")
    print(f"[*] Perfil Hardware: {hw['tier']} (Hilos recomendados: {hw['recommended_threads']})")
    print(f"[*] Modelos GGUF detectados: {telemetry['brain']['installed_models_count']}")
    print("-" * 65)
    print("Escribe tu consulta (o 'salir', 'modelos', 'limpiar', 'stats'):\n")

    conv_id = f"cli_{int(time.time())}"
    core.memory.create_conversation(conv_id, "Sesión CLI Termux")

    while True:
        try:
            user_input = input("GENAION > ").strip()
            if not user_input:
                continue
            if user_input.lower() in ["salir", "exit", "quit", "q"]:
                print("Cerrando GENAION...")
                break
            if user_input.lower() in ["stats", "telemetria"]:
                print(json.dumps(core.get_system_telemetry(), indent=2))
                continue
            if user_input.lower() in ["modelos", "models"]:
                models = core.brain.scan_installed_models()
                print(f"Modelos instalados en carpeta {core.brain.models_dir}:")
                for m in models:
                    print(f" - {m['file_name']} ({m['size_mb']} MB, RAM est: {m['estimated_ram_needed_gb']} GB)")
                continue

            resp = core.process_chat_request(conv_id, user_input)
            print(f"\n[{resp.get('model', 'GENAION')}] ({resp.get('latency_sec', 0)}s):")
            print(resp["content"])
            print("-" * 65)
        except (KeyboardInterrupt, EOFError):
            print("\nSesión finalizada.")
            break


def run_http_server(core: GenaionCore, host: str = "0.0.0.0", port: int = 8080):
    """Lightweight zero-dependency HTTP API server for local mobile browser access."""
    class GenaionApiHandler(SimpleHTTPRequestHandler):
        def do_GET(self):
            parsed = urlparse(self.path)
            if parsed.path == "/api/status":
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps(core.get_system_telemetry()).encode("utf-8"))
            elif parsed.path == "/api/models":
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                hw = get_hardware_profile()
                models = core.brain.scan_installed_models(hw["ram_available_gb"] * (1024 ** 3))
                self.wfile.write(json.dumps({
                    "installed": models,
                    "catalog": core.brain.get_status()["curated_catalog"]
                }).encode("utf-8"))
            elif parsed.path == "/api/skills":
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps(core.skills.list_manifests()).encode("utf-8"))
            else:
                super().do_GET()

        def do_POST(self):
            parsed = urlparse(self.path)
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            data = json.loads(body) if body else {}

            if parsed.path == "/api/chat":
                conv_id = data.get("conversation_id", "default")
                prompt = data.get("prompt", "")
                result = core.process_chat_request(
                    conversation_id=conv_id,
                    user_prompt=prompt,
                    temperature=float(data.get("temperature", 0.7)),
                    top_p=float(data.get("top_p", 0.9)),
                    max_tokens=int(data.get("max_tokens", 512))
                )
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps(result).encode("utf-8"))
            else:
                self.send_response(404)
                self.end_headers()

        def do_OPTIONS(self):
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()

    print(BANNER)
    print(f"[*] Iniciando servidor local GENAION en http://{host}:{port}")
    print(f"[*] Accede desde tu navegador Android o PC en la misma red Wi-Fi.")
    server = HTTPServer((host, port), GenaionApiHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
        server.server_close()


def main():
    parser = argparse.ArgumentParser(description="GENAION — Autonomous Modular AI Platform")
    parser.add_argument("--cli", action="store_true", help="Iniciar en modo consola interactiva")
    parser.add_argument("--test", action="store_true", help="Ejecutar suite de pruebas de verificación")
    parser.add_argument("--status", action="store_true", help="Mostrar telemetría del sistema")
    parser.add_argument("--host", default="0.0.0.0", help="Host para servidor web (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8080, help="Puerto HTTP (default: 8080)")

    args = parser.parse_args()
    core = GenaionCore()

    if args.status:
        print(json.dumps(core.get_system_telemetry(), indent=2))
        return

    if args.test:
        from tests.test_core import run_all_tests
        success = run_all_tests(core)
        sys.exit(0 if success else 1)

    if args.cli:
        run_cli_interactive(core)
    else:
        run_http_server(core, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
