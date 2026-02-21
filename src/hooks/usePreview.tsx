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
    
    // 设置容器背景色，确保与当前设置一致
    container.style.background = settings.backgroundColor

    const animation = lottie.loadAnimation({
      container,
      renderer: 'canvas',
      loop: true,
      autoplay: true,
      animationData: parsed.data,
    })

    animationRef.current = animation
    // 使用 requestAnimationFrame 延迟设置状态，避免在 useEffect 中同步调用 setState
    requestAnimationFrame(() => {
      setIsPlaying(true)
    })

    return () => {
      animation.destroy()
      animationRef.current = null
    }
  }, [parsed, settings.backgroundColor])

  // 设置预览窗口的固定尺寸和布局（只执行一次）
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // 保持预览窗口尺寸固定为4:3比例
    // 设置固定的4:3预览区域大小
    const previewWidth = 640 // 4:3比例的宽度
    const previewHeight = 480 // 4:3比例的高度
    
    // 设置容器的基础样式
    container.style.width = `${previewWidth}px`
    container.style.height = `${previewHeight}px`
    container.style.display = 'flex'
    container.style.alignItems = 'center'
    container.style.justifyContent = 'center'
    container.style.overflow = 'hidden'
  }, []) // 空依赖数组，只执行一次

  // 仅更新背景色，不影响尺寸和布局
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.style.background = settings.backgroundColor
  }, [settings.backgroundColor])

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


