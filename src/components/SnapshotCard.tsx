import React from 'react';

interface SnapshotCardProps {
  time: string;
  mood: string;
  color: 'cyan' | 'pink' | 'orange';
  suggestion: string;
}

export function SnapshotCard({ time, mood, color, suggestion }: SnapshotCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'cyan':
        return {
          bg: 'from-sky-50 to-blue-50',
          border: 'border-sky-200',
          badge: 'bg-gradient-to-r from-sky-400 to-blue-500',
          text: 'text-sky-600',
          glow: 'shadow-sky-100'
        };
      case 'pink':
        return {
          bg: 'from-rose-50 to-pink-50',
          border: 'border-rose-200',
          badge: 'bg-gradient-to-r from-rose-400 to-pink-500',
          text: 'text-rose-600',
          glow: 'shadow-rose-100'
        };
      case 'orange':
        return {
          bg: 'from-orange-50 to-amber-50',
          border: 'border-orange-200',
          badge: 'bg-gradient-to-r from-orange-400 to-amber-500',
          text: 'text-orange-600',
          glow: 'shadow-orange-100'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className={`
      bg-gradient-to-br ${colors.bg}
      rounded-xl p-3
      border ${colors.border}
      ${colors.glow} shadow-sm
      transition-all
      hover:scale-[1.02]
      hover:shadow-md
      cursor-pointer
      group
    `}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#8c6a64] font-medium">{time}</span>
        <span className={`
          px-3 py-1 rounded-full
          ${colors.badge}
          text-white text-xs font-medium
          shadow-sm
          group-hover:scale-105 transition-transform
        `}>
          {mood}
        </span>
      </div>
      <p className="text-xs text-[#574c4f]/80 leading-relaxed">
        {suggestion}
      </p>
    </div>
  );
}