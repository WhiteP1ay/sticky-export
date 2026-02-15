import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { useTgsFiles } from '../../hooks/useTgsFiles'

/** 上传区域：负责接收单个/多个 .tgs 文件并交给 hooks 处理 */
export function UploaderPanel() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { handleInputFiles, handleDropFiles, handleDragOver } = useTgsFiles()

  const onClickSelect = () => {
    inputRef.current?.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>导入 .tgs 动画</CardTitle>
        <CardDescription>支持一次选择或拖拽多个 .tgs 文件</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-slate-700 bg-slate-900/60 px-4 py-6 text-center text-xs text-slate-400 hover:border-sky-500 hover:text-slate-200"
          onClick={onClickSelect}
          onDrop={handleDropFiles}
          onDragOver={handleDragOver}
        >
          <Upload className="h-5 w-5 text-sky-400" />
          <div className="space-y-1">
            <p className="text-xs">
              点击选择文件，或将 .tgs 文件拖拽到此处
            </p>
            <p className="text-[11px] text-slate-500">
              文件仅在本地解析和导出，不会上传到服务器
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            className="mt-2"
          >
            选择 .tgs 文件
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".tgs"
            multiple
            className="hidden"
            onChange={(event) => handleInputFiles(event.target.files)}
          />
        </div>
      </CardContent>
    </Card>
  )
}


