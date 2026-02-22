import lottie from 'lottie-web';
import type { ExportSettings, ParsedTgsAnimation } from '../types/animation';
import { createGifFromCanvas } from './gifEncoder';
import { createMp4FromCanvas } from './mp4Recorder';

export async function recordTgsToVideo(parsed: ParsedTgsAnimation, settings: ExportSettings): Promise<Blob> {
  if (typeof document === 'undefined') {
    throw new Error('当前环境不支持视频导出');
  }

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = `${settings.width}px`;
  container.style.height = `${settings.height}px`;
  container.style.background = settings.backgroundColor;
  document.body.appendChild(container);

  try {
    const animation = lottie.loadAnimation({
      container,
      renderer: 'canvas',
      loop: false,
      autoplay: false,
      animationData: parsed.data,
      rendererSettings: {
        clearCanvas: true,
        preserveAspectRatio: 'xMidYMid meet',
      },
    });

    await new Promise<void>((resolve, reject) => {
      const onDomLoaded = () => {
        animation.removeEventListener('DOMLoaded', onDomLoaded);
        animation.removeEventListener('data_failed', onError);
        resolve();
      };
      const onError = () => {
        animation.removeEventListener('DOMLoaded', onDomLoaded);
        animation.removeEventListener('data_failed', onError);
        reject(new Error('初始化 Lottie 动画失败'));
      };

      animation.addEventListener('DOMLoaded', onDomLoaded);
      animation.addEventListener('data_failed', onError);
    });

    const canvas = container.getElementsByTagName('canvas')[0];
    if (!canvas) {
      throw new Error('未找到用于录制的 canvas 元素');
    }

    animation.goToAndPlay(0, true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    let blob: Blob;
    if (settings.format === 'gif') {
      blob = await createGifFromCanvas(canvas, parsed, settings);
    } else {
      blob = await createMp4FromCanvas(canvas, parsed, settings);
    }

    animation.destroy();
    return blob;
  } finally {
    container.remove();
  }
}
