import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { Animal, GameMode } from '../types';
import { playGrandVictoryFanfare } from '../utils/audio';

interface GameOverModalProps {
  player1: { animal: Animal; score: number };
  player2: { animal: Animal; score: number };
  winner: 1 | 2 | 'draw';
  durationSec: number;
  mode: GameMode;
  roundsPlayed: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export default function GameOverModal({
  player1,
  player2,
  winner,
  durationSec,
  mode,
  roundsPlayed,
  onPlayAgain,
  onGoHome,
}: GameOverModalProps) {
  useEffect(() => {
    playGrandVictoryFanfare();

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 350);

      return () => clearTimeout(timer);
    } catch {
      // Ignored if canvas not ready
    }
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins} phút ${secs} giây`;
    }
    return `${secs} giây`;
  };

  const winningAnimal = winner === 1 ? player1.animal : winner === 2 ? player2.animal : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-amber-300 text-center relative overflow-hidden">
        {/* Crown & celebration banner */}
        <div className="mb-2">
          {winner !== 'draw' && winningAnimal ? (
            <div className="inline-block relative">
              <span className="text-6xl sm:text-7xl block transform hover:scale-110 transition duration-300">
                {winningAnimal.emoji}
              </span>
              <div className="absolute -top-4 -right-2 text-amber-400 text-3xl animate-bounce">
                👑
              </div>
            </div>
          ) : (
            <div className="text-6xl mb-2">🤝</div>
          )}
        </div>

        <h2 className="text-3xl font-black text-slate-800 tracking-wide mt-2">
          {winner === 'draw'
            ? 'Hòa Nhau Rồi!'
            : `${winningAnimal?.name} Chiến Thắng! 🎉`}
        </h2>

        <p className="text-slate-500 font-semibold text-sm mt-1 mb-5">
          {mode === 'fixed' ? 'Chế độ giữ nguyên độ khó' : `Đã hoàn thành ${roundsPlayed} vòng`} • Thời lượng: {formatDuration(durationSec)}
        </p>

        {/* Final Score comparison */}
        <div className="grid grid-cols-2 gap-3 mb-6 bg-gradient-to-b from-amber-50 to-orange-50/50 p-4 rounded-2xl border-2 border-amber-200">
          <div className={`flex flex-col items-center p-3 rounded-xl transition ${winner === 1 ? 'bg-amber-200/60 ring-2 ring-amber-400' : 'opacity-85'}`}>
            <span className="text-3xl">{player1.animal.emoji}</span>
            <span className="font-bold text-slate-800 text-sm mt-1">{player1.animal.name}</span>
            <span className="text-3xl font-black text-pink-600 mt-0.5">{player1.score}</span>
            <span className="text-xs font-semibold text-slate-500">điểm</span>
            {winner === 1 && (
              <span className="mt-1 text-xs font-bold text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full">
                Vô địch ⭐
              </span>
            )}
          </div>

          <div className={`flex flex-col items-center p-3 rounded-xl transition ${winner === 2 ? 'bg-amber-200/60 ring-2 ring-amber-400' : 'opacity-85'}`}>
            <span className="text-3xl">{player2.animal.emoji}</span>
            <span className="font-bold text-slate-800 text-sm mt-1">{player2.animal.name}</span>
            <span className="text-3xl font-black text-blue-600 mt-0.5">{player2.score}</span>
            <span className="text-xs font-semibold text-slate-500">điểm</span>
            {winner === 2 && (
              <span className="mt-1 text-xs font-bold text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full">
                Vô địch ⭐
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white font-extrabold text-lg shadow-lg hover:brightness-105 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer btn-glossy"
          >
            <i className="fa-solid fa-rotate-right"></i>
            Chơi Lại Ván Mới
          </button>

          <button
            type="button"
            onClick={onGoHome}
            className="w-full py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base transition flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
          >
            <i className="fa-solid fa-house"></i>
            Về Màn Hình Chính
          </button>
        </div>
      </div>
    </div>
  );
}
