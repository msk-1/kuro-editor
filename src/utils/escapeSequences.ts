import { CRLF_PLACEHOLDER } from './lineEnding'

// Process escape sequences in a string (for replacement)
export function processEscapeSequences(str: string): string {
  return str
    .replace(/\\r\\n/g, CRLF_PLACEHOLDER + '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
}

// Process escape sequences for search (handles that newlines are structural in CodeMirror)
export function processEscapeSequencesForSearch(str: string, regexpMode: boolean): string {
  if (!regexpMode) return str
  return str
    .replace(/\\r\\n/g, CRLF_PLACEHOLDER)
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
}

// Process escape sequences for replacement (context-aware)
export function processEscapeSequencesForReplace(
  str: string,
  searchValue: string,
  regexpMode: boolean
): string {
  if (!regexpMode) return str
  const rawReplace = processEscapeSequences(str)

  // Special case: replacing CRLF placeholder with just newline means "convert to LF"
  if (searchValue === CRLF_PLACEHOLDER && rawReplace === '\n') {
    return ''
  }

  // Special case: replacing newline with CRLF means "convert to CRLF"
  if (searchValue === '\n' && rawReplace === CRLF_PLACEHOLDER + '\n') {
    return CRLF_PLACEHOLDER
  }

  return rawReplace
}
