'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { bookmarksService } from '@/services/bookmarks'
import { Post } from '@/types'
import { formatDate } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { Bookmark, ArrowLeft, Eye, Heart, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const BookmarksPage = () => {
  const { isAuthenticated, user } = useAuth()
  const [bookmarks, setBookmarks] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadBookmarks()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const loadBookmarks = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await bookmarksService.getBookmarks()
      setBookmarks(response.bookmarks)
    } catch (error) {
      console.error('Bookmarks yüklenirken hata:', error)
      setError('Kaydedilen yazılar yüklenirken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Giriş Yapın</h2>
          <p className="text-gray-600 mb-6">
            Kaydedilen yazılarınızı görmek için giriş yapmanız gerekiyor.
          </p>
          <Link href="/login">
            <Button>Giriş Yap</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Geri</span>
        </Link>
        
        <div className="flex items-center space-x-3 mb-6">
          <Bookmark className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900">Kaydedilen Yazılar</h1>
        </div>
        
        <p className="text-gray-600">
          Daha sonra okumak için kaydettiğiniz yazılar burada görünecek.
        </p>
      </div>

      {/* Content */}
      {error ? (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">{error}</div>
          <Button onClick={loadBookmarks}>Tekrar Dene</Button>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Henüz kaydedilen yazınız yok
          </h2>
          <p className="text-gray-600 mb-6">
            Beğendiğiniz yazıları kaydetmek için yazı detay sayfasındaki bookmark butonunu kullanın.
          </p>
          <Link href="/">
            <Button>Yazıları Keşfet</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookmarks.map((post) => (
            <article key={post.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                {post.featuredImageUrl && (
                  <div className="flex-shrink-0">
                    <Image
                      src={post.featuredImageUrl}
                      alt={post.title}
                      width={120}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    {post.category && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800">
                        {post.category.name}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {formatDate(post.publishedAt || post.createdAt)}
                    </span>
                  </div>
                  
                  <Link href={`/post/${post.slug}`}>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-emerald-600 transition-colors">
                      {post.title}
                    </h2>
                  </Link>
                  
                  {post.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.viewCount}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{post.likeCount}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.commentCount}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {post.readTimeMinutes} dk okuma
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default BookmarksPage 