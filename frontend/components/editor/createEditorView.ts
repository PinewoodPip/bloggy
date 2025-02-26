import { exampleSetup } from 'prosemirror-example-setup'
import { keymap } from 'prosemirror-keymap'
import { DOMParser } from 'prosemirror-model'
import type { Plugin } from 'prosemirror-state'
import { EditorState } from 'prosemirror-state'
import type { NodeViewConstructor } from 'prosemirror-view'
import { EditorView } from 'prosemirror-view'
import { schema } from '../../composables/editor/Schema'
import 'prosemirror-menu/style/menu.css'
import 'prosemirror-view/style/prosemirror.css'
import 'prosemirror-example-setup/style/style.css'

/**
 * Creates a ProseMirror EditorView.
 * Adapted from https://github.com/prosekit/prosemirror-adapter
 */
export function createEditorView(element: HTMLElement, nodeViews: Record<string, NodeViewConstructor>, plugins: Plugin[], stateUpdateCallback: (newState: EditorState) => void) {
  const content = document.querySelector('#content')
  if (!content)
    throw new Error('Content element not found')

  const editorView = new EditorView(element, {
    state: EditorState.create({
      doc: DOMParser.fromSchema(schema).parse(content),
      schema, // Starting document
      plugins: [
        ...exampleSetup({ schema: schema, mapKeys: {
          // Disable default keybinds from the example setup module
          ['Mod-z']: false,
          ['Mod-y']: false,
          ['Mod-b']: false,
          ['Mod-i']: false,
        } }),
        keymap({
          // Ctrl + [ increases indent
          'Mod-[': (state, dispatch) => {
            const { selection } = state
            const node = selection.$from.node()
            if (node.type.name !== 'heading')
              return false

            // Increase indent or wrap back to 1
            let level = node.attrs.level
            if (level >= 6)
              level = 1
            else
              level += 1

            dispatch?.(
              state.tr.setNodeMarkup(selection.$from.before(), null, {
                ...node.attrs,
                level,
              }),
            )
            return true
          },
        }),
        ...plugins,
      ],
    }),
    dispatchTransaction(transaction) {
      // Apply new state and run callback
      let newState = editorView.state.apply(transaction)
      editorView.updateState(newState)
      stateUpdateCallback(editorView.state)
    },
    nodeViews,
  })
  stateUpdateCallback(editorView.state) // Fire event immediately so the state can be propagated
  return editorView
}