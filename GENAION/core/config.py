"""
GENAION Configuration Manager
Manages system configuration, storage paths, hardware safety margins, and inference parameters.
"""

import json
import os
from pathlib import Path
from typing import Any, Dict

DEFAULT_CONFIG: Dict[str, Any] = {
    "system": {
        "name": "GENAION",
        "version": "0.1.0",
        "motto": "THE ORIGIN OF INTELLIGENT CREATION",
        "environment": "local_autonomous",
        "host": "0.0.0.0",
        "port": 8080,
        "debug": False,
        "hardware_profile": "auto"
    },
    "brain": {
        "active_model": None,
        "models_dir": "models",
        "default_temperature": 0.7,
        "default_top_p": 0.9,
        "default_context_length": 2048,
        "default_threads": 4,
        "llama_cpp_binary_path": "llama-cli",
        "fallback_rule_inference": True
    },
    "memory": {
        "db_path": "storage/genaion.db",
        "enable_fts": True,
        "wal_mode": True,
        "auto_vacuum": "INCREMENTAL"
    },
    "security": {
        "strict_mode": True,
        "require_confirmation_for_actuators": True,
        "allow_shell_execution": False,
        "allowed_workspace_dirs": ["storage", "models", "docs"]
    },
    "learning": {
        "auto_index_documents": True,
        "record_feedback_pairs": True
    }
}


class ConfigManager:
    """Loads, validates, and persists GENAION configurations."""

    def __init__(self, base_dir: Path = None):
        if base_dir is None:
            # Root GENAION directory
            self.base_dir = Path(__file__).resolve().parent.parent
        else:
            self.base_dir = Path(base_dir)

        self.config_file = self.base_dir / "config" / "settings.json"
        self.config: Dict[str, Any] = {}
        self.load()

    def load(self) -> Dict[str, Any]:
        """Load configuration from disk or write default if missing."""
        if not self.config_file.parent.exists():
            self.config_file.parent.mkdir(parents=True, exist_ok=True)

        if self.config_file.exists():
            try:
                with open(self.config_file, "r", encoding="utf-8") as f:
                    user_cfg = json.load(f)
                    # Deep merge with defaults
                    self.config = self._deep_merge(DEFAULT_CONFIG, user_cfg)
            except Exception as e:
                print(f"[WARN] Failed to read {self.config_file}: {e}. Using defaults.")
                self.config = DEFAULT_CONFIG.copy()
        else:
            self.config = DEFAULT_CONFIG.copy()
            self.save()

        # Resolve relative directories to absolute base_dir
        for key in ["models_dir"]:
            target = Path(self.config["brain"][key])
            if not target.is_absolute():
                self.config["brain"][key] = str(self.base_dir / target)

        mem_db = Path(self.config["memory"]["db_path"])
        if not mem_db.is_absolute():
            self.config["memory"]["db_path"] = str(self.base_dir / mem_db)

        return self.config

    def save(self) -> bool:
        """Persist current configuration to disk."""
        try:
            self.config_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self.config_file, "w", encoding="utf-8") as f:
                json.dump(self.config, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"[ERROR] Failed to save config: {e}")
            return False

    def get(self, section: str, key: str = None, default: Any = None) -> Any:
        """Get a setting by section and key."""
        sec = self.config.get(section, {})
        if key is None:
            return sec
        return sec.get(key, default)

    def set(self, section: str, key: str, value: Any) -> None:
        """Set a setting and persist."""
        if section not in self.config:
            self.config[section] = {}
        self.config[section][key] = value
        self.save()

    def _deep_merge(self, base: dict, override: dict) -> dict:
        result = base.copy()
        for k, v in override.items():
            if k in result and isinstance(result[k], dict) and isinstance(v, dict):
                result[k] = self._deep_merge(result[k], v)
            else:
                result[k] = v
        return result
