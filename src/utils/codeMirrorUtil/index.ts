import type { Extension } from '@codemirror/state'
import type { KeyBinding, ViewUpdate } from '@codemirror/view'
import { altKey, ctrlKey, shiftKey } from '@/config'
import {
  autocompletion,
  closeBrackets,
} from '@codemirror/autocomplete'
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import {
  bracketMatching,
  defaultHighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { Compartment, EditorState } from '@codemirror/state'
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  keymap,
} from '@codemirror/view'

import { ayuLight } from 'thememirror'
import { formatDoc } from '..'
import MyEditorView from './editor'

export { EditorState } from '@codemirror/state'
export { EditorView } from '@codemirror/view'

function replceSelection(
  view: EditorView,
  replacer: (
    text: string,
    from: number,
    to: number
  ) => { newText: string, from?: number, to?: number },
) {
  const selection = view.state.selection
  const main = selection.main
  if (main.empty)
    return
  const selectedText = view.state.doc.sliceString(main.from, main.to)
  const replacerResult = replacer(selectedText, main.from, main.to)
  view.dispatch(view.state.replaceSelection(replacerResult.newText))
  view.dispatch({
    selection: {
      anchor: replacerResult.from || main.from,
      head: replacerResult.to || main.to,
    },
    scrollIntoView: true,
  })
  view.focus()
}

export const keymapActions: KeyBinding[] = [
  {
    key: `${shiftKey}-${altKey}-f`,
    run: function autoFormat(editor: EditorView): boolean {
      formatDoc(editor.state.doc.toString()).then((doc) => {
        editor.dispatch(
          editor.state.update({
            changes: { from: 0, to: doc.length, insert: doc },
          }),
        )
      })
      editor.focus()
      return false
    },
  },
  {
    key: `${ctrlKey}-b`,
    run: function bold(editor: EditorView): boolean {
      replceSelection(editor, (text, from, to) => {
        if (text.length >= 4 && text.startsWith(`**`) && text.endsWith(`**`)) {
          // 取消加粗
          return {
            newText: text.slice(2, -2),
            from,
            to: to - 4,
          }
        }
        else {
          // 加粗
          return {
            newText: `**${text}**`,
            from,
            to: to + 4,
          }
        }
      })
      return false
    },
  },
  {
    key: `${ctrlKey}-i`,
    run: function italic(editor: EditorView): boolean {
      replceSelection(editor, (text, from, to) => {
        if (
          text.length >= 6
          && text.startsWith(`***`)
          && text.endsWith(`***`)
        ) {
          // 取消斜体
          return {
            newText: text.slice(1, -1),
            from,
            to: to - 2,
          }
        }
        if (text.length >= 4 && text.startsWith(`**`) && text.endsWith(`**`)) {
          return {
            newText: `*${text}*`,
            from,
            to: to + 2,
          }
        }
        if (text.length >= 2 && text.startsWith(`*`) && text.endsWith(`*`)) {
          // 取消斜体
          return {
            newText: text.slice(1, -1),
            from,
            to: to - 2,
          }
        }
        else {
          return {
            newText: `*${text}*`,
            from,
            to: to + 2,
          }
        }
      })
      return false
    },
  },
  {
    key: `${ctrlKey}-d`,
    run: function del(editor: EditorView): boolean {
      replceSelection(editor, (text, from, to) => {
        return {
          newText: `~${text}~`,
          from,
          to: to + 2,
        }
      })
      return false
    },
  },
  {
    key: `${ctrlKey}-k`,
    run: function link(editor: EditorView): boolean {
      replceSelection(editor, (text, from, to) => {
        return {
          newText: `[${text}]()`,
          from,
          to: to + 4,
        }
      })
      return false
    },
  },
  {
    key: `${ctrlKey}-e`,
    run: function code(editor: EditorView): boolean {
      replceSelection(editor, (text, from, to) => {
        return {
          newText: `\`${text}\``,
          from,
          to: to + 2,
        }
      })
      return false
    },
  },
]

const myBasicSetup = [
  EditorView.lineWrapping,
  history(),
  dropCursor(),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  drawSelection(),
  keymap.of([
    indentWithTab,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...keymapActions,
  ]),
]

export function initCodemirrorEditor(
  dom: Element,
  options: { extensions?: Extension[], initContent?: string },
): MyEditorView {
  const initState = EditorState.create({
    doc: options.initContent,
    extensions: options.extensions || [],
  })

  const editor = new MyEditorView({
    parent: dom,
    state: initState,
  })
  editor.focus()

  return editor
}

export function initEditorExtensions(
  updateListener: (update: ViewUpdate) => void,
  pasteHandler: (event: ClipboardEvent, view: EditorView) => boolean | void,
  scrollHandler: (event: Event, view: EditorView) => boolean | void,
) {
  const myTheme = EditorView.baseTheme({
    '&': {
      height: `100%`,
    },
    '.cm-line': {
      lineHeight: `1.2rem`,
    },
    '.cm-inline-suggestion': {
      color: `gray`,
    },
    '.cm-content': {
      'caretColor': `red`,
      'font-size': `14px`,
    },
    '&.cm-focused': {
      outline: `none`,
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: `#074`,
    },
    '.cm-gutters': {
      backgroundColor: `#045`,
      color: `#ddd`,
    },
  })
  return [
    // placeholder(`输入 / 唤起ai辅助写作功能`),
    // InlineSuggestion(),
    markdown().extension,
    ...myBasicSetup,
    myTheme,
    EditorView.updateListener.of(update => updateListener(update)),
    EditorView.domEventHandlers({
      paste: (event, view) => pasteHandler(event, view),
      scroll: (event, view) => scrollHandler(event, view),
    }),
  ]
}

export function initCssEditor(
  dom: Element,
  options: { extensions?: Extension[], initContent?: string },
): MyEditorView {
  const editor = new MyEditorView({
    parent: dom,
    state: EditorState.create({
      doc: options.initContent,
      extensions: options.extensions,
    }),
  })
  return editor
}

const cssThemeCompartment = new Compartment()

export { cssThemeCompartment }

export function initCssEditorExtensions(
  updateListener: (update: ViewUpdate) => void,
) {
  const myTheme = EditorView.baseTheme({
    '&': {
      height: `100%`,
    },
    '.cm-content': {
      'font-size': `14px`,
    },
    '&.cm-focused': {
      outline: `none`,
    },
  })
  return [
    ...myBasicSetup,
    myTheme,
    keymap.of([
      {
        key: `${shiftKey}-${altKey}-F`,
        run: function bold(editor: EditorView): boolean {
          formatDoc(editor.state.doc.toString(), `css`).then((doc) => {
            editor.dispatch(
              editor.state.update({
                changes: { from: 0, to: doc.length, insert: doc },
              }),
            )
          })
          return true
        },
      },
    ]),
    EditorView.domEventHandlers({
      // TODO: 使用autocomplete实现此功能
      // keyup: (event, view) => {
      //   if ((event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode === 189) {
      //     view.state.(event)
      //   }
      //   return false; // 返回 false 表示不阻止默认行为
      // },
    }),
    EditorView.updateListener.of(update => updateListener(update)),
    cssThemeCompartment.of(ayuLight),
  ]
}
