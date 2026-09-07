'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import PageForm from '@/components/admin/PageForm';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditPage({ params }) {
  const { id } = params;
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPage() {
      try {
        const res = await fetch(`/api/admin/pages/${id}`);
        const data = await res.json();
        if (data.page) {
          setPage(data.page);
        } else {
          setError(data.error || 'Page not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, [id]);

  return (
    <AdminLayout>
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading page details...</p>
        </div>
      ) : error ? (
        <div className="bg-white p-8 rounded-2xl border border-red-200 text-center max-w-md mx-auto space-y-3">
          <p className="text-sm font-semibold text-red-600">{error}</p>
          <Link
            href="/admin/pages"
            className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Pages</span>
          </Link>
        </div>
      ) : (
        <PageForm initialData={page} isEdit={true} />
      )}
    </AdminLayout>
  );
}
