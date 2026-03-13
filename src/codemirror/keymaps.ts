import { EditorView } from '@codemirror/view'
import { EditorSelection } from '@codemirror/state'
import type { KeyBinding } from '@codemirror/view'
import {
  indentWithTab,
  toggleComment,
  deleteLine,
  moveLineUp,
  moveLineDown,
  copyLineDown,
  selectLine,
} from '@codemirror/commands'

// Add cursor on line above (for column/multi-cursor editing)
function addCursorAbove(view: EditorView): boolean {
  try {
    const { state } = view
    const doc = state.doc
    const firstRange = state.selection.ranges[0]
    const firstLine = doc.lineAt(firstRange.head)
    const col = firstRange.head - firstLine.from

    if (firstLine.number <= 1) return true

    const targetLine = doc.line(firstLine.number - 1)
    const newPos = Math.min(targetLine.from + col, targetLine.to)

    const newRanges = [
      EditorSelection.cursor(newPos),
      ...state.selection.ranges
    ]

    view.dispatch({
      selection: EditorSelection.create(newRanges, 0),
      scrollIntoView: true,
    })
  } catch (e) {
    console.error('addCursorAbove error:', e)
  }
  return true
}

// Add cursor on line below (for column/multi-cursor editing)
function addCursorBelow(view: EditorView): boolean {
  try {
    const { state } = view
    const doc = state.doc
    const lastRange = state.selection.ranges[state.selection.ranges.length - 1]
    const lastLine = doc.lineAt(lastRange.head)
    const col = lastRange.head - lastLine.from

    if (lastLine.number >= doc.lines) return true

    const targetLine = doc.line(lastLine.number + 1)
    const newPos = Math.min(targetLine.from + col, targetLine.to)

    const newRanges = [
      ...state.selection.ranges,
      EditorSelection.cursor(newPos)
    ]

    view.dispatch({
      selection: EditorSelection.create(newRanges),
      scrollIntoView: true,
    })
  } catch (e) {
    console.error('addCursorBelow error:', e)
  }
  return true
}

// Cancel multi-selection and move to the main cursor position
function cancelSelection(view: EditorView): boolean {
  const { state } = view
  const pos = state.selection.main.head

  view.dispatch({
    selection: EditorSelection.cursor(pos),
    scrollIntoView: true,
  })
  return true
}

// IntelliJ-style keybindings
export const intellijKeymap: KeyBinding[] = [
  { key: 'Escape', run: cancelSelection },
  { key: 'Mod-/', run: toggleComment },
  { key: 'Mod-d', run: copyLineDown },
  { key: 'Mod-Backspace', run: deleteLine },
  { key: 'Alt-Shift-ArrowUp', run: moveLineUp },
  { key: 'Alt-Shift-ArrowDown', run: moveLineDown },
  { key: 'Alt-ArrowUp', run: addCursorAbove, preventDefault: true },
  { key: 'Alt-ArrowDown', run: addCursorBelow, preventDefault: true },
  { key: 'Mod-l', run: selectLine },
  indentWithTab,
]
