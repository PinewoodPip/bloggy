<!-- Container component for handling copy/paste operations. -->
<script setup lang="ts">
import * as Toolbar from '~/src/editor/Toolbar'

const { editor, editorView, editorState } = useEditorInjects()

function onActionUsed(item: Toolbar.GroupItem | Toolbar.actionGroupItemIdentifier) {
  const view = editorView.value
  const itemID = typeof item === 'string' ? item : item.id // String overload.
  if (itemID == 'ClipboardPaste') {
    navigator.clipboard.read().then((items) => {
      for (const clipboardItem of items) {
        const hasHTML = clipboardItem.types.includes('text/html')
        if (hasHTML) {
          // Paste rich content
          return clipboardItem.getType('text/html').then((itemBlob) => {
            return itemBlob.text().then((itemText) => {
              view.pasteHTML(itemText)
            })
          })
        } else {
          // Paste text instead
          return clipboardItem.getType('text/plain').then((itemBlob) => {
            return itemBlob.text().then((itemText) => {
              view.pasteText(itemText)
            })
          })
        }
      }
    })
  } else if (itemID == 'ClipboardCopy') {
    copyToClipboard()
  } else if (itemID == 'ClipboardCut') {
    copyToClipboard()
    editor.value.executeAction(view, 'DeleteSelection')
  }
}

/** Copies the selection to the clipboard. */
function copyToClipboard() {
  const view = editorView.value
  const state = editorState.value
  const serializedSelection = view.serializeForClipboard(state.selection.content())
    try {
      navigator.clipboard.write([
        // ProseMirror needs both types to be able to separate node HTML from content correctly
        new ClipboardItem({
          'text/html': serializedSelection.dom.innerHTML,
          'text/plain': serializedSelection.text,
        }),
      ])
    } catch {}
}

defineExpose({
  onActionUsed,
})

</script>