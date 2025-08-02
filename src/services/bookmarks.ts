import api from './api'
import { Post } from '@/types'

export interface BookmarksResponse {
  bookmarks: Post[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export const bookmarksService = {
  // Kullanıcının kaydettiği postları getir
  getBookmarks: async (page = 1, pageSize = 20): Promise<BookmarksResponse> => {
    const response = await api.get(`/bookmarks?page=${page}&pageSize=${pageSize}`)
    return response.data
  },

  // Post'u kaydet/çıkar
  toggleBookmark: async (postId: string): Promise<{ isBookmarked: boolean }> => {
    const response = await api.post(`/bookmarks/${postId}`)
    return response.data
  },

  // Post'un kaydedilip kaydedilmediğini kontrol et
  checkBookmarkStatus: async (postId: string): Promise<{ isBookmarked: boolean }> => {
    const response = await api.get(`/bookmarks/${postId}/status`)
    return response.data
  }
} 