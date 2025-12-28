import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export interface EmotionAnalysis {
  emotion_index: number;      // 情绪指数 (1-10)
  stress_level: number;        // 压力水平 (0-100)
  total_records: number;       // 总记录数
  valid_records: number;       // 有效记录数
}

export function useEmotionAnalysis(autoRefreshInterval: number = 30000) {
  const [analysis, setAnalysis] = useState<EmotionAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const result = await invoke<string>('analyze_today_emotion');
      const data: EmotionAnalysis = JSON.parse(result);
      setAnalysis(data);
      setError(null);
    } catch (err) {
      setError(err as string);
      console.error('Failed to fetch emotion analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 立即获取一次数据
    fetchAnalysis();

    // 如果设置了自动刷新间隔，则定时刷新
    if (autoRefreshInterval > 0) {
      const intervalId = setInterval(fetchAnalysis, autoRefreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [autoRefreshInterval]);

  return {
    analysis,
    loading,
    error,
    refetch: fetchAnalysis
  };
}
