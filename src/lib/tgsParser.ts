import { gunzipSync } from 'fflate';
import type { ParsedTgsAnimation, TgsAnimationData } from '../types/animation';

export async function parseTgsFile(file: File): Promise<ParsedTgsAnimation> {
  if (!file.name.endsWith('.tgs')) {
    throw new Error('文件扩展名不是 .tgs，请确认后重新选择');
  }

  const buffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(buffer);

  let jsonText: string;
  try {
    const unzipped = gunzipSync(uint8);
    jsonText = new TextDecoder('utf-8').decode(unzipped);
  } catch {
    throw new Error('无法解压 .tgs 文件，文件可能已损坏或格式不正确');
  }

  let data: TgsAnimationData;
  try {
    const parsed = JSON.parse(jsonText) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('解析结果不是有效的 JSON 对象');
    }
    data = parsed as TgsAnimationData;
  } catch (error) {
    throw new Error(error instanceof Error ? `解析 JSON 失败：${error.message}` : '解析 JSON 失败');
  }

  const { fr, ip, op, w, h } = data;
  if (
    typeof fr !== 'number' ||
    typeof ip !== 'number' ||
    typeof op !== 'number' ||
    typeof w !== 'number' ||
    typeof h !== 'number'
  ) {
    throw new Error('动画数据缺少必要字段（fr/ip/op/w/h），可能不是标准的 TGS/Lottie');
  }

  const totalFrames = Math.max(0, op - ip);
  const durationMs = fr > 0 && totalFrames > 0 ? (totalFrames / fr) * 1000 : 0;

  return {
    data,
    totalFrames,
    durationMs,
  };
}
