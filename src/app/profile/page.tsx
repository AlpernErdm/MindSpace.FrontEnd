'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
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
  Edit3,
  Settings,
  BookOpen,
  Heart,
  Eye,
  Users,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { Post } from '@/types';
import { postsService } from '@/services/posts';
import { usersService, FollowerUser, FollowersResponse, FollowingResponse } from '@/services/users';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'posts' | 'drafts' | 'liked' | 'followers' | 'following'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<FollowerUser[]>([]);
  const [following, setFollowing] = useState<FollowerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  // Fetch user posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const postsResult = await postsService.getMyPosts(1, 10);
        setPosts(postsResult.items || []);
      } catch (error: unknown) {
        console.error('Error fetching user posts:', error);
        setPosts([]); // Hata durumunda boş array
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [user]);

  // Fetch followers
  const fetchFollowers = async () => {
    if (!user) return;
    
    try {
      setFollowersLoading(true);
      const response: FollowersResponse = await usersService.getFollowers(user.userName, 1, 50);
      setFollowers(response.followers);
    } catch (error: unknown) {
      console.error('Error fetching followers:', error);
      setFollowers([]);
    } finally {
      setFollowersLoading(false);
    }
  };

  // Fetch following
  const fetchFollowing = async () => {
    if (!user) return;
    
    try {
      setFollowingLoading(true);
      const response: FollowingResponse = await usersService.getFollowing(user.userName, 1, 50);
      setFollowing(response.following);
    } catch (error: unknown) {
      console.error('Error fetching following:', error);
      setFollowing([]);
    } finally {
      setFollowingLoading(false);
    }
  };

  // Tab değiştiğinde ilgili veriyi yükle
  useEffect(() => {
    if (activeTab === 'followers' && followers.length === 0) {
      fetchFollowers();
    } else if (activeTab === 'following' && following.length === 0) {
      fetchFollowing();
    }
  }, [activeTab, user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Yazılar', value: posts.length, icon: BookOpen, color: 'text-blue-600' },
    { label: 'Takipçi', value: user.followerCount || 0, icon: Users, color: 'text-green-600' },
    { label: 'Takip', value: user.followingCount || 0, icon: Heart, color: 'text-red-600' },
    { label: 'Görüntülenme', value: posts.reduce((acc, post) => acc + (post.viewCount || 0), 0), icon: Eye, color: 'text-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="backdrop-blur-xl bg-white/80 shadow-2xl border-0 rounded-2xl mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* Avatar & Basic Info */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                {user.isVerified && (
                  <div className="flex items-center justify-center mt-3">
                    <Award className="h-5 w-5 text-blue-500 mr-1" />
                    <span className="text-sm text-blue-600 font-medium">Doğrulanmış</span>
                  </div>
                )}
              </div>

              {/* User Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                      {user.firstName} {user.lastName}
                    </h1>
                    <p className="text-gray-600 text-lg">@{user.userName}</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      variant="outline"
                      className="border-gray-300 hover:border-blue-500 rounded-full"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Düzenle
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="border-gray-300 hover:border-blue-500 rounded-full"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Ayarlar
                    </Button>
                  </div>
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {user.bio}
                  </p>
                )}

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-5 w-5 mr-3 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                    <span>Katıldı: {new Date(user.joinDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                  
                  {user.website && (
                    <div className="flex items-center text-gray-600">
                      <LinkIcon className="h-5 w-5 mr-3 text-gray-400" />
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                        {user.website}
                      </a>
                    </div>
                  )}
                  
                  {user.twitterHandle && (
                    <div className="flex items-center text-gray-600">
                      <Twitter className="h-5 w-5 mr-3 text-gray-400" />
                      <a href={`https://twitter.com/${user.twitterHandle}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                        @{user.twitterHandle}
                      </a>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center p-4 bg-white/60 rounded-xl">
                      <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Content Tabs */}
        <Card className="backdrop-blur-xl bg-white/80 shadow-xl border-0 rounded-2xl">
          <CardHeader className="border-b border-gray-100">
            <div className="flex space-x-8">
              {[
                { key: 'posts', label: 'Yazılarım', count: posts.length },
                { key: 'followers', label: 'Takipçiler', count: user.followerCount || 0 },
                { key: 'following', label: 'Takip Ettiklerim', count: user.followingCount || 0 },
                { key: 'drafts', label: 'Taslaklar', count: 0 },
                { key: 'liked', label: 'Beğendiklerim', count: 0 }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as 'posts' | 'drafts' | 'liked')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <span className="font-medium">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activeTab === tab.key ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Yükleniyor...</p>
              </div>
            ) : (
              <>
                {activeTab === 'posts' && (
                  <div className="space-y-6">
                    {posts.length === 0 ? (
                      <div className="text-center py-16">
                        <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz yazınız yok</h3>
                        <p className="text-gray-600 mb-6">İlk yazınızı paylaşarak başlayın!</p>
                        <Link href="/write">
                          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-full">
                            <Edit3 className="h-4 w-4 mr-2" />
                            Yazı Yaz
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      posts.map((post) => (
                        <PostCard 
                          key={post.id} 
                          post={post} 
                          variant="default" 
                          showActions={true}
                          onEdit={(post) => {
                            // Düzenleme sayfasına yönlendir
                            window.location.href = `/write?edit=${post.id}`;
                          }}
                          onDelete={(postId) => {
                            // Post'u listeden kaldır
                            setPosts(posts.filter(p => p.id !== postId));
                          }}
                        />
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'drafts' && (
                  <div className="text-center py-16">
                    <Edit3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Taslak yazınız yok</h3>
                    <p className="text-gray-600">Yazım sürecindeki makaleleriniz burada görünecek.</p>
                  </div>
                )}

                {activeTab === 'followers' && (
                  <div className="space-y-6">
                    {followersLoading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Takipçiler yükleniyor...</p>
                      </div>
                    ) : followers.length === 0 ? (
                      <div className="text-center py-16">
                        <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz takipçiniz yok</h3>
                        <p className="text-gray-600">Yazılarınızı paylaşarak takipçi kazanmaya başlayın!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {followers.map((follower) => (
                          <Card key={follower.id} className="bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
                            <CardContent className="p-6">
                              <div className="flex items-start space-x-4 mb-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                  {follower.firstName?.[0]}{follower.lastName?.[0]}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold text-gray-900">
                                      {follower.firstName} {follower.lastName}
                                    </h3>
                                    {follower.isVerified && (
                                      <Award className="h-4 w-4 text-blue-500" />
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 mb-2">@{follower.userName}</p>
                                  {follower.bio && (
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                      {follower.bio}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                                    <BookOpen className="h-4 w-4" />
                                    <span className="text-sm font-semibold">{follower.followerCount}</span>
                                  </div>
                                  <p className="text-xs text-gray-500">Takipçi</p>
                                </div>
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                                    <Heart className="h-4 w-4" />
                                    <span className="text-sm font-semibold">{follower.followingCount}</span>
                                  </div>
                                  <p className="text-xs text-gray-500">Takip</p>
                                </div>
                              </div>

                              <Link href={`/profile/${follower.userName}`}>
                                <Button 
                                  size="sm" 
                                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg"
                                >
                                  Profili Gör
                                </Button>
                              </Link>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'following' && (
                  <div className="space-y-6">
                    {followingLoading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Takip edilenler yükleniyor...</p>
                      </div>
                    ) : following.length === 0 ? (
                      <div className="text-center py-16">
                        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz kimseyi takip etmiyorsunuz</h3>
                        <p className="text-gray-600">İlginizi çeken yazarları takip etmeye başlayın!</p>
                        <Link href="/writers" className="inline-block mt-4">
                          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-full">
                            Yazarları Keşfet
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {following.map((followedUser) => (
                          <Card key={followedUser.id} className="bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
                            <CardContent className="p-6">
                              <div className="flex items-start space-x-4 mb-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                  {followedUser.firstName?.[0]}{followedUser.lastName?.[0]}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold text-gray-900">
                                      {followedUser.firstName} {followedUser.lastName}
                                    </h3>
                                    {followedUser.isVerified && (
                                      <Award className="h-4 w-4 text-blue-500" />
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 mb-2">@{followedUser.userName}</p>
                                  {followedUser.bio && (
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                      {followedUser.bio}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                                    <BookOpen className="h-4 w-4" />
                                    <span className="text-sm font-semibold">{followedUser.followerCount}</span>
                                  </div>
                                  <p className="text-xs text-gray-500">Takipçi</p>
                                </div>
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                                    <Heart className="h-4 w-4" />
                                    <span className="text-sm font-semibold">{followedUser.followingCount}</span>
                                  </div>
                                  <p className="text-xs text-gray-500">Takip</p>
                                </div>
                              </div>

                              <Link href={`/profile/${followedUser.userName}`}>
                                <Button 
                                  size="sm" 
                                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg"
                                >
                                  Profili Gör
                                </Button>
                              </Link>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'liked' && (
                  <div className="text-center py-16">
                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz beğendiğiniz yazı yok</h3>
                    <p className="text-gray-600">Beğendiğiniz yazılar burada görünecek.</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 