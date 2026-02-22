import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import type { ExportSettings, ParsedTgsAnimation } from '../types/animation';

export async function createGifFromCanvas(
  canvas: HTMLCanvasElement,
  parsed: ParsedTgsAnimation,
  settings: ExportSettings,
): Promise<Blob> {
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  const originalFrameRate = parsed.data.fr || settings.frameRate;
  const targetFps = Math.min(originalFrameRate, 30);
  const totalFramesNeeded = Math.ceil((parsed.durationMs * targetFps) / 1000);
  const maxFrames = Math.min(totalFramesNeeded, 120);
  const frameCount = maxFrames;
  const frameDelay = Math.round(1000 / targetFps);

  const encoder = GIFEncoder({ auto: true });

  for (let i = 0; i < frameCount; i++) {
    await new Promise((resolve) => setTimeout(resolve, frameDelay / 2));

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight;
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) {
      throw new Error('无法获取 canvas 上下文');
    }

    tempCtx.fillStyle = settings.backgroundColor === 'transparent' ? '#FFFFFF' : settings.backgroundColor;
    tempCtx.fillRect(0, 0, canvasWidth, canvasHeight);
    tempCtx.drawImage(canvas, 0, 0);

    const imageData = tempCtx.getImageData(0, 0, canvasWidth, canvasHeight);

    const palette = quantize(imageData.data, 256);
    const index = applyPalette(imageData.data, palette);

    encoder.writeFrame(index, canvasWidth, canvasHeight, {
      delay: frameDelay,
      palette: palette,
      repeat: 0,
      transparent: settings.backgroundColor === 'transparent',
      transparentIndex: settings.backgroundColor === 'transparent' ? 0 : undefined,
    });
  }

  encoder.finish();

  const output = encoder.bytes();

  return new Blob([output.buffer as ArrayBuffer], { type: 'image/gif' });
}
