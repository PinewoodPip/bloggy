import { Plugin } from 'prosemirror-state'
import { Schema } from 'prosemirror-model'

const IMAGE_URL_PATTERN = new RegExp(`https?:\/\/.+\.(jpg|jpeg|svg|png)$`)

/** Plugin that replaces pasted image and embed links with the corresponding nodes. */
export const useReplacePastesPlugin = (schema: Schema) => {
  const embeds = useMediaEmbeds()

  return new Plugin({
    props: {
      handlePaste(view, event, slice) {
        // Check if the slice is a single text node
        const firstSlice = slice.content.content[0]
        if (!firstSlice) return false
        const innerContent = firstSlice.content.content
        if (!innerContent || innerContent.length == 0) return false
        const content = innerContent[0].text
        if (content) {
          // Check if an embeddable link is being pasted
          const serviceType = embeds.getServiceType(content)
          const contentID = embeds.getContentID(content)
          if (serviceType && contentID) {
            // Add embed node
            const node = schema.nodes.embed.create({
              contentID: contentID,
              type: serviceType,
            })
            let tr = ProseMirrorUtils.insertAtCursor(view.state.tr, node)
            view.dispatch(tr)
            return true // Prevent original paste
          }

          // Check if an image URL is being pasted
          if (IMAGE_URL_PATTERN.test(content)) {
            // Add image node
            const node = schema.nodes.image.create({
              src: content,
            })
            let tr = ProseMirrorUtils.insertAtCursor(view.state.tr, node)
            view.dispatch(tr)
            return true // Prevent original paste
          }
        }
        return false
      }
    }
  })
}