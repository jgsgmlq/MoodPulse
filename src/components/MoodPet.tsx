import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEmotionStore, Emotion } from '../stores/emotionStore'
import { WhiteNoiseControl } from './WhiteNoiseControl'

interface MoodPetProps {
  onShowChart?: () => void
}

export function MoodPet({ onShowChart }: MoodPetProps) {
  const { currentEmotion } = useEmotionStore()
  const [isBlinking, setIsBlinking] = useState(false)
  const [strokeParticles, setStrokeParticles] = useState<Array<{ id: number; x: number; y: number }>>([])
  const [patEffect, setPatEffect] = useState(false)
  const petRef = useRef<HTMLDivElement>(null)
  const strokeCountRef = useRef(0)

  // 自动眨眼
  useEffect(() => {
    if (currentEmotion === 'sleepy') return

    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 200)
    }, 3000 + Math.random() * 2000)

    return () => clearInterval(blinkInterval)
  }, [currentEmotion])

  // 处理抚摸
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!petRef.current || currentEmotion === 'sleepy') return

    const rect = petRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const id = Date.now() + Math.random()
    setStrokeParticles((prev) => [...prev, { id, x, y }])

    setTimeout(() => {
      setStrokeParticles((prev) => prev.filter((p) => p.id !== id))
    }, 1000)

    strokeCountRef.current++
  }

  // 处理点击
  const handleClick = () => {
    if (currentEmotion === 'sleepy') return

    setPatEffect(true)
    setTimeout(() => setPatEffect(false), 800)
  }

  // 右键显示图表
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    onShowChart?.()
  }

  const handleMouseLeave = () => {
    strokeCountRef.current = 0
  }

  // 获取状态描述
  const getStateDescription = () => {
    const messages: Record<Emotion, string> = {
      happy: '好开心！✨',
      calm: '平静中...',
      worried: '有点担心呢',
      tired: '好累啊...',
      sleepy: 'Zzz...'
    }
    return messages[currentEmotion]
  }

  // 身体动画
  const bodyVariants = {
    happy: {
      rotate: [0, -10, 10, -10, 10, 0],
      scale: [1, 1.1, 1],
      transition: { duration: 0.6, repeat: 2 }
    },
    calm: {
      y: [0, -10, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
    },
    worried: {
      x: [-2, 2, -2, 2, 0],
      transition: { duration: 0.5, repeat: Infinity }
    },
    tired: {
      y: [0, 5, 0],
      scale: [1, 0.98, 1],
      transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
    },
    sleepy: {
      y: [0, 5, 0],
      transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 交互提示 */}
      <div className="text-xs text-purple-600 text-center mb-2">
        {currentEmotion !== 'sleepy' ? (
          <>
            <span className="inline-block mr-2">👋 点击</span>
            <span className="inline-block mr-2">✨滑过</span>
            <span className="inline-block">📊 右键</span>
          </>
        ) : (
          <span>💤 休息中...</span>
        )}
      </div>

      {/* 宠物主体 */}
      <div
        ref={petRef}
        className="relative w-32 h-32 flex items-center justify-center cursor-pointer"
        onMouseMove={currentEmotion !== 'sleepy' ? handleMouseMove : undefined}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <motion.div
          variants={bodyVariants}
          animate={currentEmotion}
          className="relative"
        >
          {/* 身体 */}
          <motion.div
            className="w-24 h-24 bg-gradient-to-br from-pink-300 to-pink-400 rounded-full relative shadow-lg"
            animate={{
              boxShadow: patEffect
                ? '0 0 30px rgba(239, 68, 68, 0.5)'
                : '0 10px 25px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* 脸颊 */}
            <div className="absolute top-16 left-2 w-6 h-5 bg-pink-200 rounded-full opacity-60" />
            <div className="absolute top-16 right-2 w-6 h-5 bg-pink-200 rounded-full opacity-60" />

            {/* 眼睛 */}
            <div className="absolute top-10 left-8 flex gap-8">
              <motion.div
                animate={{
                  scaleY: isBlinking || currentEmotion === 'sleepy' ? 0.1 : 1,
                  scaleX: patEffect ? 0.8 : 1
                }}
                transition={{ duration: 0.1 }}
                className="w-4 h-4 bg-gray-800 rounded-full"
              >
                {currentEmotion === 'happy' && (
                  <div className="w-2 h-2 bg-white rounded-full mt-0.5 ml-0.5" />
                )}
              </motion.div>
              <motion.div
                animate={{
                  scaleY: isBlinking || currentEmotion === 'sleepy' ? 0.1 : 1,
                  scaleX: patEffect ? 0.8 : 1
                }}
                transition={{ duration: 0.1 }}
                className="w-4 h-4 bg-gray-800 rounded-full"
              >
                {currentEmotion === 'happy' && (
                  <div className="w-2 h-2 bg-white rounded-full mt-0.5 ml-0.5" />
                )}
              </motion.div>
            </div>

            {/* 嘴巴 */}
            <div className="absolute top-19 left-1/2 -translate-x-1/2">
              {currentEmotion === 'happy' ? (
                <div className="w-8 h-4 border-3 border-gray-800 border-t-0 rounded-b-full" />
              ) : currentEmotion === 'worried' ? (
                <div className="w-6 h-3 border-2 border-gray-800 border-b-0 rounded-t-full" />
              ) : currentEmotion === 'sleepy' || currentEmotion === 'tired' ? (
                <div className="w-6 h-1.5 bg-gray-800 rounded-full opacity-50" />
              ) : (
                <div className="w-6 h-2 bg-gray-800 rounded-full" />
              )}
            </div>

            {/* 手臂 */}
            <div className="absolute top-14 -left-6 w-8 h-8 bg-gradient-to-br from-pink-300 to-pink-400 rounded-full" />
            <div className="absolute top-14 -right-6 w-8 h-8 bg-gradient-to-br from-pink-300 to-pink-400 rounded-full" />
          </motion.div>

          {/* Zzz 特效 */}
          <AnimatePresence>
            {(currentEmotion === 'sleepy' || currentEmotion === 'tired') && (
              <motion.div
                initial={{ opacity: 0, y: 0, x: 40 }}
                animate={{ opacity: [0, 1, 1, 0], y: -30 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-0 right-0 text-2xl text-purple-400"
              >
                Z
              </motion.div>
            )}
          </AnimatePresence>

          {/* 爱心特效 */}
          <AnimatePresence>
            {currentEmotion === 'happy' && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], y: -40, scale: [0, 1, 0] }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="absolute top-0 -left-3 text-2xl"
                >
                  💕
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], y: -40, scale: [0, 1, 0] }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="absolute top-0 -right-3 text-2xl"
                >
                  ✨
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* 担心特效 */}
          <AnimatePresence>
            {currentEmotion === 'worried' && (
              <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 0.5, 0], y: -30 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-0 left-1/2 -translate-x-1/2 text-xl"
              >
                💭
              </motion.div>
            )}
          </AnimatePresence>

          {/* 拍打特效 */}
          <AnimatePresence>
            {patEffect && (
              <>
                <motion.div
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 3, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 border-4 border-red-400 rounded-full pointer-events-none"
                />
                <motion.div
                  initial={{ y: 0, opacity: 1 }}
                  animate={{ y: -30, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 text-xl"
                >
                  💢
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 抚摸粒子 */}
        <AnimatePresence>
          {strokeParticles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ opacity: 1, scale: 0, x: particle.x, y: particle.y }}
              animate={{
                opacity: 0,
                scale: 1.5,
                y: particle.y - 40
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute text-xl pointer-events-none"
              style={{ left: 0, top: 0 }}
            >
              💖
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 阴影 */}
        <motion.div
          animate={{
            scale: currentEmotion === 'happy' || patEffect ? [1, 1.2, 1] : 1
          }}
          transition={{
            duration: 0.6,
            repeat: currentEmotion === 'happy' ? 2 : 0
          }}
          className="absolute bottom-0 w-28 h-6 bg-gray-300 rounded-full opacity-30 blur-md"
        />
      </div>

      {/* 状态文字 */}
      <motion.div
        key={currentEmotion}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-purple-600 font-medium mb-3"
      >
        {getStateDescription()}
      </motion.div>

      {/* 白噪音控制 */}
      <WhiteNoiseControl />
    </div>
  )
}
