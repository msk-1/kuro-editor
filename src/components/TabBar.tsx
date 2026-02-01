import './TabBar.css'

function getFileIcon(fileName: string): { icon: string; color: string } {
  const ext = fileName.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'ts':
      return { icon: 'TS', color: '#3178c6' }
    case 'tsx':
      return { icon: 'TX', color: '#3178c6' }
    case 'js':
      return { icon: 'JS', color: '#f7df1e' }
    case 'jsx':
      return { icon: 'JX', color: '#f7df1e' }
    case 'css':
      return { icon: '#', color: '#264de4' }
    case 'scss':
    case 'sass':
      return { icon: 'S', color: '#cc6699' }
    case 'html':
    case 'htm':
      return { icon: '<>', color: '#e34c26' }
    case 'json':
      return { icon: '{}', color: '#cbcb41' }
    case 'md':
    case 'markdown':
      return { icon: 'M', color: '#519aba' }
    case 'py':
      return { icon: 'Py', color: '#3572A5' }
    case 'go':
      return { icon: 'Go', color: '#00add8' }
    case 'rs':
      return { icon: 'Rs', color: '#dea584' }
    case 'java':
      return { icon: 'J', color: '#b07219' }
    case 'c':
      return { icon: 'C', color: '#555555' }
    case 'cpp':
    case 'cc':
      return { icon: 'C+', color: '#f34b7d' }
    case 'rb':
      return { icon: 'Rb', color: '#701516' }
    case 'php':
      return { icon: 'P', color: '#4F5D95' }
    case 'sql':
      return { icon: 'Q', color: '#e38c00' }
    case 'yaml':
    case 'yml':
      return { icon: 'Y', color: '#cb171e' }
    case 'xml':
      return { icon: 'X', color: '#e37933' }
    case 'sh':
    case 'bash':
      return { icon: '$', color: '#89e051' }
    default:
      return { icon: '◇', color: '#808080' }
  }
}

export interface Tab {
  id: string
  fileName: string
  filePath?: string
  content: string
  isModified: boolean
  cursorPosition?: number
}

interface TabBarProps {
  tabs: Tab[]
  activeTabId: string
  onTabClick: (tabId: string) => void
  onTabClose: (tabId: string) => void
  onNewTab: () => void
}

export function TabBar({ tabs, activeTabId, onTabClick, onTabClose, onNewTab }: TabBarProps) {
  const handleClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation()
    onTabClose(tabId)
  }

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only create new tab if clicking on empty area (not on a tab)
    if (e.target === e.currentTarget) {
      onNewTab()
    }
  }

  const handleMouseDown = (e: React.MouseEvent, tabId: string) => {
    // Middle click (scroll wheel) to close tab
    if (e.button === 1) {
      e.preventDefault()
      onTabClose(tabId)
    }
  }

  return (
    <div className="tabbar" onDoubleClick={handleDoubleClick}>
      <div className="tabs-container" onDoubleClick={handleDoubleClick}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
            onClick={() => onTabClick(tab.id)}
            onMouseDown={(e) => handleMouseDown(e, tab.id)}
          >
            <span className="tab-icon" style={{ color: getFileIcon(tab.fileName).color }}>
              {getFileIcon(tab.fileName).icon}
            </span>
            <span className="tab-name">
              {tab.isModified && <span className="modified-indicator">●</span>}
              {tab.fileName}
            </span>
            <button
              className="tab-close"
              onClick={(e) => handleClose(e, tab.id)}
              title="Close"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button className="new-tab-btn" onClick={onNewTab} title="New Tab">
        +
      </button>
    </div>
  )
}