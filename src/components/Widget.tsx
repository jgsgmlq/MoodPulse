import { motion } from 'framer-motion'
import { useEmotionStore } from '../stores/emotionStore'

interface WidgetProps {
  onShowChart: () => void
}

const Widget = ({ onShowChart }: WidgetProps) => {
  const { currentEmotion, widgetName } = useEmotionStore()

  const emotionEmojis = {
    happy: '😊',
    calm: '😌',
    worried: '😟',
    tired: '😔',
    sleepy: '😴',
  }

  return (
    <div className="widget-container">
      <motion.div
        className="widget bg-primary-pink rounded-widget p-6 cursor-pointer shadow-lg"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        onClick={onShowChart}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="widget-face text-6xl text-center mb-4">
          {emotionEmojis[currentEmotion]}
        </div>
        <div className="widget-name text-center text-text-dark font-medium">
          {widgetName}
        </div>
      </motion.div>

      {/* 消息气泡示例 */}
      <motion.div
        className="message-bubble absolute top-[-80px] left-1/2 transform -translate-x-1/2
                   bg-white rounded-2xl p-4 shadow-md max-w-[200px]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <p className="text-sm text-text-dark">你好呀~ 我会陪着你哦 💕</p>
      </motion.div>
    </div>
  )
}

export default Widget
