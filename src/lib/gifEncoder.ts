import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import type { ExportSettings, ParsedTgsAnimation } from '../types/animation';

const TRANSPARENT_COLOR = '#FF00FF';

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

  const isTransparent = settings.backgroundColor === 'transparent';
  const bgColor = isTransparent ? TRANSPARENT_COLOR : settings.backgroundColor;

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

    tempCtx.fillStyle = bgColor;
    tempCtx.fillRect(0, 0, canvasWidth, canvasHeight);
    tempCtx.drawImage(canvas, 0, 0);

    const imageData = tempCtx.getImageData(0, 0, canvasWidth, canvasHeight);

    if (isTransparent) {
      const data = imageData.data;
      const transparentR = 255;
      const transparentG = 0;
      const transparentB = 255;

      for (let j = 0; j < data.length; j += 4) {
        const r = data[j];
        const g = data[j + 1];
        const b = data[j + 2];

        if (r === transparentR && g === transparentG && b === transparentB) {
          data[j + 3] = 0;
        }
      }
    }

    const palette = quantize(imageData.data, 256);
    const index = applyPalette(imageData.data, palette);

    let transparentIndex: number | undefined;
    if (isTransparent && palette.length > 0) {
      transparentIndex = palette.findIndex(
        (color) => color[0] === 255 && color[1] === 0 && color[2] === 255,
      );
      if (transparentIndex === -1) {
        transparentIndex = undefined;
      }
    }

    encoder.writeFrame(index, canvasWidth, canvasHeight, {
      delay: frameDelay,
      palette: palette,
      repeat: 0,
      transparent: transparentIndex !== undefined,
      transparentIndex: transparentIndex,
    });
  }

  encoder.finish();

  const output = encoder.bytes();

  return new Blob([output.buffer as ArrayBuffer], { type: 'image/gif' });
}
