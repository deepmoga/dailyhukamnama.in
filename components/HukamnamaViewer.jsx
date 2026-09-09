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

  const handleShare = () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://dailyhukamnama.in';
    const text = `Today's Daily Hukamnama from Sri Darbar Sahib: ${shareUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const dateFormatted = hukamnama.hukamnama_date 
    ? new Date(hukamnama.hukamnama_date).toLocaleDateString('en-US', {
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
                {hukamnama.hukamnama_date 
                  ? new Date(hukamnama.hukamnama_date).toLocaleDateString('en-US', {
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
        {hukamnama.source_image && (() => {
          const posterPage1 = hukamnama.source_image.replace('-2.jpg', '-1.jpg');
          const posterPage2 = hukamnama.source_image.includes('-1.jpg') 
            ? hukamnama.source_image.replace('-1.jpg', '-2.jpg') 
            : hukamnama.source_image.replace('.jpg', '-2.jpg');

          return (
            <div className="px-4 sm:px-8 pt-5 pb-6 bg-gradient-to-b from-white via-gold-50/15 to-white border-b border-gold-100/80">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-gold-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold-800 font-serif-heading">
                    Daily Hukamnama Sahib Branded Posters
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-2 no-print">
                  <a
                    href={posterPage1}
                    download={`daily-hukamnama-${hukamnama.hukamnama_date || 'today'}-page-1.jpg`}
                    className="inline-flex items-center space-x-1 text-xs font-medium text-gold-800 hover:text-gold-900 bg-gold-50 hover:bg-gold-100 border border-gold-200 px-3 py-1.5 rounded-lg shadow-sm transition"
                    title="Download Page 1 Poster"
                  >
                    <Download className="w-3.5 h-3.5 text-gold-600" />
                    <span>Download Page 1</span>
                  </a>
                  <a
                    href={posterPage2}
                    download={`daily-hukamnama-${hukamnama.hukamnama_date || 'today'}-page-2.jpg`}
                    className="inline-flex items-center space-x-1 text-xs font-medium text-gold-800 hover:text-gold-900 bg-gold-50 hover:bg-gold-100 border border-gold-200 px-3 py-1.5 rounded-lg shadow-sm transition"
                    title="Download Page 2 Poster"
                  >
                    <Download className="w-3.5 h-3.5 text-gold-600" />
                    <span>Download Page 2</span>
                  </a>
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
                <div className="flex flex-col gap-6 max-w-3xl mx-auto">
                  {/* First Image: Page 1 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold text-gold-900 bg-gold-100/90 border border-gold-300/80 px-3 py-1 rounded-full shadow-xs">
                        ਪੰਨਾ ੧ : ਮੁੱਖਵਾਕ ਅਤੇ ਵਿਆਖਿਆ (Page 1)
                      </span>
                      <span className="text-[11px] text-slate-400 no-print">Click image to enlarge</span>
                    </div>
                    <div 
                      className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-gold-300/90 bg-white group cursor-pointer transition-shadow"
                      onClick={() => { setSelectedLightboxImage(posterPage1); setShowImageLightbox(true); }}
                    >
                      <div className="relative w-full flex items-center justify-center bg-stone-50">
                        <img
                          src={posterPage1}
                          alt={`${hukamnama.title || "Daily Hukamnama Poster"} - Page 1`}
                          className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.008]"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 no-print">
                          <span className="bg-slate-900/85 text-white text-xs px-3.5 py-1.5 rounded-full font-medium shadow-md flex items-center space-x-1.5 backdrop-blur-sm">
                            <Maximize2 className="w-3.5 h-3.5 text-gold-400" />
                            <span>Click to enlarge Page 1</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Second Image: Page 2 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold text-gold-900 bg-gold-100/90 border border-gold-300/80 px-3 py-1 rounded-full shadow-xs">
                        ਪੰਨਾ ੨ : ਵਿਆਖਿਆ ਅਤੇ English Translation (Page 2)
                      </span>
                      <span className="text-[11px] text-slate-400 no-print">Click image to enlarge</span>
                    </div>
                    <div 
                      className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-gold-300/90 bg-white group cursor-pointer transition-shadow"
                      onClick={() => { setSelectedLightboxImage(posterPage2); setShowImageLightbox(true); }}
                    >
                      <div className="relative w-full flex items-center justify-center bg-stone-50">
                        <img
                          src={posterPage2}
                          alt={`${hukamnama.title || "Daily Hukamnama Poster"} - Page 2`}
                          className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.008]"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 no-print">
                          <span className="bg-slate-900/85 text-white text-xs px-3.5 py-1.5 rounded-full font-medium shadow-md flex items-center space-x-1.5 backdrop-blur-sm">
                            <Maximize2 className="w-3.5 h-3.5 text-gold-400" />
                            <span>Click to enlarge Page 2</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
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

            {/* WhatsApp Share */}
            <button
              onClick={handleShare}
              className="inline-flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-sm transition"
              title="Share on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 🌟 VERSE-BY-VERSE (LINE-BY-LINE) SACRED PRESENTATION 🌟 */}
        {/* ========================================================= */}
        <div className="p-6 sm:p-10 space-y-6">
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
                href="https://hs.sgpc.net/hukamnamapdf.php" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-gold-600 hover:text-gold-700 font-medium underline"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Official SGPC PDF</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Full Image Zoom */}
      {showImageLightbox && hukamnama.source_image && (() => {
        const posterPage1 = hukamnama.source_image.replace('-2.jpg', '-1.jpg');
        const posterPage2 = hukamnama.source_image.includes('-1.jpg') 
          ? hukamnama.source_image.replace('-1.jpg', '-2.jpg') 
          : hukamnama.source_image.replace('.jpg', '-2.jpg');
        const currentSrc = selectedLightboxImage || posterPage1;
        const isPage2 = currentSrc === posterPage2;

        return (
          <div 
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowImageLightbox(false)}
          >
            <div className="relative max-w-4xl w-full max-h-[95vh] flex flex-col items-center">
              <div className="w-full flex flex-wrap items-center justify-between text-white pb-3 gap-2">
                <span className="text-sm font-semibold">{hukamnama.title}</span>

                {/* Page 1 / 2 toggle inside lightbox */}
                <div className="inline-flex rounded-lg bg-white/10 p-0.5 border border-white/20" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setSelectedLightboxImage(posterPage1)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                      !isPage2 ? 'bg-gold-500 text-white shadow-sm' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    ਪੰਨਾ ੧ (Page 1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLightboxImage(posterPage2)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                      isPage2 ? 'bg-gold-500 text-white shadow-sm' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    ਪੰਨਾ ੨ (Page 2)
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <a
                    href={currentSrc}
                    download={`daily-hukamnama-${hukamnama.hukamnama_date || 'today'}-page-${isPage2 ? '2' : '1'}.jpg`}
                    className="inline-flex items-center space-x-1 text-xs bg-gold-500 hover:bg-gold-600 text-white px-3 py-1.5 rounded-lg shadow"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download {isPage2 ? 'Page 2' : 'Page 1'} HD</span>
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
                  alt={`${hukamnama.title} - ${isPage2 ? 'Page 2' : 'Page 1'}`}
                  className="max-h-[80vh] w-auto mx-auto object-contain rounded"
                />
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
