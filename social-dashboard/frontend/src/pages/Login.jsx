import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
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
          <h1 className="font-display text-2xl mb-1">Welcome back</h1>
          <p className="text-sm text-muted mb-6">Sign in to see what's moving.</p>
          <form onSubmit={submit} className="flex flex-col gap-3.5">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-surfaceAlt border border-hair rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-sage"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-surfaceAlt border border-hair rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-sage"
            />
            {error && <p className="text-xs text-rose">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-sage text-ink rounded-lg py-2.5 text-sm font-medium hover:bg-sageDeep transition-colors disabled:opacity-50 mt-1"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-muted mt-5">
          New here?{' '}
          <Link to="/register" className="text-sage hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
