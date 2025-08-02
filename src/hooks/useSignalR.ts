import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { HubConnection } from '@microsoft/signalr';

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: string;
}

export const useSignalR = () => {
  const { isAuthenticated, user } = useAuth();
  const connectionRef = useRef<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const connectToSignalR = async () => {
      try {
        // SignalR bağlantısı için gerekli import'ları dinamik olarak yükle
        const { HubConnectionBuilder, LogLevel } = await import('@microsoft/signalr');
        
        // JWT token'ı al
        const token = localStorage.getItem('token');
        if (!token) return;

        // Hub bağlantısını oluştur
        const connection = new HubConnectionBuilder()
          .withUrl('https://localhost:7237/notificationHub', {
            accessTokenFactory: () => token
          })
          .configureLogging(LogLevel.Information)
          .withAutomaticReconnect()
          .build();

        // Bağlantı event'lerini dinle
        connection.on('NewNotification', (notification) => {
          console.log('Yeni bildirim alındı:', notification);
          setNotifications(prev => [notification, ...prev]);
        });

        connection.on('NotificationRead', (notificationId) => {
          console.log('Bildirim okundu:', notificationId);
          setNotifications(prev => 
            prev.map(n => 
              n.id === notificationId ? { ...n, isRead: true } : n
            )
          );
        });

        connection.on('AllNotificationsRead', () => {
          console.log('Tüm bildirimler okundu');
          setNotifications(prev => 
            prev.map(n => ({ ...n, isRead: true }))
          );
        });

        // Bağlantıyı başlat
        await connection.start();
        setIsConnected(true);
        connectionRef.current = connection;

        console.log('SignalR bağlantısı başarılı');
      } catch (error) {
        console.error('SignalR bağlantı hatası:', error);
      }
    };

    connectToSignalR();

    // Cleanup
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        setIsConnected(false);
      }
    };
  }, [isAuthenticated, user]);

  const markAsRead = async (notificationId: string) => {
    if (connectionRef.current && isConnected) {
      try {
        await connectionRef.current.invoke('MarkNotificationAsRead', notificationId);
      } catch (error) {
        console.error('Bildirim okundu işaretleme hatası:', error);
      }
    }
  };

  return {
    isConnected,
    notifications,
    markAsRead
  };
}; 