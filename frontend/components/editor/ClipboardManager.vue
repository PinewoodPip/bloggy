<!-- Container component for handling copy/paste operations. -->
<template></template>
<script setup lang="ts">

const { editor, editorView, editorState } = useEditorInjects()

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

/** Handle clipboard items being used. */
useEditorToolCallback((item) => {
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
        } else if (clipboardItem.types.includes('text/plain')) {
          // Paste text instead
          return clipboardItem.getType('text/plain').then((itemBlob) => {
            return itemBlob.text().then((itemText) => {
              view.pasteText(itemText)
            })
          })
        }
      }
    })
  } else if (itemID === 'ClipboardCopy') {
    copyToClipboard()
  } else if (itemID === 'ClipboardCut') {
    copyToClipboard()
    editor.value.executeAction('DeleteSelection')
  }
})

</script>