import { useEffect, useState } from 'react';
import client from '../api/client';

export default function CommentThread({ postId, onCommentAdded }) {
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get(`/posts/${postId}/comments`).then((res) => {
      setComments(res.data.comments);
      setLoading(false);
    });
  }, [postId]);

  async function submit(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    const res = await client.post(`/posts/${postId}/comments`, { body: draft });
    setComments((prev) => [...prev, res.data.comment]);
    setDraft('');
    onCommentAdded?.();
  }

  return (
    <div className="border-t border-hair px-5 py-4 bg-surfaceAlt/40">
      {loading && <p className="text-xs text-muted">Loading comments…</p>}
      <div className="flex flex-col gap-2.5 mb-3">
        {comments.map((c) => (
          <div key={c._id} className="text-sm">
            <span className="font-medium">{c.author.displayName}</span>{' '}
            <span className="text-paper/90">{c.body}</span>
          </div>
        ))}
        {!loading && comments.length === 0 && (
          <p className="text-xs text-muted">No comments yet — say something.</p>
        )}
      </div>
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a comment"
          className="flex-1 bg-surface border border-hair rounded-lg px-3 py-2 text-sm outline-none focus:border-sage"
        />
        <button
          type="submit"
          className="px-3 py-2 rounded-lg bg-sage text-ink text-sm font-medium hover:bg-sageDeep transition-colors"
        >
          Post
        </button>
      </form>
    </div>
  );
}
