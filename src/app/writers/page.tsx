'use client';

import { useState, useEffect } from 'react';
import { Search, Users, TrendingUp, Award, BookOpen, MessageCircle, Heart, Eye, Bell } from 'lucide-react';
import { authorsService, Author } from '@/services/authors';
import { usersService } from '@/services/users';
import { notificationsService } from '@/services/notifications';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function WritersPage() {
  const { user: currentUser, isAuthenticated, refreshUser } = useAuth();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [filteredAuthors, setFilteredAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'posts' | 'followers' | 'recent'>('posts');
  const [followingStates, setFollowingStates] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadAuthors();
  }, []);

  useEffect(() => {
    filterAndSortAuthors();
  }, [authors, searchTerm, sortBy]);

  const loadAuthors = async () => {
    try {
      setLoading(true);
      const response = await authorsService.getAuthors();
      setAuthors(response.users);
      
      // Her yazar için follow durumunu kontrol et
      if (isAuthenticated) {
        const followingStates: { [key: string]: boolean } = {};
        for (const author of response.users) {
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

  const filterAndSortAuthors = () => {
    let filtered = [...authors];

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(author =>
        author.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        author.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        author.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        author.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sıralama
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => 
          `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        );
        break;
      case 'posts':
        filtered.sort((a, b) => b.stats.posts - a.stats.posts);
        break;
      case 'followers':
        filtered.sort((a, b) => b.stats.followers - a.stats.followers);
        break;
      case 'recent':
        // En son yazı yazanlar (şimdilik basit sıralama)
        filtered.sort((a, b) => b.stats.posts - a.stats.posts);
        break;
    }

    setFilteredAuthors(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSortBy('posts');
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
      
      // Author stats'ını güncelle
      setAuthors(prev => prev.map(a => 
        a.userName === author.userName 
          ? {
              ...a,
              stats: {
                ...a.stats,
                followers: response.isFollowing 
                  ? a.stats.followers + 1 
                  : a.stats.followers - 1
              }
            }
          : a
      ));

      // Kullanıcının kendi profil bilgilerini güncelle (following count için)
      await refreshUser();
    } catch (error) {
      console.error('Takip işlemi sırasında hata:', error);
    }
  };

  const handleTestNotification = async () => {
    try {
      await notificationsService.createTestNotification();
      alert('Test bildirimi oluşturuldu! Bildirim dropdown\'ını kontrol edin.');
    } catch (error) {
      console.error('Test bildirimi oluşturma hatası:', error);
      alert('Test bildirimi oluşturulamadı.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Yazarlar
          </h1>
          <p className="text-gray-600 text-lg">
            MindSpace&apos;teki yetenekli yazarları keşfedin ve takip edin
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Yazar ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'posts' | 'followers' | 'recent')}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="posts">En Çok Yazı</option>
              <option value="followers">En Çok Takipçi</option>
              <option value="name">İsme Göre</option>
              <option value="recent">En Aktif</option>
            </select>

            {/* Test Notification Button */}
            {isAuthenticated && (
              <Button
                onClick={handleTestNotification}
                variant="outline"
                className="border-orange-300 hover:border-orange-500 text-orange-600 hover:text-orange-700"
              >
                <Bell className="h-4 w-4 mr-2" />
                Test Bildirimi
              </Button>
            )}

            {/* Clear Filters */}
            {(searchTerm || sortBy !== 'posts') && (
              <Button
                onClick={clearFilters}
                variant="outline"
                className="border-gray-300 hover:border-blue-500"
              >
                Filtreleri Temizle
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm border border-gray-100">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{authors.length}</h3>
              <p className="text-gray-600">Toplam Yazar</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border border-gray-100">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">
                {authors.reduce((acc, author) => acc + author.stats.posts, 0)}
              </h3>
              <p className="text-gray-600">Toplam Yazı</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border border-gray-100">
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">
                {authors.reduce((acc, author) => acc + author.stats.followers, 0)}
              </h3>
              <p className="text-gray-600">Toplam Takipçi</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border border-gray-100">
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">
                {authors.reduce((acc, author) => acc + author.stats.comments, 0)}
              </h3>
              <p className="text-gray-600">Toplam Yorum</p>
            </CardContent>
          </Card>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredAuthors.length} yazar bulundu
          </p>
        </div>

        {/* Authors Grid */}
        {filteredAuthors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuthors.map((author) => (
              <Card key={author.id} className="bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group">
                <CardContent className="p-6">
                  {/* Author Header */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {author.firstName?.[0]}{author.lastName?.[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {author.firstName} {author.lastName}
                        </h3>
                        {author.roles.includes('Admin') && (
                          <Award className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">@{author.userName}</p>
                      {author.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {author.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                        <BookOpen className="h-4 w-4" />
                        <span className="text-sm font-semibold">{author.stats.posts}</span>
                      </div>
                      <p className="text-xs text-gray-500">Yazı</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                        <Heart className="h-4 w-4" />
                        <span className="text-sm font-semibold">{author.stats.followers}</span>
                      </div>
                      <p className="text-xs text-gray-500">Takipçi</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm font-semibold">{author.stats.comments}</span>
                      </div>
                      <p className="text-xs text-gray-500">Yorum</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg"
                    >
                      <Link href={`/profile/${author.userName}`} className="w-full text-center">
                        Profili Gör
                      </Link>
                    </Button>
                                         {currentUser?.userName !== author.userName && (
                       <Button 
                         size="sm" 
                         variant="outline" 
                         className={`${
                           followingStates[author.userName] 
                             ? 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600' 
                             : 'border-gray-300 hover:border-blue-500'
                         } rounded-lg`}
                         onClick={() => handleFollow(author)}
                       >
                         {followingStates[author.userName] ? 'Takibi Bırak' : 'Takip Et'}
                       </Button>
                     )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Yazar bulunamadı
              </h3>
              <p className="text-gray-600 mb-4">
                Arama kriterlerinize uygun yazar bulunamadı.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {filteredAuthors.length > 0 && (
          <div className="text-center mt-8">
            <Button className="inline-flex items-center px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              Daha Fazla Yazar Yükle
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 