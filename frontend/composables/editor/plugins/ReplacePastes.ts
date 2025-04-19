import { Plugin } from 'prosemirror-state'
import { schema } from '~/src/editor/Schema'

/** Plugin that replaces pasted image and embed links with the corresponding nodes. */
export const useReplacePastesPlugin = () => {
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
            let tr = view.state.tr
            tr = tr.insert(tr.selection.from, schema.nodes.embed.create({
              contentID: contentID,
              type: serviceType,
            }))
            view.dispatch(tr)
            return true // Prevent original paste
          }
        }
        return false
      }
    }
  })
}