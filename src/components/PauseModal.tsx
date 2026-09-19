import React from 'react';
import { Play, RotateCcw, Home, Flag } from 'lucide-react';
import { PlayerProfile } from '../types';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onFinishAndScore: () => void;
  onGoHome: () => void;
  scoreP1: number;
  scoreP2: number;
  player1: PlayerProfile;
  player2: PlayerProfile;
  isCoop?: boolean;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onFinishAndScore,
  onGoHome,
  scoreP1,
  scoreP2,
  player1,
  player2,
  isCoop = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border-4 border-amber-200 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-3 text-2xl shadow-inner">
          ⏸️
        </div>

        <h3 className="text-2xl font-bold text-slate-800 mb-1">Tạm Dừng Trò Chơi</h3>
        <p className="text-sm text-slate-500 mb-5">Nghỉ tay một chút nhé!</p>

        {/* Current Scores */}
        <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <div className="flex flex-col items-center">
            <span className="text-2xl">{player1.avatar}</span>
            <span className="text-xs font-semibold text-slate-600 mt-0.5">{player1.name}</span>
            <span className="text-2xl font-black text-rose-500">{scoreP1}</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-2xl">{player2.avatar}</span>
            <span className="text-xs font-semibold text-slate-600 mt-0.5">{player2.name}</span>
            <span className="text-2xl font-black text-blue-500">{scoreP2}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-base shadow-md hover:brightness-105 active:scale-98 transition"
          >
            <Play className="w-5 h-5 fill-current" />
            Chơi Tiếp
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-sm border border-amber-200 active:scale-98 transition"
          >
            <RotateCcw className="w-4 h-4" />
            Chơi Lại Từ Đầu
          </button>

          {!isCoop && (
            <button
              onClick={onFinishAndScore}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm border border-indigo-200 active:scale-98 transition"
            >
              <Flag className="w-4 h-4" />
              Kết Thúc & Tính Điểm Ngay
            </button>
          )}

          <button
            onClick={onGoHome}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm active:scale-98 transition"
          >
            <Home className="w-4 h-4" />
            Về Danh Sách Game
          </button>
        </div>
      </div>
    </div>
  );
};
