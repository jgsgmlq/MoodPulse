import { create } from 'zustand'

export type Emotion = 'happy' | 'calm' | 'worried' | 'tired' | 'sleepy'

interface EmotionSnapshot {
  timestamp: string
  emotion: Emotion
  confidence: number
}

interface EmotionStore {
  currentEmotion: Emotion
  emotionHistory: EmotionSnapshot[]
  widgetName: string
  setCurrentEmotion: (emotion: Emotion) => void
  addEmotionSnapshot: (snapshot: EmotionSnapshot) => void
  setWidgetName: (name: string) => void
}

export const useEmotionStore = create<EmotionStore>((set) => ({
  currentEmotion: 'calm',
  emotionHistory: [],
  widgetName: 'MoodPulse',
  setCurrentEmotion: (emotion) => set({ currentEmotion: emotion }),
  addEmotionSnapshot: (snapshot) =>
    set((state) => ({
      emotionHistory: [...state.emotionHistory, snapshot],
    })),
  setWidgetName: (name) => set({ widgetName: name }),
}))
