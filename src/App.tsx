/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import CountdownOverlay from './components/CountdownOverlay';
import GameOverModal from './components/GameOverModal';
import GameScreen from './components/GameScreen';
import HomeScreen from './components/HomeScreen';
import { CUTE_ANIMALS, getRandomAnimals } from './data/animals';
import { Animal, GameHistoryItem, GameMode } from './types';
import { setSoundEnabled, setSoundVolume } from './utils/audio';
import {
  clearGameHistory,
  loadGameHistory,
  loadSavedSettings,
  saveGameHistoryRecord,
  saveSettings,
} from './utils/storage';

export default function App() {
  const [screen, setScreen] = useState<'home' | 'countdown' | 'playing' | 'gameover'>('home');
  const [startingRound, setStartingRound] = useState<number>(1);
  const [keepDifficulty, setKeepDifficulty] = useState<boolean>(false);

  // Active game session
  const [player1Animal, setPlayer1Animal] = useState<Animal>(CUTE_ANIMALS[0]);
  const [player2Animal, setPlayer2Animal] = useState<Animal>(CUTE_ANIMALS[1]);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [finalScore, setFinalScore] = useState<{
    p1: number;
    p2: number;
    rounds: number;
    duration: number;
    winner: 1 | 2 | 'draw';
  }>({
    p1: 0,
    p2: 0,
    rounds: 0,
    duration: 0,
    winner: 'draw',
  });

  const [history, setHistory] = useState<GameHistoryItem[]>([]);

  // Load preferences and history on initial mount
  useEffect(() => {
    const loadedSettings = loadSavedSettings();
    setStartingRound(loadedSettings.startingRound);
    setKeepDifficulty(loadedSettings.keepDifficulty);
    setSoundEnabled(loadedSettings.soundEnabled);
    setSoundVolume(loadedSettings.volume);
    setHistory(loadGameHistory());
  }, []);

  // Save settings when changed
  const handleSetStartingRound = (round: number) => {
    setStartingRound(round);
    const currentSettings = loadSavedSettings();
    saveSettings({
      ...currentSettings,
      startingRound: round,
    });
  };

  const handleSetKeepDifficulty = (keep: boolean) => {
    setKeepDifficulty(keep);
    const currentSettings = loadSavedSettings();
    saveSettings({
      ...currentSettings,
      keepDifficulty: keep,
    });
  };

  const handleStartGame = () => {
    // Pick 2 distinct cute animals for this game
    const [a1, a2] = getRandomAnimals();
    setPlayer1Animal(a1);
    setPlayer2Animal(a2);
    setScreen('countdown');
  };

  const handleCountdownFinished = () => {
    setGameStartTime(Date.now());
    setScreen('playing');
  };

  const handleGameOver = (p1Score: number, p2Score: number, roundsPlayed: number) => {
    const elapsedSec = Math.max(1, Math.round((Date.now() - gameStartTime) / 1000));
    const winner: 1 | 2 | 'draw' =
      p1Score > p2Score ? 1 : p2Score > p1Score ? 2 : 'draw';

    const now = new Date();
    const dateStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}`;

    const mode: GameMode = keepDifficulty ? 'fixed' : 'progressive';

    const record: GameHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      dateStr,
      durationSec: elapsedSec,
      mode,
      targetIcons: startingRound + 2,
      player1: {
        animal: player1Animal,
        score: p1Score,
      },
      player2: {
        animal: player2Animal,
        score: p2Score,
      },
      winner,
      roundsPlayed: Math.max(1, roundsPlayed),
    };

    const updated = saveGameHistoryRecord(record);
    setHistory(updated);

    setFinalScore({
      p1: p1Score,
      p2: p2Score,
      rounds: Math.max(1, roundsPlayed),
      duration: elapsedSec,
      winner,
    });

    setScreen('gameover');
  };

  const handleClearHistory = () => {
    clearGameHistory();
    setHistory([]);
  };

  return (
    <div className="w-full h-full min-h-screen bg-slate-50 select-none">
      {/* Home screen */}
      {screen === 'home' && (
        <HomeScreen
          startingRound={startingRound}
          setStartingRound={handleSetStartingRound}
          keepDifficulty={keepDifficulty}
          setKeepDifficulty={handleSetKeepDifficulty}
          onStartGame={handleStartGame}
          history={history}
          onClearHistory={handleClearHistory}
        />
      )}

      {/* Countdown 3-2-1 */}
      {screen === 'countdown' && (
        <CountdownOverlay onComplete={handleCountdownFinished} />
      )}

      {/* Main Co-play Game Board */}
      {screen === 'playing' && (
        <GameScreen
          key={`game-${gameStartTime}`}
          player1Animal={player1Animal}
          player2Animal={player2Animal}
          startingRound={startingRound}
          keepDifficulty={keepDifficulty}
          onGameOver={handleGameOver}
        />
      )}

      {/* Game Over modal with fireworks and stats */}
      {screen === 'gameover' && (
        <GameOverModal
          player1={{ animal: player1Animal, score: finalScore.p1 }}
          player2={{ animal: player2Animal, score: finalScore.p2 }}
          winner={finalScore.winner}
          durationSec={finalScore.duration}
          mode={keepDifficulty ? 'fixed' : 'progressive'}
          roundsPlayed={finalScore.rounds}
          onPlayAgain={handleStartGame}
          onGoHome={() => setScreen('home')}
        />
      )}
    </div>
  );
}
