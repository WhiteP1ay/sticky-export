import { create } from 'zustand';
import type { ExportSettings } from '../types/animation';

const STORAGE_KEY = 'sticky_export_settings_v1';

const DEFAULT_SETTINGS: ExportSettings = {
  width: 512,
  height: 512,
  frameRate: 30,
  backgroundColor: '#000000',
  format: 'mp4',
};

interface ExportSettingsState {
  settings: ExportSettings;
  initialized: boolean;
  updateSettings: (next: Partial<ExportSettings>) => void;
  reset: () => void;
  hydrateFromStorage: () => void;
}

function readSettingsFromStorage(): ExportSettings | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<ExportSettings>;
    const width = Number(parsed.width);
    const height = Number(parsed.height);
    const frameRate = Number(parsed.frameRate);
    const backgroundColor =
      typeof parsed.backgroundColor === 'string' ? parsed.backgroundColor : DEFAULT_SETTINGS.backgroundColor;
    const format = ['mp4', 'gif'].includes(parsed.format as string)
      ? (parsed.format as 'mp4' | 'gif')
      : DEFAULT_SETTINGS.format;

    if (!Number.isFinite(width) || width <= 0) return null;
    if (!Number.isFinite(height) || height <= 0) return null;
    if (!Number.isFinite(frameRate) || frameRate <= 0 || frameRate > 120) {
      return null;
    }

    return {
      width,
      height,
      frameRate,
      backgroundColor,
      format,
    };
  } catch {
    return null;
  }
}

function writeSettingsToStorage(settings: ExportSettings) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage 可能被禁用，失败时静默忽略
  }
}

export const useExportSettingsStore = create<ExportSettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  initialized: false,
  updateSettings: (next) => {
    const current = get().settings;
    const merged: ExportSettings = {
      ...current,
      ...next,
    };
    set({ settings: merged });
    writeSettingsToStorage(merged);
  },
  reset: () => {
    set({ settings: DEFAULT_SETTINGS });
    writeSettingsToStorage(DEFAULT_SETTINGS);
  },
  hydrateFromStorage: () => {
    if (get().initialized) return;
    const fromStorage = readSettingsFromStorage();
    if (fromStorage) {
      set({ settings: fromStorage, initialized: true });
    } else {
      set({ settings: DEFAULT_SETTINGS, initialized: true });
      writeSettingsToStorage(DEFAULT_SETTINGS);
    }
  },
}));
