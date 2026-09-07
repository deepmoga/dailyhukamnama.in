'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RichTextEditor from './RichTextEditor';
import { 
  ArrowLeft, Save, Loader2, Sparkles, 
  Globe, Search, ExternalLink, HelpCircle, Volume2
} from 'lucide-react';

export default function PageForm({ initialData = {}, isEdit = false }) {
  const router = useRouter();
  const audioInputRef = useRef(null);

  const [title, setTitle] = useState(initialData.title || '');
  const [slug, setSlug] = useState(initialData.slug || '');
  const [content, setContent] = useState(initialData.content || '');
  const [metaTitle, setMetaTitle] = useState(initialData.meta_title || '');
  const [metaDesc, setMetaDesc] = useState(initialData.meta_desc || '');
  const [metaKeywords, setMetaKeywords] = useState(initialData.meta_keywords || '');
  const [pageType, setPageType] = useState(initialData.page_type || 'page');
  const [author, setAuthor] = useState(initialData.author || '');
  const [punjabiTitle, setPunjabiTitle] = useState(initialData.punjabi_title || '');
  const [audioUrl, setAudioUrl] = useState(initialData.audio_url || '');
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auto generate slug from title if new
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEdit && !slug) {
      const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setSlug(autoSlug);
    }
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAudio(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload audio');
      }

      setAudioUrl(data.url);
    } catch (err) {
      alert('Audio upload failed: ' + err.message);
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const payload = {
        title,
        slug,
        content,
        meta_title: metaTitle || title,
        meta_desc: metaDesc,
        meta_keywords: metaKeywords,
        page_type: pageType,
        author: author || null,
        punjabi_title: punjabiTitle || null,
        audio_url: audioUrl || null,
      };

      const url = isEdit ? `/api/admin/pages/${initialData.id}` : '/api/admin/pages';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save page');
      }

      setSuccess('Page saved successfully!');
      setTimeout(() => {
        router.push('/admin/pages');
      }, 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/pages"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-heading">
              {isEdit ? `Edit Page: ${initialData.title}` : 'Create New Page / Path'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in the details below. All formatting and uploaded images will sync instantly.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/pages"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl text-xs shadow-md transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Page'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Content & Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Slug */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Page Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g. About Daily Hukamnama or Japji Sahib in Punjabi Gurmukhi"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center rounded-xl bg-slate-50 border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-gold-500 focus-within:bg-white">
                <span className="px-3 text-xs text-slate-400 font-mono select-none">
                  dailyhukamnama.in/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
                  placeholder="about-hukam or japji-sahib-in-punjabi-gurmukhi"
                  className="w-full py-2.5 pr-3 text-xs bg-transparent font-mono text-slate-900 outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Lowercase letters, numbers, and hyphens only. This defines the public website URL.
              </p>
            </div>

            {pageType === 'path' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gurmukhi Title (ਪੰਜਾਬੀ ਸਿਰਲੇਖ)
                  </label>
                  <input
                    type="text"
                    value={punjabiTitle}
                    onChange={(e) => setPunjabiTitle(e.target.value)}
                    placeholder="e.g. ਜਪੁਜੀ ਸਾਹਿਬ"
                    className="w-full px-3 py-2 text-sm font-gurmukhi bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bani Author (ਰਚਨਾਕਾਰ)
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Guru Nanak Dev Ji"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none"
                  />
                </div>

                {/* Audio File Upload for Path */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Path Audio Recitation (ਕੀਰਤਨ / ਪਾਠ ਆਡੀਓ ਫਾਈਲ)
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="file"
                      ref={audioInputRef}
                      onChange={handleAudioUpload}
                      accept="audio/*,.mp3,.wav,.m4a,.ogg"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => audioInputRef.current?.click()}
                      disabled={uploadingAudio}
                      className="inline-flex items-center justify-center space-x-2 px-3.5 py-2 bg-gold-50 hover:bg-gold-100 text-gold-700 border border-gold-300 rounded-xl text-xs font-semibold transition"
                    >
                      {uploadingAudio ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                      <span>{uploadingAudio ? 'Uploading Audio...' : 'Upload MP3 / Audio File'}</span>
                    </button>
                    <input
                      type="text"
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      placeholder="or paste external audio URL (e.g. https://...mp3)"
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none font-mono"
                    />
                  </div>
                  {audioUrl && (
                    <div className="mt-2.5 p-3 bg-amber-50/60 rounded-xl border border-gold-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        <Volume2 className="w-4 h-4 text-gold-600 flex-shrink-0" />
                        <span className="text-xs font-medium text-slate-700 truncate max-w-xs">{audioUrl}</span>
                      </div>
                      <audio controls src={audioUrl} className="h-8 w-full sm:w-64" />
                      <button
                        type="button"
                        onClick={() => setAudioUrl('')}
                        className="text-xs text-red-500 hover:underline self-end sm:self-auto"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Rich Text Editor for Content / Description */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Description & Body Content (Rich Text Editor)
              </label>
              <span className="text-[11px] text-gold-600 font-medium">
                Free Editor • Direct Image Upload Enabled
              </span>
            </div>

            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write the full page content here. Use formatting, headings, and the upload button to insert pictures directly."
            />
          </div>
        </div>

        {/* Right 1 Col: Settings & SEO Metadata */}
        <div className="space-y-6">
          {/* Page Type */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Page Classification
            </h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="pageType"
                  value="page"
                  checked={pageType === 'page'}
                  onChange={() => setPageType('page')}
                  className="text-gold-500 focus:ring-gold-500"
                />
                <div>
                  <p className="text-xs font-semibold text-slate-900">Standard Website Page</p>
                  <p className="text-[10px] text-slate-500">For about-hukam, sri-harimandir-sahib, sikh-gurus, etc.</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="radio"
                  name="pageType"
                  value="path"
                  checked={pageType === 'path'}
                  onChange={() => setPageType('path')}
                  className="text-gold-500 focus:ring-gold-500"
                />
                <div>
                  <p className="text-xs font-semibold text-slate-900">Nitnem Gurbani Path</p>
                  <p className="text-[10px] text-slate-500">For /japji-sahib-in-punjabi-gurmukhi/ and other prayer pages</p>
                </div>
              </label>
            </div>
          </div>

          {/* Search Engine Optimization (SEO) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-1.5 pb-2 border-b border-slate-100">
              <Globe className="w-4 h-4 text-gold-500" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                SEO & Meta Tags
              </h4>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meta Title
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Title shown on Google & social shares"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                placeholder="Brief summary of the page for search engines..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meta Keywords
              </label>
              <input
                type="text"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                placeholder="e.g. daily hukamnama, japji sahib, amritsar"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Separate keywords with commas.</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
