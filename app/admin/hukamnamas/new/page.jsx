'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  ArrowLeft, Save, Loader2, Sparkles, CheckCircle2, 
  Calendar, BookOpen, Image as ImageIcon, AlertCircle, Upload
} from 'lucide-react';

export default function NewHukamnamaPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const getTodayDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const initialDate = getTodayDateStr();

  const [formData, setFormData] = useState({
    hukamnama_date: initialDate,
    title: `Daily Hukamnama Sri Darbar Sahib – ${initialDate}`,
    ang: '',
    raag: '',
    author: '',
    gurmukhi_header: '',
    shabad_title: '',
    gurmukhi_only: '',
    punjabi_arth: '',
    english_translation: '',
    hindi_translation: '',
    source_image: '',
    image_alt: '',
    meta_keywords: '',
    meta_desc: '',
  });

  const [generatePoster, setGeneratePoster] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'hukamnama_date' && (!prev.title || prev.title.startsWith('Daily Hukamnama Sri Darbar Sahib'))) {
        updated.title = `Daily Hukamnama Sri Darbar Sahib – ${value}`;
      }
      return updated;
    });
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

  const handleCustomImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setFormData((prev) => ({
        ...prev,
        source_image: data.url,
        image_alt: prev.image_alt || `Daily Hukamnama Sri Darbar Sahib Amritsar - ${prev.hukamnama_date}`,
      }));
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/hukamnamas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          generate_poster: generatePoster,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create Hukamnama');
      }

      setSuccess('Hukamnama created successfully! Redirecting to directory...');
      setTimeout(() => {
        router.push('/admin/hukamnamas');
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

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
                  NEW ENTRY
                </span>
                <h1 className="text-xl font-bold text-slate-900 font-serif-heading">
                  Create Daily Hukamnama Manually
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Add a new Hukamnama, Gurmukhi Mukhwak, Punjabi Viakhya, Hindi & English translations, and generate posters.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Creating...' : 'Save Hukamnama'}</span>
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Main Text & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Primary Details Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Calendar className="w-4 h-4 text-gold-500" />
                <span>Primary Metadata & Date</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hukamnama Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    name="hukamnama_date"
                    value={formData.hukamnama_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ang (Page # in Sri Guru Granth Sahib)
                  </label>
                  <input
                    type="number"
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
              </div>
            </div>

            {/* Gurmukhi Mukhwak & Punjabi Viakhya Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-3">
                <BookOpen className="w-4 h-4 text-gold-500" />
                <span>Gurmukhi Sacred Text & Punjabi Viakhya</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Original Gurmukhi Mukhwak (ਮੁੱਖਵਾਕ)
                </label>
                <textarea
                  name="gurmukhi_only"
                  rows={8}
                  value={formData.gurmukhi_only}
                  onChange={handleChange}
                  placeholder="ਸੋਰਠਿ ਮਹਲਾ ੫ ॥ ਪ੍ਰਭ ਕੀ ਸਰਣਿ ਸਗਲ ਭੈ ਲਾਥੇ ਦੁਖ ਬਿਨਸੇ ਸੁਖੁ ਪਾਇਆ ॥..."
                  className="w-full p-3.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none font-gurmukhi leading-loose"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Punjabi Viakhya / Arth (ਪੰਜਾਬੀ ਵਿਆਖਿਆ)
                </label>
                <textarea
                  name="punjabi_arth"
                  rows={8}
                  value={formData.punjabi_arth}
                  onChange={handleChange}
                  placeholder="ਅਰਥ: ਹੇ ਭਾਈ! ਪ੍ਰਭੂ ਦੀ ਓਟ ਲੈਣ ਨਾਲ ਸਾਰੇ ਡਰ ਦੂਰ ਹੋ ਜਾਂਦੇ ਹਨ..."
                  className="w-full p-3.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none font-gurmukhi leading-relaxed"
                />
              </div>
            </div>

            {/* Hindi & English Translations */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
                English & Hindi Translations
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  English Translation
                </label>
                <textarea
                  name="english_translation"
                  rows={6}
                  value={formData.english_translation}
                  onChange={handleChange}
                  placeholder="Sorath, Fifth Mehl: In the sanctuary of God, all fears depart..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hindi Translation
                </label>
                <textarea
                  name="hindi_translation"
                  rows={6}
                  value={formData.hindi_translation}
                  onChange={handleChange}
                  placeholder="सोरठि महला ५ ॥ प्रभु की शरण में आने से सारे भय समाप्त हो जाते हैं..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Right 1 Col: Poster Settings & SEO Metadata */}
          <div className="space-y-6">
            {/* Poster Generation Settings */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 pb-3">
                <ImageIcon className="w-4 h-4 text-gold-500" />
                <span>Branded Poster Generation</span>
              </h3>

              <label className="flex items-start space-x-3 p-3 rounded-xl bg-gold-50/60 border border-gold-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generatePoster}
                  onChange={(e) => setGeneratePoster(e.target.checked)}
                  className="mt-0.5 rounded text-gold-500 focus:ring-gold-500 w-4 h-4"
                />
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    Automatically generate HD poster images
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Uses Python PIL generator with official border frame and typography for social sharing.
                  </p>
                </div>
              </label>

              {/* Optional Custom Poster Upload */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Or Upload Custom Poster Image (Optional)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleCustomImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium border border-slate-300 transition"
                  >
                    {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                  </button>
                  <input
                    type="text"
                    name="source_image"
                    value={formData.source_image}
                    onChange={handleChange}
                    placeholder="or paste image URL"
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 outline-none font-mono"
                  />
                </div>
                {formData.source_image && (
                  <div className="mt-2.5 p-2 bg-slate-50 border rounded-xl flex items-center space-x-3">
                    <img src={formData.source_image} alt="Preview" className="w-12 h-14 object-cover rounded-lg border shadow-xs" />
                    <div className="text-xs truncate flex-1">
                      <p className="font-semibold text-slate-800 truncate">{formData.source_image}</p>
                      <button type="button" onClick={() => setFormData(p => ({ ...p, source_image: '' }))} className="text-red-500 text-[11px] hover:underline">Remove</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SEO & Social Metadata Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  SEO & Google Indexing
                </h3>
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
                  value={formData.image_alt}
                  onChange={handleChange}
                  placeholder="e.g. Daily Hukamnama Sri Darbar Sahib Amritsar - September 18, 2026 - Ang 631 Raag Sorath"
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
                    {(formData.meta_keywords || '').length} / 60 chars
                  </span>
                </div>
                <input
                  type="text"
                  name="meta_keywords"
                  value={formData.meta_keywords}
                  onChange={handleChange}
                  placeholder="e.g. Daily Hukamnama, Golden Temple, Ang 631, Raag Sorath"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none"
                />
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
                    {(formData.meta_desc || '').length} / 160 chars
                  </span>
                </div>
                <textarea
                  name="meta_desc"
                  rows={3}
                  value={formData.meta_desc}
                  onChange={handleChange}
                  placeholder="Daily Hukamnama Sri Darbar Sahib Amritsar today (September 18, 2026). Ang 631, Raag Sorath. Gurmukhi Mukhwak, Punjabi Viakhya, Hindi & English translation."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
