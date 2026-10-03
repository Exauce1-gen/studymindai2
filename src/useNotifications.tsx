import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';

export interface AppNotification {
  id: string;
  type: 'badge' | 'maintenance' | 'update' | 'info';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

const TYPE_ICONS: Record<AppNotification['type'], string> = {
  badge: '🏆',
  maintenance: '🔧',
  update: '🚀',
  info: 'ℹ️',
};

export function notificationIcon(type: AppNotification['type']): string {
  return TYPE_ICONS[type] || 'ℹ️';
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Notifications qui me sont destinées + notifications globales (user_id null)
      const { data: notifs, error: notifsError } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(30);

      if (notifsError) throw notifsError;

      // Lectures de l'utilisateur, pour savoir ce qui est déjà lu
      const { data: reads, error: readsError } = await supabase
        .from('notification_reads')
        .select('notification_id')
        .eq('user_id', user.id);

      if (readsError) throw readsError;

      const readIds = new Set((reads || []).map((r: any) => r.notification_id));

      setNotifications(
        (notifs || []).map((n: any) => ({ ...n, read: readIds.has(n.id) }))
      );
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );

    try {
      await supabase
        .from('notification_reads')
        .insert({ notification_id: notificationId, user_id: user.id });
    } catch (err) {
      // Doublon (déjà lu) ou autre erreur mineure : sans conséquence pour l'UI
      console.error('Erreur marquage lu:', err);
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0 || !user) return;

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    try {
      await supabase
        .from('notification_reads')
        .insert(unread.map(n => ({ notification_id: n.id, user_id: user.id })));
    } catch (err) {
      console.error('Erreur marquage tout lu:', err);
    }
  }, [notifications, user]);

  useEffect(() => {
    load();
  }, [load]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, reload: load };
}
