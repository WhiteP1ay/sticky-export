import { useCallback } from 'react'
import { Trash2, FileStack, Download } from 'lucide-react'
import { useTgsFiles } from '../../hooks/useTgsFiles'
import { useJsonExport } from '../../hooks/useJsonExport'
import { useVideoExport } from '../../hooks/useVideoExport'
import { useExportSettings } from '../../hooks/useExportSettings'
import { useTgsFilesStore } from '../../store/tgsFilesStore'
import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'

/** 文件列表与批量导出面板 */
export function FilesPanel() {
  const { files, selectedId, setSelectedId, removeFile } = useTgsFiles()
  const { exportSingleJson, exportAllJson } = useJsonExport()
  const { exportSingleVideo, exportAllVideo } = useVideoExport()
  const { settings } = useExportSettings()
  const globalStatus = useTgsFilesStore((state) => state.globalStatus)

  // 根据设置的格式决定导出类型
  const handleExport = useCallback(async () => {
    if (settings.format === 'json') {
      await exportAllJson()
    } else {
      await exportAllVideo()
    }
  }, [settings.format, exportAllJson, exportAllVideo])

  // 单个文件导出
  const handleSingleExport = useCallback(async (id: string) => {
    if (settings.format === 'json') {
      await exportSingleJson(id)
    } else {
      await exportSingleVideo(id)
    }
  }, [settings.format, exportSingleJson, exportSingleVideo])

  const hasParsed = files.some((file) => file.parsed)

  const renderStatus = (status: string) => {
    switch (status) {
      case 'parsing':
        return '解析中'
      case 'ready':
        return '就绪'
      case 'exporting-json':
        return '导出 JSON 中'
      case 'exporting-video':
        return '导出视频中'
      case 'exported':
        return '已导出'
      case 'error':
        return '出错'
      default:
        return '待处理'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>文件列表</CardTitle>
        <CardDescription className="flex items-center justify-between gap-2">
          <span>支持对全部已解析动画进行一键批量导出</span>
          <span className="text-[11px] text-slate-500">
            {files.length ? `共 ${files.length} 个` : '暂无文件'}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-56 space-y-1 overflow-y-auto text-xs">
          {files.length === 0 ? (
            <div className="flex items-center justify-center py-6 text-[11px] text-slate-500">
              还没有导入 .tgs 文件
            </div>
          ) : (
            files.map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => setSelectedId(file.id)}
                className={`flex w-full items-center justify-between rounded-md border px-2 py-1.5 text-left text-[11px] transition-colors ${
                  file.id === selectedId
                    ? 'border-sky-500 bg-sky-500/10'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <FileStack className="h-3 w-3 text-slate-400" />
                  <div className="min-w-0">
                    <div className="truncate text-xs text-slate-100">
                      {file.name}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-500">
                      <span>{renderStatus(file.status)}</span>
                      {file.error ? (
                        <span className="truncate text-red-400">
                          {file.error}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="ml-2 flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={!file.parsed}
                    onClick={(event) => {
                      event.stopPropagation()
                      void handleSingleExport(file.id)
                    }}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={(event) => {
                      event.stopPropagation()
                      removeFile(file.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-red-400" />
                  </Button>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-800 pt-2 text-[11px]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!hasParsed}
                onClick={() => void handleExport()}
              >
                批量导出
              </Button>
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-500">
            {globalStatus === 'exporting' && '批量导出进行中，请稍候…'}
            {globalStatus === 'done' && '批量导出完成'}
            {globalStatus === 'error' && '批量导出过程中存在失败任务'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


