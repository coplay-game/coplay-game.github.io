import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameId, OrientationMode, PlayerProfile, GameRecord } from './types';
import {
  loadPlayers,
  savePlayers,
  loadHistory,
  saveGameRecord,
  clearHistory,
  loadOrientation,
  saveOrientation,
  getRandomPlayerPair,
} from './utils/storage';
import {
  initSoundPreference,
  isSoundEnabled,
  setSoundEnabled,
} from './utils/audio';

import { PortalHeader } from './components/PortalHeader';
import { PortalHome, GAME_CATALOG } from './components/PortalHome';
import { PauseModal } from './components/PauseModal';
import { VictoryModal } from './components/VictoryModal';
import { RulesModal } from './components/RulesModal';

import { AirHockeyGame } from './components/games/AirHockeyGame';
import { TrainCoopGame } from './components/games/TrainCoopGame';
import { FarmRaceGame } from './components/games/FarmRaceGame';
import { CandyMonsterGame } from './components/games/CandyMonsterGame';
import { SpotMatchGame } from './components/games/SpotMatchGame';

export default function App() {
  // Sound & Orientation
  const [soundOn, setSoundOn] = useState(true);
  const [orientation, setOrientation] = useState<OrientationMode>('opposite');

  // Players
  const [player1, setPlayer1] = useState<PlayerProfile>(() => loadPlayers().p1);
  const [player2, setPlayer2] = useState<PlayerProfile>(() => loadPlayers().p2);

  // Active Game State
  const [activeGameId, setActiveGameId] = useState<GameId | null>(null);
  const [activeGameOptions, setActiveGameOptions] = useState<{ initialLevel?: number; fixedDifficultyMode?: boolean }>({});
  const [isPaused, setIsPaused] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Scores in current game
  const [scoreP1, setScoreP1] = useState(0);
  const [scoreP2, setScoreP2] = useState(0);

  // Game Victory state
  const [victoryState, setVictoryState] = useState<{
    isOpen: boolean;
    winner: 'p1' | 'p2' | 'coop-win' | 'draw';
  }>({
    isOpen: false,
    winner: 'p1',
  });

  // Game session timer for history
  const gameStartTimeRef = useRef<number>(Date.now());

  // Game History
  const [history, setHistory] = useState<GameRecord[]>(() => loadHistory());

  // Initialization
  useEffect(() => {
    initSoundPreference();
    setSoundOn(isSoundEnabled());
    setOrientation(loadOrientation());
  }, []);

  // Persist players
  useEffect(() => {
    savePlayers(player1, player2);
  }, [player1, player2]);

  // Persist orientation
  const handleToggleOrientation = () => {
    const nextMode: OrientationMode = orientation === 'opposite' ? 'side-by-side' : 'opposite';
    setOrientation(nextMode);
    saveOrientation(nextMode);
  };

  // Sound toggle
  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  // Launch a game with fresh random animal characters
  const handleSelectGame = (gameId: GameId, options = {}) => {
    const pair = getRandomPlayerPair();
    setPlayer1(pair.p1);
    setPlayer2(pair.p2);

    setActiveGameId(gameId);
    setActiveGameOptions(options);
    setScoreP1(0);
    setScoreP2(0);
    setIsPaused(false);
    setVictoryState({ isOpen: false, winner: 'p1' });
    gameStartTimeRef.current = Date.now();
  };

  // Update real-time score
  const handleScoreUpdate = useCallback((s1: number, s2: number) => {
    setScoreP1(s1);
    setScoreP2(s2);
  }, []);

  // Victory reached
  const handleVictory = useCallback(
    (winner: 'p1' | 'p2' | 'coop-win', finalS1: number, finalS2: number) => {
      setScoreP1(finalS1);
      setScoreP2(finalS2);
      setVictoryState({ isOpen: true, winner });

      // Save match to history
      const currentGameMeta = GAME_CATALOG.find(g => g.id === activeGameId);
      const gameTitle = currentGameMeta?.title || 'Trò Chơi';
      const durationSec = Math.round((Date.now() - gameStartTimeRef.current) / 1000);

      const winningPlayer = winner === 'p1' ? player1 : winner === 'p2' ? player2 : null;

      const record: GameRecord = {
        id: Math.random().toString(),
        gameId: activeGameId || 'spot-match',
        gameTitle,
        winner,
        winnerName: winningPlayer ? `${winningPlayer.name} (${winningPlayer.animal})` : 'Cả hai cùng thắng',
        winnerAvatar: winningPlayer ? winningPlayer.avatar : '🤝',
        scoreP1: finalS1,
        scoreP2: finalS2,
        durationSec,
        date: new Date().toLocaleDateString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
        }),
      };

      saveGameRecord(record);
      setHistory(loadHistory());
    },
    [activeGameId, player1, player2]
  );

  // Pause & Exit actions
  const handlePause = () => setIsPaused(true);
  const handleResume = () => setIsPaused(false);

  const handleRestart = () => {
    const pair = getRandomPlayerPair();
    setPlayer1(pair.p1);
    setPlayer2(pair.p2);

    setIsPaused(false);
    setVictoryState({ isOpen: false, winner: 'p1' });
    setScoreP1(0);
    setScoreP2(0);
    gameStartTimeRef.current = Date.now();
    // Remount game component by momentarily resetting
    const cur = activeGameId;
    setActiveGameId(null);
    setTimeout(() => {
      setActiveGameId(cur);
    }, 50);
  };

  const handleFinishAndScore = () => {
    setIsPaused(false);
    let winner: 'p1' | 'p2' | 'coop-win' = 'p1';
    if (scoreP2 > scoreP1) winner = 'p2';
    else if (scoreP1 > scoreP2) winner = 'p1';
    else winner = Math.random() > 0.5 ? 'p1' : 'p2';
    handleVictory(winner, scoreP1, scoreP2);
  };

  const handleGoHome = () => {
    setIsPaused(false);
    setVictoryState({ isOpen: false, winner: 'p1' });
    setActiveGameId(null);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const currentGameMeta = GAME_CATALOG.find(g => g.id === activeGameId);

  return (
    <div className="w-full h-screen flex flex-col bg-slate-50 overflow-hidden text-slate-900">
      {/* Top Header */}
      {!activeGameId ? (
        <PortalHeader
          inGame={false}
          onShowHelp={() => setIsRulesOpen(true)}
          soundEnabled={soundOn}
          onToggleSound={handleToggleSound}
          orientation={orientation}
          onToggleOrientation={handleToggleOrientation}
        />
      ) : (
        <PortalHeader
          inGame={true}
          activeGameId={activeGameId}
          onPause={handlePause}
          soundEnabled={soundOn}
          onToggleSound={handleToggleSound}
          orientation={orientation}
          onToggleOrientation={handleToggleOrientation}
          player1={player1}
          player2={player2}
          scoreP1={scoreP1}
          scoreP2={scoreP2}
        />
      )}

      {/* Main Container */}
      <main className="flex-1 relative w-full h-full overflow-hidden">
        {!activeGameId ? (
          <div className="w-full h-full overflow-y-auto">
            <PortalHome
              player1={player1}
              player2={player2}
              onUpdatePlayer1={setPlayer1}
              onUpdatePlayer2={setPlayer2}
              onSelectGame={handleSelectGame}
              history={history}
              onClearHistory={handleClearHistory}
              onOpenRules={() => setIsRulesOpen(true)}
            />
          </div>
        ) : (
          <div className="w-full h-full relative">
            {activeGameId === 'air-hockey' && (
              <AirHockeyGame
                player1={player1}
                player2={player2}
                orientation={orientation}
                onVictory={handleVictory}
                onScoreUpdate={handleScoreUpdate}
                isPaused={isPaused}
              />
            )}

            {activeGameId === 'train-coop' && (
              <TrainCoopGame
                player1={player1}
                player2={player2}
                orientation={orientation}
                onVictory={handleVictory}
                onScoreUpdate={handleScoreUpdate}
                isPaused={isPaused}
              />
            )}

            {activeGameId === 'farm-race' && (
              <FarmRaceGame
                player1={player1}
                player2={player2}
                orientation={orientation}
                onVictory={handleVictory}
                onScoreUpdate={handleScoreUpdate}
                isPaused={isPaused}
              />
            )}

            {activeGameId === 'candy-monster' && (
              <CandyMonsterGame
                player1={player1}
                player2={player2}
                orientation={orientation}
                onVictory={handleVictory}
                onScoreUpdate={handleScoreUpdate}
                isPaused={isPaused}
              />
            )}

            {activeGameId === 'spot-match' && (
              <SpotMatchGame
                player1={player1}
                player2={player2}
                orientation={orientation}
                onVictory={handleVictory}
                onScoreUpdate={handleScoreUpdate}
                isPaused={isPaused}
                initialLevel={activeGameOptions.initialLevel || 1}
                fixedDifficultyMode={activeGameOptions.fixedDifficultyMode || false}
              />
            )}
          </div>
        )}
      </main>

      {/* Pause Modal */}
      <PauseModal
        isOpen={isPaused}
        onResume={handleResume}
        onRestart={handleRestart}
        onFinishAndScore={handleFinishAndScore}
        onGoHome={handleGoHome}
        scoreP1={scoreP1}
        scoreP2={scoreP2}
        player1={player1}
        player2={player2}
        isCoop={currentGameMeta?.isCoop}
      />

      {/* Victory Celebration Modal */}
      <VictoryModal
        isOpen={victoryState.isOpen}
        winner={victoryState.winner}
        player1={player1}
        player2={player2}
        scoreP1={scoreP1}
        scoreP2={scoreP2}
        onRestart={handleRestart}
        onGoHome={handleGoHome}
        gameTitle={currentGameMeta?.title || 'Trò Chơi'}
      />

      {/* Rules Guide Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </div>
  );
}
