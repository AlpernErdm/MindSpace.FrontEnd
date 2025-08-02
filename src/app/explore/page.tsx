'use client';

import { useState, useEffect } from 'react';
import { PostCard } from '@/components/PostCard';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Post } from '@/types';
import { postsService } from '@/services/posts';
import { categoriesService, Category } from '@/services/categories';
import { tagsService, Tag } from '@/services/tags';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TrendingUp, 
  BookOpen, 
  Hash, 
  Search, 
  ArrowRight, 
  Eye, 
  Heart, 
  MessageCircle,
  Zap,
  Star,
  Clock,
  Users
} from 'lucide-react';
import Link from 'next/link';

export default function ExplorePage() {
  const { user: currentUser } = useAuth();
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadExploreData();
  }, []);

  const loadExploreData = async () => {
    try {
      setLoading(true);
      
      // Paralel olarak tüm verileri yükle
      const [postsData, categoriesData, tagsData] = await Promise.all([
        postsService.getPosts(1, 10),
        categoriesService.getCategories(),
        tagsService.getTags()
      ]);

      setTrendingPosts(postsData.items || []);
      setRecentPosts(postsData.items || []);
      setCategories(categoriesData.slice(0, 6)); // İlk 6 kategori
      setTags(tagsData.slice(0, 12)); // İlk 12 etiket
    } catch (error) {
      console.error('Keşfet verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const trendingTopics = [
    'Teknoloji', 'Yazılım', 'Girişimcilik', 'Sağlık', 'Finans', 'Sanat',
    'Bilim', 'Seyahat', 'Spor', 'Müzik', 'Eğitim', 'Politika'
  ];

  const getRandomColor = () => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-green-500 to-green-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-yellow-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-teal-500 to-teal-600'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="h-4 bg-gray-200 rounded w-full"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
            Keşfet
          </h1>
          <p className="text-gray-600 text-lg">
            İlginizi çeken içerikleri keşfedin ve yeni fikirlerle tanışın
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Yazı, yazar veya konu ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trending Posts */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                  Trend Yazılar
                </h2>
                <Link href="/trending">
                  <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                    Tümünü Gör
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {trendingPosts.length > 0 ? (
                <div className="space-y-6">
                  {trendingPosts.slice(0, 3).map((post) => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      variant="featured" 
                      showActions={currentUser?.userName === post.author?.userName}
                      onEdit={(post) => {
                        window.location.href = `/write?edit=${post.id}`;
                      }}
                      onDelete={(postId) => {
                        setTrendingPosts(trendingPosts.filter(p => p.id !== postId));
                      }}
                    />
                  ))}
                </div>
              ) : (
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-8 text-center">
                    <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz trend yazı yok</h3>
                    <p className="text-gray-600">İlk trend yazıyı siz oluşturun!</p>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Recent Posts */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="h-6 w-6 text-blue-500" />
                  Son Yazılar
                </h2>
                <Link href="/recent">
                  <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                    Tümünü Gör
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {recentPosts.length > 0 ? (
                <div className="space-y-6">
                  {recentPosts.slice(3, 6).map((post) => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      variant="default" 
                      showActions={currentUser?.userName === post.author?.userName}
                      onEdit={(post) => {
                        window.location.href = `/write?edit=${post.id}`;
                      }}
                      onDelete={(postId) => {
                        setRecentPosts(recentPosts.filter(p => p.id !== postId));
                      }}
                    />
                  ))}
                </div>
              ) : (
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-8 text-center">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz yazı yok</h3>
                    <p className="text-gray-600">İlk yazıyı siz oluşturun!</p>
                  </CardContent>
                </Card>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Popular Categories */}
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    Popüler Kategoriler
                  </h3>
                  <Link href="/topics">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      Tümü
                    </Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <Link key={category.id} href={`/category/${category.slug}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 bg-gradient-to-r ${getRandomColor()} rounded-lg flex items-center justify-center text-white text-sm font-semibold`}>
                            {category.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{category.name}</p>
                            <p className="text-sm text-gray-500">{category.postCount} yazı</p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Tags */}
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Hash className="h-5 w-5 text-purple-500" />
                    Popüler Etiketler
                  </h3>
                  <Link href="/topics">
                    <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                      Tümü
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Link key={tag.id} href={`/tag/${tag.slug}`}>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors cursor-pointer">
                        #{tag.name}
                        <span className="ml-1 text-xs text-purple-600">({tag.postCount})</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Trend Konular
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {trendingTopics.map((topic) => (
                    <Link key={topic} href={`/search?q=${encodeURIComponent(topic)}`}>
                      <div className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer text-center">
                        <p className="font-medium text-gray-900 text-sm">{topic}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">MindSpace İstatistikleri</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Aktif Yazar</span>
                    </div>
                    <span className="font-bold">1,000+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Toplam Yazı</span>
                    </div>
                    <span className="font-bold">5,000+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      <span>Toplam Beğeni</span>
                    </div>
                    <span className="font-bold">50,000+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>Toplam Yorum</span>
                    </div>
                    <span className="font-bold">25,000+</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 