import type { EditorState } from '@codemirror/state'
import { inlineSuggestion } from 'codemirror-extension-inline-suggestion'

async function fetchSuggestion(state: EditorState) {
  // or make an async API call here based on editor state
  const cursor = state.selection.main.head
  const content = state.doc.toString()
  const prevContent = content.substring(cursor - 5, cursor).trim()
  if (prevContent.length < 2)
    return ``
  return prevContent
}

export function InlineSuggestion() {
  return inlineSuggestion({
    fetchFn: fetchSuggestion,
    delay: 1000,
  })
}
