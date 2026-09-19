import React, { useEffect, useRef, useState, useCallback } from 'react';
import { OrientationMode, PlayerProfile } from '../../types';
import { playCountdown, playHit, playPoint } from '../../utils/audio';

interface AirHockeyGameProps {
  player1: PlayerProfile;
  player2: PlayerProfile;
  orientation: OrientationMode;
  onVictory: (winner: 'p1' | 'p2', score1: number, score2: number) => void;
  onScoreUpdate: (score1: number, score2: number) => void;
  isPaused: boolean;
}

export const AirHockeyGame: React.FC<AirHockeyGameProps> = ({
  player1,
  player2,
  orientation,
  onVictory,
  onScoreUpdate,
  isPaused,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(3);
  const [goalCelebration, setGoalCelebration] = useState<{ scorer: 'p1' | 'p2'; text: string } | null>(null);

  // Mutable game state in ref to run 60fps loop smoothly without react rerenders
  const stateRef = useRef({
    width: 360,
    height: 600,
    puck: { x: 180, y: 300, vx: 0, vy: 0, radius: 18, color: '#f59e0b' },
    paddle1: { x: 180, y: 500, radius: 28, targetX: 180, targetY: 500 },
    paddle2: { x: 180, y: 100, radius: 28, targetX: 180, targetY: 100 },
    obstacles: [
      { x: 90, y: 300, radius: 16, emoji: '🍄' },
      { x: 270, y: 300, radius: 16, emoji: '🍭' },
    ],
    goalWidth: 140,
    isResetting: false,
    p1TouchId: null as number | null,
    p2TouchId: null as number | null,
  });

  // Countdown timer
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
        // Start puck
        const angle = (Math.random() * Math.PI) / 3 - Math.PI / 6;
        const dir = Math.random() > 0.5 ? 1 : -1;
        const speed = 4.5;
        stateRef.current.puck.vx = Math.sin(angle) * speed;
        stateRef.current.puck.vy = Math.cos(angle) * speed * dir;
      } else {
        setCountdown(null);
        clearInterval(timer);
      }
    }, 800);

    return () => clearInterval(timer);
  }, []);

  const resetPuckAfterGoal = useCallback((scorer: 'p1' | 'p2') => {
    const s = stateRef.current;
    s.isResetting = true;
    s.puck.x = s.width / 2;
    s.puck.y = s.height / 2;
    s.puck.vx = 0;
    s.puck.vy = 0;

    setTimeout(() => {
      if (stateRef.current) {
        stateRef.current.isResetting = false;
        const angle = (Math.random() * Math.PI) / 3 - Math.PI / 6;
        const dir = scorer === 'p1' ? -1 : 1; // Send toward whoever conceded
        const speed = 4.5;
        stateRef.current.puck.vx = Math.sin(angle) * speed;
        stateRef.current.puck.vy = Math.cos(angle) * speed * dir;
      }
      setGoalCelebration(null);
    }, 1200);
  }, []);

  // Sync scores with parent
  useEffect(() => {
    onScoreUpdate(score1, score2);
    if (score1 >= 5) {
      onVictory('p1', score1, score2);
    } else if (score2 >= 5) {
      onVictory('p2', score1, score2);
    }
  }, [score1, score2, onVictory, onScoreUpdate]);

  // Main canvas loop & resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const s = stateRef.current;
      s.width = rect.width;
      s.height = rect.height;
      s.goalWidth = Math.min(rect.width * 0.45, 160);

      // Re-center if initializing
      if (s.puck.vx === 0 && s.puck.vy === 0) {
        s.puck.x = rect.width / 2;
        s.puck.y = rect.height / 2;
        s.paddle1.x = rect.width / 2;
        s.paddle1.y = rect.height * 0.82;
        s.paddle2.x = rect.width / 2;
        s.paddle2.y = rect.height * 0.18;
      }

      s.obstacles = [
        { x: rect.width * 0.25, y: rect.height / 2, radius: 18, emoji: '🍄' },
        { x: rect.width * 0.75, y: rect.height / 2, radius: 18, emoji: '🍭' },
      ];
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const render = () => {
      if (!isPaused && countdown === null) {
        const s = stateRef.current;
        const w = s.width;
        const h = s.height;

        // Smooth paddle interpolation
        s.paddle1.x += (s.paddle1.targetX - s.paddle1.x) * 0.4;
        s.paddle1.y += (s.paddle1.targetY - s.paddle1.y) * 0.4;
        s.paddle2.x += (s.paddle2.targetX - s.paddle2.x) * 0.4;
        s.paddle2.y += (s.paddle2.targetY - s.paddle2.y) * 0.4;

        // Paddle boundaries (P1 stays in bottom half, P2 stays in top half)
        s.paddle1.x = Math.max(s.paddle1.radius, Math.min(w - s.paddle1.radius, s.paddle1.x));
        s.paddle1.y = Math.max(h / 2 + s.paddle1.radius + 10, Math.min(h - s.paddle1.radius, s.paddle1.y));

        s.paddle2.x = Math.max(s.paddle2.radius, Math.min(w - s.paddle2.radius, s.paddle2.x));
        s.paddle2.y = Math.max(s.paddle2.radius, Math.min(h / 2 - s.paddle2.radius - 10, s.paddle2.y));

        if (!s.isResetting) {
          // Puck physics movement
          s.puck.x += s.puck.vx;
          s.puck.y += s.puck.vy;

          // Friction
          s.puck.vx *= 0.992;
          s.puck.vy *= 0.992;

          // Left / Right wall bounce
          if (s.puck.x - s.puck.radius <= 0) {
            s.puck.x = s.puck.radius;
            s.puck.vx = -s.puck.vx * 0.95;
            playHit(0.5);
          } else if (s.puck.x + s.puck.radius >= w) {
            s.puck.x = w - s.puck.radius;
            s.puck.vx = -s.puck.vx * 0.95;
            playHit(0.5);
          }

          // Goal checking
          const goalLeft = (w - s.goalWidth) / 2;
          const goalRight = (w + s.goalWidth) / 2;

          // Top Goal (Player 1 scores!)
          if (s.puck.y - s.puck.radius <= 0) {
            if (s.puck.x >= goalLeft && s.puck.x <= goalRight) {
              // Goal for P1!
              playPoint();
              setScore1(prev => prev + 1);
              setGoalCelebration({ scorer: 'p1', text: `VÀO! ${player1.name} ghi bàn! ⚽` });
              resetPuckAfterGoal('p1');
            } else {
              s.puck.y = s.puck.radius;
              s.puck.vy = -s.puck.vy * 0.95;
              playHit(0.6);
            }
          }

          // Bottom Goal (Player 2 scores!)
          if (s.puck.y + s.puck.radius >= h) {
            if (s.puck.x >= goalLeft && s.puck.x <= goalRight) {
              // Goal for P2!
              playPoint();
              setScore2(prev => prev + 1);
              setGoalCelebration({ scorer: 'p2', text: `VÀO! ${player2.name} ghi bàn! ⚽` });
              resetPuckAfterGoal('p2');
            } else {
              s.puck.y = h - s.puck.radius;
              s.puck.vy = -s.puck.vy * 0.95;
              playHit(0.6);
            }
          }

          // Collision with Paddle 1 (Bottom)
          const dx1 = s.puck.x - s.paddle1.x;
          const dy1 = s.puck.y - s.paddle1.y;
          const dist1 = Math.hypot(dx1, dy1);
          const minDist1 = s.puck.radius + s.paddle1.radius;

          if (dist1 < minDist1) {
            const angle = Math.atan2(dy1, dx1);
            s.puck.x = s.paddle1.x + Math.cos(angle) * minDist1;
            s.puck.y = s.paddle1.y + Math.sin(angle) * minDist1;
            const speed = Math.max(6, Math.hypot(s.puck.vx, s.puck.vy) * 1.05);
            s.puck.vx = Math.cos(angle) * speed;
            s.puck.vy = Math.sin(angle) * speed;
            playHit(0.9);
          }

          // Collision with Paddle 2 (Top)
          const dx2 = s.puck.x - s.paddle2.x;
          const dy2 = s.puck.y - s.paddle2.y;
          const dist2 = Math.hypot(dx2, dy2);
          const minDist2 = s.puck.radius + s.paddle2.radius;

          if (dist2 < minDist2) {
            const angle = Math.atan2(dy2, dx2);
            s.puck.x = s.paddle2.x + Math.cos(angle) * minDist2;
            s.puck.y = s.paddle2.y + Math.sin(angle) * minDist2;
            const speed = Math.max(6, Math.hypot(s.puck.vx, s.puck.vy) * 1.05);
            s.puck.vx = Math.cos(angle) * speed;
            s.puck.vy = Math.sin(angle) * speed;
            playHit(0.9);
          }

          // Collision with center obstacles (mushrooms)
          s.obstacles.forEach(obs => {
            const ox = s.puck.x - obs.x;
            const oy = s.puck.y - obs.y;
            const oDist = Math.hypot(ox, oy);
            const oMinDist = s.puck.radius + obs.radius;
            if (oDist < oMinDist) {
              const angle = Math.atan2(oy, ox);
              s.puck.x = obs.x + Math.cos(angle) * oMinDist;
              s.puck.y = obs.y + Math.sin(angle) * oMinDist;
              const spd = Math.max(5, Math.hypot(s.puck.vx, s.puck.vy) * 1.1);
              s.puck.vx = Math.cos(angle) * spd;
              s.puck.vy = Math.sin(angle) * spd;
              playHit(0.7);
            }
          });
        }
      }

      // DRAW CANVAS
      const s = stateRef.current;
      const w = s.width;
      const h = s.height;

      ctx.clearRect(0, 0, w, h);

      // Top Half Court (Player 2)
      ctx.fillStyle = '#f0f9ff';
      ctx.fillRect(0, 0, w, h / 2);

      // Bottom Half Court (Player 1)
      ctx.fillStyle = '#fff1f2';
      ctx.fillRect(0, h / 2, w, h / 2);

      // Center Line & Circle
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Top Goal
      const goalLeft = (w - s.goalWidth) / 2;
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.roundRect(goalLeft, 0, s.goalWidth, 8, [0, 0, 8, 8]);
      ctx.fill();

      // Bottom Goal
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.roundRect(goalLeft, h - 8, s.goalWidth, 8, [8, 8, 0, 0]);
      ctx.fill();

      // Obstacles
      s.obstacles.forEach(obs => {
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obs.emoji, obs.x, obs.y);
      });

      // Paddle 2 (Top Player)
      ctx.fillStyle = player2.color || '#3b82f6';
      ctx.beginPath();
      ctx.arc(s.paddle2.x, s.paddle2.y, s.paddle2.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(player2.avatar, s.paddle2.x, s.paddle2.y);

      // Paddle 1 (Bottom Player)
      ctx.fillStyle = player1.color || '#f43f5e';
      ctx.beginPath();
      ctx.arc(s.paddle1.x, s.paddle1.y, s.paddle1.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(player1.avatar, s.paddle1.x, s.paddle1.y);

      // Puck
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 8;
      ctx.fillStyle = s.puck.color;
      ctx.beginPath();
      ctx.arc(s.puck.x, s.puck.y, s.puck.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⭐', s.puck.x, s.puck.y);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, [isPaused, countdown, player1, player2, resetPuckAfterGoal]);

  // Touch / Mouse controls supporting multi-touch!
  const updatePaddleFromCoord = (clientX: number, clientY: number, touchId: number | null = null) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const s = stateRef.current;

    // Determine if top or bottom half
    if (y < s.height / 2) {
      s.paddle2.targetX = x;
      s.paddle2.targetY = y;
      if (touchId !== null) s.p2TouchId = touchId;
    } else {
      s.paddle1.targetX = x;
      s.paddle1.targetY = y;
      if (touchId !== null) s.p1TouchId = touchId;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      updatePaddleFromCoord(t.clientX, t.clientY, t.identifier);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const s = stateRef.current;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) continue;
      const x = t.clientX - rect.left;
      const y = t.clientY - rect.top;

      if (t.identifier === s.p1TouchId || y >= s.height / 2) {
        s.paddle1.targetX = x;
        s.paddle1.targetY = y;
      }
      if (t.identifier === s.p2TouchId || y < s.height / 2) {
        s.paddle2.targetX = x;
        s.paddle2.targetY = y;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      updatePaddleFromCoord(e.clientX, e.clientY);
    }
  };

  const isOpposite = orientation === 'opposite';

  return (
    <div ref={containerRef} className="relative w-full h-full select-none overflow-hidden touch-none bg-slate-100">
      {/* Top Player Name & Goal Badge (rotated 180° if opposite mode) */}
      <div
        className={`absolute top-2 inset-x-0 z-20 flex justify-center pointer-events-none transition-transform duration-300 ${
          isOpposite ? 'rotate-180' : ''
        }`}
      >
        <div className="bg-blue-600/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
          <span>{player2.avatar}</span>
          <span>{player2.name}</span>
          <span className="bg-white text-blue-600 text-[10px] px-1.5 py-0.2 rounded-full font-black">
            Khung thành của {player2.name}
          </span>
        </div>
      </div>

      {/* Bottom Player Name & Goal Badge */}
      <div className="absolute bottom-2 inset-x-0 z-20 flex justify-center pointer-events-none">
        <div className="bg-rose-600/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
          <span>{player1.avatar}</span>
          <span>{player1.name}</span>
          <span className="bg-white text-rose-600 text-[10px] px-1.5 py-0.2 rounded-full font-black">
            Khung thành của {player1.name}
          </span>
        </div>
      </div>

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs pointer-events-none">
          <div className="text-7xl font-black text-amber-300 drop-shadow-lg animate-ping">
            {countdown === 0 ? 'BẮT ĐẦU!' : countdown}
          </div>
        </div>
      )}

      {/* Goal Celebration Toast */}
      {goalCelebration && (
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-35 flex justify-center pointer-events-none">
          <div className="bg-amber-400 text-slate-900 font-black text-lg px-6 py-2 rounded-2xl shadow-xl border-2 border-white animate-bounce">
            {goalCelebration.text}
          </div>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onMouseMove={handleMouseMove}
        onMouseDown={e => updatePaddleFromCoord(e.clientX, e.clientY)}
        className="w-full h-full block cursor-pointer"
      />
    </div>
  );
};
