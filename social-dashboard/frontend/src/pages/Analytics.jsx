import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import client from '../api/client';
import AppShell from '../components/layout/AppShell.jsx';
import PulseGraph from '../components/PulseGraph.jsx';

function StatCard({ label, value }) {
  return (
    <div className="border border-hair rounded-xl bg-surface p-4">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="font-display text-2xl">{value}</p>
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    client.get('/analytics/overview').then((res) => setData(res.data));
  }, []);

  if (!data) {
    return (
      <AppShell title="Analytics">
        <p className="text-sm text-muted">Crunching your numbers…</p>
      </AppShell>
    );
  }

  const { summary, timeline, topPosts } = data;
  const chartData = timeline.slice(-14).map((d) => ({
    day: d.date.slice(5),
    engagement: d.likes + d.comments,
  }));

  return (
    <AppShell title="Analytics">
      <div className="border border-hair rounded-2xl bg-surface p-5 mb-6">
        <p className="text-xs text-muted font-mono mb-2 uppercase tracking-wide">Engagement pulse · last 30 days</p>
        <PulseGraph timeline={timeline} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <StatCard label="Posts" value={summary.postCount} />
        <StatCard label="Total likes" value={summary.totalLikes} />
        <StatCard label="Total comments" value={summary.totalComments} />
        <StatCard label="Followers" value={summary.followerCount} />
        <StatCard label="Following" value={summary.followingCount} />
        <StatCard label="Avg engagement / post" value={summary.avgEngagement} />
      </div>

      <div className="border border-hair rounded-2xl bg-surface p-5 mb-6">
        <p className="text-sm font-medium mb-4">Engagement, last 14 days</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <XAxis dataKey="day" stroke="#8B90A0" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#1B1F29', border: '1px solid rgba(231,228,218,0.08)', borderRadius: 8 }}
              labelStyle={{ color: '#ECE7DD' }}
            />
            <Bar dataKey="engagement" fill="#4F8C7A" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="border border-hair rounded-2xl bg-surface p-5">
        <p className="text-sm font-medium mb-4">Top posts</p>
        {topPosts.length === 0 && <p className="text-sm text-muted">Post something to see it ranked here.</p>}
        <div className="flex flex-col divide-y divide-hair">
          {topPosts.map((p) => (
            <div key={p.id} className="py-3 flex items-center justify-between gap-4">
              <p className="text-sm truncate flex-1">{p.caption || '(media post)'}</p>
              <span className="text-xs font-mono text-muted shrink-0">
                {p.likeCount}♥ · {p.commentCount}💬
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
