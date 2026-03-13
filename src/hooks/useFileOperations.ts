import { useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import type { Tab, FileOpenResult, FileSaveResult, FileSaveAsResult } from '../types'

interface UseFileOperationsProps {
  tabs: Tab[]
  activeTabId: string
  updateTab: (tabId: string, updates: Partial<Tab>) => void
  addTab: (tab: Tab) => void
  generateTabId: () => string
}

export function useFileOperations({
  tabs,
  activeTabId,
  updateTab,
  addTab,
  generateTabId,
}: UseFileOperationsProps) {
  const handleSaveAs = useCallback(async () => {
    const tab = tabs.find(t => t.id === activeTabId)
    if (!tab) return

    const result = await invoke<FileSaveAsResult | null>('file_save_as', {
      args: { content: tab.content, defaultName: tab.fileName },
    })

    if (result?.success) {
      updateTab(activeTabId, {
        fileName: result.fileName,
        filePath: result.filePath,
        isModified: false,
      })
    }
  }, [tabs, activeTabId, updateTab])

  const handleSave = useCallback(async () => {
    const tab = tabs.find(t => t.id === activeTabId)
    if (!tab) return

    if (tab.filePath) {
      const result = await invoke<FileSaveResult>('file_save', {
        args: { filePath: tab.filePath, content: tab.content },
      })
      if (result.success) {
        updateTab(activeTabId, { isModified: false })
      }
    } else {
      handleSaveAs()
    }
  }, [tabs, activeTabId, updateTab, handleSaveAs])

  const handleOpenFile = useCallback(async () => {
    const result = await invoke<FileOpenResult | null>('file_open')
    if (result) {
      const newTab: Tab = {
        id: generateTabId(),
        fileName: result.fileName,
        filePath: result.filePath,
        content: result.content,
        isModified: false,
      }
      addTab(newTab)
    }
  }, [addTab, generateTabId])

  return {
    handleSave,
    handleSaveAs,
    handleOpenFile,
  }
}
