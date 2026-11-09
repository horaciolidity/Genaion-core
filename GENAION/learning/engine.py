"""
GENAION Learning & Knowledge Engine
Handles local document ingestion, topic organization, user correction tracking (positive/negative pairs),
and benchmark evaluations.
Distinguishes clearly between contextual knowledge recall (RAG/Memory) and model weights fine-tuning (LoRA/QLoRA).
"""

import os
import time
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional
from memory.sqlite_db import SQLiteMemory


class LearningEngine:
    """Orchestrates local document indexing, feedback logging, and accuracy evaluation."""

    def __init__(self, memory: SQLiteMemory, docs_dir: str = "storage/knowledge"):
        self.memory = memory
        self.docs_dir = Path(docs_dir)
        self.docs_dir.mkdir(parents=True, exist_ok=True)

    def ingest_text_document(self, title: str, content: str, topic: str = "general", file_path: str = None) -> Dict[str, Any]:
        """Ingest a text document into the persistent database and FTS5 index."""
        doc_id = str(uuid.uuid4())
        now = time.time()
        file_size = len(content.encode("utf-8"))

        with self.memory.get_connection() as conn:
            conn.execute(
                "INSERT INTO documents (id, title, file_path, content, topic, file_size, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (doc_id, title, file_path or "", content, topic, file_size, now)
            )
            try:
                conn.execute(
                    "INSERT INTO memory_fts (content, source_table, source_id) VALUES (?, 'documents', ?)",
                    (f"{title} ({topic}): {content}", doc_id)
                )
            except Exception:
                pass
            conn.commit()

        self.memory.log_audit("learning", "ingest_document", f"Ingested '{title}' in topic '{topic}'", "SUCCESS")
        return {
            "id": doc_id,
            "title": title,
            "topic": topic,
            "file_size": file_size,
            "created_at": now
        }

    def list_documents(self, topic: str = None) -> List[Dict[str, Any]]:
        with self.memory.get_connection() as conn:
            if topic:
                cursor = conn.execute(
                    "SELECT id, title, file_path, topic, file_size, created_at, substr(content, 1, 120) as snippet FROM documents WHERE topic = ? ORDER BY created_at DESC",
                    (topic,)
                )
            else:
                cursor = conn.execute(
                    "SELECT id, title, file_path, topic, file_size, created_at, substr(content, 1, 120) as snippet FROM documents ORDER BY created_at DESC"
                )
            return [dict(r) for r in cursor.fetchall()]

    def record_correction(
        self,
        prompt: str,
        original_response: str,
        corrected_response: str,
        reason: str = "",
        rating: int = -1
    ) -> Dict[str, Any]:
        """
        Record a correction or positive/negative feedback pair.
        Note: This is saved for contextual in-context recall and future dataset preparation for LoRA fine-tuning.
        It does NOT alter the base weights of the GGUF model in real time.
        """
        corr_id = str(uuid.uuid4())
        now = time.time()
        with self.memory.get_connection() as conn:
            conn.execute(
                "INSERT INTO corrections (id, prompt, original_response, corrected_response, reason, rating, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (corr_id, prompt, original_response, corrected_response, reason, rating, now)
            )
            conn.commit()

        self.memory.log_audit("learning", "record_correction", f"Correction logged for prompt: {prompt[:40]}...", "SUCCESS")
        return {
            "id": corr_id,
            "prompt": prompt,
            "original_response": original_response,
            "corrected_response": corrected_response,
            "reason": reason,
            "created_at": now,
            "note": "Guardado en dataset de mejora. Los pesos del modelo GGUF no son modificados en caliente."
        }

    def list_corrections(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self.memory.get_connection() as conn:
            cursor = conn.execute(
                "SELECT id, prompt, original_response, corrected_response, reason, rating, created_at FROM corrections ORDER BY created_at DESC LIMIT ?",
                (limit,)
            )
            return [dict(r) for r in cursor.fetchall()]

    def run_benchmark_tests(self, model_runner_fn) -> Dict[str, Any]:
        """Run an automated benchmark test suite to evaluate response coherence and accuracy."""
        test_cases = [
            {
                "id": "identidad",
                "prompt": "¿Quién eres y cuál es tu propósito?",
                "expected_keywords": ["genaion", "local", "inteligente", "autónomo", "núcleo"]
            },
            {
                "id": "matematicas",
                "prompt": "¿Cuánto es 14 * 7?",
                "expected_keywords": ["98"]
            },
            {
                "id": "arquitectura",
                "prompt": "¿Qué motor de base de datos utiliza la memoria persistente de GENAION?",
                "expected_keywords": ["sqlite", "fts5"]
            }
        ]

        passed = 0
        details = []

        for tc in test_cases:
            start = time.time()
            resp = model_runner_fn(tc["prompt"])
            elapsed = time.time() - start
            output_text = resp.get("text", "") if isinstance(resp, dict) else str(resp)

            # Check expected keywords
            matches = [k for k in tc["expected_keywords"] if k in output_text.lower()]
            is_pass = len(matches) > 0
            if is_pass:
                passed += 1

            details.append({
                "test_id": tc["id"],
                "prompt": tc["prompt"],
                "passed": is_pass,
                "matches": matches,
                "latency_sec": round(elapsed, 2),
                "output_preview": output_text[:120]
            })

        score_pct = round((passed / len(test_cases)) * 100, 1)
        return {
            "total_tests": len(test_cases),
            "passed": passed,
            "score_pct": score_pct,
            "results": details,
            "timestamp": time.time()
        }
