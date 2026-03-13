import { useEffect, useRef, useState, useCallback } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, crosshairCursor, drawSelection } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { indentOnInput, bracketMatching } from '@codemirror/language'
import { searchKeymap, highlightSelectionMatches, search, SearchQuery, openSearchPanel } from '@codemirror/search'
import type { SearchOptions, LineEnding } from '../../types'
import { crlfToPlaceholder, placeholderToCrlf, detectLineEnding, isLineEndingSearch, findLineEndingPositions } from '../../utils/lineEnding'
import { processEscapeSequencesForSearch } from '../../utils/escapeSequences'
import { getSearchOptionsFromDOM, replaceWithEscapeSequences, replaceAllWithEscapeSequences } from '../../utils/search'
import { kuroTheme, kuroSyntaxHighlighting } from '../../codemirror/theme'
import { whitespacePlugin, selectionLayerFix, createRectangularSelection } from '../../codemirror/extensions'
import { intellijKeymap } from '../../codemirror/keymaps'
import { languageCompartment, getLanguageExtension } from '../../codemirror/languages'
import './Editor.css'

interface EditorProps {
  readonly tabId?: string
  readonly initialContent?: string
  readonly fileName?: string
  readonly initialCursorPosition?: number
  readonly accessibilityMode?: boolean
  readonly onAccessibilityToggle?: () => void
  readonly onChange?: (content: string) => void
  readonly onCursorChange?: (position: number) => void
  readonly searchOptions?: SearchOptions
  readonly onSearchOptionsChange?: (options: SearchOptions) => void
  readonly isSearchOpen?: boolean
  readonly onSearchOpenChange?: (isOpen: boolean) => void
}

const DEFAULT_FONT_SIZE = 14
const MIN_FONT_SIZE = 8
const MAX_FONT_SIZE = 32

export function Editor({
  tabId,
  initialContent = '',
  fileName = 'Untitled',
  initialCursorPosition = 0,
  accessibilityMode = false,
  onAccessibilityToggle,
  onChange,
  onCursorChange,
  searchOptions,
  onSearchOptionsChange,
  isSearchOpen,
  onSearchOpenChange,
}: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const prevTabIdRef = useRef<string | undefined>(tabId)
  const prevFileNameRef = useRef<string>(fileName)
  const onChangeRef = useRef(onChange)
  const onCursorChangeRef = useRef(onCursorChange)
  onChangeRef.current = onChange
  onCursorChangeRef.current = onCursorChange
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const [lineCount, setLineCount] = useState(1)
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE)
  const [searchMatchCount, setSearchMatchCount] = useState<{ current: number; total: number } | null>(null)
  const [lineEnding, setLineEnding] = useState<LineEnding>(() => detectLineEnding(initialContent))
  const isSearchOpenRef = useRef(isSearchOpen)
  isSearchOpenRef.current = isSearchOpen

  const updateCursorInfo = useCallback((view: EditorView) => {
    const pos = view.state.selection.main.head
    const line = view.state.doc.lineAt(pos)
    setCursorPosition({
      line: line.number,
      column: pos - line.from + 1,
    })
    setLineCount(view.state.doc.lines)
  }, [])

  const updateSearchCount = useCallback((view: EditorView) => {
    const searchPanel = view.dom.querySelector('.cm-search')
    if (!searchPanel) {
      setSearchMatchCount(null)
      return
    }

    const searchInput = searchPanel.querySelector('input[name="search"]') as HTMLInputElement
    if (!searchInput || !searchInput.value) {
      setSearchMatchCount(null)
      return
    }

    const options = getSearchOptionsFromDOM(searchPanel)

    if (!options.regexp && /^\\[rnt]$|^\\r\\n$/.test(searchInput.value)) {
      setSearchMatchCount(null)
      return
    }

    const searchValue = processEscapeSequencesForSearch(searchInput.value, options.regexp)

    if (options.regexp) {
      const lineEndingType = isLineEndingSearch(searchValue)
      if (lineEndingType) {
        const positions = findLineEndingPositions(view.state.doc, lineEndingType)
        const total = positions.length
        const selectionHead = view.state.selection.main.head
        let current = 0
        for (let i = 0; i < positions.length; i++) {
          if (positions[i].from <= selectionHead) {
            current = i + 1
          }
        }
        setSearchMatchCount(total > 0 ? { current: current || 1, total } : null)
        return
      }
    }

    const query = new SearchQuery({
      search: searchValue,
      caseSensitive: options.caseSensitive,
      regexp: options.regexp,
      wholeWord: options.wholeWord,
    })

    if (!query.valid) {
      setSearchMatchCount(null)
      return
    }

    const cursor = query.getCursor(view.state.doc)
    let total = 0
    let current = 0
    const selectionHead = view.state.selection.main.head

    let result = cursor.next()
    while (!result.done) {
      total++
      if (result.value && result.value.from <= selectionHead && result.value.to >= selectionHead) {
        current = total
      }
      result = cursor.next()
    }

    setSearchMatchCount(total > 0 ? { current: current || 1, total } : null)
  }, [])

  useEffect(() => {
    if (!editorRef.current) return

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && onChangeRef.current) {
        const content = placeholderToCrlf(update.state.doc.toString())
        onChangeRef.current(content)
      }
      if (update.selectionSet || update.docChanged) {
        updateCursorInfo(update.view)
        if (onCursorChangeRef.current) {
          onCursorChangeRef.current(update.state.selection.main.head)
        }
      }
      updateSearchCount(update.view)
    })

    const processedContent = crlfToPlaceholder(initialContent)

    const state = EditorState.create({
      doc: processedContent,
      extensions: [
        EditorState.allowMultipleSelections.of(true),
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        history(),
        indentOnInput(),
        bracketMatching({ brackets: '()[]{}<>' }),
        search({ top: true }),
        highlightSelectionMatches(),
        drawSelection(),
        selectionLayerFix(),
        createRectangularSelection(),
        crosshairCursor(),
        whitespacePlugin,
        keymap.of([...intellijKeymap, ...defaultKeymap, ...historyKeymap, ...searchKeymap]),
        languageCompartment.of(getLanguageExtension(fileName)),
        kuroSyntaxHighlighting,
        kuroTheme,
        updateListener,
      ],
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view

    if (initialCursorPosition > 0 && initialCursorPosition <= initialContent.length) {
      view.dispatch({
        selection: { anchor: initialCursorPosition },
        scrollIntoView: true,
      })
    }

    if (isSearchOpenRef.current) {
      openSearchPanel(view)
    }

    updateCursorInfo(view)
    view.focus()

    return () => {
      view.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!viewRef.current) return

    const isTabSwitch = prevTabIdRef.current !== tabId
    prevTabIdRef.current = tabId

    const processedContent = crlfToPlaceholder(initialContent)
    const currentContent = viewRef.current.state.doc.toString()

    if (processedContent !== currentContent) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: processedContent,
        },
      })
    }

    if (prevFileNameRef.current !== fileName) {
      prevFileNameRef.current = fileName
      viewRef.current.dispatch({
        effects: languageCompartment.reconfigure(getLanguageExtension(fileName)),
      })
    }

    if (isTabSwitch && initialCursorPosition >= 0) {
      const pos = Math.min(initialCursorPosition, processedContent.length)
      viewRef.current.dispatch({
        selection: { anchor: pos },
        scrollIntoView: true,
      })
    }

    setLineEnding(detectLineEnding(initialContent))
  }, [tabId, initialContent, initialCursorPosition, fileName])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    const applySearchOptions = () => {
      if (!searchOptions) return
      const searchPanel = editor.querySelector('.cm-search')
      if (!searchPanel) return

      const caseCheckbox = searchPanel.querySelector('input[name="case"]') as HTMLInputElement
      const reCheckbox = searchPanel.querySelector('input[name="re"]') as HTMLInputElement
      const wordCheckbox = searchPanel.querySelector('input[name="word"]') as HTMLInputElement

      if (caseCheckbox && caseCheckbox.checked !== searchOptions.caseSensitive) {
        caseCheckbox.click()
      }
      if (reCheckbox && reCheckbox.checked !== searchOptions.regexp) {
        reCheckbox.click()
      }
      if (wordCheckbox && wordCheckbox.checked !== searchOptions.wholeWord) {
        wordCheckbox.click()
      }
    }

    let wasSearchPanelVisible = !!editor.querySelector('.cm-search')

    const observer = new MutationObserver(() => {
      const isSearchPanelVisible = !!editor.querySelector('.cm-search')

      if (isSearchPanelVisible && !wasSearchPanelVisible) {
        setTimeout(applySearchOptions, 10)
        if (onSearchOpenChange) {
          onSearchOpenChange(true)
        }
      } else if (!isSearchPanelVisible && wasSearchPanelVisible) {
        if (onSearchOpenChange) {
          onSearchOpenChange(false)
        }
      }

      wasSearchPanelVisible = isSearchPanelVisible
    })

    observer.observe(editor, { childList: true, subtree: true })

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      if (target.matches('.cm-search input[type="checkbox"]') && onSearchOptionsChange) {
        setTimeout(() => {
          const searchPanel = editor.querySelector('.cm-search')
          if (searchPanel) {
            const options = getSearchOptionsFromDOM(searchPanel)
            onSearchOptionsChange(options)
          }
          const searchInput = editor.querySelector('.cm-search .cm-textfield[name="search"]') as HTMLInputElement
          if (searchInput) {
            searchInput.focus()
          }
        }, 0)
      }

      if (target.matches('.cm-button[name="replace"]') && viewRef.current) {
        e.preventDefault()
        e.stopPropagation()
        replaceWithEscapeSequences(viewRef.current)
        return
      }

      if (target.matches('.cm-button[name="replaceAll"]') && viewRef.current) {
        e.preventDefault()
        e.stopPropagation()
        replaceAllWithEscapeSequences(viewRef.current)
        return
      }
    }

    editor.addEventListener('click', handleClick, true)
    return () => {
      editor.removeEventListener('click', handleClick, true)
      observer.disconnect()
    }
  }, [searchOptions, onSearchOptionsChange, onSearchOpenChange])

  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      setFontSize(prev => {
        const delta = e.deltaY > 0 ? -1 : 1
        return Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, prev + delta))
      })
    }
  }, [])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    editor.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      editor.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dom.style.setProperty('--editor-font-size', `${fontSize}px`)
    }
  }, [fontSize])

  const zoomPercent = Math.round((fontSize / DEFAULT_FONT_SIZE) * 100)

  return (
    <div className={`editor-panel ${accessibilityMode ? 'accessibility-mode' : ''}`}>
      <div className="editor-area" ref={editorRef} />
      <div className="editor-statusbar">
        {searchMatchCount && (
          <span className="status-item search-count">
            {searchMatchCount.current} of {searchMatchCount.total}
          </span>
        )}
        <span className="status-spacer" />
        <button
          className={`status-btn accessibility-toggle ${accessibilityMode ? 'active' : ''}`}
          onClick={onAccessibilityToggle}
          title="Toggle accessibility mode (OpenDyslexic font)"
        >
          A11y
        </button>
        <span className="status-item cursor-pos">Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
        <span className="status-item">{lineCount} lines</span>
        <span className="status-item">{fileName.split('.').pop()?.toUpperCase() || 'TXT'}</span>
        <button
          className="status-btn"
          onClick={() => setLineEnding(prev => prev === 'LF' ? 'CRLF' : 'LF')}
          title="Click to toggle line ending"
        >
          {lineEnding}
        </button>
        <span className="status-item">UTF-8</span>
        {zoomPercent !== 100 && <span className="status-item zoom">{zoomPercent}%</span>}
      </div>
    </div>
  )
}
