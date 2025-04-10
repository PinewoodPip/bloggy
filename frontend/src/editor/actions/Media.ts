/**
 * Implements actions for inserting media nodes, such as images.
 */
import { type EditorState, type Transaction } from 'prosemirror-state'
import type { actionID } from '../Editor'
import type { Group, GroupActionMenu } from '../Toolbar'
import { ProseMirrorUtils } from '~/utils/ProseMirror'
import { Action } from './Action'
import { schema } from '../Schema'

export class InsertImage extends Action {
  static override ID: string = 'InsertImage'

  constructor() {
    super({
      id: 'InsertImage',
      name: 'Insert Image',
      icon: 'material-symbols:image',
    })
  }

  execute(state: EditorState, params: {href: string, alt?: string}): Transaction | Promise<Transaction> | null {
    const imageNode = schema.nodes['image']
    const image = imageNode.create(params)
    let tr = state.tr
    tr.replaceSelectionWith(image)
    return tr
  }
}

export class HotlinkImage extends Action {
  static override ID: string = 'HotlinkImage'

  constructor() {
    super({
      id: 'HotlinkImage',
      name: 'From link',
      icon: 'material-symbols:link',
    })
  }

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
    // This action doesn't directly edit the document; it is intended to be chained into InsertImage after going through some form in the UI.
    return null
  }
}

export class UploadImage extends Action {
  static override ID: string = 'UploadImage'

  constructor() {
    super({
      id: 'UploadImage',
      name: 'Upload image',
      icon: 'material-symbols:image-arrow-up-rounded',
    })
  }

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
    // This action doesn't directly edit the document; it is intended to be chained into InsertImage after going through some form in the UI.
    return null
  }
}

/** An action to insert an image from the site's CMS. */
export class SelectImage extends Action {
  static override ID: string = 'SelectImage'

  constructor() {
    super({
      id: SelectImage.ID,
      name: 'From site files',
      icon: 'material-symbols:cloud',
    })
  }

  execute(state: EditorState): Transaction | Promise<Transaction> | null {
    // This action doesn't directly edit the document; it is intended to be chained into InsertImage after going through some form in the UI.
    return null
  }
}

/**
 * Action group
 */
let _imageActions: Action[] = [
  new HotlinkImage(),
  new UploadImage(),
  new SelectImage(),
]
const imageActionIDs: actionID[] = []
for (const action of _imageActions) {
  imageActionIDs.push(action.def.id)
}
let _actionGroup: Group = {
  name: 'Media',
  items: [
    {
      type: 'actionMenu',
      icon: 'material-symbols:image',
      name: 'Insert image',
      actionIDs: imageActionIDs,
    } as GroupActionMenu,
  ],
}
export const actionGroup = _actionGroup
export const imageActions = _imageActions
