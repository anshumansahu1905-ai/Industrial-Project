import { useEffect, useState, useCallback } from 'react';
import client from '../api/client';
import { useSocket } from '../context/SocketContext.jsx';

export function useNotifications() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    const res = await client.get('/notifications');
    setNotifications(res.data.notifications);
    setUnreadCount(res.data.notifications.filter((n) => !n.readAt).length);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!socket) return undefined;
    const handler = (payload) => {
      setNotifications((prev) => [payload, ...prev].slice(0, 50));
      setUnreadCount((prev) => prev + 1);
    };
    socket.on('notification:new', handler);
    return () => socket.off('notification:new', handler);
  }, [socket]);

  const markAllRead = useCallback(async () => {
    await client.post('/notifications/read-all');
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
  }, []);

  return { notifications, unreadCount, markAllRead, refresh };
}
