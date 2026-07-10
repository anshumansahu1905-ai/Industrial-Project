import { NavLink } from 'react-router-dom';
import { Home, MessageCircle, BarChart3, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const links = [
  { to: '/', label: 'Feed', icon: Home, end: true },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 border-r border-hair px-5 py-6 h-screen sticky top-0">
      <div className="flex items-center gap-2 mb-10 px-1">
        <div className="w-8 h-8 rounded-full bg-sage flex items-center justify-center">
          <span className="font-display font-semibold text-ink text-sm">P</span>
        </div>
        <span className="font-display text-lg tracking-tight">PulseGrid</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-surfaceAlt text-paper' : 'text-muted hover:text-paper hover:bg-surface'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
        {user && (
          <NavLink
            to={`/profile/${user.username}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-surfaceAlt text-paper' : 'text-muted hover:text-paper hover:bg-surface'
              }`
            }
          >
            <User size={18} strokeWidth={1.75} />
            Profile
          </NavLink>
        )}
      </nav>

      {user && (
        <div className="border-t border-hair pt-4 mt-4">
          <div className="flex items-center gap-3 px-1 mb-3">
            <div className="w-8 h-8 rounded-full bg-surfaceAlt overflow-hidden flex items-center justify-center text-xs font-mono">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                user.username[0].toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm truncate">{user.displayName}</p>
              <p className="text-xs text-muted truncate">@{user.username}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs text-muted hover:text-rose transition-colors px-1"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      )}
    </aside>
  );
}
