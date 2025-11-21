import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, CheckCircle, Clock } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  sent_at: string;
  status: string;
}

interface NotificationHistoryProps {
  classId: string;
}

export default function NotificationHistory({ classId }: NotificationHistoryProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [classId]);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('class_id', classId)
        .order('sent_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error('Bildirimler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">Henüz bildirim gönderilmemiş</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-800 mb-4">Bildirim Geçmişi</h4>
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${
                  notification.status === 'sent'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-yellow-100 text-yellow-600'
                }`}
              >
                {notification.status === 'sent' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-gray-800 font-medium mb-2">{notification.message}</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      notification.status === 'sent'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {notification.status === 'sent' ? 'Gönderildi' : 'Bekliyor'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(notification.sent_at).toLocaleString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
