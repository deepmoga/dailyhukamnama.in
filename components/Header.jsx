'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  ChevronDown, 
  Radio, 
  Calendar as CalendarIcon,
  Sparkles
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname() || '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sikhGurusOpen, setSikhGurusOpen] = useState(false);
  const [pathOpen, setPathOpen] = useState(false);
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [dbPaths, setDbPaths] = useState([]);
  const [dbGurus, setDbGurus] = useState([]);

  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setCurrentDateStr(formatted);

    // Fetch dynamic paths & gurus created in admin
    async function loadNavigation() {
      try {
        const res = await fetch('/api/public/paths');
        const data = await res.json();
        if (data.paths) {
          setDbPaths(data.paths);
        }
      } catch (err) {
        // fallback
      }

      try {
        const gRes = await fetch('/api/public/sikh-gurus');
        const gData = await gRes.json();
        if (gData.gurus && gData.gurus.length > 0) {
          setDbGurus(gData.gurus);
        }
      } catch (err) {
        // fallback
      }
    }
    loadNavigation();
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

  const effectiveGurus = dbGurus.length > 0
    ? dbGurus.map((g) => ({
        name: g.title,
        dates: g.author || '',
        href: g.slug.startsWith('sikh-gurus/') ? `/${g.slug}` : `/sikh-gurus/${g.slug}`,
      }))
    : sikhGurusList;

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
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gold-200">
      {/* 1. TOP SACRED ANNOUNCEMENT BAR */}
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
            <div className="inline-flex items-center space-x-1.5 bg-red-600/80 text-white px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide animate-pulse">
              <Radio className="w-3 h-3" />
              <span>LIVE KIRTAN SRI HARIMANDIR SAHIB</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LOGO ROW (Spacious header with Logo on left, quick action on right) */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3.5 sm:py-4">
            {/* Logo & Site Title */}
            <Link href="/" className="flex items-center space-x-3.5 sm:space-x-4 group">
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
                <span className="font-serif-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 group-hover:text-gold-600 transition-colors">
                  DAILY HUKAMNAMA
                </span>
                <span className="text-xs sm:text-sm font-medium text-gold-700 tracking-wider font-gurmukhi">
                  ਸ੍ਰੀ ਦਰਬਾਰ ਸਾਹਿਬ, ਅੰਮ੍ਰਿਤਸਰ
                </span>
              </div>
            </Link>

            {/* Right Side on Desktop: Tagline & Today's Hukamnama Button */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-right border-r border-slate-200 pr-4">
                <div className="font-gurmukhi text-sm font-semibold text-gold-700">
                  ਸੱਚਖੰਡ ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ
                </div>
                <div className="text-xs text-slate-500 font-serif">
                  Golden Temple, Amritsar (Punjab)
                </div>
              </div>
              <a 
                href="/#hukamnama-view"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-md hover:shadow-gold-500/25 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-gold-200" />
                <span>Today&apos;s Hukamnama</span>
              </a>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-700 hover:text-gold-600 hover:bg-gold-50 focus:outline-none border border-slate-200 transition-colors"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DEDICATED MENU BAR (New row below logo) */}
      <div className="hidden lg:block bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 border-t border-b border-gold-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-12">
            <div className="flex items-center space-x-1 xl:space-x-2">
              <Link 
                href="/" 
                className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-all ${
                  pathname === '/' 
                    ? 'text-gold-700 font-bold bg-gold-100/70 border-b-2 border-gold-600' 
                    : 'text-slate-700 hover:text-gold-600 hover:bg-gold-50/70'
                }`}
              >
                Home
              </Link>

              <Link 
                href="/about-hukam" 
                className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-all ${
                  pathname === '/about-hukam' 
                    ? 'text-gold-700 font-bold bg-gold-100/70 border-b-2 border-gold-600' 
                    : 'text-slate-700 hover:text-gold-600 hover:bg-gold-50/70'
                }`}
              >
                About Hukamnama
              </Link>

              <Link 
                href="/calender" 
                className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-all ${
                  pathname === '/calender' 
                    ? 'text-gold-700 font-bold bg-gold-100/70 border-b-2 border-gold-600' 
                    : 'text-slate-700 hover:text-gold-600 hover:bg-gold-50/70'
                }`}
              >
                Calendar
              </Link>

              {/* Sikh Gurus Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setSikhGurusOpen(true)}
                onMouseLeave={() => setSikhGurusOpen(false)}
              >
                <Link
                  href="/sikh-gurus"
                  className={`px-3.5 py-1.5 text-sm font-medium rounded-md flex items-center space-x-1 transition-all ${
                    pathname.startsWith('/sikh-gurus') 
                      ? 'text-gold-700 font-bold bg-gold-100/70 border-b-2 border-gold-600' 
                      : 'text-slate-700 hover:text-gold-600 hover:bg-gold-50/70'
                  }`}
                >
                  <span>Sikh Gurus</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${sikhGurusOpen ? 'rotate-180 text-gold-600' : ''}`} />
                </Link>

                {sikhGurusOpen && (
                  <div className="absolute left-0 top-full pt-1 w-64 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-gold-200 py-2 animate-fadeIn">
                      <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold-700 border-b border-gold-100 flex items-center justify-between">
                        <span>Ten Guru Sahiban</span>
                        <Link href="/sikh-gurus" className="text-[10px] text-gold-600 hover:underline">View All</Link>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {effectiveGurus.map((guru, index) => (
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
                  </div>
                )}
              </div>

              {/* Path Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setPathOpen(true)}
                onMouseLeave={() => setPathOpen(false)}
              >
                <Link
                  href="/path"
                  className={`px-3.5 py-1.5 text-sm font-medium rounded-md flex items-center space-x-1 transition-all ${
                    pathname.startsWith('/path') || pathname === '/japji-sahib-in-punjabi-gurmukhi'
                      ? 'text-gold-700 font-bold bg-gold-100/70 border-b-2 border-gold-600' 
                      : 'text-slate-700 hover:text-gold-600 hover:bg-gold-50/70'
                  }`}
                >
                  <span>Path</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${pathOpen ? 'rotate-180 text-gold-600' : ''}`} />
                </Link>

                {pathOpen && (
                  <div className="absolute left-0 top-full pt-1 w-64 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-gold-200 py-2 animate-fadeIn">
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
                  </div>
                )}
              </div>

              <Link 
                href="/volunteers" 
                className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-all ${
                  pathname === '/volunteers' 
                    ? 'text-gold-700 font-bold bg-gold-100/70 border-b-2 border-gold-600' 
                    : 'text-slate-700 hover:text-gold-600 hover:bg-gold-50/70'
                }`}
              >
                Volunteers
              </Link>

              <Link 
                href="/contact-us" 
                className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-all ${
                  pathname === '/contact-us' 
                    ? 'text-gold-700 font-bold bg-gold-100/70 border-b-2 border-gold-600' 
                    : 'text-slate-700 hover:text-gold-600 hover:bg-gold-50/70'
                }`}
              >
                Contact Us
              </Link>
            </div>

            {/* Right side spiritual blessing quote in menu row */}
            <div className="hidden xl:flex items-center space-x-2 text-xs text-gold-800 font-medium">
              <span className="bg-white/80 border border-gold-300/70 px-3 py-1 rounded-full text-[11px] shadow-2xs font-gurmukhi">
                ਧੁਰ ਕੀ ਬਾਣੀ ਆਈ ॥ ਤਿਨਿ ਸਗਲੀ ਚਿੰਤ ਮਿਟਾਈ ॥
              </span>
            </div>
          </nav>
        </div>
      </div>

      {/* 4. MOBILE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gold-200 px-4 pt-3 pb-6 space-y-2 shadow-lg animate-fadeIn">
          <Link 
            href="/" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 text-base font-medium rounded-lg ${
              pathname === '/' ? 'text-gold-700 font-bold bg-gold-100/60' : 'text-slate-700 hover:text-gold-600 hover:bg-gold-50'
            }`}
          >
            Home
          </Link>
          <Link 
            href="/about-hukam" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 text-base font-medium rounded-lg ${
              pathname === '/about-hukam' ? 'text-gold-700 font-bold bg-gold-100/60' : 'text-slate-700 hover:text-gold-600 hover:bg-gold-50'
            }`}
          >
            About Hukamnama
          </Link>
          <Link 
            href="/calender" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 text-base font-medium rounded-lg ${
              pathname === '/calender' ? 'text-gold-700 font-bold bg-gold-100/60' : 'text-slate-700 hover:text-gold-600 hover:bg-gold-50'
            }`}
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
                {effectiveGurus.map((guru, index) => (
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
            className={`block px-3 py-2 text-base font-medium rounded-lg ${
              pathname === '/volunteers' ? 'text-gold-700 font-bold bg-gold-100/60' : 'text-slate-700 hover:text-gold-600 hover:bg-gold-50'
            }`}
          >
            Volunteers
          </Link>
          <Link 
            href="/contact-us" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 text-base font-medium rounded-lg ${
              pathname === '/contact-us' ? 'text-gold-700 font-bold bg-gold-100/60' : 'text-slate-700 hover:text-gold-600 hover:bg-gold-50'
            }`}
          >
            Contact Us
          </Link>

          <div className="pt-3">
            <Link 
              href="/#hukamnama-view"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-medium text-sm py-2.5 rounded-xl shadow"
            >
              <Sparkles className="w-4 h-4 text-gold-200" />
              <span>Read Today&apos;s Hukamnama</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

