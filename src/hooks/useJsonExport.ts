import { useCallback } from 'react'
import { exportAnimationJson } from '../lib/jsonExporter'
import { useExportSettings } from './useExportSettings'
import { useTgsFilesStore } from '../store/tgsFilesStore'

/** JSON 导出相关逻辑（单个 + 批量） */
export function useJsonExport() {
  const { settings } = useExportSettings()
  const files = useTgsFilesStore((state) => state.files)
  const updateFile = useTgsFilesStore((state) => state.updateFile)
  const setGlobalStatus = useTgsFilesStore((state) => state.setGlobalStatus)

  const exportSingleJson = useCallback(
    async (id: string) => {
      const file = files.find((item) => item.id === id)
      if (!file || !file.parsed) {
        throw new Error('当前文件尚未完成解析，无法导出 JSON')
      }

      updateFile(id, (prev) => ({
        ...prev,
        status: 'exporting-json',
        error: undefined,
      }))

      try {
        exportAnimationJson(file.name, file.parsed, settings)
        updateFile(id, (prev) => ({
          ...prev,
          status: 'exported',
        }))
      } catch (error) {
        updateFile(id, (prev) => ({
          ...prev,
          status: 'error',
          error:
            error instanceof Error
              ? error.message
              : '导出 JSON 过程中发生未知错误',
        }))
        throw error
      }
    },
    [files, settings, updateFile],
  )

  const exportAllJson = useCallback(async () => {
    const readyFiles = files.filter((file) => file.parsed)
    if (!readyFiles.length) {
      throw new Error('当前没有可导出的动画')
    }

    setGlobalStatus('exporting')
    try {
      for (const file of readyFiles) {
        // 逐个导出，避免同时触发过多下载
        // 注意这里需要顺序执行，因此显式使用 await
        // 这里违反 no-await-in-loop 是刻意为之
        // eslint-disable-next-line no-await-in-loop
        await exportSingleJson(file.id)
      }
      setGlobalStatus('done')
    } catch {
      setGlobalStatus('error')
    }
  }, [exportSingleJson, files, setGlobalStatus])

  return {
    exportSingleJson,
    exportAllJson,
  }
}


