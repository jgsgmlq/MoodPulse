# 更新频率说明文档

## 前端更新频率总览

### 1. 宠物状态更新
- **更新频率**: 每 5 秒
- **触发方式**: 自动检测情绪
- **更新内容**: 宠物动画状态（happy/calm/worried/tired）
- **代码位置**: `src/App.tsx` 第18行

```typescript
const { emotionData } = useEmotionDetection(5000, isPaused || privacyMode)
```

### 2. 情绪报告界面更新
- **更新频率**: 每 30 秒（可配置）
- **触发方式**: 自动刷新 + 打开时立即获取
- **更新内容**: 情绪指数、压力水平、有效记录数
- **代码位置**: `src/hooks/useEmotionAnalysis.ts`

```typescript
const { analysis } = useEmotionAnalysis(30000)  // 30秒自动刷新
```

## 详细说明

### 宠物状态更新流程

```
每5秒触发
    ↓
调用摄像头检测情绪
    ↓
Python AI模型分析
    ↓
返回情绪结果
    ↓
更新宠物动画状态
```

**支持的状态**:
- `happy` - 开心 😊
- `calm` - 平静 😌
- `worried` - 担心 😟
- `tired` - 疲惫 😴

### 报告界面更新流程

```
打开报告界面
    ↓
立即获取今日数据
    ↓
显示情绪指数和压力水平
    ↓
每30秒自动刷新一次
    ↓
更新最新的分析结果
```

**更新内容**:
- 情绪指数（1-10分）
- 压力水平（0-100%）
- 压力水平进度条颜色
- 有效记录数

## 自定义更新频率

### 修改宠物更新频率

编辑 `src/App.tsx` 第18行：

```typescript
// 更快（3秒）
const { emotionData } = useEmotionDetection(3000, isPaused || privacyMode)

// 更慢（10秒）
const { emotionData } = useEmotionDetection(10000, isPaused || privacyMode)

// 禁用自动更新（0表示不自动更新）
const { emotionData } = useEmotionDetection(0, isPaused || privacyMode)
```

### 修改报告界面更新频率

编辑 `src/components/ReportWindow.tsx`，修改 `useEmotionAnalysis` 调用：

```typescript
// 更快（15秒）
const { analysis, loading, error } = useEmotionAnalysis(15000);

// 更慢（60秒）
const { analysis, loading, error } = useEmotionAnalysis(60000);

// 禁用自动刷新（只在打开时获取一次）
const { analysis, loading, error } = useEmotionAnalysis(0);
```

## 推荐配置

### 场景1: 实时监控（高频更新）
```typescript
// 宠物状态: 3秒
useEmotionDetection(3000, ...)

// 报告界面: 15秒
useEmotionAnalysis(15000)
```

**适用于**: 需要快速响应情绪变化的场景

### 场景2: 平衡模式（推荐）✅
```typescript
// 宠物状态: 5秒
useEmotionDetection(5000, ...)

// 报告界面: 30秒
useEmotionAnalysis(30000)
```

**适用于**: 大多数使用场景，平衡实时性和性能

### 场景3: 省电模式（低频更新）
```typescript
// 宠物状态: 10秒
useEmotionDetection(10000, ...)

// 报告界面: 60秒
useEmotionAnalysis(60000)
```

**适用于**: 长时间运行，节省系统资源

## 性能考虑

### 宠物状态检测（5秒）
- **资源消耗**: 中等
- **涉及操作**:
  - 摄像头读取
  - Python AI模型推理
  - FER + DeepFace 双模型
- **建议**: 不要低于3秒，避免过度占用资源

### 报告界面分析（30秒）
- **资源消耗**: 较高
- **涉及操作**:
  - 数据库查询（今日所有记录）
  - 遍历所有有效记录
  - 复杂的统计计算
- **建议**: 不要低于15秒，避免频繁的数据库操作

## 用户体验建议

### 宠物状态更新
- ✅ **5秒**: 用户能充分欣赏每个动画状态
- ⚠️ **3秒**: 切换较快，适合快速响应
- ❌ **1-2秒**: 过于频繁，动画来不及展示

### 报告界面更新
- ✅ **30秒**: 数据保持较新，不会过于频繁
- ⚠️ **60秒**: 更新较慢，但节省资源
- ❌ **10秒以下**: 过于频繁，用户可能注意不到变化

## 手动刷新

两个界面都支持手动刷新：

### 宠物状态
```typescript
const { detectEmotion } = useEmotionDetection(5000, ...)
// 调用 detectEmotion() 立即检测
```

### 报告界面
```typescript
const { refetch } = useEmotionAnalysis(30000)
// 调用 refetch() 立即刷新
```

## 暂停和恢复

### 宠物状态
```typescript
// 通过 paused 参数控制
const { emotionData } = useEmotionDetection(5000, isPaused)
```

当 `isPaused = true` 时，停止自动检测

### 报告界面
报告界面关闭时自动停止刷新，重新打开时重新开始

## 总结

| 功能 | 默认频率 | 可配置 | 推荐范围 |
|------|---------|--------|---------|
| 宠物状态 | 5秒 | ✅ | 3-10秒 |
| 报告界面 | 30秒 | ✅ | 15-60秒 |

**当前配置已经是最优平衡**，既保证了实时性，又不会过度消耗系统资源。
