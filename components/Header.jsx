'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Menu, 
  X, 
  ChevronDown, 
  Radio, 
  Share2, 
  Calendar as CalendarIcon,
  Sparkles,
  PhoneCall,
  Volume2
} from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sikhGurusOpen, setSikhGurusOpen] = useState(false);
  const [pathOpen, setPathOpen] = useState(false);
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [dbPaths, setDbPaths] = useState([]);

  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setCurrentDateStr(formatted);

    // Fetch dynamic paths created in admin
    async function loadPaths() {
      try {
        const res = await fetch('/api/public/paths');
        const data = await res.json();
        if (data.paths && data.paths.length > 0) {
          setDbPaths(data.paths);
        }
      } catch (err) {
        // use fallback
      }
    }
    loadPaths();
  }, []);

  const sikhGurusList = [
    { name: 'Guru Nanak Dev Ji', dates: '1469-1539', href: '/sikh-gurus/guru-nanak-dev-ji' },
    { name: 'Guru Angad Dev Ji', dates: '1504-1552', href: '/sikh-gurus/guru-angad-dev-ji' },
    { name: 'Guru Amar Das Ji', dates: '1479-1574', href: '/sikh-gurus/guru-amar-das-ji' },
    { name: 'Guru Ram Das Ji', dates: '1534-1581', href: '/sikh-gurus/guru-ram-das-ji' },
    { name: 'Guru Arjan Dev Ji', dates: '1563-1606', href: '/sikh-gurus/guru-arjan-dev-ji' },
    { name: 'Guru Har Gobind Ji', dates: '1595-1644', href: '/sikh-gurus/guru-har-gobind-ji' },
    { name: 'Guru Har Rai Ji', dates: '1630-1661', href: '/sikh-gurus/guru-har-rai-ji' },
    { name: 'Guru Har Krishan Ji', dates: '1656-1664', href: '/sikh-gurus/guru-har-krishan-ji' },
    { name: 'Guru Teg Bahadar Ji', dates: '1621-1675', href: '/sikh-gurus/guru-teg-bahadar-ji' },
    { name: 'Guru Gobind Singh Ji', dates: '1666-1708', href: '/sikh-gurus/guru-gobind-singh-ji' },
    { name: 'Sri Guru Granth Sahib Ji', dates: 'Eternal Living Guru', href: '/sikh-gurus/sri-guru-granth-sahib-ji' },
  ];

  const defaultPathList = [
    { name: 'Japji Sahib', punjabi: 'ਜਪੁਜੀ ਸਾਹਿਬ', href: '/japji-sahib-in-punjabi-gurmukhi' },
    { name: 'Jaap Sahib', punjabi: 'ਜਾਪੁ ਸਾਹਿਬ', href: '/path/jaap-sahib' },
    { name: 'Tav Prasad Savaiye', punjabi: 'ਤ੍ਵ ਪ੍ਰਸਾਦਿ ਸਵਯੇ', href: '/path/tav-prasad-savaiye' },
    { name: 'Chaupai Sahib', punjabi: 'ਚੌਪਈ ਸਾਹਿਬ', href: '/path/chaupai-sahib' },
    { name: 'Anand Sahib', punjabi: 'ਅਨੰਦੁ ਸਾਹਿਬ', href: '/path/anand-sahib' },
    { name: 'Rehras Sahib', punjabi: 'ਰਹਿਰਾਸ ਸਾਹਿਬ', href: '/path/rehras-sahib' },
    { name: 'Kirtan Sohila', punjabi: 'ਕੀਰਤਨ ਸੋਹਿਲਾ', href: '/path/kirtan-sohila' },
    { name: 'Sukhmani Sahib', punjabi: 'ਸੁਖਮਨੀ ਸਾਹਿਬ', href: '/path/sukhmani-sahib' },
    { name: 'Dukh Bhanjani Sahib', punjabi: 'ਦੁਖ ਭੰਜਨੀ ਸਾਹਿਬ', href: '/path/dukh-bhanjani-sahib' },
    { name: 'Asa Di Vaar', punjabi: 'ਆਸਾ ਦੀ ਵਾਰ', href: '/path/asa-di-vaar' },
  ];

  const effectivePaths = dbPaths.length > 0
    ? dbPaths.map((p) => ({
        name: p.title,
        punjabi: p.punjabi_title || '',
        href: `/${p.slug}`,
      }))
    : defaultPathList;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-sm border-b border-gold-200">
      {/* Top sacred announcement bar */}
      <div className="bg-gradient-to-r from-spiritual-navy via-slate-900 to-spiritual-navy text-white text-xs py-2 px-4 border-b border-gold-500/30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 font-gurmukhi text-gold-300">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span className="tracking-wide">ੴ ਸਤਿਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-300">
            <span className="hidden md:inline-flex items-center text-slate-200">
              <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-gold-400" />
              {currentDateStr || 'Today'}
            </span>
            <div className="inline-flex items-center space-x-1.5 bg-red-600/80 text-white px-2 py-0.5 rounded-full text-[11px] font-medium tracking-wide animate-pulse">
              <Radio className="w-3 h-3" />
              <span>LIVE KIRTAN SRI HARIMANDIR SAHIB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo on the left */}
          <Link href="/" className="flex items-center space-x-3 group py-2">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 transition-transform group-hover:scale-105">
              <Image 
                src="/logo.png" 
                alt="Daily Hukamnama Logo" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif-heading text-xl sm:text-2xl font-bold tracking-tight text-slate-900 group-hover:text-gold-600 transition-colors">
                DAILY HUKAMNAMA
              </span>
              <span className="text-xs font-medium text-gold-700 tracking-wider font-gurmukhi">
                ਸ੍ਰੀ ਦਰਬਾਰ ਸਾਹਿਬ, ਅੰਮ੍ਰਿਤਸਰ
              </span>
            </div>
          </Link>

          {/* Desktop Navigation on the right */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            <Link 
              href="/" 
              className="px-3.5 py-2 text-sm font-semibold text-gold-600 rounded-md hover:bg-gold-50 transition-colors"
            >
              Home
            </Link>

            <Link 
              href="/about-hukam" 
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-gold-600 rounded-md hover:bg-gold-50/60 transition-colors"
            >
              About Hukamnama
            </Link>

            <Link 
              href="/calender" 
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-gold-600 rounded-md hover:bg-gold-50/60 transition-colors"
            >
              Calendar
            </Link>

            {/* Sikh Gurus Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setSikhGurusOpen(true)}
              onMouseLeave={() => setSikhGurusOpen(false)}
            >
              <Link
                href="/sikh-gurus"
                className="px-3.5 py-2 text-sm font-medium text-slate-700 group-hover:text-gold-600 rounded-md flex items-center space-x-1 transition-colors"
              >
                <span>Sikh Gurus</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${sikhGurusOpen ? 'rotate-180 text-gold-600' : ''}`} />
              </Link>

              {sikhGurusOpen && (
                <div className="absolute left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gold-200 py-2 z-50 animate-fadeIn">
                  <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold-700 border-b border-gold-100 flex items-center justify-between">
                    <span>Ten Guru Sahiban</span>
                    <Link href="/sikh-gurus" className="text-[10px] text-gold-600 hover:underline">View All</Link>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {sikhGurusList.map((guru, index) => (
                      <Link 
                        key={index} 
                        href={guru.href}
                        className="block px-4 py-2 text-xs hover:bg-gold-50 transition-colors group/item"
                      >
                        <div className="font-medium text-slate-800 group-hover/item:text-gold-600">
                          {guru.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {guru.dates}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Path Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setPathOpen(true)}
              onMouseLeave={() => setPathOpen(false)}
            >
              <Link
                href="/path"
                className="px-3.5 py-2 text-sm font-medium text-slate-700 group-hover:text-gold-600 rounded-md flex items-center space-x-1 transition-colors"
              >
                <span>Path</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${pathOpen ? 'rotate-180 text-gold-600' : ''}`} />
              </Link>

              {pathOpen && (
                <div className="absolute left-0 mt-1 w-60 bg-white rounded-xl shadow-xl border border-gold-200 py-2 z-50">
                  <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold-700 border-b border-gold-100 flex items-center justify-between">
                    <span>Nitnem & Gurbani</span>
                    <Link href="/path" className="text-[10px] text-gold-600 hover:underline">View All</Link>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {effectivePaths.map((item, index) => (
                      <Link 
                        key={index} 
                        href={item.href}
                        className="flex items-center justify-between px-4 py-2 text-xs hover:bg-gold-50 transition-colors group/item"
                      >
                        <span className="font-medium text-slate-800 group-hover/item:text-gold-600">
                          {item.name}
                        </span>
                        <span className="text-[11px] font-gurmukhi text-slate-400">
                          {item.punjabi}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link 
              href="/volunteers" 
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-gold-600 rounded-md hover:bg-gold-50/60 transition-colors"
            >
              Volunteers
            </Link>

            <Link 
              href="/contact-us" 
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-gold-600 rounded-md hover:bg-gold-50/60 transition-colors"
            >
              Contact Us
            </Link>

            {/* Daily Hukamnama Button */}
            <a 
              href="#hukamnama-view"
              className="ml-2 inline-flex items-center space-x-1.5 bg-gold-500 hover:bg-gold-600 text-white font-medium text-xs px-4 py-2.5 rounded-full shadow-sm hover:shadow transition-all duration-200"
            >
              <span>Today&apos;s Hukamnama</span>
            </a>
          </nav>

          {/* Mobile hamburger button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:text-gold-600 hover:bg-gold-50 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gold-200 px-4 pt-2 pb-6 space-y-2 shadow-lg animate-fadeIn">
          <Link 
            href="/" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-semibold text-gold-600 bg-gold-50/50 rounded-lg"
          >
            Home
          </Link>
          <Link 
            href="/about-hukam" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-gold-600 hover:bg-gold-50 rounded-lg"
          >
            About Hukamnama
          </Link>
          <Link 
            href="/calender" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-gold-600 hover:bg-gold-50 rounded-lg"
          >
            Calendar
          </Link>

          {/* Mobile Sikh Gurus Collapsible */}
          <div className="border-t border-slate-100 pt-2">
            <button
              onClick={() => setSikhGurusOpen(!sikhGurusOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-base font-medium text-slate-700"
            >
              <span>Sikh Gurus</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${sikhGurusOpen ? 'rotate-180 text-gold-600' : ''}`} />
            </button>
            {sikhGurusOpen && (
              <div className="pl-4 pr-2 space-y-1 py-1">
                {sikhGurusList.map((guru, index) => (
                  <Link
                    key={index}
                    href={guru.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-1.5 text-xs text-slate-600 hover:text-gold-600"
                  >
                    {guru.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Path Collapsible */}
          <div>
            <button
              onClick={() => setPathOpen(!pathOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-base font-medium text-slate-700"
            >
              <span>Path</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${pathOpen ? 'rotate-180 text-gold-600' : ''}`} />
            </button>
            {pathOpen && (
              <div className="pl-4 pr-2 space-y-1 py-1">
                {effectivePaths.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex justify-between px-3 py-1.5 text-xs text-slate-600 hover:text-gold-600"
                  >
                    <span>{item.name}</span>
                    <span className="font-gurmukhi text-[11px] text-slate-400">{item.punjabi}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link 
            href="/volunteers" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-gold-600 hover:bg-gold-50 rounded-lg"
          >
            Volunteers
          </Link>
          <Link 
            href="/contact-us" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-gold-600 hover:bg-gold-50 rounded-lg"
          >
            Contact Us
          </Link>

          <div className="pt-2">
            <Link 
              href="/#hukamnama-view"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center bg-gold-500 text-white font-medium text-sm py-2.5 rounded-xl shadow"
            >
              Read Today&apos;s Hukamnama
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
