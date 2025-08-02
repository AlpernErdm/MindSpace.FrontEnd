import api from './api';

export interface CreateCommentRequest {
  content: string;
  postId: string;
  parentCommentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  likeCount: number;
  postId: string;
  parentCommentId?: string;
  author: {
    id: string;
    userName: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
  replies?: Comment[];
  replyCount?: number;
}

export const commentsService = {
  // Post'un yorumlarını getir
  getPostComments: async (postId: string, page = 1, pageSize = 20) => {
    const response = await api.get(`/comments/posts/${postId}?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  // Yeni yorum oluştur
  createComment: async (request: CreateCommentRequest) => {
    const response = await api.post('/comments', request);
    return response.data;
  },

  // Yorum güncelle
  updateComment: async (commentId: string, request: UpdateCommentRequest) => {
    const response = await api.put(`/comments/${commentId}`, request);
    return response.data;
  },

  // Yorum sil
  deleteComment: async (commentId: string) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },

  // Yorum detayını getir
  getCommentById: async (commentId: string) => {
    const response = await api.get(`/comments/${commentId}`);
    return response.data;
  }
}; 