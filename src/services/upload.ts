import api from './api'

export interface FileUploadResponse {
  success: boolean
  fileUrl: string
  fileName: string
  fileSize: number
}

export const uploadService = {
  async uploadImage(file: File): Promise<FileUploadResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post<FileUploadResponse>('/fileupload/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data
    } catch (error) {
      console.error('Upload service error:', error)
      throw error
    }
  }
} 