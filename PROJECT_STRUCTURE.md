# MoodPulse 项目结构说明

## 目录结构

```
MoodPulse/
├── src/                          # 前端源代码目录
│   ├── components/               # React 组件
│   │   ├── Widget.tsx            # 主挂件组件 - 显示情绪角色
│   │   ├── EmotionChart.tsx      # 情绪曲线图表组件
│   │   ├── BreathingGuide.tsx    # [待实现] 深呼吸引导组件
│   │   ├── WhiteNoise.tsx        # [待实现] 白噪音播放器
│   │   └── Settings.tsx          # [待实现] 设置面板
│   │
│   ├── stores/                   # Zustand 状态管理
│   │   └── emotionStore.ts       # 情绪状态管理
│   │
│   ├── hooks/                    # 自定义 React Hooks
│   │   ├── useEmotionDetection.ts  # [待实现] 情绪检测 Hook
│   │   ├── useCamera.ts            # [待实现] 摄像头访问 Hook
│   │   └── useAudio.ts             # [待实现] 音频播放 Hook
│   │
│   ├── utils/                    # 工具函数
│   │   ├── emotionUtils.ts       # 情绪相关工具函数
│   │   ├── tauriApi.ts           # Tauri API 封装
│   │   ├── storage.ts            # [待实现] 本地存储工具
│   │   └── messages.ts           # [待实现] 安慰文案库
│   │
│   ├── assets/                   # 静态资源
│   │   ├── sounds/               # 白噪音音频文件
│   │   │   ├── rain.mp3          # [待添加] 雨声
│   │   │   ├── ocean.mp3         # [待添加] 海浪
│   │   │   ├── fire.mp3          # [待添加] 壁炉
│   │   │   ├── forest.mp3        # [待添加] 森林
│   │   │   └── cafe.mp3          # [待添加] 咖啡厅
│   │   │
│   │   ├── animations/           # Lottie 动画文件
│   │   │   ├── breathing.json    # [待添加] 呼吸动画
│   │   │   └── emotions/         # [待添加] 各种情绪动画
│   │   │
│   │   └── images/               # 图片资源
│   │       └── icons/            # 应用图标
│   │
│   ├── styles/                   # 样式文件
│   │   └── index.css             # 全局样式和动画定义
│   │
│   ├── App.tsx                   # 根组件
│   └── main.tsx                  # 应用入口
│
├── src-tauri/                    # Tauri 后端 (Rust)
│   ├── src/
│   │   ├── main.rs               # Rust 主程序
│   │   ├── emotion.rs            # [待实现] 情绪分析模块
│   │   └── storage.rs            # [待实现] 数据存储模块
│   │
│   ├── Cargo.toml                # Rust 依赖配置
│   ├── tauri.conf.json           # Tauri 应用配置
│   └── build.rs                  # 构建脚本
│
├── index.html                    # HTML 入口模板
├── vite.config.ts                # Vite 构建配置
├── tailwind.config.js            # Tailwind CSS 配置
├── postcss.config.js             # PostCSS 配置
├── tsconfig.json                 # TypeScript 配置
├── tsconfig.node.json            # Node 环境 TS 配置
├── package.json                  # NPM 依赖和脚本
├── .gitignore                    # Git 忽略文件
└── README.md                     # 项目说明文档
```

## 核心文件说明

### 前端核心

1. **src/App.tsx**
   - 应用根组件
   - 管理主视图切换 (挂件 / 图表)

2. **src/components/Widget.tsx**
   - 主挂件组件
   - 显示当前情绪状态
   - 处理用户交互

3. **src/stores/emotionStore.ts**
   - 全局情绪状态管理
   - 使用 Zustand 实现

4. **src/styles/index.css**
   - 全局样式定义
   - 情绪色彩方案
   - 动画效果

### 后端核心

1. **src-tauri/src/main.rs**
   - Tauri 应用入口
   - 系统托盘管理
   - IPC 命令处理

2. **src-tauri/tauri.conf.json**
   - 窗口配置
   - 权限设置
   - 打包配置

## 待实现功能

### 高优先级
- [ ] 摄像头情绪识别集成
- [ ] 深呼吸引导组件
- [ ] 本地数据持久化
- [ ] 设置面板

### 中优先级
- [ ] 白噪音播放器
- [ ] 更多动画效果
- [ ] 成就系统
- [ ] 皮肤系统

### 低优先级
- [ ] 数据导出功能
- [ ] 多语言支持
- [ ] 主题切换

## 开发建议

1. **组件开发**: 在 `src/components/` 中创建新组件
2. **状态管理**: 使用 Zustand store 管理全局状态
3. **样式**: 优先使用 Tailwind CSS 类,复杂动画写在 CSS 文件中
4. **类型安全**: 充分利用 TypeScript 类型系统
5. **性能**: 使用 React.memo 和 useMemo 优化渲染

## 资源添加指南

### 添加音频文件
1. 将音频文件放入 `src/assets/sounds/`
2. 在 `WhiteNoise.tsx` 中引用

### 添加动画
1. 将 Lottie JSON 放入 `src/assets/animations/`
2. 使用 `@lottiefiles/react-lottie-player` 加载

### 添加图标
1. 优先使用 `lucide-react` 图标库
2. 自定义图标放入 `src/assets/images/icons/`
