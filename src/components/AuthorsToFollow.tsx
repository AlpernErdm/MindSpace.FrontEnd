'use client';

import { useState, useEffect } from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { authorsService, Author } from '@/services/authors';
import { usersService } from '@/services/users';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export const AuthorsToFollow = () => {
  const { user: currentUser, isAuthenticated, refreshUser } = useAuth();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [followingStates, setFollowingStates] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuthors();
  }, []);

  const loadAuthors = async () => {
    try {
      setLoading(true);
      const response = await authorsService.getAuthors();
      
      // Sadece ilk 3 yazarı göster ve takip edilmeyenleri öncelikle
      const sortedAuthors = response.users
        .filter(author => author.userName !== currentUser?.userName) // Kendini filtrele
        .sort((a, b) => b.stats.followers - a.stats.followers) // Takipçi sayısına göre sırala
        .slice(0, 3);

      setAuthors(sortedAuthors);
      
      // Her yazar için follow durumunu kontrol et
      if (isAuthenticated) {
        const followingStates: { [key: string]: boolean } = {};
        for (const author of sortedAuthors) {
          try {
            const profile = await usersService.getUserProfile(author.userName);
            followingStates[author.userName] = profile.isFollowing;
          } catch (error) {
            followingStates[author.userName] = false;
          }
        }
        setFollowingStates(followingStates);
      }
    } catch (error) {
      console.error('Yazarlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (author: Author) => {
    if (!isAuthenticated) {
      // Login sayfasına yönlendir
      return;
    }
    
    try {
      const response = await usersService.toggleFollow(author.userName);
      setFollowingStates(prev => ({
        ...prev,
        [author.userName]: response.isFollowing
      }));
      
      // Kullanıcının kendi profil bilgilerini güncelle (following count için)
      await refreshUser();
    } catch (error) {
      console.error('Takip işlemi sırasında hata:', error);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Takip Edilebilecek Yazarlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-16 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (authors.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Takip Edilebilecek Yazarlar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {authors.map((author) => (
            <div key={author.id} className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {author.firstName?.[0]}{author.lastName?.[0]}
              </div>
              
              {/* Author Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {author.firstName} {author.lastName}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {author.bio || `${author.stats.posts} yazı • ${author.stats.followers} takipçi`}
                </p>
              </div>
              
              {/* Follow Button */}
              {currentUser?.userName !== author.userName && (
                <Button
                  size="sm"
                  variant={followingStates[author.userName] ? "outline" : "default"}
                  className={`${
                    followingStates[author.userName]
                      ? 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                  } rounded-full px-4 py-1 text-xs font-medium`}
                  onClick={() => handleFollow(author)}
                >
                  {followingStates[author.userName] ? 'Takibi Bırak' : 'Takip Et'}
                </Button>
              )}
            </div>
          ))}
        </div>
        
        {/* See All Button */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link href="/writers">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            >
              <Users className="h-4 w-4 mr-2" />
              Tümünü Gör
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}; 