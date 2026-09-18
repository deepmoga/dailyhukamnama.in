'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Radio, ExternalLink } from 'lucide-react';

export default function Footer() {
  const [footerLogo, setFooterLogo] = useState('/logo.png');
  const [footerLogoAlt, setFooterLogoAlt] = useState('Daily Hukamnama Logo');

  useEffect(() => {
    async function loadFooterLogo() {
      try {
        const res = await fetch('/api/public/settings');
        const data = await res.json();
        if (data.settings?.footer_logo) {
          setFooterLogo(data.settings.footer_logo);
        }
        if (data.settings?.footer_logo_alt) {
          setFooterLogoAlt(data.settings.footer_logo_alt);
        }
      } catch (e) {
        // fallback
      }
    }
    loadFooterLogo();
  }, []);
  const nitnemList = [
    { name: 'Japji Sahib', href: '/path/japji-sahib' },
    { name: 'Jaap Sahib', href: '/path/jaap-sahib' },
    { name: 'Tav Prasad Savaiye', href: '/path/tav-prasad-savaiye' },
    { name: 'Chaupai Sahib', href: '/path/chaupai-sahib' },
    { name: 'Anand Sahib', href: '/path/anand-sahib' },
    { name: 'Rehras Sahib', href: '/path/rehras-sahib' },
    { name: 'Kirtan Sohila', href: '/path/kirtan-sohila' },
    { name: 'Sukhmani Sahib', href: '/path/sukhmani-sahib' },
  ];

  const sikhGurus = [
    { name: 'Guru Nanak Dev Ji', href: '/sikh-gurus/guru-nanak-dev-ji' },
    { name: 'Guru Angad Dev Ji', href: '/sikh-gurus/guru-angad-dev-ji' },
    { name: 'Guru Amar Das Ji', href: '/sikh-gurus/guru-amar-das-ji' },
    { name: 'Guru Ram Das Ji', href: '/sikh-gurus/guru-ram-das-ji' },
    { name: 'Guru Arjan Dev Ji', href: '/sikh-gurus/guru-arjan-dev-ji' },
    { name: 'Guru Har Gobind Ji', href: '/sikh-gurus/guru-har-gobind-ji' },
    { name: 'Guru Har Rai Ji', href: '/sikh-gurus/guru-har-rai-ji' },
    { name: 'Guru Har Krishan Ji', href: '/sikh-gurus/guru-har-krishan-ji' },
    { name: 'Guru Teg Bahadar Ji', href: '/sikh-gurus/guru-teg-bahadar-ji' },
    { name: 'Guru Gobind Singh Ji', href: '/sikh-gurus/guru-gobind-singh-ji' },
    { name: 'Sri Guru Granth Sahib Ji', href: '/sikh-gurus/guru-granth-sahib-ji' },
  ];

  return (
    <footer className="bg-slate-950 text-slate-300 border-t-2 border-gold-500 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1: About & Logo */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 flex-shrink-0 bg-white rounded-full p-1 overflow-hidden flex items-center justify-center">
                <img
                  src={footerLogo || "/logo.png"}
                  alt={footerLogoAlt || "Daily Hukamnama Logo"}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="font-serif-heading font-bold text-white text-base">
                  DAILY HUKAMNAMA
                </h4>
                <p className="text-xs text-gold-400 font-gurmukhi">
                  ਸ੍ਰੀ ਦਰਬਾਰ ਸਾਹਿਬ, ਅੰਮ੍ਰਿਤਸਰ
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Read and listen to the divine Daily Hukamnama (Mukhwak) from Sachkhand Sri Harmandir Sahib (Golden Temple), Amritsar. With complete Gurmukhi text, Punjabi Viakhya, English, and Hindi translations.
            </p>
            <div className="pt-2">
              <p className="font-gurmukhi text-sm text-gold-300">
                ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ ॥ ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਹਿ ॥
              </p>
            </div>

            {/* Facebook Page Widget & Link */}
            <div className="pt-2 space-y-2.5">
              <a
                href="https://www.facebook.com/dailyhukamnama.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-[#1877F2] hover:bg-[#166fe5] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all hover:scale-102"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Follow on Facebook</span>
              </a>

              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 max-w-[280px]">
                <iframe
                  src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fdailyhukamnama.in&tabs=timeline&width=280&height=180&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true"
                  width="100%"
                  height="180"
                  style={{ border: 'none', overflow: 'hidden' }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  title="Daily Hukamnama Facebook Page"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Col 2: Nitnem Paths */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-gold-500 pl-2">
              Nitnem Gurbani
            </h4>
            <ul className="space-y-2 text-xs">
              {nitnemList.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="hover:text-gold-400 transition-colors flex items-center space-x-1"
                  >
                    <span className="text-gold-500">›</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link href="/path" className="text-gold-400 hover:underline font-medium inline-flex items-center space-x-1">
                  <span>View All 10 Paths</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Sikh Gurus */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-gold-500 pl-2">
              Ten Guru Sahiban
            </h4>
            <ul className="space-y-1.5 text-xs">
              {sikhGurus.slice(0, 7).map((guru, idx) => (
                <li key={idx}>
                  <Link
                    href={guru.href}
                    className="hover:text-gold-400 transition-colors flex items-center space-x-1"
                  >
                    <span className="text-gold-500">›</span>
                    <span>{guru.name}</span>
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link href="/sikh-gurus" className="text-gold-400 hover:underline font-medium inline-flex items-center space-x-1">
                  <span>View All 10 Gurus & Eternal Guru</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Links & Credits */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-gold-500 pl-2">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about-hukam" className="hover:text-gold-400 transition flex items-center space-x-1">
                  <span className="text-gold-500">›</span>
                  <span>About Daily Hukamnama</span>
                </Link>
              </li>
              <li>
                <Link href="/sri-harimandir-sahib" className="hover:text-gold-400 transition flex items-center space-x-1">
                  <span className="text-gold-500">›</span>
                  <span>Sachkhand Sri Harmandir Sahib</span>
                </Link>
              </li>
              <li>
                <Link href="/sri-guru-granth-sahib" className="hover:text-gold-400 transition flex items-center space-x-1">
                  <span className="text-gold-500">›</span>
                  <span>Sri Guru Granth Sahib Ji</span>
                </Link>
              </li>
              <li>
                <Link href="/daily-hukamnamas" className="hover:text-gold-400 transition flex items-center space-x-1">
                  <span className="text-gold-500">›</span>
                  <span>Daily Hukamnama Sahib</span>
                </Link>
              </li>
              <li>
                <Link href="/calender" className="hover:text-gold-400 transition flex items-center space-x-1">
                  <span className="text-gold-500">›</span>
                  <span>Nanakshahi Calendar</span>
                </Link>
              </li>
              <li>
                <Link href="/convert" className="hover:text-gold-400 transition flex items-center space-x-1">
                  <span className="text-gold-500">›</span>
                  <span>Date Converter</span>
                </Link>
              </li>
              <li>
                <Link href="/volunteers" className="hover:text-gold-400 transition flex items-center space-x-1">
                  <span className="text-gold-500">›</span>
                  <span>Volunteer Seva Team</span>
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-gold-400 transition flex items-center space-x-1">
                  <span className="text-gold-500">›</span>
                  <span>Contact Us & Feedback</span>
                </Link>
              </li>
              <li className="border-t border-slate-800 pt-2">
                <a
                  href="https://www.facebook.com/dailyhukamnama.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold-400 transition flex items-center space-x-1 text-slate-300 font-medium"
                >
                  <span className="text-gold-500">›</span>
                  <span>Facebook: /dailyhukamnama.in</span>
                </a>
              </li>
              <li>
                <a
                  href="https://sgpc.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold-400 transition flex items-center space-x-1 text-slate-400"
                >
                  <span className="text-gold-500">›</span>
                  <span>SGPC Official Website</span>
                </a>
              </li>
              <li>
                <a
                  href="https://play.google.com/store/apps/details?id=com.nitnem.path&hl=en_IN&gl=US"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold-400 transition flex items-center space-x-1 text-slate-400"
                >
                  <span className="text-gold-500">›</span>
                  <span>Nitnem Path Android App</span>
                </a>
              </li>
            </ul>

            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
              <p className="text-[11px] text-slate-400">
                Created with deep devotion for the global Sikh Sangat to connect with Guru Sahib&apos;s holy word every day.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-2 sm:space-y-0">
          <p>
            © {new Date().getFullYear()} <span className="text-gold-400 font-semibold">dailyhukamnama.in</span>. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <a
              href="https://www.facebook.com/dailyhukamnama.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-[#1877F2] transition-colors flex items-center space-x-1 text-xs"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook Page</span>
            </a>
            <p className="flex items-center space-x-1">
              <span>Serving Gurmat & Sangat with</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
