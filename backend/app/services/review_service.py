import sqlite3
import json
from pathlib import Path
from typing import Dict, Any, List, Optional

DB_PATH = Path(__file__).resolve().parent.parent.parent / "shikhar.db"

def init_db():
    """Initializes the SQLite review tracking database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reviews (
            id TEXT PRIMARY KEY,
            incident_id TEXT,
            review_type TEXT, -- 'incident', 'logistics', 'draft'
            status TEXT, -- 'pending', 'approved', 'rejected', 'published'
            reviewer_notes TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS public_broadcasts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            language TEXT,
            audience TEXT,
            body TEXT,
            published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

# Initialize on import
init_db()

class ReviewService:
    @staticmethod
    def set_approval_status(item_id: str, incident_id: str, review_type: str, status: str, notes: Optional[str] = None):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO reviews (id, incident_id, review_type, status, reviewer_notes)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                status = excluded.status,
                reviewer_notes = coalesce(excluded.reviewer_notes, reviewer_notes),
                updated_at = CURRENT_TIMESTAMP
        """, (item_id, incident_id, review_type, status, notes))
        conn.commit()
        conn.close()
        return {"id": item_id, "status": status, "review_type": review_type}

    @staticmethod
    def publish_broadcast(language: str, audience: str, body: str):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO public_broadcasts (language, audience, body)
            VALUES (?, ?, ?)
        """, (language, audience, body))
        conn.commit()
        conn.close()
        return {"status": "published", "body": body}

    @staticmethod
    def get_public_broadcasts() -> List[Dict[str, Any]]:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT language, audience, body, published_at FROM public_broadcasts ORDER BY published_at DESC")
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]