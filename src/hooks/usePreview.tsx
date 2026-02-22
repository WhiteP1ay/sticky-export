import { useEffect, useRef, useState } from 'react';
import lottie, { type AnimationItem } from 'lottie-web';
import type { ParsedTgsAnimation } from '../types/animation';
import { useExportSettings } from './useExportSettings';

interface UsePreviewParams {
  parsed: ParsedTgsAnimation | undefined;
}

export function usePreview({ parsed }: UsePreviewParams) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<AnimationItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { settings } = useExportSettings();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !parsed) {
      return undefined;
    }

    container.innerHTML = '';
    container.style.background = settings.backgroundColor;

    const animation = lottie.loadAnimation({
      container,
      renderer: 'canvas',
      loop: true,
      autoplay: true,
      animationData: parsed.data,
    });

    animationRef.current = animation;
    requestAnimationFrame(() => {
      setIsPlaying(true);
    });

    return () => {
      animation.destroy();
      animationRef.current = null;
    };
  }, [parsed, settings.backgroundColor]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const previewWidth = 640;
    const previewHeight = 480;

    container.style.width = `${previewWidth}px`;
    container.style.height = `${previewHeight}px`;
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.overflow = 'hidden';
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.style.background = settings.backgroundColor;
  }, [settings.backgroundColor]);

  const togglePlay = () => {
    const animation = animationRef.current;
    if (!animation) return;
    if (isPlaying) {
      animation.pause();
      setIsPlaying(false);
    } else {
      animation.play();
      setIsPlaying(true);
    }
  };

  const restart = () => {
    const animation = animationRef.current;
    if (!animation) return;
    animation.goToAndPlay(0, true);
    setIsPlaying(true);
  };

  return {
    containerRef,
    isPlaying,
    togglePlay,
    restart,
  };
}
