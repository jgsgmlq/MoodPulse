import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export interface FocusAnalysis {
  total_focus_sessions: number;  // 今日专注次数
  current_focus_duration: number; // 当前专注时长（分钟）
  is_currently_focusing: boolean; // 是否正在专注
  total_focus_time: number;       // 今日总专注时长（分钟）
}

export function useFocusAnalysis(autoRefreshInterval: number = 30000) {
  const [focusData, setFocusData] = useState<FocusAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFocusData = async () => {
    try {
      setLoading(true);
      const result = await invoke<string>('analyze_focus_time_today');
      const data: FocusAnalysis = JSON.parse(result);
      setFocusData(data);
      setError(null);
    } catch (err) {
      setError(err as string);
      console.error('Failed to fetch focus analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFocusData();
    if (autoRefreshInterval > 0) {
      const intervalId = setInterval(fetchFocusData, autoRefreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [autoRefreshInterval]);

  return {
    focusData,
    loading,
    error,
    refetch: fetchFocusData
  };
}
