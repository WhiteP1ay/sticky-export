import { useCallback } from 'react'
import { recordTgsToVideo } from '../lib/videoRecorder'
import { useExportSettings } from './useExportSettings'
import { useTgsFilesStore } from '../store/tgsFilesStore'
import { triggerBlobDownload } from '../lib/triggerBlobDownload'

/** 视频导出相关逻辑（单个 + 批量） */
export function useVideoExport() {
  const { settings } = useExportSettings()
  const files = useTgsFilesStore((state) => state.files)
  const updateFile = useTgsFilesStore((state) => state.updateFile)
  const setGlobalStatus = useTgsFilesStore((state) => state.setGlobalStatus)

  const exportSingleVideo = useCallback(
    async (id: string) => {
      const file = files.find((item) => item.id === id)
      if (!file || !file.parsed) {
        throw new Error('当前文件尚未完成解析，无法导出视频')
      }

      updateFile(id, (prev) => ({
        ...prev,
        status: 'exporting-video',
        error: undefined,
      }))

      try {
        const blob = await recordTgsToVideo(file.parsed, settings)
        const safeName = file.name.replace(/\.tgs$/i, '') || 'animation'
        triggerBlobDownload(blob, `${safeName}.${settings.format}`)

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
              : '导出视频过程中发生未知错误',
        }))
        throw error
      }
    },
    [files, settings, updateFile],
  )

  const exportAllVideo = useCallback(async () => {
    const readyFiles = files.filter((file) => file.parsed)
    if (!readyFiles.length) {
      throw new Error('当前没有可导出的视频动画')
    }

    setGlobalStatus('exporting')
    try {
      for (const file of readyFiles) {
        // 逐个导出，避免同时录制过多导致性能问题
        // 注意这里需要顺序执行，因此显式使用 await
        // 这里违反 no-await-in-loop 是刻意为之
        // eslint-disable-next-line no-await-in-loop
        await exportSingleVideo(file.id)
      }
      setGlobalStatus('done')
    } catch {
      setGlobalStatus('error')
    }
  }, [exportSingleVideo, files, setGlobalStatus])

  return {
    exportSingleVideo,
    exportAllVideo,
  }
}


