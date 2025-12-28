import React from 'react';
import { BarChart3, Pause, Play, Lock, Unlock } from 'lucide-react';

interface HoverToolbarProps {
  isVisible: boolean;
  onShowReport: () => void;
  onPause: () => void;
  onPrivacyMode: () => void;
  isPaused: boolean;
  privacyMode: boolean;
}

export function HoverToolbar({
  isVisible,
  onShowReport,
  onPause,
  onPrivacyMode,
  isPaused,
  privacyMode
}: HoverToolbarProps) {
  return (
    <div className={`
      absolute -bottom-16 left-1/2 -translate-x-1/2
      transition-all duration-300 ease-out
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}
    `}>
      <div className="
        backdrop-blur-xl
        bg-white/70
        rounded-full
        px-3 py-2
        shadow-[0_8px_30px_rgb(0,0,0,0.08)]
        border border-white/60
        flex items-center gap-2
      ">
        {/* View Report Button */}
        <button
          onClick={onShowReport}
          className="
            w-10 h-10 rounded-full
            bg-gradient-to-br from-rose-400 to-pink-500
            hover:from-rose-500 hover:to-pink-600
            flex items-center justify-center
            transition-all duration-200
            hover:scale-110
            active:scale-95
            shadow-md shadow-rose-200
            group
          "
          title="查看报告"
        >
          <BarChart3 className="w-5 h-5 text-white" />
        </button>

        {/* Pause/Resume Button */}
        <button
          onClick={onPause}
          className={`
            w-10 h-10 rounded-full
            ${isPaused
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 shadow-emerald-200'
              : 'bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 shadow-amber-200'
            }
            flex items-center justify-center
            transition-all duration-200
            hover:scale-110
            active:scale-95
            shadow-md
          `}
          title={isPaused ? '恢复监测' : '暂停监测'}
        >
          {isPaused ? (
            <Play className="w-5 h-5 text-white ml-0.5" />
          ) : (
            <Pause className="w-5 h-5 text-white" />
          )}
        </button>

        {/* Privacy Mode Button */}
        <button
          onClick={onPrivacyMode}
          className={`
            w-10 h-10 rounded-full
            ${privacyMode
              ? 'bg-gradient-to-br from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 shadow-indigo-200'
              : 'bg-gradient-to-br from-slate-300 to-slate-400 hover:from-slate-400 hover:to-slate-500 shadow-slate-200'
            }
            flex items-center justify-center
            transition-all duration-200
            hover:scale-110
            active:scale-95
            shadow-md
          `}
          title={privacyMode ? '退出隐私模式' : '隐私模式'}
        >
          {privacyMode ? (
            <Lock className="w-5 h-5 text-white" />
          ) : (
            <Unlock className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Tooltip indicator */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white/70" />
    </div>
  );
}