import { X, Minus } from 'lucide-react'

interface WindowControlsProps {
  onMinimize: () => void
  onClose: () => void
}

export function WindowControls({ onMinimize, onClose }: WindowControlsProps) {
  return (
    <div className="absolute top-2 right-2 flex gap-1 z-50">
      <button
        onClick={onMinimize}
        className="w-6 h-6 rounded-full bg-yellow-400 hover:bg-yellow-500 flex items-center justify-center transition-colors"
        title="最小化到托盘"
      >
        <Minus size={12} className="text-white" />
      </button>
      <button
        onClick={onClose}
        className="w-6 h-6 rounded-full bg-red-400 hover:bg-red-500 flex items-center justify-center transition-colors"
        title="关闭"
      >
        <X size={12} className="text-white" />
      </button>
    </div>
  )
}
