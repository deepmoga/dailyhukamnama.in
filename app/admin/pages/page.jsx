'use client';

import { useState, useEffect, Suspense } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  FileText, BookOpen, PlusCircle, Search, 
  Trash2, Edit, ExternalLink, ArrowUpRight, Loader2
} from 'lucide-react';

export default function PagesManagementPage() {
  return (
    <Suspense fallback={<AdminLayout><div className="p-8 text-center text-gray-500">Loading pages...</div></AdminLayout>}>
      <PagesManagementContent />
    </Suspense>
  );
}

function PagesManagementContent() {
  const searchParams = useSearchParams();
  const currentType = searchParams ? (searchParams.get('type') || 'all') : 'all';

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const typeHeaders = {
    all: {
      title: 'All Website Pages',
      desc: 'Complete directory of all pages, Banis, Guru profiles, and articles.',
      badge: 'All Pages'
    },
    path: {
      title: 'Nitnem Path Pages',
      desc: 'Manage all 18+ prayer banis, Gurmukhi text, audio files, and translations.',
      badge: 'Nitnem Banis'
    },
    sikh_guru: {
      title: 'Sikh Gurus Pages',
      desc: 'Manage individual Sikh Guru biographies, holy compositions, and life history.',
      badge: 'Sikh Gurus'
    },
    page: {
      title: 'Standard Website Pages',
      desc: 'Manage Contact Us, About Hukamnama, Golden Temple history, and general pages.',
      badge: 'Standard Pages'
    },
  };

  const headerInfo = typeHeaders[currentType] || typeHeaders.all;

  useEffect(() => {
    fetchPages();
  }, [currentType]);

  async function fetchPages() {
    setLoading(true);
    try {
      let url = '/api/admin/pages';
      if (currentType === 'path') {
        url += '?type=path';
      } else if (currentType === 'page') {
        url += '?type=page';
      } else if (currentType === 'sikh_guru') {
        url += '?type=sikh_guru';
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.pages) {
        setPages(data.pages);
      }
    } catch (err) {
      console.error('Error fetching pages:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/pages/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPages(pages.filter((p) => p.id !== id));
      } else {
        alert(data.error || 'Failed to delete page');
      }
    } catch (err) {
      alert('Error deleting page: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPages = pages.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q) ||
      p.meta_title?.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold-100 text-gold-800 border border-gold-200">
                {headerInfo.badge}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-heading">
              {headerInfo.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {headerInfo.desc}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/pages/new"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl text-xs font-semibold shadow transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Page / Path</span>
            </Link>
          </div>
        </div>

        {/* Search & Info Bar (Removed top tabs as requested) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-900">Total in {headerInfo.badge}:</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono font-bold text-slate-700">
              {filteredPages.length} {filteredPages.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${headerInfo.badge.toLowerCase()} by title or slug...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Loading pages...</p>
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800">No pages found</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                {searchQuery ? 'Try adjusting your search terms.' : 'Get started by creating your first page.'}
              </p>
              <Link
                href="/admin/pages/new"
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-gold-500 text-white rounded-xl text-xs font-semibold shadow hover:bg-gold-600 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Page</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Title & Meta</th>
                    <th className="px-5 py-3">URL Slug</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Menu Visibility & Order</th>
                    <th className="px-5 py-3">Last Modified</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPages.map((page) => (
                    <tr key={page.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 text-sm">
                          {page.title}
                        </div>
                        {page.punjabi_title && (
                          <p className="font-gurmukhi text-xs text-gold-600 mt-0.5">
                            {page.punjabi_title}
                          </p>
                        )}
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {page.meta_title || page.meta_desc || 'No meta description set'}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-600">
                        <span className="text-slate-400">/</span>
                        <span className="text-slate-900 font-medium">{page.slug}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          page.page_type === 'path'
                            ? 'bg-blue-100 text-blue-800'
                            : page.page_type === 'sikh_guru'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {page.page_type === 'path' 
                            ? 'Nitnem Path' 
                            : page.page_type === 'sikh_guru' 
                            ? 'Sikh Guru' 
                            : 'Standard Page'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit ${
                            page.show_in_menu 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${page.show_in_menu ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            <span>{page.show_in_menu ? 'In Menu' : 'Hidden from Menu'}</span>
                          </span>
                          {page.show_in_menu ? (
                            <span className="text-[10px] text-slate-500 font-mono">
                              Order: <strong className="text-slate-800 font-bold">{page.sort_order ?? 0}</strong>
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {new Date(page.updated_at || page.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                        <Link
                          href={`/admin/pages/${page.id}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-gold-50 hover:text-gold-700 text-slate-700 font-semibold rounded-lg text-xs transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>
                        <a
                          href={`/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs transition"
                          title="View Live Page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleDelete(page.id, page.title)}
                          disabled={deletingId === page.id}
                          className="inline-flex items-center px-2.5 py-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs transition"
                          title="Delete Page"
                        >
                          {deletingId === page.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
