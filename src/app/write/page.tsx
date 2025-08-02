'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { postsService } from '@/services/posts'
import { CreatePostRequest, UpdatePostRequest, Post, PostStatus } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Save, Eye, Globe, ArrowLeft, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { uploadService } from '@/services/upload'



const WritePage: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    featuredImageUrl: '',
    status: 0 as PostStatus, // Draft as default
    tags: [] as string[],
    metaDescription: '',
    metaKeywords: ''
  })
  

  const [tagInput, setTagInput] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isEditing, setIsEditing] = useState(false)
  const [editPostId, setEditPostId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)



  // Check if editing existing post
  useEffect(() => {
    const editId = searchParams.get('edit')
    if (editId) {
      setIsEditing(true)
      setEditPostId(editId)
      loadPost(editId)
    }
  }, [searchParams])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const loadPost = async (postId: string) => {
    try {
      setIsLoading(true)
      const post = await postsService.getPostById(postId)
      
      // Check if user is the author
      if (post.authorId !== user?.id) {
        router.push('/')
        return
      }
      
              setFormData({
          title: post.title,
          content: post.content,
          excerpt: post.excerpt || '',
          featuredImageUrl: post.featuredImageUrl || '',
          status: post.status,
          tags: post.tags?.map(tag => tag.name) || [],
          metaDescription: post.metaDescription || '',
          metaKeywords: post.metaKeywords || ''
        })
    } catch (error) {
      console.error('Error loading post:', error)
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
  }

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true)
      setErrors(prev => ({ ...prev, featuredImageUrl: '' }))
      
      const response = await uploadService.uploadImage(file)
      
      if (response.success) {
        setFormData(prev => ({ ...prev, featuredImageUrl: response.fileUrl }))
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      setErrors(prev => ({ 
        ...prev, 
        featuredImageUrl: error.response?.data?.message || 'Dosya yüklenirken hata oluştu' 
      }))
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Başlık gerekli'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'İçerik gerekli'
    }

    // Category is optional, so we don't validate it

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveDraft = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      if (isEditing && editPostId) {
        const updateData: UpdatePostRequest = formData
        await postsService.updatePost(editPostId, updateData)
      } else {
        const createData: CreatePostRequest = {
          ...formData,
          status: formData.status
        }
        console.log('Sending data to backend:', JSON.stringify(createData, null, 2))
        console.log('Status type:', typeof createData.status)
        const newPost = await postsService.createPost(createData)
        setIsEditing(true)
        setEditPostId(newPost.id)
        
        // Update URL without page reload
        window.history.replaceState({}, '', `/write?edit=${newPost.id}`)
      }
      
      // TODO: Show success toast
         } catch (error: any) {
       console.error('Error saving draft:', error)
       console.error('Error response:', error.response?.data)
       setErrors({ general: 'Taslak kaydedilirken bir hata oluştu' })
     } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!validateForm()) return

    setIsPublishing(true)
    try {
      let postId = editPostId

      // First save as draft if it's a new post
      if (!isEditing) {
        const createData: CreatePostRequest = {
          ...formData,
          status: formData.status
        }
        console.log('Sending data to backend (publish):', JSON.stringify(createData, null, 2))
        console.log('Status type (publish):', typeof createData.status)
        const newPost = await postsService.createPost(createData)
        postId = newPost.id
      } else if (editPostId) {
        const updateData: UpdatePostRequest = formData
        await postsService.updatePost(editPostId, updateData)
      }

      // Then publish
      if (postId) {
        await postsService.publishPost(postId)
        router.push('/')
      }
         } catch (error: any) {
       console.error('Error publishing post:', error)
       console.error('Error response:', error.response?.data)
       setErrors({ general: 'Yazı yayınlanırken bir hata oluştu' })
     } finally {
      setIsPublishing(false)
    }
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="h-12 bg-gray-200 rounded w-full mb-6"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geri</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Yazıyı Düzenle' : 'Yeni Yazı'}
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-1"
          >
            <Eye className="w-4 h-4" />
            <span>{showPreview ? 'Düzenle' : 'Önizle'}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            isLoading={isSaving}
            className="flex items-center space-x-1"
          >
            <Save className="w-4 h-4" />
            <span>Taslak Kaydet</span>
          </Button>
          
          <Button
            size="sm"
            onClick={handlePublish}
            isLoading={isPublishing}
            className="flex items-center space-x-1"
          >
            <Globe className="w-4 h-4" />
            <span>Yayınla</span>
          </Button>
        </div>
      </div>

      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {errors.general}
        </div>
      )}

      {showPreview ? (
        // Preview Mode
        <Card>
          <CardContent className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {formData.title || 'Başlık'}
            </h1>
            
            {formData.excerpt && (
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {formData.excerpt}
              </p>
            )}
            
            {formData.featuredImageUrl && (
              <div className="mb-8">
                <img
                  src={formData.featuredImageUrl}
                  alt="Featured"
                  className="w-full h-64 object-cover rounded-xl"
                />
              </div>
            )}
            

            
            {/* Tags in Preview */}
            {formData.tags.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: formData.content }} />
            </div>
          </CardContent>
        </Card>
      ) : (
        // Edit Mode
        <div className="space-y-6">
          {/* Title */}
          <div>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Yazınızın başlığını girin..."
              className="w-full text-3xl font-bold border-none outline-none placeholder-gray-400 bg-transparent resize-none"
              style={{ lineHeight: '1.2' }}
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              placeholder="Yazınızın kısa bir özetini girin (isteğe bağlı)..."
              rows={2}
              className="w-full text-lg text-gray-600 border-none outline-none placeholder-gray-400 bg-transparent resize-none"
            />
          </div>



          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Öne Çıkan Görsel
            </label>
            
            {/* File Upload */}
            <div className="mb-4">
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? 'Yükleniyor...' : 'Resim Yükle'}</span>
                  </div>
                </label>
                
                <span className="text-sm text-gray-500">veya</span>
                
                <Input
                  name="featuredImageUrl"
                  type="url"
                  value={formData.featuredImageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
              </div>
              
              {errors.featuredImageUrl && (
                <p className="mt-2 text-sm text-red-600">{errors.featuredImageUrl}</p>
              )}
            </div>
            
            {/* Image Preview */}
            {formData.featuredImageUrl && (
              <div className="relative">
                <img
                  src={formData.featuredImageUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                  onError={() => setFormData(prev => ({ ...prev, featuredImageUrl: '' }))}
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, featuredImageUrl: '' }))}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiketler (İsteğe bağlı)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Etiket ekleyin..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                Ekle
              </Button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Enter tuşuna basarak veya Ekle butonuna tıklayarak etiket ekleyebilirsiniz
            </p>
          </div>

          {/* Content */}
          <div>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Hikayenizi anlatın..."
              rows={20}
              className="w-full text-lg leading-relaxed border-none outline-none placeholder-gray-400 bg-transparent resize-none"
            />
            {errors.content && (
              <p className="mt-2 text-sm text-red-600">{errors.content}</p>
            )}
          </div>

          {/* SEO Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">SEO Ayarları (İsteğe bağlı)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Meta Açıklama"
                name="metaDescription"
                value={formData.metaDescription}
                onChange={handleInputChange}
                placeholder="Arama motorları için kısa açıklama"
                helperText="160 karakter veya daha az olmalı"
              />
              
              <Input
                label="Anahtar Kelimeler"
                name="metaKeywords"
                value={formData.metaKeywords}
                onChange={handleInputChange}
                placeholder="anahtar, kelime, virgül, ile, ayrılmış"
                helperText="Virgül ile ayrılmış anahtar kelimeler"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Auto-save indicator - TODO: Implement */}
      <div className="fixed bottom-4 right-4">
        <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm opacity-0 transition-opacity">
          Kaydedildi
        </div>
      </div>
    </div>
  )
}

export default WritePage 