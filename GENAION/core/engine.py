"""
GENAION Core Engine
Central orchestrator that coordinates Brain, Memory, Learning, Skills, Devices, and Security.
"""

import time
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

from .config import ConfigManager
from .hardware import get_hardware_profile
from brain.manager import BrainManager
from memory.sqlite_db import SQLiteMemory
from learning.engine import LearningEngine
from skills.registry import SkillRegistry
from devices.manager import DeviceManager
from security.security_guard import SecurityGuard
from perception.audio_vision import PerceptionEngine


class GenaionCore:
    """The central nervous system of GENAION."""

    def __init__(self, base_dir: Path = None):
        self.base_dir = base_dir or Path(__file__).resolve().parent.parent
        self.config_manager = ConfigManager(self.base_dir)
        
        # 1. Initialize Memory (SQLite)
        db_path = self.config_manager.get("memory", "db_path")
        self.memory = SQLiteMemory(db_path)

        # 2. Security Guard
        self.security = SecurityGuard(self.memory)

        # 3. Brain Manager (llama.cpp / GGUF)
        models_dir = self.config_manager.get("brain", "models_dir")
        self.brain = BrainManager(models_dir)

        # 4. Learning & Knowledge Base
        self.learning = LearningEngine(self.memory)

        # 5. Modular Skills Registry
        self.skills = SkillRegistry()

        # 6. Physical Devices Manager
        self.devices = DeviceManager()

        # 7. Perception Engine
        self.perception = PerceptionEngine()

        # State tracking
        self.state = "READY"
        self.memory.log_audit("core", "init", "GENAION Core initialized successfully", "SUCCESS")

    def get_system_telemetry(self) -> Dict[str, Any]:
        """Collect live hardware and engine metrics."""
        hw = get_hardware_profile()
        brain_stat = self.brain.get_status()
        installed_models = self.brain.scan_installed_models(hw.get("ram_available_gb", 2) * (1024 ** 3))
        
        return {
            "identity": {
                "name": self.config_manager.get("system", "name"),
                "version": self.config_manager.get("system", "version"),
                "motto": self.config_manager.get("system", "motto"),
                "state": self.state
            },
            "hardware": hw,
            "brain": {
                **brain_stat,
                "installed_models_count": len(installed_models),
                "installed_models": installed_models
            },
            "skills_count": len(self.skills.skills),
            "timestamp": time.time()
        }

    def process_chat_request(
        self,
        conversation_id: str,
        user_prompt: str,
        temperature: float = 0.7,
        top_p: float = 0.9,
        max_tokens: int = 512
    ) -> Dict[str, Any]:
        """
        End-to-end chat flow:
        1. Contextual memory retrieval (FTS search).
        2. Skill routing (detect if calculation or system query).
        3. Model inference (local llama.cpp or sovereign fallback).
        4. Persistent storage of messages.
        """
        self.state = "INFERRING"
        start_time = time.time()
        msg_user_id = str(uuid.uuid4())
        msg_assistant_id = str(uuid.uuid4())

        # Save user message
        self.memory.add_message(msg_user_id, conversation_id, "user", user_prompt)

        # 1. Search memory for relevant facts or knowledge
        recalled_snippets = self.memory.search_memory(user_prompt, limit=3)
        context_str = ""
        if recalled_snippets:
            context_str = "\n".join([f"Contexto relevante: {s.get('snippet', '')}" for s in recalled_snippets])

        # 2. Check if a direct skill can execute
        skill_execution = None
        prompt_lower = user_prompt.lower()
        if any(w in prompt_lower for w in ["cuanto es", "cuánto es", "calcula", "calcular"]):
            # Extract potential math expression
            expr = user_prompt.replace("cuanto es", "").replace("cuánto es", "").replace("calcula", "").replace("?", "").strip()
            math_res = self.skills.execute_skill("skill_math_solver", {"expression": expr})
            if math_res.get("status") == "success":
                skill_execution = {
                    "skill_id": "skill_math_solver",
                    "result": f"Cálculo exacto: {expr} = {math_res['result']}"
                }

        # 3. Model generation
        system_prompt = (
            "Eres GENAION, un núcleo de inteligencia artificial autónomo, soberano y modular. "
            "Responde de forma clara, directa y técnica sin simular capacidades inexistentes."
        )
        if context_str:
            system_prompt += f"\n\n{context_str}"

        # If skill had an exact answer, append it to context
        if skill_execution:
            system_prompt += f"\n\n[Dato de habilidad]: {skill_execution['result']}"

        threads = self.config_manager.get("brain", "default_threads", 4)
        generation_res = self.brain.generate_response(
            prompt=user_prompt,
            system_prompt=system_prompt,
            temperature=temperature,
            top_p=top_p,
            threads=threads,
            max_tokens=max_tokens
        )

        response_text = generation_res.get("text", "")
        # If skill executed, enrich response if not already covered
        if skill_execution and str(skill_execution["result"]) not in response_text:
            response_text = f"{skill_execution['result']}\n\n{response_text}"

        # Save assistant response
        self.memory.add_message(
            msg_assistant_id,
            conversation_id,
            "assistant",
            response_text,
            model=generation_res.get("model", "GENAION-Local"),
            tokens=generation_res.get("tokens_estimated", 0)
        )

        self.state = "READY"
        elapsed = time.time() - start_time

        return {
            "id": msg_assistant_id,
            "conversation_id": conversation_id,
            "content": response_text,
            "model": generation_res.get("model"),
            "engine": generation_res.get("engine"),
            "latency_sec": round(elapsed, 2),
            "tokens": generation_res.get("tokens_estimated", 0),
            "recalled_memory": recalled_snippets,
            "skill_executed": skill_execution,
            "timestamp": time.time()
        }
