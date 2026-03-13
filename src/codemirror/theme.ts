import { EditorView } from '@codemirror/view'
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'

// IntelliJ Dark theme colors
export const kuroColors = {
  background: '#1e1f22',
  foreground: '#bcbec4',
  accent: '#4a88c7',
  comment: '#7a7e85',
  keyword: '#cf8e6d',
  string: '#6aab73',
  number: '#2aacb8',
  function: '#56a8f5',
  variable: '#bcbec4',
  type: '#c77dbb',
  operator: '#bcbec4',
  property: '#c77dbb',
  punctuation: '#bcbec4',
  selection: '#214283',
  activeLine: '#26282e',
  gutter: '#6f737a',
  gutterActive: '#bcbec4',
}

// Syntax highlighting theme
export const kuroHighlightStyle = HighlightStyle.define([
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
export const kuroTheme = EditorView.theme({
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
    caretColor: '#ffffff',
    padding: '8px 0',
  },
  '.cm-cursor': {
    borderLeftColor: '#ffffff',
    borderLeftWidth: '2px',
  },
  '.cm-selectionBackground': {
    backgroundColor: `${kuroColors.selection} !important`,
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: `${kuroColors.selection} !important`,
  },
  '.cm-selectionMatch': {
    backgroundColor: '#3a3f47 !important',
    outline: '1px solid #5a6370 !important',
    borderRadius: '2px !important',
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
    backgroundColor: '#3b514d',
    outline: 'none',
    color: '#ffffff !important',
  },
  '.cm-nonmatchingBracket': {
    backgroundColor: '#5c3440',
    outline: 'none',
    color: '#ff6b6b !important',
  },
  '.cm-scroller': {
    overflow: 'auto',
  },
  '&::-webkit-scrollbar, .cm-scroller::-webkit-scrollbar': {
    width: '14px',
    height: '14px',
  },
  '&::-webkit-scrollbar-track, .cm-scroller::-webkit-scrollbar-track': {
    backgroundColor: kuroColors.background,
  },
  '&::-webkit-scrollbar-thumb, .cm-scroller::-webkit-scrollbar-thumb': {
    backgroundColor: '#47494e',
    border: `4px solid ${kuroColors.background}`,
    borderRadius: '7px',
  },
  '&::-webkit-scrollbar-thumb:hover, .cm-scroller::-webkit-scrollbar-thumb:hover': {
    backgroundColor: '#5a5d63',
  },
  // Search panel styles
  '.cm-panels': {
    backgroundColor: '#1e1f22 !important',
    color: '#bcbec4 !important',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif !important',
  },
  '.cm-panels.cm-panels-top': {
    borderBottom: '1px solid #393b40 !important',
  },
  '.cm-search': {
    display: 'flex !important',
    flexWrap: 'wrap !important',
    alignItems: 'center !important',
    padding: '6px 8px !important',
    fontSize: '12px !important',
    gap: '4px !important',
    position: 'relative !important',
    paddingRight: '40px !important',
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
    backgroundColor: '#2b2d30 !important',
    borderColor: '#43454a !important',
  },
  '.cm-search label:has(input:checked)': {
    backgroundColor: '#365880 !important',
    color: '#ffffff !important',
    borderColor: '#365880 !important',
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
    backgroundColor: '#1e1f22 !important',
    border: '1px solid #43454a !important',
    borderRadius: '4px !important',
    color: '#bcbec4 !important',
    padding: '4px 8px !important',
    fontSize: '13px !important',
    outline: 'none !important',
    minWidth: '200px !important',
  },
  '.cm-textfield:focus': {
    borderColor: '#4a88c7 !important',
    boxShadow: 'none !important',
  },
  '.cm-button': {
    background: 'transparent !important',
    border: '1px solid transparent !important',
    borderRadius: '4px !important',
    color: '#bcbec4 !important',
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
    background: '#2b2d30 !important',
    borderColor: '#43454a !important',
  },
  '.cm-button[name="next"]': {
    width: '24px !important',
  },
  '.cm-button[name="next"]::after': {
    content: '"↓" !important',
  },
  '.cm-button[name="prev"]': {
    width: '24px !important',
  },
  '.cm-button[name="prev"]::after': {
    content: '"↑" !important',
  },
  '.cm-button[name="replace"]': {
    width: '24px !important',
  },
  '.cm-button[name="replace"]::after': {
    content: '"→" !important',
  },
  '.cm-button[name="replaceAll"]': {
    width: '24px !important',
  },
  '.cm-button[name="replaceAll"]::after': {
    content: '"⇉" !important',
  },
  '.cm-button[name="close"]': {
    marginLeft: 'auto !important',
    padding: '4px 8px !important',
    minWidth: '24px !important',
    textIndent: '0 !important',
    overflow: 'visible !important',
  },
  '.cm-button[name="close"]::after': {
    content: 'none !important',
  },
  '.cm-button[name="close"]:hover': {
    background: '#2b2d30 !important',
    borderColor: '#43454a !important',
  },
  '.cm-search button[name="close"]': {
    position: 'absolute !important',
    top: '50% !important',
    right: '8px !important',
    transform: 'translateY(-50%) !important',
    background: 'transparent !important',
    color: '#bcbec4 !important',
    border: '1px solid transparent !important',
    borderRadius: '4px !important',
    padding: '4px 8px !important',
    cursor: 'pointer !important',
    fontSize: '12px !important',
    lineHeight: '1 !important',
  },
  '.cm-search button[name="close"]:hover': {
    background: '#2b2d30 !important',
    borderColor: '#43454a !important',
    color: '#ffffff !important',
  },
  '.cm-searchMatch': {
    backgroundColor: '#5a4a1f !important',
    outline: '1px solid #b5913a !important',
    borderRadius: '2px !important',
  },
  '.cm-searchMatch-selected': {
    backgroundColor: '#3a5d8a !important',
    outline: '2px solid #4a88c7 !important',
    borderRadius: '2px !important',
  },
})

export const kuroSyntaxHighlighting = syntaxHighlighting(kuroHighlightStyle)
