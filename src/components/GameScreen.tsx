import confetti from 'canvas-confetti';
import { useEffect, useRef, useState } from 'react';
import { Animal, PlacedIcon } from '../types';
import {
  getSoundEnabled,
  getSoundVolume,
  playCorrectIconSound,
  playPenaltyLockSound,
  playPenaltyTickSound,
  playPenaltyUnlockSound,
  playRoundCompleteTransitionSound,
  playRoundWonSound,
  playVolumePreviewSound,
  playWrongIconSound,
  setSoundEnabled,
  unlockAudioOnUserGesture,
} from '../utils/audio';
import { generateRoundCards, getIconCountForRound } from '../utils/layout';
import { loadSavedSettings, saveSettings } from '../utils/storage';
import PauseModal from './PauseModal';

interface GameScreenProps {
  player1Animal: Animal;
  player2Animal: Animal;
  startingRound: number;
  keepDifficulty: boolean;
  onGameOver: (p1Score: number, p2Score: number, roundsPlayed: number) => void;
}

export default function GameScreen({
  player1Animal,
  player2Animal,
  startingRound,
  keepDifficulty,
  onGameOver,
}: GameScreenProps) {
  const [currentRound, setCurrentRound] = useState<number>(startingRound);
  const [p1Score, setP1Score] = useState<number>(0);
  const [p2Score, setP2Score] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(getSoundEnabled());
  const [volume, setVolume] = useState<number>(getSoundVolume());

  // Error counts for current round (reset each round)
  const [p1Errors, setP1Errors] = useState<number>(0);
  const [p2Errors, setP2Errors] = useState<number>(0);

  // Penalty lock remaining seconds
  const [p1Penalty, setP1Penalty] = useState<number>(0);
  const [p2Penalty, setP2Penalty] = useState<number>(0);

  // Round cards
  const [matchingIconId, setMatchingIconId] = useState<string>('');
  const [p1Icons, setP1Icons] = useState<PlacedIcon[]>([]);
  const [p2Icons, setP2Icons] = useState<PlacedIcon[]>([]);

  // Round celebration
  const [roundWinner, setRoundWinner] = useState<1 | 2 | null>(null);
  const [highlightIconId, setHighlightIconId] = useState<string | null>(null);

  const roundsPlayedRef = useRef<number>(0);

  // Target icons count
  const currentIconCount = getIconCountForRound(currentRound, startingRound, keepDifficulty);

  // Refresh audio state when returning from pause or initial mount
  useEffect(() => {
    setSoundOn(getSoundEnabled());
    setVolume(getSoundVolume());
  }, [isPaused]);

  const handleToggleSoundFromBar = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      playVolumePreviewSound();
    }
    const currentSettings = loadSavedSettings();
    saveSettings({ ...currentSettings, soundEnabled: next });
  };

  // Penalty countdown timers with tick & unlock sound
  useEffect(() => {
    if (p1Penalty <= 0) return;
    const interval = setInterval(() => {
      setP1Penalty((prev) => {
        if (prev <= 1) {
          playPenaltyUnlockSound();
          return 0;
        }
        playPenaltyTickSound();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [p1Penalty]);

  useEffect(() => {
    if (p2Penalty <= 0) return;
    const interval = setInterval(() => {
      setP2Penalty((prev) => {
        if (prev <= 1) {
          playPenaltyUnlockSound();
          return 0;
        }
        playPenaltyTickSound();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [p2Penalty]);

  // Load new round cards
  const startNewRound = (roundNumber: number) => {
    const iconCount = getIconCountForRound(roundNumber, startingRound, keepDifficulty);
    const { matchingIcon, player1Icons, player2Icons } = generateRoundCards(iconCount);

    setMatchingIconId(matchingIcon.id);
    setP1Icons(player1Icons);
    setP2Icons(player2Icons);
    setP1Errors(0);
    setP2Errors(0);
    setP1Penalty(0);
    setP2Penalty(0);
    setRoundWinner(null);
    setHighlightIconId(null);
  };

  // Initial load
  useEffect(() => {
    startNewRound(startingRound);
  }, []);

  // Check victory condition
  const handleRoundWon = (winner: 1 | 2) => {
    if (roundWinner !== null) return; // Prevent double trigger

    setRoundWinner(winner);
    setHighlightIconId(matchingIconId);

    // Audio: celebratory round win jingle (+1 point celebration)
    playRoundWonSound();

    // Trigger celebratory small confetti burst from winner side
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: winner === 1 ? 0.3 : 0.7, x: 0.5 },
      });
    } catch {
      // Ignored
    }

    const nextP1Score = winner === 1 ? p1Score + 1 : p1Score;
    const nextP2Score = winner === 2 ? p2Score + 1 : p2Score;
    roundsPlayedRef.current += 1;

    if (winner === 1) setP1Score(nextP1Score);
    if (winner === 2) setP2Score(nextP2Score);

    setTimeout(() => {
      // Check if game ends
      if (keepDifficulty) {
        // Fixed mode: first to 5 points wins
        if (nextP1Score >= 5 || nextP2Score >= 5) {
          onGameOver(nextP1Score, nextP2Score, roundsPlayedRef.current);
          return;
        }
      } else {
        // Progressive mode: ends after round 18
        if (currentRound >= 18) {
          onGameOver(nextP1Score, nextP2Score, roundsPlayedRef.current);
          return;
        }
      }

      // Audio: Round complete transition sound into new cards
      playRoundCompleteTransitionSound();

      // Continue to next round
      const nextRound = keepDifficulty ? currentRound : currentRound + 1;
      setCurrentRound(nextRound);
      startNewRound(nextRound);
    }, 850);
  };

  // Handle icon tap
  const handleIconClick = (player: 1 | 2, iconId: string) => {
    unlockAudioOnUserGesture();
    if (roundWinner !== null) return;

    // Check penalty lock
    if (player === 1 && p1Penalty > 0) return;
    if (player === 2 && p2Penalty > 0) return;

    if (iconId === matchingIconId) {
      // 1. Correct icon tapped!
      playCorrectIconSound();
      handleRoundWon(player);
    } else {
      // 2. Mistake!
      playWrongIconSound();
      playPenaltyLockSound();

      if (player === 1) {
        const nextErrors = p1Errors + 1;
        setP1Errors(nextErrors);
        setP1Penalty(nextErrors + 1); // 1st error = 2s, 2nd = 3s, 3rd = 4s...
      } else {
        const nextErrors = p2Errors + 1;
        setP2Errors(nextErrors);
        setP2Penalty(nextErrors + 1);
      }
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-100 flex flex-col select-none overflow-hidden touch-manipulation">
      {/* ========================================================
          TOP HALF: PLAYER 1 (ROTATED 180 DEG FOR OPPOSITE PLAYER)
          ======================================================== */}
      <div className="relative flex-1 w-full bg-gradient-to-b from-rose-50 to-pink-100/70 rotate-180 flex flex-col items-center justify-center overflow-hidden p-2 sm:p-4">
        {/* Corner Avatar & Name for Player 1 */}
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-2xl border-2 border-pink-200 shadow-sm z-10">
          <span className="text-2xl">{player1Animal.emoji}</span>
          <div>
            <span className="block text-xs font-black text-pink-700 leading-none">
              {player1Animal.name}
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              {p1Score} điểm
            </span>
          </div>
        </div>

        {/* Penalty Overlay for Player 1 */}
        {p1Penalty > 0 && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center z-30 animate-fadeIn">
            <div className="bg-white/95 rounded-3xl p-4 sm:p-6 text-center shadow-2xl border-4 border-rose-300 max-w-xs animate-bounce">
              <span className="text-4xl block mb-1">⏳</span>
              <p className="text-rose-600 font-black text-lg">Bấm Nhầm Rồi!</p>
              <div className="text-4xl font-black text-slate-800 my-1">
                {p1Penalty}s
              </div>
              <p className="text-xs font-bold text-slate-500">
                Hãy chờ để bấm tiếp nhé!
              </p>
            </div>
          </div>
        )}

        {/* Winner celebration banner for Player 1 */}
        {roundWinner === 1 && (
          <div className="absolute inset-0 bg-emerald-500/30 backdrop-blur-xs flex items-center justify-center z-25 pointer-events-none">
            <div className="bg-emerald-500 text-white font-black text-2xl px-6 py-2 rounded-full shadow-2xl border-4 border-white animate-bounce">
              ĐÚNG RỒI! +1 ⭐
            </div>
          </div>
        )}

        {/* Player 1 Icon Circle Container */}
        <div
          className="relative w-[min(41.5vh,86vw)] sm:w-[min(43vh,82vw)] aspect-square rounded-full bg-white shadow-xl border-4 sm:border-8 border-pink-200/90 flex items-center justify-center overflow-hidden @container"
          style={{ containerType: 'inline-size' }}
        >
          {/* Subtle inner background disc */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-pink-50/70 to-rose-50/40 pointer-events-none" />

          {/* Render Player 1's icons */}
          {p1Icons.map((icon) => {
            const isMatch = icon.id === highlightIconId;
            return (
              <button
                key={`p1-${icon.id}`}
                type="button"
                onClick={() => handleIconClick(1, icon.id)}
                style={{
                  position: 'absolute',
                  left: `${icon.x}%`,
                  top: `${icon.y}%`,
                  width: `${icon.size}%`,
                  height: `${icon.size}%`,
                  transform: `translate(-50%, -50%) rotate(${icon.rotation}deg) ${isMatch ? 'scale(1.2)' : ''}`,
                }}
                className={`flex items-center justify-center rounded-full transition-all duration-150 cursor-pointer active:scale-90 ${
                  isMatch
                    ? 'bg-amber-300 text-amber-950 ring-4 ring-amber-400 z-20 animate-sparkle shadow-lg'
                    : 'bg-white/95 hover:bg-white shadow-sm border border-slate-200/70'
                }`}
                title={icon.name}
              >
                <i
                  className={`${icon.faClass}`}
                  style={{
                    color: isMatch ? '#78350f' : icon.color,
                    fontSize: `${icon.glyphSizeCqw || 12}cqw`,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          CENTER DIVIDER BAR: SCORES, ROUND INFO, PAUSE BUTTON
          ======================================================== */}
      <div className="relative z-40 w-full h-14 sm:h-16 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 shadow-md flex items-center justify-between px-3 sm:px-6 border-y-2 border-white/60">
        {/* Player 1 summary */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">{player1Animal.emoji}</span>
          <div className="bg-white/90 px-3 py-1 rounded-xl shadow-xs border border-amber-200">
            <span className="font-black text-pink-600 text-base sm:text-lg">
              {p1Score}
            </span>
          </div>
        </div>

        {/* Center: Round, Sound & Pause Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-center text-white mr-1">
            <div className="text-xs sm:text-sm font-black tracking-wide drop-shadow-xs">
              {keepDifficulty ? 'Chế độ cố định' : `Vòng ${currentRound}/18`}
            </div>
            <div className="text-[10px] font-bold text-amber-100 drop-shadow-xs">
              {currentIconCount} icons
            </div>
          </div>

          {/* Quick Sound Toggle Button */}
          <button
            type="button"
            onClick={handleToggleSoundFromBar}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 text-amber-700 font-extrabold shadow-sm border border-amber-200 flex items-center justify-center active:scale-90 hover:bg-amber-50 transition cursor-pointer"
            title={soundOn && volume > 0 ? `Âm lượng ${Math.round(volume * 100)}% (Bấm để tắt nhanh)` : 'Đang tắt âm thanh (Bấm để bật)'}
          >
            <i
              className={`fa-solid ${
                !soundOn || volume === 0
                  ? 'fa-volume-xmark text-rose-500'
                  : volume < 0.5
                  ? 'fa-volume-low text-amber-600'
                  : 'fa-volume-high text-amber-600'
              } text-xs sm:text-sm`}
            ></i>
          </button>

          {/* Pause Button */}
          <button
            type="button"
            onClick={() => setIsPaused(true)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-amber-600 font-extrabold shadow-md border-2 border-amber-200 flex items-center justify-center active:scale-90 hover:bg-amber-50 transition cursor-pointer"
            title="Tạm dừng game & Chỉnh âm lượng"
          >
            <i className="fa-solid fa-pause text-xs sm:text-sm"></i>
          </button>
        </div>

        {/* Player 2 summary */}
        <div className="flex items-center gap-2">
          <div className="bg-white/90 px-3 py-1 rounded-xl shadow-xs border border-amber-200">
            <span className="font-black text-blue-600 text-base sm:text-lg">
              {p2Score}
            </span>
          </div>
          <span className="text-2xl">{player2Animal.emoji}</span>
        </div>
      </div>

      {/* ========================================================
          BOTTOM HALF: PLAYER 2 (NORMAL ORIENTATION)
          ======================================================== */}
      <div className="relative flex-1 w-full bg-gradient-to-b from-sky-50 to-blue-100/70 flex flex-col items-center justify-center overflow-hidden p-2 sm:p-4">
        {/* Corner Avatar & Name for Player 2 */}
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-2xl border-2 border-blue-200 shadow-sm z-10">
          <div>
            <span className="block text-xs font-black text-blue-700 leading-none text-right">
              {player2Animal.name}
            </span>
            <span className="text-[10px] font-bold text-slate-500 text-right block">
              {p2Score} điểm
            </span>
          </div>
          <span className="text-2xl">{player2Animal.emoji}</span>
        </div>

        {/* Penalty Overlay for Player 2 */}
        {p2Penalty > 0 && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center z-30 animate-fadeIn">
            <div className="bg-white/95 rounded-3xl p-4 sm:p-6 text-center shadow-2xl border-4 border-blue-300 max-w-xs animate-bounce">
              <span className="text-4xl block mb-1">⏳</span>
              <p className="text-blue-600 font-black text-lg">Bấm Nhầm Rồi!</p>
              <div className="text-4xl font-black text-slate-800 my-1">
                {p2Penalty}s
              </div>
              <p className="text-xs font-bold text-slate-500">
                Hãy chờ để bấm tiếp nhé!
              </p>
            </div>
          </div>
        )}

        {/* Winner celebration banner for Player 2 */}
        {roundWinner === 2 && (
          <div className="absolute inset-0 bg-emerald-500/30 backdrop-blur-xs flex items-center justify-center z-25 pointer-events-none">
            <div className="bg-emerald-500 text-white font-black text-2xl px-6 py-2 rounded-full shadow-2xl border-4 border-white animate-bounce">
              ĐÚNG RỒI! +1 ⭐
            </div>
          </div>
        )}

        {/* Player 2 Icon Circle Container */}
        <div
          className="relative w-[min(41.5vh,86vw)] sm:w-[min(43vh,82vw)] aspect-square rounded-full bg-white shadow-xl border-4 sm:border-8 border-blue-200/90 flex items-center justify-center overflow-hidden @container"
          style={{ containerType: 'inline-size' }}
        >
          {/* Subtle inner background disc */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-sky-50/70 to-blue-50/40 pointer-events-none" />

          {/* Render Player 2's icons */}
          {p2Icons.map((icon) => {
            const isMatch = icon.id === highlightIconId;
            return (
              <button
                key={`p2-${icon.id}`}
                type="button"
                onClick={() => handleIconClick(2, icon.id)}
                style={{
                  position: 'absolute',
                  left: `${icon.x}%`,
                  top: `${icon.y}%`,
                  width: `${icon.size}%`,
                  height: `${icon.size}%`,
                  transform: `translate(-50%, -50%) rotate(${icon.rotation}deg) ${isMatch ? 'scale(1.2)' : ''}`,
                }}
                className={`flex items-center justify-center rounded-full transition-all duration-150 cursor-pointer active:scale-90 ${
                  isMatch
                    ? 'bg-amber-300 text-amber-950 ring-4 ring-amber-400 z-20 animate-sparkle shadow-lg'
                    : 'bg-white/95 hover:bg-white shadow-sm border border-slate-200/70'
                }`}
                title={icon.name}
              >
                <i
                  className={`${icon.faClass}`}
                  style={{
                    color: isMatch ? '#78350f' : icon.color,
                    fontSize: `${icon.glyphSizeCqw || 12}cqw`,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Pause Modal when paused */}
      {isPaused && (
        <PauseModal
          player1={{ animal: player1Animal, score: p1Score }}
          player2={{ animal: player2Animal, score: p2Score }}
          currentRound={currentRound}
          totalIcons={currentIconCount}
          onResume={() => setIsPaused(false)}
          onFinishAndScore={() => {
            setIsPaused(false);
            onGameOver(p1Score, p2Score, roundsPlayedRef.current);
          }}
        />
      )}
    </div>
  );
}
