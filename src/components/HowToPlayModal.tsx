import { motion, AnimatePresence } from 'motion/react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    icon: '📱',
    title: '1. Đặt máy nằm ngang',
    desc: 'Hai bé ngồi đối diện nhau, mỗi người nhìn 1 nửa màn hình (xoay 180°).',
  },
  {
    icon: '🔍',
    title: '2. Tìm icon giống nhau',
    desc: 'Mỗi bên có nhiều icon dễ thương. Chỉ có đúng 1 icon xuất hiện ở cả hai bên.',
  },
  {
    icon: '👆',
    title: '3. Bấm nhanh nhất',
    desc: 'Ai phát hiện và chạm vào icon giống nhau trước sẽ ghi điểm và thắng vòng đó.',
  },
  {
    icon: '⚠️',
    title: '4. Cẩn thận bấm nhầm',
    desc: 'Bấm sai sẽ bị khóa nửa màn hình vài giây (2s → 3s → 4s...). Quan sát kỹ nhé!',
  },
  {
    icon: '🏆',
    title: '5. Thắng cuộc',
    desc: 'Chế độ Tăng dần: chơi đến khi một bên dẫn trước rõ. Chế độ Cố định: ai đạt 5 điểm trước thắng.',
  },
];

export default function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-4 border-amber-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📖</span>
                <h2 className="text-white font-black text-lg sm:text-xl tracking-tight">
                  Hướng Dẫn Chơi
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/25 hover:bg-white/40 text-white flex items-center justify-center transition active:scale-90"
                aria-label="Đóng hướng dẫn"
              >
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            {/* Steps */}
            <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
              {STEPS.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  className="flex gap-3 items-start bg-amber-50/80 rounded-2xl p-3 border border-amber-100"
                >
                  <span className="text-2xl shrink-0 mt-0.5">{step.icon}</span>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5 leading-snug">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer tip + CTA */}
            <div className="px-5 pb-5 pt-1">
              <div className="bg-pink-50 border border-pink-200 rounded-xl px-3 py-2.5 mb-4 flex items-start gap-2">
                <span className="text-lg">💡</span>
                <p className="text-[11px] sm:text-xs font-semibold text-pink-800 leading-snug">
                  Mẹo: Hai bé ngồi đối diện, mỗi người chỉ nhìn nửa màn hình của mình. Không được nhìn sang bên kia nhé!
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-black text-lg shadow-lg hover:brightness-105 active:scale-[0.98] transition flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-check"></i>
                Đã hiểu, bắt đầu thôi!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
