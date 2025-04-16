<!-- Aggregates commonly-used editor modals for performing editing operations that require additional UI interactions. -->
<template>
  <!-- Footnote modal -->
  <EditorModalFootnote ref="footnoteModal" @confirm="onConfirmFootnote" />

  <!-- Link modal -->
  <EditorModalLink ref="linkModal" @confirm="onLinkEdited" />

  <!-- Hotlink image modal -->
  <EditorModalHotlinkImage ref="hotlinkImageModal" @confirm="onImageEdited" />

  <!-- Upload image modal -->
  <AdminFileUploadModal ref="imageUploadModal" @create="onImageUploaded" />

  <!-- Image selection modal -->
  <AdminModalFileSelect ref="fileSelectModal" :can-select-files="true" :valid-extensions="CMSUtils.IMAGE_EXTENSIONS" @confirm="onFileSelected" />

  <!-- Embed insertion modal -->
  <EditorModalEmbed ref="embedEditorModal" @confirm="onEmbedEdited" />
</template>

<script setup lang="ts">
import { Node } from 'prosemirror-model'
import * as Editor from '~/src/editor/Editor'
import * as Toolbar from '~/src/editor/Toolbar'
import { schema } from '~/src/editor/Schema'
import * as WidgetActions from '~/src/editor/actions/Widgets'

const linkModal = useTemplateRef('linkModal')
const imageUploadModal = useTemplateRef('imageUploadModal')
const hotlinkImageModal = useTemplateRef('hotlinkImageModal')
const imageSelectModal = useTemplateRef('fileSelectModal')
const footnoteModal = useTemplateRef('footnoteModal')
const embedEditorModal = useTemplateRef('embedEditorModal')

const { editor, toolbar, editorView, editorState } = useEditorInjects()

/** Selects a footnote to edit its attributes. */
function selectFootnote(node: Node) {
  footnoteModal.value?.open(node.attrs as Editor.FootnoteAttrs)
}

/** Selects an image to edit its attributes. */
function selectImage(node: Node) {
  hotlinkImageModal.value!.open(node.attrs as Editor.ImageAttrs)
}

/** Selects an embed node to edit its attributes. */
function selectEmbed(node: Node) {
  embedEditorModal.value!.open(node.attrs as Editor.EmbedAttrs)
}

function onActionUsed(item: Toolbar.GroupItem | Toolbar.actionGroupItemIdentifier) {
  const itemID = typeof item === 'string' ? item : item.id // String overload.
  if (itemID == 'FormatLink') {
    const nodeRange = ProseMirrorUtils.getNodeRange(editorState.value)
    const node = nodeRange.$from.node()

    // Search for a link within the node
    let linkAttrs: Editor.LinkAttrs | undefined = undefined
    for (const mark of node.marks) {
      if (mark.type == schema.marks.link) {
        linkAttrs = mark.attrs as Editor.LinkAttrs
        break
      }
    }

    linkModal.value!.open(linkAttrs)
  } else if (itemID === 'media.image.hotlink') {
    hotlinkImageModal.value!.open()
  } else if (itemID === 'media.image.upload') {
    imageUploadModal.value!.open()
  } else if (itemID === 'media.image.from_cms') {
    imageSelectModal.value!.open()
  } else if (itemID === 'media.embed.request') {
    embedEditorModal.value!.open()
  }
}

defineExpose({
  selectFootnote,
  selectImage,
  selectEmbed,
  onActionUsed,
})

function onLinkEdited(linkAttrs: Editor.LinkAttrs) {
  executeAction('FormatLink', linkAttrs)
}

function onImageEdited(imgAttrs: Editor.ImageAttrs) {
  executeAction('InsertImage', imgAttrs)
}


/** Inserts an uploaded image into the document. */
function onImageUploaded(file: SiteFile) {
  executeAction('InsertImage', {src: CMSUtils.resolveFilePath(file.path)})
}

/** Inserts a selected image from the CMS into the document. */
function onFileSelected(path: path) {
  executeAction('InsertImage', {src: CMSUtils.resolveFilePath(path)})
}

/** Inserts or updates a footnote. */
function onConfirmFootnote(attrs: Editor.FootnoteAttrs) {
  const state = toRaw(editorState.value)
  const view = toRaw(editorView.value)

  // Execute action
  const action = editor.value.getAction('InsertFootnote') as WidgetActions.InsertFootnote
  let tr = action.updateFootnote(state, attrs.index, attrs.text)
  if (tr) {
    view.dispatch(tr)
  }
}

/** Inserts an embed into the document. */
function onEmbedEdited(attrs: Editor.EmbedAttrs) {
  executeAction('InsertEmbed', attrs)
}

/** Executes an action at the current cursor location. */
function executeAction(actionID: Editor.actionID, params?: object) {
  editor.value.executeAction(editorView.value, actionID, params)
}

</script>