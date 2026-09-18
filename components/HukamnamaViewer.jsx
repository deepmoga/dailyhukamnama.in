'use client';

import { useState } from 'react';
import { 
  BookOpen, 
  Share2, 
  Printer, 
  Copy, 
  Check, 
  FileText, 
  ZoomIn, 
  ZoomOut,
  Calendar,
  Sparkles,
  ExternalLink,
  Download,
  Maximize2,
  X,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
} from 'lucide-react';

export default function HukamnamaViewer({ hukamnama, loading }) {
  // View mode options:
  // 'all': Lines + Punjabi Arth + Hindi Translation + English Translation
  // 'lines_only': Only Gurmukhi, Hindi, and English transliterated lines
  // 'punjabi': Lines + Punjabi Arth
  // 'english': Lines + English Translation
  // 'hindi': Lines + Hindi Translation
  const [viewMode, setViewMode] = useState('all');
  const [fontSize, setFontSize] = useState(20); // base font size in px
  const [copied, setCopied] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState(null);
  const [isImageCollapsed, setIsImageCollapsed] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareAlertMessage, setShareAlertMessage] = useState('');

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gold-200 p-8 text-center animate-pulse">
        <div className="h-8 bg-gold-100 rounded-md w-3/4 mx-auto mb-4" />
        <div className="h-64 bg-slate-100 rounded-xl w-full mx-auto mb-6" />
        <div className="space-y-4">
          <div className="h-6 bg-slate-100 rounded w-full" />
          <div className="h-5 bg-slate-100 rounded w-5/6 mx-auto" />
          <div className="h-5 bg-slate-100 rounded w-4/5 mx-auto" />
        </div>
      </div>
    );
  }

  if (!hukamnama) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-gold-200 p-12 text-center">
        <Sparkles className="w-10 h-10 text-gold-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">No Hukamnama Found</h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          We could not locate a Hukamnama entry for this date. Please choose another date from the calendar or sync today&apos;s Hukamnama.
        </p>
      </div>
    );
  }

  const verses = hukamnama.verses || [];

  const handleCopy = () => {
    let textToCopy = `ੴ Daily Hukamnama Sri Darbar Sahib ੴ\n`;
    textToCopy += `Daily Hukamnama, Sri Harmandir Sahib Amritsar in Punjabi, Hindi, English – ${hukamnama.hukamnama_date || ''}\n\n`;

    verses.forEach((v) => {
      if (v.gurmukhi) textToCopy += `${v.gurmukhi}\n\n`;
      if (v.hindi) textToCopy += `${v.hindi}\n\n`;
      if (v.englishTranslit) textToCopy += `${v.englishTranslit}\n\n`;
      if (v.punjabiArth) textToCopy += `${v.punjabiArth}\n\n`;
      if (v.hindiArth) textToCopy += `${v.hindiArth}\n\n`;
      if (v.englishTrans) textToCopy += `${v.englishTrans}\n\n`;
      if (v.citation) textToCopy += `${v.citation}\n\n`;
    });

    textToCopy += `\nਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ ॥ ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਹਿ ॥\nRead more at: https://dailyhukamnama.in`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getShareDetails = () => {
    const url = typeof window !== 'undefined' ? window.location.href : 'https://dailyhukamnama.in';
    const cleanAng = hukamnama.ang ? ` (Ang: ${hukamnama.ang})` : '';
    const cleanRaag = hukamnama.raag ? ` - ${hukamnama.raag}` : '';
    const titleText = `Daily Hukamnama Sri Darbar Sahib Amritsar${dateFormatted ? ` • ${dateFormatted}` : ''}${cleanAng}${cleanRaag}`;
    return { url, titleText };
  };

  const handleCopyShareUrl = () => {
    const { url } = getShareDetails();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  const handleSharePlatform = (platform) => {
    const { url, titleText } = getShareDetails();
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(`${titleText}\n\nRead full Gurmukhi, Viakhya & translations at:\n${url}`);

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'noopener,noreferrer,width=600,height=500');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(titleText)}&url=${encodedUrl}`, '_blank', 'noopener,noreferrer,width=600,height=500');
    } else if (platform === 'threads') {
      window.open(`https://www.threads.net/intent/post?text=${encodedText}`, '_blank', 'noopener,noreferrer,width=600,height=500');
    } else if (platform === 'instagram') {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(url);
      }
      setShareAlertMessage('Link copied to clipboard! Open Instagram to share in your Story or Bio.');
      setTimeout(() => {
        window.open('https://www.instagram.com', '_blank');
      }, 1200);
      setTimeout(() => setShareAlertMessage(''), 7000);
    } else if (platform === 'tiktok') {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(url);
      }
      setShareAlertMessage('Link copied to clipboard! Open TikTok to share in your video caption or bio.');
      setTimeout(() => {
        window.open('https://www.tiktok.com', '_blank');
      }, 1200);
      setTimeout(() => setShareAlertMessage(''), 7000);
    } else if (platform === 'native') {
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({
          title: titleText,
          text: `Daily Hukamnama Sri Darbar Sahib - ${dateFormatted}`,
          url: url,
        }).catch(() => {});
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const parseSafeDate = (dateStr) => {
    if (!dateStr) return null;
    const clean = String(dateStr).split('T')[0];
    const parts = clean.split('-').map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
      return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    }
    return new Date(dateStr);
  };

  const safeDate = parseSafeDate(hukamnama.hukamnama_date);
  const dateFormatted = safeDate 
    ? safeDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <>
      <div className="bg-white rounded-2xl shadow-md border border-gold-200/90 overflow-hidden hukamnama-print-container">
        {/* Decorative Golden Top Ribbon */}
        <div className="h-2.5 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600" />

        {/* Header section with Date, Raag, Ang */}
        <div className="bg-gradient-to-b from-gold-50/60 via-white to-white px-5 sm:px-8 pt-6 pb-4 border-b border-gold-100">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-gold-700 bg-gold-100/70 border border-gold-300/60 px-3 py-1 rounded-full">
              <Calendar className="w-3.5 h-3.5 text-gold-600" />
              <span>
                {safeDate 
                  ? safeDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : hukamnama.title}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {hukamnama.ang && (
                <span className="inline-flex items-center space-x-1 text-xs font-semibold bg-slate-100 text-slate-800 px-3 py-1 rounded-md border border-slate-200">
                  <BookOpen className="w-3.5 h-3.5 text-gold-600" />
                  <span>ਅੰਗ (Ang): {hukamnama.ang}</span>
                </span>
              )}
              {hukamnama.raag && (
                <span className="text-xs font-medium bg-amber-50 text-amber-900 px-2.5 py-1 rounded-md border border-amber-200">
                  {hukamnama.raag}
                </span>
              )}
              {hukamnama.author && (
                <span className="text-xs font-medium bg-blue-50 text-blue-900 px-2.5 py-1 rounded-md border border-blue-200">
                  {hukamnama.author}
                </span>
              )}
            </div>
          </div>

          {/* Gurmukhi Nanakshahi Header */}
          {hukamnama.gurmukhi_header && (
            <h3 className="font-gurmukhi text-lg sm:text-2xl font-bold text-center text-gold-700 mt-2 mb-1 tracking-wide">
              {hukamnama.gurmukhi_header}
            </h3>
          )}

          {/* Shabad Title */}
          {hukamnama.shabad_title && (
            <h2 className="font-gurmukhi text-xl sm:text-2xl md:text-3xl font-bold text-center text-slate-900 mt-2 mb-2">
              {hukamnama.shabad_title}
            </h2>
          )}

          {/* Main Website Heading as on old site */}
          <h1 className="text-sm sm:text-base md:text-lg text-center font-bold text-gold-700 tracking-wide mt-3 mb-1">
            Daily Hukamnama, Sri Harmandir Sahib Amritsar in Punjabi, Hindi, English – {dateFormatted}
          </h1>
        </div>

        {/* ========================================================= */}
        {/* ========================================================= */}
        {/* 🌟 BRANDED POSTER IMAGES (PAGE 1 & PAGE 2 IN SEQUENCE) 🌟 */}
        {/* ========================================================= */}
        {(() => {
          let posterPages = [];
          if (Array.isArray(hukamnama.poster_pages) && hukamnama.poster_pages.length > 0) {
            posterPages = hukamnama.poster_pages;
          } else if (hukamnama.source_image) {
            const p1 = hukamnama.source_image.replace('-2.jpg', '-1.jpg');
            posterPages = [p1];
          }

          if (posterPages.length === 0) return null;
          const totalPages = posterPages.length;

          return (
            <div className="px-4 sm:px-8 pt-5 pb-6 bg-gradient-to-b from-white via-gold-50/15 to-white border-b border-gold-100/80">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-gold-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold-800 font-serif-heading">
                    {totalPages === 1
                      ? "Daily Hukamnama Sahib Branded Poster"
                      : `Daily Hukamnama Sahib Branded Posters (${totalPages} Pages)`}
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-2 no-print">
                  {posterPages.map((pageUrl, idx) => (
                    <a
                      key={idx}
                      href={pageUrl}
                      download={`daily-hukamnama-${hukamnama.hukamnama_date || 'today'}-page-${idx + 1}.jpg`}
                      className="inline-flex items-center space-x-1 text-xs font-medium text-gold-800 hover:text-gold-900 bg-gold-50 hover:bg-gold-100 border border-gold-200 px-3 py-1.5 rounded-lg shadow-sm transition"
                      title={totalPages === 1 ? "Download Poster" : `Download Page ${idx + 1} Poster`}
                    >
                      <Download className="w-3.5 h-3.5 text-gold-600" />
                      <span>{totalPages === 1 ? "Download Poster" : `Download Page ${idx + 1}`}</span>
                    </a>
                  ))}
                  <button
                    onClick={() => setIsImageCollapsed(!isImageCollapsed)}
                    className="p-1.5 text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                    title={isImageCollapsed ? 'Expand Posters' : 'Collapse Posters'}
                  >
                    {isImageCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isImageCollapsed && (
                <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                  {posterPages.map((pageUrl, idx) => {
                    const pageNum = idx + 1;
                    const gurNum = pageNum === 1 ? '੧' : pageNum === 2 ? '੨' : pageNum === 3 ? '੩' : pageNum;
                    const pageBadge = totalPages === 1
                      ? "ਸੰਪੂਰਨ ਮੁੱਖਵਾਕ, ਵਿਆਖਿਆ ਅਤੇ English Translation"
                      : `ਪੰਨਾ ${gurNum} (Page ${pageNum})`;

                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-xs font-bold text-gold-900 bg-gold-100/90 border border-gold-300/80 px-3 py-1 rounded-full shadow-xs">
                            {pageBadge}
                          </span>
                          <span className="text-[11px] text-slate-400 no-print">Click image to enlarge</span>
                        </div>
                        <div 
                          className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-gold-300/90 bg-white group cursor-pointer transition-shadow"
                          onClick={() => { setSelectedLightboxImage(pageUrl); setShowImageLightbox(true); }}
                        >
                          <div className="relative w-full flex items-center justify-center bg-stone-50">
                            <img
                              src={pageUrl}
                              alt={
                                hukamnama.image_alt
                                  ? `${hukamnama.image_alt}${totalPages > 1 ? ` - Page ${pageNum}` : ''}`
                                  : `${hukamnama.title || "Daily Hukamnama Poster"} - Page ${pageNum}`
                              }
                              className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.008]"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 no-print">
                              <span className="bg-slate-900/85 text-white text-xs px-3.5 py-1.5 rounded-full font-medium shadow-md flex items-center space-x-1.5 backdrop-blur-sm">
                                <Maximize2 className="w-3.5 h-3.5 text-gold-400" />
                                <span>Click to enlarge {totalPages === 1 ? "Poster" : `Page ${pageNum}`}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* Toolbar: Font resize, view mode filters, copy, print, share */}
        <div className="bg-slate-50/90 px-4 sm:px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
          {/* View Mode Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'all'
                  ? 'bg-gold-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              ਸਭ ਕੁਝ (Lines + All Translations)
            </button>
            <button
              onClick={() => setViewMode('lines_only')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'lines_only'
                  ? 'bg-gold-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              ਸਿਰਫ਼ ਤੁਕਾਂ (Only Lines)
            </button>
            <button
              onClick={() => setViewMode('punjabi')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'punjabi'
                  ? 'bg-gold-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              ਪੰਜਾਬੀ ਵਿਆਖਿਆ
            </button>
            <button
              onClick={() => setViewMode('english')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'english'
                  ? 'bg-gold-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setViewMode('hindi')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'hindi'
                  ? 'bg-gold-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Action icons */}
          <div className="flex items-center space-x-2">
            {/* Font resize buttons */}
            <div className="inline-flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
              <button
                onClick={() => setFontSize((prev) => Math.max(16, prev - 2))}
                aria-label="Decrease font size"
                title="Decrease font size"
                className="p-1.5 text-slate-600 hover:text-gold-600 hover:bg-slate-100 rounded"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-semibold text-slate-600 px-1">
                {fontSize}px
              </span>
              <button
                onClick={() => setFontSize((prev) => Math.min(32, prev + 2))}
                aria-label="Increase font size"
                title="Increase font size"
                className="p-1.5 text-slate-600 hover:text-gold-600 hover:bg-slate-100 rounded"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="inline-flex items-center space-x-1 bg-white border border-slate-200 hover:border-gold-300 text-slate-700 hover:text-gold-700 text-xs px-2.5 py-1.5 rounded-lg shadow-sm transition"
              title="Copy Hukamnama Text"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-green-700 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="p-1.5 bg-white border border-slate-200 hover:border-gold-300 text-slate-600 hover:text-gold-600 rounded-lg shadow-sm transition"
              title="Print Hukamnama"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Share Button (Multi-platform: WhatsApp, Facebook, X, Instagram, Threads, TikTok) */}
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
              title="Share Hukamnama on WhatsApp, Facebook, Instagram, X, Threads, TikTok"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">Share</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 🌟 VERSE-BY-VERSE (LINE-BY-LINE) SACRED PRESENTATION 🌟 */}
        {/* ========================================================= */}
        {/* text align center */}
        <div className="p-6 sm:p-10 space-y-6" style={{ textAlign: 'center' }}>
          {verses && verses.length > 0 ? (
            verses.map((verse, idx) => (
              <div 
                key={idx}
                className="py-5 border-b border-slate-200/90 last:border-b-0 space-y-3"
              >
                {/* 1. Gurmukhi Holy Line (ਪੰਕਤੀ) */}
                {verse.gurmukhi && (
                  <p 
                    className="font-gurmukhi font-bold text-slate-950 leading-relaxed tracking-wide"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {verse.gurmukhi}
                  </p>
                )}

                {/* 2. Hindi Script Transliteration */}
                {verse.hindi && (
                  <p 
                    className="text-slate-800 font-medium leading-relaxed"
                    style={{ fontSize: `${Math.max(15, fontSize - 2)}px` }}
                  >
                    {verse.hindi}
                  </p>
                )}

                {/* 3. English Romanized Transliteration */}
                {verse.englishTranslit && (
                  <p 
                    className="text-slate-600 italic font-serif leading-relaxed"
                    style={{ fontSize: `${Math.max(14, fontSize - 4)}px` }}
                  >
                    {verse.englishTranslit}
                  </p>
                )}

                {/* 4. Punjabi Viakhya (ਅਰਥ) */}
                {(viewMode === 'all' || viewMode === 'punjabi') && verse.punjabiArth && (
                  <p 
                    className="font-gurmukhi text-amber-900 leading-relaxed pt-1"
                    style={{ fontSize: `${Math.max(15, fontSize - 3)}px` }}
                  >
                    {verse.punjabiArth}
                  </p>
                )}

                {/* 5. Hindi Explanation (हिन्दी अर्थ) */}
                {(viewMode === 'all' || viewMode === 'hindi') && verse.hindiArth && (
                  <p 
                    className="text-orange-950 leading-relaxed"
                    style={{ fontSize: `${Math.max(14, fontSize - 4)}px` }}
                  >
                    {verse.hindiArth}
                  </p>
                )}

                {/* 6. English Translation (Meaning) */}
                {(viewMode === 'all' || viewMode === 'english') && verse.englishTrans && (
                  <p 
                    className="text-slate-700 font-serif leading-relaxed"
                    style={{ fontSize: `${Math.max(14, fontSize - 4)}px` }}
                  >
                    {verse.englishTrans}
                  </p>
                )}

                {/* 7. Line Citation / Reference */}
                {verse.citation && (
                  <p className="text-xs text-slate-400 font-sans pt-1 select-none">
                    {verse.citation}
                  </p>
                )}
              </div>
            ))
          ) : (
            // Fallback display if verses array is empty
            <div className="space-y-6">
              {hukamnama.gurmukhi_only && (
                <div className="font-gurmukhi font-semibold text-slate-900 whitespace-pre-line text-lg leading-loose">
                  {hukamnama.gurmukhi_only}
                </div>
              )}
              {hukamnama.punjabi_arth && (
                <div className="font-gurmukhi text-amber-900 whitespace-pre-line text-base leading-relaxed pt-4 border-t">
                  {hukamnama.punjabi_arth}
                </div>
              )}
              {hukamnama.english_translation && (
                <div className="text-slate-700 font-serif whitespace-pre-line text-base leading-relaxed pt-4 border-t">
                  {hukamnama.english_translation}
                </div>
              )}
              {hukamnama.hindi_translation && (
                <div className="text-orange-950 whitespace-pre-line text-base leading-relaxed pt-4 border-t">
                  {hukamnama.hindi_translation}
                </div>
              )}
            </div>
          )}

          {/* Salutation & Official SGPC link */}
          <div className="text-center pt-8 border-t border-slate-200 space-y-2">
            <p className="font-gurmukhi text-lg font-bold text-gold-700 tracking-wider">
              ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ ॥<br />
              ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਹਿ ॥
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-slate-500 pt-2">
              <span>Source: SGPC Amritsar</span>
              <span>•</span>
              <a 
                href="https://sgpc.net/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-gold-600 hover:text-gold-700 font-medium underline"
              >
                <span>https://sgpc.net/</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Full Image Zoom */}
      {showImageLightbox && (() => {
        let posterPages = [];
        if (Array.isArray(hukamnama.poster_pages) && hukamnama.poster_pages.length > 0) {
          posterPages = hukamnama.poster_pages;
        } else if (hukamnama.source_image) {
          const p1 = hukamnama.source_image.replace('-2.jpg', '-1.jpg');
          posterPages = [p1];
        }

        if (posterPages.length === 0) return null;

        const currentSrc = selectedLightboxImage || posterPages[0];
        const currentIndex = Math.max(0, posterPages.indexOf(currentSrc));

        return (
          <div 
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowImageLightbox(false)}
          >
            <div className="relative max-w-4xl w-full max-h-[95vh] flex flex-col items-center">
              <div className="w-full flex flex-wrap items-center justify-between text-white pb-3 gap-2">
                <span className="text-sm font-semibold">{hukamnama.title}</span>

                {/* Multi-page selector buttons inside lightbox if multiple pages */}
                {posterPages.length > 1 && (
                  <div className="inline-flex rounded-lg bg-white/10 p-0.5 border border-white/20" onClick={(e) => e.stopPropagation()}>
                    {posterPages.map((pUrl, pIdx) => {
                      const isActive = pUrl === currentSrc;
                      const pageNum = pIdx + 1;
                      const gurNum = pageNum === 1 ? '੧' : pageNum === 2 ? '੨' : pageNum === 3 ? '੩' : pageNum;
                      return (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => setSelectedLightboxImage(pUrl)}
                          className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                            isActive ? 'bg-gold-500 text-white shadow-sm' : 'text-white/80 hover:bg-white/10'
                          }`}
                        >
                          ਪੰਨਾ {gurNum} (Page {pageNum})
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <a
                    href={currentSrc}
                    download={`daily-hukamnama-${hukamnama.hukamnama_date || 'today'}-page-${currentIndex + 1}.jpg`}
                    className="inline-flex items-center space-x-1 text-xs bg-gold-500 hover:bg-gold-600 text-white px-3 py-1.5 rounded-lg shadow"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download {posterPages.length > 1 ? `Page ${currentIndex + 1}` : 'Poster'} HD</span>
                  </a>
                  <button
                    onClick={() => setShowImageLightbox(false)}
                    className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div 
                className="relative overflow-auto max-h-[85vh] rounded-xl bg-white p-2"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={currentSrc}
                  alt={
                    hukamnama.image_alt
                      ? `${hukamnama.image_alt}${posterPages.length > 1 ? ` - Page ${currentIndex + 1}` : ''}`
                      : `${hukamnama.title} - Page ${currentIndex + 1}`
                  }
                  className="max-h-[80vh] w-auto mx-auto object-contain rounded"
                />
              </div>
            </div>
          </div>
        );
      })()}

      {/* 🌸 MULTI-PLATFORM SOCIAL SHARE MODAL 🌸 */}
      {showShareModal && (() => {
        const { url } = getShareDetails();
        const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

        return (
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <div 
              className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gold-200 overflow-hidden animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative Top Bar */}
              <div className="h-2 bg-gradient-to-r from-gold-400 via-amber-500 to-gold-600" />

              <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-700">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-serif-heading">
                        Share Daily Hukamnama
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Sachkhand Sri Harmandir Sahib Amritsar {dateFormatted ? `• ${dateFormatted}` : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Toast message if Instagram or TikTok clicked */}
                {shareAlertMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{shareAlertMessage}</span>
                  </div>
                )}

                {/* Quick Copy Link Box */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Hukamnama Web Link
                  </label>
                  <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-gold-500 focus-within:bg-white transition">
                    <input
                      type="text"
                      readOnly
                      value={url}
                      className="w-full px-3 py-2 text-xs font-mono text-slate-700 bg-transparent outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyShareUrl}
                      className={`px-3.5 py-2 text-xs font-semibold flex items-center space-x-1.5 transition ${
                        shareCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gold-500 hover:bg-gold-600 text-white'
                      }`}
                    >
                      {shareCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Social Share Grid */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                    Share directly to social platforms
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* 1. WhatsApp */}
                    <button
                      type="button"
                      onClick={() => handleSharePlatform('whatsapp')}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-800 hover:scale-[1.02] transition shadow-xs group"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-sm mb-1.5 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.53 1.771.82 2.791.82 3.182 0 5.769-2.587 5.769-5.766.001-3.182-2.585-5.766-5.769-5.766zm3.374 8.204c-.145.409-.844.757-1.189.789-.344.032-.782.148-2.502-.566-1.442-.598-2.389-2.046-2.46-2.142-.072-.096-.583-.775-.583-1.479 0-.703.367-1.05.498-1.193.13-.143.287-.179.383-.179.095 0 .191.002.274.006.088.005.206-.034.321.244.12.289.41 1.001.447 1.074.036.073.06.158.012.253-.048.096-.072.155-.143.239-.072.084-.15.187-.215.251-.072.072-.147.15-.063.294.084.144.373.615.8 1 .552.496 1.018.65 1.162.723.144.072.228.06.313-.036.084-.096.36-419.456-.563.096-.144.192-.12.324-.072.132.048.844.398.989.47.144.072.24.108.276.168.036.06.036.349-.109.758zM12.016 2.072c-5.518 0-9.997 4.478-9.997 9.997 0 1.763.459 3.486 1.332 5.006L2 22l5.068-1.328a9.96 9.96 0 0 0 4.948 1.303c5.518 0 9.997-4.479 9.997-9.998 0-5.519-4.479-9.997-9.997-9.997zm0 18.215c-1.579 0-3.118-.42-4.469-1.214l-.32-.189-3.32.871.886-3.234-.208-.33a8.18 8.18 0 0 1-1.258-4.326c0-4.526 3.682-8.208 8.209-8.208 4.527 0 8.209 3.682 8.209 8.208 0 4.527-3.682 8.209-8.209 8.209z"/>
                        </svg>
                      </div>
                      <span className="text-xs font-bold">WhatsApp</span>
                    </button>

                    {/* 2. Facebook */}
                    <button
                      type="button"
                      onClick={() => handleSharePlatform('facebook')}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/80 text-blue-800 hover:scale-[1.02] transition shadow-xs group"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-sm mb-1.5 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      <span className="text-xs font-bold">Facebook</span>
                    </button>

                    {/* 3. X (Twitter) */}
                    <button
                      type="button"
                      onClick={() => handleSharePlatform('twitter')}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 hover:scale-[1.02] transition shadow-xs group"
                    >
                      <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shadow-sm mb-1.5 group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </div>
                      <span className="text-xs font-bold">X (Twitter)</span>
                    </button>

                    {/* 4. Threads */}
                    <button
                      type="button"
                      onClick={() => handleSharePlatform('threads')}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 hover:scale-[1.02] transition shadow-xs group"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#101010] text-white flex items-center justify-center shadow-sm mb-1.5 group-hover:scale-110 transition-transform">
                        <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12.186 24C5.467 24 0 18.533 0 11.814 0 5.094 5.467 0 12.186 0c6.643 0 11.966 5.253 12.18 11.888h-2.585c-.21-5.21-4.42-9.303-9.595-9.303-5.293 0-9.6 4.307-9.6 9.6s4.307 9.6 9.6 9.6c3.42 0 6.435-1.794 8.118-4.496l2.167 1.442C20.177 22.04 16.42 24 12.186 24zm4.279-10.74a4.343 4.343 0 0 0-4.32-3.79c-2.398 0-4.349 1.951-4.349 4.349 0 2.398 1.951 4.349 4.349 4.349 1.737 0 3.242-1.026 3.929-2.502l2.36.944a6.93 6.93 0 0 1-6.289 4.143c-3.832 0-6.934-3.102-6.934-6.934 0-3.832 3.102-6.934 6.934-6.934 3.738 0 6.786 2.95 6.924 6.657l-.004.091a9.23 9.23 0 0 1-.225 2.126l-2.45-.694c.05-.445.076-.902.076-1.371l-.024-.268z"/>
                        </svg>
                      </div>
                      <span className="text-xs font-bold">Threads</span>
                    </button>

                    {/* 5. Instagram */}
                    <button
                      type="button"
                      onClick={() => handleSharePlatform('instagram')}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-pink-50/80 hover:bg-pink-100/80 border border-pink-200/80 text-pink-900 hover:scale-[1.02] transition shadow-xs group"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-sm mb-1.5 group-hover:scale-110 transition-transform">
                        <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      <span className="text-xs font-bold">Instagram</span>
                    </button>

                    {/* 6. TikTok */}
                    <button
                      type="button"
                      onClick={() => handleSharePlatform('tiktok')}
                      className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 hover:scale-[1.02] transition shadow-xs group"
                    >
                      <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shadow-sm mb-1.5 group-hover:scale-110 transition-transform">
                        <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.88-4.49V8.65a8.28 8.28 0 0 0 4.89 1.58V6.8a4.87 4.87 0 0 1-1-.11z"/>
                        </svg>
                      </div>
                      <span className="text-xs font-bold">TikTok</span>
                    </button>
                  </div>
                </div>

                {/* Device Native Share option if available */}
                {hasNativeShare && (
                  <button
                    type="button"
                    onClick={() => handleSharePlatform('native')}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>More Sharing Options (Device System Share)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
