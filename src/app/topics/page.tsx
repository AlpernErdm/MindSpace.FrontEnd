'use client';

import { useState, useEffect } from 'react';
import { Search, Tag, Hash, TrendingUp, BookOpen, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { categoriesService, Category } from '@/services/categories';
import { tagsService, Tag as TagType } from '@/services/tags';



export default function TopicsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories');

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      
      // Kategorileri yükle
      const categoriesData = await categoriesService.getCategories();
      setCategories(categoriesData);

      // Etiketleri yükle
      const tagsData = await tagsService.getTags();
      setTags(tagsData);
    } catch (error) {
      console.error('Konular yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Konular
          </h1>
          <p className="text-gray-600 text-lg">
            İlginizi çeken konuları keşfedin ve favori yazarlarınızı bulun
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Konu ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-1">
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'categories'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Kategoriler
              </div>
            </button>
            <button
              onClick={() => setActiveTab('tags')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'tags'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Etiketler
              </div>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-sm border border-gray-100">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{categories.length}</h3>
              <p className="text-gray-600">Kategori</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border border-gray-100">
            <CardContent className="p-6 text-center">
              <Hash className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">{tags.length}</h3>
              <p className="text-gray-600">Etiket</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border border-gray-100">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-900">
                {categories.reduce((acc, cat) => acc + cat.postCount, 0) + tags.reduce((acc, tag) => acc + tag.postCount, 0)}
              </h3>
              <p className="text-gray-600">Toplam Yazı</p>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        {activeTab === 'categories' ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Kategoriler</h2>
              <span className="text-gray-600">{filteredCategories.length} kategori</span>
            </div>

            {filteredCategories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category) => (
                  <Card key={category.id} className="bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${getRandomColor()} rounded-lg flex items-center justify-center text-white font-semibold shadow-lg`}>
                          {category.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {category.postCount} yazı
                          </p>
                        </div>
                      </div>
                      
                      {category.description && (
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      
                      <Link href={`/category/${category.slug}`}>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Yazıları Gör
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Kategori bulunamadı
                  </h3>
                  <p className="text-gray-600">
                    Arama kriterlerinize uygun kategori bulunamadı.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Etiketler</h2>
              <span className="text-gray-600">{filteredTags.length} etiket</span>
            </div>

            {filteredTags.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTags.map((tag) => (
                  <Card key={tag.id} className="bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 group">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${getRandomColor()} rounded-lg flex items-center justify-center text-white font-semibold shadow-lg`}>
                          #{tag.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                            #{tag.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {tag.postCount} yazı
                          </p>
                        </div>
                      </div>
                      
                      {tag.description && (
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {tag.description}
                        </p>
                      )}
                      
                      <Link href={`/tag/${tag.slug}`}>
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg">
                          <Hash className="h-4 w-4 mr-2" />
                          Yazıları Gör
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                  <Hash className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Etiket bulunamadı
                  </h3>
                  <p className="text-gray-600">
                    Arama kriterlerinize uygun etiket bulunamadı.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Popular Topics */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popüler Konular</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              'Teknoloji', 'Yazılım', 'Girişimcilik', 'Sağlık', 'Finans', 'Sanat',
              'Bilim', 'Seyahat', 'Spor', 'Müzik', 'Eğitim', 'Politika'
            ].map((topic) => (
              <Link key={topic} href={`/search?q=${encodeURIComponent(topic)}`}>
                <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-blue-200 cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                      {topic}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 