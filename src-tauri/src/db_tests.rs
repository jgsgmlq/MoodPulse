// Database functionality tests
// Run: cargo test --package moodpulse --bin moodpulse test_database

#[cfg(test)]
mod tests {
    use crate::db::{Database, EmotionRecord};
    use std::path::PathBuf;
    use chrono::Utc;

    #[test]
    fn test_database_operations() {
        println!("\n{}", "=".repeat(50));
        println!("Test Database Operations");
        println!("{}", "=".repeat(50));

        // 1. Create test database
        println!("\n1. Create test database...");
        let test_db_path = PathBuf::from("test_emotions.db");

        // Remove old test database
        let _ = std::fs::remove_file(&test_db_path);

        let db = Database::new(test_db_path.clone()).expect("Failed to create database");
        db.init().expect("Failed to initialize database");
        println!("[OK] Database created successfully");

        // 2. Insert test record
        println!("\n2. Insert test record...");
        let now = Utc::now();
        let test_record = EmotionRecord {
            id: None,
            timestamp: now.timestamp(),
            datetime: now.format("%Y-%m-%d %H:%M:%S").to_string(),
            fer_emotion: "happy".to_string(),
            fer_confidence: 0.85,
            deepface_emotion: Some("happy".to_string()),
            deepface_confidence: Some(78.5),
            mapped_emotion: "happy".to_string(),
            work_minutes: 15.5,
            is_away: false,
            has_face: true,
        };

        let record_id = db.insert_record(&test_record).expect("Failed to insert record");
        println!("[OK] Record inserted successfully, ID: {}", record_id);

        // 3. Insert multiple test records
        println!("\n3. Insert multiple test records...");
        let emotions = vec!["happy", "calm", "worried", "tired"];
        for (i, emotion) in emotions.iter().enumerate() {
            let record = EmotionRecord {
                id: None,
                timestamp: now.timestamp() + (i as i64 * 60),
                datetime: now.format("%Y-%m-%d %H:%M:%S").to_string(),
                fer_emotion: emotion.to_string(),
                fer_confidence: 0.7 + (i as f64 * 0.05),
                deepface_emotion: Some(emotion.to_string()),
                deepface_confidence: Some(70.0 + (i as f64 * 5.0)),
                mapped_emotion: emotion.to_string(),
                work_minutes: 10.0 + (i as f64 * 5.0),
                is_away: false,
                has_face: true,
            };
            db.insert_record(&record).expect("Failed to insert record");
        }
        println!("[OK] Inserted {} records", emotions.len());

        // 4. Query recent records
        println!("\n4. Query recent records...");
        let recent_records = db.get_recent_records(10).expect("Failed to get recent records");
        println!("[OK] Found {} records", recent_records.len());

        for (i, record) in recent_records.iter().enumerate() {
            println!("   Record {}: {} - {} (confidence: {:.2})",
                i + 1,
                record.datetime,
                record.mapped_emotion,
                record.fer_confidence
            );
        }

        // 5. Test emotion statistics
        println!("\n5. Test emotion statistics...");
        let today = now.format("%Y-%m-%d").to_string();
        let stats = db.get_emotion_stats(&today).expect("Failed to get stats");
        println!("[OK] Today's emotion statistics:");
        for (emotion, count) in &stats {
            println!("   {}: {} times", emotion, count);
        }

        // 6. Test date range query
        println!("\n6. Test date range query...");
        let start_date = now.format("%Y-%m-%d 00:00:00").to_string();
        let end_date = now.format("%Y-%m-%d 23:59:59").to_string();
        let range_records = db.get_records_by_date_range(&start_date, &end_date)
            .expect("Failed to get records by date range");
        println!("[OK] Found {} records", range_records.len());

        // 7. Verify data integrity
        println!("\n7. Verify data integrity...");
        assert!(recent_records.len() >= 4, "Should have at least 4 records");
        assert!(stats.len() > 0, "Should have emotion statistics");

        // Verify emotion types
        for record in &recent_records {
            assert!(
                ["happy", "calm", "worried", "tired"].contains(&record.mapped_emotion.as_str()),
                "Emotion type should be one of the 4 types"
            );
        }

        println!("[OK] Data integrity verified");

        // 8. Clean up test database
        println!("\n8. Clean up test database...");
        drop(db);
        std::fs::remove_file(&test_db_path).expect("Failed to remove test database");
        println!("[OK] Test database cleaned up");

        println!("\n{}", "=".repeat(50));
        println!("[OK] All database tests passed!");
        println!("{}", "=".repeat(50));
    }

    #[test]
    fn test_emotion_record_serialization() {
        let record = EmotionRecord {
            id: Some(1),
            timestamp: 1234567890,
            datetime: "2025-12-27 12:00:00".to_string(),
            fer_emotion: "happy".to_string(),
            fer_confidence: 0.85,
            deepface_emotion: Some("happy".to_string()),
            deepface_confidence: Some(78.5),
            mapped_emotion: "happy".to_string(),
            work_minutes: 15.5,
            is_away: false,
            has_face: true,
        };

        // Test serialization
        let json = serde_json::to_string(&record).expect("Failed to serialize");
        assert!(json.contains("happy"));
        assert!(json.contains("0.85"));

        // Test deserialization
        let deserialized: EmotionRecord = serde_json::from_str(&json).expect("Failed to deserialize");
        assert_eq!(deserialized.fer_emotion, "happy");
        assert_eq!(deserialized.fer_confidence, 0.85);
    }
}
