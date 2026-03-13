import { useState, useCallback } from 'react'
import type { Tab } from '../types'

let tabIdCounter = 4

function generateTabId(): string {
  return `tab-${tabIdCounter++}`
}

export function useTabManager(initialTabs: Tab[]) {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs)
  const [activeTabId, setActiveTabId] = useState<string>(initialTabs[0]?.id || '')

  const activeTab = tabs.find(tab => tab.id === activeTabId)

  const handleTabClick = useCallback((tabId: string) => {
    setActiveTabId(tabId)
  }, [])

  const handleTabClose = useCallback((tabId: string) => {
    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id !== tabId)
      if (newTabs.length === 0) {
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

  const updateTab = useCallback((tabId: string, updates: Partial<Tab>) => {
    setTabs(prevTabs =>
      prevTabs.map(tab =>
        tab.id === tabId ? { ...tab, ...updates } : tab
      )
    )
  }, [])

  const addTab = useCallback((tab: Tab) => {
    setTabs(prevTabs => [...prevTabs, tab])
    setActiveTabId(tab.id)
  }, [])

  const switchTab = useCallback((direction: 'next' | 'prev') => {
    setTabs(currentTabs => {
      const currentIndex = currentTabs.findIndex(tab => tab.id === activeTabId)
      if (currentIndex === -1) return currentTabs

      let newIndex: number
      if (direction === 'prev') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : currentTabs.length - 1
      } else {
        newIndex = currentIndex < currentTabs.length - 1 ? currentIndex + 1 : 0
      }
      setActiveTabId(currentTabs[newIndex].id)
      return currentTabs
    })
  }, [activeTabId])

  return {
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
    generateTabId,
  }
}

export { generateTabId }
