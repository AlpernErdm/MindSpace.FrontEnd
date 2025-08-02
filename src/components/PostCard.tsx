'use client';

import { Post } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { formatDate, calculateReadTime } from '@/lib/utils';
import { Heart, MessageCircle, Bookmark, Share2, Eye, Tag as TagIcon, Edit3, Trash2, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { likesService } from '@/services/likes';
import { postsService } from '@/services/posts';
import { useState } from 'react';
import Button from '@/components/ui/Button';

interface PostCardProps {
  post: Post;
  variant?: 'default' | 'featured' | 'compact';
  showActions?: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
}

export const PostCard = ({ post, variant = 'default', showActions = false, onEdit, onDelete }: PostCardProps) => {
  const readTime = calculateReadTime(post.content);
  const { user: currentUser, isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isOwnPost = currentUser?.userName === post.author?.userName;

  const handleLike = async () => {
    if (!isAuthenticated) {
      // TODO: Redirect to login
      return;
    }

    if (isLikeLoading) return;

    try {
      setIsLikeLoading(true);
      const result = await likesService.togglePostLike(post.id);
      setIsLiked(result.isLiked);
      setLikeCount(result.likeCount);
    } catch (error) {
      console.error('Like error:', error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwnPost) return;
    
    if (!confirm('Bu yazıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      setIsDeleting(true);
      await postsService.deletePost(post.id);
      onDelete?.(post.id);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Yazı silinirken bir hata oluştu.');
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const handleEdit = () => {
    if (!isOwnPost) return;
    onEdit?.(post);
    setShowMenu(false);
  };

  if (variant === 'compact') {
    return (
      <Card className="bg-white hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {post.author?.firstName?.[0] || 'A'}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {post.author?.firstName} {post.author?.lastName}
                </span>
                <span className="text-xs text-gray-500">·</span>
                <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
              </div>
              <Link href={`/post/${post.slug}`}>
                <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                  {post.title}
                </h3>
              </Link>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{readTime} dk okuma</span>
                <button 
                  onClick={handleLike}
                  disabled={isLikeLoading}
                  className="flex items-center gap-1 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  <Heart className={`h-3 w-3 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                  <span>{likeCount}</span>
                </button>
                {showActions && isOwnPost && (
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </button>
                    {showMenu && (
                      <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                        <button
                          onClick={handleEdit}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit3 className="h-3 w-3" />
                          Düzenle
                        </button>
                        <button
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600 disabled:opacity-50"
                        >
                          <Trash2 className="h-3 w-3" />
                          {isDeleting ? 'Siliniyor...' : 'Sil'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            {post.featuredImageUrl && (
              <div className="w-16 h-16">
                <img
                  src={post.featuredImageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group">
        <CardContent className="p-0">
          <div className="md:flex">
            <div className="md:w-1/3">
              <div className="relative">
                <img
                  src={post.featuredImageUrl || `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1499750310107-5fef28a66643' : '1486312338219-ce68d2c6f44d'}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`}
                  alt={post.title}
                  className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {post.category && (
                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {post.category.name}
                    </span>
                  )}
                  {post.tags && post.tags.slice(0, 2).map((tag) => (
                    <span key={tag.id} className="bg-gray-800/80 text-white px-2 py-1 rounded-full text-xs">
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="md:w-2/3 p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {post.author?.firstName?.[0] || 'A'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {post.author?.firstName} {post.author?.lastName}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{formatDate(post.createdAt)}</span>
                    <span>·</span>
                    <span>{readTime} dakika okuma</span>
                  </div>
                </div>
              </div>

              <Link href={`/post/${post.slug}`}>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors mb-3 leading-tight">
                  {post.title}
                </h3>
              </Link>

              <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">
                {post.excerpt || post.content.substring(0, 200) + '...'}
              </p>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <TagIcon className="h-4 w-4 text-gray-400" />
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag.id} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs hover:bg-gray-200 transition-colors">
                        #{tag.name}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="text-gray-500 text-xs">+{post.tags.length - 3} daha</span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={handleLike}
                    disabled={isLikeLoading}
                    className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                    <span className="text-sm font-medium">{likeCount}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">{post.commentCount || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
                    <Eye className="h-5 w-5" />
                    <span className="text-sm font-medium">{post.viewCount || 0}</span>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button className="text-gray-400 hover:text-blue-500 transition-colors">
                    <Bookmark className="h-5 w-5" />
                  </button>
                  <button className="text-gray-400 hover:text-blue-500 transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className="bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {post.author?.firstName?.[0] || 'A'}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {post.author?.firstName} {post.author?.lastName}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{formatDate(post.createdAt)}</span>
              <span>·</span>
              <span>{readTime} dk</span>
            </div>
          </div>
        </div>

        <Link href={`/post/${post.slug}`}>
          <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors mb-3 line-clamp-2 group-hover:text-blue-600">
            {post.title}
          </h3>
        </Link>

        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {post.excerpt || post.content.substring(0, 150) + '...'}
        </p>

        {/* Category and Tags */}
        <div className="flex items-center gap-2 mb-4">
          {post.category && (
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              {post.category.name}
            </span>
          )}
          {post.tags && post.tags.slice(0, 2).map((tag) => (
            <span key={tag.id} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
              #{tag.name}
            </span>
          ))}
          {post.tags && post.tags.length > 2 && (
            <span className="text-gray-500 text-xs">+{post.tags.length - 2} daha</span>
          )}
        </div>

        {post.featuredImageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img
              src={post.featuredImageUrl}
              alt={post.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLike}
              disabled={isLikeLoading}
              className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
              <span className="text-sm">{likeCount}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{post.commentCount || 0}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-gray-400 hover:text-blue-500 transition-colors">
              <Bookmark className="h-4 w-4" />
            </button>
            <button className="text-gray-400 hover:text-blue-500 transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
            {showActions && isOwnPost && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                    <button
                      onClick={handleEdit}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Düzenle
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      {isDeleting ? 'Siliniyor...' : 'Sil'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 