/**
 * Implements actions for inserting media nodes, such as images.
 */
import { type EditorState, type Transaction } from 'prosemirror-state'
import type { actionID, EmbedAttrs } from '../Editor'
import type { Group, GroupAction, GroupActionMenu, GroupCallback, GroupItem } from '../Toolbar'
import { ProseMirrorUtils } from '~/utils/ProseMirror'
import { Action } from './Action'
import { schema } from '../Schema'

export class InsertImage extends Action {
  static ID: string = 'InsertImage'

  constructor() {
    super('InsertImage')
  }

  execute(state: EditorState, params: {href: string, alt?: string}): Transaction | Promise<Transaction> | null {
    const imageNode = schema.nodes['image']
    const image = imageNode.create(params)
    let tr = state.tr
    tr.replaceSelectionWith(image)
    return tr
  }
}

/** Action to insert external content embeds. */
export class InsertEmbed extends Action {
  static ID: string = 'InsertEmbed'

  constructor() {
    super(InsertEmbed.ID)
  }

  execute(state: EditorState, params: EmbedAttrs): Transaction | Promise<Transaction> | null {
    const embedNode = schema.nodes['embed']
    const embed = embedNode.create(params)
    let tr = state.tr
    tr.replaceSelectionWith(embed)
    return tr
  }
}

/**
 * Action group
 */
let _actionGroup: Group = {
  name: 'Media',
  items: [
    /** Image items. */
    {
      type: 'actionMenu',
      id: 'media.image.menu',
      def: {
        icon: 'material-symbols:image',
        name: 'Insert image',
      },
      subitems: [
        /** Callback to insert an image from a URL. */
        {
          type: 'callback',
          id: 'media.image.hotlink',
          def: {
            name: 'From link',
            longName: 'Insert image from link',
            icon: 'material-symbols:link',
          } 
        } as GroupCallback,
        /** Callback to upload an image to the site's CMS. */
        {
          type: 'callback',
          id: 'media.image.upload',
          def: {
            name: 'Upload image',
            icon: 'material-symbols:image-arrow-up-rounded',
          } 
        } as GroupCallback,
        /** Callback to insert an image from the site's CMS. */
        {
          type: 'callback',
          id: 'media.image.from_cms',
          def: {
            name: 'From site files',
            longName: 'Insert image from site',
            icon: 'material-symbols:cloud',
          } 
        } as GroupCallback,
      ],
    } as GroupActionMenu,
    /** Callback to request an embed insert. */
    {
      type: 'callback',
      id: 'media.embed.request',
      def: {
        name: 'Insert embed',
        icon: 'material-symbols:featured-video-outline',
      }
    } as GroupCallback,
  ],
}
export const actionGroup = _actionGroup
