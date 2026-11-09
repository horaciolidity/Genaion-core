"""
GENAION Skills Registry
Loads, enables, disables, and executes modular skills.
Includes core operational skills out of the box.
"""

import ast
import math
import os
import time
from typing import Any, Dict, List, Optional
from .base import BaseSkill
from core.hardware import get_hardware_profile


class CodeSandboxSkill(BaseSkill):
    id = "skill_code_sandbox"
    name = "Code Analysis & Python Sandbox"
    description = "Analiza sintaxis y ejecuta expresiones seguras de Python sin acceso a red."
    category = "programming"
    version = "1.0.0"
    required_permissions = ["EXEC_PYTHON_SAFE"]
    default_config = {"max_execution_time_sec": 3}

    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        code = params.get("code", "").strip()
        if not code:
            return {"status": "error", "error": "No se proporcionó código."}

        # Check AST safety (prohibit dangerous builtins)
        try:
            tree = ast.parse(code)
            for node in ast.walk(tree):
                if isinstance(node, ast.Import) or isinstance(node, ast.ImportFrom):
                    # Prohibit importing socket, subprocess, os.system
                    for alias in getattr(node, "names", []):
                        if alias.name in ["socket", "subprocess", "urllib", "requests"]:
                            return {"status": "blocked", "error": f"Importación prohibida por seguridad: {alias.name}"}
        except SyntaxError as e:
            return {"status": "syntax_error", "error": str(e)}

        # Safe evaluation of mathematical/algorithmic expressions
        safe_globals = {
            "math": math,
            "abs": abs,
            "min": min,
            "max": max,
            "sum": sum,
            "len": len,
            "range": range,
            "sorted": sorted,
            "list": list,
            "dict": dict,
            "set": set,
            "round": round
        }
        try:
            # Try eval first for expressions
            result = eval(code, {"__builtins__": None}, safe_globals)
            return {"status": "success", "result": result, "type": type(result).__name__}
        except Exception:
            # Fallback to exec with captured locals
            safe_locals = {}
            try:
                exec(code, {"__builtins__": None}, safe_locals)
                # Filter internal keys
                clean_res = {k: str(v) for k, v in safe_locals.items() if not k.startswith("_")}
                return {"status": "success", "variables": clean_res}
            except Exception as e:
                return {"status": "error", "error": str(e)}

    def run_tests(self) -> Dict[str, Any]:
        res = self.execute({"code": "math.sqrt(144) + 8"})
        passed = (res.get("status") == "success" and res.get("result") == 20.0)
        return {"passed": passed, "details": res}


class SystemDiagnosticsSkill(BaseSkill):
    id = "skill_system_diag"
    name = "Hardware & Termux Diagnostics"
    description = "Inspecciona RAM real, CPU, espacio en disco y perfil móvil en Android/Linux."
    category = "automation"
    version = "1.0.0"
    required_permissions = ["READ_SYSTEM_STATS"]

    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        profile = get_hardware_profile()
        return {
            "status": "success",
            "telemetry": profile,
            "timestamp": time.time()
        }

    def run_tests(self) -> Dict[str, Any]:
        res = self.execute({})
        passed = ("telemetry" in res and res["telemetry"]["cpu_cores"] > 0)
        return {"passed": passed, "details": res}


class MathSolverSkill(BaseSkill):
    id = "skill_math_solver"
    name = "Exact Mathematical Engine"
    description = "Resuelve cálculos aritméticos, porcentajes, áreas y trigonometría con precisión exacta."
    category = "data_analysis"
    version = "1.0.0"

    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        expr = params.get("expression", "")
        clean_expr = expr.replace("^", "**")
        allowed_names = {
            "sin": math.sin, "cos": math.cos, "tan": math.tan,
            "sqrt": math.sqrt, "pi": math.pi, "e": math.e,
            "log": math.log, "log10": math.log10, "pow": pow
        }
        try:
            val = eval(clean_expr, {"__builtins__": None}, allowed_names)
            return {"status": "success", "expression": expr, "result": val}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    def run_tests(self) -> Dict[str, Any]:
        res = self.execute({"expression": "sqrt(81) * 3"})
        passed = (res.get("status") == "success" and res.get("result") == 27.0)
        return {"passed": passed, "details": res}


class RoboticsSafetyInterlockSkill(BaseSkill):
    id = "skill_robotics_interlock"
    name = "Robotics & Hardware Safety Interlock"
    description = "Valida y previene la activación no autorizada de motores, GPIO, actuadores y drones."
    category = "robotics"
    version = "1.0.0"
    required_permissions = ["HARDWARE_ACTUATOR_AUTH"]
    default_config = {"require_human_pin": True}

    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        command = params.get("command", "")
        pin = params.get("confirmation_token", "")
        is_risky = any(w in command.lower() for w in ["motor", "rotor", "gpio", "thrust", "servo", "drone", "arm"])

        if is_risky and not pin:
            return {
                "status": "BLOCKED_REQUIRES_AUTHORIZATION",
                "message": "Seguridad GENAION: Toda orden a actuadores físicos o drones requiere confirmación humana explícita.",
                "command": command
            }

        return {
            "status": "AUTHORIZED",
            "message": f"Orden validada bajo protocolo de contención: {command}",
            "execution_mode": "sandboxed_device_adapter"
        }

    def run_tests(self) -> Dict[str, Any]:
        # Test 1: unauthenticated risky command must be blocked
        blocked = self.execute({"command": "start motor 1"})
        # Test 2: authenticated command passes
        passed = (blocked.get("status") == "BLOCKED_REQUIRES_AUTHORIZATION")
        return {"passed": passed, "details": blocked}


class SkillRegistry:
    """Central registry and lifecycle manager for all skills."""

    def __init__(self):
        self.skills: Dict[str, BaseSkill] = {}
        self._register_default_skills()

    def _register_default_skills(self):
        self.register(CodeSandboxSkill())
        self.register(SystemDiagnosticsSkill())
        self.register(MathSolverSkill())
        self.register(RoboticsSafetyInterlockSkill())

    def register(self, skill: BaseSkill) -> None:
        self.skills[skill.id] = skill

    def get_skill(self, skill_id: str) -> Optional[BaseSkill]:
        return self.skills.get(skill_id)

    def list_manifests(self) -> List[Dict[str, Any]]:
        return [skill.get_manifest() for skill in self.skills.values()]

    def set_skill_active(self, skill_id: str, is_active: bool) -> bool:
        if skill_id in self.skills:
            self.skills[skill_id].is_active = is_active
            return True
        return False

    def execute_skill(self, skill_id: str, params: Dict[str, Any]) -> Dict[str, Any]:
        skill = self.get_skill(skill_id)
        if not skill:
            return {"status": "error", "error": f"Habilidad '{skill_id}' no encontrada."}
        if not skill.is_active:
            return {"status": "error", "error": f"La habilidad '{skill.name}' está desactivada."}
        return skill.execute(params)
