import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useEmotionTimeline } from '../hooks/useEmotionTimeline'

interface EmotionChartProps {
  onClose: () => void
}

// 自定义节点组件 - 心跳动画
const PulseDot = (props: any) => {
  const { cx, cy, index } = props;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={3}
      fill="#FFB6C1"
      className="pulse-dot"
      style={{ animationDelay: `${index * 0.1}s` }}
    />
  );
};

const EmotionChart = ({ onClose }: EmotionChartProps) => {
  const { timeline, loading, error } = useEmotionTimeline(30000);

  return (
    <div className="emotion-chart-container bg-white rounded-2xl p-6 shadow-xl max-w-2xl w-full">
      <div className="chart-header mb-6">
        <h2 className="text-2xl font-bold text-text-dark">今天的情绪旅程 🌈</h2>
      </div>

      <div className="chart-content mb-6 relative">
        {/* 扫描线 */}
        {!loading && !error && timeline.length > 0 && (
          <div className="scan-line" />
        )}

        {loading && (
          <div className="flex items-center justify-center h-[300px] text-gray-400">
            加载中...
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-[300px] text-red-400">
            数据加载失败
          </div>
        )}
        {!loading && !error && timeline.length === 0 && (
          <div className="flex items-center justify-center h-[300px] text-gray-400">
            暂无数据
          </div>
        )}
        {!loading && !error && timeline.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeline}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FFB6C1" />
                  <stop offset="100%" stopColor="#FF69B4" />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" />
              <YAxis hide domain={[0, 1]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="url(#lineGradient)"
                strokeWidth={2}
                dot={<PulseDot />}
                className="ecg-line"
                isAnimationActive={true}
                animationDuration={2000}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="chart-insights bg-bg-light rounded-xl p-4">
        <h3 className="text-lg font-semibold text-text-dark mb-3">💭 今天的小发现</h3>
        <ul className="space-y-2 text-sm text-text-dark">
          <li>• 上午状态不错，保持了 2 小时专注</li>
          <li>• 午饭后有点小困（正常的啦~）</li>
          <li>• 下午 3 点喝了咖啡，精神回来了！</li>
        </ul>

        <h3 className="text-lg font-semibold text-text-dark mt-4 mb-3">⭐ 今日成就</h3>
        <ul className="space-y-2 text-sm text-text-dark">
          <li>• 专注工作 3 小时</li>
          <li>• 深呼吸放松 2 次</li>
          <li>• 站起来活动 4 次</li>
        </ul>
      </div>

      <style>{`
        /* 节点脉冲动画 */
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.8;
          }
        }

        .pulse-dot {
          animation: pulse 1.5s ease-in-out infinite;
        }

        /* 曲线发光效果 */
        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 0 2px rgba(255, 182, 193, 0.6));
          }
          50% {
            filter: drop-shadow(0 0 8px rgba(255, 105, 180, 0.9));
          }
        }

        .ecg-line {
          animation: glow 2s ease-in-out infinite;
        }

        /* 扫描线动画 */
        @keyframes scan {
          0% {
            left: 0%;
          }
          100% {
            left: 100%;
          }
        }

        .scan-line {
          position: absolute;
          top: 10%;
          left: 0;
          width: 2px;
          height: 70%;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(255, 105, 180, 0.6) 20%,
            rgba(255, 105, 180, 0.8) 50%,
            rgba(255, 105, 180, 0.6) 80%,
            transparent
          );
          box-shadow: 0 0 10px rgba(255, 105, 180, 0.8);
          animation: scan 4s linear infinite;
          pointer-events: none;
          z-index: 10;
        }

        /* 曲线入场动画 */
        .recharts-line-curve {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw 2s ease-out forwards;
        }

        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default EmotionChart
