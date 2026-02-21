import lottie from 'lottie-web'
import { GIFEncoder, quantize, applyPalette } from 'gifenc'
import type { ExportSettings, ParsedTgsAnimation } from '../types/animation'

/** 录制单个 TGS 动画为视频 Blob（根据设置的格式选择合适的编码） */
export async function recordTgsToVideo(
  parsed: ParsedTgsAnimation,
  settings: ExportSettings,
): Promise<Blob> {
  if (typeof document === 'undefined') {
    throw new Error('当前环境不支持视频导出')
  }

  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.top = '-9999px'
  container.style.width = `${settings.width}px`
  container.style.height = `${settings.height}px`
  container.style.background = settings.backgroundColor
  document.body.appendChild(container)

  try {
    const animation = lottie.loadAnimation({
      container,
      renderer: 'canvas',
      loop: false,
      autoplay: false,
      animationData: parsed.data,
      rendererSettings: {
        clearCanvas: true, // 清除画布，避免花屏
        preserveAspectRatio: 'xMidYMid meet'
      }
    })

    // 等待 Lottie 初始化完成
    await new Promise<void>((resolve, reject) => {
      const onDomLoaded = () => {
        animation.removeEventListener('DOMLoaded', onDomLoaded)
        resolve()
      }
      const onError = () => {
        animation.removeEventListener('DOMLoaded', onDomLoaded)
        reject(new Error('初始化 Lottie 动画失败'))
      }

      animation.addEventListener('DOMLoaded', onDomLoaded)
      animation.addEventListener('data_failed', onError)
    })

    const canvas = container.getElementsByTagName('canvas')[0]
    if (!canvas) {
      throw new Error('未找到用于录制的 canvas 元素')
    }

    // 对于 GIF 格式，我们需要使用 canvas 逐帧绘制并创建 GIF
    if (settings.format === 'gif') {
      // 开始播放动画
      animation.goToAndPlay(0, true)
      
      // 等待一小段时间，确保动画开始播放
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 创建 GIF
      const gifBlob = await createGifFromCanvas(canvas, parsed, settings)
      
      // 销毁动画
      animation.destroy()
      
      return gifBlob
    }

    // 对于视频格式，使用 MediaRecorder
    // 创建一个新的 canvas，添加背景色并绘制原始 canvas 内容
    const compositeCanvas = document.createElement('canvas')
    compositeCanvas.width = canvas.width
    compositeCanvas.height = canvas.height
    const compositeCtx = compositeCanvas.getContext('2d')
    
    if (compositeCtx) {
      // 绘制背景色
      compositeCtx.fillStyle = settings.backgroundColor
      compositeCtx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height)
      // 绘制原始 canvas 内容
      compositeCtx.drawImage(canvas, 0, 0)
    }
    
    // 使用 TGS 动画的原始帧率
    const originalFrameRate = parsed.data.fr || settings.frameRate
    
    // 使用合成后的 canvas 捕获视频流
    const stream = compositeCanvas.captureStream(originalFrameRate)
    if (!stream) {
      throw new Error('当前浏览器不支持从 canvas 捕获视频流')
    }
    
    // 定期更新合成 canvas，确保背景色和动画内容都被捕获
    const updateInterval = setInterval(() => {
      if (compositeCtx) {
        compositeCtx.fillStyle = settings.backgroundColor
        compositeCtx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height)
        compositeCtx.drawImage(canvas, 0, 0)
      }
    }, 1000 / originalFrameRate)

    // 根据设置的格式选择合适的 MIME 类型
    const mimeTypes = settings.format === 'mp4' 
      ? [
          'video/mp4;codecs=h264',
          'video/mp4',
        ]
      : [
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8',
          'video/webm',
        ]

    const mimeType = mimeTypes.find((type) => {
      // MediaRecorder 在某些环境可能不存在，这里做一次运行时能力检测
      if (typeof MediaRecorder === 'undefined') {
        return false
      }
      // 某些浏览器没有 isTypeSupported 方法，则直接退回默认
      if (typeof MediaRecorder.isTypeSupported !== 'function') {
        return true
      }
      return MediaRecorder.isTypeSupported(type)
    })

    if (!mimeType) {
      throw new Error(`当前浏览器不支持 ${settings.format.toUpperCase()} 编码格式`)
    }

    const recorder = new MediaRecorder(stream, { mimeType })
    const chunks: BlobPart[] = []

    recorder.addEventListener('dataavailable', (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data)
      }
    })

    const recordingPromise = new Promise<Blob>((resolve, reject) => {
      recorder.addEventListener('stop', () => {
        if (!chunks.length) {
          reject(new Error('未能获取到视频数据，导出失败'))
          return
        }
        resolve(new Blob(chunks, { type: mimeType }))
      })
      recorder.addEventListener('error', (event) => {
        reject(
          new Error(
            '录制过程中发生错误' in event ? String(event) : '录制过程中发生未知错误',
          ),
        )
      })
    })

    recorder.start()
    animation.goToAndPlay(0, true)

    const durationMs = parsed.durationMs || 0
    // 如果 duration 异常，给一个兜底时长防止录制永不结束
    const safeDuration = durationMs > 0 ? durationMs : 3000

    await new Promise<void>((resolve) => {
      // 在动画自然完成或 timeout 后停止录制
      let finished = false

      const handleComplete = () => {
        if (finished) return
        finished = true
        animation.removeEventListener('complete', handleComplete)
        recorder.stop()
        resolve()
      }

      animation.addEventListener('complete', handleComplete)

      window.setTimeout(() => {
        handleComplete()
      }, safeDuration + 250)
    })

    const blob = await recordingPromise
    
    // 清除定时器
    clearInterval(updateInterval)
    
    return blob
  } finally {
    container.remove()
  }
}

/**
 * 从 Canvas 创建 GIF 动画
 * 使用 gifenc 库实现 GIF 编码器，纯 JavaScript 实现，无 Web Worker 依赖
 */
async function createGifFromCanvas(
  canvas: HTMLCanvasElement,
  parsed: ParsedTgsAnimation,
  settings: ExportSettings,
): Promise<Blob> {
  // 使用原始 canvas 的尺寸
  const canvasWidth = canvas.width
  const canvasHeight = canvas.height
  
  // 使用 TGS 动画的原始帧率
  const originalFrameRate = parsed.data.fr || settings.frameRate
  const targetFps = Math.min(originalFrameRate, 30) // 限制最大帧率为 30fps，平衡质量和性能
  const totalFramesNeeded = Math.ceil((parsed.durationMs * targetFps) / 1000)
  const maxFrames = Math.min(totalFramesNeeded, 120) // 最大 120 帧，确保能捕获完整动画
  const frameCount = maxFrames
  const frameDelay = Math.round(1000 / targetFps) // 根据目标帧率计算延迟
  
  // 创建 GIF 编码器
  const encoder = GIFEncoder({ auto: true })
  
  // 捕获动画的每一帧
  for (let i = 0; i < frameCount; i++) {
    // 等待一小段时间，确保动画更新
    await new Promise(resolve => setTimeout(resolve, frameDelay / 2))
    
    // 创建一个临时 canvas，用于处理图像
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = canvasWidth
    tempCanvas.height = canvasHeight
    const tempCtx = tempCanvas.getContext('2d')
    
    if (!tempCtx) {
      throw new Error('无法获取 canvas 上下文')
    }
    
    // 对于所有情况，先绘制白色背景，再绘制动画
    // 这样可以确保动画主体的颜色（包括黑色）被正确保留
    tempCtx.fillStyle = '#FFFFFF'
    tempCtx.fillRect(0, 0, canvasWidth, canvasHeight)
    tempCtx.drawImage(canvas, 0, 0)
    
    // 从临时 canvas 获取图像数据
    const imageData = tempCtx.getImageData(0, 0, canvasWidth, canvasHeight)
    
    // 生成调色板（256 色，提高颜色精度）
    const palette = quantize(imageData.data, 256)
    
    // 创建索引数据
    const index = applyPalette(imageData.data, palette)
    
    // 添加当前帧到 GIF 编码器
    // 禁用透明度处理，确保所有颜色（包括黑色）都被正确保留
    encoder.writeFrame(index, canvasWidth, canvasHeight, {
      delay: frameDelay,
      palette: palette,
      repeat: 0, // 0 表示无限循环
      transparent: false,
      transparentIndex: undefined
    })
  }
  
  // 完成编码
  encoder.finish()
  
  // 获取编码结果
  const output = encoder.bytes()
  
  // 创建 Blob 并返回
  return new Blob([output.buffer as ArrayBuffer], { type: 'image/gif' })
}


