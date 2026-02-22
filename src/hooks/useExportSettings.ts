import { useEffect } from 'react';
import { useExportSettingsStore } from '../store/exportSettingsStore';

export function useExportSettings() {
  const settings = useExportSettingsStore((state) => state.settings);
  const initialized = useExportSettingsStore((state) => state.initialized);
  const updateSettings = useExportSettingsStore((state) => state.updateSettings);
  const reset = useExportSettingsStore((state) => state.reset);
  const hydrate = useExportSettingsStore((state) => state.hydrateFromStorage);

  useEffect(() => {
    if (!initialized) {
      hydrate();
    }
  }, [hydrate, initialized]);

  return {
    settings,
    initialized,
    updateSettings,
    reset,
  };
}
