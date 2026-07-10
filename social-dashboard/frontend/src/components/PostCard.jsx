import { useState } from 'react';
import { Heart, MessageSquare, Trash2 } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import CommentThread from './CommentThread.jsx';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function PostCard({ post, onDeleted }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount);

  async function handleLike() {
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    try {
      const res = await client.post(`/posts/${post._id}/like`);
      setLiked(res.data.likedByMe);
      setLikeCount(res.data.likeCount);
    } catch {
      setLiked((v) => !v);
      setLikeCount((c) => (liked ? c + 1 : c - 1));
    }
  }

  async function handleDelete() {
    await client.delete(`/posts/${post._id}`);
    onDeleted?.(post._id);
  }

  return (
    <article className="border border-hair rounded-2xl bg-surface overflow-hidden mb-5">
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-surfaceAlt flex items-center justify-center text-xs font-mono overflow-hidden">
            {post.author.avatarUrl ? (
              <img src={post.author.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              post.author.username[0].toUpperCase()
            )}
          </div>
          <div>
            <p className="text-sm font-medium leading-tight">{post.author.displayName}</p>
            <p className="text-xs text-muted font-mono">@{post.author.username} · {timeAgo(post.createdAt)}</p>
          </div>
        </div>
        {user?.id === post.author._id && (
          <button onClick={handleDelete} className="text-muted hover:text-rose transition-colors">
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {post.caption && <p className="px-5 pt-3 text-[15px] leading-relaxed">{post.caption}</p>}

      {post.mediaUrl && post.mediaType === 'image' && (
        <img src={post.mediaUrl} alt="" className="w-full max-h-[520px] object-cover mt-3" />
      )}
      {post.mediaUrl && post.mediaType === 'video' && (
        <video src={post.mediaUrl} controls className="w-full max-h-[520px] mt-3" />
      )}

      <div className="flex items-center gap-5 px-5 py-3.5 text-sm">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-rose' : 'text-muted hover:text-rose'}`}
        >
          <Heart size={17} strokeWidth={1.75} fill={liked ? 'currentColor' : 'none'} />
          <span className="font-mono text-xs">{likeCount}</span>
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-muted hover:text-sage transition-colors"
        >
          <MessageSquare size={17} strokeWidth={1.75} />
          <span className="font-mono text-xs">{commentCount}</span>
        </button>
      </div>

      {showComments && (
        <CommentThread postId={post._id} onCommentAdded={() => setCommentCount((c) => c + 1)} />
      )}
    </article>
  );
}
