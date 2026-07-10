import { Heart, MessageSquare, UserPlus } from 'lucide-react';

const icons = {
  like: { Icon: Heart, color: 'text-rose' },
  comment: { Icon: MessageSquare, color: 'text-sage' },
  follow: { Icon: UserPlus, color: 'text-ember' },
};

const verbs = {
  like: 'liked your post',
  comment: 'commented on your post',
  follow: 'started following you',
};

export default function NotificationDrawer({ notifications, onClose }) {
  return (
    <div className="absolute right-0 mt-2 w-80 bg-surface border border-hair rounded-xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-hair">
        <span className="text-sm font-medium">Notifications</span>
        <button onClick={onClose} className="text-xs text-muted hover:text-paper">
          Close
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto scrollbar-thin">
        {notifications.length === 0 && (
          <p className="text-sm text-muted px-4 py-6 text-center">Nothing yet — your activity will show up here.</p>
        )}
        {notifications.map((n) => {
          const cfg = icons[n.type] || icons.like;
          const { Icon, color } = cfg;
          return (
            <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-surfaceAlt transition-colors">
              <Icon size={16} className={`${color} mt-0.5 shrink-0`} strokeWidth={1.75} />
              <p className="text-sm leading-snug">
                <span className="font-medium">{n.actor.displayName}</span>{' '}
                <span className="text-muted">{verbs[n.type]}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
