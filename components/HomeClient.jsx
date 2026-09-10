'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Slider from '@/components/Slider';
import HukamnamaViewer from '@/components/HukamnamaViewer';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { Sparkles, Radio, Volume2, Loader2 } from 'lucide-react';
import { useLiveKirtan } from '@/components/LiveKirtanContext';

export default function HomeClient({ initialData }) {
  const { isPlaying, isBuffering, togglePlay } = useLiveKirtan();
  const [currentHukamnama, setCurrentHukamnama] = useState(initialData?.current || null);
  const [last5Hukamnamas, setLast5Hukamnamas] = useState(initialData?.last5 || []);
  const [monthDates, setMonthDates] = useState(initialData?.monthDates || []);
  const [selectedDate, setSelectedDate] = useState(initialData?.current?.hukamnama_date || '');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Fetch data for a selected date
  const loadHukamnamaData = async (date = '') => {
    try {
      setLoading(true);
      const url = date ? `/api/hukamnama?date=${date}` : '/api/hukamnama';
      const res = await fetch(url);
      const json = await res.json();

      if (json.success && json.data) {
        setCurrentHukamnama(json.data.current);
        if (json.data.last5) setLast5Hukamnamas(json.data.last5);
        if (json.data.monthDates) setMonthDates(json.data.monthDates);

        if (json.data.current && json.data.current.hukamnama_date) {
          setSelectedDate(json.data.current.hukamnama_date);
        }
      }
    } catch (err) {
      console.error('Error loading hukamnama data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle month change in calendar
  const handleMonthChange = async (year, month) => {
    try {
      const res = await fetch(`/api/hukamnama?year=${year}&month=${month}`);
      const json = await res.json();
      if (json.success && json.data && json.data.monthDates) {
        setMonthDates(json.data.monthDates);
      }
    } catch (err) {
      console.error('Error changing month:', err);
    }
  };

  // Handle date selection from calendar or last 5 list
  const handleSelectDate = (dateStr) => {
    setSelectedDate(dateStr);
    loadHukamnamaData(dateStr);
    const el = document.getElementById('hukamnama-view');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Sync / Extract Today's Hukamnama (Only once per day)
  const handleSyncToday = async () => {
    try {
      setSyncing(true);
      setSyncMessage('');
      const res = await fetch('/api/hukamnama', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        if (json.result?.status === 'already_exists') {
          setSyncMessage('Today’s Hukamnama is already synced and saved.');
        } else {
          setSyncMessage('Today’s Hukamnama & Poster successfully synced!');
        }
        await loadHukamnamaData(); // reload
      } else {
        setSyncMessage('Failed to sync. Please check network.');
      }
    } catch (e) {
      setSyncMessage('Error syncing Hukamnama.');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(''), 5000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbf7]">
      {/* 1. Top Navigation & Logo */}
      <Header />

      {/* 2. Full-Width Banner Slider */}
      <Slider />

      {/* Spiritual Welcome Bar */}
      <section className="bg-gradient-to-r from-gold-50 via-amber-100/50 to-gold-50 py-3 border-y border-gold-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center space-x-2 text-gold-900 font-medium font-gurmukhi">
            <Sparkles className="w-4 h-4 text-gold-600 flex-shrink-0" />
            <span>ਹਰਿ ਜੀਉ ਨਿਮਾਣਿਆ ਤੂ ਮਾਣੁ ॥ ਸਭ ਕਿਛੁ ਤੂਹੈ ਤੂਹੈ ਮੇਰੇ ਸਚੇ ਸਾਹਾ ॥</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={togglePlay}
              className={`inline-flex items-center space-x-2 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border shadow-sm transition-all transform active:scale-95 cursor-pointer ${
                isPlaying
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-emerald-600/30'
                  : 'bg-red-600 hover:bg-red-700 text-white border-red-500 shadow-sm animate-pulse'
              }`}
            >
              {isBuffering ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              ) : isPlaying ? (
                <Volume2 className="w-3.5 h-3.5 text-white animate-pulse" />
              ) : (
                <Radio className="w-3.5 h-3.5 text-white" />
              )}
              <span>
                {isBuffering
                  ? 'Connecting Live...'
                  : isPlaying
                  ? 'Pause Live Kirtan (ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ)'
                  : 'Play Live Kirtan from Sri Harmandir Sahib'}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Main Body Container: 8 Column View + 4 Column Sidebar */}
      <main id="hukamnama-view" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 8 Column Main View: Daily Hukamnama */}
          <div className="lg:col-span-8 space-y-6">
            <HukamnamaViewer 
              hukamnama={currentHukamnama} 
              loading={loading} 
            />
          </div>

          {/* 4 Column Sidebar View: Last 5 Hukamnamas + Calendar this month */}
          <div className="lg:col-span-4">
            <Sidebar
              last5Hukamnamas={last5Hukamnamas}
              monthDates={monthDates}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              onMonthChange={handleMonthChange}
            />
          </div>
        </div>
      </main>

      {/* 4. Footer */}
      <Footer />
    </div>
  );
}
