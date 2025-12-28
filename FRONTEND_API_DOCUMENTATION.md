# MoodPulse 前端接口文档

## 📋 目录
1. [架构概览](#架构概览)
2. [数据类型定义](#数据类型定义)
3. [Tauri 命令接口](#tauri-命令接口)
4. [前端 Hooks](#前端-hooks)
5. [状态管理](#状态管理)
6. [数据流程](#数据流程)
7. [后端接入指南](#后端接入指南)

---

## 架构概览

MoodPulse 采用 Tauri 架构，前端使用 React + TypeScript，后端使用 Rust + Python。

```
┌─────────────────────────────────────────────────────────┐
│                    前端 (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  UI 组件     │  │  Hooks       │  │  Store       │  │
│  │  - Pet       │  │  - useEmotion│  │  - Zustand   │  │
│  │  - Report    │  │    Detection │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕ Tauri IPC
┌─────────────────────────────────────────────────────────┐
│                   后端 (Rust + Python)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Tauri Commands│  │  Database    │  │  Python      │  │
│  │ - detect_    │  │  - SQLite    │  │  - FER       │  │
│  │   emotion    │  │  - Records   │  │  - DeepFace  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 数据类型定义

### 1. EmotionData (情绪数据)

**位置**: `src/hooks/useEmotionDetection.ts`

```typescript
interface EmotionData {
  emotion: 'happy' | 'calm' | 'worried' | 'tired';
  confidence: number;  // 0-1 之间的置信度
  source: 'fer' | 'deepface';  // 情绪检测来源
}
```

### 2. DetectionResult (检测结果)

**位置**: `src/hooks/useEmotionDetection.ts`

```typescript
interface DetectionResult {
  has_face: boolean;           // 是否检测到人脸
  is_away: boolean;            // 用户是否离开
  work_minutes: number;        // 工作时长（分钟）
  need_break_alert: boolean;   // 是否需要休息提醒
  emotions: EmotionData[];     // 情绪数据数组（通常包含 FER 和 DeepFace 结果）
}
```

**JSON 示例**:
```json
{
  "has_face": true,
  "is_away": false,
  "work_minutes": 45.5,
  "need_break_alert": false,
  "emotions": [
    {
      "emotion": "calm",
      "confidence": 0.85,
      "source": "fer"
    },
    {
      "emotion": "happy",
      "confidence": 0.72,
      "source": "deepface"
    }
  ]
}
```

### 3. EmotionRecord (数据库记录)

**位置**: `src-tauri/src/db.rs`

```rust
struct EmotionRecord {
    id: Option<i64>,
    timestamp: i64,                      // Unix 时间戳
    datetime: String,                    // 格式: "YYYY-MM-DD HH:MM:SS"
    fer_emotion: String,                 // FER 检测的情绪
    fer_confidence: f64,                 // FER 置信度 (0-1)
    deepface_emotion: Option<String>,    // DeepFace 检测的情绪（可选）
    deepface_confidence: Option<f64>,    // DeepFace 置信度 (0-1)
    mapped_emotion: String,              // 映射后的情绪状态
    work_minutes: f64,                   // 工作时长
    is_away: bool,                       // 是否离开
    has_face: bool,                      // 是否有人脸
}
```

### 4. EmotionSnapshot (情绪快照)

**位置**: `src/stores/emotionStore.ts`

```typescript
interface EmotionSnapshot {
  timestamp: string;  // ISO 时间戳
  emotion: Emotion;   // 'happy' | 'calm' | 'worried' | 'tired' | 'sleepy'
  confidence: number; // 0-1 之间
}
```

---

## Tauri 命令接口

所有命令通过 `invoke` 调用，位于 `src-tauri/src/main.rs`。

### 1. detect_emotion (情绪检测)

**功能**: 调用 Python 脚本进行实时情绪检测

**调用方式**:
```typescript
import { invoke } from '@tauri-apps/api/tauri';

const result = await invoke<string>('detect_emotion');
const data: DetectionResult = JSON.parse(result);
```

**返回值**: JSON 字符串，解析后为 `DetectionResult` 类型

**Python 脚本**: `src-tauri/emotion_service.py`

**执行流程**:
1. Rust 调用 Python 脚本
2. Python 使用摄像头捕获图像
3. 使用 FER 和 DeepFace 进行情绪分析
4. 返回 JSON 格式的检测结果
5. Rust 将结果保存到 SQLite 数据库

---

### 2. get_emotion_history (获取历史记录)

**功能**: 获取最近的情绪记录

**调用方式**:
```typescript
const history = await invoke<string>('get_emotion_history', { limit: 100 });
const records: EmotionRecord[] = JSON.parse(history);
```

**参数**:
- `limit: i64` - 返回记录数量

**返回值**: JSON 字符串数组，包含 `EmotionRecord` 对象

---

### 3. get_emotion_stats (获取统计数据)

**功能**: 获取指定日期的情绪统计

**调用方式**:
```typescript
const stats = await invoke<string>('get_emotion_stats', {
  date: '2025-12-27'
});
const data = JSON.parse(stats);
```

**参数**:
- `date: String` - 日期格式 "YYYY-MM-DD"

**返回值**: JSON 对象，包含该日期的统计信息

---

### 4. get_emotion_by_date_range (按日期范围查询)

**功能**: 获取指定日期范围内的情绪记录

**调用方式**:
```typescript
const records = await invoke<string>('get_emotion_by_date_range', {
  start_date: '2025-12-20',
  end_date: '2025-12-27'
});
const data: EmotionRecord[] = JSON.parse(records);
```

**参数**:
- `start_date: String` - 开始日期 "YYYY-MM-DD"
- `end_date: String` - 结束日期 "YYYY-MM-DD"

---

### 5. 白噪音控制命令

#### play_white_noise
```typescript
await invoke('play_white_noise', { volume: 0.5 });
```

#### stop_white_noise
```typescript
await invoke('stop_white_noise');
```

#### set_white_noise_volume
```typescript
await invoke('set_white_noise_volume', { volume: 0.8 });
```

#### is_white_noise_playing
```typescript
const isPlaying = await invoke<boolean>('is_white_noise_playing');
```

---

## 前端 Hooks

### useEmotionDetection

**位置**: `src/hooks/useEmotionDetection.ts`

**功能**: 自动定时调用情绪检测，管理检测状态

**使用方式**:
```typescript
import { useEmotionDetection } from './hooks/useEmotionDetection';

function App() {
  const { emotionData, isDetecting, error, detectEmotion } = useEmotionDetection(5000);

  // emotionData: DetectionResult | null
  // isDetecting: boolean
  // error: string | null
  // detectEmotion: () => Promise<void>
}
```

**参数**:
- `interval: number` - 检测间隔（毫秒），默认 5000ms

**返回值**:
- `emotionData`: 最新的检测结果
- `isDetecting`: 是否正在检测
- `error`: 错误信息
- `detectEmotion`: 手动触发检测的函数

**工作原理**:
1. 组件挂载时开始第一次检测
2. 每次检测完成后，等待 `interval` 毫秒再进行下次检测
3. 使用 `useRef` 防止并发检测
4. 组件卸载时自动清理定时器

---

## 状态管理

### useEmotionStore (Zustand)

**位置**: `src/stores/emotionStore.ts`

**功能**: 全局情绪状态管理

**使用方式**:
```typescript
import { useEmotionStore } from './stores/emotionStore';

function Component() {
  const {
    currentEmotion,
    emotionHistory,
    setCurrentEmotion,
    addEmotionSnapshot
  } = useEmotionStore();
}
```

**状态**:
- `currentEmotion: Emotion` - 当前情绪状态
- `emotionHistory: EmotionSnapshot[]` - 情绪历史快照
- `widgetName: string` - 小部件名称

**方法**:
- `setCurrentEmotion(emotion: Emotion)` - 设置当前情绪
- `addEmotionSnapshot(snapshot: EmotionSnapshot)` - 添加情绪快照
- `setWidgetName(name: string)` - 设置小部件名称

---

## 数据流程

### 情绪检测流程

```
1. useEmotionDetection Hook 定时触发
   ↓
2. 调用 invoke('detect_emotion')
   ↓
3. Rust 执行 Python 脚本 (emotion_service.py)
   ↓
4. Python 使用摄像头 + FER/DeepFace 分析
   ↓
5. 返回 JSON 格式的 DetectionResult
   ↓
6. Rust 解析并保存到 SQLite 数据库
   ↓
7. 返回结果给前端
   ↓
8. 前端更新 UI (宠物状态、表情等)
   ↓
9. 更新 Zustand store (emotionHistory)
```

### 报告窗口数据流程

```
1. 用户点击"查看报告"按钮
   ↓
2. 调用 handleShowReport()
   ↓
3. 显示预定义的 'report' 窗口
   ↓
4. Report 组件加载
   ↓
5. 调用 get_emotion_history() 获取历史数据
   ↓
6. 调用 get_emotion_stats() 获取统计数据
   ↓
7. 渲染图表和统计信息
```

---

## 后端接入指南

### 1. 替换 Python 情绪检测服务

如果需要替换 Python 脚本为其他后端服务：

**方式 A: 修改 Rust 命令**

编辑 `src-tauri/src/main.rs` 中的 `detect_emotion` 函数：

```rust
#[tauri::command]
fn detect_emotion(state: tauri::State<AppState>) -> Result<String, String> {
    // 替换为你的 HTTP API 调用
    let response = reqwest::blocking::get("http://your-api.com/detect")
        .map_err(|e| format!("API error: {}", e))?
        .text()
        .map_err(|e| format!("Parse error: {}", e))?;

    // 确保返回格式符合 DetectionResult
    Ok(response)
}
```

**方式 B: 使用 WebSocket**

如果需要实时推送，可以在前端直接连接 WebSocket：

```typescript
// 在 useEmotionDetection.ts 中
const ws = new WebSocket('ws://your-backend.com/emotion');

ws.onmessage = (event) => {
  const data: DetectionResult = JSON.parse(event.data);
  setEmotionData(data);
};
```

### 2. 数据格式要求

**关键要求**:
- 必须返回 `DetectionResult` 格式的 JSON
- `emotions` 数组至少包含一个元素
- `confidence` 必须在 0-1 之间
- `emotion` 必须是: `'happy' | 'calm' | 'worried' | 'tired'`

**最小有效响应**:
```json
{
  "has_face": true,
  "is_away": false,
  "work_minutes": 0,
  "need_break_alert": false,
  "emotions": [
    {
      "emotion": "calm",
      "confidence": 0.8,
      "source": "fer"
    }
  ]
}
```

### 3. 添加新的 Tauri 命令

**步骤**:

1. 在 `src-tauri/src/main.rs` 中定义命令：
```rust
#[tauri::command]
fn your_new_command(param: String) -> Result<String, String> {
    // 实现逻辑
    Ok("success".to_string())
}
```

2. 注册命令：
```rust
.invoke_handler(tauri::generate_handler![
    detect_emotion,
    your_new_command  // 添加这里
])
```

3. 前端调用：
```typescript
const result = await invoke<string>('your_new_command', { param: 'value' });
```

### 4. 数据库扩展

如果需要添加新字段到数据库：

1. 修改 `src-tauri/src/db.rs` 中的 `EmotionRecord` 结构
2. 更新 `init()` 方法中的 SQL 创建语句
3. 更新 `insert_record()` 和查询方法

### 5. 前端集成新接口

**创建新 Hook**:
```typescript
// src/hooks/useYourFeature.ts
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export function useYourFeature() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await invoke('your_new_command');
      setData(result);
    };
    fetchData();
  }, []);

  return { data };
}
```

---

## 🔧 调试技巧

### 1. 查看 Tauri 命令日志

在 Rust 代码中使用 `println!` 输出日志，会显示在终端中：
```rust
println!("Debug info: {:?}", data);
```

### 2. 前端调试

使用浏览器开发者工具（在 Tauri 窗口中按 F12）：
```typescript
console.log('Emotion data:', emotionData);
```

### 3. 数据库查询

数据库位置: `%APPDATA%/com.moodpulse.app/emotions.db`

使用 SQLite 工具查看：
```sql
SELECT * FROM emotion_records ORDER BY timestamp DESC LIMIT 10;
```

---

## 📞 联系与支持

如有接口问题或需要协助，请查看：
- 源代码: `src/hooks/useEmotionDetection.ts`
- 后端实现: `src-tauri/src/main.rs`
- 数据库: `src-tauri/src/db.rs`

---

**文档版本**: 1.0
**最后更新**: 2025-12-27
**适用版本**: MoodPulse v0.1.0
