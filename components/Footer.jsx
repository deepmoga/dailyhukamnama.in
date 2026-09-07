import Link from 'next/link';
import Image from 'next/image';
import { Heart, Radio, ExternalLink } from 'lucide-react';

export default function Footer() {
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
              <div className="relative w-12 h-12 flex-shrink-0 bg-white rounded-full p-1">
                <Image
                  src="/logo.png"
                  alt="Daily Hukamnama Logo"
                  fill
                  className="object-contain"
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
                <Link href="/calender" className="hover:text-gold-400 transition flex items-center space-x-1">
                  <span className="text-gold-500">›</span>
                  <span>Nanakshahi Calendar & Archives</span>
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
          <p className="flex items-center space-x-1">
            <span>Serving Gurmat & Sangat with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
