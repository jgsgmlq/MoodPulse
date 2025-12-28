fn main() {
    // Skip icon embedding in development
    if std::env::var("PROFILE").unwrap_or_default() == "debug" {
        return;
    }
    tauri_build::build()
}
