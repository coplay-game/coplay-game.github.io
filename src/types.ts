export type GameMode = 'progressive' | 'fixed';

export type PlayerId = 1 | 2;

export interface Animal {
  id: string;
  name: string;
  emoji: string;
  faIcon: string;
  color: string;
  badgeBg: string;
}

export interface GameIconItem {
  id: string;
  faClass: string;
  name: string;
  color: string;
}

export interface PlacedIcon extends GameIconItem {
  x: number; // percentage from center (-50 to 50 or 0 to 100)
  y: number; // percentage from center
  size: number; // in percentage of circle diameter
  rotation: number; // deg
  glyphSizeCqw?: number; // font size in container query units
}

export interface GameHistoryItem {
  id: string;
  timestamp: number;
  dateStr: string;
  durationSec: number;
  mode: GameMode;
  targetIcons: number;
  player1: {
    animal: Animal;
    score: number;
  };
  player2: {
    animal: Animal;
    score: number;
  };
  winner: 1 | 2 | 'draw';
  roundsPlayed: number;
}
