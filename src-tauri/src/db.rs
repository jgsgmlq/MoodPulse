use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct EmotionRecord {
    pub id: Option<i64>,
    pub timestamp: i64,
    pub datetime: String,
    pub fer_emotion: String,
    pub fer_confidence: f64,
    pub deepface_emotion: Option<String>,
    pub deepface_confidence: Option<f64>,
    pub mapped_emotion: String,
    pub work_minutes: f64,
    pub is_away: bool,
    pub has_face: bool,
}

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new(db_path: PathBuf) -> Result<Self> {
        let conn = Connection::open(db_path)?;
        Ok(Database { conn })
    }

    pub fn init(&self) -> Result<()> {
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS emotion_records (
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
            )",
            [],
        )?;

        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_timestamp ON emotion_records(timestamp)",
            [],
        )?;

        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_datetime ON emotion_records(datetime)",
            [],
        )?;

        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_mapped_emotion ON emotion_records(mapped_emotion)",
            [],
        )?;

        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_datetime_emotion ON emotion_records(datetime, mapped_emotion)",
            [],
        )?;

        Ok(())
    }

    pub fn insert_record(&self, record: &EmotionRecord) -> Result<i64> {
        self.conn.execute(
            "INSERT INTO emotion_records (
                timestamp, datetime,
                fer_emotion, fer_confidence,
                deepface_emotion, deepface_confidence,
                mapped_emotion,
                work_minutes, is_away, has_face
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            rusqlite::params![
                record.timestamp,
                record.datetime,
                record.fer_emotion,
                record.fer_confidence,
                record.deepface_emotion,
                record.deepface_confidence,
                record.mapped_emotion,
                record.work_minutes,
                record.is_away as i32,
                record.has_face as i32,
            ],
        )?;

        Ok(self.conn.last_insert_rowid())
    }

    pub fn get_recent_records(&self, limit: i64) -> Result<Vec<EmotionRecord>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, timestamp, datetime, fer_emotion, fer_confidence,
                    deepface_emotion, deepface_confidence, mapped_emotion,
                    work_minutes, is_away, has_face
             FROM emotion_records
             ORDER BY timestamp DESC
             LIMIT ?1"
        )?;

        let records = stmt.query_map([limit], |row| {
            Ok(EmotionRecord {
                id: Some(row.get(0)?),
                timestamp: row.get(1)?,
                datetime: row.get(2)?,
                fer_emotion: row.get(3)?,
                fer_confidence: row.get(4)?,
                deepface_emotion: row.get(5)?,
                deepface_confidence: row.get(6)?,
                mapped_emotion: row.get(7)?,
                work_minutes: row.get(8)?,
                is_away: row.get::<_, i32>(9)? != 0,
                has_face: row.get::<_, i32>(10)? != 0,
            })
        })?;

        records.collect()
    }

    pub fn get_records_by_date_range(&self, start_date: &str, end_date: &str) -> Result<Vec<EmotionRecord>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, timestamp, datetime, fer_emotion, fer_confidence,
                    deepface_emotion, deepface_confidence, mapped_emotion,
                    work_minutes, is_away, has_face
             FROM emotion_records
             WHERE datetime BETWEEN ?1 AND ?2
             ORDER BY timestamp ASC"
        )?;

        let records = stmt.query_map([start_date, end_date], |row| {
            Ok(EmotionRecord {
                id: Some(row.get(0)?),
                timestamp: row.get(1)?,
                datetime: row.get(2)?,
                fer_emotion: row.get(3)?,
                fer_confidence: row.get(4)?,
                deepface_emotion: row.get(5)?,
                deepface_confidence: row.get(6)?,
                mapped_emotion: row.get(7)?,
                work_minutes: row.get(8)?,
                is_away: row.get::<_, i32>(9)? != 0,
                has_face: row.get::<_, i32>(10)? != 0,
            })
        })?;

        records.collect()
    }

    pub fn get_emotion_stats(&self, date: &str) -> Result<Vec<(String, i64)>> {
        let mut stmt = self.conn.prepare(
            "SELECT mapped_emotion, COUNT(*) as count
             FROM emotion_records
             WHERE date(datetime) = date(?1)
             GROUP BY mapped_emotion
             ORDER BY count DESC"
        )?;

        let stats = stmt.query_map([date], |row| {
            Ok((row.get(0)?, row.get(1)?))
        })?;

        stats.collect()
    }

    pub fn get_today_records(&self) -> Result<Vec<EmotionRecord>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, timestamp, datetime, fer_emotion, fer_confidence,
                    deepface_emotion, deepface_confidence, mapped_emotion,
                    work_minutes, is_away, has_face
             FROM emotion_records
             WHERE date(datetime) = date('now', 'localtime')
             ORDER BY timestamp ASC"
        )?;

        let records = stmt.query_map([], |row| {
            Ok(EmotionRecord {
                id: Some(row.get(0)?),
                timestamp: row.get(1)?,
                datetime: row.get(2)?,
                fer_emotion: row.get(3)?,
                fer_confidence: row.get(4)?,
                deepface_emotion: row.get(5)?,
                deepface_confidence: row.get(6)?,
                mapped_emotion: row.get(7)?,
                work_minutes: row.get(8)?,
                is_away: row.get::<_, i32>(9)? != 0,
                has_face: row.get::<_, i32>(10)? != 0,
            })
        })?;

        records.collect()
    }
}
