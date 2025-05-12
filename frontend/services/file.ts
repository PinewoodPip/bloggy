/**
 * Utility methods for /files/ API routes.
 */
import Service from './service'
import type { User } from './user'

/** File schemas */

export type SiteFileData = {
  path: string,
  filename: string,
  content: base64String,
}

export type SiteFileCreationRequest = {
  path: string,
  content: base64String,
}

export type SiteFilePreview = SiteFileData & {
  uploader: User,
}

export type SiteFile = SiteFilePreview & {
  content: base64String,
}

export type SiteFileTree = {
  folder_name: string,
  path: string,
  files: SiteFilePreview[],
  subfolders: {[key: string]: SiteFileTree}
}

export type SiteFileUpdate = SiteFileData & {
  path?: string,
  content?: base64String,
}

class FileService extends Service {
  constructor(api_url: string) {
    super(api_url)
  }

  /** Uploads a file. */
  async createFile(request: SiteFileCreationRequest): Promise<SiteFile> {
    const response = await this.post('/files', request)
    return response.data
  }

  /** Uploads a file or replaces the data of the existing one. */
  async putFile(path: string, request: SiteFileCreationRequest): Promise<SiteFile> {
    const response = await this.put('/files' + path, request)
    return response.data
  }

  /** Fetches a file's metadata by its path; expects a leading slash. */
  async getFileMetadata(path: path): Promise<SiteFile> {
    const response = await this.get('/files' + path + '/metadata')
    return response.data
  }

  /** Returns the contents of a file. */
  async getFileContent(path: path): Promise<any> {
    const response = await this.get('/files' + path)
    return response
  }
  
  /** Returns all files as a folder tree. */
  async getAll(): Promise<SiteFileTree> {
    const response = await this.get('/files/')
    return response.data
  }

  /** Updates a file's data. */
  async updateFile(path: string, request: SiteFileUpdate): Promise<SiteFile> {
    const response = await this.patch('/files' + path, request)
    return response.data
  }

  /** Deletes a file. */
  async deleteFile(path: path): Promise<string> {
    const response = await this.delete('/files' + path)
    return response.data
  }
}

export default FileService