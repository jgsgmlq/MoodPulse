use rodio::{Decoder, OutputStream, Sink, Source};
use std::fs::File;
use std::io::BufReader;
use std::path::PathBuf;

pub struct AudioPlayer {
    sink: Option<Sink>,
    _stream: Option<OutputStream>,
}

// SAFETY: AudioPlayer is protected by Mutex in AppState, ensuring single-threaded access
unsafe impl Send for AudioPlayer {}
unsafe impl Sync for AudioPlayer {}

impl AudioPlayer {
    pub fn new() -> Self {
        Self {
            sink: None,
            _stream: None,
        }
    }

    pub fn play_white_noise(&mut self, volume: f32) -> Result<(), String> {
        self.stop();

        let (stream, stream_handle) = OutputStream::try_default()
            .map_err(|e| format!("Failed to create audio stream: {}", e))?;

        let sink = Sink::try_new(&stream_handle)
            .map_err(|e| format!("Failed to create sink: {}", e))?;

        // Try to find the white noise file
        // In development: src/assets/sounds/rain.mp3
        // In production: assets/sounds/rain.mp3 (bundled with app)
        let possible_paths = vec![
            PathBuf::from("src/assets/sounds/rain.mp3"),
            PathBuf::from("assets/sounds/rain.mp3"),
            PathBuf::from("../src/assets/sounds/rain.mp3"),
        ];

        let mut audio_file = None;
        for path in possible_paths {
            if path.exists() {
                audio_file = Some(path);
                break;
            }
        }

        let audio_path = audio_file.ok_or_else(|| {
            "White noise file not found. Please ensure rain.mp3 exists in assets/sounds/".to_string()
        })?;

        let file = File::open(&audio_path)
            .map_err(|e| format!("Failed to open audio file: {}", e))?;

        let source = Decoder::new(BufReader::new(file))
            .map_err(|e| format!("Failed to decode audio file: {}", e))?
            .repeat_infinite();

        sink.set_volume(volume);
        sink.append(source);

        self.sink = Some(sink);
        self._stream = Some(stream);

        Ok(())
    }

    pub fn stop(&mut self) {
        if let Some(sink) = &self.sink {
            sink.stop();
        }
        self.sink = None;
        self._stream = None;
    }

    pub fn set_volume(&self, volume: f32) {
        if let Some(sink) = &self.sink {
            sink.set_volume(volume);
        }
    }

    pub fn is_playing(&self) -> bool {
        self.sink.is_some()
    }
}
