import React, { useState, useEffect, useCallback } from 'react';
import { OrientationMode, PlayerProfile } from '../../types';
import { playPop, playPoint, playBoing, playVictory } from '../../utils/audio';

interface FarmRaceGameProps {
  player1: PlayerProfile;
  player2: PlayerProfile;
  orientation: OrientationMode;
  onVictory: (winner: 'p1' | 'p2', score1: number, score2: number) => void;
  onScoreUpdate: (score1: number, score2: number) => void;
  isPaused: boolean;
}

interface FarmQuest {
  targetEmoji: string;
  targetName: string;
  requiredCount: number;
}

const QUEST_POOL: FarmQuest[] = [
  { targetEmoji: '🍓', targetName: 'Dâu Tây Đỏ', requiredCount: 4 },
  { targetEmoji: '🥕', targetName: 'Cà Rốt Giòn', requiredCount: 5 },
  { targetEmoji: '🍎', targetName: 'Táo Ngọt', requiredCount: 4 },
  { targetEmoji: '🌽', targetName: 'Bắp Ngô Vàng', requiredCount: 3 },
  { targetEmoji: '🍄', targetName: 'Nấm Đốm', requiredCount: 4 },
  { targetEmoji: '🌻', targetName: 'Hoa Hướng Dương', requiredCount: 3 },
  { targetEmoji: '🍉', targetName: 'Dưa Hấu Mát', requiredCount: 3 },
];

const DECOY_EMOJIS = ['🥦', '🍅', '🍊', '🍇', '🌸', '🐝', '🌿', '🥔'];

interface FieldItem {
  id: string;
  emoji: string;
  isTarget: boolean;
  x: number; // 10% to 90%
  y: number; // 10% to 80%
  isHarvested: boolean;
}

export const FarmRaceGame: React.FC<FarmRaceGameProps> = ({
  player1,
  player2,
  orientation,
  onVictory,
  onScoreUpdate,
  isPaused,
}) => {
  const [round, setRound] = useState(1);
  const [score1, setScore1] = useState(0); // laps won
  const [score2, setScore2] = useState(0); // laps won
  const [currentQuest, setCurrentQuest] = useState<FarmQuest>(QUEST_POOL[0]);

  // Player progress in current lap
  const [progressP1, setProgressP1] = useState(0);
  const [progressP2, setProgressP2] = useState(0);

  // Field items for P1 and P2
  const [itemsP1, setItemsP1] = useState<FieldItem[]>([]);
  const [itemsP2, setItemsP2] = useState<FieldItem[]>([]);

  // Feedback notifications
  const [roundWinnerToast, setRoundWinnerToast] = useState<string | null>(null);

  // Generate field items for a quest
  const generateField = useCallback((quest: FarmQuest) => {
    const makeItems = (): FieldItem[] => {
      const items: FieldItem[] = [];
      // Add target items
      for (let i = 0; i < quest.requiredCount + 2; i++) {
        items.push({
          id: `target-${i}-${Math.random()}`,
          emoji: quest.targetEmoji,
          isTarget: true,
          x: 15 + Math.random() * 70,
          y: 15 + Math.random() * 65,
          isHarvested: false,
        });
      }
      // Add decoy items
      for (let i = 0; i < 6; i++) {
        const decoy = DECOY_EMOJIS[Math.floor(Math.random() * DECOY_EMOJIS.length)];
        items.push({
          id: `decoy-${i}-${Math.random()}`,
          emoji: decoy,
          isTarget: false,
          x: 15 + Math.random() * 70,
          y: 15 + Math.random() * 65,
          isHarvested: false,
        });
      }
      return items.sort(() => Math.random() - 0.5);
    };

    setItemsP1(makeItems());
    setItemsP2(makeItems());
    setProgressP1(0);
    setProgressP2(0);
  }, []);

  // Setup new round
  const startNewRound = useCallback(
    (nextRound: number) => {
      const quest = QUEST_POOL[(nextRound - 1) % QUEST_POOL.length];
      setCurrentQuest(quest);
      generateField(quest);
      setRound(nextRound);
      setRoundWinnerToast(null);
    },
    [generateField]
  );

  useEffect(() => {
    startNewRound(1);
  }, [startNewRound]);

  // Sync scores with parent
  useEffect(() => {
    onScoreUpdate(score1, score2);
    if (score1 >= 3) {
      onVictory('p1', score1, score2);
    } else if (score2 >= 3) {
      onVictory('p2', score1, score2);
    }
  }, [score1, score2, onVictory, onScoreUpdate]);

  const handleHarvestP1 = (item: FieldItem) => {
    if (item.isHarvested || isPaused || roundWinnerToast) return;

    if (item.isTarget) {
      playPop();
      setItemsP1(prev =>
        prev.map(i => (i.id === item.id ? { ...i, isHarvested: true } : i))
      );
      const nextP1 = progressP1 + 1;
      setProgressP1(nextP1);

      if (nextP1 >= currentQuest.requiredCount) {
        // P1 wins this lap!
        playPoint();
        const nextScore1 = score1 + 1;
        setScore1(nextScore1);
        setRoundWinnerToast(`🏎️ ${player1.name} thắng Chặng ${round}!`);

        if (nextScore1 < 3 && score2 < 3) {
          setTimeout(() => startNewRound(round + 1), 1600);
        }
      }
    } else {
      playBoing();
    }
  };

  const handleHarvestP2 = (item: FieldItem) => {
    if (item.isHarvested || isPaused || roundWinnerToast) return;

    if (item.isTarget) {
      playPop();
      setItemsP2(prev =>
        prev.map(i => (i.id === item.id ? { ...i, isHarvested: true } : i))
      );
      const nextP2 = progressP2 + 1;
      setProgressP2(nextP2);

      if (nextP2 >= currentQuest.requiredCount) {
        // P2 wins this lap!
        playPoint();
        const nextScore2 = score2 + 1;
        setScore2(nextScore2);
        setRoundWinnerToast(`🚜 ${player2.name} thắng Chặng ${round}!`);

        if (nextScore2 < 3 && score1 < 3) {
          setTimeout(() => startNewRound(round + 1), 1600);
        }
      }
    } else {
      playBoing();
    }
  };

  const isOpposite = orientation === 'opposite';
  const p1Ratio = Math.min(progressP1 / currentQuest.requiredCount, 1);
  const p2Ratio = Math.min(progressP2 / currentQuest.requiredCount, 1);

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-amber-50/40 flex flex-col">
      {/* ================= TOP HALF (PLAYER 2) ================= */}
      <div className="flex-1 relative border-b-2 border-amber-300 bg-sky-50/50 p-2 flex flex-col justify-between">
        {/* Quest banner for P2 (at top edge of screen, facing P2) */}
        <div
          className={`flex items-center justify-between z-10 transition-transform duration-300 ${
            isOpposite ? 'rotate-180' : ''
          }`}
        >
          <div className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-xs">
            <span className="leading-none">{player2.avatar}</span>
            <span>{player2.name}</span>
          </div>

          <div className="bg-white/95 border border-blue-200 text-blue-900 px-3 py-1 rounded-full text-xs font-bold shadow-xs flex items-center gap-1.5 animate-bounce">
            <span>Hái:</span>
            <span className="text-base">{currentQuest.targetEmoji}</span>
            <span className="font-black">
              {progressP2}/{currentQuest.requiredCount} {currentQuest.targetName}
            </span>
          </div>

          <div className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
            Thắng: {score2}/3
          </div>
        </div>

        {/* Harvest Field P2 */}
        <div className="absolute inset-x-2 top-11 bottom-2">
          {itemsP2.map(item => (
            <button
              key={item.id}
              onClick={() => handleHarvestP2(item)}
              disabled={item.isHarvested}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs transition-all duration-150 active:scale-80 ${
                item.isHarvested
                  ? 'scale-0 opacity-0 pointer-events-none'
                  : 'bg-white/95 border border-slate-200 hover:scale-110 active:bg-amber-100 cursor-pointer'
              } ${isOpposite ? 'rotate-180' : ''}`}
            >
              {item.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* ================= CENTER RACING TRACK ================= */}
      <div className="h-18 bg-slate-800 border-y-3 border-amber-400 relative z-25 flex flex-col justify-around px-3 shadow-lg">
        {/* Track Lane 1 (Player 2 - Top) */}
        <div className="relative w-[calc(100%-90px)] h-6 bg-slate-700/60 rounded-full border border-slate-600 flex items-center">
          <div className="absolute left-1.5 text-[9px] font-bold text-slate-400">Xuất phát</div>
          <div className="absolute -right-3 text-sm font-black">🏁</div>

          {/* Kart P2 */}
          <div
            style={{ left: `calc(${p2Ratio * 82}% + 10px)` }}
            className="absolute -translate-x-1/2 flex items-center gap-1 transition-all duration-200"
          >
            <div className="bg-blue-500 text-white text-[11px] font-black px-1.5 py-0.2 rounded-lg shadow-md flex items-center gap-1 border border-white">
              <span>🚜</span>
              <span>{player2.avatar}</span>
            </div>
          </div>
        </div>

        {/* Track Lane 2 (Player 1 - Bottom) */}
        <div className="relative w-[calc(100%-90px)] h-6 bg-slate-700/60 rounded-full border border-slate-600 flex items-center">
          <div className="absolute left-1.5 text-[9px] font-bold text-slate-400">Xuất phát</div>
          <div className="absolute -right-3 text-sm font-black">🏁</div>

          {/* Kart P1 */}
          <div
            style={{ left: `calc(${p1Ratio * 82}% + 10px)` }}
            className="absolute -translate-x-1/2 flex items-center gap-1 transition-all duration-200"
          >
            <div className="bg-rose-500 text-white text-[11px] font-black px-1.5 py-0.2 rounded-lg shadow-md flex items-center gap-1 border border-white">
              <span>🏎️</span>
              <span>{player1.avatar}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM HALF (PLAYER 1) ================= */}
      <div className="flex-1 relative bg-rose-50/50 p-3 flex flex-col justify-between">
        {/* Harvest Field P1 */}
        <div className="absolute inset-x-2 top-2 bottom-12">
          {itemsP1.map(item => (
            <button
              key={item.id}
              onClick={() => handleHarvestP1(item)}
              disabled={item.isHarvested}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-all duration-150 active:scale-80 ${
                item.isHarvested
                  ? 'scale-0 opacity-0 pointer-events-none'
                  : 'bg-white/90 border border-slate-200 hover:scale-110 active:bg-amber-100'
              }`}
            >
              {item.emoji}
            </button>
          ))}
        </div>

        {/* Quest banner for P1 */}
        <div className="mt-auto flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-sm">
            <span>{player1.avatar}</span>
            <span>{player1.name}</span>
          </div>

          <div className="bg-white/90 border border-rose-200 text-rose-900 px-3 py-1 rounded-full text-xs font-bold shadow-xs flex items-center gap-1.5 animate-bounce">
            <span>Nhiệm vụ:</span>
            <span className="text-base">{currentQuest.targetEmoji}</span>
            <span>
              {progressP1}/{currentQuest.requiredCount} {currentQuest.targetName}
            </span>
          </div>

          <div className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
            Thắng: {score1}/3 vòng
          </div>
        </div>
      </div>

      {/* Round Winner Overlay */}
      {roundWinnerToast && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs pointer-events-none">
          <div className="bg-amber-400 text-slate-900 font-black text-2xl px-8 py-3 rounded-3xl shadow-2xl border-4 border-white animate-bounce text-center">
            {roundWinnerToast}
          </div>
        </div>
      )}
    </div>
  );
};
