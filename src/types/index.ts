export interface Tab {
  id: string
  fileName: string
  filePath?: string
  content: string
  isModified: boolean
  cursorPosition?: number
}

export interface CursorPosition {
  line: number
  column: number
}

export interface SearchOptions {
  caseSensitive: boolean
  regexp: boolean
  wholeWord: boolean
}

export type LineEnding = 'LF' | 'CRLF'

export interface FileOpenResult {
  filePath: string
  fileName: string
  content: string
}

export interface FileSaveResult {
  success: boolean
  error?: string
}

export interface FileSaveAsResult {
  success: boolean
  filePath: string
  fileName: string
  error?: string
}
