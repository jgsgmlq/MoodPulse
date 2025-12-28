use std::process::{Child, Command, Stdio};
use std::io::{BufRead, BufReader, Write};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use std::thread;

pub struct EmotionService {
    process: Arc<Mutex<Option<Child>>>,
    python_path: String,
    script_path: String,
}

impl EmotionService {
    pub fn new(python_path: String, script_path: String) -> Self {
        EmotionService {
            process: Arc::new(Mutex::new(None)),
            python_path,
            script_path,
        }
    }

    pub fn start(&self) -> Result<(), String> {
        let mut process_guard = self.process.lock()
            .map_err(|e| format!("Handle lock poisoned: {}", e))?;

        if process_guard.is_some() {
            return Ok(());
        }

        println!("Starting Python emotion service...");

        let child = Command::new(&self.python_path)
            .arg(&self.script_path)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to start Python process: {}", e))?;

        println!("Python emotion service started with PID: {:?}", child.id());
        *process_guard = Some(child);

        Ok(())
    }

    pub fn detect_emotion(&self) -> Result<String, String> {
        let mut process_guard = self.process.lock()
            .map_err(|e| format!("Handle lock poisoned: {}", e))?;

        let process = process_guard.as_mut()
            .ok_or_else(|| "Python process not started".to_string())?;

        // Write command to stdin
        if let Some(stdin) = process.stdin.as_mut() {
            stdin.write_all(b"DETECT\n")
                .map_err(|e| format!("Failed to write to Python stdin: {}", e))?;
            stdin.flush()
                .map_err(|e| format!("Failed to flush Python stdin: {}", e))?;
        } else {
            return Err("Python stdin not available".to_string());
        }

        // Read response from stdout
        if let Some(stdout) = process.stdout.as_mut() {
            let mut reader = BufReader::new(stdout);
            let mut line = String::new();
            reader.read_line(&mut line)
                .map_err(|e| format!("Failed to read from Python stdout: {}", e))?;

            Ok(line.trim().to_string())
        } else {
            Err("Python stdout not available".to_string())
        }
    }

    pub fn stop(&self) -> Result<(), String> {
        let mut process_guard = self.process.lock()
            .map_err(|e| format!("Handle lock poisoned: {}", e))?;

        if let Some(mut process) = process_guard.take() {
            println!("Stopping Python emotion service...");

            // Try to send QUIT command
            if let Some(stdin) = process.stdin.as_mut() {
                let _ = stdin.write_all(b"QUIT\n");
                let _ = stdin.flush();
            }

            // Wait for process to exit with timeout using try_wait
            let timeout = Duration::from_secs(5);
            let start = Instant::now();
            let mut exited = false;

            while start.elapsed() < timeout {
                match process.try_wait() {
                    Ok(Some(status)) => {
                        println!("Python process exited gracefully with status: {}", status);
                        exited = true;
                        break;
                    }
                    Ok(None) => {
                        // Process still running, sleep briefly
                        thread::sleep(Duration::from_millis(100));
                    }
                    Err(e) => {
                        eprintln!("Error checking Python process status: {}", e);
                        break;
                    }
                }
            }

            if !exited {
                // Process didn't exit within timeout, force kill
                eprintln!("Python process didn't exit within timeout, forcing kill...");
                match process.kill() {
                    Ok(_) => {
                        println!("Python process killed successfully");
                        // Wait for the killed process to be reaped
                        let _ = process.wait();
                    }
                    Err(e) => eprintln!("Error killing Python process: {}", e),
                }
            }
        }

        Ok(())
    }
}

impl Drop for EmotionService {
    fn drop(&mut self) {
        let _ = self.stop();
    }
}
