import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Howl } from "howler";
import { WebviewWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';

// 类型定义
export type PetState =
  | "happy"
  | "calm"
  | "worried"
  | "tired"
  | "sleepy";
export type InteractionState = "stroke" | "pat" | "shake-head" | "bounce" | null;

interface PetCharacterProps {
  state: PetState;
  interactionState: InteractionState;
  onInteractionEnd: () => void;
  isDragging?: boolean;
}

export function PetCharacter({
  state,
  interactionState,
  onInteractionEnd,
  isDragging = false,
}: PetCharacterProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [localInteraction, setLocalInteraction] = useState<InteractionState>(null);

  const soundRef = useRef<Howl | null>(null);
  const clickTimeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const sounds = [
    { id: 'rain', name: '雨声', emoji: '🌧️', file: '/src/assets/sounds/rain.mp3' },
    { id: 'ocean', name: '海浪', emoji: '🌊', file: '/src/assets/sounds/ocean.mp3' },
    { id: 'forest', name: '森林', emoji: '🌲', file: '/src/assets/sounds/forest.mp3' },
    { id: 'fire', name: '火焰', emoji: '🔥', file: '/src/assets/sounds/fire.mp3' },
    { id: 'cafe', name: '咖啡厅', emoji: '☕', file: '/src/assets/sounds/cafe.mp3' },
  ];

  // 监听来自白噪音选择窗口的事件
  useEffect(() => {
    const unlistenSound = listen<{ sound: string; volume: number; isPlaying: boolean }>(
      'sound-selected',
      (event) => {
        playSound(event.payload.sound);
      }
    );

    const unlistenVolume = listen<{ volume: number }>(
      'volume-changed',
      (event) => {
        handleVolumeChange(event.payload.volume);
      }
    );

    return () => {
      unlistenSound.then(fn => fn());
      unlistenVolume.then(fn => fn());
    };
  }, []);

  // 鼠标追踪
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left - rect.width / 2,
          y: e.clientY - rect.top - rect.height / 2,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 播放选中的音频
  const playSound = (soundId: string) => {
    // 停止当前播放
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.unload();
    }

    const soundData = sounds.find(s => s.id === soundId);
    if (!soundData) return;

    soundRef.current = new Howl({
      src: [soundData.file],
      loop: true,
      volume: volume,
    });

    soundRef.current.play();
    setIsPlaying(true);
    setCurrentSound(soundId);
  };

  // 暂停播放
  const pauseSound = () => {
    if (soundRef.current) {
      soundRef.current.stop();
    }
    setIsPlaying(false);
  };

  // 切换播放状态
  const togglePlayPause = () => {
    if (isPlaying) {
      pauseSound();
    } else if (currentSound) {
      playSound(currentSound);
    } else {
      // 如果没有选择音频，默认播放第一个
      playSound(sounds[0].id);
    }
  };

  // 打开白噪音选择窗口
  const openWhiteNoisePicker = async () => {
    try {
      const pickerWindow = WebviewWindow.getByLabel('white-noise-picker');
      if (pickerWindow) {
        await pickerWindow.show();
        await pickerWindow.setFocus();
      } else {
        new WebviewWindow('white-noise-picker', {
          url: 'white-noise-picker.html',
          title: '白噪音选择',
          width: 400,
          height: 500,
          resizable: false,
          decorations: false,
          transparent: true,
          alwaysOnTop: true,
          center: true,
        });
      }
    } catch (error) {
      console.error('Failed to open white noise picker:', error);
    }
  };

  // 处理按钮点击（区分单击和双击）
  const handleButtonClick = () => {
    if (clickTimeoutRef.current) {
      // 双击
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      openWhiteNoisePicker();
    } else {
      // 单击
      clickTimeoutRef.current = setTimeout(() => {
        togglePlayPause();
        clickTimeoutRef.current = null;
      }, 250) as unknown as number;
    }
  };

  // 调节音量
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (soundRef.current) {
      soundRef.current.volume(newVolume);
    }
  };

  // 点击宠物触发动画
  const handlePetClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const relativeY = clickY / rect.height;

    // 点击上半部分（头部）触发摇头
    if (relativeY < 0.5) {
      setLocalInteraction('shake-head');
      setTimeout(() => setLocalInteraction(null), 800);
    }
    // 点击下半部分（身体）触发弹跳
    else {
      setLocalInteraction('bounce');
      setTimeout(() => setLocalInteraction(null), 600);
    }
  };

  // 清理
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.unload();
      }
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  // 自动眨眼
  useEffect(() => {
    const blinkInterval = setInterval(
      () => {
        if (state !== "sleepy") {
          setIsBlinking(true);
          setTimeout(() => setIsBlinking(false), 180);
        }
      },
      3500 + Math.random() * 1000,
    );
    return () => clearInterval(blinkInterval);
  }, [state]);

  // 交互恢复
  useEffect(() => {
    if (interactionState === "pat") {
      const timer = setTimeout(() => onInteractionEnd(), 800);
      return () => clearTimeout(timer);
    } else if (interactionState === "stroke") {
      const timer = setTimeout(() => onInteractionEnd(), 2000);
      return () => clearTimeout(timer);
    }
  }, [interactionState, onInteractionEnd]);

  const displayState = localInteraction || interactionState || state;

  // 身体动画 (保持圆形 Q 弹感)
  const getBodyVariants = () => {
    switch (displayState) {
      case "happy":
        return {
          y: [0, -15, 0],
          scaleY: [1, 0.9, 1],
          scaleX: [1, 1.1, 1],
          transition: {
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        };
      case "calm":
        return {
          scale: [1, 1.03, 1],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          },
        };
      case "worried":
        return {
          x: [1, -1, 1],
          rotate: [0, -2, 2, 0],
          transition: { duration: 0.2, repeat: Infinity },
        };
      case "tired":
        return {
          scaleY: [1, 0.92, 1],
          scaleX: [1, 1.05, 1],
          y: [2, 5, 2],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          },
        };
      case "sleepy":
        return {
          scale: [1, 1.02, 1],
          transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          },
        };
      case "stroke":
        return {
          scale: [1, 1.05, 1],
          transition: {
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          },
        };
      case "pat":
        return {
          scale: [1, 0.7, 1.1, 1],
          y: [0, 10, -10, 0],
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 12,
          },
        };
      case "shake-head":
        return {
          rotate: [0, -15, 15, -10, 10, -5, 5, 0],
          transition: {
            duration: 0.8,
            ease: "easeInOut",
          },
        };
      case "bounce":
        return {
          y: [0, -30, 0, -15, 0],
          scaleY: [1, 1.1, 0.9, 1.05, 1],
          scaleX: [1, 0.9, 1.1, 0.95, 1],
          transition: {
            duration: 0.6,
            ease: "easeOut",
          },
        };
      default:
        return { y: 0 };
    }
  };

  // 眼睛组件
  const Eye = ({ side }: { side: "left" | "right" }) => {
    if (state === "sleepy")
      return (
        <div
          className={`absolute top-[48%] ${side === "left" ? "left-[20%]" : "right-[20%]"} w-[20%] h-[3px] bg-[#5a4843] rounded-full opacity-50`}
        />
      );

    // 计算瞳孔偏移（跟随鼠标）
    const maxOffset = 6; // 最大偏移像素
    const distance = Math.sqrt(mousePos.x ** 2 + mousePos.y ** 2);
    const normalizedX = distance > 0 ? (mousePos.x / distance) * Math.min(distance / 50, 1) : 0;
    const normalizedY = distance > 0 ? (mousePos.y / distance) * Math.min(distance / 50, 1) : 0;
    const offsetX = normalizedX * maxOffset;
    const offsetY = normalizedY * maxOffset;

    return (
      <motion.div
        className={`absolute top-[42%] ${side === "left" ? "left-[18%]" : "right-[18%]"}`}
        style={{ width: "18%", aspectRatio: "1/1.1" }}
        animate={{ scaleY: isBlinking ? 0.1 : 1, scaleX: 1 }}
        transition={{ duration: 0.1 }}
      >
        <div className="w-full h-full bg-[#4a3b38] rounded-full relative shadow-sm">
          <motion.div
            className="absolute top-[20%] right-[25%] w-[35%] h-[35%] bg-white rounded-full blur-[0.5px]"
            animate={{ x: offsetX, y: offsetY }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
          <div className="absolute bottom-[20%] left-[25%] w-[15%] h-[15%] bg-white rounded-full opacity-60" />
        </div>
      </motion.div>
    );
  };

  // 嘴巴 (暖棕色 #8c6a64)
  const getMouth = () => {
    const strokeColor = "#8c6a64";
    switch (displayState) {
      case "happy":
      case "stroke":
        return (
          <path
            d="M 8 10 Q 17.5 18 27 10"
            stroke={strokeColor}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        );
      case "calm":
        return (
          <path
            d="M 10 12 Q 17.5 17 25 12"
            stroke={strokeColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        );
      case "worried":
        return (
          <path
            d="M 12 16 Q 17.5 10 23 16"
            stroke={strokeColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        );
      case "tired":
        return (
          <circle
            cx="17.5"
            cy="14"
            r="3"
            stroke={strokeColor}
            strokeWidth="2"
            fill="none"
          />
        );
      case "sleepy":
        return null;
      case "pat":
        return (
          <ellipse
            cx="17.5"
            cy="12"
            rx="5"
            ry="6"
            fill={strokeColor}
          />
        );
      default:
        return (
          <path
            d="M 10 12 Q 17.5 17 25 12"
            stroke={strokeColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        );
    }
  };

  // 生成粒子（使用 useMemo 避免重复生成）
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => {
      const angle = (i / 30) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const distance = 200 + Math.random() * 100;
      const duration = 3 + Math.random() * 3;
      const delay = Math.random() * 3;
      const size = 3 + Math.random() * 6;

      return {
        id: i,
        angle,
        distance,
        duration,
        delay,
        size,
        color: Math.random() > 0.5 ? 'bg-orange-300' : 'bg-rose-300',
        blur: 1 + Math.random() * 2,
      };
    }), []
  );

  return (
    // ✨ 1. 容器改动：背景全透明，无边框
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-visible"
    >
      {/* ✨ 2. 粒子发散效果 */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute top-1/2 left-1/2 rounded-full ${particle.color} pointer-events-none`}
          style={{
            width: particle.size,
            height: particle.size,
            filter: `blur(${particle.blur}px)`,
          }}
          animate={{
            x: [0, Math.cos(particle.angle) * particle.distance],
            y: [0, Math.sin(particle.angle) * particle.distance],
            opacity: isDragging ? [1, 0.3] : [0.7, 0],
            scale: isDragging ? [1.5, 0.5] : [1, 0.3],
          }}
          transition={{
            duration: isDragging ? particle.duration * 0.5 : particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* 宠物本体 */}
      <motion.div
        animate={
          isDragging
            ? {
                x: [-8, 8, -8, 8, -6, 6, -4, 4, 0],
                rotate: [-5, 5, -5, 5, -3, 3, 0],
              }
            : getBodyVariants()
        }
        transition={
          isDragging
            ? {
                duration: 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : undefined
        }
        onClick={handlePetClick}
        className="relative flex items-center justify-center z-10 cursor-pointer"
        style={{
          width: "min(16rem, 80%)",
          aspectRatio: "1/1",
          filter: isDragging ? 'drop-shadow(0 10px 30px rgba(255, 160, 122, 0.6))' : 'none',
        }}
      >
        <div
          className="relative w-full h-full rounded-full"
          style={{
            // ✨ 4. 宠物材质：日落奶油色渐变 (Warm Cream)
            background:
              "linear-gradient(135deg, #fff9f0 0%, #ffe4e1 100%)",
            // 暖色系内阴影 + 柔和外发光
            boxShadow: `
                inset -15px -15px 30px rgba(255, 182, 193, 0.4), 
                inset 10px 10px 30px rgba(255, 255, 255, 1),
                0 10px 30px rgba(255, 160, 122, 0.3), 
                0 4px 10px rgba(255, 160, 122, 0.1)
                `,
          }}
        >
          {/* 耳朵 */}
          <div className="absolute -z-10 w-full h-full">
            <motion.div
              className="absolute -top-[2%] left-[8%] w-[25%] h-[25%] rounded-full bg-[#ffe4e1]"
              style={{
                boxShadow:
                  "inset -2px -2px 6px rgba(0,0,0,0.02)",
              }}
              animate={
                displayState === "happy"
                  ? { rotate: [0, -15, 0] }
                  : {}
              }
            />
            <motion.div
              className="absolute -top-[2%] right-[8%] w-[25%] h-[25%] rounded-full bg-[#ffe4e1]"
              style={{
                boxShadow:
                  "inset 2px -2px 6px rgba(0,0,0,0.02)",
              }}
              animate={
                displayState === "happy"
                  ? { rotate: [0, 15, 0] }
                  : {}
              }
            />
          </div>

          {/* 面部 */}
          <div className="absolute inset-0 z-10">
            <Eye side="left" />
            <Eye side="right" />
            {/* 腮红 */}
            <div className="absolute top-[48%] left-[6%] w-[22%] h-[14%] bg-[#ffaeb9] rounded-full blur-xl opacity-40" />
            <div className="absolute top-[48%] right-[6%] w-[22%] h-[14%] bg-[#ffaeb9] rounded-full blur-xl opacity-40" />
            {/* 嘴巴 */}
            <div className="absolute top-[62%] left-1/2 -translate-x-1/2 w-[35%] h-[20%] flex justify-center">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 35 25"
                className="overflow-visible"
              >
                {getMouth()}
              </svg>
            </div>
          </div>
        </div>

        {/* Zzz 动画 (颜色改暖) */}
        {displayState === "sleepy" && (
          <motion.div
            className="absolute -top-6 right-0 text-3xl font-bold text-orange-200 z-20"
            animate={{
              opacity: [0, 1, 0],
              y: -40,
              scale: 1.2,
              x: 20,
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            Zzz
          </motion.div>
        )}
      </motion.div>

      {/* 底部投影 (更淡，因为要模拟浮空) */}
      <motion.div
        className="absolute bottom-[8%] w-[50%] h-[4%] bg-[#8c6a64] rounded-[50%] blur-md z-0"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.08, 0.12, 0.08],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* 🔘 5. 白噪音按钮：位置调整到右下角，但不挤占宠物空间 */}
      {/* 使用 absolute 定位，保证宠物不缩小 */}
      <motion.button
        onClick={handleButtonClick}
        className="absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center z-40 cursor-pointer"
        style={{
          // 玻璃拟态 + 暖色微光
          background: isPlaying
            ? "rgba(255, 240, 245, 0.7)"
            : "rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          boxShadow: isPlaying
            ? "0 0 15px rgba(255, 182, 193, 0.5)"
            : "0 4px 10px rgba(0,0,0,0.05)",
        }}
        whileHover={{
          scale: 1.1,
          backgroundColor: "rgba(255, 255, 255, 0.4)",
        }}
        whileTap={{ scale: 0.9 }}
        initial={false}
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={{
          rotate: {
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          },
        }}
      >
        {isPlaying ? (
          <div className="flex items-center gap-[2px]">
            <motion.div
              className="w-[2px] bg-rose-400 rounded-full"
              animate={{ height: [3, 10, 3] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
            />
            <motion.div
              className="w-[2px] bg-rose-400 rounded-full"
              animate={{ height: [3, 14, 3] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            />
            <motion.div
              className="w-[2px] bg-rose-400 rounded-full"
              animate={{ height: [3, 8, 3] }}
              transition={{ repeat: Infinity, duration: 0.7 }}
            />
          </div>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8c6a64"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-70"
          >
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
          </svg>
        )}
      </motion.button>
    </div>
  );
}