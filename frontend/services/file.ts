/**
 * Utility methods for /files/ API routes.
 */
import Service from './service'

class FileService extends Service {
  constructor(api_url: string) {
    super(api_url)
  }

  /** Uploads a file. */
  async createFile(request: SiteFileCreationRequest): Promise<SiteFile> {
    try {
      const response = await this.post('/files', request)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /** Uploads a file or replaces the data of the existing one. */
  async putFile(path: string, request: SiteFileCreationRequest): Promise<SiteFile> {
    try {
      const response = await this.put('/files' + path, request)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /** Fetches a file by its path; expects a leading slash. */
  async getFile(path: path): Promise<SiteFile> {
    try {
      const response = await this.get('/files' + path)
      return response.data
    } catch (error) {
      throw error
    }
  }
  
  /** Returns all files as a folder tree. */
  async getAll(): Promise<SiteFileTree> {
    try {
      const response = await this.get('/files/')
      return response.data
    } catch (error) {
      throw error
    }
  }

  /** Updates a file's data. */
  async updateFile(path: string, request: SiteFileUpdate): Promise<SiteFile> {
    try {
      const response = await this.patch('/files' + path, request)
      return response.data
    } catch (error) {
      throw error
    }
  }

  /** Deletes a file. */
  async deleteFile(path: path): Promise<string> {
    try {
      const response = await this.get('/files' + path)
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export default FileService