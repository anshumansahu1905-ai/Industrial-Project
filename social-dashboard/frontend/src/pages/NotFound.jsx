import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ink text-center px-4">
      <h1 className="font-display text-5xl mb-3">404</h1>
      <p className="text-muted mb-6">This page doesn't exist.</p>
      <Link to="/" className="text-sage hover:underline text-sm">Back to feed</Link>
    </div>
  );
}
