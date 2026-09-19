import { useState } from 'react';
import { GameHistoryItem, GameMode } from '../types';
import {
  getSoundEnabled,
  getSoundVolume,
  playVolumePreviewSound,
  setSoundEnabled,
  setSoundVolume,
} from '../utils/audio';
import { loadSavedSettings, saveSettings } from '../utils/storage';

interface HomeScreenProps {
  startingRound: number;
  setStartingRound: (round: number) => void;
  keepDifficulty: boolean;
  setKeepDifficulty: (keep: boolean) => void;
  onStartGame: () => void;
  history: GameHistoryItem[];
  onClearHistory: () => void;
}

export default function HomeScreen({
  startingRound,
  setStartingRound,
  keepDifficulty,
  setKeepDifficulty,
  onStartGame,
  history,
  onClearHistory,
}: HomeScreenProps) {
  const [soundOn, setSoundOn] = useState<boolean>(getSoundEnabled());
  const [volume, setVolume] = useState<number>(getSoundVolume());
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  const toggleSound = () => {
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

  const handleDecreaseRound = () => {
    if (startingRound > 1) {
      setStartingRound(startingRound - 1);
    }
  };

  const handleIncreaseRound = () => {
    if (startingRound < 18) {
      setStartingRound(startingRound + 1);
    }
  };

  const iconCount = startingRound + 2; // Round 1 = 3, Round 18 = 20

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-amber-50 via-orange-50/60 to-pink-50/50 flex flex-col items-center justify-between p-4 sm:p-6 text-slate-800 overflow-y-auto">
      {/* Top Header bar with sound toggle */}
      <header className="w-full max-w-lg flex items-center justify-between pt-2 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl animate-bounce">🎈</span>
          <span className="font-extrabold text-lg text-amber-700 tracking-tight">Co-play 2 Bé</span>
        </div>

        <button
          type="button"
          onClick={toggleSound}
          className="p-2 sm:px-3 sm:py-2 rounded-full bg-white/95 shadow-md border border-amber-200 text-amber-700 hover:bg-amber-100/70 active:scale-95 transition cursor-pointer flex items-center gap-1.5 text-xs sm:text-sm font-bold"
          title={soundOn ? `Đang bật âm thanh (${Math.round(volume * 100)}%)` : 'Đang tắt âm thanh'}
        >
          <i
            className={`fa-solid ${
              !soundOn || volume === 0
                ? 'fa-volume-xmark text-rose-500'
                : volume < 0.5
                ? 'fa-volume-low text-amber-600'
                : 'fa-volume-high text-amber-600'
            }`}
          ></i>
          <span className="hidden sm:inline">
            {soundOn && volume > 0 ? `${Math.round(volume * 100)}%` : 'Tắt tiếng'}
          </span>
        </button>
      </header>

      {/* Main card */}
      <main className="w-full max-w-lg flex flex-col items-center my-auto">
        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2 bg-amber-200/70 border border-amber-300 text-amber-900 font-bold px-4 py-1 rounded-full text-xs sm:text-sm shadow-sm mb-3">
            <span>✨ 1 Màn Hình — 2 Người Chơi Đối Diện ✨</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-amber-950 tracking-tight drop-shadow-sm">
            Tìm Hình Giống Nhau
          </h1>
          <p className="text-slate-600 text-sm sm:text-base font-semibold mt-2 max-w-sm mx-auto">
            Mỗi bên có nhiều icon dễ thương, nhưng <span className="text-pink-600 font-extrabold">chỉ có 1 icon giống nhau</span>. Ai bấm nhanh hơn sẽ thắng!
          </p>
        </div>

        {/* Big Glossy "Chơi Ngay" Button */}
        <button
          type="button"
          onClick={onStartGame}
          id="btn-play-now"
          className="w-full py-5 px-8 rounded-3xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 text-white font-black text-2xl sm:text-3xl shadow-2xl hover:brightness-105 active:scale-98 transition flex items-center justify-center gap-3 cursor-pointer btn-glossy border-4 border-white/60 mb-6 group"
        >
          <i className="fa-solid fa-play text-amber-200 group-hover:scale-125 transition-transform duration-200"></i>
          <span>CHƠI NGAY</span>
          <span className="text-xl">🚀</span>
        </button>

        {/* Options Card: Force level and Keep difficulty */}
        <div className="w-full bg-white/95 rounded-3xl p-5 shadow-xl border-2 border-amber-200/80 mb-6 space-y-4">
          {/* Force Level Selector */}
          <div className="flex items-center justify-between pb-3 border-b border-amber-100">
            <div>
              <div className="flex items-center gap-1.5 font-black text-slate-800 text-base">
                <i className="fa-solid fa-layer-group text-amber-500"></i>
                <span>Chọn vòng bắt đầu:</span>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Chơi thẳng vào vòng khó hơn
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDecreaseRound}
                disabled={startingRound <= 1}
                className="w-10 h-10 rounded-2xl bg-amber-100 hover:bg-amber-200 disabled:opacity-40 disabled:cursor-not-allowed font-black text-xl text-amber-800 shadow-sm flex items-center justify-center active:scale-90 transition cursor-pointer"
                title="Giảm vòng"
              >
                −
              </button>
              <div className="min-w-[70px] text-center">
                <span className="block font-black text-lg text-amber-900 leading-tight">
                  Vòng {startingRound}
                </span>
                <span className="text-xs font-bold text-amber-600">
                  {iconCount} icons
                </span>
              </div>
              <button
                type="button"
                onClick={handleIncreaseRound}
                disabled={startingRound >= 18}
                className="w-10 h-10 rounded-2xl bg-amber-100 hover:bg-amber-200 disabled:opacity-40 disabled:cursor-not-allowed font-black text-xl text-amber-800 shadow-sm flex items-center justify-center active:scale-90 transition cursor-pointer"
                title="Tăng vòng"
              >
                +
              </button>
            </div>
          </div>

          {/* Keep Difficulty Switch (Chế độ cho bé nhỏ) */}
          <div className="flex items-center justify-between pt-1 pb-3 border-b border-amber-100">
            <div className="pr-3">
              <div className="flex items-center gap-1.5 font-black text-slate-800 text-base">
                <i className="fa-solid fa-baby text-pink-500"></i>
                <span>Giữ nguyên độ khó:</span>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Dành cho bé nhỏ: Giữ mãi {iconCount} icon, ai đạt 5 điểm trước là thắng!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setKeepDifficulty(!keepDifficulty)}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer focus:outline-none ${
                keepDifficulty ? 'bg-pink-500' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                  keepDifficulty ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sound & Volume Control */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="flex items-center gap-1.5 font-black text-slate-800 text-base">
                  <i
                    className={`fa-solid ${
                      !soundOn || volume === 0
                        ? 'fa-volume-xmark text-slate-400'
                        : volume < 0.5
                        ? 'fa-volume-low text-amber-500'
                        : 'fa-volume-high text-amber-500'
                    }`}
                  ></i>
                  <span>Âm thanh & Hiệu ứng:</span>
                </div>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Chuông bấm đúng, tiếng phạt bấm sai, vòng thắng & ván đấu
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-lg">
                  {soundOn && volume > 0 ? `${Math.round(volume * 100)}%` : 'Tắt'}
                </span>
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    soundOn && volume > 0
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-200 text-slate-600 border-slate-300'
                  }`}
                >
                  {soundOn && volume > 0 ? 'BẬT' : 'TẮT'}
                </button>
              </div>
            </div>

            {/* Volume slider */}
            <div className="flex items-center gap-3 bg-amber-50/60 p-2.5 rounded-2xl border border-amber-200/60">
              <button
                type="button"
                onClick={() => handleVolumeChange(0)}
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
                title="Tắt tiếng hoàn toàn"
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
                className="flex-1 accent-amber-500 h-2 bg-amber-200/70 rounded-lg cursor-pointer"
                title="Kéo để chỉnh âm lượng"
              />
              <button
                type="button"
                onClick={() => handleVolumeChange(1)}
                className="text-amber-600 hover:text-amber-700 transition cursor-pointer"
                title="Âm lượng tối đa (êm ái cho bé)"
              >
                <i className="fa-solid fa-volume-high text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Cute gameplay instructions recap */}
        <div className="w-full bg-amber-100/50 rounded-2xl p-3 border border-amber-200/60 text-xs font-semibold text-slate-600 flex items-start gap-2.5">
          <span className="text-xl">💡</span>
          <div>
            <span className="font-bold text-amber-900">Mẹo nhỏ: </span>
            Bé nào bấm nhầm sẽ bị khóa nửa màn hình (đếm ngược 2s, 3s, 4s...). Hãy quan sát thật kỹ trước khi chạm nhé!
          </div>
        </div>
      </main>

      {/* History section under the home screen */}
      <section className="w-full max-w-lg mt-8 mb-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-amber-600"></i>
            <h2 className="font-extrabold text-base text-slate-800">
              Lịch Sử Chơi Gần Đây {history.length > 0 && `(${history.length})`}
            </h2>
          </div>

          {history.length > 0 && (
            <div>
              {confirmClear ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onClearHistory();
                      setConfirmClear(false);
                    }}
                    className="text-xs font-bold bg-rose-500 text-white px-2.5 py-1 rounded-lg hover:bg-rose-600 transition cursor-pointer"
                  >
                    Xác nhận xóa
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-700 px-1 cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                >
                  <i className="fa-solid fa-trash-can"></i>
                  <span>Xóa lịch sử</span>
                </button>
              )}
            </div>
          )}
        </div>

        {history.length === 0 ? (
          <div className="w-full bg-white/70 rounded-2xl p-6 text-center border border-dashed border-amber-300 text-slate-400 font-medium text-sm">
            <span className="text-2xl block mb-1">🎮</span>
            Chưa có ván đấu nào. Hãy bấm "Chơi Ngay" để bắt đầu ván đầu tiên!
          </div>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {history.map((item) => {
              const p1 = item.player1;
              const p2 = item.player2;
              const isP1Win = item.winner === 1;
              const isP2Win = item.winner === 2;
              const isDraw = item.winner === 'draw';

              return (
                <div
                  key={item.id}
                  className="bg-white/90 rounded-2xl p-3 shadow-sm border border-amber-200/70 flex items-center justify-between gap-2"
                >
                  {/* Left: Players & score */}
                  <div className="flex items-center gap-3">
                    {/* Player 1 */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl">{p1.animal.emoji}</span>
                      <span className={`text-xs font-bold ${isP1Win ? 'text-pink-600' : 'text-slate-600'}`}>
                        {p1.animal.name}
                      </span>
                    </div>

                    {/* Score badge */}
                    <div className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-900 font-black text-sm tracking-wide">
                      {p1.score} - {p2.score}
                    </div>

                    {/* Player 2 */}
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${isP2Win ? 'text-blue-600' : 'text-slate-600'}`}>
                        {p2.animal.name}
                      </span>
                      <span className="text-xl">{p2.animal.emoji}</span>
                    </div>
                  </div>

                  {/* Right: Winner badge, mode & duration */}
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isDraw ? (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          Hòa
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          {isP1Win ? p1.animal.name : p2.animal.name} thắng 🏆
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                      {formatDuration(item.durationSec)} • {item.mode === 'fixed' ? 'Cố định' : 'Tăng dần'} • {item.dateStr}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
