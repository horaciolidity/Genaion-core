"""
GENAION Security Module
Enforces path boundaries, verifies permissions, prevents command injections, and audits critical actions.
"""

import os
from pathlib import Path
from typing import Any, Dict, List, Optional
from memory.sqlite_db import SQLiteMemory


class SecurityGuard:
    """Protects file system boundaries and verifies permission checks."""

    def __init__(self, memory: SQLiteMemory, allowed_dirs: Optional[List[str]] = None):
        self.memory = memory
        self.allowed_dirs = allowed_dirs or ["storage", "models", "docs", "config"]

    def is_safe_path(self, target_path: str, base_dir: Path) -> bool:
        """Ensure path does not escape sandbox via directory traversal (e.g. ../../etc/passwd)."""
        try:
            resolved = Path(target_path).resolve()
            # Must be within base_dir or allowed workspace subdirectories
            for allowed in self.allowed_dirs:
                allowed_full = (base_dir / allowed).resolve()
                if str(resolved).startswith(str(allowed_full)):
                    return True
            if str(resolved).startswith(str(base_dir.resolve())):
                return True
            return False
        except Exception:
            return False

    def validate_action(self, module: str, action: str, details: str) -> bool:
        """Validates that action complies with sovereign safety policy."""
        # Prohibit executing raw destructive system commands
        dangerous = ["rm -rf /", "mkfs", ":(){ :|:& };:", "dd if=/dev/zero"]
        if any(d in details for d in dangerous):
            self.memory.log_audit(module, action, f"Blocked dangerous action: {details}", "DENIED")
            return False

        self.memory.log_audit(module, action, details, "AUTHORIZED")
        return True
