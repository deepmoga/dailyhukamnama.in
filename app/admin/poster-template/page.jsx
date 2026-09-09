'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Image as ImageIcon, UploadCloud, RefreshCw, CheckCircle2, 
  AlertCircle, Sparkles, ExternalLink, ArrowRight, Eye
} from 'lucide-react';

export default function PosterTemplateAdmin() {
  const [templateInfo, setTemplateInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [autoRegen, setAutoRegen] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [posters, setPosters] = useState({
    page1: `/uploads/hukamnama-2026-09-09-1.jpg?t=${Date.now()}`,
    page2: `/uploads/hukamnama-2026-09-09-2.jpg?t=${Date.now()}`,
  });
  const fileInputRef = useRef(null);

  const fetchTemplateInfo = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/template-bg');
      const data = await res.json();
      if (data.success) {
        setTemplateInfo(data);
      }
    } catch (err) {
      console.error('Failed to load template info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplateInfo();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setMessage({ type: '', text: '' });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setMessage({ type: '', text: '' });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select an image file first.' });
      return;
    }

    try {
      setUploading(true);
      setMessage({ type: '', text: '' });

      const formData = new FormData();
      formData.append('file', selectedFile);
      if (autoRegen) {
        formData.append('regenerate', 'true');
      }

      const res = await fetch('/api/admin/template-bg', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setMessage({
          type: 'success',
          text: autoRegen 
            ? 'Background updated & today\'s posters regenerated successfully!' 
            : 'Background template updated successfully!',
        });
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        await fetchTemplateInfo();
        // Update live preview cachebuster
        setPosters({
          page1: `/uploads/hukamnama-2026-09-09-1.jpg?t=${Date.now()}`,
          page2: `/uploads/hukamnama-2026-09-09-2.jpg?t=${Date.now()}`,
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update background image.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Upload failed: ' + err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      setMessage({ type: '', text: '' });

      const res = await fetch('/api/admin/template-bg', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Today\'s posters regenerated successfully with current background!' });
        setPosters({
          page1: `/uploads/hukamnama-2026-09-09-1.jpg?t=${Date.now()}`,
          page2: `/uploads/hukamnama-2026-09-09-2.jpg?t=${Date.now()}`,
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Regeneration failed.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Regeneration error: ' + err.message });
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-gold-500/20 text-gold-300 rounded-full text-xs font-semibold mb-3 border border-gold-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Poster Template & Background Image</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-heading">
              Poster Background Management
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Upload and update the template background image (<code className="text-gold-300">bg.jpg</code>) used to generate high-resolution Daily Hukamnama posters.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition"
            >
              <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
              <span>{regenerating ? 'Generating...' : 'Regenerate Posters'}</span>
            </button>
          </div>
        </div>

        {/* Status notification */}
        {message.text && (
          <div className={`p-4 rounded-xl text-xs font-medium flex items-center space-x-2.5 ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Template Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-gold-600 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Current Background Template</h3>
                    <p className="text-[11px] text-slate-400">assets/images/bg.jpg</p>
                  </div>
                </div>
                <button
                  onClick={fetchTemplateInfo}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                  title="Reload template info"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-5 items-center">
                <div className="relative w-44 h-60 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 shadow-inner group">
                  {templateInfo?.url ? (
                    <img
                      src={templateInfo.url}
                      alt="Current Background"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      No Image Found
                    </div>
                  )}
                  {templateInfo?.url && (
                    <a
                      href={templateInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition text-xs font-semibold gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Full View</span>
                    </a>
                  )}
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-700 block">Recommended Dimensions:</span>
                    <span className="text-slate-500">724 × 1024 px (or similar 3:4 portrait ratio)</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">Current File Size:</span>
                    <span className="text-slate-500">
                      {templateInfo?.size ? `${(templateInfo.size / 1024).toFixed(1)} KB` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">Last Updated:</span>
                    <span className="text-slate-500">
                      {templateInfo?.updatedAt ? new Date(templateInfo.updatedAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/70 text-[11px] text-amber-900 leading-relaxed">
                    💡 The background image provides the ornate border and temple header for automatically generated social posters.
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Automatic backups are kept in <code className="text-slate-600">/backups</code> folder</span>
            </div>
          </div>

          {/* Upload New Template Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-gold-50 border border-gold-200 text-gold-600 flex items-center justify-center">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Upload New Background Template</h3>
                <p className="text-[11px] text-slate-400">Replaces active bg.jpg template</p>
              </div>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* Drag & drop dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2.5 ${
                  selectedFile
                    ? 'border-gold-400 bg-gold-50/30'
                    : 'border-slate-300 hover:border-gold-400 hover:bg-slate-50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="space-y-2 flex flex-col items-center">
                    <img
                      src={previewUrl}
                      alt="New Preview"
                      className="w-28 h-36 object-cover rounded-lg shadow border border-slate-200"
                    />
                    <p className="text-xs font-semibold text-slate-700">
                      {selectedFile?.name} ({((selectedFile?.size || 0) / 1024).toFixed(1)} KB)
                    </p>
                    <span className="text-[11px] text-gold-600 hover:underline">
                      Click to choose a different file
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        JPG, PNG, or WEBP (Standard 724x1024 px recommended)
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Checkbox to auto regenerate */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="autoRegen"
                  checked={autoRegen}
                  onChange={(e) => setAutoRegen(e.target.checked)}
                  className="w-4 h-4 text-gold-500 rounded border-slate-300 focus:ring-gold-400 cursor-pointer"
                />
                <label htmlFor="autoRegen" className="text-xs text-slate-700 select-none cursor-pointer">
                  Automatically regenerate today's posters immediately with this new background
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center justify-center space-x-2"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading & Applying Template...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Save & Apply Background Template</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Live Generated Posters Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Live Generated Posters Preview
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Displays today's generated Daily Hukamnama publication posters (Page 1 & Page 2)
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                <span>View Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gold-500 hover:bg-gold-600 rounded-lg transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                <span>Re-generate</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Page 1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Page 1: Sri Mukhwak & Punjabi Viakhya</span>
                <a
                  href={posters.page1}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-600 hover:underline inline-flex items-center space-x-1"
                >
                  <span>Open Full Image</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative aspect-[724/1024] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img
                  src={posters.page1}
                  alt="Page 1 Poster"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/images/bg.jpg';
                  }}
                />
              </div>
            </div>

            {/* Page 2 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Page 2: English Translation & Viakhya</span>
                <a
                  href={posters.page2}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-600 hover:underline inline-flex items-center space-x-1"
                >
                  <span>Open Full Image</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative aspect-[724/1024] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img
                  src={posters.page2}
                  alt="Page 2 Poster"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/images/bg.jpg';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
