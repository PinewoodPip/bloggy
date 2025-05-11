/**
 * Route for mapping files in the backend to frontend URLs.
 */
import { AxiosError } from "axios";
import { useFileService } from "~/composables/Services";

/** Maps extensions to their common HTTP application type equivalent suffix. */
const EXTENSION_ALIASES: {[key: string]: string} = {
  jpg: 'jpeg'
}

export default defineEventHandler(async (event) => {
  const fileService = useFileService()
  const path = event.context.params!.file_path

  // Fetch file and decode response
  try {
    const file = await fileService.getFileMetadata('/' + path)

    // Read extension and convert to a common HTTP application type ID
    let extension = file.filename.split('.')[1]
    extension = EXTENSION_ALIASES[extension] || extension

    // Decode response
    const decodedContent = Buffer.from(file.content, 'base64')
    
    // Set headers
    setResponseHeader(event, 'Content-Type', 'image/' + extension) // TODO detect non-images
    setResponseHeader(event, 'Content-Length', decodedContent.length)

    return decodedContent;
  } catch (e: any) {
    // Propagate backend response
    const err = e as AxiosError
    setResponseStatus(event, err.status, err.message)
    return
  }
});