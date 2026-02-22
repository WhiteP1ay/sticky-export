import { useCallback } from 'react';
import type React from 'react';
import { useTgsFilesStore } from '../store/tgsFilesStore';
import { parseTgsFile } from '../lib/tgsParser';

export function useTgsFiles() {
  const files = useTgsFilesStore((state) => state.files);
  const selectedId = useTgsFilesStore((state) => state.selectedId);
  const addFilesToStore = useTgsFilesStore((state) => state.addFiles);
  const removeFile = useTgsFilesStore((state) => state.removeFile);
  const setSelectedId = useTgsFilesStore((state) => state.setSelectedId);
  const updateFile = useTgsFilesStore((state) => state.updateFile);

  const addAndParseFiles = useCallback(
    async (input: FileList | File[]) => {
      const filesArray = Array.isArray(input) ? input : Array.from(input);
      if (!filesArray.length) return;

      addFilesToStore(filesArray);

      await Promise.all(
        filesArray.map(async (file) => {
          const id = `${file.name}-${file.size}-${file.lastModified}`;
          try {
            const parsed = await parseTgsFile(file);
            updateFile(id, (prev) => ({
              ...prev,
              parsed,
              status: 'ready',
              error: undefined,
            }));
          } catch (error) {
            updateFile(id, (prev) => ({
              ...prev,
              status: 'error',
              error: error instanceof Error ? error.message : '解析 .tgs 文件时发生未知错误',
            }));
          }
        }),
      );
    },
    [addFilesToStore, updateFile],
  );

  const handleInputFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      await addAndParseFiles(fileList);
    },
    [addAndParseFiles],
  );

  const handleDropFiles = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const dropped = event.dataTransfer.files;
      if (!dropped || dropped.length === 0) return;
      await addAndParseFiles(dropped);
    },
    [addAndParseFiles],
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const selectedFile = files.find((file) => file.id === selectedId) ?? null;

  return {
    files,
    selectedFile,
    selectedId,
    setSelectedId,
    removeFile,
    handleInputFiles,
    handleDropFiles,
    handleDragOver,
  };
}
