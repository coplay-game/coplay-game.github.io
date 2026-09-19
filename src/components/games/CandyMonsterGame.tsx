import React, { useState, useEffect, useRef, useCallback } from 'react';
import { OrientationMode, PlayerProfile } from '../../types';
import { playMonsterTap, playBossHit, playPoint, playBoing } from '../../utils/audio';

interface CandyMonsterGameProps {
  player1: PlayerProfile;
  player2: PlayerProfile;
  orientation: OrientationMode;
  onVictory: (winner: 'p1' | 'p2', score1: number, score2: number) => void;
  onScoreUpdate: (score1: number, score2: number) => void;
  isPaused: boolean;
}

interface HoleMonster {
  holeIndex: number;
  emoji: string;
  isPenalty: boolean; // Bee or bomb
  points: number;
  durationMs: number;
  id: string;
}

const FRIENDLY_MONSTERS = [
  { emoji: '👾', points: 1 },
  { emoji: '🐙', points: 1 },
  { emoji: '🐸', points: 1 },
  { emoji: '🦄', points: 2 },
  { emoji: '🍬', points: 1 },
  { emoji: '🧁', points: 2 },
  { emoji: '⭐', points: 3 },
];

export const CandyMonsterGame: React.FC<CandyMonsterGameProps> = ({
  player1,
  player2,
  orientation,
  onVictory,
  onScoreUpdate,
  isPaused,
}) => {
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);

  // Active monsters in holes
  const [activeMonsterP1, setActiveMonsterP1] = useState<HoleMonster | null>(null);
  const [activeMonsterP2, setActiveMonsterP2] = useState<HoleMonster | null>(null);

  // Freeze penalty countdowns
  const [freezeP1, setFreezeP1] = useState<number>(0);
  const [freezeP2, setFreezeP2] = useState<number>(0);

  // Giant Boss Event
  const [isBossActive, setIsBossActive] = useState(false);
  const [bossHp, setBossHp] = useState(24);
  const [bossMaxHp] = useState(24);
  const bossTriggeredRef = useRef(false);

  // Game timer
  const [timeLeft, setTimeLeft] = useState(60);

  // Timer countdown
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Handle freeze countdown
  useEffect(() => {
    if (freezeP1 > 0) {
      const t = setTimeout(() => setFreezeP1(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [freezeP1]);

  useEffect(() => {
    if (freezeP2 > 0) {
      const t = setTimeout(() => setFreezeP2(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [freezeP2]);

  // Spawn monsters for P1
  const spawnMonsterP1 = useCallback(() => {
    if (isPaused || isBossActive || freezeP1 > 0) return;
    const isPenalty = Math.random() < 0.2;
    const monsterObj = isPenalty
      ? { emoji: '🐝', points: -1 }
      : FRIENDLY_MONSTERS[Math.floor(Math.random() * FRIENDLY_MONSTERS.length)];

    const monster: HoleMonster = {
      holeIndex: Math.floor(Math.random() * 6),
      emoji: monsterObj.emoji,
      isPenalty,
      points: monsterObj.points,
      durationMs: 1400 + Math.random() * 600,
      id: Math.random().toString(),
    };

    setActiveMonsterP1(monster);

    setTimeout(() => {
      setActiveMonsterP1(curr => (curr?.id === monster.id ? null : curr));
    }, monster.durationMs);
  }, [isPaused, isBossActive, freezeP1]);

  // Spawn monsters for P2
  const spawnMonsterP2 = useCallback(() => {
    if (isPaused || isBossActive || freezeP2 > 0) return;
    const isPenalty = Math.random() < 0.2;
    const monsterObj = isPenalty
      ? { emoji: '🐝', points: -1 }
      : FRIENDLY_MONSTERS[Math.floor(Math.random() * FRIENDLY_MONSTERS.length)];

    const monster: HoleMonster = {
      holeIndex: Math.floor(Math.random() * 6),
      emoji: monsterObj.emoji,
      isPenalty,
      points: monsterObj.points,
      durationMs: 1400 + Math.random() * 600,
      id: Math.random().toString(),
    };

    setActiveMonsterP2(monster);

    setTimeout(() => {
      setActiveMonsterP2(curr => (curr?.id === monster.id ? null : curr));
    }, monster.durationMs);
  }, [isPaused, isBossActive, freezeP2]);

  // Continuous Spawner
  useEffect(() => {
    if (isPaused || isBossActive) return;
    const interval1 = setInterval(spawnMonsterP1, 1500);
    const interval2 = setInterval(spawnMonsterP2, 1500);
    return () => {
      clearInterval(interval1);
      clearInterval(interval2);
    };
  }, [isPaused, isBossActive, spawnMonsterP1, spawnMonsterP2]);

  // Check for Boss Trigger
  useEffect(() => {
    if (!bossTriggeredRef.current && (score1 + score2 >= 12 || timeLeft <= 30)) {
      bossTriggeredRef.current = true;
      setIsBossActive(true);
      setActiveMonsterP1(null);
      setActiveMonsterP2(null);
      playPoint();
    }
  }, [score1, score2, timeLeft]);

  // Check victory condition
  useEffect(() => {
    onScoreUpdate(score1, score2);
    if (timeLeft === 0 || score1 >= 25 || score2 >= 25) {
      if (score1 > score2) onVictory('p1', score1, score2);
      else if (score2 > score1) onVictory('p2', score1, score2);
      else onVictory(score1 >= score2 ? 'p1' : 'p2', score1, score2);
    }
  }, [score1, score2, timeLeft, onVictory, onScoreUpdate]);

  const handleTapP1 = (holeIdx: number) => {
    if (freezeP1 > 0 || isPaused) return;

    if (activeMonsterP1 && activeMonsterP1.holeIndex === holeIdx) {
      if (activeMonsterP1.isPenalty) {
        playBoing();
        setFreezeP1(2);
      } else {
        playMonsterTap();
        setScore1(prev => prev + activeMonsterP1.points);
      }
      setActiveMonsterP1(null);
    }
  };

  const handleTapP2 = (holeIdx: number) => {
    if (freezeP2 > 0 || isPaused) return;

    if (activeMonsterP2 && activeMonsterP2.holeIndex === holeIdx) {
      if (activeMonsterP2.isPenalty) {
        playBoing();
        setFreezeP2(2);
      } else {
        playMonsterTap();
        setScore2(prev => prev + activeMonsterP2.points);
      }
      setActiveMonsterP2(null);
    }
  };

  const handleBossHit = (player: 'p1' | 'p2') => {
    if (bossHp <= 0) return;
    playBossHit();

    if (player === 'p1') setScore1(s => s + 1);
    else setScore2(s => s + 1);

    setBossHp(prev => {
      const next = prev - 1;
      if (next <= 0) {
        // Defeated!
        playPoint();
        setTimeout(() => {
          setIsBossActive(false);
        }, 800);
      }
      return next;
    });
  };

  const isOpposite = orientation === 'opposite';

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-950 flex flex-col text-white">
      {/* ================= TOP HALF (PLAYER 2) ================= */}
      <div className="flex-1 relative border-b-2 border-purple-500/50 p-3 flex flex-col justify-between">
        {/* Top Player Info Bar (Facing P2 at top edge of screen) */}
        <div
          className={`flex items-center justify-between z-10 transition-transform duration-300 ${
            isOpposite ? 'rotate-180' : ''
          }`}
        >
          <div className="flex items-center gap-1.5 bg-blue-600/90 text-white px-2.5 py-1 rounded-full text-xs font-black shadow-xs">
            <span className="leading-none">{player2.avatar}</span>
            <span>{player2.name}</span>
            <span className="bg-white text-blue-600 px-1.5 py-0.2 rounded-full font-black text-[11px] ml-1">
              {score2} đ
            </span>
          </div>

          <div className="text-[11px] font-semibold text-purple-200 bg-purple-800/60 px-2.5 py-0.5 rounded-full">
            ⏱️ {timeLeft}s
          </div>
        </div>

        {/* Freeze penalty overlay for P2 */}
        {freezeP2 > 0 && (
          <div className="absolute inset-2 z-30 flex items-center justify-center bg-cyan-950/80 backdrop-blur-xs rounded-2xl">
            <div className={`text-center animate-bounce ${isOpposite ? 'rotate-180' : ''}`}>
              <span className="text-3xl">🥶 🐝</span>
              <p className="text-xs font-bold text-cyan-300 mt-1">Bị ong chích! Khóa {freezeP2}s</p>
            </div>
          </div>
        )}

        {/* 6 Holes Grid for P2 */}
        <div className="grid grid-cols-3 gap-2.5 my-auto max-w-xs mx-auto w-full">
          {[0, 1, 2, 3, 4, 5].map(idx => {
            const hasMonster = activeMonsterP2 && activeMonsterP2.holeIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => handleTapP2(idx)}
                className={`relative h-16 bg-purple-950/80 rounded-2xl border-2 border-purple-400/40 flex items-center justify-center shadow-inner overflow-hidden active:scale-95 transition cursor-pointer ${
                  isOpposite ? 'rotate-180' : ''
                }`}
              >
                <div className="w-12 h-3 bg-purple-900/90 rounded-full mb-5 border border-purple-700/50" />
                {hasMonster && (
                  <span className="absolute text-3xl animate-in zoom-in duration-150 drop-shadow-md">
                    {activeMonsterP2.emoji}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= CENTER BOSS EVENT MODAL ================= */}
      {isBossActive && (
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 p-4 rounded-3xl shadow-2xl border-4 border-yellow-300 text-slate-950 text-center animate-in zoom-in-95">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-black uppercase tracking-wider bg-white px-2 py-0.5 rounded-full text-rose-600">
              Đại Boss Xuất Hiện!
            </span>
            <span className="text-xs font-black text-white">
              HP: {bossHp}/{bossMaxHp}
            </span>
          </div>

          <p className="text-xs font-bold text-white mb-2">
            Cả hai bố con cùng chạm liên tục vào Boss Kẹo Khổng Lồ để phá vỡ!
          </p>

          {/* Boss HP Bar */}
          <div className="w-full bg-slate-900/40 h-3 rounded-full overflow-hidden mb-3 p-0.5">
            <div
              style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
              className="h-full bg-yellow-300 rounded-full transition-all duration-100"
            />
          </div>

          <div className="flex justify-around items-center">
            {/* P2 Side Hit Button */}
            <button
              onClick={() => handleBossHit('p2')}
              className="bg-blue-600 hover:bg-blue-500 active:scale-90 text-white font-black text-sm px-4 py-2 rounded-2xl shadow-lg border-2 border-white flex items-center gap-1"
            >
              <span>{player2.avatar}</span> Đập Boss!
            </button>

            {/* Giant Boss Icon */}
            <button
              onClick={() => handleBossHit(Math.random() > 0.5 ? 'p1' : 'p2')}
              className="text-6xl animate-bounce active:scale-125 transition select-none"
            >
              👑🍬
            </button>

            {/* P1 Side Hit Button */}
            <button
              onClick={() => handleBossHit('p1')}
              className="bg-rose-600 hover:bg-rose-500 active:scale-90 text-white font-black text-sm px-4 py-2 rounded-2xl shadow-lg border-2 border-white flex items-center gap-1"
            >
              <span>{player1.avatar}</span> Đập Boss!
            </button>
          </div>
        </div>
      )}

      {/* ================= BOTTOM HALF (PLAYER 1) ================= */}
      <div className="flex-1 relative p-4 flex flex-col justify-between">
        {/* Freeze penalty overlay for P1 */}
        {freezeP1 > 0 && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-cyan-950/70 backdrop-blur-xs rounded-2xl">
            <div className="text-center animate-bounce">
              <span className="text-4xl">🥶 🐝</span>
              <p className="text-sm font-bold text-cyan-300 mt-1">Bị ong chích! Khóa {freezeP1}s</p>
            </div>
          </div>
        )}

        {/* 6 Holes Grid for P1 */}
        <div className="grid grid-cols-3 gap-3 my-auto max-w-sm mx-auto w-full">
          {[0, 1, 2, 3, 4, 5].map(idx => {
            const hasMonster = activeMonsterP1 && activeMonsterP1.holeIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => handleTapP1(idx)}
                className="relative h-20 bg-purple-950/80 rounded-3xl border-2 border-purple-400/40 flex items-center justify-center shadow-inner overflow-hidden active:scale-95 transition"
              >
                <div className="w-14 h-4 bg-purple-900/90 rounded-full mb-6 border border-purple-700/50" />
                {hasMonster && (
                  <span className="absolute text-4xl animate-in zoom-in duration-150 drop-shadow-md">
                    {activeMonsterP1.emoji}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Player Info Bar */}
        <div className="flex items-center justify-between z-10 mt-auto">
          <div className="flex items-center gap-1.5 bg-rose-600/90 text-white px-3 py-1 rounded-full text-xs font-black shadow-sm">
            <span>{player1.avatar}</span>
            <span>{player1.name}</span>
            <span className="bg-white text-rose-600 px-2 py-0.5 rounded-full font-black ml-1">
              {score1} điểm
            </span>
          </div>

          <div className="text-xs font-semibold text-purple-200 bg-purple-800/60 px-3 py-1 rounded-full">
            Mục tiêu: 25 điểm hoặc hết giờ
          </div>
        </div>
      </div>
    </div>
  );
};
