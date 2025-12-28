import { useEmotionStore, Emotion } from '../stores/emotionStore'

export function EmotionControls() {
  const { currentEmotion, setCurrentEmotion } = useEmotionStore()

  const emotions: Array<{ value: Emotion; label: string; emoji: string; color: string }> = [
    { value: 'happy', label: '开心', emoji: '😊', color: 'bg-emotion-happy' },
    { value: 'calm', label: '平静', emoji: '😌', color: 'bg-emotion-calm' },
    { value: 'worried', label: '担心', emoji: '😟', color: 'bg-emotion-stressed' },
    { value: 'tired', label: '疲惫', emoji: '😔', color: 'bg-emotion-sad' },
    { value: 'sleepy', label: '困倦', emoji: '😴', color: 'bg-emotion-sad' }
  ]

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl p-4">
      <div className="text-sm text-gray-600 mb-3 text-center">切换情绪状态</div>
      <div className="flex gap-2">
        {emotions.map((emotion) => (
          <button
            key={emotion.value}
            onClick={() => setCurrentEmotion(emotion.value)}
            className={`
              flex flex-col items-center gap-1 px-4 py-2 rounded-xl
              transition-all duration-200
              ${currentEmotion === emotion.value
                ? 'bg-purple-100 ring-2 ring-purple-400 scale-105'
                : 'bg-gray-50 hover:bg-gray-100'
              }
            `}
          >
            <span className="text-2xl">{emotion.emoji}</span>
            <span className="text-xs text-gray-700">{emotion.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
