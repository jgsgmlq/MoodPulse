import { useState, useEffect } from 'react'
import { PetCharacter } from './components/Pet'
import type { PetState, InteractionState } from './components/Pet'
import { HoverToolbar } from './components/HoverToolbar'
import { useEmotionDetection } from './hooks/useEmotionDetection'
import { useEmotionStore } from './stores/emotionStore'
import { appWindow } from '@tauri-apps/api/window'
import { WebviewWindow } from '@tauri-apps/api/window'
import { Minimize2, X } from 'lucide-react'

export default function App() {
  const [petState, setPetState] = useState<PetState>('calm')
  const [interactionState, setInteractionState] = useState<InteractionState>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [privacyMode, setPrivacyMode] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const { emotionData } = useEmotionDetection(5000, isPaused || privacyMode)
  const { setCurrentEmotion } = useEmotionStore()

  useEffect(() => {
    if (emotionData?.emotions?.[0] && !isPaused && !privacyMode) {
      const emotion = emotionData.emotions[0]
      setPetState(emotion.emotion as PetState)
      setCurrentEmotion(emotion.emotion)
    }
  }, [emotionData, setCurrentEmotion, isPaused, privacyMode])

  const handlePause = () => {
    setIsPaused(!isPaused)
    if (!isPaused) {
      setPetState('sleepy')
    } else {
      setPetState('calm')
    }
  }

  const handlePrivacyMode = () => {
    setPrivacyMode(!privacyMode)
    setPetState(privacyMode ? 'calm' : 'sleepy')
  }

  const handleInteractionEnd = () => {
    setInteractionState(null)
  }

  const handleHide = async () => {
    await appWindow.hide()
  }

  const handleClose = async () => {
    await appWindow.close()
  }

  const handleShowReport = async () => {
    try {
      const reportWindow = WebviewWindow.getByLabel('report')
      if (reportWindow) {
        await reportWindow.show()
        await reportWindow.setFocus()
      }
    } catch (error) {
      console.error('Failed to show report window:', error)
    }
  }

  // 拖拽检测
  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mouseup', handleMouseUp)
    return () => document.removeEventListener('mouseup', handleMouseUp)
  }, [])

  return (
    <div className="w-screen h-screen relative flex flex-col overflow-hidden" style={{ transform: 'scale(0.7)', transformOrigin: 'center center' }}>
      {/* Draggable Area */}
      <div
        data-tauri-drag-region
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        className="absolute top-0 left-0 right-0 h-12 z-40 cursor-move"
      />

      {/* Top Control Bar */}
      <div className="absolute top-0 right-0 flex gap-1 p-2 z-50">
        <button
          onClick={handleHide}
          className="w-6 h-6 rounded-full bg-blue-500/80 hover:bg-blue-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          title="隐藏窗口"
        >
          <Minimize2 className="w-3 h-3 text-white" />
        </button>
        <button
          onClick={handleClose}
          className="w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          title="关闭应用"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      </div>

      {/* Pet Area */}
      <div
        className="flex-1 w-full flex flex-col items-center justify-center pb-16"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="relative w-[250px] h-[250px]">
          <PetCharacter
            state={petState}
            interactionState={interactionState}
            onInteractionEnd={handleInteractionEnd}
            isDragging={isDragging}
          />

          <HoverToolbar
            isVisible={isHovering}
            onShowReport={handleShowReport}
            onPause={handlePause}
            onPrivacyMode={handlePrivacyMode}
            isPaused={isPaused}
            privacyMode={privacyMode}
          />
        </div>
      </div>
    </div>
  )
}
