import type { Tab } from '../types'

export const sampleTypeScript = `// Welcome to Kuro Editor
import { useState, useEffect } from 'react'

interface User {
  id: number
  name: string
  email: string
  isActive: boolean
}

async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users')
  const data = await response.json()
  return data
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name} - {user.email}
        </li>
      ))}
    </ul>
  )
}

console.log('Kuro Editor is ready!')
`

export const sampleCSS = `/* Kuro Theme Styles */
:root {
  --kuro-bg: #0d0d0d;
  --kuro-accent: #b4e61d;
  --kuro-text: #e0e0e0;
}

.container {
  display: flex;
  flex-direction: column;
  background-color: var(--kuro-bg);
  color: var(--kuro-text);
  min-height: 100vh;
}

.button {
  padding: 8px 16px;
  border: 1px solid var(--kuro-accent);
  border-radius: 4px;
  background: transparent;
  color: var(--kuro-accent);
  cursor: pointer;
  transition: all 0.2s ease;
}

.button:hover {
  background-color: var(--kuro-accent);
  color: var(--kuro-bg);
}
`

export const sampleJSON = `{
  "name": "kuro-editor",
  "version": "1.0.0",
  "description": "A modern dark-themed code editor",
  "features": [
    "Syntax highlighting",
    "Multiple tabs",
    "Dark theme"
  ],
  "theme": {
    "background": "#0d0d0d",
    "accent": "#b4e61d",
    "foreground": "#e0e0e0"
  },
  "supported_languages": [
    "typescript",
    "javascript",
    "css",
    "html",
    "json",
    "markdown"
  ]
}
`

export const initialTabs: Tab[] = [
  { id: 'tab-1', fileName: 'welcome.tsx', content: sampleTypeScript, isModified: false },
  { id: 'tab-2', fileName: 'styles.css', content: sampleCSS, isModified: false },
  { id: 'tab-3', fileName: 'config.json', content: sampleJSON, isModified: false },
]
