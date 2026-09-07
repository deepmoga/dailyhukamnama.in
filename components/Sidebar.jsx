'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Radio, 
  Play, 
  Pause, 
  Download, 
  Star, 
  ExternalLink,
  BookOpen,
  Volume2,
  Image as ImageIcon
} from 'lucide-react';

export default function Sidebar({ 
  last5Hukamnamas = [], 
  monthDates = [], 
  selectedDate, 
  onSelectDate,
  onMonthChange
}) {
  const [isPlayingLive, setIsPlayingLive] = useState(false);
  const [audioElement, setAudioElement] = useState(null);

  // Calendar navigation state
  const currentDate = new Date();
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth()); // 0-indexed

  // Toggle Live Kirtan Audio
  const toggleLiveKirtan = () => {
    const liveStreamUrl = 'https://live.sgpc.net:8444/;'; // SGPC Live Kirtan Audio Stream

    if (isPlayingLive && audioElement) {
      audioElement.pause();
      setIsPlayingLive(false);
    } else {
      let audio = audioElement;
      if (!audio) {
        audio = new Audio(liveStreamUrl);
        setAudioElement(audio);
        audio.onerror = () => {
          // Fallback stream if SGPC primary is down
          audio.src = 'https://stream.zeno.fm/f3wvbbqmdg8uv';
          audio.play().catch(e => console.log('Audio playback error', e));
        };
      }
      audio.play().then(() => {
        setIsPlayingLive(true);
      }).catch((e) => {
        console.error('Audio play error:', e);
      });
    }
  };

  // Calendar calculations
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  const handlePrevMonth = () => {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    if (onMonthChange) {
      onMonthChange(newYear, newMonth + 1);
    }
  };

  const handleNextMonth = () => {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    if (onMonthChange) {
      onMonthChange(newYear, newMonth + 1);
    }
  };

  // Check if a calendar day string (YYYY-MM-DD) has Hukamnama in database
  const getDayDateString = (day) => {
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  };

  const hasHukamnamaOnDay = (day) => {
    const dateStr = getDayDateString(day);
    return monthDates.some((entry) => {
      if (entry instanceof Date) {
        return entry.toISOString().split('T')[0] === dateStr;
      }
      return String(entry).startsWith(dateStr);
    });
  };

  return (
    <aside className="space-y-6 sidebar-section">
      {/* 1. Last 5 Hukamnamas Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gold-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gold-500 to-gold-600 px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-white" />
            <h3 className="font-bold text-sm uppercase tracking-wider">
              Last 5 Hukamnamas
            </h3>
          </div>
          <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
            Recent
          </span>
        </div>

        <div className="divide-y divide-slate-100 p-2">
          {last5Hukamnamas && last5Hukamnamas.length > 0 ? (
            last5Hukamnamas.map((item) => {
              const itemDateStr = item.hukamnama_date 
                ? (item.hukamnama_date instanceof Date 
                    ? item.hukamnama_date.toISOString().split('T')[0] 
                    : String(item.hukamnama_date).split('T')[0])
                : '';

              const isSelected = selectedDate === itemDateStr;

              const displayDate = item.hukamnama_date
                ? new Date(item.hukamnama_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : item.title;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectDate(itemDateStr)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex flex-col space-y-1 group ${
                    isSelected
                      ? 'bg-gold-50/90 border border-gold-300 shadow-sm'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-semibold text-gold-700 group-hover:text-gold-600">
                        {displayDate}
                      </span>
                      {item.source_image && (
                        <span className="inline-flex items-center text-[10px] text-gold-600 bg-gold-100/80 px-1 py-0.5 rounded" title="Poster image available">
                          <ImageIcon className="w-2.5 h-2.5 mr-0.5" />
                          Photo
                        </span>
                      )}
                    </div>
                    {item.ang && (
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        Ang: {item.ang}
                      </span>
                    )}
                  </div>

                  <div className="font-gurmukhi text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-gold-700">
                    {item.shabad_title || item.title}
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    {item.raag && <span>{item.raag}</span>}
                    {item.author && (
                      <>
                        <span>•</span>
                        <span className="truncate">{item.author}</span>
                      </>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-4 text-center text-xs text-slate-400">
              No recent Hukamnamas available.
            </div>
          )}
        </div>
      </div>

      {/* 2. Calendar This Month Card */}
      <div id="calendar" className="bg-white rounded-2xl shadow-sm border border-gold-200 overflow-hidden">
        <div className="bg-slate-900 px-5 py-3.5 text-white flex items-center justify-between border-b border-gold-500/40">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4 text-gold-400" />
            <h3 className="font-bold text-sm uppercase tracking-wider">
              Calendar This Month
            </h3>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-gold-300 px-1">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
            <div>Su</div>
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div>Sa</div>
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty boxes for days before 1st of month */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = getDayDateString(dayNum);
              const hasData = hasHukamnamaOnDay(dayNum);
              const isSelected = selectedDate === dateStr;
              const isToday =
                currentYear === currentDate.getFullYear() &&
                currentMonth === currentDate.getMonth() &&
                dayNum === currentDate.getDate();

              return (
                <button
                  key={`day-${dayNum}`}
                  onClick={() => onSelectDate(dateStr)}
                  disabled={!hasData}
                  className={`h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-gold-500 text-white font-bold shadow-sm ring-2 ring-gold-300'
                      : hasData
                      ? 'bg-gold-50 text-gold-900 hover:bg-gold-200 border border-gold-200 font-semibold'
                      : 'text-slate-300 hover:bg-slate-50 cursor-not-allowed'
                  } ${isToday && !isSelected ? 'border border-blue-500 text-blue-600' : ''}`}
                  title={hasData ? `View Hukamnama for ${dateStr}` : `No record for ${dateStr}`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gold-500" />
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-blue-500" />
              <span>Today</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <span>No Record</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Live Kirtan Player Widget */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-spiritual-navy text-white rounded-2xl p-5 shadow-sm border border-gold-500/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-gold-300">
              Live Broadcast
            </span>
          </div>
          <span className="text-[10px] bg-red-600/80 text-white font-medium px-2 py-0.5 rounded-full">
            ON AIR
          </span>
        </div>

        <h4 className="font-bold text-sm text-white mb-1">
          Live Kirtan Sri Harmandir Sahib
        </h4>
        <p className="text-xs text-slate-300 mb-4">
          Direct audio feed from Sachkhand Sri Darbar Sahib, Amritsar.
        </p>

        <button
          onClick={toggleLiveKirtan}
          className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl font-semibold text-xs transition duration-200 ${
            isPlayingLive
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
              : 'bg-gold-500 hover:bg-gold-600 text-white shadow'
          }`}
        >
          {isPlayingLive ? (
            <>
              <Pause className="w-4 h-4" />
              <span>Pause Live Kirtan</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Play Live Kirtan</span>
            </>
          )}
        </button>
      </div>

      {/* 4. Nitnem Path App Card */}
      <div className="bg-gradient-to-br from-gold-50 via-white to-amber-50 rounded-2xl p-5 border border-gold-200 text-center shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-gold-500 text-white mx-auto flex items-center justify-center shadow-md mb-3">
          <BookOpen className="w-6 h-6" />
        </div>

        <h4 className="font-bold text-sm text-slate-800 mb-1">
          Nitnem Path Mobile App
        </h4>
        <p className="text-xs text-slate-600 mb-3">
          Live Kirtan, Nitnem Path, 10 Guru Sahiban, and Daily Hukamnama on your smartphone.
        </p>

        <div className="flex items-center justify-center space-x-1 text-gold-500 mb-4">
          <Star className="w-3.5 h-3.5 fill-gold-500" />
          <Star className="w-3.5 h-3.5 fill-gold-500" />
          <Star className="w-3.5 h-3.5 fill-gold-500" />
          <Star className="w-3.5 h-3.5 fill-gold-500" />
          <Star className="w-3.5 h-3.5 fill-gold-500" />
          <span className="text-xs font-semibold text-slate-700 ml-1">4.9/5</span>
        </div>

        <a
          href="https://play.google.com/store/apps/details?id=com.nitnem.path&hl=en_IN&gl=US"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center space-x-2 w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium py-2.5 rounded-xl shadow transition"
        >
          <Download className="w-4 h-4" />
          <span>Get on Google Play</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </aside>
  );
}
