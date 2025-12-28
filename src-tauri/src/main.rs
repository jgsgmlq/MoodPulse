// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent, Manager};
use std::sync::Mutex;
use chrono::Local;

mod audio;
use audio::AudioPlayer;

mod db;
use db::{Database, EmotionRecord};

mod emotion_service;
use emotion_service::EmotionService;

mod emotion_analysis;
use emotion_analysis::{analyze_today_emotions, get_emotion_timeline, analyze_focus_time};

#[cfg(test)]
mod db_tests;

// Global state
struct AppState {
    db: Mutex<Database>,
    audio: Mutex<AudioPlayer>,
    emotion_service: EmotionService,
}

// Tauri commands
#[tauri::command]
fn save_emotion_data(_data: String) -> Result<String, String> {
    Ok("Data saved successfully".to_string())
}

#[tauri::command]
fn load_emotion_data() -> Result<String, String> {
    Ok("{}".to_string())
}

#[tauri::command]
fn detect_emotion(state: tauri::State<AppState>) -> Result<String, String> {
    println!("detect_emotion called");

    // Use the persistent emotion service
    let result = state.emotion_service.detect_emotion()?;
    println!("Python output: {}", result);

    // Parse and save to database
    if let Ok(data) = serde_json::from_str::<serde_json::Value>(&result) {
        println!("JSON parsed successfully");
        if let Some(emotions) = data["emotions"].as_array() {
            println!("Found {} emotions", emotions.len());
            if let Some(first_emotion) = emotions.first() {
                println!("Processing emotion");
                let now = Local::now();

                // Get confidence values and normalize to 0-1 range
                let fer_conf = first_emotion.get("confidence")
                    .and_then(|v| v.as_f64())
                    .unwrap_or(0.0);
                let fer_confidence = if fer_conf > 1.0 { fer_conf / 100.0 } else { fer_conf };

                let deepface_conf = emotions.get(1)
                    .and_then(|e| e.get("confidence"))
                    .and_then(|v| v.as_f64());
                let deepface_confidence = deepface_conf.map(|c| if c > 1.0 { c / 100.0 } else { c });

                let record = EmotionRecord {
                    id: None,
                    timestamp: now.timestamp(),
                    datetime: now.format("%Y-%m-%d %H:%M:%S").to_string(),
                    fer_emotion: first_emotion.get("emotion")
                        .and_then(|v| v.as_str())
                        .unwrap_or("calm").to_string(),
                    fer_confidence,
                    deepface_emotion: emotions.get(1)
                        .and_then(|e| e.get("emotion"))
                        .and_then(|v| v.as_str())
                        .map(|s| s.to_string()),
                    deepface_confidence,
                    mapped_emotion: first_emotion.get("emotion")
                        .and_then(|v| v.as_str())
                        .unwrap_or("calm").to_string(),
                    work_minutes: data["work_minutes"].as_f64().unwrap_or(0.0),
                    is_away: data["is_away"].as_bool().unwrap_or(false),
                    has_face: data["has_face"].as_bool().unwrap_or(false),
                };

                let db = state.db.lock()
                    .map_err(|e| format!("Database lock poisoned: {}", e))?;
                match db.insert_record(&record) {
                    Ok(_) => println!("DB insert OK"),
                    Err(e) => eprintln!("DB insert error: {}", e),
                }
            }
        }
    } else {
        println!("JSON parse failed");
    }

    Ok(result)
}

#[tauri::command]
fn play_white_noise(state: tauri::State<AppState>, volume: f32) -> Result<(), String> {
    let mut audio = state.audio.lock()
        .map_err(|e| format!("Audio lock poisoned: {}", e))?;
    audio.play_white_noise(volume)
}

#[tauri::command]
fn stop_white_noise(state: tauri::State<AppState>) -> Result<(), String> {
    let mut audio = state.audio.lock()
        .map_err(|e| format!("Audio lock poisoned: {}", e))?;
    audio.stop();
    Ok(())
}

#[tauri::command]
fn set_white_noise_volume(state: tauri::State<AppState>, volume: f32) -> Result<(), String> {
    let audio = state.audio.lock()
        .map_err(|e| format!("Audio lock poisoned: {}", e))?;
    audio.set_volume(volume);
    Ok(())
}

#[tauri::command]
fn is_white_noise_playing(state: tauri::State<AppState>) -> Result<bool, String> {
    let audio = state.audio.lock()
        .map_err(|e| format!("Audio lock poisoned: {}", e))?;
    Ok(audio.is_playing())
}

#[tauri::command]
fn get_emotion_history(state: tauri::State<AppState>, limit: i64) -> Result<String, String> {
    let db = state.db.lock()
        .map_err(|e| format!("Database lock poisoned: {}", e))?;
    let records = db.get_recent_records(limit)
        .map_err(|e| format!("Database error: {}", e))?;
    serde_json::to_string(&records)
        .map_err(|e| format!("Serialization error: {}", e))
}

#[tauri::command]
fn get_emotion_stats(state: tauri::State<AppState>, date: String) -> Result<String, String> {
    let db = state.db.lock()
        .map_err(|e| format!("Database lock poisoned: {}", e))?;
    let stats = db.get_emotion_stats(&date)
        .map_err(|e| format!("Database error: {}", e))?;
    serde_json::to_string(&stats)
        .map_err(|e| format!("Serialization error: {}", e))
}

#[tauri::command]
fn get_emotion_by_date_range(
    state: tauri::State<AppState>,
    start_date: String,
    end_date: String
) -> Result<String, String> {
    let db = state.db.lock()
        .map_err(|e| format!("Database lock poisoned: {}", e))?;
    let records = db.get_records_by_date_range(&start_date, &end_date)
        .map_err(|e| format!("Database error: {}", e))?;
    serde_json::to_string(&records)
        .map_err(|e| format!("Serialization error: {}", e))
}

#[tauri::command]
fn analyze_today_emotion(state: tauri::State<AppState>) -> Result<String, String> {
    let db = state.db.lock()
        .map_err(|e| format!("Database lock poisoned: {}", e))?;

    let records = db.get_today_records()
        .map_err(|e| format!("Database error: {}", e))?;

    let analysis = analyze_today_emotions(records);

    serde_json::to_string(&analysis)
        .map_err(|e| format!("Serialization error: {}", e))
}

#[tauri::command]
fn get_emotion_timeline_data(state: tauri::State<AppState>) -> Result<String, String> {
    let db = state.db.lock()
        .map_err(|e| format!("Database lock poisoned: {}", e))?;

    let records = db.get_today_records()
        .map_err(|e| format!("Database error: {}", e))?;

    let timeline = get_emotion_timeline(records);

    serde_json::to_string(&timeline)
        .map_err(|e| format!("Serialization error: {}", e))
}

#[tauri::command]
fn analyze_focus_time_today(state: tauri::State<AppState>) -> Result<String, String> {
    let db = state.db.lock()
        .map_err(|e| format!("Database lock poisoned: {}", e))?;

    let records = db.get_today_records()
        .map_err(|e| format!("Database error: {}", e))?;

    let focus_analysis = analyze_focus_time(records);

    serde_json::to_string(&focus_analysis)
        .map_err(|e| format!("Serialization error: {}", e))
}

fn main() {
    // Initialize database
    let app_data_dir = tauri::api::path::app_data_dir(&tauri::Config::default())
        .expect("Failed to get app data directory");
    std::fs::create_dir_all(&app_data_dir).expect("Failed to create app data directory");
    let db_path = app_data_dir.join("emotions.db");
    let db = Database::new(db_path).expect("Failed to open database");
    db.init().expect("Failed to initialize database");

    // Initialize emotion service
    let python_path = std::env::var("MOODPULSE_PYTHON_PATH")
        .or_else(|_| std::env::var("PYTHON_PATH"))
        .unwrap_or_else(|_| "python".to_string());
    let script_path = std::env::current_exe()
        .ok()
        .and_then(|exe| exe.parent().map(|p| p.to_path_buf()))
        .map(|mut p| {
            if cfg!(debug_assertions) {
                p.pop();
                p.pop();
            }
            p.push("emotion_service.py");
            p
        })
        .expect("Failed to determine script path");

    let emotion_service = EmotionService::new(
        python_path,
        script_path.to_string_lossy().to_string()
    );

    // Start the emotion service
    if let Err(e) = emotion_service.start() {
        eprintln!("Failed to start emotion service: {}", e);
    }

    let app_state = AppState {
        db: Mutex::new(db),
        audio: Mutex::new(AudioPlayer::new()),
        emotion_service,
    };

    // System tray menu
    let show = CustomMenuItem::new("show".to_string(), "显示");
    let hide = CustomMenuItem::new("hide".to_string(), "隐藏");
    let quit = CustomMenuItem::new("quit".to_string(), "退出");

    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(hide)
        .add_native_item(tauri::SystemTrayMenuItem::Separator)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .manage(app_state)
        .system_tray(system_tray)
        .on_window_event(|event| {
            if let tauri::WindowEvent::CloseRequested { api: _, .. } = event.event() {
                let app_handle = event.window().app_handle();
                let state = app_handle.state::<AppState>();

                // Stop emotion service and wait for it to complete
                println!("Closing application, stopping emotion service...");
                if let Err(e) = state.emotion_service.stop() {
                    eprintln!("Error stopping emotion service: {}", e);
                }

                // Stop audio
                if let Ok(mut audio) = state.audio.lock() {
                    audio.stop();
                };

                // Allow window to close normally instead of forcing exit
                // This gives time for cleanup
            }
        })
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { .. } => {
                let window = app.get_window("main").unwrap();
                window.show().unwrap();
                window.set_focus().unwrap();
            }
            SystemTrayEvent::MenuItemClick { id, .. } => {
                match id.as_str() {
                    "show" => {
                        let window = app.get_window("main").unwrap();
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                    "hide" => {
                        let window = app.get_window("main").unwrap();
                        window.hide().unwrap();
                    }
                    "quit" => {
                        let state = app.state::<AppState>();
                        println!("Quit requested from tray, stopping emotion service...");
                        if let Err(e) = state.emotion_service.stop() {
                            eprintln!("Error stopping emotion service: {}", e);
                        }
                        // Stop audio
                        if let Ok(mut audio) = state.audio.lock() {
                            audio.stop();
                        }
                        // Exit the app
                        app.exit(0);
                    }
                    _ => {}
                }
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            save_emotion_data,
            load_emotion_data,
            detect_emotion,
            play_white_noise,
            stop_white_noise,
            set_white_noise_volume,
            is_white_noise_playing,
            get_emotion_history,
            get_emotion_stats,
            get_emotion_by_date_range,
            analyze_today_emotion,
            get_emotion_timeline_data,
            analyze_focus_time_today
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
