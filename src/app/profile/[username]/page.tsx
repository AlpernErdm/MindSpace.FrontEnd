'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PostCard } from '@/components/PostCard';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  Twitter, 
  Linkedin,
  BookOpen,
  Heart,
  Eye,
  Users,
  Award,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { Post } from '@/types';
import { postsService } from '@/services/posts';
import { authorsService, Author } from '@/services/authors';
import { usersService, UserProfile } from '@/services/users';

export default function AuthorProfilePage() {
  const params = useParams();
  const { user: currentUser, isAuthenticated, refreshUser } = useAuth();
  const [author, setAuthor] = useState<Author | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const username = params.username as string;

  useEffect(() => {
    loadAuthorProfile();
  }, [username]);

  const loadAuthorProfile = async () => {
    try {
      setLoading(true);
      
      // Önce tüm yazarları getir ve username'e göre filtrele
      const authorsResponse = await authorsService.getAuthors();
      const foundAuthor = authorsResponse.users.find(a => a.userName === username);
      
      if (!foundAuthor) {
        throw new Error('Yazar bulunamadı');
      }
      
      setAuthor(foundAuthor);
      
      // Kullanıcı profilini getir (follow durumu dahil)
      try {
        const profile = await usersService.getUserProfile(username);
        setUserProfile(profile);
        setIsFollowing(profile.isFollowing);
      } catch (error) {
        console.error('Kullanıcı profili yüklenirken hata:', error);
      }
      
      // Bu yazarın yazılarını getir (şimdilik tüm yazılardan filtrele)
      const allPostsResponse = await postsService.getPosts(1, 100);
      const authorPosts = allPostsResponse.items?.filter(post => 
        post.author?.userName === username
      ) || [];
      
      setPosts(authorPosts);
      
    } catch (error) {
      console.error('Yazar profili yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      // Login sayfasına yönlendir
      return;
    }
    
    try {
      const response = await usersService.toggleFollow(username);
      setIsFollowing(response.isFollowing);
      
      // Profil bilgilerini güncelle
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          followerCount: response.isFollowing 
            ? userProfile.followerCount + 1 
            : userProfile.followerCount - 1
        });
      }
      
      // Author bilgilerini de güncelle
      if (author) {
        setAuthor({
          ...author,
          stats: {
            ...author.stats,
            followers: response.isFollowing 
              ? author.stats.followers + 1 
              : author.stats.followers - 1
          }
        });
      }

      // Kullanıcının kendi profil bilgilerini güncelle (following count için)
      await refreshUser();
    } catch (error) {
      console.error('Takip işlemi sırasında hata:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <User className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Yazar Bulunamadı</h2>
              <p className="text-gray-600 mb-6">Aradığınız yazar bulunamadı veya profil mevcut değil.</p>
              <Link href="/writers">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-full">
                  Yazarlara Dön
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.userName === username;

  const stats = [
    { label: 'Yazılar', value: author.stats.posts, icon: BookOpen, color: 'text-blue-600' },
    { label: 'Takipçi', value: author.stats.followers, icon: Users, color: 'text-green-600' },
    { label: 'Takip', value: author.stats.following, icon: Heart, color: 'text-red-600' },
    { label: 'Yorumlar', value: author.stats.comments, icon: Eye, color: 'text-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/writers">
            <Button variant="outline" className="flex items-center gap-2 border-gray-300 hover:border-blue-500">
              <ArrowLeft className="h-4 w-4" />
              Yazarlara Dön
            </Button>
          </Link>
        </div>

        {/* Profile Header */}
        <Card className="backdrop-blur-xl bg-white/80 shadow-2xl border-0 rounded-2xl mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* Avatar & Basic Info */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                  {author.firstName?.[0]}{author.lastName?.[0]}
                </div>
                {author.roles.includes('Admin') && (
                  <div className="flex items-center justify-center mt-3">
                    <Award className="h-5 w-5 text-yellow-500 mr-1" />
                    <span className="text-sm text-yellow-600 font-medium">Admin</span>
                  </div>
                )}
              </div>

              {/* User Details */}
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {author.firstName} {author.lastName}
                    </h1>
                    <p className="text-lg text-gray-600 mb-2">@{author.userName}</p>
                    {author.bio && (
                      <p className="text-gray-700 leading-relaxed max-w-2xl">
                        {author.bio}
                      </p>
                    )}
                  </div>

                                     {/* Action Buttons */}
                   <div className="flex gap-3">
                     {!isOwnProfile && currentUser?.userName !== username && (
                       <Button 
                         onClick={handleFollow}
                         className={`${
                           isFollowing 
                             ? 'bg-gray-600 hover:bg-gray-700' 
                             : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                         } text-white rounded-full`}
                       >
                         {isFollowing ? 'Takibi Bırak' : 'Takip Et'}
                       </Button>
                     )}
                     {isOwnProfile && (
                       <Link href="/profile">
                         <Button variant="outline" className="border-gray-300 hover:border-blue-500 rounded-full">
                           Profilimi Düzenle
                         </Button>
                       </Link>
                     )}
                   </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className={`${stat.color} mb-1`}>
                        <stat.icon className="h-6 w-6 mx-auto" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {author.firstName} {author.lastName}&apos;in Yazıları
            </h2>
            <span className="text-gray-600">{posts.length} yazı</span>
          </div>

                     {posts.length > 0 ? (
             <div className="space-y-6">
               {posts.map((post) => (
                 <PostCard 
                   key={post.id} 
                   post={post} 
                   variant="featured" 
                   showActions={isOwnProfile}
                   onEdit={(post) => {
                     // Düzenleme sayfasına yönlendir
                     window.location.href = `/write?edit=${post.id}`;
                   }}
                   onDelete={(postId) => {
                     // Post'u listeden kaldır
                     setPosts(posts.filter(p => p.id !== postId));
                   }}
                 />
               ))}
             </div>
          ) : (
            <Card className="bg-white shadow-lg">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Henüz yazı yok
                </h3>
                <p className="text-gray-600">
                  {author.firstName} henüz yazı paylaşmamış.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 