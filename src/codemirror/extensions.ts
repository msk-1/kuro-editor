import { EditorView, Decoration, ViewPlugin, WidgetType } from '@codemirror/view'
import { EditorSelection, RangeSetBuilder } from '@codemirror/state'
import type { DecorationSet, ViewUpdate } from '@codemirror/view'
import type { Extension } from '@codemirror/state'
import { CRLF_PLACEHOLDER } from '../utils/lineEnding'
import { getSearchMatches, getSearchMatchRanges } from '../utils/search'

// Widget for line ending (shown at end of line)
class LineEndingWidget extends WidgetType {
  constructor(readonly type: 'LF' | 'CRLF', readonly isSearchMatch: boolean = false) {
    super()
  }
  toDOM() {
    const span = document.createElement('span')
    span.className = `cm-line-ending-marker ${this.type.toLowerCase()}${this.isSearchMatch ? ' search-match' : ''}`
    span.textContent = this.type === 'CRLF' ? '↵' : '↓'
    span.title = this.type
    return span
  }
  eq(other: LineEndingWidget) {
    return this.type === other.type && this.isSearchMatch === other.isSearchMatch
  }
}

// Decoration definitions
const tabMark = Decoration.mark({ class: 'cm-tab-char' })
const tabMatchMark = Decoration.mark({ class: 'cm-tab-char search-match' })
const fullWidthSpaceMark = Decoration.mark({ class: 'cm-fullwidth-space' })
const fullWidthSpaceMatchMark = Decoration.mark({ class: 'cm-fullwidth-space search-match' })
const crlfPlaceholderMark = Decoration.mark({ class: 'cm-crlf-placeholder' })
const escapeSearchMatchMark = Decoration.mark({ class: 'cm-escape-search-match' })

// Build decorations for whitespace characters
function buildWhitespaceDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()
  const doc = view.state.doc
  const searchMatches = getSearchMatches(view)
  const escapeMatchRanges = getSearchMatchRanges(view)

  const decorations: Array<{ from: number; to: number; decoration: Decoration }> = []

  for (const { from, to } of view.visibleRanges) {
    for (const range of escapeMatchRanges) {
      if (range.from >= from && range.to <= to) {
        decorations.push({ from: range.from, to: range.to, decoration: escapeSearchMatchMark })
      }
    }

    for (let pos = from; pos < to;) {
      const line = doc.lineAt(pos)
      const lineText = line.text
      const lineStart = line.from

      let hasCrlfPlaceholder = false

      for (let i = 0; i < lineText.length; i++) {
        const char = lineText[i]
        const charPos = lineStart + i
        if (charPos >= to) break

        if (char === '\t') {
          const mark = searchMatches.has(charPos) ? tabMatchMark : tabMark
          decorations.push({ from: charPos, to: charPos + 1, decoration: mark })
        } else if (char === '\u3000') {
          const mark = searchMatches.has(charPos) ? fullWidthSpaceMatchMark : fullWidthSpaceMark
          decorations.push({ from: charPos, to: charPos + 1, decoration: mark })
        } else if (char === CRLF_PLACEHOLDER) {
          decorations.push({ from: charPos, to: charPos + 1, decoration: crlfPlaceholderMark })
          hasCrlfPlaceholder = true
        }
      }

      if (line.number < doc.lines && line.to >= from && line.to <= to) {
        const lineEndingType = hasCrlfPlaceholder ? 'CRLF' : 'LF'
        const crlfPos = hasCrlfPlaceholder ? line.to - 1 : -1
        const isSearchMatch = searchMatches.has(line.to) || (crlfPos >= 0 && searchMatches.has(crlfPos))
        const widget = Decoration.widget({
          widget: new LineEndingWidget(lineEndingType, isSearchMatch),
          side: 1,
        })
        decorations.push({ from: line.to, to: line.to, decoration: widget })
      }

      pos = line.to + 1
    }
  }

  decorations.sort((a, b) => a.from - b.from || a.to - b.to)
  for (const { from, to, decoration } of decorations) {
    builder.add(from, to, decoration)
  }

  return builder.finish()
}

// Whitespace visualization plugin
export const whitespacePlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = buildWhitespaceDecorations(view)
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged || update.startState !== update.state) {
        this.decorations = buildWhitespaceDecorations(update.view)
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  }
)

// Extension to fix selection layer visibility in Tauri WebView
export function selectionLayerFix(): Extension {
  let styleInjected = false

  return EditorView.updateListener.of(() => {
    if (!styleInjected) {
      const style = document.createElement('style')
      style.textContent = `
        .cm-editor .cm-scroller {
          background-color: #1e1f22 !important;
        }
        .cm-editor .cm-content {
          background-color: transparent !important;
        }
        .cm-editor .cm-line {
          background-color: transparent !important;
        }
        .cm-editor .cm-activeLine {
          background-color: rgba(38, 40, 46, 0.5) !important;
        }
        .cm-editor .cm-selectionBackground {
          background-color: #264f78 !important;
        }
      `
      document.head.appendChild(style)
      styleInjected = true
    }
  })
}

// Custom rectangular selection extension for Tauri WebView
export function createRectangularSelection(): Extension {
  let isRectSelecting = false
  let startX: number = 0
  let startLine: number = 0

  const xToCol = (view: EditorView, x: number): number => {
    const contentRect = view.contentDOM.getBoundingClientRect()
    const relativeX = x - contentRect.left
    const charWidth = view.defaultCharacterWidth
    return Math.max(0, Math.round(relativeX / charWidth))
  }

  return EditorView.domEventHandlers({
    mousedown(event, view) {
      if (!event.altKey) {
        isRectSelecting = false
        return false
      }

      const pos = view.posAtCoords({ x: event.clientX, y: event.clientY })
      if (pos === null) return false

      const line = view.state.doc.lineAt(pos)
      startLine = line.number
      startX = event.clientX
      isRectSelecting = true

      view.dispatch({
        selection: EditorSelection.cursor(pos),
      })

      event.stopPropagation()
      event.preventDefault()
      return true
    },
    mousemove(event, view) {
      if (!isRectSelecting || !(event.buttons & 1)) {
        return false
      }

      const endPos = view.posAtCoords({ x: event.clientX, y: event.clientY })
      if (endPos === null) return false

      const doc = view.state.doc
      const endLineInfo = doc.lineAt(endPos)
      const endLine = endLineInfo.number

      const startCol = xToCol(view, startX)
      const endCol = xToCol(view, event.clientX)

      const minLine = Math.min(startLine, endLine)
      const maxLine = Math.max(startLine, endLine)
      const minCol = Math.min(startCol, endCol)
      const maxCol = Math.max(startCol, endCol)

      const isLeftward = endCol < startCol
      const isDownward = endLine >= startLine

      const ranges: import('@codemirror/state').SelectionRange[] = []
      for (let lineNum = minLine; lineNum <= maxLine; lineNum++) {
        const line = doc.line(lineNum)
        const lineLength = line.to - line.from

        if (lineLength < minCol) {
          ranges.push(EditorSelection.cursor(line.to))
        } else {
          const fromCol = minCol
          const toCol = Math.min(maxCol, lineLength)
          if (isLeftward) {
            ranges.push(EditorSelection.range(line.from + toCol, line.from + fromCol))
          } else {
            ranges.push(EditorSelection.range(line.from + fromCol, line.from + toCol))
          }
        }
      }

      if (ranges.length > 0) {
        const mainIndex = isDownward ? ranges.length - 1 : 0
        view.dispatch({
          selection: EditorSelection.create(ranges, mainIndex),
        })
      }

      event.stopPropagation()
      event.preventDefault()
      return true
    },
    mouseup() {
      isRectSelecting = false
      return false
    },
  })
}
