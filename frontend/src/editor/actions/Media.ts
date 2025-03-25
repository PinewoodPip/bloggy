/**
 * Implements actions for inserting media nodes, such as images.
 */
import { type EditorState, type Transaction } from 'prosemirror-state'
import type { actionID, ToolbarGroup, ToolbarGroupAction, ToolbarGroupActionMenu } from '../Editor'
import { ProseMirrorUtils } from '~/utils/ProseMirror'
import { Action } from './Action'
import { schema } from '../Schema'

export class InsertImage extends Action {
  static override ID: string = 'InsertImage'

  constructor() {
    super({
      id: 'InsertImage',
      name: 'Insert Image',
      icon: 'heroicons:photo-16-solid',
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
    return null
  }
}

/**
 * Action group
 */
let _imageActions: Action[] = [
  new HotlinkImage(),
]
const alertActionIDs: actionID[] = []
for (const action of _imageActions) {
  alertActionIDs.push(action.def.id)
}
let _actionGroup: ToolbarGroup = {
  name: 'Media',
  items: [
    {
      type: 'actionMenu',
      icon: 'material-symbols:lightbulb-2-outline',
      name: 'Insert image',
      actionIDs: alertActionIDs,
    } as ToolbarGroupActionMenu,
  ],
}
export const actionGroup = _actionGroup
export const imageActions = _imageActions
