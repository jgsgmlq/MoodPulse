// Tauri API 封装

import { invoke } from '@tauri-apps/api/tauri'

export interface EmotionData {
  timestamp: string
  emotion: string
  confidence: number
}

// 保存情绪数据
export async function saveEmotionData(data: EmotionData[]): Promise<void> {
  try {
    await invoke('save_emotion_data', { data: JSON.stringify(data) })
  } catch (error) {
    console.error('Failed to save emotion data:', error)
    throw error
  }
}

// 加载情绪数据
export async function loadEmotionData(): Promise<EmotionData[]> {
  try {
    const result = await invoke<string>('load_emotion_data')
    return JSON.parse(result)
  } catch (error) {
    console.error('Failed to load emotion data:', error)
    return []
  }
}
