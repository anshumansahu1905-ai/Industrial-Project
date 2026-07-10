import { useEffect, useState } from 'react';
import client from '../api/client';
import AppShell from '../components/layout/AppShell.jsx';
import ComposeBox from '../components/ComposeBox.jsx';
import PostCard from '../components/PostCard.jsx';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/posts').then((res) => {
      setPosts(res.data.posts);
      setLoading(false);
    });
  }, []);

  function handlePosted(post) {
    setPosts((prev) => [{ ...post, likeCount: 0, likedByMe: false, commentCount: 0 }, ...prev]);
  }

  function handleDeleted(id) {
    setPosts((prev) => prev.filter((p) => p._id !== id));
  }

  return (
    <AppShell title="Feed">
      <ComposeBox onPosted={handlePosted} />
      {loading && <p className="text-sm text-muted">Loading feed…</p>}
      {!loading && posts.length === 0 && (
        <p className="text-sm text-muted">
          Nothing here yet. Follow people or share your first post to get things moving.
        </p>
      )}
      {posts.map((post) => (
        <PostCard key={post._id} post={post} onDeleted={handleDeleted} />
      ))}
    </AppShell>
  );
}
