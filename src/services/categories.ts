import api from './api';

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  postCount: number;
  color?: string;
}

export const categoriesService = {
  // Tüm kategorileri getir
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Kategori detayını getir
  getCategoryById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Kategori slug'ına göre getir
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await api.get(`/categories/slug/${slug}`);
    return response.data;
  }
}; 