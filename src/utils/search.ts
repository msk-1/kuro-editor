import { EditorView } from '@codemirror/view'
import { SearchQuery } from '@codemirror/search'
import type { SearchOptions } from '../types'
import { CRLF_PLACEHOLDER, isLineEndingSearch, findLineEndingPositions } from './lineEnding'
import { processEscapeSequencesForSearch, processEscapeSequencesForReplace } from './escapeSequences'

// Read search options from DOM checkboxes
export function getSearchOptionsFromDOM(searchPanel: Element): SearchOptions {
  const caseCheckbox = searchPanel.querySelector('input[name="case"]') as HTMLInputElement
  const reCheckbox = searchPanel.querySelector('input[name="re"]') as HTMLInputElement
  const wordCheckbox = searchPanel.querySelector('input[name="word"]') as HTMLInputElement

  return {
    caseSensitive: caseCheckbox?.checked ?? false,
    regexp: reCheckbox?.checked ?? false,
    wholeWord: wordCheckbox?.checked ?? false,
  }
}

interface ProcessedQuery {
  query: SearchQuery
  searchValue: string
  replaceValue: string
  options: SearchOptions
}

// Create a search query with escape sequence support
export function createProcessedQuery(view: EditorView): ProcessedQuery | null {
  const searchPanel = view.dom.querySelector('.cm-search')
  if (!searchPanel) return null

  const searchInput = searchPanel.querySelector('input[name="search"]') as HTMLInputElement
  const replaceInput = searchPanel.querySelector('input[name="replace"]') as HTMLInputElement
  if (!searchInput) return null

  const options = getSearchOptionsFromDOM(searchPanel)
  const searchValue = processEscapeSequencesForSearch(searchInput.value, options.regexp)
  const replaceValue = replaceInput
    ? processEscapeSequencesForReplace(replaceInput.value, searchValue, options.regexp)
    : ''

  const query = new SearchQuery({
    search: searchValue,
    caseSensitive: options.caseSensitive,
    regexp: options.regexp,
    wholeWord: options.wholeWord,
  })

  return { query, searchValue, replaceValue, options }
}

// Custom replace that supports escape sequences
export function replaceWithEscapeSequences(view: EditorView): boolean {
  const processed = createProcessedQuery(view)
  if (!processed) return false

  const { searchValue, replaceValue, options } = processed
  const lineEndingType = options.regexp ? isLineEndingSearch(searchValue) : null

  if (lineEndingType) {
    const positions = findLineEndingPositions(view.state.doc, lineEndingType)
    if (positions.length === 0) return false

    const cursorPos = view.state.selection.main.from
    const nextPos = positions.find(p => p.from >= cursorPos) || positions[0]

    if (lineEndingType === 'LF') {
      view.dispatch({
        changes: { from: nextPos.from, to: nextPos.to, insert: CRLF_PLACEHOLDER },
        selection: { anchor: nextPos.from + 1 },
      })
    } else {
      view.dispatch({
        changes: { from: nextPos.from, to: nextPos.to, insert: '' },
        selection: { anchor: nextPos.from },
      })
    }
    return true
  }

  if (!processed.query.valid) return false
  const { query } = processed

  const cursor = query.getCursor(view.state.doc, view.state.selection.main.from)
  const match = cursor.next()

  if (!match.done && match.value) {
    view.dispatch({
      changes: { from: match.value.from, to: match.value.to, insert: replaceValue },
      selection: { anchor: match.value.from + replaceValue.length },
    })
    return true
  }

  return false
}

// Custom replace all that supports escape sequences
export function replaceAllWithEscapeSequences(view: EditorView): boolean {
  const processed = createProcessedQuery(view)
  if (!processed) return false

  const { searchValue, replaceValue, options } = processed
  const lineEndingType = options.regexp ? isLineEndingSearch(searchValue) : null

  if (lineEndingType) {
    const positions = findLineEndingPositions(view.state.doc, lineEndingType)
    if (positions.length === 0) return false

    const changes: { from: number; to: number; insert: string }[] = []
    for (const pos of positions.reverse()) {
      if (lineEndingType === 'LF') {
        changes.push({ from: pos.from, to: pos.to, insert: CRLF_PLACEHOLDER })
      } else {
        changes.push({ from: pos.from, to: pos.to, insert: '' })
      }
    }

    if (changes.length > 0) {
      view.dispatch({ changes: changes.reverse() })
      return true
    }
    return false
  }

  if (!processed.query.valid) return false
  const { query } = processed

  const changes: { from: number; to: number; insert: string }[] = []
  const cursor = query.getCursor(view.state.doc)

  let result = cursor.next()
  while (!result.done && result.value) {
    changes.push({
      from: result.value.from,
      to: result.value.to,
      insert: replaceValue,
    })
    result = cursor.next()
  }

  if (changes.length > 0) {
    view.dispatch({ changes })
    return true
  }

  return false
}

// Collect search match positions (with escape sequence support)
export function getSearchMatches(view: EditorView): Set<number> {
  const matches = new Set<number>()

  const searchPanel = view.dom.querySelector('.cm-search')
  if (!searchPanel) return matches

  const searchInput = searchPanel.querySelector('input[name="search"]') as HTMLInputElement
  if (!searchInput || !searchInput.value) return matches

  const options = getSearchOptionsFromDOM(searchPanel)

  if (!options.regexp) {
    if (/^\\[rnt]$|^\\r\\n$/.test(searchInput.value)) {
      return matches
    }
  }

  const searchValue = processEscapeSequencesForSearch(searchInput.value, options.regexp)

  if (options.regexp) {
    const lineEndingType = isLineEndingSearch(searchValue)
    if (lineEndingType) {
      const positions = findLineEndingPositions(view.state.doc, lineEndingType)
      for (const pos of positions) {
        for (let p = pos.from; p <= pos.to; p++) {
          matches.add(p)
        }
      }
      return matches
    }
  }

  const query = new SearchQuery({
    search: searchValue,
    caseSensitive: options.caseSensitive,
    regexp: options.regexp,
    wholeWord: options.wholeWord,
  })

  if (!query.valid) return matches

  const cursor = query.getCursor(view.state.doc)
  let result = cursor.next()
  while (!result.done && result.value) {
    for (let pos = result.value.from; pos < result.value.to; pos++) {
      matches.add(pos)
    }
    result = cursor.next()
  }
  return matches
}

// Get search match ranges for escape sequence highlighting
export function getSearchMatchRanges(view: EditorView): Array<{ from: number; to: number }> {
  const ranges: Array<{ from: number; to: number }> = []

  const searchPanel = view.dom.querySelector('.cm-search')
  if (!searchPanel) return ranges

  const searchInput = searchPanel.querySelector('input[name="search"]') as HTMLInputElement
  if (!searchInput || !searchInput.value) return ranges

  const options = getSearchOptionsFromDOM(searchPanel)

  if (!options.regexp) return ranges

  const searchValue = processEscapeSequencesForSearch(searchInput.value, options.regexp)

  if (searchValue === searchInput.value) return ranges

  const lineEndingType = isLineEndingSearch(searchValue)
  if (lineEndingType) {
    return findLineEndingPositions(view.state.doc, lineEndingType)
  }

  const query = new SearchQuery({
    search: searchValue,
    caseSensitive: options.caseSensitive,
    regexp: options.regexp,
    wholeWord: options.wholeWord,
  })

  if (!query.valid) return ranges

  const cursor = query.getCursor(view.state.doc)
  let result = cursor.next()
  while (!result.done && result.value) {
    ranges.push({ from: result.value.from, to: result.value.to })
    result = cursor.next()
  }
  return ranges
}
