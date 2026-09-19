import { GameHistoryItem } from '../types';

const HISTORY_STORAGE_KEY = 'tim_hinh_giong_nhau_history_v1';
const SETTINGS_STORAGE_KEY = 'tim_hinh_giong_nhau_settings_v1';

export interface SavedSettings {
  startingRound: number;
  keepDifficulty: boolean;
  soundEnabled: boolean;
  volume: number; // 0.0 to 1.0
}

export function loadGameHistory(): GameHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load game history', err);
    return [];
  }
}

export function saveGameHistoryRecord(record: GameHistoryItem): GameHistoryItem[] {
  try {
    const current = loadGameHistory();
    // Keep 20 most recent games
    const updated = [record, ...current].slice(0, 20);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save game history record', err);
    return [];
  }
}

export function clearGameHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear game history', err);
  }
}

export function loadSavedSettings(): SavedSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return { startingRound: 1, keepDifficulty: false, soundEnabled: true, volume: 0.6 };
    }
    const parsed = JSON.parse(raw);
    const volume = typeof parsed.volume === 'number' ? Math.max(0, Math.min(1, parsed.volume)) : 0.6;
    return {
      startingRound: typeof parsed.startingRound === 'number' ? Math.max(1, Math.min(18, parsed.startingRound)) : 1,
      keepDifficulty: Boolean(parsed.keepDifficulty),
      soundEnabled: parsed.soundEnabled !== undefined ? Boolean(parsed.soundEnabled) : true,
      volume,
    };
  } catch {
    return { startingRound: 1, keepDifficulty: false, soundEnabled: true, volume: 0.6 };
  }
}

export function saveSettings(settings: SavedSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
}
