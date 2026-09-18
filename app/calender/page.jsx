'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Calendar as CalendarIcon, Sparkles } from 'lucide-react';

export default function CalendarPage() {
  const [isPunjabi, setIsPunjabi] = useState(true);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const calendarRef = useRef(null);
  const calendarInstanceRef = useRef(null);
  const isPunjabiRef = useRef(isPunjabi);

  // Keep isPunjabiRef synchronized for events callback
  useEffect(() => {
    isPunjabiRef.current = isPunjabi;
    if (calendarInstanceRef.current) {
      calendarInstanceRef.current.refetchEvents();
    }
  }, [isPunjabi]);

  // Load language preference from localStorage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('nanakshahi_lang');
      if (savedLang === 'en') {
        setIsPunjabi(false);
      } else if (savedLang === 'pa') {
        setIsPunjabi(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleSetLanguage = (lang) => {
    const punjabi = lang === 'pa';
    setIsPunjabi(punjabi);
    try {
      localStorage.setItem('nanakshahi_lang', lang);
    } catch (e) {
      // ignore
    }
  };

  // Dynamically load scripts in sequence
  useEffect(() => {
    let isMounted = true;

    function loadScript(src) {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          if (existing.getAttribute('data-loaded') === 'true') {
            resolve();
          } else {
            existing.addEventListener('load', () => resolve());
            existing.addEventListener('error', (e) => reject(e));
          }
          return;
        }

        const s = document.createElement('script');
        s.src = src;
        s.async = false;
        s.onload = () => {
          s.setAttribute('data-loaded', 'true');
          resolve();
        };
        s.onerror = (e) => reject(e);
        document.body.appendChild(s);
      });
    }

    async function initScripts() {
      try {
        await loadScript('/assets/js/fullcalendar.min.js');
        await loadScript('/assets/js/nanakshahi.min.js');
        await loadScript('/assets/js/isMobile.min.js');
        await loadScript('/assets/js/nanakshahi-calendar.min.js');
        if (isMounted) {
          setScriptsLoaded(true);
        }
      } catch (err) {
        console.error('Error loading calendar scripts:', err);
      }
    }

    initScripts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize FullCalendar once scripts are loaded
  useEffect(() => {
    if (!scriptsLoaded || !calendarRef.current) return;
    if (typeof window === 'undefined' || !window.FullCalendar) return;

    const calendarEl = calendarRef.current;
    const isMobileDevice = window.isMobile ? (window.isMobile.phone || window.isMobile.any) : false;

    // Destroy existing instance if any
    if (calendarInstanceRef.current) {
      calendarInstanceRef.current.destroy();
      calendarInstanceRef.current = null;
    }

    const calendar = new window.FullCalendar.Calendar(calendarEl, {
      themeSystem: 'standard',
      views: {
        listMonth: {
          type: 'listWeek',
          duration: { months: 1 }
        }
      },
      initialView: isMobileDevice ? 'listMonth' : 'dayGridMonth',
      fixedWeekCount: false,
      showNonCurrentDates: false,
      navLinks: false,
      height: 'auto',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,listMonth'
      },
      buttonText: {
        today: isPunjabiRef.current ? 'ਅੱਜ' : 'Today',
        month: isPunjabiRef.current ? 'ਮਹੀਨਾ' : 'Month',
        list: isPunjabiRef.current ? 'ਸੂਚੀ' : 'List'
      },
      eventDidMount: function (info) {
        info.el.setAttribute('title', info.event.title);
      },
      eventClick: function(info) {
        if (info.event.start) {
          const d = info.event.start;
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const targetUrl = `/daily-hukamnama/${y}-${m}-${day}`;
          window.location.href = targetUrl;
        }
      },
      dateClick: function(info) {
        if (info.dateStr) {
          window.location.href = `/daily-hukamnama/${info.dateStr}`;
        }
      },
      events: function (info, successCallback, failureCallback) {
        try {
          const events = [];
          const curIsPunjabi = isPunjabiRef.current;
          const nanakshahiLib = window.nanakshahi;
          const nCalendarFn = window.NCalendar;

          if (nCalendarFn) {
            const moon = nCalendarFn(info.start);
            if (moon && moon.fullMoon) {
              moon.fullMoon.forEach(function (moonDate) {
                events.push({
                  title: '🌕 ' + (curIsPunjabi ? 'ਪੂਰਨਮਾਸ਼ੀ' : 'Full Moon'),
                  allDay: true,
                  start: moonDate,
                  textColor: '#ffffff',
                  backgroundColor: '#475569',
                  borderColor: '#334155'
                });
              });
            }
            if (moon && moon.newMoon) {
              moon.newMoon.forEach(function (moonDate) {
                events.push({
                  title: '🌑 ' + (curIsPunjabi ? 'ਮੱਸਿਆ' : 'New Moon'),
                  allDay: true,
                  start: moonDate,
                  textColor: '#ffffff',
                  backgroundColor: '#1e293b',
                  borderColor: '#0f172a'
                });
              });
            }
          }

          if (nanakshahiLib) {
            const loopDate = new Date(info.start);
            while (loopDate < info.end) {
              // Nanakshahi calendar begins from 2003-03-14
              if (!(loopDate < new Date(2003, 2, 14))) {
                const nsInfo = nanakshahiLib.getNanakshahiDate(loopDate);
                const nanakshahiDate = curIsPunjabi ? nsInfo.punjabiDate : nsInfo.englishDate;
                
                // Add Nanakshahi Day header
                events.push({
                  title: nanakshahiDate.date + ' ' + nanakshahiDate.monthName + ', ' + nanakshahiDate.year,
                  allDay: true,
                  start: new Date(loopDate.getFullYear(), loopDate.getMonth(), loopDate.getDate()),
                  textColor: '#1e293b',
                  backgroundColor: '#f1f5f9',
                  borderColor: '#e2e8f0',
                  classNames: ['font-semibold', 'text-xs']
                });

                // Add Gurpurabs / Historical days
                const holidays = nanakshahiLib.getGurpurabsForDay(loopDate) || [];
                holidays.forEach(function (holiday) {
                  let bgColor = '#d97706'; // Gurpurab amber
                  let textColor = '#ffffff';

                  if (holiday.type === 'gurpurab') {
                    bgColor = '#d97706';
                  } else if (holiday.type === 'historical') {
                    bgColor = '#0284c7';
                  } else if (holiday.type === 'bhagat') {
                    bgColor = '#16a34a';
                  } else if (holiday.type === 'calendar') {
                    bgColor = '#e2e8f0';
                    textColor = '#0f172a';
                  }

                  events.push({
                    title: curIsPunjabi ? (holiday.pa || holiday.en) : (holiday.en || holiday.pa),
                    allDay: true,
                    start: new Date(loopDate.getFullYear(), loopDate.getMonth(), loopDate.getDate()),
                    textColor: textColor,
                    backgroundColor: bgColor,
                    borderColor: bgColor,
                    classNames: ['font-medium', 'text-xs', 'shadow-xs']
                  });
                });
              }
              loopDate.setDate(loopDate.getDate() + 1);
            }
          }

          successCallback(events);
        } catch (err) {
          console.error('Error generating calendar events:', err);
          failureCallback(err);
        }
      }
    });

    calendar.render();
    calendarInstanceRef.current = calendar;

    return () => {
      if (calendarInstanceRef.current) {
        calendarInstanceRef.current.destroy();
        calendarInstanceRef.current = null;
      }
    };
  }, [scriptsLoaded]);

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbf7]">
      {/* External CSS Links */}
      <link rel="stylesheet" href="/assets/js/fullcalendar.min.css" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5/css/all.min.css" />

      <Header />

      {/* Hero Banner with Language Toggle */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-spiritual-navy text-white py-12 px-4 sm:px-6 lg:px-8 border-b-2 border-gold-500 shadow-md">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-gold-500/20 border border-gold-400/30 px-4 py-1.5 rounded-full text-gold-300 text-xs font-semibold uppercase tracking-wider">
            <CalendarIcon className="w-4 h-4 text-gold-400" />
            <span>ਨਾਨਕਸ਼ਾਹੀ ਕੈਲੰਡਰ • Nanakshahi & Gregorian Calendar</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif-heading tracking-wide">
            {isPunjabi ? 'ਨਾਨਕਸ਼ਾਹੀ ਕੈਲੰਡਰ' : 'Nanakshahi Calendar'}
          </h1>
          
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            {isPunjabi
              ? 'ਸੱਚਖੰਡ ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ ਅੰਮ੍ਰਿਤਸਰ ਤੋਂ ਰੋਜ਼ਾਨਾ ਹੁਕਮਨਾਮਾ, ਗੁਰਪੁਰਬ, ਮੱਸਿਆ, ਪੂਰਨਮਾਸ਼ੀ ਅਤੇ ਨਾਨਕਸ਼ਾਹੀ ਤਾਰੀਖਾਂ ਦੇਖਣ ਲਈ ਕੈਲੰਡਰ।'
              : 'Explore Daily Hukamnamas from Sri Darbar Sahib Amritsar, Gurpurabs, Sangrand, Puranmashi, Masya, and Nanakshahi dates.'}
          </p>

          {/* Top 2 Buttons for Punjabi and English */}
          <div className="pt-2 flex items-center justify-center space-x-3">
            <button
              type="button"
              onClick={() => handleSetLanguage('pa')}
              className={`en pa px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md flex items-center space-x-2 border ${
                isPunjabi
                  ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white border-gold-400 shadow-gold-500/30 scale-105'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>ਪੰਜਾਬੀ</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetLanguage('en')}
              className={`en px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md flex items-center space-x-2 border ${
                !isPunjabi
                  ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white border-gold-400 shadow-gold-500/30 scale-105'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>English</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Calendar Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Color Legend Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gold-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-gold-600" />
            <span>{isPunjabi ? 'ਕੈਲੰਡਰ ਸੰਕੇਤ (Legend):' : 'Calendar Legend:'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-md font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>{isPunjabi ? 'ਗੁਰਪੁਰਬ (Gurpurab)' : 'Gurpurab'}</span>
            </span>

            <span className="inline-flex items-center space-x-1 bg-sky-50 text-sky-900 border border-sky-300 px-2.5 py-1 rounded-md font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <span>{isPunjabi ? 'ਇਤਿਹਾਸਕ ਦਿਹਾੜਾ' : 'Historical Day'}</span>
            </span>

            <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-md font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>{isPunjabi ? 'ਭਗਤ ਦਿਹਾੜਾ' : 'Bhagat Day'}</span>
            </span>

            <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-1 rounded-md font-medium">
              <span>🌕</span>
              <span>{isPunjabi ? 'ਪੂਰਨਮਾਸ਼ੀ' : 'Full Moon'}</span>
            </span>

            <span className="inline-flex items-center space-x-1 bg-slate-800 text-white px-2.5 py-1 rounded-md font-medium">
              <span>🌑</span>
              <span>{isPunjabi ? 'ਮੱਸਿਆ' : 'New Moon'}</span>
            </span>
          </div>
        </div>

        {/* Calendar Body */}
        <div className="container bg-white rounded-2xl shadow-md border border-gold-200 overflow-hidden p-4 sm:p-6">
          {!scriptsLoaded && (
            <div className="py-24 text-center space-y-3">
              <div className="inline-block w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500 font-medium">
                {isPunjabi ? 'ਨਾਨਕਸ਼ਾਹੀ ਕੈਲੰਡਰ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...' : 'Loading Nanakshahi Calendar...'}
              </p>
            </div>
          )}

          <div 
            id="calendar" 
            ref={calendarRef} 
            className="nanakshahi-fc-custom mt-3 mb-3 min-h-[600px]"
          ></div>
        </div>

        {/* Footer Guidance Note */}
        <div className="bg-amber-50/60 rounded-xl p-4 border border-gold-300/60 text-center text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-800">
            {isPunjabi
              ? 'ਕਿਸੇ ਵੀ ਦਿਨ ਦਾ ਹੁਕਮਨਾਮਾ ਪੜ੍ਹਨ ਲਈ ਉਸ ਤਾਰੀਖ ਉੱਤੇ ਕਲਿੱਕ ਕਰੋ।'
              : 'Click on any date to read the full Hukamnama Sahib from Sri Darbar Sahib for that day.'}
          </p>
          <p className="text-slate-500">
            {isPunjabi
              ? 'ਨਾਨਕਸ਼ਾਹੀ ਸੰਮਤ ਸ਼੍ਰੋਮਣੀ ਗੁਰਦੁਆਰਾ ਪ੍ਰਬੰਧਕ ਕਮੇਟੀ (SGPC) ਮਾਨਤਾ ਪ੍ਰਾਪਤ ਕੈਲੰਡਰ ਅਨੁਸਾਰ ਪ੍ਰਦਰਸ਼ਿਤ ਹੁੰਦਾ ਹੈ।'
              : 'Nanakshahi Calendar dates follow the approved Sikh calendar standards.'}
          </p>
        </div>
      </main>

      {/* Custom Styles for FullCalendar */}
      <style jsx global>{`
        .nanakshahi-fc-custom .fc-header-toolbar {
          margin-bottom: 1.25rem !important;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .nanakshahi-fc-custom .fc-toolbar-title {
          font-size: 1.25rem !important;
          font-weight: 700 !important;
          color: #1e293b !important;
          font-family: var(--font-serif-heading), serif;
        }
        .nanakshahi-fc-custom .fc-button {
          background-color: #d97706 !important;
          border-color: #b45309 !important;
          color: #ffffff !important;
          font-weight: 600 !important;
          font-size: 0.8rem !important;
          border-radius: 9999px !important;
          padding: 0.35rem 0.85rem !important;
          text-transform: capitalize !important;
          transition: all 0.2s ease !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
        }
        .nanakshahi-fc-custom .fc-button:hover {
          background-color: #b45309 !important;
          border-color: #92400e !important;
        }
        .nanakshahi-fc-custom .fc-button-active {
          background-color: #78350f !important;
          border-color: #78350f !important;
        }
        .nanakshahi-fc-custom .fc-daygrid-day-number {
          font-weight: 700;
          color: #1e293b;
          font-size: 0.85rem;
          padding: 4px 6px;
        }
        .nanakshahi-fc-custom .fc-day-today {
          background-color: #fef3c7 !important;
        }
        .nanakshahi-fc-custom .fc-event {
          cursor: pointer;
          border-radius: 4px;
          padding: 1px 3px;
          margin-bottom: 2px;
          font-size: 0.75rem;
        }
        .nanakshahi-fc-custom .fc-daygrid-day {
          cursor: pointer;
          transition: background-color 0.15s;
        }
        .nanakshahi-fc-custom .fc-daygrid-day:hover {
          background-color: #fffbeb;
        }
        .nanakshahi-fc-custom .fc-col-header-cell {
          background-color: #f8fafc;
          padding: 8px 0;
          font-weight: 600;
          color: #475569;
          font-size: 0.8rem;
        }
      `}</style>

      <Footer />
    </div>
  );
}
