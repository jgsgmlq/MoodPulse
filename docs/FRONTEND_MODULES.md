# 前端模块技术文档

## 目录
- [核心组件](#核心组件)
- [状态管理](#状态管理)
- [自定义Hooks](#自定义hooks)
- [工具函数](#工具函数)
- [模块完成度](#模块完成度)

---

## 核心组件

### 1. App.tsx
**路径**: `src/App.tsx`

**功能描述**:
- 应用根组件，管理整体布局和视图切换
- 集成情绪检测、休息提醒、窗口控制等核心功能
- 处理Tauri窗口拖拽事件

**主要功能**:
```typescript
- 视图切换: widget模式(桌面宠物) / chart模式(情绪图表)
- 情绪检测集成: 使用useEmotionDetection hook
- 休息提醒: 45分钟工作后显示BreakAlert
- 窗口拖拽: data-tauri-drag-region属性
- 条件渲染: 根据isTauri判断是否显示窗口控制
```

**关键代码**:
```typescript
const { emotionData, isDetecting } = useEmotionDetection(5000);

useEffect(() => {
  if (emotionData?.need_break_alert && !showBreakAlert) {
    setShowBreakAlert(true);
  }
}, [emotionData]);
```

**依赖关系**:
- `useEmotionDetection` → 调用Rust `detect_emotion` command
- `emotionStore` → 读取当前情绪状态
- `WindowControls` → 窗口最小化/关闭
- `MoodPet` → 桌面宠物显示
- `BreakAlert` → 休息提醒弹窗

**完成度**: ✅ 100%

**待优化项**:
- [ ] 添加设置面板入口
- [ ] 支持多视图切换动画
- [ ] 添加键盘快捷键支持

---

### 2. MoodPet.tsx
**路径**: `src/components/MoodPet.tsx`

**功能描述**:
桌面宠物核心组件，展示5种情绪状态的拟人化角色，支持交互动画和白噪音控制。

**情绪状态映射**:
```typescript
happy   → 😊 开心 (黄色)
calm    → 😌 平静 (蓝色)
worried → 😰 担心 (紫色)
tired   → 😫 疲惫 (橙色)
sleepy  → 😴 困倦 (靛蓝色)
```

**动画系统**:
1. **自动动画**:
   - 眨眼动画: 每3-5秒随机触发
   - 呼吸动画: 持续scale变化 (0.98-1.02)
   - 鼠标跟踪: 眼睛跟随鼠标移动

2. **交互动画**:
   - 点击: 缩放+旋转反馈
   - 抚摸: 粒子特效 (爱心/星星)
   - 右键: 切换情绪状态

**粒子系统**:
```typescript
interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  velocity: { x: number; y: number };
}
```

**关键功能**:
```typescript
// 眨眼逻辑
useEffect(() => {
  const blinkInterval = setInterval(() => {
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 200);
  }, Math.random() * 2000 + 3000);
}, []);

// 鼠标跟踪
const handleMouseMove = (e: React.MouseEvent) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
  const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
  setEyePosition({ x, y });
};
```

**子组件**:
- `WhiteNoiseControl`: 白噪音播放控制

**完成度**: ✅ 95%

**已实现**:
- ✅ 5种情绪状态
- ✅ 眨眼和呼吸动画
- ✅ 鼠标跟踪
- ✅ 点击和抚摸交互
- ✅ 粒子特效系统
- ✅ 白噪音集成

**待完成**:
- [ ] 更多交互动画 (拖拽、双击等)
- [ ] 情绪切换过渡动画
- [ ] 自定义宠物外观
- [ ] 语音交互

---

### 3. EmotionChart.tsx
**路径**: `src/components/EmotionChart.tsx`

**功能描述**:
情绪数据可视化组件，使用Recharts展示情绪变化曲线。

**图表配置**:
```typescript
- X轴: 时间 (HH:mm格式)
- Y轴: 情绪值 (0-100)
- 数据点: 圆点标记
- 曲线: 平滑曲线 (monotone)
- 颜色: 渐变填充
```

**数据结构**:
```typescript
interface EmotionDataPoint {
  time: string;      // "09:00"
  value: number;     // 0-100
  emotion: string;   // "happy" | "calm" | ...
}
```

**完成度**: ⚠️ 50%

**已实现**:
- ✅ 图表UI组件
- ✅ 模拟数据展示
- ✅ 响应式布局
- ✅ 洞察和成就展示区域

**待完成**:
- [ ] 连接真实情绪数据
- [ ] 数据持久化
- [ ] 时间范围选择 (日/周/月)
- [ ] 情绪统计分析
- [ ] 数据导出功能

---

### 4. WindowControls.tsx
**路径**: `src/components/WindowControls.tsx`

**功能描述**:
Tauri窗口控制按钮，提供最小化和关闭功能。

**按钮设计**:
```typescript
- 最小化按钮: 黄色圆形 → 隐藏到系统托盘
- 关闭按钮: 红色圆形 → 退出应用
- 样式: macOS风格圆形按钮
```

**Tauri API调用**:
```typescript
import { appWindow } from '@tauri-apps/api/window';

const handleMinimize = () => {
  appWindow.hide(); // 隐藏到托盘
};

const handleClose = () => {
  appWindow.close(); // 关闭应用
};
```

**完成度**: ✅ 100%

**待优化项**:
- [ ] 添加最大化按钮
- [ ] 支持自定义按钮样式
- [ ] 添加快捷键提示

---

### 5. BreakAlert.tsx
**路径**: `src/components/BreakAlert.tsx`

**功能描述**:
休息提醒弹窗，在连续工作45分钟后自动显示。

**触发条件**:
```typescript
emotionData.work_minutes >= 45 && !emotionData.is_away
```

**UI特性**:
- 半透明背景遮罩
- 动画进入/退出 (Framer Motion)
- 显示工作时长
- 可关闭按钮

**动画配置**:
```typescript
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.9 }}
```

**完成度**: ✅ 100%

**待优化项**:
- [ ] 添加休息建议内容
- [ ] 支持自定义提醒间隔
- [ ] 添加休息倒计时功能
- [ ] 集成深呼吸引导

---

### 6. WhiteNoiseControl.tsx
**路径**: `src/components/WhiteNoiseControl.tsx`

**功能描述**:
白噪音播放控制面板，支持播放/停止和音量调节。

**功能实现**:
```typescript
// 播放/停止
const togglePlay = async () => {
  if (isPlaying) {
    await invoke('stop_white_noise');
  } else {
    await invoke('play_white_noise', { volume });
  }
};

// 音量调节
const handleVolumeChange = async (value: number[]) => {
  await invoke('set_white_noise_volume', { volume: value[0] / 100 });
};
```

**UI组件**:
- 播放按钮: Volume2 / VolumeX 图标切换
- 音量滑块: 0-100范围
- 实时音量显示

**完成度**: ✅ 90%

**已实现**:
- ✅ 播放/停止控制
- ✅ 音量调节
- ✅ 播放状态显示

**待完成**:
- [ ] 多种白噪音类型选择 (雨声、海浪、森林等)
- [ ] 定时关闭功能
- [ ] 音量淡入淡出
- [ ] 播放历史记录

---

### 7. EmotionControls.tsx
**路径**: `src/components/EmotionControls.tsx`

**功能描述**:
手动情绪切换控制面板，仅在浏览器模式下显示（用于开发调试）。

**功能**:
- 5个情绪按钮
- 点击切换当前情绪
- 调用emotionStore.setCurrentEmotion

**完成度**: ✅ 100% (开发工具)

---

## 状态管理

### emotionStore.ts
**路径**: `src/stores/emotionStore.ts`

**技术栈**: Zustand

**状态结构**:
```typescript
interface EmotionStore {
  currentEmotion: EmotionType;
  emotionHistory: EmotionSnapshot[];
  widgetName: string;
  setCurrentEmotion: (emotion: EmotionType) => void;
  addEmotionSnapshot: (snapshot: EmotionSnapshot) => void;
}

interface EmotionSnapshot {
  emotion: EmotionType;
  timestamp: number;
  confidence?: number;
}
```

**核心功能**:
1. **当前情绪管理**: 存储和更新当前情绪状态
2. **历史记录**: 记录情绪变化快照
3. **宠物命名**: 存储用户自定义宠物名称

**使用示例**:
```typescript
const { currentEmotion, setCurrentEmotion } = useEmotionStore();

// 更新情绪
setCurrentEmotion('happy');

// 添加历史记录
addEmotionSnapshot({
  emotion: 'happy',
  timestamp: Date.now(),
  confidence: 0.85
});
```

**完成度**: ⚠️ 70%

**已实现**:
- ✅ 基础状态管理
- ✅ 情绪切换
- ✅ 历史记录添加

**待完成**:
- [ ] 数据持久化 (localStorage/文件系统)
- [ ] 历史记录查询和过滤
- [ ] 统计分析功能
- [ ] 数据导出

---

## 自定义Hooks

### useEmotionDetection.ts
**路径**: `src/hooks/useEmotionDetection.ts`

**功能描述**:
情绪检测Hook，定时调用Rust后端进行情绪识别。

**参数**:
```typescript
interval: number = 5000  // 检测间隔(毫秒)
```

**返回值**:
```typescript
{
  emotionData: EmotionData | null;
  isDetecting: boolean;
  error: string | null;
}

interface EmotionData {
  has_face: boolean;
  is_away: boolean;
  work_minutes: number;
  need_break_alert: boolean;
  emotions: Array<{
    source: 'fer' | 'deepface';
    emotion: string;
    confidence: number;
  }>;
}
```

**实现逻辑**:
```typescript
useEffect(() => {
  const detectEmotion = async () => {
    try {
      const result = await invoke<string>('detect_emotion');
      const data = JSON.parse(result);
      setEmotionData(data);

      // 更新emotionStore
      if (data.emotions.length > 0) {
        const primaryEmotion = data.emotions[0].emotion;
        emotionStore.setCurrentEmotion(mapToEmotionType(primaryEmotion));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const timer = setInterval(detectEmotion, interval);
  return () => clearInterval(timer);
}, [interval]);
```

**完成度**: ✅ 100%

**待优化项**:
- [ ] 支持动态调整检测间隔
- [ ] 添加检测失败重试机制
- [ ] 优化情绪映射算法
- [ ] 支持多人脸检测

---

## 工具函数

### emotionUtils.ts
**路径**: `src/utils/emotionUtils.ts`

**功能**: 情绪类型转换工具函数

**函数列表**:

1. **emotionToEmoji**
```typescript
emotionToEmoji(emotion: EmotionType): string
// happy → 😊, calm → 😌, worried → 😰, tired → 😫, sleepy → 😴
```

2. **emotionToValue**
```typescript
emotionToValue(emotion: EmotionType): number
// 将情绪映射到0-100数值，用于图表展示
```

3. **emotionToColor**
```typescript
emotionToColor(emotion: EmotionType): string
// 返回情绪对应的主题色
```

**完成度**: ✅ 100%

---

### tauriApi.ts
**路径**: `src/utils/tauriApi.ts`

**功能**: Tauri API封装

**函数列表**:

1. **saveEmotionData**
```typescript
async saveEmotionData(data: EmotionSnapshot[]): Promise<void>
// 保存情绪数据到本地文件 (待实现)
```

2. **loadEmotionData**
```typescript
async loadEmotionData(): Promise<EmotionSnapshot[]>
// 从本地文件加载情绪数据 (待实现)
```

**完成度**: ⚠️ 20% (仅有接口定义)

**待完成**:
- [ ] 实现文件系统读写
- [ ] 添加数据加密
- [ ] 实现数据备份
- [ ] 添加数据迁移功能

---

## 模块完成度总结

| 模块 | 完成度 | 状态 |
|------|--------|------|
| App.tsx | 100% | ✅ 完成 |
| MoodPet.tsx | 95% | ✅ 基本完成 |
| EmotionChart.tsx | 50% | ⚠️ 部分完成 |
| WindowControls.tsx | 100% | ✅ 完成 |
| BreakAlert.tsx | 100% | ✅ 完成 |
| WhiteNoiseControl.tsx | 90% | ✅ 基本完成 |
| EmotionControls.tsx | 100% | ✅ 完成 |
| emotionStore.ts | 70% | ⚠️ 部分完成 |
| useEmotionDetection.ts | 100% | ✅ 完成 |
| emotionUtils.ts | 100% | ✅ 完成 |
| tauriApi.ts | 20% | ❌ 待实现 |

**整体完成度**: 约 85%

---

## 未来开发清单

### 高优先级
- [ ] 实现数据持久化 (tauriApi.ts)
- [ ] 连接EmotionChart到真实数据
- [ ] 添加设置面板
- [ ] 实现多种白噪音类型

### 中优先级
- [ ] 优化情绪检测算法
- [ ] 添加深呼吸引导组件
- [ ] 实现成就系统
- [ ] 添加数据导出功能

### 低优先级
- [ ] 自定义宠物外观
- [ ] 主题切换功能
- [ ] 语音交互
- [ ] 多语言支持

---

## 技术债务

1. **性能优化**:
   - 粒子系统性能优化 (大量粒子时可能卡顿)
   - 情绪检测结果缓存

2. **代码质量**:
   - 添加单元测试
   - 完善TypeScript类型定义
   - 统一错误处理机制

3. **用户体验**:
   - 添加加载状态提示
   - 优化动画流畅度
   - 改进错误提示信息

---

最后更新: 2025-12-27
