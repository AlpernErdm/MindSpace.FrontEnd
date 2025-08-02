  'use client';

import { useState, useEffect } from 'react';
import { PostCard } from '@/components/PostCard';
import { AuthorsToFollow } from '@/components/AuthorsToFollow';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { postsService } from '@/services/posts';
import { Post } from '@/types';
import { TrendingUp, Users, BookOpen, Zap, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user: currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postsService.getPosts(1, 10);
        setPosts(response.items || []);
        if (response.items && response.items.length > 0) {
          setFeaturedPost(response.items[0]);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const trendingTopics = [
    'Teknoloji', 'Yazılım', 'Girişimcilik', 'Sağlık', 'Finans', 
    'Sanat', 'Bilim', 'Seyahat', 'Spor', 'Müzik'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">İçerikler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="container mx-auto px-4 py-24 text-center relative">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Düşüncelerinizi Paylaşın, 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}Dünyayı Değiştirin
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            MindSpace&apos;te fikirlerinizi özgürce paylaşabilir, ilham verici içerikler keşfedebilir ve yeni fikirlerle tanışabilirsiniz.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              <Link href="/write" className="flex items-center gap-2">
                Yazmaya Başla
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" className="border-2 border-gray-300 hover:border-blue-500 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300">
              <Link href="/explore">
                Daha Fazla Keşfet
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-0">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">1000+</h3>
                <p className="text-gray-600">Aktif Yazar</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-0">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">5000+</h3>
                <p className="text-gray-600">Yayınlanan Yazı</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 border-0">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-r from-green-500 to-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">10K+</h3>
                <p className="text-gray-600">Aktif Okuyucu</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="İlginizi çeken konuları araştırın..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-full focus:border-blue-500 focus:outline-none transition-colors duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Öne Çıkan Yazı</h2>
            <div className="max-w-4xl mx-auto">
              <Card className="bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden">
                <CardContent className="p-0">
                  <div className="md:flex">
                    <div className="md:w-1/2">
                      <img 
                        src={featuredPost.featuredImageUrl || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                        alt={featuredPost.title}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-1/2 p-8">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Öne Çıkan
                        </span>
                        <span className="text-gray-500 text-sm">
                          {new Date(featuredPost.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      
                      {/* Category and Tags */}
                      <div className="flex items-center gap-2 mb-4">
                        {featuredPost.category && (
                          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {featuredPost.category.name}
                          </span>
                        )}
                        {featuredPost.tags && featuredPost.tags.slice(0, 3).map((tag) => (
                          <span key={tag.id} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                            #{tag.name}
                          </span>
                        ))}
                        {featuredPost.tags && featuredPost.tags.length > 3 && (
                          <span className="text-gray-500 text-xs">+{featuredPost.tags.length - 3} daha</span>
                        )}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                        {featuredPost.title}
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {featuredPost.excerpt || featuredPost.content.substring(0, 150) + '...'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {featuredPost.author?.firstName?.[0] || 'A'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {featuredPost.author?.firstName} {featuredPost.author?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">Yazar</p>
                          </div>
                        </div>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-full">
                          <Link href={`/post/${featuredPost.slug}`}>
                            Oku
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Posts Feed */}
            <div className="lg:w-2/3">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Trend Yazılar</h2>
                <Link href="/trending" className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                  Tümünü Gör
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {posts.length === 0 ? (
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-12 text-center">
                    <Zap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz yazı yok</h3>
                    <p className="text-gray-600 mb-6">İlk yazıyı paylaşmak için hemen başlayın!</p>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-full">
                      <Link href="/write">
                        Yazı Yaz
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-8">
                  {posts.slice(1).map((post) => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      variant="featured" 
                      showActions={currentUser?.userName === post.author?.userName}
                      onEdit={(post) => {
                        window.location.href = `/write?edit=${post.id}`;
                      }}
                      onDelete={(postId) => {
                        setPosts(posts.filter(p => p.id !== postId));
                      }}
                    />
                  ))}
                </div>
              )}

              {posts.length > 0 && (
                <div className="text-center mt-12">
                  <Button variant="outline" className="border-2 border-gray-300 hover:border-blue-500 px-8 py-3 rounded-full font-semibold">
                    Daha Fazla Yazı Yükle
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/3 space-y-8">
              {/* Popular Topics */}
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Popüler Konular</h3>
                  <div className="flex flex-wrap gap-2">
                    {trendingTopics.map((topic) => (
                      <span
                        key={topic}
                        className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-100 hover:to-purple-100 px-3 py-2 rounded-full text-sm font-medium text-gray-700 hover:text-blue-700 cursor-pointer transition-all duration-300"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Authors to Follow */}
              <AuthorsToFollow />

              {/* Newsletter Signup */}
              <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">MindSpace Bülteni</h3>
                  <p className="text-blue-100 mb-4">En iyi yazılar ve güncellemeler doğrudan gelen kutunuza gelsin.</p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="E-posta adresiniz"
                      className="w-full px-4 py-3 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                    <Button className="w-full bg-white text-blue-600 hover:bg-gray-100 rounded-full font-semibold">
                      Abone Ol
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
