"""
GENAION Memory — SQLite Database Engine
Persistent storage for conversations, long-term facts, ingested documents, and audit logs.
Supports full-text search via SQLite FTS5.
"""

import json
import sqlite3
import time
from pathlib import Path
from typing import Any, Dict, List, Optional


class SQLiteMemory:
    """Manages SQLite storage, tables, transactions, and search."""

    def __init__(self, db_path: str = "storage/genaion.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_database()

    def get_connection(self) -> sqlite3.Connection:
        """Create a connection with WAL mode and foreign keys enabled."""
        conn = sqlite3.connect(str(self.db_path), check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode = WAL;")
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def _init_database(self) -> None:
        """Initialize database schema and FTS5 tables."""
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # 1. Conversations
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL,
                metadata TEXT DEFAULT '{}'
            );
            """)

            # 2. Messages
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                conversation_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                model TEXT,
                tokens INTEGER DEFAULT 0,
                created_at REAL NOT NULL,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
            );
            """)

            # 3. Long Term Memory (structured facts, preferences, user data)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS long_term_memory (
                id TEXT PRIMARY KEY,
                category TEXT NOT NULL,
                key TEXT NOT NULL,
                value TEXT NOT NULL,
                confidence REAL DEFAULT 1.0,
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL,
                UNIQUE(category, key)
            );
            """)

            # 4. Ingested Documents & Knowledge Base
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                file_path TEXT,
                content TEXT NOT NULL,
                topic TEXT DEFAULT 'general',
                file_size INTEGER DEFAULT 0,
                created_at REAL NOT NULL
            );
            """)

            # 5. User Corrections & Feedback (for continuous learning evaluation)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS corrections (
                id TEXT PRIMARY KEY,
                prompt TEXT NOT NULL,
                original_response TEXT NOT NULL,
                corrected_response TEXT NOT NULL,
                reason TEXT,
                rating INTEGER DEFAULT -1,
                created_at REAL NOT NULL
            );
            """)

            # 6. Audit Log (Security & Action tracking)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                module TEXT NOT NULL,
                action TEXT NOT NULL,
                details TEXT,
                status TEXT NOT NULL,
                timestamp REAL NOT NULL
            );
            """)

            # 7. FTS5 Full-Text Search (Fallback gracefully if FTS5 is not compiled)
            try:
                cursor.execute("""
                CREATE VIRTUAL TABLE IF NOT EXISTS memory_fts USING fts5(
                    content,
                    source_table UNINDEXED,
                    source_id UNINDEXED
                );
                """)
            except Exception as e:
                print(f"[WARN] FTS5 not available in this SQLite build: {e}. Standard search will be used.")

            conn.commit()

    # --- Conversation Operations ---

    def create_conversation(self, conv_id: str, title: str = "Nueva Conversación", metadata: dict = None) -> Dict[str, Any]:
        now = time.time()
        meta_str = json.dumps(metadata or {})
        with self.get_connection() as conn:
            conn.execute(
                "INSERT INTO conversations (id, title, created_at, updated_at, metadata) VALUES (?, ?, ?, ?, ?)",
                (conv_id, title, now, now, meta_str)
            )
            conn.commit()
        return {"id": conv_id, "title": title, "created_at": now, "updated_at": now}

    def list_conversations(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.execute(
                "SELECT id, title, created_at, updated_at, metadata FROM conversations ORDER BY updated_at DESC LIMIT ?",
                (limit,)
            )
            return [dict(row) for row in cursor.fetchall()]

    def delete_conversation(self, conv_id: str) -> bool:
        with self.get_connection() as conn:
            conn.execute("DELETE FROM conversations WHERE id = ?", (conv_id,))
            conn.commit()
        return True

    def add_message(self, msg_id: str, conv_id: str, role: str, content: str, model: str = None, tokens: int = 0) -> Dict[str, Any]:
        now = time.time()
        with self.get_connection() as conn:
            conn.execute(
                "INSERT INTO messages (id, conversation_id, role, content, model, tokens, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (msg_id, conv_id, role, content, model, tokens, now)
            )
            conn.execute("UPDATE conversations SET updated_at = ? WHERE id = ?", (now, conv_id))
            # Try index into FTS5
            try:
                conn.execute(
                    "INSERT INTO memory_fts (content, source_table, source_id) VALUES (?, 'messages', ?)",
                    (content, msg_id)
                )
            except Exception:
                pass
            conn.commit()
        return {"id": msg_id, "conversation_id": conv_id, "role": role, "content": content, "model": model, "created_at": now}

    def get_messages(self, conv_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.execute(
                "SELECT id, conversation_id, role, content, model, tokens, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT ?",
                (conv_id, limit)
            )
            return [dict(row) for row in cursor.fetchall()]

    # --- Long Term Memory Operations ---

    def set_long_term_fact(self, fact_id: str, category: str, key: str, value: str, confidence: float = 1.0) -> Dict[str, Any]:
        now = time.time()
        with self.get_connection() as conn:
            conn.execute("""
            INSERT INTO long_term_memory (id, category, key, value, confidence, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(category, key) DO UPDATE SET
                value=excluded.value,
                confidence=excluded.confidence,
                updated_at=excluded.updated_at
            """, (fact_id, category, key, value, confidence, now, now))
            try:
                conn.execute(
                    "INSERT INTO memory_fts (content, source_table, source_id) VALUES (?, 'long_term_memory', ?)",
                    (f"{category} {key}: {value}", fact_id)
                )
            except Exception:
                pass
            conn.commit()
        return {"id": fact_id, "category": category, "key": key, "value": value, "updated_at": now}

    def list_long_term_facts(self, category: str = None) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            if category:
                cursor = conn.execute(
                    "SELECT id, category, key, value, confidence, created_at, updated_at FROM long_term_memory WHERE category = ? ORDER BY key ASC",
                    (category,)
                )
            else:
                cursor = conn.execute(
                    "SELECT id, category, key, value, confidence, created_at, updated_at FROM long_term_memory ORDER BY category, key ASC"
                )
            return [dict(row) for row in cursor.fetchall()]

    def delete_long_term_fact(self, fact_id: str) -> bool:
        with self.get_connection() as conn:
            conn.execute("DELETE FROM long_term_memory WHERE id = ?", (fact_id,))
            conn.commit()
        return True

    # --- Search ---

    def search_memory(self, query: str, limit: int = 15) -> List[Dict[str, Any]]:
        """Search across messages, long term memory, and documents using FTS5 or LIKE."""
        results = []
        with self.get_connection() as conn:
            # First attempt FTS5
            try:
                cursor = conn.execute("""
                SELECT source_table, source_id, snippet(memory_fts, 0, '<b>', '</b>', '...', 10) as snippet
                FROM memory_fts
                WHERE memory_fts MATCH ?
                LIMIT ?
                """, (query, limit))
                rows = cursor.fetchall()
                for row in rows:
                    results.append(dict(row))
                if results:
                    return results
            except Exception:
                pass

            # Fallback to standard SQL LIKE queries
            pattern = f"%{query}%"
            # Search long term memory
            cursor = conn.execute(
                "SELECT 'long_term_memory' as source_table, id as source_id, key || ': ' || value as snippet FROM long_term_memory WHERE key LIKE ? OR value LIKE ? LIMIT ?",
                (pattern, pattern, limit)
            )
            for row in cursor.fetchall():
                results.append(dict(row))

            # Search messages
            cursor = conn.execute(
                "SELECT 'messages' as source_table, id as source_id, content as snippet FROM messages WHERE content LIKE ? LIMIT ?",
                (pattern, limit)
            )
            for row in cursor.fetchall():
                results.append(dict(row))

        return results

    # --- Export / Import ---

    def export_full_memory_json(self) -> str:
        """Export all conversations, messages, facts, documents, corrections to JSON."""
        data = {
            "version": "0.1.0",
            "exported_at": time.time(),
            "conversations": self.list_conversations(limit=1000),
            "long_term_memory": self.list_long_term_facts(),
        }
        with self.get_connection() as conn:
            msgs = conn.execute("SELECT * FROM messages").fetchall()
            data["messages"] = [dict(m) for m in msgs]
            docs = conn.execute("SELECT * FROM documents").fetchall()
            data["documents"] = [dict(d) for d in docs]
            corrs = conn.execute("SELECT * FROM corrections").fetchall()
            data["corrections"] = [dict(c) for c in corrs]
        return json.dumps(data, indent=2, ensure_ascii=False)

    def log_audit(self, module: str, action: str, details: str, status: str = "SUCCESS") -> None:
        """Append an entry to security audit log."""
        with self.get_connection() as conn:
            conn.execute(
                "INSERT INTO audit_log (module, action, details, status, timestamp) VALUES (?, ?, ?, ?, ?)",
                (module, action, details, status, time.time())
            )
            conn.commit()

    def get_audit_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.execute(
                "SELECT id, module, action, details, status, timestamp FROM audit_log ORDER BY timestamp DESC LIMIT ?",
                (limit,)
            )
            return [dict(row) for row in cursor.fetchall()]
