import { useEffect } from 'react'

interface KeyboardShortcutsHandlers {
  onSave: () => void
  onSaveAs: () => void
  onOpen: () => void
  onCloseTab: () => void
  onNewTab: () => void
  onSwitchTab: (direction: 'prev' | 'next') => void
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutsHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey

      // Cmd/Ctrl + S: Save
      if (isMod && e.key === 's') {
        e.preventDefault()
        if (e.shiftKey) {
          handlers.onSaveAs()
        } else {
          handlers.onSave()
        }
        return
      }

      // Cmd/Ctrl + O: Open file
      if (isMod && e.key === 'o') {
        e.preventDefault()
        handlers.onOpen()
        return
      }

      // Cmd/Ctrl + W: Close tab
      if (isMod && e.key === 'w') {
        e.preventDefault()
        handlers.onCloseTab()
        return
      }

      // Cmd/Ctrl + N: New tab
      if (isMod && e.key === 'n') {
        e.preventDefault()
        handlers.onNewTab()
        return
      }

      // Cmd/Ctrl + Shift + [/]: Switch tabs
      if (isMod && e.shiftKey) {
        if (e.key === '[') {
          e.preventDefault()
          handlers.onSwitchTab('prev')
          return
        }
        if (e.key === ']') {
          e.preventDefault()
          handlers.onSwitchTab('next')
          return
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}
