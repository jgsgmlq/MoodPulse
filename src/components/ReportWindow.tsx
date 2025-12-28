import React from 'react';
import { X, Activity, Brain, Zap } from 'lucide-react';
import EmotionChart from './EmotionChart';
import { SnapshotCard } from './SnapshotCard';
import { useEmotionAnalysis } from '../hooks/useEmotionAnalysis';
import { useFocusAnalysis } from '../hooks/useFocusAnalysis';

interface ReportWindowProps {
  onClose: () => void;
}

// 根据压力水平获取进度条颜色
function getStressColor(stressLevel: number): string {
  if (stressLevel < 25) {
    return 'from-emerald-400 to-emerald-500'; // 低压力 - 绿色
  } else if (stressLevel < 50) {
    return 'from-amber-400 to-amber-500'; // 轻度压力 - 琥珀色
  } else if (stressLevel < 75) {
    return 'from-orange-400 to-orange-500'; // 中度压力 - 橙色
  } else {
    return 'from-rose-400 to-rose-500'; // 高压力 - 红色
  }
}

// 根据压力水平获取状态文本
function getStressLabel(stressLevel: number): string {
  if (stressLevel < 25) return '低压力';
  if (stressLevel < 50) return '轻度压力';
  if (stressLevel < 75) return '中度压力';
  return '高压力';
}

export function ReportWindow({ onClose }: ReportWindowProps) {
  const { analysis, loading, error } = useEmotionAnalysis(30000);
  const { focusData, loading: focusLoading } = useFocusAnalysis(30000);
  const [countMood, setCountMood] = React.useState(0);
  const [countFocus, setCountFocus] = React.useState(0);

  // 使用真实数据或默认值
  const emotionIndex = analysis?.emotion_index ?? 5.0;
  const stressLevel = analysis?.stress_level ?? 50.0;
  const validRecords = analysis?.valid_records ?? 0;
  const totalFocusTime = focusData?.total_focus_time ?? 0;
  const focusSessions = focusData?.total_focus_sessions ?? 0;
  const currentFocusDuration = focusData?.current_focus_duration ?? 0;

  const todayStats = {
    avgMood: emotionIndex,
    trend: 'up' as const,
    focusTime: Math.round(totalFocusTime),
    breaksSuggested: 3,
    breaksTaken: 2,
    stressLevel: stressLevel
  };

  // Animated counter effect
  React.useEffect(() => {
    const moodTarget = todayStats.avgMood * 10;
    const focusTarget = todayStats.focusTime;
    
    const moodInterval = setInterval(() => {
      setCountMood(prev => {
        if (prev < moodTarget) return prev + 1;
        clearInterval(moodInterval);
        return moodTarget;
      });
    }, 20);

    const focusInterval = setInterval(() => {
      setCountFocus(prev => {
        if (prev < focusTarget) return prev + 2;
        clearInterval(focusInterval);
        return focusTarget;
      });
    }, 10);

    return () => {
      clearInterval(moodInterval);
      clearInterval(focusInterval);
    };
  }, []);

  const snapshots = [
    {
      time: '14:32',
      mood: 'Focus',
      color: 'cyan' as const,
      suggestion: '保持专注状态，建议再坚持20分钟后休息'
    },
    {
      time: '12:15',
      mood: 'Relaxed',
      color: 'pink' as const,
      suggestion: '午休后精神状态良好，适合处理复杂任务'
    },
    {
      time: '10:45',
      mood: 'Stressed',
      color: 'orange' as const,
      suggestion: '检测到压力上升，建议深呼吸或短暂离开屏幕'
    }
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* 🌅 整体背景：模拟落日氛围 */}
      <div 
        className="
          w-full max-w-[420px] h-[600px]
          rounded-[32px]
          overflow-hidden
          shadow-2xl
          flex flex-col
          animate-scale-in
          relative
        "
        style={{
          background: 'linear-gradient(135deg, #fffcf5 0%, #fff0ed 100%)'
        }}
      >
        {/* 装饰光斑 */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />

        {/* 内容区域 */}
        <div className="relative z-10 h-full flex flex-col">
          
          {/* 头部 */}
          <div className="px-6 pt-6 pb-4" data-tauri-drag-region>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-[#574c4f] flex items-center gap-2">
                  <Activity className="w-6 h-6 text-rose-400" />
                  MoodPulse
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-xs text-[#8c6a64] font-medium">AI 感知中 · 置信度 98%</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[#8c6a64]/10 transition-colors text-[#8c6a64]"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 custom-scrollbar">
            {/* 核心指标卡片 (Bento Grid) */}
            <div className="grid grid-cols-2 gap-3">
              {/* 左：情绪指数 - 暖粉渐变 */}
              <div className="bg-gradient-to-br from-[#fff0f5] to-[#ffe4e6] p-4 rounded-2xl border border-rose-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Brain size={48} color="#be185d" />
                </div>
                <p className="text-xs font-bold text-rose-400 mb-1">今日情绪</p>
                <div className="text-4xl font-bold text-[#883446] mb-1" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {loading ? '...' : (countMood / 10).toFixed(1)}
                </div>
                <div className="text-[10px] font-medium text-gray-500">
                  {validRecords > 0 ? `${validRecords} 条有效记录` : '暂无数据'}
                </div>
              </div>

              {/* 右：专注时长 - 暖蓝/青色 */}
              <div className="bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] p-4 rounded-2xl border border-sky-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Zap size={48} color="#0369a1" />
                </div>
                <p className="text-xs font-bold text-sky-500 mb-1">专注时长</p>
                <div className="text-4xl font-bold text-[#0c4a6e] mb-1" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {focusLoading ? '...' : countFocus}
                </div>
                <div className="text-[10px] font-medium text-gray-500">
                  {focusSessions > 0 ? `已专注 ${focusSessions} 次` : '暂无专注记录'}
                  {currentFocusDuration > 0 && ` · 当前 ${Math.round(currentFocusDuration)}分钟`}
                </div>
              </div>
            </div>

            {/* 压力水平条 */}
            <div className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white/60 shadow-sm">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-sm font-bold text-[#574c4f]">压力水平</p>
                  {loading && <p className="text-xs text-gray-400">加载中...</p>}
                  {error && <p className="text-xs text-red-400">数据加载失败</p>}
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-amber-500">{Math.round(todayStats.stressLevel)}%</span>
                  <p className="text-xs text-gray-500">{getStressLabel(todayStats.stressLevel)}</p>
                </div>
              </div>
              {/* 进度条轨道 */}
              <div className="h-3 w-full bg-[#f5e6d3] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getStressColor(todayStats.stressLevel)} transition-all duration-1000`}
                  style={{ width: `${todayStats.stressLevel}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-[#9ca3af] font-medium">
                <span>低压力</span>
                <span>中等</span>
                <span>高压力</span>
              </div>
            </div>

            {/* 底部图表 */}
            <div className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white/60 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm font-bold text-[#574c4f]">情绪曲线</p>
                <div className="flex items-center gap-1 text-[10px] text-rose-400 font-medium bg-rose-50 px-2 py-1 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  波动平稳
                </div>
              </div>
              
              <div className="w-full">
                <EmotionChart onClose={() => {}} />
              </div>
            </div>

            {/* Snapshots */}
            <div>
              <h3 className="text-sm mb-3 text-[#574c4f] font-bold">情绪快照</h3>
              <div className="space-y-2">
                {snapshots.map((snapshot, index) => (
                  <SnapshotCard key={index} {...snapshot} />
                ))}
              </div>
            </div>

            {/* AI Suggestion - Warm Style */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-white text-lg">✨</span>
                </div>
                <div>
                  <h4 className="text-sm mb-1 text-[#574c4f] font-bold">AI 智能建议</h4>
                  <p className="text-xs text-[#8c6a64] leading-relaxed">
                    今天的专注度很高！建议在下午3点左右安排一次短暂的户外活动，有助于保持下午的工作效率。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes scale-in {
            0% {
              opacity: 0;
              transform: scale(0.95) translateY(10px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          .animate-scale-in {
            animation: scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(139, 92, 246, 0.05);
            border-radius: 3px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(251, 113, 133, 0.3);
            border-radius: 3px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(251, 113, 133, 0.5);
          }
        `}</style>
      </div>
    </div>
  );
}