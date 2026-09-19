import React, { useState, useEffect, useCallback } from 'react';
import { OrientationMode, PlayerProfile } from '../../types';
import { playPop, playPoint, playBoing, playCountdown } from '../../utils/audio';

interface SpotMatchGameProps {
  player1: PlayerProfile;
  player2: PlayerProfile;
  orientation: OrientationMode;
  onVictory: (winner: 'p1' | 'p2', score1: number, score2: number) => void;
  onScoreUpdate: (score1: number, score2: number) => void;
  isPaused: boolean;
  initialLevel?: number;
  fixedDifficultyMode?: boolean;
}

// Rich icon set with cute, unmistakable emojis
const ICON_POOL = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦅',
  '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌',
  '🐞', '🐜', '🐢', '🐍', '🐙', '🦑', '🦐', '🦀', '🐡', '🐠',
  '🐬', '🐳', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘',
  '🍎', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🍍', '🥥', '🥝',
  '🚀', '🚗', '✈️', '⛵', '🎈', '⭐', '🌈', '🍦', '🍩', '🍕'
];

interface CardIcon {
  emoji: string;
  x: number; // percentage offset in circle -40 to 40
  y: number; // percentage offset in circle -40 to 40
  sizeRem: number;
  rotation: number;
}

export const SpotMatchGame: React.FC<SpotMatchGameProps> = ({
  player1,
  player2,
  orientation,
  onVictory,
  onScoreUpdate,
  isPaused,
  initialLevel = 1,
  fixedDifficultyMode = false,
}) => {
  const [level, setLevel] = useState(initialLevel);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);

  // Error counts for current round
  const [errorsP1, setErrorsP1] = useState(0);
  const [errorsP2, setErrorsP2] = useState(0);

  // Freeze locks in seconds
  const [freezeP1, setFreezeP1] = useState(0);
  const [freezeP2, setFreezeP2] = useState(0);

  // Countdown at round start
  const [countdown, setCountdown] = useState<number | null>(3);

  // Card icons
  const [card1, setCard1] = useState<CardIcon[]>([]);
  const [card2, setCard2] = useState<CardIcon[]>([]);
  const [matchingIcon, setMatchingIcon] = useState<string>('');

  // 3-2-1 countdown on mount
  useEffect(() => {
    let count = 3;
    setCountdown(count);
    playCountdown(false);

    const timer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        playCountdown(false);
      } else if (count === 0) {
        setCountdown(0);
        playCountdown(true);
      } else {
        setCountdown(null);
        clearInterval(timer);
      }
    }, 700);

    return () => clearInterval(timer);
  }, []);

  // Compute number of icons based on level (3 to 18 icons)
  const getIconCountForLevel = useCallback(
    (lvl: number) => {
      if (fixedDifficultyMode) {
        return Math.min(3 + initialLevel, 12);
      }
      return Math.min(3 + (lvl - 1), 18);
    },
    [fixedDifficultyMode, initialLevel]
  );

  // Distribute icons inside circular disk
  const distributeIconsInCircle = (icons: string[]): CardIcon[] => {
    const count = icons.length;
    // Determine icon size based on count so they never clip outside
    const sizeRem = count <= 4 ? 2.8 : count <= 8 ? 2.3 : count <= 12 ? 1.8 : 1.4;

    const result: CardIcon[] = [];
    if (count === 1) {
      return [{ emoji: icons[0], x: 50, y: 50, sizeRem, rotation: 0 }];
    }

    // Concentric rings positioning
    const rings = count <= 5 ? [count] : count <= 10 ? [1, count - 1] : [1, Math.floor((count - 1) * 0.4), Math.ceil((count - 1) * 0.6)];

    let currentIconIdx = 0;

    if (rings.length === 1) {
      const ringCount = rings[0];
      const radius = 30; // %
      for (let i = 0; i < ringCount; i++) {
        const angle = (i / ringCount) * Math.PI * 2 + Math.random() * 0.4;
        result.push({
          emoji: icons[currentIconIdx++],
          x: 50 + Math.cos(angle) * (radius + (Math.random() * 6 - 3)),
          y: 50 + Math.sin(angle) * (radius + (Math.random() * 6 - 3)),
          sizeRem,
          rotation: Math.floor(Math.random() * 60 - 30),
        });
      }
    } else {
      // Center icon
      result.push({
        emoji: icons[currentIconIdx++],
        x: 50 + (Math.random() * 6 - 3),
        y: 50 + (Math.random() * 6 - 3),
        sizeRem: sizeRem * 1.1,
        rotation: Math.floor(Math.random() * 40 - 20),
      });

      // Outer rings
      for (let r = 1; r < rings.length; r++) {
        const ringCount = rings[r];
        const radius = r === 1 && rings.length === 3 ? 22 : 34;
        for (let i = 0; i < ringCount; i++) {
          if (currentIconIdx >= count) break;
          const angle = (i / ringCount) * Math.PI * 2 + (r * 0.5) + (Math.random() * 0.3);
          result.push({
            emoji: icons[currentIconIdx++],
            x: 50 + Math.cos(angle) * (radius + (Math.random() * 4 - 2)),
            y: 50 + Math.sin(angle) * (radius + (Math.random() * 4 - 2)),
            sizeRem,
            rotation: Math.floor(Math.random() * 60 - 30),
          });
        }
      }
    }

    return result;
  };

  // Generate cards for the round: exactly 1 matching icon!
  const generateNewRound = useCallback(
    (lvl: number) => {
      const count = getIconCountForLevel(lvl);

      // Pick random icons
      const shuffledPool = [...ICON_POOL].sort(() => Math.random() - 0.5);

      // The 1 matching icon
      const match = shuffledPool[0];
      setMatchingIcon(match);

      // Unique icons for card 1
      const c1Icons = [match, ...shuffledPool.slice(1, count)].sort(() => Math.random() - 0.5);

      // Unique icons for card 2 (distinct from c1 except match)
      const c2Icons = [match, ...shuffledPool.slice(count, count * 2 - 1)].sort(() => Math.random() - 0.5);

      setCard1(distributeIconsInCircle(c1Icons));
      setCard2(distributeIconsInCircle(c2Icons));

      // Reset errors for new round
      setErrorsP1(0);
      setErrorsP2(0);
      setFreezeP1(0);
      setFreezeP2(0);
    },
    [getIconCountForLevel]
  );

  useEffect(() => {
    generateNewRound(level);
  }, [level, generateNewRound]);

  // Freeze countdown timers
  useEffect(() => {
    if (freezeP1 > 0) {
      const timer = setTimeout(() => setFreezeP1(f => f - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [freezeP1]);

  useEffect(() => {
    if (freezeP2 > 0) {
      const timer = setTimeout(() => setFreezeP2(f => f - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [freezeP2]);

  // Sync scores with parent & check victory
  useEffect(() => {
    onScoreUpdate(score1, score2);

    if (fixedDifficultyMode) {
      if (score1 >= 5) onVictory('p1', score1, score2);
      else if (score2 >= 5) onVictory('p2', score1, score2);
    } else {
      // 18 rounds max
      if (level > 18) {
        if (score1 > score2) onVictory('p1', score1, score2);
        else if (score2 > score1) onVictory('p2', score1, score2);
        else onVictory('p1', score1, score2);
      }
    }
  }, [score1, score2, level, fixedDifficultyMode, onVictory, onScoreUpdate]);

  // Player 1 tap handler (Bottom card)
  const handleP1Tap = (emoji: string) => {
    if (freezeP1 > 0 || isPaused || countdown !== null) return;

    if (emoji === matchingIcon) {
      // Correct!
      playPoint();
      setScore1(s => s + 1);

      if (!fixedDifficultyMode) {
        setLevel(l => l + 1);
      } else {
        generateNewRound(level);
      }
    } else {
      // Wrong! Penalty freeze: 1st error = 2s, 2nd error = 3s, 3rd error = 4s...
      playBoing();
      const nextErr = errorsP1 + 1;
      setErrorsP1(nextErr);
      setFreezeP1(nextErr + 1);
    }
  };

  // Player 2 tap handler (Top card)
  const handleP2Tap = (emoji: string) => {
    if (freezeP2 > 0 || isPaused || countdown !== null) return;

    if (emoji === matchingIcon) {
      // Correct!
      playPoint();
      setScore2(s => s + 1);

      if (!fixedDifficultyMode) {
        setLevel(l => l + 1);
      } else {
        generateNewRound(level);
      }
    } else {
      // Wrong! Penalty freeze: 1st error = 2s, 2nd error = 3s...
      playBoing();
      const nextErr = errorsP2 + 1;
      setErrorsP2(nextErr);
      setFreezeP2(nextErr + 1);
    }
  };

  const isOpposite = orientation === 'opposite';
  const iconCount = getIconCountForLevel(level);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-gradient-to-b from-sky-50/70 via-slate-100 to-rose-50/70 flex flex-col">
      {/* ================= TOP HALF (PLAYER 2 / NỬA TRÊN) ================= */}
      <div className="flex-1 relative border-b-2 border-slate-300/80 flex items-center justify-center p-2">
        {/* Top Outer Status Bar (Facing Player 2) */}
        <div
          className={`absolute top-2 inset-x-3 z-20 flex items-center justify-between pointer-events-none transition-transform duration-300 ${
            isOpposite ? 'rotate-180' : ''
          }`}
        >
          <div className="flex items-center gap-1.5 bg-blue-600/90 text-white px-2.5 py-1 rounded-full text-xs font-black shadow-xs pointer-events-auto">
            <span className="text-sm leading-none">{player2.avatar}</span>
            <span>{player2.name}</span>
            <span className="bg-white text-blue-600 px-1.5 py-0.2 rounded-full font-black text-[11px]">
              {score2} đ
            </span>
          </div>

          <div className="text-[11px] font-bold text-slate-600 bg-white/95 px-2.5 py-0.5 rounded-full border border-slate-200 shadow-xs pointer-events-auto">
            {fixedDifficultyMode ? `Cố định (${iconCount} hình)` : `Vòng ${level}/18 (${iconCount} hình)`}
          </div>
        </div>

        {/* Circular Card for Player 2 */}
        <div
          className={`relative w-[min(250px,50vw)] h-[min(250px,50vw)] max-w-[calc(46vh-52px)] max-h-[calc(46vh-52px)] aspect-square rounded-full bg-white border-4 border-blue-400 shadow-lg overflow-hidden flex items-center justify-center transition-transform duration-300 ${
            isOpposite ? 'rotate-180' : ''
          }`}
        >
          {freezeP2 > 0 ? (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-blue-900/70 backdrop-blur-xs text-white p-3 text-center">
              <span className="text-3xl animate-bounce">⏳</span>
              <span className="text-xs font-bold mt-1">Bấm nhầm!</span>
              <span className="text-2xl font-black text-amber-300">{freezeP2}s</span>
            </div>
          ) : (
            card2.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleP2Tap(item.emoji)}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  fontSize: `${item.sizeRem}rem`,
                  transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                }}
                className="absolute active:scale-125 transition-transform hover:scale-110 p-1 select-none cursor-pointer"
              >
                {item.emoji}
              </button>
            ))
          )}
        </div>
      </div>

      {/* ================= BOTTOM HALF (PLAYER 1 / NỬA DƯỚI) ================= */}
      <div className="flex-1 relative flex items-center justify-center p-2">
        {/* Circular Card for Player 1 */}
        <div className="relative w-[min(250px,50vw)] h-[min(250px,50vw)] max-w-[calc(46vh-52px)] max-h-[calc(46vh-52px)] aspect-square rounded-full bg-white border-4 border-rose-400 shadow-lg overflow-hidden flex items-center justify-center">
          {freezeP1 > 0 ? (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-rose-900/70 backdrop-blur-xs text-white p-3 text-center">
              <span className="text-3xl animate-bounce">⏳</span>
              <span className="text-xs font-bold mt-1">Bấm nhầm!</span>
              <span className="text-2xl font-black text-amber-300">{freezeP1}s</span>
            </div>
          ) : (
            card1.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleP1Tap(item.emoji)}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  fontSize: `${item.sizeRem}rem`,
                  transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                }}
                className="absolute active:scale-125 transition-transform hover:scale-110 p-1 select-none cursor-pointer"
              >
                {item.emoji}
              </button>
            ))
          )}
        </div>

        {/* Bottom Outer Status Bar (Facing Player 1) */}
        <div className="absolute bottom-2 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 bg-rose-600/90 text-white px-2.5 py-1 rounded-full text-xs font-black shadow-xs pointer-events-auto">
            <span className="text-sm leading-none">{player1.avatar}</span>
            <span>{player1.name}</span>
            <span className="bg-white text-rose-600 px-1.5 py-0.2 rounded-full font-black text-[11px]">
              {score1} đ
            </span>
          </div>

          <div className="text-[11px] font-bold text-slate-600 bg-white/95 px-2.5 py-0.5 rounded-full border border-slate-200 shadow-xs pointer-events-auto">
            {fixedDifficultyMode ? `Cố định (${iconCount} hình)` : `Vòng ${level}/18 (${iconCount} hình)`}
          </div>
        </div>
      </div>

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs pointer-events-none">
          <div className="text-8xl font-black text-amber-300 drop-shadow-2xl animate-ping">
            {countdown === 0 ? 'TÌM NGAY!' : countdown}
          </div>
        </div>
      )}
    </div>
  );
};
