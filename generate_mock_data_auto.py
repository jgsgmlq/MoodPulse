import sqlite3
import random
import os
from datetime import datetime, timedelta
from pathlib import Path

def find_or_create_database():
    """查找或创建数据库文件"""
    # 可能的数据库位置
    possible_paths = [
        # Windows AppData路径
        Path(os.environ.get('APPDATA', '')) / 'com.moodpulse.dev' / 'emotions.db',
        Path(os.environ.get('LOCALAPPDATA', '')) / 'com.moodpulse.dev' / 'emotions.db',
        # 当前目录
        Path('emotions.db'),
        Path('src-tauri/emotions.db'),
    ]

    for path in possible_paths:
        if path.exists():
            print(f"[OK] Found database: {path}")
            return str(path)

    print("[INFO] Database file not found, creating new one...")

    # 在当前目录创建数据库
    db_path = Path('emotions.db')
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()

    # 创建表结构
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS emotion_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp INTEGER NOT NULL,
            datetime TEXT NOT NULL,
            fer_emotion TEXT NOT NULL,
            fer_confidence REAL NOT NULL,
            deepface_emotion TEXT,
            deepface_confidence REAL,
            mapped_emotion TEXT NOT NULL,
            work_minutes REAL NOT NULL,
            is_away INTEGER NOT NULL,
            has_face INTEGER NOT NULL,
            CHECK (fer_confidence >= 0 AND fer_confidence <= 1),
            CHECK (deepface_confidence IS NULL OR (deepface_confidence >= 0 AND deepface_confidence <= 1)),
            CHECK (mapped_emotion IN ('happy', 'calm', 'worried', 'tired')),
            CHECK (is_away IN (0, 1)),
            CHECK (has_face IN (0, 1))
        )
    """)

    # 创建索引
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_timestamp ON emotion_records(timestamp)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_datetime ON emotion_records(datetime)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_mapped_emotion ON emotion_records(mapped_emotion)")

    conn.commit()
    conn.close()

    print(f"[OK] Created database: {db_path}")
    return str(db_path)

def generate_emotion_data(db_path):
    """生成符合打工人特征的情绪数据"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 开始时间：2025-12-28 08:00:00
    start_time = datetime(2025, 12, 28, 8, 0, 0)
    interval = timedelta(seconds=5)
    end_time = datetime(2025, 12, 28, 13, 40, 0)

    current_time = start_time
    work_start = start_time
    record_count = 0

    print(f"\n开始生成数据：{start_time.strftime('%Y-%m-%d %H:%M:%S')} 到 {end_time.strftime('%Y-%m-%d %H:%M:%S')}")

    while current_time <= end_time:
        work_minutes = (current_time - work_start).total_seconds() / 60
        hour = current_time.hour
        minute = current_time.minute

        # 根据时间段确定情绪分布
        if hour == 8:
            # 8:00-9:00: 刚上班，平静为主
            emotion_weights = {'calm': 0.7, 'happy': 0.2, 'worried': 0.1, 'tired': 0.0}
            is_away_prob = 0.05
        elif hour == 9 or (hour == 10 and minute < 30):
            # 9:00-10:30: 工作状态良好
            emotion_weights = {'happy': 0.5, 'calm': 0.4, 'worried': 0.1, 'tired': 0.0}
            is_away_prob = 0.03
        elif (hour == 10 and minute >= 30) or (hour == 11 and minute < 30):
            # 10:30-11:30: 工作压力增加
            emotion_weights = {'worried': 0.5, 'calm': 0.3, 'tired': 0.15, 'happy': 0.05}
            is_away_prob = 0.08
        elif hour == 11 and minute >= 30:
            # 11:30-12:00: 午饭前疲惫
            emotion_weights = {'tired': 0.6, 'worried': 0.2, 'calm': 0.2, 'happy': 0.0}
            is_away_prob = 0.15
        elif hour == 12:
            # 12:00-13:00: 午休
            emotion_weights = {'calm': 0.6, 'happy': 0.3, 'tired': 0.1, 'worried': 0.0}
            is_away_prob = 0.7
        else:
            # 13:00-13:40: 下午开始工作
            emotion_weights = {'calm': 0.5, 'happy': 0.3, 'worried': 0.1, 'tired': 0.1}
            is_away_prob = 0.05

        is_away = random.random() < is_away_prob
        has_face = not is_away

        if is_away:
            work_start = current_time
            work_minutes = 0

        emotion = random.choices(
            list(emotion_weights.keys()),
            weights=list(emotion_weights.values())
        )[0]

        fer_confidence = random.uniform(0.65, 0.95)
        deepface_confidence = random.uniform(0.60, 0.90) if random.random() > 0.1 else None

        fer_raw_emotions = {
            'happy': ['happy', 'surprise'],
            'calm': ['neutral'],
            'worried': ['sad', 'fear', 'angry'],
            'tired': ['sad', 'neutral']
        }

        fer_emotion = random.choice(fer_raw_emotions[emotion])
        deepface_emotion = random.choice(fer_raw_emotions[emotion]) if deepface_confidence else None

        cursor.execute("""
            INSERT INTO emotion_records (
                timestamp, datetime,
                fer_emotion, fer_confidence,
                deepface_emotion, deepface_confidence,
                mapped_emotion,
                work_minutes, is_away, has_face
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            int(current_time.timestamp()),
            current_time.strftime('%Y-%m-%d %H:%M:%S'),
            fer_emotion,
            fer_confidence,
            deepface_emotion,
            deepface_confidence,
            emotion,
            work_minutes,
            1 if is_away else 0,
            1 if has_face else 0
        ))

        record_count += 1
        if record_count % 500 == 0:
            print(f"已生成 {record_count} 条记录... 当前时间: {current_time.strftime('%H:%M:%S')}")

        current_time += interval

    conn.commit()
    conn.close()

    print(f"\n[SUCCESS] Data generation completed!")
    print(f"[INFO] Total records: {record_count}")
    print(f"[INFO] Time range: {start_time.strftime('%Y-%m-%d %H:%M:%S')} to {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"\nEmotion distribution:")
    print(f"  08:00-09:00: Calm (just arrived)")
    print(f"  09:00-10:30: Happy/Calm (good working state)")
    print(f"  10:30-11:30: Worried/Tired (work pressure)")
    print(f"  11:30-12:00: Tired (before lunch)")
    print(f"  12:00-13:00: Calm/Happy (lunch break, 70% away)")
    print(f"  13:00-13:40: Calm (afternoon start)")

if __name__ == "__main__":
    print("=" * 60)
    print("MoodPulse Mock Data Generator")
    print("=" * 60)

    db_path = find_or_create_database()

    try:
        generate_emotion_data(db_path)
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
