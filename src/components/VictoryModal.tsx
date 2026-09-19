import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Award } from 'lucide-react';
import { PlayerProfile } from '../types';
import { playVictory } from '../utils/audio';

interface VictoryModalProps {
  isOpen: boolean;
  winner: 'p1' | 'p2' | 'coop-win' | 'draw';
  player1: PlayerProfile;
  player2: PlayerProfile;
  scoreP1: number;
  scoreP2: number;
  onRestart: () => void;
  onGoHome: () => void;
  gameTitle: string;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  winner,
  player1,
  player2,
  scoreP1,
  scoreP2,
  onRestart,
  onGoHome,
  gameTitle,
}) => {
  useEffect(() => {
    if (isOpen) {
      playVictory();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#3b82f6', '#10b981', '#fbbf24', '#a855f7'],
        });
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isCoop = winner === 'coop-win';
  const isDraw = winner === 'draw';
  const winningPlayer = winner === 'p1' ? player1 : winner === 'p2' ? player2 : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border-4 border-amber-300 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 mb-3 text-4xl shadow-inner animate-bounce">
          {isCoop ? '🚂' : isDraw ? '🤝' : '🏆'}
        </div>

        <h3 className="text-2xl font-black text-slate-800 mb-1">
          {isCoop
            ? 'Đoàn Kết Tuyệt Vời!'
            : isDraw
            ? 'Hòa Nhau Rất Giỏi!'
            : `${winningPlayer?.name} Chiến Thắng!`}
        </h3>

        <p className="text-sm font-medium text-slate-500 mb-5">
          {isCoop
            ? `Hai bố con đã cùng nhau hoàn thành chặng đường ${gameTitle}!`
            : isDraw
            ? 'Cả hai đều chơi xuất sắc ngang tài ngang sức!'
            : `Chúc mừng ${winningPlayer?.animal} ${winningPlayer?.avatar} đã giành cúp vàng!`}
        </p>

        {/* Score comparison card */}
        <div className="grid grid-cols-2 gap-3 mb-6 bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
          <div className={`flex flex-col items-center p-2 rounded-xl ${winner === 'p1' ? 'bg-white shadow-xs' : ''}`}>
            <span className="text-3xl">{player1.avatar}</span>
            <span className="text-xs font-bold text-slate-700 mt-1">{player1.name}</span>
            <span className="text-2xl font-black text-rose-500">{scoreP1}</span>
            {winner === 'p1' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full mt-1">
                <Award className="w-3 h-3" /> Nhất
              </span>
            )}
          </div>

          <div className={`flex flex-col items-center p-2 rounded-xl ${winner === 'p2' ? 'bg-white shadow-xs' : ''}`}>
            <span className="text-3xl">{player2.avatar}</span>
            <span className="text-xs font-bold text-slate-700 mt-1">{player2.name}</span>
            <span className="text-2xl font-black text-blue-500">{scoreP2}</span>
            {winner === 'p2' && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full mt-1">
                <Award className="w-3 h-3" /> Nhất
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-base shadow-md hover:brightness-105 active:scale-98 transition"
          >
            <RotateCcw className="w-5 h-5" />
            Chơi Lại Ván Nữa
          </button>

          <button
            onClick={onGoHome}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm active:scale-98 transition"
          >
            <Home className="w-4 h-4" />
            Chọn Trò Chơi Khác
          </button>
        </div>
      </div>
    </div>
  );
};
