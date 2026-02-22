import { create } from 'zustand';
import type { ParsedTgsAnimation, ExportStatus } from '../types/animation';

export interface TgsFileItem {
  id: string;
  name: string;
  file: File;
  parsed?: ParsedTgsAnimation;
  status: ExportStatus;
  error?: string;
}

export type GlobalExportStatus = 'idle' | 'exporting' | 'done' | 'error';

interface TgsFilesState {
  files: TgsFileItem[];
  selectedId: string | null;
  globalStatus: GlobalExportStatus;
  addFiles: (files: FileList | File[]) => void;
  removeFile: (id: string) => void;
  setSelectedId: (id: string | null) => void;
  updateFile: (id: string, updater: (prev: TgsFileItem) => TgsFileItem) => void;
  setGlobalStatus: (status: GlobalExportStatus) => void;
  resetExportStatus: () => void;
}

function makeFileId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export const useTgsFilesStore = create<TgsFilesState>((set) => ({
  files: [],
  selectedId: null,
  globalStatus: 'idle',
  addFiles: (input) => {
    const filesArray = Array.isArray(input) ? input : Array.from(input);
    if (!filesArray.length) return;

    set((state) => {
      const existing = state.files;
      const toAdd: TgsFileItem[] = [];

      for (const file of filesArray) {
        const id = makeFileId(file);
        const already = existing.find((item) => item.id === id);
        if (already) continue;

        toAdd.push({
          id,
          name: file.name,
          file,
          status: 'parsing',
        });
      }

      const merged = [...existing, ...toAdd];
      const currentSelected = state.selectedId ?? merged[0]?.id ?? null;

      return {
        files: merged,
        selectedId: currentSelected,
      };
    });
  },
  removeFile: (id) => {
    set((state) => {
      const nextFiles = state.files.filter((f) => f.id !== id);
      let nextSelected = state.selectedId;
      if (state.selectedId === id) {
        nextSelected = nextFiles[0]?.id ?? null;
      }
      return {
        files: nextFiles,
        selectedId: nextSelected,
      };
    });
  },
  setSelectedId: (id) => set({ selectedId: id }),
  updateFile: (id, updater) => {
    set((state) => ({
      files: state.files.map((file) => (file.id === id ? updater(file) : file)),
    }));
  },
  setGlobalStatus: (status) => set({ globalStatus: status }),
  resetExportStatus: () => {
    set((state) => ({
      globalStatus: 'idle',
      files: state.files.map((file) => ({
        ...file,
        status: file.status === 'exported' || file.status === 'error' ? 'ready' : file.status,
      })),
    }));
  },
}));
