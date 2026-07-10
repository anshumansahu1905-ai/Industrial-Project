import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', displayName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 rounded-full bg-sage flex items-center justify-center">
            <span className="font-display font-semibold text-ink text-sm">P</span>
          </div>
          <span className="font-display text-xl tracking-tight">PulseGrid</span>
        </div>
        <div className="border border-hair rounded-2xl bg-surface p-7">
          <h1 className="font-display text-2xl mb-1">Create an account</h1>
          <p className="text-sm text-muted mb-6">Start tracking your engagement pulse.</p>
          <form onSubmit={submit} className="flex flex-col gap-3.5">
            <input
              required
              placeholder="Username"
              value={form.username}
              onChange={(e) => update('username', e.target.value)}
              className="bg-surfaceAlt border border-hair rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-sage"
            />
            <input
              placeholder="Display name (optional)"
              value={form.displayName}
              onChange={(e) => update('displayName', e.target.value)}
              className="bg-surfaceAlt border border-hair rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-sage"
            />
            <input
              type="email"
              required
              placeholder="Email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="bg-surfaceAlt border border-hair rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-sage"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              className="bg-surfaceAlt border border-hair rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-sage"
            />
            {error && <p className="text-xs text-rose">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-sage text-ink rounded-lg py-2.5 text-sm font-medium hover:bg-sageDeep transition-colors disabled:opacity-50 mt-1"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-muted mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-sage hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
