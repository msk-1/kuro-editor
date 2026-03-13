import type { LineEnding } from '../types'

// Special character to represent CRLF (using Private Use Area)
export const CRLF_PLACEHOLDER = '\uE000'

// Convert CRLF to placeholder for internal representation
export function crlfToPlaceholder(content: string): string {
  return content.replace(/\r\n/g, CRLF_PLACEHOLDER + '\n')
}

// Convert placeholder back to CRLF for saving
export function placeholderToCrlf(content: string): string {
  return content.replace(new RegExp(CRLF_PLACEHOLDER + '\n', 'g'), '\r\n')
}

// Detect line ending type from content
export function detectLineEnding(content: string): LineEnding {
  if (content.includes('\r\n')) {
    return 'CRLF'
  }
  return 'LF'
}

// Check if search is for line endings
export function isLineEndingSearch(searchValue: string): LineEnding | null {
  if (searchValue === CRLF_PLACEHOLDER) return 'CRLF'
  if (searchValue === '\n') return 'LF'
  return null
}

// Find all line ending positions of a specific type
export function findLineEndingPositions(
  doc: { lines: number; line: (n: number) => { text: string; to: number } },
  type: LineEnding
): Array<{ from: number; to: number }> {
  const positions: Array<{ from: number; to: number }> = []

  for (let i = 1; i < doc.lines; i++) {
    const line = doc.line(i)
    const lineText = line.text
    const hasCrlf = lineText.endsWith(CRLF_PLACEHOLDER)

    if (type === 'CRLF' && hasCrlf) {
      positions.push({ from: line.to - 1, to: line.to })
    } else if (type === 'LF' && !hasCrlf) {
      positions.push({ from: line.to, to: line.to })
    }
  }

  return positions
}
