# MoodPulse 快速开发指南

## 🚀 立即开始

### 前端开发者 - 独立开发模式

如果你只想开发前端UI,不需要等待Rust编译:

```bash
# 1. 安装依赖
npm install

# 2. 启动Vite开发服务器
npm run dev

# 3. 在浏览器打开 http://localhost:5173
```

这样可以快速预览和调试React组件,不需要启动Tauri。

---

### 后端开发者 - 完整开发模式

如果你需要开发Tauri后端功能:

```bash
# 1. 安装依赖
npm install

# 2. 启动Tauri开发模式 (会自动启动Vite)
npm run tauri:dev
```

第一次运行会比较慢,因为需要编译Rust依赖。

---

## 📂 你应该关注的文件

### 前端开发者
```
src/
├── components/          # 你的主要工作区
│   ├── Widget.tsx       # 从这里开始!
│   ├── EmotionChart.tsx
│   └── ...
├── stores/
│   └── emotionStore.ts  # 状态管理
├── styles/
│   └── index.css        # 全局样式
└── App.tsx              # 根组件
```

### 后端开发者
```
src-tauri/
├── src/
│   └── main.rs          # 从这里开始!
├── Cargo.toml           # Rust依赖
└── tauri.conf.json      # Tauri配置
```

---

## 🎯 第一个任务建议

### 前端开发者
**任务**: 美化挂件外观

1. 打开 `src/components/Widget.tsx`
2. 修改挂件的样式和动画
3. 在浏览器中实时预览效果

**提示**:
- 使用 `framer-motion` 添加动画
- 使用 Tailwind CSS 类名调整样式
- 参考 `src/styles/index.css` 中的颜色变量

### 后端开发者
**任务**: 实现数据保存功能

1. 创建 `src-tauri/src/storage.rs`
2. 实现保存和读取JSON文件的函数
3. 在 `main.rs` 中注册Tauri命令

**提示**:
- 使用 `std::fs` 读写文件
- 使用 `serde_json` 序列化数据
- 数据保存在 `$APPDATA/moodpulse/`

---

## 🔧 常用命令

```bash
# 安装依赖
npm install

# 前端开发 (仅Vite,快速)
npm run dev

# 完整开发 (Vite + Tauri)
npm run tauri:dev

# 构建生产版本
npm run tauri:build

# 类型检查
npm run build
```

---

## 💡 开发技巧

### 1. 热重载
- 修改React代码会自动刷新
- 修改Rust代码需要重新编译 (自动)

### 2. 调试
- 前端: 使用浏览器开发者工具
- 后端: 使用 `println!()` 或 `dbg!()`

### 3. Mock数据
前端开发时,可以先使用假数据:

```typescript
// 临时mock数据
const mockEmotionData = {
  emotion: 'happy',
  confidence: 0.85,
  timestamp: new Date().toISOString()
}
```

---

## 📚 参考资源

- [React文档](https://react.dev/)
- [Tauri文档](https://tauri.app/)
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand)

---

## ❓ 遇到问题?

### 常见问题

**Q: npm install 失败?**
A: 确保Node.js版本 >= 18

**Q: Tauri编译失败?**
A: 确保安装了Rust和Visual Studio C++ Build Tools

**Q: 窗口无法显示?**
A: 检查 `src-tauri/tauri.conf.json` 中的窗口配置

---

## 🎉 开始开发吧!

选择你的角色,开始第一个任务:
- 前端? → 打开 `src/components/Widget.tsx`
- 后端? → 打开 `src-tauri/src/main.rs`

详细任务分工请查看 `TASK_DIVISION.md`
