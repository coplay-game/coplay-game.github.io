import { GameRecord, OrientationMode, PlayerProfile } from '../types';

export const ANIMAL_AVATARS = [
  { animal: 'Chuột Xanh', avatar: '🐭', color: '#06b6d4', bgLight: 'bg-cyan-50', textColor: 'text-cyan-700' },
  { animal: 'Voi Xám', avatar: '🐘', color: '#64748b', bgLight: 'bg-slate-50', textColor: 'text-slate-700' },
  { animal: 'Mèo Béo', avatar: '🐱', color: '#f59e0b', bgLight: 'bg-amber-50', textColor: 'text-amber-700' },
  { animal: 'Ngựa Hồng', avatar: '🦄', color: '#ec4899', bgLight: 'bg-pink-50', textColor: 'text-pink-700' },
  { animal: 'Dê Béo', avatar: '🐐', color: '#10b981', bgLight: 'bg-emerald-50', textColor: 'text-emerald-700' },
  { animal: 'Gấu Nâu', avatar: '🐻', color: '#d97706', bgLight: 'bg-amber-50', textColor: 'text-amber-800' },
  { animal: 'Cún Đốm', avatar: '🐶', color: '#3b82f6', bgLight: 'bg-blue-50', textColor: 'text-blue-700' },
  { animal: 'Sư Tử Vàng', avatar: '🦁', color: '#eab308', bgLight: 'bg-yellow-50', textColor: 'text-yellow-800' },
  { animal: 'Cáo Cam', avatar: '🦊', color: '#f97316', bgLight: 'bg-orange-50', textColor: 'text-orange-700' },
  { animal: 'Heo Lười', avatar: '🐷', color: '#fb7185', bgLight: 'bg-rose-50', textColor: 'text-rose-700' },
  { animal: 'Khỉ Con', avatar: '🐵', color: '#b45309', bgLight: 'bg-amber-50', textColor: 'text-amber-800' },
  { animal: 'Khủng Long Xanh', avatar: '🦖', color: '#84cc16', bgLight: 'bg-lime-50', textColor: 'text-lime-700' },
  { animal: 'Chim Cánh Cụt', avatar: '🐧', color: '#6366f1', bgLight: 'bg-indigo-50', textColor: 'text-indigo-700' },
  { animal: 'Gấu Trúc', avatar: '🐼', color: '#0f766e', bgLight: 'bg-teal-50', textColor: 'text-teal-800' },
  { animal: 'Cừu Bông', avatar: '🐑', color: '#8b5cf6', bgLight: 'bg-purple-50', textColor: 'text-purple-700' },
  { animal: 'Ếch Cốm', avatar: '🐸', color: '#22c55e', bgLight: 'bg-green-50', textColor: 'text-green-700' },
  { animal: 'Thỏ Trắng', avatar: '🐰', color: '#f43f5e', bgLight: 'bg-rose-50', textColor: 'text-rose-700' },
  { animal: 'Hổ Vằn', avatar: '🐯', color: '#ea580c', bgLight: 'bg-orange-50', textColor: 'text-orange-800' },
  { animal: 'Vịt Vàng', avatar: '🦆', color: '#ca8a04', bgLight: 'bg-yellow-50', textColor: 'text-yellow-700' },
  { animal: 'Ong Chăm', avatar: '🐝', color: '#eab308', bgLight: 'bg-amber-50', textColor: 'text-amber-700' },
];

export function getRandomPlayerPair(): { p1: PlayerProfile; p2: PlayerProfile } {
  const shuffled = [...ANIMAL_AVATARS].sort(() => Math.random() - 0.5);
  const a1 = shuffled[0];
  const a2 = shuffled[1];

  const p1: PlayerProfile = {
    id: 'p1',
    name: a1.animal,
    animal: a1.animal,
    avatar: a1.avatar,
    color: a1.color,
    bgLight: a1.bgLight,
    textColor: a1.textColor,
  };

  const p2: PlayerProfile = {
    id: 'p2',
    name: a2.animal,
    animal: a2.animal,
    avatar: a2.avatar,
    color: a2.color,
    bgLight: a2.bgLight,
    textColor: a2.textColor,
  };

  return { p1, p2 };
}

const defaultPair = getRandomPlayerPair();
export const DEFAULT_PLAYER_1: PlayerProfile = defaultPair.p1;
export const DEFAULT_PLAYER_2: PlayerProfile = defaultPair.p2;

const STORAGE_KEY_PLAYERS = 'coplay_players_v1';
const STORAGE_KEY_HISTORY = 'coplay_history_v1';
const STORAGE_KEY_ORIENTATION = 'coplay_orientation_v1';

export function loadPlayers(): { p1: PlayerProfile; p2: PlayerProfile } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLAYERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.p1 && parsed.p2) return parsed;
    }
  } catch {
    // fallback
  }
  return { p1: DEFAULT_PLAYER_1, p2: DEFAULT_PLAYER_2 };
}

export function savePlayers(p1: PlayerProfile, p2: PlayerProfile) {
  try {
    localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify({ p1, p2 }));
  } catch {
    // ignore
  }
}

export function loadHistory(): GameRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveGameRecord(record: GameRecord) {
  try {
    const history = loadHistory();
    const updated = [record, ...history].slice(0, 25);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  } catch {
    // ignore
  }
}

export function loadOrientation(): OrientationMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORIENTATION);
    if (raw === 'opposite' || raw === 'side-by-side') return raw;
  } catch {
    // fallback
  }
  return 'opposite';
}

export function saveOrientation(mode: OrientationMode) {
  try {
    localStorage.setItem(STORAGE_KEY_ORIENTATION, mode);
  } catch {
    // ignore
  }
}
