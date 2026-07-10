import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import AppShell from '../components/layout/AppShell.jsx';
import PostCard from '../components/PostCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    client.get(`/users/${username}`).then((res) => {
      setProfile(res.data.user);
      setPosts(res.data.posts);
      setIsFollowing(res.data.isFollowing);
    });
  }, [username]);

  async function toggleFollow() {
    const res = await client.post(`/users/${username}/follow`);
    setIsFollowing(res.data.isFollowing);
    setProfile((p) => ({ ...p, followerCount: res.data.followerCount }));
  }

  if (!profile) return <AppShell title="Profile"><p className="text-sm text-muted">Loading…</p></AppShell>;

  const isMe = me?.username === username;

  return (
    <AppShell title={profile.displayName}>
      <div className="border border-hair rounded-2xl bg-surface p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-surfaceAlt flex items-center justify-center text-xl font-mono overflow-hidden">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                profile.username[0].toUpperCase()
              )}
            </div>
            <div>
              <h2 className="font-display text-xl">{profile.displayName}</h2>
              <p className="text-sm text-muted font-mono">@{profile.username}</p>
            </div>
          </div>
          {!isMe && (
            <button
              onClick={toggleFollow}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isFollowing ? 'border border-hair text-muted hover:text-rose' : 'bg-sage text-ink hover:bg-sageDeep'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
        {profile.bio && <p className="text-sm mt-4 leading-relaxed">{profile.bio}</p>}
        <div className="flex gap-5 mt-4 text-sm">
          <span><span className="font-mono font-medium">{profile.followerCount}</span> <span className="text-muted">followers</span></span>
          <span><span className="font-mono font-medium">{profile.followingCount}</span> <span className="text-muted">following</span></span>
        </div>
      </div>

      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={{ ...post, likeCount: post.likes.length, likedByMe: me ? post.likes.includes(me.id) : false }}
          onDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
        />
      ))}
      {posts.length === 0 && <p className="text-sm text-muted">No posts yet.</p>}
    </AppShell>
  );
}
