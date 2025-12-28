import sqlite3
import os
from datetime import datetime

# Database path (development mode uses Roaming directly)
db_path = os.path.expanduser(r'C:\Users\lenovo\AppData\Roaming\emotions.db')

# Check if database exists
if not os.path.exists(db_path):
    print(f"Database not found at: {db_path}")
    exit(1)

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all records
cursor.execute("SELECT * FROM emotion_records ORDER BY timestamp DESC")
records = cursor.fetchall()

# Get column names
cursor.execute("PRAGMA table_info(emotion_records)")
columns = [col[1] for col in cursor.fetchall()]

# Display results
print(f"\n{'='*100}")
print(f"MoodPulse Database Viewer")
print(f"{'='*100}")
print(f"Database: {db_path}")
print(f"Total Records: {len(records)}")
print(f"{'='*100}\n")

if not records:
    print("No records found in database")
else:
    for i, record in enumerate(records, 1):
        print(f"Record #{i}")
        print("-" * 80)
        for col, val in zip(columns, record):
            if col == 'timestamp':
                # Convert timestamp to readable format
                try:
                    dt = datetime.fromisoformat(val)
                    val = dt.strftime('%Y-%m-%d %H:%M:%S')
                except:
                    pass
            print(f"  {col:20s}: {val}")
        print()

conn.close()
print(f"{'='*100}")
print("Done!")
