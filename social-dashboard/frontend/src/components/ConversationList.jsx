export default function ConversationList({ conversations, activeUsername, onSelect }) {
  return (
    <div className="w-72 shrink-0 border-r border-hair overflow-y-auto scrollbar-thin">
      {conversations.length === 0 && (
        <p className="text-sm text-muted px-4 py-6">No conversations yet.</p>
      )}
      {conversations.map((c) => (
        <button
          key={c.conversationId}
          onClick={() => onSelect(c.otherUser.username)}
          className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-hair hover:bg-surfaceAlt transition-colors ${
            activeUsername === c.otherUser.username ? 'bg-surfaceAlt' : ''
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-surfaceAlt flex items-center justify-center text-xs font-mono shrink-0 overflow-hidden">
            {c.otherUser.avatarUrl ? (
              <img src={c.otherUser.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              c.otherUser.username[0].toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium truncate">{c.otherUser.displayName}</p>
              {c.unreadCount > 0 && (
                <span className="bg-ember text-ink text-[10px] font-mono font-semibold rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                  {c.unreadCount}
                </span>
              )}
            </div>
            <p className="text-xs text-muted truncate">{c.lastMessage}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
