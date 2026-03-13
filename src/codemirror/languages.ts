import { Compartment } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { json } from '@codemirror/lang-json'
import { markdown } from '@codemirror/lang-markdown'

// Language compartment for dynamic reconfiguration
export const languageCompartment = new Compartment()

// Language detection based on file extension
export function getLanguageExtension(fileName: string) {
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
