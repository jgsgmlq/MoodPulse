import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Volume2, X } from 'lucide-react';
import { Howl } from 'howler';
import { appWindow } from '@tauri-apps/api/window';
import { emit, listen } from '@tauri-apps/api/event';

const sounds = [
  { id: 'rain', name: '雨声', emoji: '🌧️', file: '/src/assets/sounds/rain.mp3' },
  { id: 'ocean', name: '海浪', emoji: '🌊', file: '/src/assets/sounds/ocean.mp3' },
  { id: 'forest', name: '森林', emoji: '🌲', file: '/src/assets/sounds/forest.mp3' },
  { id: 'fire', name: '火焰', emoji: '🔥', file: '/src/assets/sounds/fire.mp3' },
  { id: 'cafe', name: '咖啡厅', emoji: '☕', file: '/src/assets/sounds/cafe.mp3' },
];

export function WhiteNoisePickerWindow() {
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Howl | null>(null);

  // 监听来自主窗口的状态
  useEffect(() => {
    const unlisten = listen<{ sound: string | null; volume: number; isPlaying: boolean }>(
      'white-noise-state',
      (event) => {
        setCurrentSound(event.payload.sound);
        setVolume(event.payload.volume);
        setIsPlaying(event.payload.isPlaying);
      }
    );

    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

  // 播放音频
  const playSound = (soundId: string) => {
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.unload();
    }

    const soundData = sounds.find(s => s.id === soundId);
    if (!soundData) return;

    soundRef.current = new Howl({
      src: [soundData.file],
      loop: true,
      volume: volume,
    });

    soundRef.current.play();
    setCurrentSound(soundId);
    setIsPlaying(true);

    // 通知主窗口
    emit('sound-selected', { sound: soundId, volume, isPlaying: true });
  };

  // 调节音量
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (soundRef.current) {
      soundRef.current.volume(newVolume);
    }
    // 通知主窗口
    emit('volume-changed', { volume: newVolume });
  };

  // 关闭窗口
  const handleClose = () => {
    appWindow.close();
  };

  // 清理
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.unload();
      }
    };
  }, []);

  return (
    <div className="w-full h-full bg-gradient-to-br from-rose-50 to-orange-50 p-8 flex flex-col overflow-hidden rounded-[32px]">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4" data-tauri-drag-region>
        <h3 className="text-base font-semibold text-gray-800">选择白噪音</h3>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-white/50 rounded-full transition-colors"
        >
          <X size={16} className="text-gray-600" />
        </button>
      </div>

      {/* 音频选择 */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {sounds.map((sound) => (
          <motion.button
            key={sound.id}
            onClick={() => playSound(sound.id)}
            className={`p-3 rounded-lg transition-all ${
              currentSound === sound.id
                ? 'bg-rose-100 border-2 border-rose-400 shadow-lg'
                : 'bg-white/80 border-2 border-transparent hover:bg-white hover:shadow-md'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-2xl mb-1.5">{sound.emoji}</div>
            <div className="text-xs font-medium text-gray-700">{sound.name}</div>
          </motion.button>
        ))}
      </div>

      {/* 音量控制 */}
      <div className="bg-white/80 rounded-lg p-2.5 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-gray-700">
            <Volume2 size={16} />
            <span className="text-xs font-medium">音量</span>
          </div>
          <span className="text-xs text-gray-600">{Math.round(volume * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-400"
        />
      </div>
    </div>
  );
}
