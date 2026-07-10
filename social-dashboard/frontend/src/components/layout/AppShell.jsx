import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';

export default function AppShell({ title, children }) {
  return (
    <div className="flex min-h-screen bg-ink">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <TopBar title={title} />
        <main className="max-w-3xl mx-auto px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
