'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PostCard } from '@/components/PostCard';
import { categoriesService, Category } from '@/services/categories';
import { postsService } from '@/services/posts';
import { Post } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { BookOpen, ArrowLeft, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function CategoryPage() {
  const params = useParams();
  const { user: currentUser } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (params.slug) {
      loadCategoryData();
    }
  }, [params.slug]);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      
      // Kategori bilgilerini yükle
      const categoryData = await categoriesService.getCategoryBySlug(params.slug as string);
      setCategory(categoryData);

      // Kategorideki yazıları yükle
      const postsData = await postsService.getPostsByCategory(params.slug as string, 1, 20);
      setPosts(postsData.items || []);
    } catch (error) {
      console.error('Kategori verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <BookOpen className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Kategori bulunamadı</h1>
            <p className="text-gray-600 mb-6">Aradığınız kategori mevcut değil.</p>
            <Link href="/topics">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Konulara Dön
              </Button>
            </Link>
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
          <Link href="/topics">
            <Button variant="ghost" className="mb-4 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Konulara Dön
            </Button>
          </Link>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {category.name[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
                <p className="text-gray-600">{category.postCount} yazı</p>
              </div>
            </div>
            
            {category.description && (
              <p className="text-gray-600 text-lg leading-relaxed">
                {category.description}
              </p>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Bu kategoride yazı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Posts */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {category.name} Kategorisindeki Yazılar
            </h2>
            <span className="text-gray-600">{filteredPosts.length} yazı</span>
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <Card className="bg-white shadow-lg">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz yazı yok'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Arama kriterlerinize uygun yazı bulunamadı.'
                  : 'Bu kategoride henüz yazı bulunmuyor.'
                }
              </p>
              {!searchTerm && (
                <Link href="/write">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    İlk Yazıyı Yaz
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {filteredPosts.map((post) => (
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

        {/* Load More */}
        {filteredPosts.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" className="border-2 border-gray-300 hover:border-blue-500 px-8 py-3 rounded-full font-semibold">
              Daha Fazla Yazı Yükle
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 