import { useEffect, useState } from 'react';
import { playGoSound, playTickSound } from '../utils/audio';

interface CountdownOverlayProps {
  onComplete: () => void;
}

export default function CountdownOverlay({ onComplete }: CountdownOverlayProps) {
  const [count, setCount] = useState<number | string>(3);

  useEffect(() => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-amber-950/60 backdrop-blur-md">
      <div className="flex flex-col items-center justify-center animate-bounce">
        <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-8 border-white shadow-2xl flex items-center justify-center text-amber-900 font-extrabold text-6xl tracking-wider select-none">
          {count}
        </div>
        <p className="mt-6 text-white text-2xl font-bold tracking-wide drop-shadow-md">
          Hai bé hãy sẵn sàng!
        </p>
      </div>
    </div>
  );
}
