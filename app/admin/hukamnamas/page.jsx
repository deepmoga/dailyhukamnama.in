'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import { 
  Sparkles, Search, Calendar, BookOpen, ExternalLink, 
  Edit, Loader2, RefreshCw, Eye, Image as ImageIcon, ChevronLeft, ChevronRight 
} from 'lucide-react';

export default function AdminHukamnamasPage() {
  const [hukamnamas, setHukamnamas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const loadHukamnamas = async (pageNumber = 1, searchQuery = '') => {
    try {
      setLoading(true);
      const url = `/api/admin/hukamnamas?page=${pageNumber}&limit=20&search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setHukamnamas(data.hukamnamas || []);
        setPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load hukamnamas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHukamnamas(page, search);
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadHukamnamas(1, search);
  };

  const handleSyncToday = async () => {
    try {
      setSyncing(true);
      setSyncMessage('');
      const res = await fetch('/api/hukamnama?force=true', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncMessage('Today’s Hukamnama synced successfully!');
        loadHukamnamas(1, search);
      } else {
        setSyncMessage('Sync issue: ' + (data.error || 'Check source'));
      }
    } catch (err) {
      setSyncMessage('Sync failed: ' + err.message);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(''), 5000);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 font-serif-heading">
                  Daily Hukamnamas Directory
                </h1>
                <p className="text-xs text-slate-500">
                  Total {total} entries stored in database. Edit text, Arth, or regenerate posters manually.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSyncToday}
              disabled={syncing}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Today’s Hukamnama'}</span>
            </button>
          </div>
        </div>

        {syncMessage && (
          <div className="p-4 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 animate-fadeIn">
            {syncMessage}
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by date (YYYY-MM-DD), ang, raag, title..."
              className="w-full pl-10 pr-20 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-gold-500 hover:bg-gold-600 text-white rounded-lg text-[11px] font-semibold transition"
            >
              Filter
            </button>
          </form>

          <span className="text-xs text-slate-500">
            Page <span className="font-semibold text-slate-700">{page}</span> of{' '}
            <span className="font-semibold text-slate-700">{totalPages}</span> ({total} items)
          </span>
        </div>

        {/* List table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Loading Hukamnamas...</p>
            </div>
          ) : hukamnamas.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No Hukamnamas found</p>
              <p className="text-xs text-slate-400">Try adjusting your search criteria or sync today’s Hukamnama.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Ang & Raag</th>
                    <th className="py-3.5 px-4">Gurmukhi Header / Title</th>
                    <th className="py-3.5 px-4 text-center">Posters</th>
                    <th className="py-3.5 px-4 text-center">Views</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {hukamnamas.map((item) => {
                    const pagesCount = item.poster_pages?.length || 0;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-3.5 h-3.5 text-gold-600" />
                            <span>{item.hukamnama_date}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5">
                            {item.ang && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold">
                                Ang {item.ang}
                              </span>
                            )}
                            {item.raag && (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                                {item.raag.split('/')[0].trim()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-md">
                          <div className="font-gurmukhi font-semibold text-slate-800 text-xs truncate">
                            {item.gurmukhi_header || item.title}
                          </div>
                          {item.shabad_title && (
                            <div className="text-[11px] text-slate-500 font-gurmukhi truncate mt-0.5">
                              {item.shabad_title}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {pagesCount > 0 ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ImageIcon className="w-3 h-3" />
                              <span>{pagesCount} {pagesCount === 1 ? 'Page' : 'Pages'}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-600 whitespace-nowrap">
                          {item.views || 0}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                          <Link
                            href={`/admin/hukamnamas/${item.id}`}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-gold-50 hover:bg-gold-100 text-gold-800 border border-gold-300 text-xs font-semibold transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </Link>
                          <Link
                            href={`/daily-hukamnama/${item.hukamnama_date}`}
                            target="_blank"
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination bar */}
          {!loading && totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="text-xs text-slate-600 font-medium">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
