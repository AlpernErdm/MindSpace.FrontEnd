import api from './api';

export const likesService = {
  // Post beğen/beğenme
  togglePostLike: async (postId: string) => {
    const response = await api.post(`/likes/posts/${postId}`);
    return response.data;
  },

  // Comment beğen/beğenme
  toggleCommentLike: async (commentId: string) => {
    const response = await api.post(`/likes/comments/${commentId}`);
    return response.data;
  },

  // Post beğeni durumunu kontrol et
  getPostLikeStatus: async (postId: string) => {
    const response = await api.get(`/likes/posts/${postId}/status`);
    return response.data;
  },

  // Comment beğeni durumunu kontrol et
  getCommentLikeStatus: async (commentId: string) => {
    const response = await api.get(`/likes/comments/${commentId}/status`);
    return response.data;
  }
}; 