import { useEffect } from 'react'
import { useExportSettingsStore } from '../store/exportSettingsStore'

/** 导出设置相关的 hooks，负责在首次使用时从 localStorage 注水 */
export function useExportSettings() {
  const settings = useExportSettingsStore((state) => state.settings)
  const initialized = useExportSettingsStore((state) => state.initialized)
  const updateSettings = useExportSettingsStore((state) => state.updateSettings)
  const reset = useExportSettingsStore((state) => state.reset)
  const hydrate = useExportSettingsStore((state) => state.hydrateFromStorage)

  useEffect(() => {
    if (!initialized) {
      hydrate()
    }
  }, [hydrate, initialized])

  return {
    settings,
    initialized,
    updateSettings,
    reset,
  }
}


