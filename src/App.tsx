import { useState, useCallback, useEffect } from 'react'
import { Editor } from './components/Editor'
import { TabBar, Tab } from './components/TabBar'
import './App.css'

const sampleTypeScript = `// Welcome to Kuro Editor
import { useState, useEffect } from 'react'

interface User {
  id: number
  name: string
  email: string
  isActive: boolean
}

async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users')
  const data = await response.json()
  return data
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name} - {user.email}
        </li>
      ))}
    </ul>
  )
}

console.log('Kuro Editor is ready!')
`

const sampleCSS = `/* Kuro Theme Styles */
:root {
  --kuro-bg: #0d0d0d;
  --kuro-accent: #b4e61d;
  --kuro-text: #e0e0e0;
}

.container {
  display: flex;
  flex-direction: column;
  background-color: var(--kuro-bg);
  color: var(--kuro-text);
  min-height: 100vh;
}

.button {
  padding: 8px 16px;
  border: 1px solid var(--kuro-accent);
  border-radius: 4px;
  background: transparent;
  color: var(--kuro-accent);
  cursor: pointer;
  transition: all 0.2s ease;
}

.button:hover {
  background-color: var(--kuro-accent);
  color: var(--kuro-bg);
}
`

const sampleJSON = `{
  "name": "kuro-editor",
  "version": "1.0.0",
  "description": "A modern dark-themed code editor",
  "features": [
    "Syntax highlighting",
    "Multiple tabs",
    "Dark theme"
  ],
  "theme": {
    "background": "#0d0d0d",
    "accent": "#b4e61d",
    "foreground": "#e0e0e0"
  },
  "supported_languages": [
    "typescript",
    "javascript",
    "css",
    "html",
    "json",
    "markdown"
  ]
}
`

let tabIdCounter = 4

function generateTabId(): string {
  return `tab-${tabIdCounter++}`
}

const initialTabs: Tab[] = [
  { id: 'tab-1', fileName: 'welcome.tsx', content: sampleTypeScript, isModified: false },
  { id: 'tab-2', fileName: 'styles.css', content: sampleCSS, isModified: false },
  { id: 'tab-3', fileName: 'config.json', content: sampleJSON, isModified: false },
]

function App() {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs)
  const [activeTabId, setActiveTabId] = useState<string>('tab-1')
  const [accessibilityMode, setAccessibilityMode] = useState(false)

  const activeTab = tabs.find(tab => tab.id === activeTabId)

  const handleAccessibilityToggle = useCallback(() => {
    setAccessibilityMode(prev => !prev)
  }, [])

  const handleTabClick = useCallback((tabId: string) => {
    setActiveTabId(tabId)
  }, [])

  const handleTabClose = useCallback((tabId: string) => {
    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id !== tabId)
      if (newTabs.length === 0) {
        // Keep at least one tab
        const newTab: Tab = {
          id: generateTabId(),
          fileName: 'Untitled',
          content: '',
          isModified: false,
        }
        setActiveTabId(newTab.id)
        return [newTab]
      }
      if (tabId === activeTabId) {
        const closedIndex = prevTabs.findIndex(tab => tab.id === tabId)
        const newActiveIndex = Math.min(closedIndex, newTabs.length - 1)
        setActiveTabId(newTabs[newActiveIndex].id)
      }
      return newTabs
    })
  }, [activeTabId])

  const handleNewTab = useCallback(() => {
    const newTab: Tab = {
      id: generateTabId(),
      fileName: 'Untitled',
      content: '',
      isModified: false,
    }
    setTabs(prevTabs => [...prevTabs, newTab])
    setActiveTabId(newTab.id)
  }, [])

  const handleContentChange = useCallback((content: string) => {
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === activeTabId
          ? { ...tab, content, isModified: true }
          : tab
      )
    )
  }, [activeTabId])

  const handleCursorChange = useCallback((position: number) => {
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === activeTabId
          ? { ...tab, cursorPosition: position }
          : tab
      )
    )
  }, [activeTabId])

  // Save file
  const handleSave = useCallback(async () => {
    const tab = tabs.find(t => t.id === activeTabId)
    if (!tab) return

    if (tab.filePath) {
      // Save to existing file
      const result = await window.ipcRenderer.invoke('file:save', {
        filePath: tab.filePath,
        content: tab.content,
      })
      if (result.success) {
        setTabs(prevTabs =>
          prevTabs.map(t =>
            t.id === activeTabId ? { ...t, isModified: false } : t
          )
        )
      }
    } else {
      // Save as new file
      handleSaveAs()
    }
  }, [tabs, activeTabId])

  const handleSaveAs = useCallback(async () => {
    const tab = tabs.find(t => t.id === activeTabId)
    if (!tab) return

    const result = await window.ipcRenderer.invoke('file:saveAs', {
      content: tab.content,
      defaultName: tab.fileName,
    })

    if (result?.success) {
      setTabs(prevTabs =>
        prevTabs.map(t =>
          t.id === activeTabId
            ? { ...t, fileName: result.fileName, filePath: result.filePath, isModified: false }
            : t
        )
      )
    }
  }, [tabs, activeTabId])

  // Open file
  const handleOpenFile = useCallback(async () => {
    const result = await window.ipcRenderer.invoke('file:open')
    if (result) {
      const newTab: Tab = {
        id: generateTabId(),
        fileName: result.fileName,
        filePath: result.filePath,
        content: result.content,
        isModified: false,
      }
      setTabs(prevTabs => [...prevTabs, newTab])
      setActiveTabId(newTab.id)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S for save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (e.shiftKey) {
          handleSaveAs()
        } else {
          handleSave()
        }
        return
      }

      // Cmd/Ctrl + O for open
      if ((e.metaKey || e.ctrlKey) && e.key === 'o') {
        e.preventDefault()
        handleOpenFile()
        return
      }

      // Cmd/Ctrl + Shift + [ or ] for tab switching
      if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
        if (e.key === '[' || e.key === ']') {
          e.preventDefault()
          setTabs(currentTabs => {
            const currentIndex = currentTabs.findIndex(tab => tab.id === activeTabId)
            if (currentIndex === -1) return currentTabs

            let newIndex: number
            if (e.key === '[') {
              newIndex = currentIndex > 0 ? currentIndex - 1 : currentTabs.length - 1
            } else {
              newIndex = currentIndex < currentTabs.length - 1 ? currentIndex + 1 : 0
            }
            setActiveTabId(currentTabs[newIndex].id)
            return currentTabs
          })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTabId, handleSave, handleSaveAs, handleOpenFile])

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
          key={activeTab.id}
          initialContent={activeTab.content}
          fileName={activeTab.fileName}
          initialCursorPosition={activeTab.cursorPosition}
          accessibilityMode={accessibilityMode}
          onAccessibilityToggle={handleAccessibilityToggle}
          onChange={handleContentChange}
          onCursorChange={handleCursorChange}
        />
      )}
    </div>
  )
}

export default App