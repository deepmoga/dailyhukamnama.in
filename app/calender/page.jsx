'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, BookOpen, ExternalLink, Sparkles, Filter } from 'lucide-react';

export default function CalendarPage() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // 1-12
  const [monthDates, setMonthDates] = useState([]);
  const [hukamnamasList, setHukamnamasList] = useState([]);
  const [loading, setLoading] = useState(true);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Fetch month data
  const fetchCalendarData = async (year, month) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/hukamnama?year=${year}&month=${month}`);
      const json = await res.json();
      if (json.success && json.data) {
        setMonthDates(json.data.monthDates || []);
        if (json.data.last5) {
          setHukamnamasList(json.data.last5);
        }
      }
    } catch (e) {
      console.error('Error fetching calendar data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const firstDayIndex = new Date(selectedYear, selectedMonth - 1, 1).getDay();

  const getDayDateString = (day) => {
    const m = String(selectedMonth).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${selectedYear}-${m}-${d}`;
  };

  const hasRecord = (day) => {
    const dStr = getDayDateString(day);
    return monthDates.some((entry) => String(entry).startsWith(dStr));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbf7]">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-spiritual-navy text-white py-14 px-4 sm:px-6 lg:px-8 border-b-2 border-gold-500">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center space-x-2 bg-gold-500/20 border border-gold-400/30 px-3.5 py-1 rounded-full text-gold-300 text-xs font-semibold uppercase tracking-wider">
            <CalendarIcon className="w-3.5 h-3.5 text-gold-400" />
            <span>Nanakshahi & Gregorian Archives</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif-heading tracking-wide">
            Hukamnama Calendar & Archives
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-light">
            Browse and read past Daily Hukamnamas from Sachkhand Sri Harmandir Sahib by selecting any date below.
          </p>
        </div>
      </section>

      {/* Calendar Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="bg-white rounded-2xl shadow-md border border-gold-200 overflow-hidden">
          {/* Calendar Header Controls */}
          <div className="bg-slate-900 text-white p-5 flex flex-wrap items-center justify-between gap-4 border-b border-gold-500/30">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-5 h-5 text-gold-400" />
              <h2 className="text-lg font-bold uppercase tracking-wider font-serif-heading">
                {monthNames[selectedMonth - 1]} {selectedYear}
              </h2>
            </div>

            <div className="flex items-center space-x-3">
              {/* Year Selector */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-gold-500"
              >
                {[2023, 2024, 2025, 2026, 2027].map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>

              {/* Month Selector */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-gold-500"
              >
                {monthNames.map((name, idx) => (
                  <option key={idx} value={idx + 1}>{name}</option>
                ))}
              </select>

              {/* Prev / Next buttons */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6 sm:p-8">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-16 sm:h-20 bg-slate-50/40 rounded-xl" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dStr = getDayDateString(dayNum);
                const hasData = hasRecord(dayNum);
                const isToday =
                  selectedYear === currentDate.getFullYear() &&
                  selectedMonth === currentDate.getMonth() + 1 &&
                  dayNum === currentDate.getDate();

                return (
                  <div
                    key={`day-${dayNum}`}
                    className={`h-16 sm:h-20 p-2 rounded-xl border flex flex-col justify-between transition-all ${
                      hasData
                        ? 'bg-gold-50/70 border-gold-300 hover:shadow-md hover:border-gold-500'
                        : 'bg-white border-slate-100 opacity-60'
                    } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${hasData ? 'text-gold-900' : 'text-slate-400'}`}>
                        {dayNum}
                      </span>
                      {isToday && (
                        <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-medium">
                          Today
                        </span>
                      )}
                    </div>

                    {hasData ? (
                      <Link
                        href={`/daily-hukamnama/${dStr}`}
                        className="text-[11px] text-gold-700 hover:text-gold-900 font-semibold truncate flex items-center space-x-1"
                        title={`Read Hukamnama for ${dStr}`}
                      >
                        <BookOpen className="w-3 h-3 text-gold-600 flex-shrink-0" />
                        <span className="hidden sm:inline">Read</span>
                      </Link>
                    ) : (
                      <span className="text-[10px] text-slate-300">—</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Hukamnamas Archive Section */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gold-200 space-y-4">
          <div className="flex items-center justify-between border-b border-gold-100 pb-3">
            <h3 className="text-lg font-bold text-slate-900 font-serif-heading">
              Recorded Hukamnamas for this Month
            </h3>
            <span className="text-xs bg-gold-100 text-gold-800 px-3 py-1 rounded-full font-medium">
              {monthDates.length} recorded entries
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {monthDates.map((dateStr, idx) => {
              const d = new Date(dateStr);
              const formatted = d.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <Link
                  key={idx}
                  href={`/daily-hukamnama/${dateStr}`}
                  className="p-4 rounded-xl border border-gold-200 hover:border-gold-400 bg-gold-50/30 hover:bg-gold-50 transition flex items-center justify-between group"
                >
                  <div>
                    <span className="text-xs text-slate-500 font-mono">{dateStr}</span>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-gold-700">
                      {formatted}
                    </h4>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white group-hover:bg-gold-500 text-slate-400 group-hover:text-white flex items-center justify-center shadow-sm transition">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
