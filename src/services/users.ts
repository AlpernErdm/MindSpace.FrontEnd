import api from './api';

export interface UserProfile {
  id: string;
  userName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profileImageUrl?: string;
  website?: string;
  twitterHandle?: string;
  linkedInUrl?: string;
  joinDate: string;
  followerCount: number;
  followingCount: number;
  isVerified: boolean;
  isFollowing: boolean;
  recentPosts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    publishedAt: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
  }>;
}

export interface FollowerUser {
  id: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profileImageUrl?: string;
  followerCount: number;
  followingCount: number;
  isVerified: boolean;
}

export interface FollowersResponse {
  followers: FollowerUser[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FollowingResponse {
  following: FollowerUser[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const usersService = {
  // Kullanıcı profilini getir
  getUserProfile: async (userName: string) => {
    const response = await api.get(`/users/${userName}`);
    return response.data;
  },

  // Kullanıcıyı takip et/takibi bırak
  toggleFollow: async (userName: string) => {
    const response = await api.post(`/users/${userName}/follow`);
    return response.data;
  },

  // Kullanıcının takipçilerini getir
  getFollowers: async (userName: string, page = 1, pageSize = 20) => {
    const response = await api.get(`/users/${userName}/followers?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  // Kullanıcının takip ettiklerini getir
  getFollowing: async (userName: string, page = 1, pageSize = 20) => {
    const response = await api.get(`/users/${userName}/following?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  // Kullanıcının postlarını getir
  getUserPosts: async (userName: string, page = 1, pageSize = 10) => {
    const response = await api.get(`/users/${userName}/posts?page=${page}&pageSize=${pageSize}`);
    return response.data;
  }
}; 