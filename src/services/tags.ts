import api from './api';

export interface Tag {
  id: string;
  name: string;
  description?: string;
  slug: string;
  postCount: number;
  color?: string;
}

export const tagsService = {
  // Tüm etiketleri getir
  getTags: async (): Promise<Tag[]> => {
    const response = await api.get('/tags');
    return response.data;
  },

  // Etiket detayını getir
  getTagById: async (id: string): Promise<Tag> => {
    const response = await api.get(`/tags/${id}`);
    return response.data;
  },

  // Etiket slug'ına göre getir
  getTagBySlug: async (slug: string): Promise<Tag> => {
    const response = await api.get(`/tags/slug/${slug}`);
    return response.data;
  }
}; 