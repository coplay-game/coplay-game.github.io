import { useState } from 'react';
import { Animal } from '../types';
import {
  getSoundEnabled,
  getSoundVolume,
  playVolumePreviewSound,
  setSoundEnabled,
  setSoundVolume,
} from '../utils/audio';
import { loadSavedSettings, saveSettings } from '../utils/storage';

interface PauseModalProps {
  player1: { animal: Animal; score: number };
  player2: { animal: Animal; score: number };
  currentRound: number;
  totalIcons: number;
  onResume: () => void;
  onFinishAndScore: () => void;
}

export default function PauseModal({
  player1,
  player2,
  currentRound,
  totalIcons,
  onResume,
  onFinishAndScore,
}: PauseModalProps) {
  const [soundOn, setSoundOn] = useState<boolean>(getSoundEnabled());
  const [volume, setVolume] = useState<number>(getSoundVolume());

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      playVolumePreviewSound();
    }
    const currentSettings = loadSavedSettings();
    saveSettings({ ...currentSettings, soundEnabled: next });
  };

  const handleVolumeChange = (newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped);
    setSoundVolume(clamped);
    if (clamped > 0 && !soundOn) {
      setSoundOn(true);
      setSoundEnabled(true);
    }
    playVolumePreviewSound();
    const currentSettings = loadSavedSettings();
    saveSettings({
      ...currentSettings,
      volume: clamped,
      soundEnabled: clamped > 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border-4 border-amber-200 text-center">
        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2 text-amber-500 text-2xl shadow-inner">
          <i className="fa-solid fa-pause"></i>
        </div>

        <h3 className="text-2xl font-black text-slate-800 tracking-wide mb-0.5">
          Tạm Dừng Game
        </h3>
        <p className="text-slate-500 text-xs sm:text-sm font-medium mb-4">
          Vòng {currentRound} • {totalIcons} icons trên mỗi vòng tròn
        </p>

        {/* Current scores */}
        <div className="grid grid-cols-2 gap-3 mb-4 bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/70">
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-0.5">{player1.animal.emoji}</span>
            <span className="text-xs sm:text-sm font-bold text-slate-700">{player1.animal.name}</span>
            <span className="text-xl sm:text-2xl font-black text-pink-600 mt-0.5">{player1.score} điểm</span>
          </div>
          <div className="flex flex-col items-center border-l border-amber-200/80">
            <span className="text-3xl mb-0.5">{player2.animal.emoji}</span>
            <span className="text-xs sm:text-sm font-bold text-slate-700">{player2.animal.name}</span>
            <span className="text-xl sm:text-2xl font-black text-blue-600 mt-0.5">{player2.score} điểm</span>
          </div>
        </div>

        {/* Sound and Volume Slider */}
        <div className="mb-5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-left">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <i
                className={`fa-solid ${
                  !soundOn || volume === 0
                    ? 'fa-volume-xmark text-slate-400'
                    : volume < 0.5
                    ? 'fa-volume-low text-amber-500'
                    : 'fa-volume-high text-amber-500'
                }`}
              ></i>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                Điều chỉnh âm lượng
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                {soundOn && volume > 0 ? `${Math.round(volume * 100)}%` : 'Tắt'}
              </span>
              <button
                type="button"
                onClick={handleToggleSound}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                  soundOn && volume > 0
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-200 text-slate-600 border-slate-300'
                }`}
              >
                {soundOn && volume > 0 ? 'BẬT' : 'TẮT'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleVolumeChange(0)}
              className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
              title="Tắt tiếng"
            >
              <i className="fa-solid fa-volume-off text-xs"></i>
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundOn ? volume : 0}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="flex-1 accent-amber-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
              title="Kéo để chỉnh âm lượng"
            />
            <button
              type="button"
              onClick={() => handleVolumeChange(1)}
              className="text-amber-600 hover:text-amber-700 transition cursor-pointer"
              title="Âm lượng tối đa"
            >
              <i className="fa-solid fa-volume-high text-xs"></i>
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-base sm:text-lg shadow-lg hover:brightness-105 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-play"></i>
            Chơi Tiếp
          </button>

          <button
            type="button"
            onClick={onFinishAndScore}
            className="w-full py-2.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm sm:text-base transition flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
          >
            <i className="fa-solid fa-flag-checkered text-amber-500"></i>
            Kết Thúc & Tính Điểm
          </button>
        </div>
      </div>
    </div>
  );
}
