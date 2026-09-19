import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
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
  startBackgroundMusic,
  stopBackgroundMusic,
  syncBackgroundMusic,
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

  // Start soft background music when game starts
  useEffect(() => {
    unlockAudioOnUserGesture();
    syncBackgroundMusic();
    return () => {
      stopBackgroundMusic();
    };
  }, []);

  const handleToggleSoundFromBar = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      playVolumePreviewSound();
      syncBackgroundMusic();
    } else {
      stopBackgroundMusic();
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

    // Stronger celebratory confetti from winner side
    try {
      const originY = winner === 1 ? 0.28 : 0.72;
      confetti({
        particleCount: 55,
        spread: 70,
        origin: { y: originY, x: 0.5 },
        colors: ['#fbbf24', '#f59e0b', '#34d399', '#60a5fa', '#f472b6'],
      });
      // Second burst a bit later
      setTimeout(() => {
        confetti({
          particleCount: 30,
          angle: winner === 1 ? 120 : 60,
          spread: 50,
          origin: { y: originY, x: winner === 1 ? 0.2 : 0.8 },
          colors: ['#fbbf24', '#34d399', '#f472b6'],
        });
      }, 180);
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
    <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-slate-100 to-slate-200 flex flex-col select-none overflow-hidden touch-manipulation">
      {/* ========================================================
          TOP HALF: PLAYER 1 (ROTATED 180 DEG FOR OPPOSITE PLAYER)
          ======================================================== */}
      <div className="relative flex-1 w-full bg-gradient-to-b from-rose-100 via-pink-50 to-rose-50/80 rotate-180 flex flex-col items-center justify-center overflow-hidden p-2 sm:p-4">
        {/* Soft decorative blobs */}
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-pink-200/40 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-rose-200/30 blur-2xl pointer-events-none" />

        {/* Corner Avatar & Name for Player 1 */}
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-pink-200 shadow-md z-10">
          <span className="text-2xl drop-shadow-sm">{player1Animal.emoji}</span>
          <div>
            <span className="block text-xs font-black text-pink-700 leading-none">
              {player1Animal.name}
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              {p1Score} điểm
            </span>
          </div>
        </div>

        {/* Winner celebration banner for Player 1 */}
        <AnimatePresence>
          {roundWinner === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-emerald-400/25 flex items-center justify-center z-25 pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0.5, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-2xl sm:text-3xl px-7 py-3 rounded-full shadow-2xl border-4 border-white"
              >
                ĐÚNG RỒI! +1 ⭐
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Player 1 Icon Circle Container */}
        <div
          className={`relative w-[min(41.5vh,86vw)] sm:w-[min(43vh,82vw)] aspect-square rounded-full bg-white shadow-2xl border-[6px] sm:border-8 flex items-center justify-center overflow-hidden @container ring-4 transition-all duration-300 ${
            p1Penalty > 0
              ? 'border-rose-400 ring-rose-200/60 opacity-75'
              : 'border-pink-300/90 ring-pink-100/50'
          }`}
          style={{ containerType: 'inline-size' }}
        >
          {/* Soft inner glow */}
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-pink-50/90 via-white to-rose-50/60 pointer-events-none" />
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_30px_rgba(244,114,182,0.12)] pointer-events-none" />

          {/* Render Player 1's icons */}
          {p1Icons.map((icon) => {
            const isMatch = icon.id === highlightIconId;
            const locked = p1Penalty > 0;
            return (
              <button
                key={`p1-${icon.id}`}
                type="button"
                onClick={() => handleIconClick(1, icon.id)}
                disabled={locked}
                style={{
                  position: 'absolute',
                  left: `${icon.x}%`,
                  top: `${icon.y}%`,
                  width: `${icon.size}%`,
                  height: `${icon.size}%`,
                  transform: `translate(-50%, -50%) rotate(${icon.rotation}deg) ${isMatch ? 'scale(1.25)' : ''}`,
                }}
                className={`flex items-center justify-center rounded-full transition-all duration-200 ${
                  locked
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer active:scale-90'
                } ${
                  isMatch
                    ? 'bg-amber-300 text-amber-950 ring-4 ring-amber-400 z-20 animate-sparkle shadow-xl'
                    : 'bg-white/95 hover:bg-white shadow-md border border-pink-100/80 hover:shadow-lg'
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

          {/* Penalty badge — nhỏ, không che kín màn hình */}
          <AnimatePresence>
            {p1Penalty > 0 && (
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
              >
                <div className="bg-rose-500/90 text-white rounded-2xl px-4 py-2.5 shadow-xl border-2 border-white/80 flex items-center gap-2">
                  <span className="text-xl">🔒</span>
                  <div className="text-center leading-none">
                    <div className="text-2xl font-black tabular-nums">{p1Penalty}s</div>
                    <div className="text-[10px] font-bold opacity-90">Chờ tí!</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ========================================================
          CENTER DIVIDER BAR: SCORES, ROUND INFO, PAUSE BUTTON
          ======================================================== */}
      <div className="relative z-40 w-full h-14 sm:h-16 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 shadow-lg flex items-center justify-between px-3 sm:px-6 border-y-[3px] border-white/70">
        {/* Soft highlight line */}
        <div className="absolute inset-x-0 top-0 h-px bg-white/50" />

        {/* Player 1 summary */}
        <div className="flex items-center gap-2">
          <span className="text-2xl drop-shadow-sm">{player1Animal.emoji}</span>
          <div className="bg-white/95 px-3.5 py-1 rounded-xl shadow-sm border border-amber-200/80 min-w-[2.5rem] text-center">
            <span className="font-black text-pink-600 text-base sm:text-lg tabular-nums">
              {p1Score}
            </span>
          </div>
        </div>

        {/* Center: Round, Sound & Pause Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-center text-white mr-1">
            <div className="text-xs sm:text-sm font-black tracking-wide drop-shadow-sm">
              {keepDifficulty ? 'Chế độ cố định' : `Vòng ${currentRound}/18`}
            </div>
            <div className="text-[10px] font-bold text-amber-50/95 drop-shadow-sm">
              {currentIconCount} icons
            </div>
          </div>

          {/* Quick Sound Toggle Button */}
          <button
            type="button"
            onClick={handleToggleSoundFromBar}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 text-amber-700 font-extrabold shadow-sm border border-amber-200 flex items-center justify-center active:scale-90 hover:bg-amber-50 transition cursor-pointer"
            title={soundOn && volume > 0 ? `Âm lượng ${Math.round(volume * 100)}% (Bấm để tắt nhanh)` : 'Đang tắt âm thanh (Bấm để bật)'}
            aria-label={soundOn ? 'Tắt âm thanh' : 'Bật âm thanh'}
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
            aria-label="Tạm dừng"
          >
            <i className="fa-solid fa-pause text-xs sm:text-sm"></i>
          </button>
        </div>

        {/* Player 2 summary */}
        <div className="flex items-center gap-2">
          <div className="bg-white/95 px-3.5 py-1 rounded-xl shadow-sm border border-amber-200/80 min-w-[2.5rem] text-center">
            <span className="font-black text-blue-600 text-base sm:text-lg tabular-nums">
              {p2Score}
            </span>
          </div>
          <span className="text-2xl drop-shadow-sm">{player2Animal.emoji}</span>
        </div>
      </div>

      {/* ========================================================
          BOTTOM HALF: PLAYER 2 (NORMAL ORIENTATION)
          ======================================================== */}
      <div className="relative flex-1 w-full bg-gradient-to-b from-sky-50 via-blue-50 to-sky-100/80 flex flex-col items-center justify-center overflow-hidden p-2 sm:p-4">
        {/* Soft decorative blobs */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-sky-200/40 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-blue-200/30 blur-2xl pointer-events-none" />

        {/* Corner Avatar & Name for Player 2 */}
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border-2 border-blue-200 shadow-md z-10">
          <div>
            <span className="block text-xs font-black text-blue-700 leading-none text-right">
              {player2Animal.name}
            </span>
            <span className="text-[10px] font-bold text-slate-500 text-right block">
              {p2Score} điểm
            </span>
          </div>
          <span className="text-2xl drop-shadow-sm">{player2Animal.emoji}</span>
        </div>

        {/* Winner celebration banner for Player 2 */}
        <AnimatePresence>
          {roundWinner === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-emerald-400/25 flex items-center justify-center z-25 pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0.5, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-2xl sm:text-3xl px-7 py-3 rounded-full shadow-2xl border-4 border-white"
              >
                ĐÚNG RỒI! +1 ⭐
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Player 2 Icon Circle Container */}
        <div
          className={`relative w-[min(41.5vh,86vw)] sm:w-[min(43vh,82vw)] aspect-square rounded-full bg-white shadow-2xl border-[6px] sm:border-8 flex items-center justify-center overflow-hidden @container ring-4 transition-all duration-300 ${
            p2Penalty > 0
              ? 'border-blue-400 ring-blue-200/60 opacity-75'
              : 'border-blue-300/90 ring-sky-100/50'
          }`}
          style={{ containerType: 'inline-size' }}
        >
          {/* Soft inner glow */}
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-sky-50/90 via-white to-blue-50/60 pointer-events-none" />
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_30px_rgba(56,189,248,0.12)] pointer-events-none" />

          {/* Render Player 2's icons */}
          {p2Icons.map((icon) => {
            const isMatch = icon.id === highlightIconId;
            const locked = p2Penalty > 0;
            return (
              <button
                key={`p2-${icon.id}`}
                type="button"
                onClick={() => handleIconClick(2, icon.id)}
                disabled={locked}
                style={{
                  position: 'absolute',
                  left: `${icon.x}%`,
                  top: `${icon.y}%`,
                  width: `${icon.size}%`,
                  height: `${icon.size}%`,
                  transform: `translate(-50%, -50%) rotate(${icon.rotation}deg) ${isMatch ? 'scale(1.25)' : ''}`,
                }}
                className={`flex items-center justify-center rounded-full transition-all duration-200 ${
                  locked
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer active:scale-90'
                } ${
                  isMatch
                    ? 'bg-amber-300 text-amber-950 ring-4 ring-amber-400 z-20 animate-sparkle shadow-xl'
                    : 'bg-white/95 hover:bg-white shadow-md border border-sky-100/80 hover:shadow-lg'
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

          {/* Penalty badge — nhỏ, không che kín màn hình */}
          <AnimatePresence>
            {p2Penalty > 0 && (
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
              >
                <div className="bg-blue-500/90 text-white rounded-2xl px-4 py-2.5 shadow-xl border-2 border-white/80 flex items-center gap-2">
                  <span className="text-xl">🔒</span>
                  <div className="text-center leading-none">
                    <div className="text-2xl font-black tabular-nums">{p2Penalty}s</div>
                    <div className="text-[10px] font-bold opacity-90">Chờ tí!</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
