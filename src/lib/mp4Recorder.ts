import type { ExportSettings, ParsedTgsAnimation } from '../types/animation';

export async function createMp4FromCanvas(
  canvas: HTMLCanvasElement,
  parsed: ParsedTgsAnimation,
  settings: ExportSettings,
): Promise<Blob> {
  const compositeCanvas = document.createElement('canvas');
  compositeCanvas.width = canvas.width;
  compositeCanvas.height = canvas.height;
  const compositeCtx = compositeCanvas.getContext('2d');

  if (!compositeCtx) {
    throw new Error('无法获取 canvas 上下文');
  }

  compositeCtx.fillStyle = settings.backgroundColor;
  compositeCtx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);
  compositeCtx.drawImage(canvas, 0, 0);

  const originalFrameRate = parsed.data.fr || settings.frameRate;

  const stream = compositeCanvas.captureStream(originalFrameRate);
  if (!stream) {
    throw new Error('当前浏览器不支持从 canvas 捕获视频流');
  }

  const updateInterval = setInterval(() => {
    compositeCtx.fillStyle = settings.backgroundColor;
    compositeCtx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);
    compositeCtx.drawImage(canvas, 0, 0);
  }, 1000 / originalFrameRate);

  const mimeTypes = ['video/mp4;codecs=h264', 'video/mp4'];

  const mimeType = mimeTypes.find((type) => {
    if (typeof MediaRecorder === 'undefined') {
      return false;
    }
    if (typeof MediaRecorder.isTypeSupported !== 'function') {
      return true;
    }
    return MediaRecorder.isTypeSupported(type);
  });

  if (!mimeType) {
    clearInterval(updateInterval);
    throw new Error('当前浏览器不支持 MP4 编码格式');
  }

  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: BlobPart[] = [];

  recorder.addEventListener('dataavailable', (event) => {
    if (event.data && event.data.size > 0) {
      chunks.push(event.data);
    }
  });

  const recordingPromise = new Promise<Blob>((resolve, reject) => {
    recorder.addEventListener('stop', () => {
      if (!chunks.length) {
        reject(new Error('未能获取到视频数据，导出失败'));
        return;
      }
      resolve(new Blob(chunks, { type: mimeType }));
    });
    recorder.addEventListener('error', (event) => {
      reject(new Error(String(event)));
    });
  });

  recorder.start();

  const durationMs = parsed.durationMs || 0;
  const safeDuration = durationMs > 0 ? durationMs : 3000;

  await new Promise<void>((resolve) => {
    let finished = false;

    const handleComplete = () => {
      if (finished) return;
      finished = true;
      recorder.stop();
      clearInterval(updateInterval);
      resolve();
    };

    window.setTimeout(() => {
      handleComplete();
    }, safeDuration + 250);
  });

  return recordingPromise;
}
