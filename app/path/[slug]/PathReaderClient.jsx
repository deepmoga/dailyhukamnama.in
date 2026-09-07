'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { 
  BookOpen, 
  ChevronLeft, 
  ZoomIn, 
  ZoomOut, 
  Copy, 
  Check, 
  Printer, 
  Share2, 
  Sparkles,
  Clock,
  Play,
  Pause
} from 'lucide-react';

export default function PathReaderClient({ path }) {
  const [fontSize, setFontSize] = useState(22);
  const [copied, setCopied] = useState(false);
  const [showTranslit, setShowTranslit] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);

  const handleCopy = () => {
    let fullText = `${path.title} (${path.punjabiTitle})\n\n`;
    path.verses.forEach((v) => {
      fullText += `${v.gurmukhi}\n${v.punjabi}\n${v.english}\n\n`;
    });
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbf7]">
      <Header />

      {/* Hero Header */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-spiritual-navy text-white py-12 px-4 sm:px-6 lg:px-8 border-b-2 border-gold-500">
        <div className="max-w-4xl mx-auto space-y-3">
          <Link
            href="/path"
            className="inline-flex items-center space-x-1 text-xs text-gold-400 hover:text-gold-300 font-medium transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All Paths</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gold-400 bg-gold-500/20 px-3 py-1 rounded-full border border-gold-400/30 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{path.timeOfDay}</span>
            </span>
            <span className="text-xs text-slate-300 font-medium">
              Composed by {path.author}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-serif-heading">
            {path.title}
          </h1>
          <p className="font-gurmukhi text-2xl font-bold text-gold-300">
            {path.punjabiTitle}
          </p>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-light">
            {path.description}
          </p>
        </div>
      </section>

      {/* Reader Controls Bar */}
      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur border-b border-gold-200 shadow-sm px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* View Toggles */}
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setShowTranslit(!showTranslit)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                showTranslit ? 'bg-gold-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Transliteration
            </button>
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                showTranslation ? 'bg-gold-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Translation / Arth
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-2">
            {/* Font Size */}
            <div className="inline-flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5">
              <button
                onClick={() => setFontSize((p) => Math.max(16, p - 2))}
                className="p-1 text-slate-600 hover:text-gold-600 rounded"
                title="Decrease font size"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-semibold text-slate-700 px-1">{fontSize}px</span>
              <button
                onClick={() => setFontSize((p) => Math.min(36, p + 2))}
                className="p-1 text-slate-600 hover:text-gold-600 rounded"
                title="Increase font size"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Copy */}
            <button
              onClick={handleCopy}
              className="inline-flex items-center space-x-1 text-xs bg-white border border-slate-200 hover:border-gold-300 text-slate-700 px-2.5 py-1.5 rounded-lg shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Print */}
            <button
              onClick={() => window.print()}
              className="p-1.5 bg-white border border-slate-200 hover:border-gold-300 text-slate-600 rounded-lg shadow-sm"
              title="Print Path"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Path Verses */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="bg-white rounded-2xl shadow-md border border-gold-200 p-6 sm:p-10 space-y-8">
          {path.verses && path.verses.length > 0 ? (
            path.verses.map((verse, idx) => (
              <div key={idx} className="space-y-3 pb-6 border-b border-slate-100 last:border-b-0">
                {/* Gurmukhi Line */}
                <p
                  className="font-gurmukhi font-bold text-slate-900 leading-loose text-center sm:text-left"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {verse.gurmukhi}
                </p>

                {/* English Transliteration */}
                {showTranslit && verse.translit && (
                  <p className="text-slate-600 text-sm font-serif italic leading-relaxed">
                    {verse.translit}
                  </p>
                )}

                {/* Punjabi Viakhya */}
                {showTranslation && verse.punjabi && (
                  <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 text-amber-950 font-gurmukhi text-sm sm:text-base leading-relaxed">
                    <span className="font-bold block text-xs text-amber-800 mb-1">ਪੰਜਾਬੀ ਅਰਥ:</span>
                    {verse.punjabi}
                  </div>
                )}

                {/* English Translation */}
                {showTranslation && verse.english && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800 text-sm leading-relaxed font-serif">
                    <span className="font-bold block text-xs text-slate-500 uppercase tracking-wider mb-1">English Meaning:</span>
                    {verse.english}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-slate-400">Content loading...</p>
          )}

          {/* Bottom salutation */}
          <div className="text-center pt-8 border-t border-slate-200 space-y-2">
            <p className="font-gurmukhi text-xl font-bold text-gold-700">
              ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ ॥ ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਹਿ ॥
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
