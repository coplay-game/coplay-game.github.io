import { useEffect, useState } from 'react';
import { playGoSound, playTickSound, unlockAudioOnUserGesture } from '../utils/audio';

interface CountdownOverlayProps {
  onComplete: () => void;
}

export default function CountdownOverlay({ onComplete }: CountdownOverlayProps) {
  const [count, setCount] = useState<number | string>(3);

  useEffect(() => {
    unlockAudioOnUserGesture();
    playTickSound();
    const t1 = setTimeout(() => {
      setCount(2);
      playTickSound();
    }, 1000);

    const t2 = setTimeout(() => {
      setCount(1);
      playTickSound();
    }, 2000);

    const t3 = setTimeout(() => {
      setCount('SẴN SÀNG!');
      playGoSound();
    }, 3000);

    const t4 = setTimeout(() => {
      onComplete();
    }, 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-amber-950/60 backdrop-blur-md px-4">
      <div className="flex flex-col items-center justify-center animate-bounce">
        <div
          className={`transition-all duration-300 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-6 sm:border-8 border-white shadow-2xl flex items-center justify-center select-none overflow-hidden ${
            typeof count === 'number'
              ? 'w-44 h-44 sm:w-52 sm:h-52'
              : 'w-52 h-52 sm:w-64 sm:h-64'
          }`}
        >
          {typeof count === 'number' ? (
            <span className="text-7xl sm:text-8xl font-black text-amber-950 drop-shadow-xs">
              {count}
            </span>
          ) : (
            <div className="flex flex-col items-center justify-center px-3">
              <span className="text-3xl sm:text-4xl mb-1">🚀</span>
              <span className="text-xl sm:text-2xl font-black text-amber-950 tracking-wide uppercase text-center leading-tight">
                SẴN SÀNG!
              </span>
            </div>
          )}
        </div>
        <p className="mt-6 text-white text-xl sm:text-2xl font-bold tracking-wide drop-shadow-md text-center">
          Hai bé hãy sẵn sàng!
        </p>
      </div>
    </div>
  );
}
