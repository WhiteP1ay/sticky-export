import { Play, RotateCcw } from 'lucide-react'
import { useTgsFiles } from '../../hooks/useTgsFiles'
import { usePreview } from '../../hooks/usePreview'
import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'

/** 预览区域：展示当前选中的动画，并提供简单播放控制 */
export function PreviewPanel() {
  const { selectedFile } = useTgsFiles()
  const { containerRef, isPlaying, togglePlay, restart } = usePreview({
    parsed: selectedFile?.parsed,
  })

  return (
    <Card className="flex flex-1 flex-col">
      <CardHeader>
        <CardTitle>动画预览</CardTitle>
        <CardDescription>
          根据当前导出配置（背景色、分辨率）进行预览
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex-1 rounded-md border border-slate-800 bg-slate-900/80">
          {selectedFile?.parsed ? (
            <div
              ref={containerRef}
              className="flex h-full items-center justify-center"
            />
          ) : (
            <div className="flex h-56 items-center justify-center text-xs text-slate-500">
              暂未选择动画，请先在左侧导入并在右下选择一个文件
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="subtle"
              disabled={!selectedFile?.parsed}
              onClick={togglePlay}
            >
              <Play className="mr-1 h-3 w-3" />
              {isPlaying ? '暂停' : '播放'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={!selectedFile?.parsed}
              onClick={restart}
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              重播
            </Button>
          </div>
          {selectedFile?.parsed ? (
            <span>
              {selectedFile.name} ·{' '}
              {Math.round(selectedFile.parsed.durationMs / 100) / 10}s ·
              总帧数 {selectedFile.parsed.totalFrames}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}


