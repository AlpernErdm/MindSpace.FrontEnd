import api from './api';

export interface Author {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  roles: string[];
  stats: {
    posts: number;
    comments: number;
    followers: number;
    following: number;
  };
}

export interface AuthorsResponse {
  users: Author[];
  totalCount: number;
}

export const authorsService = {
  async getAuthors(): Promise<AuthorsResponse> {
    const response = await api.get('/Test/users');
    return response.data;
  },

  async getAuthorById(id: string): Promise<Author> {
    const response = await api.get(`/Test/users/${id}`);
    return response.data;
  }
}; 