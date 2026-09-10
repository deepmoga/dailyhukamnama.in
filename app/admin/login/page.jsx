'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import GoogleRecaptcha from '@/components/GoogleRecaptcha';
import { Lock, User, Key, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recaptchaSiteKey, setRecaptchaSiteKey] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const recaptchaRef = useRef(null);

  useEffect(() => {
    async function loadPublicSettings() {
      try {
        const res = await fetch('/api/public/settings');
        const data = await res.json();
        if (data.settings?.recaptcha_site_key) {
          setRecaptchaSiteKey(data.settings.recaptcha_site_key);
        }
      } catch (err) {
        console.warn('Could not load public settings:', err);
      }
    }
    loadPublicSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, captchaToken }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials');
      }

      router.push('/admin');
    } catch (err) {
      setError(err.message);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle spiritual background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-white rounded-2xl p-2 shadow-xl border-2 border-gold-400 flex items-center justify-center relative">
            <Image src="/logo.png" alt="Daily Hukamnama Logo" width={56} height={56} className="object-contain" />
          </div>
        </div>
        <h2 className="mt-5 text-center text-2xl font-bold tracking-tight text-white font-serif-heading">
          Daily Hukamnama Admin
        </h2>
        <p className="mt-1 text-center text-xs text-gold-400 font-gurmukhi">
          ਸ੍ਰੀ ਦਰਬਾਰ ਸਾਹਿਬ, ਅੰਮ੍ਰਿਤਸਰ
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-sm py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-700/30">
          <div className="mb-6 flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-gold-600 flex-shrink-0" />
            <span>Default credentials are pre-filled: <strong>admin</strong> / <strong>admin123</strong></span>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-shake">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-gold-500 text-slate-900 outline-none transition"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:border-gold-500 text-slate-900 outline-none transition"
                  placeholder="Enter password"
                />
              </div>
            </div>

            {recaptchaSiteKey && (
              <div className="flex justify-center">
                <GoogleRecaptcha
                  ref={recaptchaRef}
                  siteKey={recaptchaSiteKey}
                  onVerify={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken('')}
                />
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gold-500 hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Admin Panel</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-xs text-slate-500 hover:text-gold-600 transition"
            >
              ← Back to Daily Hukamnama Website
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
