'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, MessageCircle, Heart, Users, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsService, Notification } from '@/services/notifications';
import { useSignalR } from '@/hooks/useSignalR';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export const NotificationDropdown = () => {
  const { isAuthenticated } = useAuth();
  const { isConnected, notifications: realTimeNotifications } = useSignalR();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Bildirimleri yükle
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [isAuthenticated, isOpen]);

  // Real-time bildirimleri birleştir
  useEffect(() => {
    if (realTimeNotifications.length > 0) {
      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const newNotifications = realTimeNotifications.filter(n => !existingIds.has(n.id));
        return [...newNotifications, ...prev];
      });
      setUnreadCount(prev => prev + realTimeNotifications.filter(n => !n.isRead).length);
    }
  }, [realTimeNotifications]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsService.getNotifications(1, 20);
      setNotifications(response.notifications);
    } catch (error) {
      console.error('Bildirimler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await notificationsService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Okunmamış bildirim sayısı yüklenirken hata:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Bildirim okundu işaretleme hatası:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Tüm bildirimleri okundu işaretleme hatası:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationsService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      // Eğer silinen bildirim okunmamışsa sayıyı azalt
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Bildirim silme hatası:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NewComment':
      case 'CommentReply':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'NewLike':
      case 'PostLiked':
      case 'CommentLike':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'NewFollower':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'PostPublished':
        return <Eye className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Az önce';
    if (diffInMinutes < 60) return `${diffInMinutes} dk önce`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} saat önce`;
    return `${Math.floor(diffInMinutes / 1440)} gün önce`;
  };

  const cleanNotificationUrl = (url: string) => {
    // URL'deki hash'i temizle (örn: /post/slug#comment-id -> /post/slug)
    let cleanUrl = url.split('#')[0];
    
    // /posts/ formatını /post/ formatına çevir
    if (cleanUrl.startsWith('/posts/')) {
      cleanUrl = cleanUrl.replace('/posts/', '/post/');
    }
    
    return cleanUrl;
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-gray-600 hover:text-blue-600 transition-colors p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 max-h-96 overflow-y-auto">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Bildirimler</h3>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Tümünü okundu işaretle
              </Button>
            )}
          </div>

          {loading ? (
            <div className="px-4 py-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Bildirimler yükleniyor...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Henüz bildiriminiz yok</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Okundu işaretle"
                            >
                              <Check className="h-3 w-3 text-gray-400" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="h-3 w-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                      {notification.actionUrl && (
                        <Link
                          href={cleanNotificationUrl(notification.actionUrl)}
                          className="block mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                          onClick={() => setIsOpen(false)}
                        >
                          Görüntüle →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-gray-600 hover:text-gray-800"
                onClick={() => {
                  setIsOpen(false);
                  // TODO: Tüm bildirimler sayfasına yönlendir
                }}
              >
                Tüm Bildirimleri Gör
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 