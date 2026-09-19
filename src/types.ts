export type GameId = 'air-hockey' | 'train-coop' | 'farm-race' | 'candy-monster' | 'spot-match';

export type OrientationMode = 'opposite' | 'side-by-side';

export interface PlayerProfile {
  id: 'p1' | 'p2';
  name: string;
  animal: string;
  avatar: string;
  color: string;
  bgLight: string;
  textColor: string;
}

export interface GameRecord {
  id: string;
  gameId: GameId;
  gameTitle: string;
  winner: 'p1' | 'p2' | 'coop-win' | 'draw';
  winnerName: string;
  winnerAvatar: string;
  scoreP1: number;
  scoreP2: number;
  durationSec: number;
  date: string;
  mode?: string;
}

export interface GameMeta {
  id: GameId;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  badgeColor: string;
  iconName: string;
  coverEmoji: string;
  bgColor: string;
  borderColor: string;
  isCoop?: boolean;
}
