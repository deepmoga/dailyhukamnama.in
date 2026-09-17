'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  ArrowLeft, Save, Loader2, Sparkles, CheckCircle2, 
  ExternalLink, Calendar, BookOpen, Image as ImageIcon, AlertCircle, RefreshCw, Globe 
} from 'lucide-react';

export default function EditHukamnamaPage({ params }) {
  const { id } = params;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [regeneratePoster, setRegeneratePoster] = useState(false);
  const [posterPages, setPosterPages] = useState([]);

  const [formData, setFormData] = useState({
    hukamnama_date: '',
    title: '',
    ang: '',
    raag: '',
    author: '',
    gurmukhi_header: '',
    shabad_title: '',
    gurmukhi_only: '',
    punjabi_arth: '',
    english_translation: '',
    hindi_translation: '',
    image_alt: '',
    meta_keywords: '',
    meta_desc: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/hukamnamas/${id}`);
        const data = await res.json();
        if (data.success && data.hukamnama) {
          const h = data.hukamnama;
          setFormData({
            hukamnama_date: h.hukamnama_date || '',
            title: h.title || '',
            ang: h.ang || '',
            raag: h.raag || '',
            author: h.author || '',
            gurmukhi_header: h.gurmukhi_header || '',
            shabad_title: h.shabad_title || '',
            gurmukhi_only: h.gurmukhi_only || '',
            punjabi_arth: h.punjabi_arth || '',
            english_translation: h.english_translation || '',
            hindi_translation: h.hindi_translation || '',
            image_alt: h.image_alt || '',
            meta_keywords: h.meta_keywords || '',
            meta_desc: h.meta_desc || '',
          });
          setPosterPages(h.poster_pages || []);
        } else {
          setError(data.error || 'Failed to load Hukamnama');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutoGenerateSeo = () => {
    const cleanAng = formData.ang ? String(formData.ang).trim() : '';
    const cleanRaag = formData.raag ? formData.raag.replace(/\s*\([^)]*\)/g, '').split('/')[0].trim() : '';
    
    let dateFormatted = '';
    if (formData.hukamnama_date) {
      const clean = String(formData.hukamnama_date).split('T')[0].trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
        const [y, m, d] = clean.split('-').map(Number);
        const dt = new Date(y, m - 1, d, 12, 0, 0);
        if (!isNaN(dt.getTime())) {
          dateFormatted = dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        }
      }
      if (!dateFormatted) {
        const dt = new Date(formData.hukamnama_date);
        if (!isNaN(dt.getTime())) {
          dateFormatted = dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        }
      }
    }
    dateFormatted = dateFormatted || formData.hukamnama_date || '';

    const imageAlt = `Daily Hukamnama Sri Darbar Sahib Amritsar - ${dateFormatted}${cleanAng ? ` - Ang ${cleanAng}` : ''}${cleanRaag ? ` ${cleanRaag}` : ''}`.trim();
    const metaDesc = `Daily Hukamnama Sri Darbar Sahib Amritsar today (${dateFormatted}).${cleanAng ? ` Ang ${cleanAng},` : ''}${cleanRaag ? ` ${cleanRaag}.` : ''} Gurmukhi Mukhwak, Punjabi Viakhya, Hindi & English translation.`.trim();
    let metaKeywords = `Daily Hukamnama, Golden Temple${cleanAng ? `, Ang ${cleanAng}` : ''}${cleanRaag ? `, ${cleanRaag}` : ''}`.trim();
    if (metaKeywords.length > 60) {
      metaKeywords = metaKeywords.slice(0, 60).replace(/,[^,]*$/, '');
    }

    setFormData((prev) => ({
      ...prev,
      image_alt: imageAlt,
      meta_keywords: metaKeywords,
      meta_desc: metaDesc,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/hukamnamas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          regenerate_poster: regeneratePoster,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save changes');
      }

      setSuccess('Hukamnama updated successfully!' + (regeneratePoster ? ' Branded posters regenerated.' : ''));
      if (data.hukamnama?.poster_pages) {
        setPosterPages(data.hukamnama.poster_pages);
      }
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading Hukamnama details...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Top Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/hukamnamas"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Back to list"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-gold-100 text-gold-800 border border-gold-200">
                  {formData.hukamnama_date || `ID: ${id}`}
                </span>
                <h1 className="text-xl font-bold text-slate-900 font-serif-heading">
                  Edit Daily Hukamnama
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manually edit Gurmukhi Mukhwak, Punjabi Viakhya, translations, and regenerate posters.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {formData.hukamnama_date && (
              <Link
                href={`/daily-hukamnama/${formData.hukamnama_date}`}
                target="_blank"
                className="inline-flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View on Site</span>
              </Link>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-4 rounded-xl text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editing Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gurmukhi Mukhwak */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  ੧ਓ ਮੁੱਖਵਾਕ (Gurmukhi Only)
                </label>
                <span className="text-[11px] text-gold-700 font-semibold font-gurmukhi">
                  ਗੁਰਮੁਖੀ ਅੱਖਰ
                </span>
              </div>
              <textarea
                name="gurmukhi_only"
                rows={8}
                value={formData.gurmukhi_only}
                onChange={handleChange}
                placeholder="Enter original Gurmukhi Mukhwak lines..."
                className="w-full p-4 text-base font-gurmukhi leading-relaxed bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none resize-y text-slate-900"
              />
            </div>

            {/* Punjabi Viakhya (Arth) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  ਪੰਜਾਬੀ ਵਿਆਖਿਆ (Punjabi Arth)
                </label>
                <span className="text-[11px] text-slate-500">
                  Detailed Punjabi meaning line by line
                </span>
              </div>
              <textarea
                name="punjabi_arth"
                rows={8}
                value={formData.punjabi_arth}
                onChange={handleChange}
                placeholder="Enter Punjabi explanation (Viakhya)..."
                className="w-full p-4 text-sm font-gurmukhi leading-relaxed bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none resize-y text-slate-800"
              />
            </div>

            {/* English Translation */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  English Translation
                </label>
                <span className="text-[11px] text-slate-500">
                  English meaning
                </span>
              </div>
              <textarea
                name="english_translation"
                rows={6}
                value={formData.english_translation}
                onChange={handleChange}
                placeholder="Enter English translation..."
                className="w-full p-4 text-xs font-serif leading-relaxed bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none resize-y text-slate-800"
              />
            </div>

            {/* Hindi Translation */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Hindi Translation
                </label>
                <span className="text-[11px] text-slate-500">
                  हिन्दी अर्थ
                </span>
              </div>
              <textarea
                name="hindi_translation"
                rows={6}
                value={formData.hindi_translation}
                onChange={handleChange}
                placeholder="Enter Hindi translation..."
                className="w-full p-4 text-xs leading-relaxed bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none resize-y text-slate-800"
              />
            </div>
          </div>

          {/* Metadata & Controls Column */}
          <div className="space-y-6">
            {/* Metadata Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-gold-500" />
                <span>Hukamnama Details</span>
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  name="hukamnama_date"
                  value={formData.hukamnama_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ang (ਅੰਗ Number)
                </label>
                <input
                  type="text"
                  name="ang"
                  value={formData.ang}
                  onChange={handleChange}
                  placeholder="e.g. 631"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Raag
                </label>
                <input
                  type="text"
                  name="raag"
                  value={formData.raag}
                  onChange={handleChange}
                  placeholder="e.g. Raag Sorath"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Author / Guru
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="e.g. Guru Ramdas Ji"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gurmukhi Nanakshahi Header
                </label>
                <input
                  type="text"
                  name="gurmukhi_header"
                  value={formData.gurmukhi_header}
                  onChange={handleChange}
                  placeholder="e.g. ਸੋਮਵਾਰ, ੨੯ ਭਾਦੋਂ (ਸੰਮਤ ੫੫੮ ਨਾਨਕਸ਼ਾਹੀ)"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none font-gurmukhi font-semibold"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Printed at the top of the branded poster.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Shabad / Raag Title
                </label>
                <input
                  type="text"
                  name="shabad_title"
                  value={formData.shabad_title}
                  onChange={handleChange}
                  placeholder="e.g. ਸੋਰਠਿ ਮਹਲਾ ੫ ॥"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none font-gurmukhi font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Post Title (English)
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Daily Hukamnama Sri Darbar Sahib – September 16, 2026"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* Search Engine Optimization (SEO) & Alt Tags */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-1.5">
                  <Globe className="w-4 h-4 text-gold-500" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    SEO & Meta Tags
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleAutoGenerateSeo}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-gold-700 bg-gold-50 hover:bg-gold-100 border border-gold-200 rounded-lg transition"
                  title="Auto-generate SEO values from current date and Ang"
                >
                  <Sparkles className="w-3 h-3 text-gold-600" />
                  <span>Auto-Fill</span>
                </button>
              </div>

              {/* Image Alt Tag */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Poster Image Alt Tag (for Image SEO)
                </label>
                <input
                  type="text"
                  name="image_alt"
                  value={formData.image_alt || ''}
                  onChange={handleChange}
                  placeholder="e.g. Daily Hukamnama Sri Darbar Sahib Amritsar - September 17, 2026 - Ang 631 Raag Sorath"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Applied to poster image &lt;img alt="..."&gt; tags and Google Image Search indexing.
                </p>
              </div>

              {/* Meta Keywords */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Meta Keywords
                  </label>
                  <span
                    className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border transition-colors ${
                      (formData.meta_keywords || '').length === 0
                        ? 'text-slate-400 bg-slate-50 border-slate-200'
                        : (formData.meta_keywords || '').length <= 60
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
                        : 'text-rose-700 bg-rose-50 border-rose-300'
                    }`}
                  >
                    {(formData.meta_keywords || '').length}/60 chars
                  </span>
                </div>
                <input
                  type="text"
                  name="meta_keywords"
                  value={formData.meta_keywords || ''}
                  onChange={handleChange}
                  placeholder="e.g. Daily Hukamnama, Golden Temple, Ang 631, Raag Sorath"
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl outline-none transition focus:bg-white ${
                    (formData.meta_keywords || '').length === 0
                      ? 'border-slate-300 focus:ring-2 focus:ring-gold-500'
                      : (formData.meta_keywords || '').length <= 60
                      ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-500'
                      : 'border-rose-400 focus:ring-2 focus:ring-rose-500'
                  }`}
                />
                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <span className="text-slate-400">Target keywords for Google.</span>
                  <span className={(formData.meta_keywords || '').length > 60 ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                    {(formData.meta_keywords || '').length > 60
                      ? `⚠️ ${(formData.meta_keywords || '').length - 60} chars over recommended 60`
                      : '✓ Recommended: up to 60 characters'}
                  </span>
                </div>
              </div>

              {/* Meta Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Meta Description
                  </label>
                  <span
                    className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border transition-colors ${
                      (formData.meta_desc || '').length === 0
                        ? 'text-slate-400 bg-slate-50 border-slate-200'
                        : (formData.meta_desc || '').length <= 160
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
                        : 'text-rose-700 bg-rose-50 border-rose-300'
                    }`}
                  >
                    {(formData.meta_desc || '').length}/160 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  name="meta_desc"
                  value={formData.meta_desc || ''}
                  onChange={handleChange}
                  placeholder="Brief summary for Google search results..."
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl outline-none resize-none transition focus:bg-white ${
                    (formData.meta_desc || '').length === 0
                      ? 'border-slate-300 focus:ring-2 focus:ring-gold-500'
                      : (formData.meta_desc || '').length <= 160
                      ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-500'
                      : 'border-rose-400 focus:ring-2 focus:ring-rose-500'
                  }`}
                />
                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <span className="text-slate-400">Snippet for search engine results.</span>
                  <span className={(formData.meta_desc || '').length > 160 ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                    {(formData.meta_desc || '').length > 160
                      ? `⚠️ ${(formData.meta_desc || '').length - 160} chars over recommended 160`
                      : '✓ Recommended: up to 160 characters'}
                  </span>
                </div>
              </div>
            </div>

            {/* Poster Generation Control */}
            <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200/90 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>Branded Poster Generation</span>
              </h4>

              <label className="flex items-start space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={regeneratePoster}
                  onChange={(e) => setRegeneratePoster(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-gold-600 rounded border-amber-300 focus:ring-gold-500 accent-gold-600"
                />
                <div>
                  <span className="text-xs font-bold text-amber-950">
                    Regenerate posters with new wording
                  </span>
                  <p className="text-[11px] text-amber-800 leading-snug mt-0.5">
                    When checked, saving will immediately re-run the Python typography engine with this exact wording to generate new high-res posters.
                  </p>
                </div>
              </label>

              {/* Current poster pages preview */}
              {posterPages.length > 0 && (
                <div className="pt-3 border-t border-amber-200/60">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-2">
                    Current Generated Posters ({posterPages.length} Pages)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {posterPages.map((p, idx) => (
                      <a
                        key={idx}
                        href={p}
                        target="_blank"
                        className="group relative aspect-[3/4] bg-white rounded-lg border border-amber-200 overflow-hidden shadow-xs hover:shadow-md transition"
                      >
                        <img
                          src={p}
                          alt={`Poster page ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                          P.{idx + 1}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Save Button in side column too */}
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
