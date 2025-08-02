'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Post } from '@/types'
import { postsService } from '@/services/posts'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import { ArrowLeft, Eye, Heart, MessageCircle, Clock, Share2, Bookmark, MoreVertical } from 'lucide-react'

const PostDetailPage: React.FC = () => {
  const params = useParams()
  const { user, isAuthenticated } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const slug = params.slug as string

  useEffect(() => {
    const loadPost = async () => {
      try {
        setIsLoading(true)
        const postData = await postsService.getPostBySlug(slug)
        setPost(postData)
      } catch (error) {
        console.error('Error loading post:', error)
        setError('Yazı yüklenirken bir hata oluştu')
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      loadPost()
    }
  }, [slug])

  const handleLike = async () => {
    if (!isAuthenticated) {
      // Redirect to login
      return
    }
    setIsLiked(!isLiked)
    // TODO: API call to like/unlike post
  }

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      // Redirect to login
      return
    }
    setIsBookmarked(!isBookmarked)
    // TODO: API call to bookmark/unbookmark post
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      // TODO: Show toast notification
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-full mb-4"></div>
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/6"></div>
            </div>
          </div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Yazı Bulunamadı</h2>
          <p className="text-gray-600 mb-6">{error || 'Aradığınız yazı bulunamadı.'}</p>
          <Link href="/">
            <Button>Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isAuthor = user?.id === post.author.id

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link 
        href="/" 
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Geri</span>
      </Link>

      {/* Article Header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="text-xl text-gray-600 mb-6 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Author Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link 
              href={`/profile/${post.author.userName}`}
              className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
            >
              {post.author.profileImageUrl ? (
                <Image
                  src={post.author.profileImageUrl}
                  alt={post.author.userName}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-medium">
                  {post.author.firstName?.[0] || post.author.userName[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {post.author.firstName && post.author.lastName 
                    ? `${post.author.firstName} ${post.author.lastName}`
                    : post.author.userName
                  }
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                  <span>•</span>
                  <span>{post.readTimeMinutes} dk okuma</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {isAuthor && (
              <Link href={`/post/${post.slug}/edit`}>
                <Button variant="outline" size="sm">Düzenle</Button>
              </Link>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="flex items-center space-x-1"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={`flex items-center space-x-1 ${isBookmarked ? 'text-emerald-600' : ''}`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Post Stats */}
        <div className="flex items-center space-x-6 text-sm text-gray-500 pb-6 border-b border-gray-200">
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>{post.viewCount} görüntülenme</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="w-4 h-4" />
            <span>{post.likeCount} beğeni</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-4 h-4" />
            <span>{post.commentCount} yorum</span>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {post.featuredImageUrl && (
        <div className="mb-8">
          <Image
            src={post.featuredImageUrl}
            alt={post.title}
            width={800}
            height={400}
            className="w-full h-64 md:h-96 object-cover rounded-xl"
          />
        </div>
      )}

      {/* Article Content */}
      <article className="prose prose-lg prose-gray max-w-none mb-12">
        <div
          dangerouslySetInnerHTML={{ __html: post.content }}
          className="leading-relaxed"
        />
      </article>

      {/* Category and Tags */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {post.category && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-800">
              {post.category.name}
            </span>
          )}
          {post.tags && post.tags.map((tag) => (
            <span key={tag.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
              #{tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* Engagement Actions */}
      <div className="flex items-center justify-between py-6 border-t border-b border-gray-200 mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant={isLiked ? "primary" : "outline"}
            size="sm"
            onClick={handleLike}
            className="flex items-center space-x-2"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>{post.likeCount} {isLiked ? 'Beğendin' : 'Beğen'}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Yorum Yap</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-1"
          >
            <Share2 className="w-4 h-4" />
            <span>Paylaş</span>
          </Button>
        </div>
      </div>

      {/* Author Card */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <div className="flex items-start space-x-4">
          <Link href={`/profile/${post.author.userName}`}>
            {post.author.profileImageUrl ? (
              <Image
                src={post.author.profileImageUrl}
                alt={post.author.userName}
                width={64}
                height={64}
                className="rounded-full"
              />
            ) : (
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xl font-medium">
                {post.author.firstName?.[0] || post.author.userName[0]?.toUpperCase()}
              </div>
            )}
          </Link>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {post.author.firstName && post.author.lastName 
                ? `${post.author.firstName} ${post.author.lastName}`
                : post.author.userName
              }
            </h3>
            {post.author.bio && (
              <p className="text-gray-600 mb-3">{post.author.bio}</p>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{post.author.followerCount} takipçi</span>
              <span>{post.author.followingCount} takip edilen</span>
            </div>
            <div className="mt-3">
              <Button size="sm">Takip Et</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Posts - TODO: Implement */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">İlgili Yazılar</h2>
        <div className="text-center py-8 text-gray-500">
          İlgili yazılar yakında eklenecek...
        </div>
      </div>
    </div>
  )
}

export default PostDetailPage 