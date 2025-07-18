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

  <!-- Emoji picker -->
  <EditorWidgetEmojiPanel ref="emojiWidget" @confirm="onEmojiSelected" />

  <!-- Comment editor -->
  <EditorModalAnnotation ref="commentModal" @confirm="onAnnotationEdited" />
</template>

<script setup lang="ts">
import { Node } from 'prosemirror-model'
import * as Editor from '~/src/editor/Editor'
import * as WidgetActions from '~/src/editor/actions/Widgets'

const linkModal = useTemplateRef('linkModal')
const imageUploadModal = useTemplateRef('imageUploadModal')
const hotlinkImageModal = useTemplateRef('hotlinkImageModal')
const imageSelectModal = useTemplateRef('fileSelectModal')
const footnoteModal = useTemplateRef('footnoteModal')
const embedEditorModal = useTemplateRef('embedEditorModal')
const emojiWidget = useTemplateRef('emojiWidget')
const commentModal = useTemplateRef('commentModal')

const { editor, editorView, editorState } = useEditorInjects()
const schema = useEditorSchema()

/** Selects a footnote to edit its attributes. */
function selectFootnote(node: Node) {
  footnoteModal.value?.open(node.attrs as Editor.FootnoteAttrs)
}

/** Selects an image to edit its attributes. */
function selectImage(node: Node) {
  hotlinkImageModal.value!.open(node.attrs as Editor.ImageAttrs)
}

function editAnnotation() {
  // const selectedComment = ProseMirrorUtils.findNodes(editorState.value, schema.nodes.comment)[0]
  commentModal.value!.open()
}

/** Selects an embed node to edit its attributes. */
function selectEmbed(node: Node) {
  embedEditorModal.value!.open(node.attrs as Editor.EmbedAttrs)
}

/** Handle opening modals when corresponding toolbar items are used. */
useEditorToolCallback((item) => {
  const itemID = typeof item === 'string' ? item : item.id // String overload.
  switch (itemID) {
    case 'SetLink': {
      // Search for a link within the node
      let linkAttrs: Editor.LinkAttrs | undefined = undefined
      const selection = ProseMirrorUtils.selectWord(editorState.value)
      selection.content().content.descendants((node, pos, parent, index) => {
        const linkMark = node.marks.find((mark) => toRaw(mark.type) == toRaw(schema).marks.link)
        if (linkMark) {
          linkAttrs = linkMark.attrs as Editor.LinkAttrs
          return false
        }
        return true // Search for deeper text nodes
      })

      linkModal.value!.open(linkAttrs)
      break
    }
    case 'media.image.upload': {
      imageUploadModal.value!.open()
      break
    }
    case 'media.image.hotlink': {
      hotlinkImageModal.value!.open()
      break
    }
    case 'media.image.from_cms': {
      imageSelectModal.value!.open()
      break
    }
    case 'media.embed.request': {
      embedEditorModal.value!.open()
      break
    }
    case 'media.emoji.request': {
      emojiWidget.value!.open()
      break
    }
    case 'media.image.edit': {
      const selectedImage = ProseMirrorUtils.findNodes(editorState.value, schema.nodes.image)[0]
      selectImage(selectedImage.node)
      break
    }
    case 'annotation.request': {
      editAnnotation()
      break
    }
  }
})

defineExpose({
  selectFootnote,
  selectImage,
  selectEmbed,
})

function onLinkEdited(linkAttrs: Editor.LinkAttrs) {
  executeAction('ToggleLink', linkAttrs)
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

function onEmojiSelected(emoji: any) {
  executeAction('InsertText', {text: emoji.native})
}

function onAnnotationEdited(attrs: Editor.AnnotationAttrs) {
  executeAction('SetAnnotation', attrs)
}

/** Executes an action at the current cursor location. */
function executeAction(actionID: Editor.actionID, params?: object) {
  editor.value.executeAction(actionID, params)
}

</script>