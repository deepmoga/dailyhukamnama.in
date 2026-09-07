'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { 
  FileText, BookOpen, Users, PlusCircle, 
  ArrowUpRight, Clock, Sparkles, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ pages: 0, paths: 0, volunteers: 0 });
  const [recentPages, setRecentPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [pagesRes, volRes] = await Promise.all([
          fetch('/api/admin/pages'),
          fetch('/api/admin/volunteers'),
        ]);

        const pagesData = await pagesRes.json();
        const volData = await volRes.json();

        if (pagesData.pages) {
          const totalPages = pagesData.pages.filter(p => p.page_type !== 'path').length;
          const totalPaths = pagesData.pages.filter(p => p.page_type === 'path').length;
          setStats({
            pages: totalPages,
            paths: totalPaths,
            volunteers: volData.volunteers?.length || 0,
          });
          setRecentPages(pagesData.pages.slice(0, 6));
        }
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-spiritual-navy text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-gold-500/20 text-gold-300 rounded-full text-xs font-semibold mb-3 border border-gold-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sri Harmandir Sahib Content Management</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-heading">
              Welcome to Daily Hukamnama Admin
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Manage your site pages (About Hukam, Harmandir Sahib, Sikh Gurus), custom Nitnem Path pages, and Volunteers directory with live database sync.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/admin/pages/new"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl text-xs font-semibold shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Page</span>
            </Link>
            <Link
              href="/admin/volunteers"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
            >
              <Users className="w-4 h-4" />
              <span>Manage Volunteers</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Standard Pages
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? '...' : stats.pages}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">about-hukam, harmandir-sahib, etc.</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-gold-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Nitnem Path Pages
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? '...' : stats.paths}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">japji-sahib, custom paths</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Volunteers
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? '...' : stats.volunteers}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Displayed on frontend table</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Quick Pages List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Managed Pages & Gurbani Paths
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pages editable in the admin panel with rich text and images
              </p>
            </div>
            <Link
              href="/admin/pages"
              className="inline-flex items-center space-x-1 text-xs font-semibold text-gold-600 hover:text-gold-700"
            >
              <span>View All Pages</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Page Title</th>
                  <th className="px-5 py-3">URL Slug</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPages.map((page) => (
                  <tr key={page.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {page.title}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-500">
                      /{page.slug}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        page.page_type === 'path'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gold-100 text-gold-800'
                      }`}>
                        {page.page_type === 'path' ? 'Nitnem Path' : 'Standard Page'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <Link
                        href={`/admin/pages/${page.id}`}
                        className="inline-flex items-center px-2.5 py-1 bg-slate-100 hover:bg-gold-50 hover:text-gold-700 text-slate-700 font-semibold rounded-lg text-xs transition"
                      >
                        Edit
                      </Link>
                      <a
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 text-slate-400 hover:text-slate-700 rounded-lg text-xs transition"
                        title="View Live"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
