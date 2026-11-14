import sqlite3
import json
from pathlib import Path

db_path = Path(__file__).parent / "nexora.db"
print(f"Connecting to: {db_path} (exists: {db_path.exists()})")

conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

tables = [r[0] for r in cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").fetchall()]
table_counts = {}
for t in tables:
    count = cursor.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
    table_counts[t] = count

print("\nTABLE COUNTS:")
print(json.dumps(table_counts, indent=2))

print("\nLEARNERS:")
for l in cursor.execute("SELECT id, email, full_name, headline FROM learners").fetchall():
    print(dict(l))

print("\nCAREERS:")
for c in cursor.execute("SELECT id, slug, title FROM career_roles").fetchall():
    print(dict(c))
