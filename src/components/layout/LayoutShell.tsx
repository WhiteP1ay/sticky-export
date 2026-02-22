import { FilesPanel } from '../panels/FilesPanel';
import { PreviewPanel } from '../panels/PreviewPanel';
import { SettingsPanel } from '../panels/SettingsPanel';
import { UploaderPanel } from '../panels/UploaderPanel';

export function LayoutShell() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold tracking-tight">Sticky Export</h1>
            <p className="text-xs text-slate-400">本地将 .tgs 动画导出为 GIF / MP4，支持批量与自定义配置</p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 lg:flex-row">
        <section className="flex flex-1 flex-col gap-4">
          <UploaderPanel />
          <PreviewPanel />
        </section>
        <aside className="flex w-full flex-col gap-4 lg:w-80">
          <SettingsPanel />
          <FilesPanel />
        </aside>
      </main>
    </div>
  );
}
