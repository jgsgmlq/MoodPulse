# MoodPulse 文档导航

欢迎查看 MoodPulse 项目的完整技术文档！

## 📚 文档结构

### 1. [README.md](../README.md)
**项目概览和快速开始指南**
- 项目简介
- 技术栈
- 安装和运行
- 核心功能列表
- 使用说明
- 故障排除

---

### 2. [前端模块文档](./FRONTEND_MODULES.md)
**React前端技术详解**

**包含内容**:
- 7个核心组件详细说明
  - App.tsx - 应用根组件
  - MoodPet.tsx - 桌面宠物 (95%完成)
  - EmotionChart.tsx - 情绪图表 (50%完成)
  - WindowControls.tsx - 窗口控制
  - BreakAlert.tsx - 休息提醒
  - WhiteNoiseControl.tsx - 白噪音控制 (90%完成)
  - EmotionControls.tsx - 开发工具

- 状态管理 (Zustand)
  - emotionStore.ts (70%完成)

- 自定义Hooks
  - useEmotionDetection.ts (100%完成)

- 工具函数
  - emotionUtils.ts (100%完成)
  - tauriApi.ts (20%完成)

**适合阅读对象**: 前端开���者、React开发者

---

### 3. [后端模块文档](./BACKEND_MODULES.md)
**Rust后端技术详解**

**包含内容**:
- Rust核心模块
  - main.rs - 应用入口 (95%完成)
  - audio.rs - 音频系统 (100%完成)

- Tauri命令详解
  - 数据持久化命令 (0%完成)
  - 情绪检测命令 (100%完成)
  - 音频控制命令 (100%完成)

- 系统托盘集成
- 配置文件说明
  - tauri.conf.json
  - Cargo.toml
  - build.rs

**适合阅读对象**: Rust开发者、Tauri开发者

---

### 4. [Python服务文档](./PYTHON_SERVICE.md)
**情绪检测服务技术详解**

**包含内容**:
- EmotionDetector类设计
- 双引擎检测算法
  - FER (快速检测)
  - DeepFace (高精度)
- 离开检测机制 (滑动窗口算法)
- 工作时长追踪
- 依赖库说明
- 性能优化建议

**适合阅读对象**: Python开发者、机器学习工程师

---

### 5. [模块完成度与路线图](./MODULE_STATUS.md)
**项目进度和开发计划**

**包含内容**:
- 项目整体进度 (85%)
- 各模块完成度详情
- 功能完成度矩阵
- 7个阶段开发路线图
  1. 数据持久化 (高优先级)
  2. 数据可视化完善 (高优先级)
  3. 多种白噪音 (高优先级)
  4. 设置面板 (中优先级)
  5. 深呼吸引导 (中优先级)
  6. 性能优化 (中优先级)
  7. 高级功能 (低优先级)
- 技术债务清单
- 性能和质量指标
- 发布计划

**适合阅读对象**: 项目管理者、贡献者、所有开发者

---

## 🎯 快速导航

### 我想了解...

#### 项目整体情况
→ 阅读 [README.md](../README.md) 和 [MODULE_STATUS.md](./MODULE_STATUS.md)

#### 如何开发前端功能
→ 阅读 [FRONTEND_MODULES.md](./FRONTEND_MODULES.md)

#### 如何开发后端功能
→ 阅读 [BACKEND_MODULES.md](./BACKEND_MODULES.md)

#### 情绪检测如何工作
→ 阅读 [PYTHON_SERVICE.md](./PYTHON_SERVICE.md)

#### 哪些功能还未完成
→ 阅读 [MODULE_STATUS.md](./MODULE_STATUS.md) 的"功能完成度矩阵"部分

#### 下一步应该做什么
→ 阅读 [MODULE_STATUS.md](./MODULE_STATUS.md) 的"开发路线图"部分

---

## 📊 项目统计

### 整体完成度
```
████████████████████████████████████░░░░░░░ 85%
```

### 各层完成度
- 前端层: 85%
- 后端层: 88%
- Python服务: 100%
- 配置文件: 100%

### 核心功能状态
- ✅ 已完成: 桌面宠物、情绪检测、休息提醒、白噪音、系统托盘
- ⚠️ 部分完成: 数据可视化 (50%)
- ❌ 未实现: 数据持久化、设置面板、成就系统

---

## 🚀 快速开始开发

### 1. 环境准备
```bash
# 安装依赖
npm install
pip install -r requirements.txt

# 开发模式
npm run tauri:dev
```

### 2. 选择任务
查看 [MODULE_STATUS.md](./MODULE_STATUS.md) 中的待办清单，选择感兴趣的任务。

### 3. 阅读相关文档
根据任务类型，阅读对应的模块文档。

### 4. 开始开发
创建分支，实现功能，提交PR。

---

## 📝 文档维护

### 更新频率
- 每次重大功能完成后更新
- 每个版本发布前更新

### 维护者
- 项目负责人

### 贡献文档
如发现文档错误或需要补充，请提交Issue或PR。

---

## 🔗 相关链接

- [Tauri官方文档](https://tauri.app/)
- [React官方文档](https://react.dev/)
- [Rust官方文档](https://www.rust-lang.org/)
- [FER库文档](https://github.com/justinshenk/fer)
- [DeepFace库文档](https://github.com/serengil/deepface)

---

## 📧 联系方式

如有问题或建议，请通过以下方式联系:
- GitHub Issues
- 项目讨论区

---

最后更新: 2025-12-27
