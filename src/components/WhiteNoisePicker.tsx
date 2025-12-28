import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2 } from 'lucide-react';

interface WhiteNoisePickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSound: string | null;
  onSelectSound: (sound: string) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

const sounds = [
  { id: 'rain', name: '雨声', emoji: '🌧️', file: '/src/assets/sounds/rain.mp3' },
  { id: 'ocean', name: '海浪', emoji: '🌊', file: '/src/assets/sounds/ocean.mp3' },
  { id: 'forest', name: '森林', emoji: '🌲', file: '/src/assets/sounds/forest.mp3' },
  { id: 'fire', name: '火焰', emoji: '🔥', file: '/src/assets/sounds/fire.mp3' },
  { id: 'cafe', name: '咖啡厅', emoji: '☕', file: '/src/assets/sounds/cafe.mp3' },
];

export function WhiteNoisePicker({
  isOpen,
  onClose,
  currentSound,
  onSelectSound,
  volume,
  onVolumeChange,
}: WhiteNoisePickerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* 弹窗 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6"
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">选择白噪音</h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* 音频选择 */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {sounds.map((sound) => (
                <motion.button
                  key={sound.id}
                  onClick={() => onSelectSound(sound.id)}
                  className={`p-4 rounded-xl transition-all ${
                    currentSound === sound.id
                      ? 'bg-rose-100 border-2 border-rose-400'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-3xl mb-2">{sound.emoji}</div>
                  <div className="text-sm font-medium text-gray-700">{sound.name}</div>
                </motion.button>
              ))}
            </div>

            {/* 音量控制 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <Volume2 size={18} />
                  <span className="text-sm font-medium">音量</span>
                </div>
                <span className="text-sm text-gray-600">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-400"
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export { sounds };
