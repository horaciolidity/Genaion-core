"""
GENAION Hardware & System Profiler
Detects available RAM, CPU architecture, storage, and platform (including Android Termux / proot).
Provides real resource profiles to avoid out-of-memory (OOM) crashes on mobile devices.
"""

import os
import platform
import shutil
import sys
from typing import Dict, Any


def is_android_termux() -> bool:
    """Detect if running inside Termux on Android."""
    if os.path.exists("/data/data/com.termux"):
        return True
    if "TERMUX_VERSION" in os.environ:
        return True
    if "PREFIX" in os.environ and "termux" in os.environ.get("PREFIX", ""):
        return True
    return False


def is_proot_environment() -> bool:
    """Detect if running inside proot (e.g. Ubuntu inside Termux)."""
    if "PROOT" in os.environ:
        return True
    try:
        with open("/proc/1/stat", "r") as f:
            content = f.read()
            if "proot" in content.lower():
                return True
    except Exception:
        pass
    return False


def get_system_memory_bytes() -> Dict[str, int]:
    """Get total and available system memory in bytes from /proc/meminfo or sysconf."""
    total = 0
    available = 0
    try:
        if os.path.exists("/proc/meminfo"):
            with open("/proc/meminfo", "r") as f:
                for line in f:
                    parts = line.split(":")
                    if len(parts) == 2:
                        key = parts[0].strip()
                        val_kb = int(parts[1].strip().split()[0])
                        if key == "MemTotal":
                            total = val_kb * 1024
                        elif key == "MemAvailable":
                            available = val_kb * 1024
        if total == 0:
            # Fallback to os.sysconf
            pages = os.sysconf("SC_PHYS_PAGES")
            page_size = os.sysconf("SC_PAGE_SIZE")
            total = pages * page_size
            available = total // 2  # conservative estimate
    except Exception:
        # Ultimate fallback
        total = 4 * 1024 * 1024 * 1024  # assume 4GB
        available = 2 * 1024 * 1024 * 1024

    return {"total": total, "available": available}


def get_cpu_info() -> Dict[str, Any]:
    """Retrieve CPU architecture and core counts."""
    cores = os.cpu_count() or 2
    arch = platform.machine()
    return {
        "cores": cores,
        "architecture": arch,
        "is_arm": "aarch64" in arch.lower() or "arm" in arch.lower(),
        "is_x86": "x86_64" in arch.lower() or "amd64" in arch.lower() or "i386" in arch.lower()
    }


def get_storage_info(path: str = ".") -> Dict[str, int]:
    """Get free and total storage for a given path."""
    try:
        stat = shutil.disk_usage(path)
        return {
            "total": stat.total,
            "free": stat.free,
            "used": stat.used
        }
    except Exception:
        return {"total": 0, "free": 0, "used": 0}


def get_hardware_profile() -> Dict[str, Any]:
    """
    Classify hardware and recommend inference limits:
    - low: <4GB RAM (e.g. modest Android phones) -> max 512-1024 context, models < 1.5GB (Q4)
    - medium: 4-8GB RAM (modern phones / laptops) -> 1024-2048 context, models < 3.5GB
    - high: >8GB RAM (workstations / servers) -> 4096+ context
    """
    mem = get_system_memory_bytes()
    cpu = get_cpu_info()
    storage = get_storage_info()
    total_ram_gb = mem["total"] / (1024 ** 3)
    avail_ram_gb = mem["available"] / (1024 ** 3)

    if total_ram_gb < 3.8:
        profile_tier = "low_power_mobile"
        recommended_threads = max(1, cpu["cores"] - 1)
        max_context = 1024
        max_model_size_gb = 1.2
        rec_model = "SmolLM-360M-Instruct-Q4_K_M.gguf or TinyLlama-1.1B-Chat-Q4_K_M.gguf"
    elif total_ram_gb <= 8.0:
        profile_tier = "balanced_mobile"
        recommended_threads = max(2, cpu["cores"] - 1)
        max_context = 2048
        max_model_size_gb = 3.2
        rec_model = "Qwen2.5-0.5B / 1.5B-Instruct-Q4_K_M.gguf or Llama-3.2-1B-Instruct-Q4_K_M.gguf"
    else:
        profile_tier = "high_performance"
        recommended_threads = max(4, cpu["cores"] - 2)
        max_context = 4096
        max_model_size_gb = 8.0
        rec_model = "Llama-3.2-3B-Instruct-Q4_K_M.gguf or Phi-3.5-mini-instruct-Q4_K_M.gguf"

    return {
        "tier": profile_tier,
        "platform": sys.platform,
        "system": platform.system(),
        "release": platform.release(),
        "arch": cpu["architecture"],
        "cpu_cores": cpu["cores"],
        "is_arm": cpu["is_arm"],
        "is_termux": is_android_termux(),
        "is_proot": is_proot_environment(),
        "ram_total_gb": round(total_ram_gb, 2),
        "ram_available_gb": round(avail_ram_gb, 2),
        "storage_free_gb": round(storage["free"] / (1024 ** 3), 2),
        "recommended_threads": recommended_threads,
        "recommended_context": max_context,
        "recommended_max_model_gb": max_model_size_gb,
        "recommended_models": rec_model
    }


if __name__ == "__main__":
    import json
    print(json.dumps(get_hardware_profile(), indent=2))
