/** 基础的 Lottie / TGS 动画数据结构（精简版） */
export interface TgsAnimationData {
  /** 帧率 */
  fr: number
  /** 起始帧 */
  ip: number
  /** 结束帧 */
  op: number
  /** 画布宽度 */
  w: number
  /** 画布高度 */
  h: number
  /** 其他字段保留为任意类型，便于后续扩展 */
  [key: string]: unknown
}

/** 解析后的 .tgs 动画附带元信息 */
export interface ParsedTgsAnimation {
  /** 原始 Lottie 动画 JSON 数据 */
  data: TgsAnimationData
  /** 总帧数（op - ip） */
  totalFrames: number
  /** 总时长（毫秒） */
  durationMs: number
}

/** 导出配置结构 */
export interface ExportSettings {
  width: number
  height: number
  frameRate: number
  backgroundColor: string
  format: 'json' | 'webm' | 'mp4' | 'gif'
}

/** 单个导出的结果状态 */
export type ExportStatus =
  | 'idle'
  | 'parsing'
  | 'ready'
  | 'error'
  | 'exporting-json'
  | 'exporting-video'
  | 'exported'


