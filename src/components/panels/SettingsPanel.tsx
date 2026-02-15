import type React from 'react'
import { useExportSettings } from '../../hooks/useExportSettings'
import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

/** 导出参数设置面板：分辨率、帧率、背景颜色等 */
export function SettingsPanel() {
  const { settings, updateSettings, reset } = useExportSettings()

  const handleNumberChange =
    (field: 'width' | 'height' | 'frameRate') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      // 实时更新值，不做验证，允许用户自由输入
      const value = event.target.value
      // 暂时存储为字符串，在 onBlur 时进行验证
      updateSettings({ [field]: Number(value) || 0 })
    }

  const handleNumberBlur =
    (field: 'width' | 'height' | 'frameRate') =>
    (event: React.FocusEvent<HTMLInputElement>) => {
      // 输入结束后进行验证
      const value = Number(event.target.value)
      let validatedValue: number
      
      // 根据字段设置合理的默认值和范围
      if (field === 'width' || field === 'height') {
        validatedValue = Number.isFinite(value) && value > 0 ? Math.min(value, 4096) : 512
      } else if (field === 'frameRate') {
        validatedValue = Number.isFinite(value) && value > 0 ? Math.min(value, 300) : 30
      } else {
        validatedValue = 0
      }
      
      updateSettings({ [field]: validatedValue })
    }

  // 处理透明背景切换
  const handleTransparentToggle = () => {
    if (settings.backgroundColor === 'transparent') {
      updateSettings({ backgroundColor: '#000000' })
    } else {
      updateSettings({ backgroundColor: 'transparent' })
    }
  }

  const handleBackgroundChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    updateSettings({ backgroundColor: event.target.value })
  }

  const handleFormatChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newFormat = event.target.value as 'json' | 'webm' | 'mp4' | 'gif'
    
    // 检查是否切换到不支持透明背景的格式
    const supportsTransparent = newFormat === 'gif'
    
    // 如果切换到不支持透明的格式，并且当前是透明背景，则改为黑色背景
    if (!supportsTransparent && settings.backgroundColor === 'transparent') {
      updateSettings({ 
        format: newFormat,
        backgroundColor: '#000000'
      })
    } else {
      updateSettings({ format: newFormat })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>导出设置</CardTitle>
        <CardDescription>作为全局偏好，会自动保存在本地</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="width">宽度（px）</Label>
              <Input
                id="width"
                type="number"
                value={settings.width}
                onChange={handleNumberChange('width')}
                onBlur={handleNumberBlur('width')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="height">高度（px）</Label>
              <Input
                id="height"
                type="number"
                value={settings.height}
                onChange={handleNumberChange('height')}
                onBlur={handleNumberBlur('height')}
              />
            </div>
          </div>

          <div className="grid grid-cols-[1.5fr,1fr] items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="frameRate">帧率（fps）</Label>
              <Input
                id="frameRate"
                type="number"
                value={settings.frameRate}
                onChange={handleNumberChange('frameRate')}
                onBlur={handleNumberBlur('frameRate')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="backgroundColor">背景色</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  className="h-8 w-10 p-0"
                  value={settings.backgroundColor === 'transparent' ? '#000000' : settings.backgroundColor}
                  onChange={handleBackgroundChange}
                  disabled={settings.backgroundColor === 'transparent'}
                />
                <Input
                  type="text"
                  className="flex-1"
                  value={settings.backgroundColor}
                  onChange={handleBackgroundChange}
                />
                <Button
                  type="button"
                  size="sm"
                  variant={settings.backgroundColor === 'transparent' ? 'default' : 'ghost'}
                  onClick={handleTransparentToggle}
                  disabled={settings.format !== 'gif'}
                >
                  {settings.backgroundColor === 'transparent' ? '透明' : '透明'}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="format">导出格式</Label>
            <select
              id="format"
              className="flex h-8 w-full rounded-md border border-slate-800 bg-slate-900 px-2 text-xs text-slate-50 outline-none ring-offset-slate-950 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
              value={settings.format}
              onChange={handleFormatChange}
            >
              <option value="json">JSON</option>
              <option value="webm">WebM</option>
              <option value="mp4">MP4</option>
              <option value="gif">GIF</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
            <span>这些设置将被复用在所有导出任务中。</span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={reset}
            >
              重置为默认
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


