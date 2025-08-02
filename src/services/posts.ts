import api from './api'
import { Post, PagedResult, PostStatus } from '@/types'

export const postsService = {
  async getPosts(page = 1, pageSize = 10): Promise<PagedResult<Post>> {
    const response = await api.get<PagedResult<Post>>(`/posts?page=${page}&pageSize=${pageSize}`)
    return response.data
  },

  async getPostById(id: string): Promise<Post> {
    const response = await api.get<Post>(`/posts/${id}`)
    return response.data
  },

  async getPostBySlug(slug: string): Promise<Post> {
    const response = await api.get<Post>(`/posts/slug/${slug}`)
    return response.data
  },

  async getMyPosts(page = 1, pageSize = 10): Promise<PagedResult<Post>> {
    // Backend'de /posts/my-posts endpoint'i kullanıcının kendi postlarını getirir
    const response = await api.get<PagedResult<Post>>(`/posts/my-posts?page=${page}&pageSize=${pageSize}`)
    return response.data
  },

  async createPost(post: {
    title: string
    content: string
    excerpt?: string
    featuredImageUrl?: string
    categoryId?: string
    tags?: string[]
    status: PostStatus
  }): Promise<Post> {
    const response = await api.post<Post>('/posts', post)
    return response.data
  },

  async updatePost(id: string, data: {
    title: string;
    content: string;
    excerpt?: string;
    featuredImageUrl?: string | null;
    categoryId?: string | null;
    tags: string[];
    status: PostStatus;
  }): Promise<Post> {
    const response = await api.put<Post>(`/posts/${id}`, data)
    return response.data
  },

  async deletePost(id: string): Promise<void> {
    await api.delete(`/posts/${id}`)
  },

  async publishPost(id: string): Promise<Post> {
    const response = await api.post<Post>(`/posts/${id}/publish`)
    return response.data
  },

  async unpublishPost(id: string): Promise<Post> {
    const response = await api.post<Post>(`/posts/${id}/unpublish`)
    return response.data
  },

  async getPostsByCategory(categorySlug: string, page = 1, pageSize = 10): Promise<PagedResult<Post>> {
    const response = await api.get<PagedResult<Post>>(`/posts/category/slug/${categorySlug}?page=${page}&pageSize=${pageSize}`)
    return response.data
  },

  async getPostsByTag(tagSlug: string, page = 1, pageSize = 10): Promise<PagedResult<Post>> {
    const response = await api.get<PagedResult<Post>>(`/posts/tag/${tagSlug}?page=${page}&pageSize=${pageSize}`)
    return response.data
  }
} 