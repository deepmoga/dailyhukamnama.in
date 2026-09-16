'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import GoogleRecaptcha from '@/components/GoogleRecaptcha';
import { 
  Settings, Mail, ShieldCheck, Image as ImageIcon, Save, 
  Send, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, 
  Upload, ExternalLink, RefreshCw, Key, HelpCircle, Globe
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('smtp');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    smtp_host: 'smtp.gmail.com',
    smtp_port: '465',
    smtp_secure: '1',
    smtp_user: 'rana33994@gmail.com',
    smtp_pass: 'rdfv ukzs nbdo mvir',
    smtp_from_name: 'Daily Hukamnama Seva',
    smtp_from_email: 'rana33994@gmail.com',
    notification_receiver_email: 'rana33994@gmail.com',
    recaptcha_site_key: '',
    recaptcha_secret_key: '',
    recaptcha_enabled: '0',
    site_logo: '/logo.png',
    footer_logo: '/logo.png',
    favicon: '/logo.png',
    site_title: 'Daily Hukamnama',
    site_meta_title: '',
    site_meta_desc: '',
    site_meta_keywords: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  // Test Email State
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState(null);

  // Uploading state for images
  const [uploadingField, setUploadingField] = useState(null);
  const fileInputRef = useRef(null);
  const currentUploadTarget = useRef(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.settings) {
        setFormData(prev => ({ ...prev, ...data.settings }));
      }
    } catch (err) {
      setErrorMessage('Could not load settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value,
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    setTestingEmail(true);
    setTestEmailResult(null);

    // Save first to ensure the backend uses latest settings
    await handleSave();

    try {
      const res = await fetch('/api/admin/settings/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.notification_receiver_email || formData.smtp_user }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send test email');
      }

      setTestEmailResult({ success: true, message: data.message });
    } catch (err) {
      setTestEmailResult({ success: false, message: err.message });
    } finally {
      setTestingEmail(false);
    }
  };

  const triggerUpload = (fieldName) => {
    currentUploadTarget.current = fieldName;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUploadTarget.current) return;

    const fieldName = currentUploadTarget.current;
    setUploadingField(fieldName);

    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setFormData(prev => ({
        ...prev,
        [fieldName]: data.url,
      }));
    } catch (err) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploadingField(null);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
          <p className="text-xs text-slate-500 font-medium">Loading settings...</p>
        </div>
      </AdminLayout>
    );
  }

  const tabs = [
    { id: 'smtp', label: 'Email & Google SMTP', icon: Mail },
    { id: 'captcha', label: 'Google reCAPTCHA', icon: ShieldCheck },
    { id: 'branding', label: 'Branding & Media', icon: ImageIcon },
    { id: 'seo', label: 'SEO & Meta Tags', icon: Globe },
  ];

  return (
    <AdminLayout>
      {/* Hidden file input for branding uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,.ico,.png,.jpg,.jpeg,.svg,.webp"
        className="hidden"
      />

      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header with Save Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-serif-heading">
                  System Settings
                </h2>
                <p className="text-xs text-slate-500">
                  Configure Google SMTP mail delivery, reCAPTCHA keys, and site branding logos.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {saveSuccess && (
              <span className="inline-flex items-center space-x-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved successfully!</span>
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
                  isActive
                    ? 'border-gold-500 text-gold-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Google SMTP & Email */}
        {activeTab === 'smtp' && (
          <div className="bg-white rounded-b-2xl p-6 sm:p-8 border border-t-0 border-slate-200 shadow-sm space-y-6">
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-blue-900">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Google SMTP Configuration</p>
                <p className="text-blue-700 leading-relaxed">
                  Daily Hukamnama uses your Google Gmail App Password to automatically deliver emails whenever a user submits the <strong>Contact Us</strong> or <strong>Volunteers</strong> forms.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  SMTP Host
                </label>
                <input
                  type="text"
                  name="smtp_host"
                  value={formData.smtp_host}
                  onChange={handleChange}
                  placeholder="smtp.gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  SMTP Port
                </label>
                <select
                  name="smtp_port"
                  value={formData.smtp_port}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 outline-none text-xs bg-white"
                >
                  <option value="465">465 (SSL – Recommended for Gmail)</option>
                  <option value="587">587 (TLS / STARTTLS)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Google SMTP Email / Username
                </label>
                <input
                  type="email"
                  name="smtp_user"
                  value={formData.smtp_user}
                  onChange={handleChange}
                  placeholder="rana33994@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Google App Password (16-character)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="smtp_pass"
                    value={formData.smtp_pass}
                    onChange={handleChange}
                    placeholder="rdfv ukzs nbdo mvir"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 outline-none text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Sender Display Name
                </label>
                <input
                  type="text"
                  name="smtp_from_name"
                  value={formData.smtp_from_name}
                  onChange={handleChange}
                  placeholder="Daily Hukamnama Seva"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Sender Email Address
                </label>
                <input
                  type="email"
                  name="smtp_from_email"
                  value={formData.smtp_from_email}
                  onChange={handleChange}
                  placeholder="rana33994@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 outline-none text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Notification Receiver Email (Where form inquiries & volunteers are delivered)
                </label>
                <input
                  type="email"
                  name="notification_receiver_email"
                  value={formData.notification_receiver_email}
                  onChange={handleChange}
                  placeholder="rana33994@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 outline-none text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  All messages submitted via Contact Us and Volunteers will be forwarded immediately to this inbox.
                </p>
              </div>
            </div>

            {/* Test Email Section */}
            <div className="pt-6 border-t border-slate-200">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Test SMTP Connection
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Send a real verification email to <strong>{formData.notification_receiver_email || formData.smtp_user}</strong> to confirm Google SMTP is working.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={testingEmail}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 flex-shrink-0"
                >
                  {testingEmail ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{testingEmail ? 'Sending Test...' : 'Send Test Email'}</span>
                </button>
              </div>

              {testEmailResult && (
                <div className={`mt-3 p-3.5 rounded-xl border text-xs flex items-center space-x-2 ${
                  testEmailResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {testEmailResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <span>{testEmailResult.message}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Google reCAPTCHA */}
        {activeTab === 'captcha' && (
          <div className="bg-white rounded-b-2xl p-6 sm:p-8 border border-t-0 border-slate-200 shadow-sm space-y-6">
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-900">
              <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Google reCAPTCHA v2 (Checkbox) Security</p>
                <p className="text-amber-800 leading-relaxed">
                  Google reCAPTCHA prevents automated spam bots from submitting the <strong>Contact Us</strong> form, <strong>Volunteer</strong> registrations, and protects the <strong>Admin Login</strong> against brute-force attacks.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Google reCAPTCHA Site Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="recaptcha_site_key"
                    value={formData.recaptcha_site_key}
                    onChange={handleChange}
                    placeholder="e.g. 6LdXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 outline-none text-xs font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Public site key rendered on client forms.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Google reCAPTCHA Secret Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    name="recaptcha_secret_key"
                    value={formData.recaptcha_secret_key}
                    onChange={handleChange}
                    placeholder="e.g. 6LdYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 outline-none text-xs font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Private secret key verified securely on server (never exposed to public).
                </p>
              </div>
            </div>

            {/* Status & Preview */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Protection Status
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  formData.recaptcha_site_key && formData.recaptcha_secret_key
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {formData.recaptcha_site_key && formData.recaptcha_secret_key
                    ? 'ACTIVE & PROTECTED'
                    : 'KEYS NOT SET (BYPASSED)'}
                </span>
              </div>

              {formData.recaptcha_site_key ? (
                <div className="pt-2">
                  <p className="text-xs text-slate-600 mb-2 font-medium">Live Widget Preview:</p>
                  <GoogleRecaptcha siteKey={formData.recaptcha_site_key} onVerify={() => {}} />
                </div>
              ) : (
                <div className="text-xs text-slate-500 space-y-2">
                  <p>Need Google reCAPTCHA keys? Follow these quick steps:</p>
                  <ol className="list-decimal pl-5 space-y-1 text-[11px]">
                    <li>Visit the <a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold inline-flex items-center">Google reCAPTCHA Console <ExternalLink className="w-3 h-3 ml-0.5" /></a>.</li>
                    <li>Register a new site: Select <strong>reCAPTCHA v2 ("I'm not a robot" Checkbox)</strong>.</li>
                    <li>Add your domain: <code>dailyhukamnama.in</code> (and <code>localhost</code> for local development).</li>
                    <li>Copy your <strong>Site Key</strong> and <strong>Secret Key</strong> into the fields above and click <strong>Save Settings</strong>.</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Branding & Media */}
        {activeTab === 'branding' && (
          <div className="bg-white rounded-b-2xl p-6 sm:p-8 border border-t-0 border-slate-200 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Site Logo */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      Header Site Logo
                    </h4>
                    <span className="text-[10px] text-slate-400">PNG / WebP</span>
                  </div>
                  <div className="w-full h-24 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-3 relative overflow-hidden mb-3">
                    {formData.site_logo ? (
                      <img
                        src={formData.site_logo}
                        alt="Site Logo Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">No logo set</span>
                    )}
                  </div>
                  <input
                    type="text"
                    name="site_logo"
                    value={formData.site_logo}
                    onChange={handleChange}
                    placeholder="/logo.png"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => triggerUpload('site_logo')}
                  disabled={uploadingField === 'site_logo'}
                  className="w-full inline-flex items-center justify-center space-x-2 py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-medium shadow-xs transition"
                >
                  {uploadingField === 'site_logo' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gold-500" />
                  ) : (
                    <Upload className="w-4 h-4 text-slate-500" />
                  )}
                  <span>{uploadingField === 'site_logo' ? 'Uploading...' : 'Upload New Logo'}</span>
                </button>
              </div>

              {/* Footer Logo */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      Footer Logo
                    </h4>
                    <span className="text-[10px] text-slate-400">PNG / WebP</span>
                  </div>
                  <div className="w-full h-24 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center p-3 relative overflow-hidden mb-3">
                    {formData.footer_logo ? (
                      <img
                        src={formData.footer_logo}
                        alt="Footer Logo Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">No logo set</span>
                    )}
                  </div>
                  <input
                    type="text"
                    name="footer_logo"
                    value={formData.footer_logo}
                    onChange={handleChange}
                    placeholder="/logo.png"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => triggerUpload('footer_logo')}
                  disabled={uploadingField === 'footer_logo'}
                  className="w-full inline-flex items-center justify-center space-x-2 py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-medium shadow-xs transition"
                >
                  {uploadingField === 'footer_logo' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gold-500" />
                  ) : (
                    <Upload className="w-4 h-4 text-slate-500" />
                  )}
                  <span>{uploadingField === 'footer_logo' ? 'Uploading...' : 'Upload Footer Logo'}</span>
                </button>
              </div>

              {/* Favicon */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      Website Favicon
                    </h4>
                    <span className="text-[10px] text-slate-400">ICO / PNG (32x32)</span>
                  </div>
                  <div className="w-full h-24 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-3 relative overflow-hidden mb-3">
                    {formData.favicon ? (
                      <img
                        src={formData.favicon}
                        alt="Favicon Preview"
                        className="w-8 h-8 object-contain shadow-xs border p-1 rounded"
                      />
                    ) : (
                      <span className="text-xs text-slate-400">No favicon set</span>
                    )}
                  </div>
                  <input
                    type="text"
                    name="favicon"
                    value={formData.favicon}
                    onChange={handleChange}
                    placeholder="/logo.png"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => triggerUpload('favicon')}
                  disabled={uploadingField === 'favicon'}
                  className="w-full inline-flex items-center justify-center space-x-2 py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-medium shadow-xs transition"
                >
                  {uploadingField === 'favicon' ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gold-500" />
                  ) : (
                    <Upload className="w-4 h-4 text-slate-500" />
                  )}
                  <span>{uploadingField === 'favicon' ? 'Uploading...' : 'Upload Favicon'}</span>
                </button>
              </div>
            </div>

            {/* Site Title */}
            <div className="pt-4 border-t border-slate-200">
              <label className="block font-semibold text-slate-700 text-xs mb-1.5">
                Site Title
              </label>
              <input
                type="text"
                name="site_title"
                value={formData.site_title}
                onChange={handleChange}
                placeholder="Daily Hukamnama"
                className="w-full sm:w-1/2 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 outline-none text-xs"
              />
            </div>
          </div>
        )}

        {/* TAB 4: SEO & Meta Tags */}
        {activeTab === 'seo' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
            <div className="border-b border-slate-200 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Globe className="w-5 h-5 text-gold-500" />
                <span>Default Site SEO & Meta Tags</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Configure default title, description and keywords across the website for search engines.
              </p>
            </div>

            {/* Meta Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Default Site Meta Title
                </label>
                <span
                  className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border transition-colors ${
                    (formData.site_meta_title || '').length === 0
                      ? 'text-slate-400 bg-slate-50 border-slate-200'
                      : (formData.site_meta_title || '').length <= 60
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
                      : 'text-rose-700 bg-rose-50 border-rose-300'
                  }`}
                >
                  {(formData.site_meta_title || '').length}/60 chars
                </span>
              </div>
              <input
                type="text"
                name="site_meta_title"
                value={formData.site_meta_title || ''}
                onChange={handleChange}
                placeholder="Today's Daily Hukamnama | Sachkhand Sri Harmandir Sahib Amritsar"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition focus:bg-white ${
                  (formData.site_meta_title || '').length === 0
                    ? 'border-slate-300 focus:ring-2 focus:ring-gold-500'
                    : (formData.site_meta_title || '').length <= 60
                    ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-500'
                    : 'border-rose-400 focus:ring-2 focus:ring-rose-500'
                }`}
              />
              <div className="flex items-center justify-between mt-1 text-[10px]">
                <span className="text-slate-400">Default title tag across pages.</span>
                <span className={(formData.site_meta_title || '').length > 60 ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                  {(formData.site_meta_title || '').length > 60
                    ? `⚠️ ${(formData.site_meta_title || '').length - 60} chars over recommended 60`
                    : '✓ Recommended: up to 60 characters'}
                </span>
              </div>
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Default Meta Description
                </label>
                <span
                  className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border transition-colors ${
                    (formData.site_meta_desc || '').length === 0
                      ? 'text-slate-400 bg-slate-50 border-slate-200'
                      : (formData.site_meta_desc || '').length <= 160
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
                      : 'text-rose-700 bg-rose-50 border-rose-300'
                  }`}
                >
                  {(formData.site_meta_desc || '').length}/160 chars
                </span>
              </div>
              <textarea
                name="site_meta_desc"
                rows={3}
                value={formData.site_meta_desc || ''}
                onChange={handleChange}
                placeholder="Read today's Daily Hukamnama (Mukhwak) from Sachkhand Sri Harmandir Sahib (Golden Temple), Amritsar with Gurmukhi text, Punjabi Viakhya, English and Hindi translations."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none resize-none transition focus:bg-white ${
                  (formData.site_meta_desc || '').length === 0
                    ? 'border-slate-300 focus:ring-2 focus:ring-gold-500'
                    : (formData.site_meta_desc || '').length <= 160
                    ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-500'
                    : 'border-rose-400 focus:ring-2 focus:ring-rose-500'
                }`}
              />
              <div className="flex items-center justify-between mt-1 text-[10px]">
                <span className="text-slate-400">Search engine summary snippet.</span>
                <span className={(formData.site_meta_desc || '').length > 160 ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                  {(formData.site_meta_desc || '').length > 160
                    ? `⚠️ ${(formData.site_meta_desc || '').length - 160} chars over recommended 160`
                    : '✓ Recommended: up to 160 characters'}
                </span>
              </div>
            </div>

            {/* Meta Keywords */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Default Meta Keywords
                </label>
                <span
                  className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border transition-colors ${
                    (formData.site_meta_keywords || '').length === 0
                      ? 'text-slate-400 bg-slate-50 border-slate-200'
                      : (formData.site_meta_keywords || '').length <= 60
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
                      : 'text-rose-700 bg-rose-50 border-rose-300'
                  }`}
                >
                  {(formData.site_meta_keywords || '').length}/60 chars
                </span>
              </div>
              <input
                type="text"
                name="site_meta_keywords"
                value={formData.site_meta_keywords || ''}
                onChange={handleChange}
                placeholder="daily hukamnama, hukamnama today, golden temple hukamnama"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition focus:bg-white ${
                  (formData.site_meta_keywords || '').length === 0
                    ? 'border-slate-300 focus:ring-2 focus:ring-gold-500'
                    : (formData.site_meta_keywords || '').length <= 60
                    ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-500'
                    : 'border-rose-400 focus:ring-2 focus:ring-rose-500'
                }`}
              />
              <div className="flex items-center justify-between mt-1 text-[10px]">
                <span className="text-slate-400">Separate keywords with commas.</span>
                <span className={(formData.site_meta_keywords || '').length > 60 ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                  {(formData.site_meta_keywords || '').length > 60
                    ? `⚠️ ${(formData.site_meta_keywords || '').length - 60} chars over recommended 60`
                    : '✓ Recommended: up to 60 characters'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
