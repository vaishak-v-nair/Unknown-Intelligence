import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'unknown_unknowns.db')

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    # Enable WAL mode for better concurrency (Staff Eng Review Pillar 1)
    conn.execute("PRAGMA journal_mode=WAL;")
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Entities: issues, pull requests, authors, subsystems
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS entities (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT,
        url TEXT
    )
    ''')
    
    # Events: opened, closed, commented
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        entity_id TEXT,
        event_type TEXT NOT NULL,
        timestamp DATETIME,
        actor TEXT,
        FOREIGN KEY (entity_id) REFERENCES entities (id)
    )
    ''')
    
    # Observations: the actual content (body, comments, diffs)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS observations (
        id TEXT PRIMARY KEY,
        event_id TEXT,
        content TEXT,
        extracted_claims TEXT,
        FOREIGN KEY (event_id) REFERENCES events (id)
    )
    ''')
    
    # Findings: what the system discovers
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS findings (
        id TEXT PRIMARY KEY,
        hash_key TEXT UNIQUE,
        claim TEXT,
        evidence_ids TEXT,
        significance_score REAL,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Indices to support resource bounds (Staff Eng Review Pillar 3)
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_events_actor ON events(actor)')

    # RAG Layer: FTS5 Virtual Table for full-text search on observations
    cursor.execute('''
    CREATE VIRTUAL TABLE IF NOT EXISTS observations_fts USING fts5(
        content,
        extracted_claims,
        content='observations',
        content_rowid='rowid'
    )
    ''')
    
    # Triggers to keep FTS index synced with observations table
    cursor.execute('''
    CREATE TRIGGER IF NOT EXISTS observations_ai AFTER INSERT ON observations BEGIN
        INSERT INTO observations_fts(rowid, content, extracted_claims)
        VALUES (new.rowid, new.content, new.extracted_claims);
    END;
    ''')
    cursor.execute('''
    CREATE TRIGGER IF NOT EXISTS observations_ad AFTER DELETE ON observations BEGIN
        INSERT INTO observations_fts(observations_fts, rowid, content, extracted_claims)
        VALUES ('delete', old.rowid, old.content, old.extracted_claims);
    END;
    ''')
    cursor.execute('''
    CREATE TRIGGER IF NOT EXISTS observations_au AFTER UPDATE ON observations BEGIN
        INSERT INTO observations_fts(observations_fts, rowid, content, extracted_claims)
        VALUES ('delete', old.rowid, old.content, old.extracted_claims);
        INSERT INTO observations_fts(rowid, content, extracted_claims)
        VALUES (new.rowid, new.content, new.extracted_claims);
    END;
    ''')

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
