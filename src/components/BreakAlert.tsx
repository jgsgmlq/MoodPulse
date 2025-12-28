import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface BreakAlertProps {
  show: boolean;
  workMinutes: number;
  onDismiss: () => void;
}

export function BreakAlert({ show, workMinutes, onDismiss }: BreakAlertProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3 max-w-md"
        >
          <AlertCircle size={24} />
          <div className="flex-1">
            <p className="font-bold">休息提醒</p>
            <p className="text-sm">您已连续工作 {Math.floor(workMinutes)} 分钟，该起身活动了！</p>
          </div>
          <button
            onClick={onDismiss}
            className="hover:bg-red-600 rounded p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
