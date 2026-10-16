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
# Publish a broadcast message to the public portal
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
# Retrieve all published broadcasts for the public portal
    @staticmethod
    def get_public_broadcasts() -> List[Dict[str, Any]]:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT language, audience, body, published_at FROM public_broadcasts ORDER BY published_at DESC")
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    # Log a new victim request with location data
    @staticmethod
    def log_victim_request(name: str, need: str, latitude: float, longitude: float):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS victim_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                need TEXT,
                latitude REAL,
                longitude REAL,
                status TEXT DEFAULT 'pending_rescue',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            INSERT INTO victim_requests (name, need, latitude, longitude)
            VALUES (?, ?, ?, ?)
        """, (name, need, latitude, longitude))
        conn.commit()
        conn.close()
        return {"status": "success", "name": name}
# Retrieve all logged victim requests
    @staticmethod
    def get_victim_requests():
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS victim_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                need TEXT,
                latitude REAL,
                longitude REAL,
                status TEXT DEFAULT 'pending_rescue',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("SELECT id, name, need, latitude, longitude, status, created_at FROM victim_requests ORDER BY created_at DESC")
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    # Update the status of a specific victim request
    @staticmethod
    def update_rescue_status(request_id: int, status: str):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE victim_requests
            SET status = ?
            WHERE id = ?
        """, (status, request_id))
        conn.commit()
        conn.close()
        return {"status": "success", "id": request_id, "new_status": status}