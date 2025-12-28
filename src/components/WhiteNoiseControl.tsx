import { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Volume2, VolumeX } from 'lucide-react';

export function WhiteNoiseControl() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);

  const toggleWhiteNoise = async () => {
    try {
      if (isPlaying) {
        await invoke('stop_white_noise');
        setIsPlaying(false);
      } else {
        await invoke('play_white_noise', { volume });
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('White noise error:', error);
    }
  };

  const handleVolumeChange = async (newVolume: number) => {
    setVolume(newVolume);
    if (isPlaying) {
      try {
        await invoke('set_white_noise_volume', { volume: newVolume });
      } catch (error) {
        console.error('Volume change error:', error);
      }
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-md w-full">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleWhiteNoise}
          className={`p-2 rounded-full transition-all ${
            isPlaying ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          {isPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
        <div className="flex-1">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
