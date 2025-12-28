import { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export interface EmotionData {
  emotion: 'happy' | 'calm' | 'worried' | 'tired';
  confidence: number;
  source: 'fer' | 'deepface';
}

export interface DetectionResult {
  has_face: boolean;
  is_away: boolean;
  work_minutes: number;
  need_break_alert: boolean;
  emotions: EmotionData[];
}

export function useEmotionDetection(interval: number = 5000, paused: boolean = false) {
  const [emotionData, setEmotionData] = useState<DetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDetectingRef = useRef(false);

  const detectEmotion = useCallback(async () => {
    if (isDetectingRef.current) return; // Skip if already detecting

    try {
      isDetectingRef.current = true;
      setIsDetecting(true);
      const result = await invoke<string>('detect_emotion');
      const data: DetectionResult = JSON.parse(result);
      setEmotionData(data);
      setError(null);
    } catch (err) {
      setError(err as string);
      console.error('Emotion detection error:', err);
    } finally {
      isDetectingRef.current = false;
      setIsDetecting(false);
    }
  }, []);

  useEffect(() => {
    let timeoutId: number;
    let isActive = true;

    const scheduleNextDetection = async () => {
      if (!isActive || paused) return;

      await detectEmotion();

      if (isActive && !paused) {
        timeoutId = setTimeout(scheduleNextDetection, interval);
      }
    };

    // Start first detection only if not paused
    if (!paused) {
      scheduleNextDetection();
    }

    return () => {
      isActive = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [detectEmotion, interval, paused]);

  return {
    emotionData,
    isDetecting,
    error,
    detectEmotion
  };
}
