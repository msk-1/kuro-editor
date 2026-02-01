import { useEffect, useRef, useState, useCallback } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { syntaxHighlighting, HighlightStyle, indentOnInput, bracketMatching } from '@codemirror/language'
import { searchKeymap, highlightSelectionMatches, search, getSearchQuery, SearchQuery } from '@codemirror/search'
import { javascript } from '@codemirror/lang-javascript'
import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { json } from '@codemirror/lang-json'
import { markdown } from '@codemirror/lang-markdown'
import { tags } from '@lezer/highlight'
import './Editor.css'

// Kuro theme colors - muted palette with better contrast
const kuroColors = {
  background: '#1a1a1a',
  foreground: '#d8d8d8',
  accent: '#a8c878',
  comment: '#707070',
  keyword: '#a8c878',
  string: '#98b888',
  number: '#e0b888',
  function: '#98bbd8',
  variable: '#d8d8d8',
  type: '#dcc080',
  operator: '#88b8b8',
  property: '#d09898',
  punctuation: '#909090',
  selection: '#2d3d1f',
  activeLine: '#222222',
  gutter: '#606060',
  gutterActive: '#a8c878',
}

// Syntax highlighting theme
const kuroHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: kuroColors.keyword, fontWeight: '500' },
  { tag: tags.controlKeyword, color: kuroColors.keyword, fontWeight: '500' },
  { tag: tags.moduleKeyword, color: kuroColors.keyword, fontWeight: '500' },
  { tag: tags.operatorKeyword, color: kuroColors.keyword },
  { tag: tags.definitionKeyword, color: kuroColors.keyword },
  { tag: tags.comment, color: kuroColors.comment, fontStyle: 'italic' },
  { tag: tags.lineComment, color: kuroColors.comment, fontStyle: 'italic' },
  { tag: tags.blockComment, color: kuroColors.comment, fontStyle: 'italic' },
  { tag: tags.string, color: kuroColors.string },
  { tag: tags.special(tags.string), color: kuroColors.string },
  { tag: tags.number, color: kuroColors.number },
  { tag: tags.bool, color: kuroColors.number },
  { tag: tags.null, color: kuroColors.number },
  { tag: tags.function(tags.variableName), color: kuroColors.function },
  { tag: tags.function(tags.propertyName), color: kuroColors.function },
  { tag: tags.definition(tags.variableName), color: kuroColors.variable },
  { tag: tags.definition(tags.propertyName), color: kuroColors.property },
  { tag: tags.variableName, color: kuroColors.variable },
  { tag: tags.propertyName, color: kuroColors.property },
  { tag: tags.typeName, color: kuroColors.type },
  { tag: tags.className, color: kuroColors.type },
  { tag: tags.labelName, color: kuroColors.property },
  { tag: tags.attributeName, color: kuroColors.property },
  { tag: tags.attributeValue, color: kuroColors.string },
  { tag: tags.operator, color: kuroColors.operator },
  { tag: tags.punctuation, color: kuroColors.punctuation },
  { tag: tags.bracket, color: kuroColors.punctuation },
  { tag: tags.angleBracket, color: kuroColors.punctuation },
  { tag: tags.squareBracket, color: kuroColors.punctuation },
  { tag: tags.paren, color: kuroColors.punctuation },
  { tag: tags.brace, color: kuroColors.punctuation },
  { tag: tags.tagName, color: kuroColors.property },
  { tag: tags.self, color: kuroColors.keyword },
  { tag: tags.regexp, color: kuroColors.string },
  { tag: tags.escape, color: kuroColors.operator },
  { tag: tags.link, color: kuroColors.function, textDecoration: 'underline' },
  { tag: tags.url, color: kuroColors.function },
  { tag: tags.heading, color: kuroColors.accent, fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strong, fontWeight: 'bold' },
])

// Editor theme
const kuroTheme = EditorView.theme({
  '&': {
    backgroundColor: kuroColors.background,
    color: kuroColors.foreground,
    height: '100%',
    '--editor-font-size': '14px',
  },
  '.cm-content': {
    fontFamily: "var(--editor-font-family, 'Consolas', 'Monaco', 'Courier New', monospace)",
    fontSize: 'var(--editor-font-size, 14px)',
    lineHeight: 'var(--editor-line-height, 1.5)',
    letterSpacing: 'var(--editor-letter-spacing, normal)',
    wordSpacing: 'var(--editor-word-spacing, normal)',
    caretColor: kuroColors.accent,
    padding: '8px 0',
  },
  '.cm-cursor': {
    borderLeftColor: kuroColors.accent,
    borderLeftWidth: '2px',
  },
  '.cm-selectionBackground': {
    backgroundColor: `${kuroColors.selection} !important`,
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: `${kuroColors.selection} !important`,
  },
  '.cm-activeLine': {
    backgroundColor: kuroColors.activeLine,
  },
  '.cm-gutters': {
    backgroundColor: kuroColors.background,
    color: kuroColors.gutter,
    border: 'none',
    paddingRight: '8px',
    fontSize: 'var(--editor-font-size, 14px)',
    fontFamily: "var(--editor-font-family, 'Consolas', 'Monaco', 'Courier New', monospace)",
    lineHeight: 'var(--editor-line-height, 1.5)',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 8px 0 16px',
    minWidth: '40px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: kuroColors.activeLine,
    color: kuroColors.gutterActive,
  },
  '.cm-matchingBracket': {
    backgroundColor: '#3d5c0f',
    outline: `1px solid ${kuroColors.accent}`,
  },
  '.cm-nonmatchingBracket': {
    backgroundColor: '#5c0f0f',
    outline: '1px solid #e06c75',
  },
  '.cm-scroller': {
    overflow: 'auto',
  },
  '&::-webkit-scrollbar, .cm-scroller::-webkit-scrollbar': {
    width: '12px',
    height: '12px',
  },
  '&::-webkit-scrollbar-track, .cm-scroller::-webkit-scrollbar-track': {
    backgroundColor: kuroColors.background,
  },
  '&::-webkit-scrollbar-thumb, .cm-scroller::-webkit-scrollbar-thumb': {
    backgroundColor: '#2a2a2a',
    border: `3px solid ${kuroColors.background}`,
    borderRadius: '6px',
  },
  '&::-webkit-scrollbar-thumb:hover, .cm-scroller::-webkit-scrollbar-thumb:hover': {
    backgroundColor: '#3a3a3a',
  },
  // Search panel styles - IntelliJ style
  '.cm-panels': {
    backgroundColor: '#2b2b2b !important',
    color: '#bbbbbb !important',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif !important',
  },
  '.cm-panels.cm-panels-top': {
    borderBottom: '1px solid #3c3c3c !important',
  },
  '.cm-search': {
    display: 'flex !important',
    flexWrap: 'wrap !important',
    alignItems: 'center !important',
    padding: '6px 8px !important',
    fontSize: '12px !important',
    gap: '4px !important',
  },
  '.cm-search br': {
    display: 'block !important',
    flexBasis: '100% !important',
    height: '4px !important',
  },
  '.cm-search button[name="select"]': {
    display: 'none !important',
  },
  '.cm-search label': {
    display: 'inline-flex !important',
    alignItems: 'center !important',
    justifyContent: 'center !important',
    cursor: 'pointer !important',
    color: '#808080 !important',
    fontSize: '12px !important',
    fontWeight: '600 !important',
    padding: '3px 6px !important',
    borderRadius: '3px !important',
    border: '1px solid transparent !important',
    minWidth: '28px !important',
    textIndent: '-9999px !important',
    overflow: 'hidden !important',
    position: 'relative !important',
  },
  '.cm-search label::after': {
    position: 'absolute !important',
    left: '50% !important',
    top: '50% !important',
    transform: 'translate(-50%, -50%) !important',
    textIndent: '0 !important',
    fontFamily: 'monospace !important',
  },
  '.cm-search label:hover': {
    backgroundColor: '#3c3c3c !important',
    borderColor: '#4c4c4c !important',
  },
  '.cm-search label:has(input:checked)': {
    backgroundColor: '#4a88c7 !important',
    color: '#ffffff !important',
    borderColor: '#4a88c7 !important',
  },
  '.cm-search input[type="checkbox"]': {
    display: 'none !important',
    visibility: 'hidden !important',
    width: '0 !important',
    height: '0 !important',
  },
  '.cm-panel input[type="checkbox"]': {
    display: 'none !important',
  },
  'input[type="checkbox"]': {
    display: 'none !important',
  },
  '.cm-search label[for*="case"]::after, .cm-search label:has(input[name="case"])::after': {
    content: '"Aa" !important',
  },
  '.cm-search label[for*="word"]::after, .cm-search label:has(input[name="word"])::after': {
    content: '"W" !important',
  },
  '.cm-search label[for*="re"]::after, .cm-search label:has(input[name="re"])::after': {
    content: '".*" !important',
  },
  '.cm-textfield': {
    backgroundColor: '#1e1e1e !important',
    border: '1px solid #3c3c3c !important',
    borderRadius: '3px !important',
    color: '#bbbbbb !important',
    padding: '4px 8px !important',
    fontSize: '12px !important',
    outline: 'none !important',
    minWidth: '180px !important',
  },
  '.cm-textfield:focus': {
    borderColor: '#4a88c7 !important',
    boxShadow: '0 0 0 1px #4a88c7 !important',
  },
  '.cm-button': {
    background: 'transparent !important',
    border: '1px solid transparent !important',
    borderRadius: '3px !important',
    color: '#bbbbbb !important',
    padding: '4px 6px !important',
    cursor: 'pointer !important',
    fontSize: '14px !important',
    fontFamily: 'system-ui !important',
    lineHeight: '1 !important',
    minWidth: '24px !important',
    textIndent: '-9999px !important',
    overflow: 'hidden !important',
    position: 'relative !important',
  },
  '.cm-button::after': {
    position: 'absolute !important',
    left: '50% !important',
    top: '50% !important',
    transform: 'translate(-50%, -50%) !important',
    textIndent: '0 !important',
  },
  '.cm-button:hover': {
    background: '#3c3c3c !important',
    borderColor: '#4c4c4c !important',
  },
  '.cm-button[name="next"]::after': {
    content: '"↓" !important',
  },
  '.cm-button[name="prev"]::after': {
    content: '"↑" !important',
  },
  '.cm-button[name="replace"]::after': {
    content: '"→" !important',
  },
  '.cm-button[name="replaceAll"]::after': {
    content: '"⇉" !important',
  },
  '.cm-button[name="close"], .cm-search button:last-of-type': {
    marginLeft: 'auto !important',
    padding: '6px 10px !important',
    minWidth: '28px !important',
  },
  '.cm-button[name="close"]::after, .cm-search button:last-of-type::after': {
    content: '"✕" !important',
    fontSize: '16px !important',
    fontWeight: 'bold !important',
    color: '#bbbbbb !important',
  },
  '.cm-button[name="close"]:hover, .cm-search button:last-of-type:hover': {
    background: '#c75450 !important',
  },
  '.cm-button[name="close"]:hover::after, .cm-search button:last-of-type:hover::after': {
    color: '#ffffff !important',
  },
  '.cm-search input[type="checkbox"]': {
    accentColor: '#4a88c7 !important',
    width: '12px !important',
    height: '12px !important',
  },
  '.cm-searchMatch': {
    backgroundColor: 'rgba(97, 175, 239, 0.3) !important',
  },
  '.cm-searchMatch-selected': {
    backgroundColor: '#214283 !important',
  },
})

// Language detection based on file extension
function getLanguageExtension(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'js':
    case 'jsx':
      return javascript({ jsx: true })
    case 'ts':
    case 'tsx':
      return javascript({ jsx: true, typescript: true })
    case 'css':
    case 'scss':
    case 'less':
      return css()
    case 'html':
    case 'htm':
      return html()
    case 'json':
      return json()
    case 'md':
    case 'markdown':
      return markdown()
    default:
      return javascript({ jsx: true, typescript: true })
  }
}

interface EditorProps {
  initialContent?: string
  fileName?: string
  initialCursorPosition?: number
  accessibilityMode?: boolean
  onAccessibilityToggle?: () => void
  onChange?: (content: string) => void
  onCursorChange?: (position: number) => void
}

const DEFAULT_FONT_SIZE = 14
const MIN_FONT_SIZE = 8
const MAX_FONT_SIZE = 32

export function Editor({ initialContent = '', fileName = 'Untitled', initialCursorPosition = 0, accessibilityMode = false, onAccessibilityToggle, onChange, onCursorChange }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const [lineCount, setLineCount] = useState(1)
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE)
  const [searchMatchCount, setSearchMatchCount] = useState<{ current: number; total: number } | null>(null)

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
    const query = getSearchQuery(view.state)
    if (!query.valid || !query.search) {
      setSearchMatchCount(null)
      return
    }

    const cursor = query.getCursor(view.state.doc)
    let total = 0
    let current = 0
    const selectionHead = view.state.selection.main.head

    while (!cursor.next().done) {
      total++
      if (cursor.value.from <= selectionHead && cursor.value.to >= selectionHead) {
        current = total
      }
    }

    setSearchMatchCount(total > 0 ? { current: current || 1, total } : null)
  }, [])

  useEffect(() => {
    if (!editorRef.current) return

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && onChange) {
        onChange(update.state.doc.toString())
      }
      if (update.selectionSet || update.docChanged) {
        updateCursorInfo(update.view)
        if (onCursorChange) {
          onCursorChange(update.state.selection.main.head)
        }
      }
      // Update search match count
      updateSearchCount(update.view)
    })

    const state = EditorState.create({
      doc: initialContent,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        history(),
        indentOnInput(),
        bracketMatching(),
        search({ top: true }),
        highlightSelectionMatches(),
        keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
        getLanguageExtension(fileName),
        syntaxHighlighting(kuroHighlightStyle),
        kuroTheme,
        updateListener,
      ],
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view

    // Restore cursor position
    if (initialCursorPosition > 0 && initialCursorPosition <= initialContent.length) {
      view.dispatch({
        selection: { anchor: initialCursorPosition },
        scrollIntoView: true,
      })
    }

    updateCursorInfo(view)
    view.focus()

    return () => {
      view.destroy()
    }
  }, [fileName])

  // Update content when initialContent changes
  useEffect(() => {
    if (viewRef.current && initialContent !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: initialContent,
        },
      })
    }
  }, [initialContent])

  // Focus search input after clicking checkbox in search panel
  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.matches('.cm-search input[type="checkbox"]')) {
        setTimeout(() => {
          const searchInput = editor.querySelector('.cm-search .cm-textfield[name="search"]') as HTMLInputElement
          if (searchInput) {
            searchInput.focus()
          }
        }, 0)
      }
    }

    editor.addEventListener('click', handleClick)
    return () => editor.removeEventListener('click', handleClick)
  }, [])

  // Handle zoom with Ctrl/Cmd + wheel
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

  // Update font size in editor
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
        <span className="status-item">UTF-8</span>
        {zoomPercent !== 100 && <span className="status-item zoom">{zoomPercent}%</span>}
      </div>
    </div>
  )
}