# MoodPulse

你的桌面情绪小伙伴 💕

## 项目简介

MoodPulse 是一个桌面情绪陪伴挂件应用，通过可爱的拟人化角色陪伴你的工作和学习，实时检测和关心你的情绪变化，提供久坐提醒和白噪音播放等功能。

## 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **桌面框架**: Tauri 1.5
- **状态管理**: Zustand
- **动画库**: Framer Motion
- **图表库**: Recharts
- **样式**: Tailwind CSS
- **图标**: Lucide React

### 后端
- **桌面后端**: Rust (Tauri)
- **数据库**: SQLite (本地存储)
- **情绪识别**: Python 3.x
  - OpenCV (计算机视觉)
  - FER (情绪识别)
  - DeepFace (深度学习情绪分析)
  - MTCNN (人脸检测)
  - TensorFlow + Keras (深度学习框架)
- **音频播放**: Rodio (Rust音频库)

## 项目结构

```
MoodPulse/
├── src/                      # 前端源代码
│   ├── components/           # React 组件
│   │   ├── MoodPet.tsx       # 桌面宠物组件
│   │   ├── EmotionChart.tsx  # 情绪曲线图表
│   │   ├── WindowControls.tsx # 窗口控制按钮
│   │   ├── BreakAlert.tsx    # 休息提醒弹窗
│   │   └── WhiteNoiseControl.tsx # 白噪音控制
│   ├── stores/               # Zustand 状态管理
│   │   └── emotionStore.ts   # 情绪状态
│   ├── hooks/                # 自定义 Hooks
│   │   └���─ useEmotionDetection.ts # 情绪检测Hook
│   ├── utils/                # 工具函数
│   ├── App.tsx               # 根组件
│   └── main.tsx              # 入口文件
├── src-tauri/                # Tauri 后端
│   ├── src/
│   │   ├── main.rs           # Rust 主程序
│   │   └── audio.rs          # 音频播放模块
│   ├── emotion_service.py    # Python情绪检测服务
│   ├── Cargo.toml            # Rust 依赖配置
│   ├── tauri.conf.json       # Tauri 配置
│   └── build.rs              # 构建脚本
├── requirements.txt          # Python依赖
├── vite.config.ts            # Vite 配置
├── tailwind.config.js        # Tailwind 配置
└── package.json              # 项目依赖
```

## 开发环境要求

### 必需安装

1. **Node.js** (v18+)
   - 下载: https://nodejs.org/

2. **Rust** (最新稳定版)
   - 下载: https://www.rust-lang.org/tools/install
   - Windows 用户需要安装 Visual Studio C++ Build Tools

3. **Python** (3.8+)
   - 下载: https://www.python.org/downloads/
   - 需要安装 pip

4. **Tauri 系统依赖**
   - Windows: WebView2 (通常已预装)
   - macOS: 无需额外依赖
   - Linux: 参考 [Tauri 文档](https://tauri.app/v1/guides/getting-started/prerequisites)

## 快速开始

### 1. 安装前端依赖

```bash
npm install
```

### 2. 配置Python环境

**推荐使用Anaconda环境**（确保包含所有依赖）：

```bash
# 使用你的Python环境安装依赖
pip install -r requirements.txt
```

**设置Python路径环境变量**（重要！）：

程序需要知道使用哪个Python环境。请根据你的终端类型选择：

**PowerShell（推荐）**：
```powershell
$env:MOODPULSE_PYTHON_PATH="D:\anaconda\envs\KidMagic\python.exe"
```

**CMD**：
```cmd
set MOODPULSE_PYTHON_PATH=D:\anaconda\envs\KidMagic\python.exe
```

> 💡 **提示**：将 `D:\anaconda\envs\KidMagic\python.exe` 替换为你的实际Python路径

### 3. 开发模式

**PowerShell**：
```powershell
# 设置Python路径并启动（一行命令）
$env:MOODPULSE_PYTHON_PATH="D:\anaconda\envs\KidMagic\python.exe"; npm run tauri:dev

# 或者分两步
$env:MOODPULSE_PYTHON_PATH="D:\anaconda\envs\KidMagic\python.exe"
npm run tauri:dev
```

**CMD**：
```cmd
set MOODPULSE_PYTHON_PATH=D:\anaconda\envs\KidMagic\python.exe && npm run tauri:dev
```

这将启动 Vite 开发服务器和 Tauri 应用。

> ⚠️ **注意**：如果不设置 `MOODPULSE_PYTHON_PATH`，程序会使用系统默认Python，可能导致依赖缺失。

### 4. 构建生产版本

```bash
npm run tauri:build
```

构建产物将在 `src-tauri/target/release/bundle/` 目录下。

## 核心功能

### ✅ 已实现功能

#### 1. 桌面宠物挂件
- 可拖动的透明桌面窗口 (280x420px)
- 5种情绪状态动画（开心、平静、担心、疲惫、困倦）
- 自动眨眼和呼吸动画
- 点击交互反馈和抚摸特效
- 系统托盘集成（最小化到托盘）
- 窗口控制（最小化、关闭按钮）

#### 2. 实时情绪检测
- 基于摄像头的面部情绪识别
- 双引擎检测（FER + DeepFace）
- 每5秒自动检测一次
- 情绪自动映射到宠物状态
- 离开工位检测
- 数据实时存储到SQLite数据库

#### 3. 情绪分析算法 🆕
- **情绪指数** (1-10分制)
  - 多模态置信度融合（FER + DeepFace）
  - 加权时序衰减（越近的记录权重越高）
  - 峰终定律（Peak-End Rule）心理学模型
- **压力水平** (0-100%)
  - 情绪波动惩罚模型
  - 动态颜色指示（绿/琥珀/橙/红）
  - 实时压力评估
- 详细算法文档: [EMOTION_ANALYSIS_ALGORITHM.md](./docs/EMOTION_ANALYSIS_ALGORITHM.md)

#### 4. 专注时长统计 🆕
- 自动识别专注时段（连续检测到面部）
- 统计今日专注次数（≥30分钟）
- 显示当前专注时长
- 今日总专注时长统计
- 智能间隔判断（60秒阈值）

#### 5. 情绪数据可视化 🆕
- **情绪时间线图表**
  - 30分钟间隔的情绪曲线
  - 心电图风格动画效果
  - 节点脉冲动画
  - 曲线发光效果
  - 扫描线动画
  - 入场绘制动画
- **报告界面**
  - 今日情绪指数展示
  - 压力水平进度条
  - 专注时长统计
  - 情绪快照记录

#### 6. 数据持久化 🆕
- SQLite数据库存储
- 情绪历史记录保存
- 支持日期范围查询
- 数据统计分析
- 本地数据安全存储

#### 7. 久坐提醒
- 连续工作45分钟自动提醒
- 工作时长实时追踪
- 离开工位自动重置计时
- 可关闭的提醒弹窗

#### 8. 白噪音播放
- 实时生成白噪音
- 音量调节（0-100%）
- 一键开启/关闭
- 后台持续播放

### 🚧 部分实现功能

#### 智能关怀
- 基础情绪快照展示
- 待完善：个性化建议和温暖文案

### ❌ 未实现功能

#### 1. 多样化白噪音
- 雨声、海浪、森林等多种音效
- 白噪音类型选择界面

#### 2. 深呼吸引导
- 呼吸节奏动画
- 语音/视觉引导

#### 3. 设置面板
- 检测频率调整
- 提醒时间自定义
- 主题切换

#### 4. 成就系统
- 情绪管理成就
- 连续使用奖励
- 成长可视化

## 使用说明

### 桌面宠物操作
- **拖动窗口**: 在宠物或背景区域按住鼠标拖动
- **最小化**: 点击黄色按钮，程序将隐藏到系统托盘
- **关闭程序**: 点击红色按钮
- **显示窗口**: 点击系统托盘图标

### 白噪音控制
- **播放/停止**: 点击音量图标按钮
- **调节音量**: 拖动滑块调整音量大小

### 情绪检测
- 程序启动后自动开始检测
- 确保摄像头权限已开启
- 面向摄像头以获得最佳检测效果

### 久坐提醒
- 连续工作45分钟后自动弹出提醒
- 点击关闭按钮可暂时关闭提醒
- 离开工位后计���自动重置

## 配置说明

### Tauri 窗口配置

在 `src-tauri/tauri.conf.json` 中可以调整:
- 窗口大小: `width`, `height`
- 窗口位置: `x`, `y`
- 透明度: `transparent`
- 始终置顶: `alwaysOnTop`
- 系统托盘图标: `systemTray.iconPath`

### 情绪检测配置

在 `src-tauri/emotion_service.py` 中可以调整:
- 检测帧率: `sample_rate`
- 离开工位阈值: `away_threshold`
- 提醒间隔: `alert_interval`

### 前端检测频率

在 `src/hooks/useEmotionDetection.ts` 中可以调整:
- 检测间隔: `interval` 参数（默认5000ms）

## 故障排除

### 摄像头无法访问
- 检查系统摄像头权限
- 确认摄像头未被其他程序占用
- 重启应用程序

### Python依赖安装失败
- 使用国内镜像源: `pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple`
- 确保Python版本 >= 3.8
- Windows用户可能需要安装Visual C++ Redistributable

### Rust编译错误
- 更新Rust: `rustup update`
- 清理缓存: `cargo clean`
- 重新编译: `npm run tauri:dev`

### 白噪音无声音
- 检查系统音量设置
- 确认音频输出设备正常
- 尝试调整应用内音量滑块

## 性能优化

- 情绪检测采用间隔采样（5秒），避免持续占用资源
- 白噪音使用实时生成，无需加载大文件
- 窗口透明和动画使用GPU加速
- Python进程按需调用，不常驻内存

## 隐私保护

- 所有情绪数据仅存储在本地
- 不会上传任何数据到服务器
- 摄像头仅用于本地情绪分析
- 可随时关闭情绪检测功能

## 注意事项

1. **首次运行**: 首次启动可能需要下载深度学习模型，请保持网络连接
2. **资源占用**: 情绪检测会占用一定CPU资源，建议在性能较好的设备上使用
3. **摄像头隐私**: 程序不会保存或传输摄像头画面
4. **跨平台**: 项目支持 Windows、macOS 和 Linux

## 项目架构

### 架构模式
- **前后端分离**: React前端 + Rust后端
- **进程间通信**: Tauri IPC (JSON-RPC)
- **外部服务**: Python子进程调用
- **状态管理**: Zustand单向数据流
- **音频处理**: Rust实时生成

### 数据流
```
摄像头 → Python情绪检测 → Rust后端 → Tauri IPC → React前端 → Zustand Store → UI更新
```

### 模块依赖关系
```
App.tsx
  ├─ useEmotionDetection (调用Rust detect_emotion)
  ├─ MoodPet (读取emotionStore)
  │   └─ WhiteNoiseControl (调用Rust audio commands)
  ├─ BreakAlert (基于emotion检测结果)
  └─ WindowControls (调用Tauri window API)
```

## 项目文档

- **[README.md](./README.md)** - 项目概览和快速开始指南
- **[EMOTION_ANALYSIS_ALGORITHM.md](./docs/EMOTION_ANALYSIS_ALGORITHM.md)** - 情绪分析算法详细文档 🆕
- **[FRONTEND_API_DOCUMENTATION.md](./FRONTEND_API_DOCUMENTATION.md)** - 前端接口文档（后端接入指南）
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - 项目结构说明
- **[QUICK_START.md](./QUICK_START.md)** - 快速开始指南
- **[ATTRIBUTIONS.md](./ATTRIBUTIONS.md)** - 开源许可和致谢
- **[UPDATE_FREQUENCY.md](./UPDATE_FREQUENCY.md)** - 更新频率说明文档

## 开发计划

### 近期计划
- [x] 完善情绪数据可视化
- [x] 实现数据持久化
- [x] 情绪分析算法
- [x] 专注时长统计
- [ ] 添加设置面板
- [ ] 多样化白噪音音效

### 长期计划
- [ ] 深呼吸引导功能
- [ ] 成就系统
- [ ] 智能关怀推送
- [ ] 多语言支持
- [ ] 跨平台优化

## 贡献指南

欢迎提交 Issue 和 Pull Request!

## 许可证

MIT License

---

用 ❤️ 打造的情绪陪伴应用
