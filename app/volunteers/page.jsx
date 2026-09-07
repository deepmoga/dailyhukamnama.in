'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { 
  Heart, Users, Search, ChevronLeft, ChevronRight, 
  ArrowUpDown, Loader2, Send, CheckCircle2, Sparkles
} from 'lucide-react';

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('sort_order');
  const [sortDirection, setSortDirection] = useState('asc');

  // Registration form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    sevaArea: 'Website / Software Seva',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  async function fetchVolunteers() {
    setLoading(true);
    try {
      const res = await fetch('/api/public/volunteers?limit=100');
      const data = await res.json();
      if (data.volunteers) {
        setVolunteers(data.volunteers);
      }
    } catch (err) {
      console.error('Error loading volunteers:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filter and sort
  const filtered = volunteers.filter((v) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return v.name?.toLowerCase().includes(q) || v.description?.toLowerCase().includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const totalEntries = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / entriesPerPage));
  const startIndex = (currentPage - 1) * entriesPerPage;
  const displayedVolunteers = sorted.slice(startIndex, startIndex + entriesPerPage);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', city: '', sevaArea: 'Website / Software Seva', message: '' });
    }, 5000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      {/* Hero Header Section - matching user screenshot styling (#f6f4ee) */}
      <section className="bg-[#f6f4ee] py-14 px-4 sm:px-6 lg:px-8 border-b border-stone-200">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-serif-heading italic font-normal text-stone-900 tracking-wide">
            Volunteers
          </h1>
          <p className="text-xs text-stone-500 italic">
            <Link href="/" className="hover:text-gold-600">Daily Hukamnama</Link>
            <span className="mx-1.5">&gt;</span>
            <span className="text-stone-700">Volunteers</span>
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-12">
        {/* Table Controls (Entries per page & Search) - exact replica of user screenshot */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-700">
            <div className="flex items-center space-x-2">
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-gold-500 outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>entries per page</span>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <label htmlFor="volunteer-search" className="font-medium text-slate-600">Search:</label>
              <input
                id="volunteer-search"
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-slate-300 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-gold-500 focus:border-gold-500 outline-none w-48 sm:w-64"
              />
            </div>
          </div>

          {/* Volunteers Table - Light Blue Header #d9edf7 as in user screenshot */}
          <div className="border border-slate-200 rounded-sm overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#d9edf7] text-slate-800 text-xs font-bold border-b border-slate-300 select-none">
                  <th
                    onClick={() => handleSort('name')}
                    className="px-6 py-3 cursor-pointer hover:bg-[#c4e3f3] transition w-1/3"
                  >
                    <div className="flex items-center justify-between">
                      <span>Name</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('image')}
                    className="px-6 py-3 cursor-pointer hover:bg-[#c4e3f3] transition text-center w-1/4"
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>Image</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('description')}
                    className="px-6 py-3 cursor-pointer hover:bg-[#c4e3f3] transition"
                  >
                    <div className="flex items-center justify-between">
                      <span>Description</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs text-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-gold-500 mb-2" />
                      Loading volunteers...
                    </td>
                  </tr>
                ) : displayedVolunteers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                      No matching volunteers found.
                    </td>
                  </tr>
                ) : (
                  displayedVolunteers.map((item, idx) => (
                    <tr 
                      key={item.id || idx} 
                      className="hover:bg-slate-50 transition border-b border-slate-200"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900 align-middle">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-center align-middle">
                        {item.image ? (
                          <div className="inline-block relative max-w-[140px] max-h-[90px] overflow-hidden rounded border border-slate-100 p-1 bg-white">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="max-h-20 max-w-full object-contain mx-auto"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 font-bold">
                            {item.name?.[0] || 'V'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-700 leading-relaxed align-middle">
                        {item.description}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer: Showing X to Y of Z entries & Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-slate-600">
            <div>
              Showing {totalEntries === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + entriesPerPage, totalEntries)} of {totalEntries} entries
            </div>

            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 border rounded transition ${
                    currentPage === pageNum
                      ? 'bg-[#d9edf7] border-slate-400 font-bold text-slate-900 shadow-xs'
                      : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Join the Seva Team Section */}
        <div className="pt-8 border-t border-slate-200">
          <div className="bg-gradient-to-br from-amber-50/50 via-white to-orange-50/40 rounded-2xl p-6 sm:p-10 border border-gold-200 shadow-sm max-w-3xl mx-auto">
            <div className="text-center space-y-2 mb-8">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-gold-100 text-gold-800 rounded-full text-xs font-semibold">
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                <span>Join Daily Hukamnama Seva</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-serif-heading">
                Volunteer Your Skills for Gurmat Seva
              </h3>
              <p className="text-xs text-slate-600 max-w-xl mx-auto">
                Dailyhukamnama.in is maintained through selfless volunteer dedication. If you wish to contribute towards translation, app development, design, or daily updates, please fill out the form below.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2 text-emerald-800 animate-fadeIn">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-base">Dhanvaad Ji! Thank You for Offering Seva</h4>
                <p className="text-xs">Your seva request has been received. Our team will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Gurpreet Singh"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone / WhatsApp Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 / Country code"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">City / Country</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Amritsar / London"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Seva Area</label>
                  <select
                    value={formData.sevaArea}
                    onChange={(e) => setFormData({ ...formData, sevaArea: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none text-xs bg-white"
                  >
                    <option>Website / Software Seva</option>
                    <option>Daily Hukamnama Update Seva</option>
                    <option>Gurbani Translation & Proofreading</option>
                    <option>WhatsApp & Social Media Broadcast Seva</option>
                    <option>Android / iOS Mobile App Seva</option>
                    <option>Audio / Kirtan Archive Seva</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tell us about yourself / Skills</label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Briefly describe your experience and how you would like to help..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none text-xs resize-none"
                  />
                </div>

                <div className="text-center pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-semibold shadow-md transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Seva Request</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
