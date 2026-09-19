import React, { useState, useEffect, useRef } from 'react';
import { OrientationMode, PlayerProfile } from '../../types';
import { playPop, playPoint, playTrainWhistle, playBoing } from '../../utils/audio';

interface TrainCoopGameProps {
  player1: PlayerProfile;
  player2: PlayerProfile;
  orientation: OrientationMode;
  onVictory: (winner: 'coop-win', score1: number, score2: number) => void;
  onScoreUpdate: (score1: number, score2: number) => void;
  isPaused: boolean;
}

type PieceType = 'straight-h' | 'straight-v' | 'curve-tl' | 'curve-tr' | 'curve-bl' | 'curve-br' | 'bridge';

interface TrackSlot {
  id: string;
  owner: 'p1' | 'p2';
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  requiredPiece: PieceType;
  placedPiece: PieceType | null;
  label: string;
}

interface PieceItem {
  id: string;
  type: PieceType;
  emoji: string;
  name: string;
}

const ALL_PIECES: Record<PieceType, { emoji: string; name: string }> = {
  'straight-h': { emoji: '═', name: 'Đường Ngang' },
  'straight-v': { emoji: '║', name: 'Đường Dọc' },
  'curve-tl': { emoji: '╝', name: 'Cua Trái' },
  'curve-tr': { emoji: '╚', name: 'Cua Phải' },
  'curve-bl': { emoji: '╗', name: 'Cua Vòng' },
  'curve-br': { emoji: '╔', name: 'Cua Uốn' },
  'bridge': { emoji: '🌉', name: 'Cầu Gỗ' },
};

const LEVEL_CONFIGS = [
  {
    level: 1,
    title: 'Chặng 1: Thảo Nguyên Xanh 🌱',
    slots: [
      // Top half (P2)
      { id: 's1', owner: 'p2' as const, x: 30, y: 30, requiredPiece: 'straight-h' as PieceType, placedPiece: null, label: 'Ray ngang' },
      { id: 's2', owner: 'p2' as const, x: 70, y: 30, requiredPiece: 'curve-bl' as PieceType, placedPiece: null, label: 'Cua xuống' },
      // Bottom half (P1)
      { id: 's3', owner: 'p1' as const, x: 70, y: 70, requiredPiece: 'curve-tl' as PieceType, placedPiece: null, label: 'Cua sang' },
      { id: 's4', owner: 'p1' as const, x: 30, y: 70, requiredPiece: 'straight-h' as PieceType, placedPiece: null, label: 'Ray ngang' },
    ],
  },
  {
    level: 2,
    title: 'Chặng 2: Cầu Cầu Vồng 🌈',
    slots: [
      { id: 's1', owner: 'p2' as const, x: 25, y: 25, requiredPiece: 'bridge' as PieceType, placedPiece: null, label: 'Cầu gỗ' },
      { id: 's2', owner: 'p2' as const, x: 50, y: 20, requiredPiece: 'straight-h' as PieceType, placedPiece: null, label: 'Ray ngang' },
      { id: 's3', owner: 'p2' as const, x: 75, y: 35, requiredPiece: 'curve-bl' as PieceType, placedPiece: null, label: 'Cua rẽ' },
      { id: 's4', owner: 'p1' as const, x: 75, y: 65, requiredPiece: 'curve-tl' as PieceType, placedPiece: null, label: 'Cua nối' },
      { id: 's5', owner: 'p1' as const, x: 50, y: 80, requiredPiece: 'bridge' as PieceType, placedPiece: null, label: 'Cầu gỗ' },
      { id: 's6', owner: 'p1' as const, x: 25, y: 75, requiredPiece: 'straight-h' as PieceType, placedPiece: null, label: 'Ray ngang' },
    ],
  },
  {
    level: 3,
    title: 'Chặng 3: Thung Lũng Ngôi Sao ⭐',
    slots: [
      { id: 's1', owner: 'p2' as const, x: 20, y: 20, requiredPiece: 'curve-br' as PieceType, placedPiece: null, label: 'Cua uốn' },
      { id: 's2', owner: 'p2' as const, x: 50, y: 15, requiredPiece: 'bridge' as PieceType, placedPiece: null, label: 'Cầu gỗ' },
      { id: 's3', owner: 'p2' as const, x: 80, y: 30, requiredPiece: 'curve-bl' as PieceType, placedPiece: null, label: 'Cua vòng' },
      { id: 's4', owner: 'p1' as const, x: 80, y: 65, requiredPiece: 'curve-tr' as PieceType, placedPiece: null, label: 'Cua phải' },
      { id: 's5', owner: 'p1' as const, x: 50, y: 85, requiredPiece: 'bridge' as PieceType, placedPiece: null, label: 'Cầu gỗ' },
      { id: 's6', owner: 'p1' as const, x: 20, y: 80, requiredPiece: 'curve-tl' as PieceType, placedPiece: null, label: 'Cua về ga' },
    ],
  },
];

export const TrainCoopGame: React.FC<TrainCoopGameProps> = ({
  player1,
  player2,
  orientation,
  onVictory,
  onScoreUpdate,
  isPaused,
}) => {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [slots, setSlots] = useState<TrackSlot[]>(LEVEL_CONFIGS[0].slots);
  const [trainProgress, setTrainProgress] = useState(0); // 0 to 100%
  const [isTrainRunning, setIsTrainRunning] = useState(false);
  const [selectedPieceP1, setSelectedPieceP1] = useState<PieceType | null>(null);
  const [selectedPieceP2, setSelectedPieceP2] = useState<PieceType | null>(null);
  const [coopScore, setCoopScore] = useState(0);

  const trainIntervalRef = useRef<number | null>(null);

  // Available pieces for players
  const availablePiecesP1: PieceType[] = ['straight-h', 'straight-v', 'curve-tl', 'curve-tr', 'bridge'];
  const availablePiecesP2: PieceType[] = ['straight-h', 'straight-v', 'curve-bl', 'curve-br', 'bridge'];

  // Initialize level
  useEffect(() => {
    const lvl = LEVEL_CONFIGS[currentLevelIdx];
    setSlots(lvl.slots.map(s => ({ ...s, placedPiece: null })));
    setTrainProgress(0);
    setIsTrainRunning(false);
    setSelectedPieceP1(null);
    setSelectedPieceP2(null);
  }, [currentLevelIdx]);

  // Check if all slots in level are filled
  const allFilled = slots.every(s => s.placedPiece !== null);

  useEffect(() => {
    if (allFilled && !isTrainRunning && trainProgress === 0) {
      // Start train!
      setIsTrainRunning(true);
      playTrainWhistle();
      playPoint();

      let prog = 0;
      trainIntervalRef.current = window.setInterval(() => {
        prog += 2;
        setTrainProgress(prog);

        if (prog >= 100) {
          if (trainIntervalRef.current) clearInterval(trainIntervalRef.current);
          setIsTrainRunning(false);
          const nextScore = coopScore + 10;
          setCoopScore(nextScore);
          onScoreUpdate(nextScore, nextScore);

          if (currentLevelIdx + 1 < LEVEL_CONFIGS.length) {
            setTimeout(() => {
              setCurrentLevelIdx(prev => prev + 1);
            }, 1200);
          } else {
            // Victory all levels!
            setTimeout(() => {
              onVictory('coop-win', nextScore, nextScore);
            }, 1000);
          }
        }
      }, 50);
    }

    return () => {
      if (trainIntervalRef.current) clearInterval(trainIntervalRef.current);
    };
  }, [allFilled, isTrainRunning, trainProgress, coopScore, currentLevelIdx, onScoreUpdate, onVictory]);

  const handleSlotClick = (slot: TrackSlot) => {
    if (slot.placedPiece !== null || isTrainRunning || isPaused) return;

    const chosen = slot.owner === 'p1' ? selectedPieceP1 : selectedPieceP2;

    if (!chosen) {
      playBoing();
      return;
    }

    if (chosen === slot.requiredPiece) {
      playPoint();
      setSlots(prev =>
        prev.map(s => (s.id === slot.id ? { ...s, placedPiece: chosen } : s))
      );
      if (slot.owner === 'p1') setSelectedPieceP1(null);
      else setSelectedPieceP2(null);
    } else {
      playBoing();
    }
  };

  const isOpposite = orientation === 'opposite';

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-gradient-to-b from-amber-50 via-emerald-50 to-sky-50 flex flex-col">
      {/* ================= TOP HALF (PLAYER 2) ================= */}
      <div className="flex-1 relative border-b-2 border-dashed border-emerald-300 flex flex-col justify-between p-2">
        {/* Top Info Header (Facing P2 at top edge of screen) */}
        <div
          className={`flex items-center justify-between z-10 transition-transform duration-300 ${
            isOpposite ? 'rotate-180' : ''
          }`}
        >
          <div className="flex items-center gap-1.5 bg-blue-100/90 text-blue-800 px-2.5 py-1 rounded-full text-xs font-bold border border-blue-200 shadow-xs">
            <span className="leading-none">{player2.avatar}</span>
            <span>{player2.name} (Núi Cao)</span>
          </div>

          <div className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-300 shadow-xs">
            {LEVEL_CONFIGS[currentLevelIdx].title}
          </div>
        </div>

        {/* Top Slots Zone */}
        <div className="absolute inset-x-4 top-10 bottom-16 pointer-events-auto">
          {slots
            .filter(s => s.owner === 'p2')
            .map(slot => (
              <button
                key={slot.id}
                onClick={() => handleSlotClick(slot)}
                style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-200 active:scale-95 shadow-xs cursor-pointer ${
                  slot.placedPiece
                    ? 'bg-amber-100 border-amber-500 text-amber-900 ring-2 ring-amber-300'
                    : 'bg-white/95 border-dashed border-blue-400 text-blue-500 hover:bg-blue-50 animate-pulse'
                } ${isOpposite ? 'rotate-180' : ''}`}
              >
                {slot.placedPiece ? (
                  <span className="text-2xl font-black">{ALL_PIECES[slot.placedPiece].emoji}</span>
                ) : (
                  <>
                    <span className="text-lg font-bold opacity-70">
                      {ALL_PIECES[slot.requiredPiece].emoji}
                    </span>
                    <span className="text-[9px] font-semibold">{slot.label}</span>
                  </>
                )}
              </button>
            ))}
        </div>

        {/* Top Player's Piece Toolbox */}
        <div
          className={`z-10 flex items-center justify-center gap-1.5 bg-white/95 backdrop-blur-xs px-2 py-1 rounded-xl border border-blue-200 shadow-xs max-w-fit mx-auto transition-transform duration-300 ${
            isOpposite ? 'rotate-180' : ''
          }`}
        >
          <span className="text-[11px] font-bold text-blue-700 hidden sm:inline">Ray {player2.name}:</span>
          {availablePiecesP2.map(type => (
            <button
              key={type}
              onClick={() => {
                playPop();
                setSelectedPieceP2(type);
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition-all active:scale-90 cursor-pointer ${
                selectedPieceP2 === type
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-300'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200'
              }`}
            >
              <span className="text-base leading-none">{ALL_PIECES[type].emoji}</span>
              <span className="text-[10px] font-bold">{ALL_PIECES[type].name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ================= CENTER TRAIN TRACK & ANIMATION ================= */}
      {isTrainRunning && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 pointer-events-none flex items-center">
          <div
            style={{ left: `${trainProgress}%` }}
            className="absolute -translate-x-1/2 flex items-center gap-1 transition-all duration-75"
          >
            <div className="bg-amber-400 text-amber-950 px-3 py-1 rounded-2xl shadow-xl border-2 border-white font-black text-xl flex items-center gap-1.5 animate-bounce">
              <span>🚂</span>
              <span className="text-sm">Tu Tu Xình Xịch!</span>
              <span>{player2.avatar}</span>
              <span>{player1.avatar}</span>
            </div>
            <span className="text-2xl animate-spin">💨</span>
          </div>
        </div>
      )}

      {/* ================= BOTTOM HALF (PLAYER 1 / BÉ YÊU) ================= */}
      <div className="flex-1 relative flex flex-col justify-between p-3">
        {/* Bottom Slots Zone */}
        <div className="absolute inset-x-4 top-4 bottom-20 pointer-events-auto">
          {slots
            .filter(s => s.owner === 'p1')
            .map(slot => (
              <button
                key={slot.id}
                onClick={() => handleSlotClick(slot)}
                style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-3 transition-all duration-200 active:scale-95 shadow-md ${
                  slot.placedPiece
                    ? 'bg-amber-100 border-amber-500 text-amber-900 ring-2 ring-amber-300'
                    : 'bg-white/90 border-dashed border-rose-400 text-rose-500 hover:bg-rose-50 animate-pulse'
                }`}
              >
                {slot.placedPiece ? (
                  <span className="text-3xl font-black">{ALL_PIECES[slot.placedPiece].emoji}</span>
                ) : (
                  <>
                    <span className="text-xl font-bold opacity-70">
                      {ALL_PIECES[slot.requiredPiece].emoji}
                    </span>
                    <span className="text-[10px] font-semibold">{slot.label}</span>
                  </>
                )}
              </button>
            ))}
        </div>

        {/* Bottom Player's Piece Toolbox */}
        <div className="mt-auto z-10 flex items-center justify-center gap-2 bg-white/90 backdrop-blur-xs p-2 rounded-2xl border border-rose-200 shadow-sm">
          <span className="text-xs font-bold text-rose-700 hidden sm:inline">Mảnh ray của {player1.name}:</span>
          {availablePiecesP1.map(type => (
            <button
              key={type}
              onClick={() => {
                playPop();
                setSelectedPieceP1(type);
              }}
              className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-xl border transition-all active:scale-90 ${
                selectedPieceP1 === type
                  ? 'bg-rose-600 text-white border-rose-700 scale-105 shadow-md ring-2 ring-rose-300'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-200'
              }`}
            >
              <span className="text-xl font-black leading-none">{ALL_PIECES[type].emoji}</span>
              <span className="text-[9px] font-bold mt-0.5">{ALL_PIECES[type].name}</span>
            </button>
          ))}
        </div>

        {/* Bottom Info Footer */}
        <div className="flex items-center justify-between z-10 mt-2">
          <div className="flex items-center gap-1.5 bg-rose-100/90 text-rose-800 px-3 py-1 rounded-full text-xs font-bold border border-rose-200">
            <span>{player1.avatar}</span>
            <span>{player1.name} (Khu Vực Thung Lũng)</span>
          </div>

          <div className="text-xs font-semibold text-slate-500 bg-white/80 px-2.5 py-1 rounded-full border border-slate-200">
            Đã hoàn thành: {slots.filter(s => s.placedPiece !== null).length}/{slots.length} mảnh
          </div>
        </div>
      </div>
    </div>
  );
};
