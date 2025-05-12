/**
 * Generic editor tools and utility functions for registering them.
 */
import * as Editor from "~/src/editor/Editor"
import * as Tools from "~/src/editor/ToolManager"
import { MarkType, NodeType } from 'prosemirror-model'
import * as MediaActions from '~/src/editor/actions/Media'
import { RegisterActionTool } from '~/src/editor/tools/Generic'
import { TextSelection, Transaction, NodeSelection, type EditorState, Selection } from 'prosemirror-state'

/** A tool for editing images. */
export class EditImageTool extends Tools.CallbackTool {
  constructor() {
    super('media.image.edit', {
      icon: 'material-symbols:image',
      name: 'Edit image',
    })
  }

  override isApplicable(state: EditorState) {
    // An image must be within the selection or at the cursor.
    return ProseMirrorUtils.selectionHasNode(state, state.schema.nodes.image) != null
  }
}

/** Registers tools for inserting images for the article editor, including CMS-specific methods of doing so. */
export const RegisterArticleImageTools = (manager: Editor.Editor) => {
  const toolbar = manager.getToolManager()

  // Register tools
  const imageTools = [
    /** Callback to insert an image from a URL. */
    new Tools.CallbackTool('media.image.hotlink', {
      name: 'From link',
      longName: 'Insert image from link',
      icon: 'material-symbols:link',
    }),
    /** Callback to upload an image to the site's CMS. */
    new Tools.CallbackTool('media.image.upload', {
      name: 'Upload image',
      icon: 'material-symbols:image-arrow-up-rounded',
    }),
    /** Callback to insert an image from the site's CMS. */
    new Tools.CallbackTool('media.image.from_cms', {
      name: 'From site files',
      longName: 'Insert image from site',
      icon: 'material-symbols:cloud',
    })
  ]
  for (const tool of imageTools) {
    toolbar.registerTool(tool)
  }

  // Register edit tool
  const editTool = new EditImageTool()
  toolbar.registerTool(editTool)

  // Register menu
  const menu = new Tools.MultiTool('media.image', {
    icon: 'material-symbols:image',
    name: 'Insert image',
  }, imageTools)
  toolbar.registerTool(menu)

  return { menu, editTool}
}

/** Registers a callback tool to insert an embed. */
export const RegisterEmbedTool = (editor: Editor.Editor) => {
  const toolbar = editor.getToolManager()
  const embedTool = new Tools.CallbackTool('media.embed.request', {
    name: 'Insert embed',
    icon: 'material-symbols:featured-video-outline',
  })
  toolbar.registerTool(embedTool)
  return embedTool
}

/** Registers a callback tool to open an emoji picker. */
export const RegisterEmojiPickerTool = (editor: Editor.Editor) => {
  const toolbar = editor.getToolManager()
  const embedTool = new Tools.CallbackTool('media.emoji.request', {
    name: 'Insert emoji',
    icon: 'material-symbols:sentiment-excited-outline',
  } )
  toolbar.registerTool(embedTool)
  return embedTool
}