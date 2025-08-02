export interface User {
  id: string
  userName: string
  email: string
  firstName?: string
  lastName?: string
  bio?: string
  profileImageUrl?: string
  website?: string
  twitterHandle?: string
  linkedInUrl?: string
  joinDate: string
  followerCount: number
  followingCount: number
  isVerified: boolean
}

export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  refreshToken?: string
  user?: User
  errors?: string[]
}

export interface LoginRequest {
  emailOrUserName: string
  password: string
}

export interface RegisterRequest {
  userName: string
  email: string
  password: string
  confirmPassword: string
  firstName?: string
  lastName?: string
}

export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featuredImageUrl?: string
  status: PostStatus
  publishedAt?: string
  viewCount: number
  likeCount: number
  commentCount: number
  readTimeMinutes: number
  metaDescription?: string
  metaKeywords?: string
  authorId: string
  categoryId?: string
  createdAt: string
  updatedAt: string
  author: User
  category?: Category
  tags?: Tag[]
}

export enum PostStatus {
  Draft = 0,
  Published = 1,
  Archived = 2
}

export interface CreatePostRequest {
  title: string
  content: string
  excerpt?: string
  featuredImageUrl?: string
  categoryId?: string
  tags?: string[]
  metaDescription?: string
  metaKeywords?: string
}

export interface UpdatePostRequest {
  title?: string
  content?: string
  excerpt?: string
  featuredImageUrl?: string
  categoryId?: string
  tags?: string[]
  metaDescription?: string
  metaKeywords?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  postCount: number
  color?: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  postCount: number
  color?: string
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
} 