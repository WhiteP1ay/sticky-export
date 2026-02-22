export interface TgsAnimationData {
  fr: number;
  ip: number;
  op: number;
  w: number;
  h: number;
  [key: string]: unknown;
}

export interface ParsedTgsAnimation {
  data: TgsAnimationData;
  totalFrames: number;
  durationMs: number;
}

export interface ExportSettings {
  width: number;
  height: number;
  frameRate: number;
  backgroundColor: string;
  format: 'mp4' | 'gif';
}

export type ExportStatus = 'idle' | 'parsing' | 'ready' | 'error' | 'exporting-video' | 'exported';
