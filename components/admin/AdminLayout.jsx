'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, FileText, BookOpen, Users, 
  ExternalLink, LogOut, Menu, X, PlusCircle, Sparkles, Image as ImageIcon, Settings
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        } else {
          router.push('/admin/login');
        }
      } catch (err) {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      router.push('/admin/login');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Pages Manager', href: '/admin/pages', icon: FileText },
    { label: 'Path Pages', href: '/admin/pages?type=path', icon: BookOpen },
    { label: 'Volunteers', href: '/admin/volunteers', icon: Users },
    { label: 'Poster Template', href: '/admin/poster-template', icon: ImageIcon },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 flex-col bg-slate-950 text-slate-200 border-r border-slate-800 flex-shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
          <div className="relative w-9 h-9 bg-white rounded-full p-1 flex-shrink-0">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <div>
            <h2 className="font-serif-heading font-bold text-sm text-white tracking-wide">
              ADMIN PANEL
            </h2>
            <p className="text-[11px] text-gold-400 font-gurmukhi">
              ਸ੍ਰੀ ਦਰਬਾਰ ਸਾਹਿਬ, ਅੰਮ੍ਰਿਤਸਰ
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href) && !item.href.includes('type='));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-gold-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-800/80">
            <Link
              href="/admin/pages/new"
              className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-gold-400 hover:text-gold-300 hover:bg-slate-900 rounded-xl transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add New Page / Path</span>
            </Link>
          </div>
        </nav>

        {/* Footer controls */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition"
          >
            <span className="flex items-center space-x-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Website</span>
            </span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Live</span>
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-base sm:text-lg font-bold text-slate-900">
              dailyhukamnama.in Administration
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <span>View Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gold-100 border border-gold-300 text-gold-700 font-bold text-xs flex items-center justify-center">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-900">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-slate-500">@{user?.username || 'admin'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden bg-slate-950 text-white px-4 py-4 space-y-2 border-b border-slate-800">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900 hover:text-white"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            <Link
              href="/admin/pages/new"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm text-gold-400 hover:bg-slate-900 rounded-lg"
            >
              + Add New Page / Path
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-950/40 rounded-lg"
            >
              Logout
            </button>
          </div>
        )}

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
