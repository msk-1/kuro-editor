import { useState, useCallback, useMemo } from 'react'
import type { SearchOptions } from './types'
import { useTabManager, generateTabId } from './hooks/useTabManager'
import { useFileOperations } from './hooks/useFileOperations'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { Editor } from './components/Editor'
import { TabBar } from './components/TabBar'
import { initialTabs } from './constants/sampleData'
import './App.css'

function App() {
  const [accessibilityMode, setAccessibilityMode] = useState(false)
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    caseSensitive: false,
    regexp: false,
    wholeWord: false,
  })
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const {
    tabs,
    activeTabId,
    activeTab,
    handleTabClick,
    handleTabClose,
    handleNewTab,
    handleContentChange,
    handleCursorChange,
    updateTab,
    addTab,
    switchTab,
  } = useTabManager(initialTabs)

  const { handleSave, handleSaveAs, handleOpenFile } = useFileOperations({
    tabs,
    activeTabId,
    updateTab,
    addTab,
    generateTabId,
  })

  const handleAccessibilityToggle = useCallback(() => {
    setAccessibilityMode(prev => !prev)
  }, [])

  const handleCloseTab = useCallback(() => {
    handleTabClose(activeTabId)
  }, [activeTabId, handleTabClose])

  const keyboardHandlers = useMemo(() => ({
    onSave: handleSave,
    onSaveAs: handleSaveAs,
    onOpen: handleOpenFile,
    onCloseTab: handleCloseTab,
    onNewTab: handleNewTab,
    onSwitchTab: switchTab,
  }), [handleSave, handleSaveAs, handleOpenFile, handleCloseTab, handleNewTab, switchTab])

  useKeyboardShortcuts(keyboardHandlers)

  return (
    <div className="app">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={handleTabClick}
        onTabClose={handleTabClose}
        onNewTab={handleNewTab}
      />
      {activeTab && (
        <Editor
          tabId={activeTab.id}
          initialContent={activeTab.content}
          fileName={activeTab.fileName}
          initialCursorPosition={activeTab.cursorPosition}
          accessibilityMode={accessibilityMode}
          onAccessibilityToggle={handleAccessibilityToggle}
          onChange={handleContentChange}
          onCursorChange={handleCursorChange}
          searchOptions={searchOptions}
          onSearchOptionsChange={setSearchOptions}
          isSearchOpen={isSearchOpen}
          onSearchOpenChange={setIsSearchOpen}
        />
      )}
    </div>
  )
}

export default App
