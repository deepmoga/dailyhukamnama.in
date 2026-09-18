'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, FileText, BookOpen, Users, 
  ExternalLink, LogOut, Menu, X, PlusCircle, Sparkles, Image as ImageIcon, Settings,
  Award, Compass
} from 'lucide-react';

export default function AdminLayout({ children }) {
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

        {/* Navigation items wrapped in Suspense for searchParams */}
        <Suspense fallback={<div className="p-4 text-xs text-slate-500">Loading nav...</div>}>
          <SidebarNavContent />
        </Suspense>

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
            <Suspense fallback={<div className="text-xs text-slate-500">Loading...</div>}>
              <SidebarNavContent onNavigate={() => setMobileOpen(false)} />
            </Suspense>
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-950/40 rounded-lg"
              >
                Logout
              </button>
            </div>
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

function SidebarNavContent({ onNavigate }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams ? searchParams.get('type') : null;

  const isLinkActive = (item) => {
    if (item.href === '/admin') {
      return pathname === '/admin';
    }
    if (item.href === '/admin/hukamnamas') {
      return pathname.startsWith('/admin/hukamnamas');
    }
    if (item.href === '/admin/pages') {
      return pathname === '/admin/pages' && (!currentType || currentType === 'all');
    }
    if (item.href === '/admin/pages?type=path') {
      return pathname === '/admin/pages' && currentType === 'path';
    }
    if (item.href === '/admin/pages?type=sikh_guru') {
      return pathname === '/admin/pages' && currentType === 'sikh_guru';
    }
    if (item.href === '/admin/pages?type=page') {
      return pathname === '/admin/pages' && currentType === 'page';
    }
    return pathname.startsWith(item.href);
  };

  return (
    <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
      {/* General Section */}
      <div className="space-y-1">
        <Link
          href="/admin"
          onClick={onNavigate}
          className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
            isLinkActive({ href: '/admin' })
              ? 'bg-gold-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/admin/hukamnamas"
          onClick={onNavigate}
          className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
            isLinkActive({ href: '/admin/hukamnamas' })
              ? 'bg-gold-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span>Daily Hukamnamas</span>
        </Link>
      </div>

      {/* Pages Section */}
      <div className="space-y-1">
        <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Pages & Content
        </div>

        <Link
          href="/admin/pages"
          onClick={onNavigate}
          className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
            isLinkActive({ href: '/admin/pages' })
              ? 'bg-gold-500 text-white shadow-md font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 flex-shrink-0" />
          <span>All Pages</span>
        </Link>

        <Link
          href="/admin/pages?type=path"
          onClick={onNavigate}
          className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
            isLinkActive({ href: '/admin/pages?type=path' })
              ? 'bg-gold-500 text-white shadow-md font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 flex-shrink-0" />
          <span>Nitnem Path Pages</span>
        </Link>

        <Link
          href="/admin/pages?type=sikh_guru"
          onClick={onNavigate}
          className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
            isLinkActive({ href: '/admin/pages?type=sikh_guru' })
              ? 'bg-gold-500 text-white shadow-md font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Award className="w-4 h-4 flex-shrink-0" />
          <span>Sikh Gurus Pages</span>
        </Link>

        <Link
          href="/admin/pages?type=page"
          onClick={onNavigate}
          className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
            isLinkActive({ href: '/admin/pages?type=page' })
              ? 'bg-gold-500 text-white shadow-md font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Compass className="w-4 h-4 flex-shrink-0" />
          <span>Standard Pages</span>
        </Link>
      </div>

      {/* Management & Tools */}
      <div className="space-y-1">
        <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          System & Tools
        </div>

        <Link
          href="/admin/volunteers"
          onClick={onNavigate}
          className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
            isLinkActive({ href: '/admin/volunteers' })
              ? 'bg-gold-500 text-white shadow-md font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4 flex-shrink-0" />
          <span>Volunteers</span>
        </Link>

        <Link
          href="/admin/poster-template"
          onClick={onNavigate}
          className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
            isLinkActive({ href: '/admin/poster-template' })
              ? 'bg-gold-500 text-white shadow-md font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ImageIcon className="w-4 h-4 flex-shrink-0" />
          <span>Poster Template</span>
        </Link>

        <Link
          href="/admin/settings"
          onClick={onNavigate}
          className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
            isLinkActive({ href: '/admin/settings' })
              ? 'bg-gold-500 text-white shadow-md font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          <span>Settings</span>
        </Link>
      </div>

      {/* Quick Add Actions */}
      <div className="pt-3 border-t border-slate-800/80 space-y-1">
        <Link
          href="/admin/hukamnamas/new"
          onClick={onNavigate}
          className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-gold-400 hover:text-gold-300 hover:bg-slate-900 rounded-xl transition"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>+ Add Hukamnama</span>
        </Link>

        <Link
          href="/admin/pages/new"
          onClick={onNavigate}
          className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-gold-400 hover:text-gold-300 hover:bg-slate-900 rounded-xl transition"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>+ Add New Page</span>
        </Link>
      </div>
    </nav>
  );
}
