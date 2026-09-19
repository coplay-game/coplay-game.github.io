import React from 'react';
import { Volume2, VolumeX, RotateCw, Pause, Home, HelpCircle } from 'lucide-react';
import { GameId, OrientationMode, PlayerProfile } from '../types';

interface PortalHeaderProps {
  inGame?: boolean;
  activeGameId?: GameId | null;
  onPause?: () => void;
  onGoHome?: () => void;
  onShowHelp?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  orientation: OrientationMode;
  onToggleOrientation: () => void;
  player1?: PlayerProfile;
  player2?: PlayerProfile;
  scoreP1?: number;
  scoreP2?: number;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  inGame = false,
  activeGameId,
  onPause,
  onGoHome,
  onShowHelp,
  soundEnabled,
  onToggleSound,
  orientation,
  onToggleOrientation,
  player1,
  player2,
  scoreP1 = 0,
  scoreP2 = 0,
}) => {
  if (inGame) {
    if (activeGameId === 'spot-match') {
      // In SpotMatch: compact centered pill exactly on the center divider
      return (
        <header className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center pointer-events-none px-3">
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-md border border-slate-300 pointer-events-auto">
            <div className="flex items-center gap-1">
              <span className="text-base leading-none">{player2?.avatar}</span>
              <span className="text-xs font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">{scoreP2}</span>
            </div>

            <button
              onClick={onPause}
              className="mx-1 w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-500 text-amber-950 flex items-center justify-center font-bold shadow-xs active:scale-95 transition cursor-pointer"
              aria-label="Tạm dừng game"
              title="Tạm dừng"
            >
              <Pause className="w-4 h-4 fill-current" />
            </button>

            <div className="flex items-center gap-1">
              <span className="text-xs font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full">{scoreP1}</span>
              <span className="text-base leading-none">{player1?.avatar}</span>
            </div>
          </div>
        </header>
      );
    }

    // For other games (Air Hockey, Farm Race, Train Coop, Candy Monster):
    // Dock cleanly at right edge of the center divider so action is completely unobstructed
    return (
      <header className="absolute right-3 top-1/2 -translate-y-1/2 z-35 flex items-center pointer-events-none">
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md pl-2.5 pr-1.5 py-1 rounded-full shadow-md border border-slate-300 pointer-events-auto">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
            <span className="leading-none">{player2?.avatar}</span>
            <span className="text-blue-600 font-black">{scoreP2}</span>
            <span className="text-slate-300 font-normal">|</span>
            <span className="text-rose-600 font-black">{scoreP1}</span>
            <span className="leading-none">{player1?.avatar}</span>
          </div>

          <button
            onClick={onPause}
            className="w-7 h-7 rounded-full bg-amber-400 hover:bg-amber-500 text-amber-950 flex items-center justify-center font-bold shadow-xs active:scale-95 transition cursor-pointer ml-1"
            aria-label="Tạm dừng game"
            title="Tạm dừng"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </header>
    );
  }

  // Top Nav Bar in Portal
  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-2.5">
        <span className="text-2xl animate-pulse">🎮</span>
        <div>
          <h1 className="text-base font-black text-slate-800 leading-tight">Co-Play 2 Người</h1>
          <p className="text-[11px] font-medium text-slate-500">Cùng chơi trên 1 màn hình</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 active:scale-95 transition"
            title="Về trang chủ"
          >
            <Home className="w-5 h-5" />
          </button>
        )}

        {onShowHelp && (
          <button
            onClick={onShowHelp}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 active:scale-95 transition"
            title="Hướng dẫn chơi"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        )}

        {/* Orientation Toggle Button */}
        <button
          onClick={onToggleOrientation}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition active:scale-95 ${
            orientation === 'opposite'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
          title="Xoay hướng ngồi (Đối diện 180° hoặc Ngồi cùng phía)"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {orientation === 'opposite' ? 'Đối diện (180°)' : 'Cùng phía (0°)'}
          </span>
          <span className="sm:hidden">
            {orientation === 'opposite' ? '180°' : '0°'}
          </span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className={`p-2 rounded-xl border transition active:scale-95 ${
            soundEnabled
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-slate-100 border-slate-200 text-slate-400'
          }`}
          title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};
