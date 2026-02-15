import { useEffect, useRef, useState } from 'react'
import lottie, { type AnimationItem } from 'lottie-web'
import type { ParsedTgsAnimation } from '../types/animation'
import { useExportSettings } from './useExportSettings'

interface UsePreviewParams {
  parsed: ParsedTgsAnimation | undefined
}

/** 管理 Lottie 预览生命周期与播放控制的 hook */
export function usePreview({ parsed }: UsePreviewParams) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const animationRef = useRef<AnimationItem | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const { settings } = useExportSettings()

  // 当动画数据或尺寸配置变化时，重新初始化 Lottie
  useEffect(() => {
    const container = containerRef.current
    if (!container || !parsed) {
      return undefined
    }

    // 清空旧内容
    container.innerHTML = ''

    const animation = lottie.loadAnimation({
      container,
      renderer: 'canvas',
      loop: true,
      autoplay: true,
      animationData: parsed.data,
    })

    animationRef.current = animation

    return () => {
      animation.destroy()
      animationRef.current = null
    }
  }, [parsed])

  // 根据导出配置调整容器样式（背景色 + 分辨率）
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.style.background = settings.backgroundColor
    container.style.width = `${settings.width}px`
    container.style.height = `${settings.height}px`
  }, [settings.backgroundColor, settings.height, settings.width])

  const togglePlay = () => {
    const animation = animationRef.current
    if (!animation) return
    if (isPlaying) {
      animation.pause()
      setIsPlaying(false)
    } else {
      animation.play()
      setIsPlaying(true)
    }
  }

  const restart = () => {
    const animation = animationRef.current
    if (!animation) return
    animation.goToAndPlay(0, true)
    setIsPlaying(true)
  }

  return {
    containerRef,
    isPlaying,
    togglePlay,
    restart,
  }
}


