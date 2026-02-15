import type { ExportSettings, ParsedTgsAnimation } from '../types/animation'
import { triggerBlobDownload } from './triggerBlobDownload'

export interface ExportedJsonPayload {
  meta: {
    exportedAt: string
    width: number
    height: number
    frameRate: number
    backgroundColor: string
    durationMs: number
    totalFrames: number
  }
  animation: ParsedTgsAnimation['data']
}

/** 根据动画数据与当前配置生成 JSON 并触发浏览器下载 */
export function exportAnimationJson(
  name: string,
  parsed: ParsedTgsAnimation,
  settings: ExportSettings,
) {
  const payload: ExportedJsonPayload = {
    meta: {
      exportedAt: new Date().toISOString(),
      width: settings.width,
      height: settings.height,
      frameRate: settings.frameRate,
      backgroundColor: settings.backgroundColor,
      durationMs: parsed.durationMs,
      totalFrames: parsed.totalFrames,
    },
    animation: parsed.data,
  }

  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const safeName = name.replace(/\.tgs$/i, '') || 'animation'

  triggerBlobDownload(blob, `${safeName}.json`)
}


