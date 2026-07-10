import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications.js';
import NotificationDrawer from '../NotificationDrawer.jsx';

export default function TopBar({ title }) {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAllRead } = useNotifications();

  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-ink/80 border-b border-hair px-6 py-4 flex items-center justify-between">
      <h1 className="font-display text-2xl">{title}</h1>
      <div className="relative">
        <button
          onClick={() => {
            setOpen((o) => !o);
            if (!open && unreadCount > 0) markAllRead();
          }}
          className="relative w-9 h-9 rounded-full bg-surface hover:bg-surfaceAlt flex items-center justify-center transition-colors"
          aria-label="Notifications"
        >
          <Bell size={17} strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-ember text-ink text-[10px] font-mono font-semibold rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        {open && <NotificationDrawer notifications={notifications} onClose={() => setOpen(false)} />}
      </div>
    </header>
  );
}
