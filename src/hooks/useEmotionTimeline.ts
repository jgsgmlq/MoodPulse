import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export interface TimelinePoint {
  time: string;
  value: number;
  emoji: string;
  emotion: string;
}

export function useEmotionTimeline(autoRefreshInterval: number = 30000) {
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const result = await invoke<string>('get_emotion_timeline_data');
      const data: TimelinePoint[] = JSON.parse(result);
      setTimeline(data);
      setError(null);
    } catch (err) {
      setError(err as string);
      console.error('Failed to fetch emotion timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
    if (autoRefreshInterval > 0) {
      const intervalId = setInterval(fetchTimeline, autoRefreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [autoRefreshInterval]);

  return {
    timeline,
    loading,
    error,
    refetch: fetchTimeline
  };
}
