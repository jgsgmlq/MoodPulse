// 情绪相关的工具函数

export type Emotion = 'happy' | 'calm' | 'worried' | 'tired' | 'sleepy'

export const emotionToEmoji = (emotion: Emotion): string => {
  const emojiMap: Record<Emotion, string> = {
    happy: '😊',
    calm: '😌',
    worried: '😟',
    tired: '😔',
    sleepy: '😴',
  }
  return emojiMap[emotion]
}

export const emotionToValue = (emotion: Emotion): number => {
  const valueMap: Record<Emotion, number> = {
    happy: 1,
    calm: 0.5,
    worried: -0.3,
    tired: -0.5,
    sleepy: -0.7,
  }
  return valueMap[emotion]
}

export const emotionToColor = (emotion: Emotion): string => {
  const colorMap: Record<Emotion, string> = {
    happy: '#FFD93D',
    calm: '#A8E6CF',
    worried: '#F8C8DC',
    tired: '#B4C7E7',
    sleepy: '#B4C7E7',
  }
  return colorMap[emotion]
}
