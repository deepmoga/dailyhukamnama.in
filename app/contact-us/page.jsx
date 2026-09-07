'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageCircle, HelpCircle } from 'lucide-react';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 6000);
  };

  const faqs = [
    {
      q: 'At what time is the Daily Hukamnama updated on the website?',
      a: 'The Daily Hukamnama from Sachkhand Sri Harmandir Sahib is updated every morning between 5:30 AM to 6:30 AM IST immediately after the Amrit Vela Mukhwak ceremony.',
    },
    {
      q: 'How can I get the Daily Hukamnama on WhatsApp?',
      a: 'You can join our daily WhatsApp broadcast community or use our Nitnem Path mobile application available on the Google Play Store.',
    },
    {
      q: 'Can I download the high-resolution Daily Hukamnama photo?',
      a: 'Yes, every day\'s Hukamnama includes a download button right below the framed poster image, allowing you to save the high-resolution JPG to share with family and friends.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbf7]">
      <Header />

      {/* Hero Header */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-spiritual-navy text-white py-16 px-4 sm:px-6 lg:px-8 border-b-2 border-gold-500">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center space-x-2 bg-gold-500/20 border border-gold-400/30 px-3.5 py-1 rounded-full text-gold-300 text-xs font-semibold uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5 text-gold-400" />
            <span>We are here to help</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif-heading tracking-wide">
            Contact Us
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-light">
            Have questions, feedback, or suggestions for Daily Hukamnama? Reach out to our seva team.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-8 shadow-sm border border-gold-200 space-y-6">
            <div className="border-b border-gold-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900 font-serif-heading">
                Send Us a Message
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                We will respond to your inquiry within 24 to 48 hours.
              </p>
            </div>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-2 text-green-800">
                <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
                <h4 className="font-bold text-base">Message Sent Successfully!</h4>
                <p className="text-xs text-slate-600">
                  Thank you for reaching out. We have received your message and will get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold-500 text-sm"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold-500 text-sm"
                    placeholder="name@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold-500 text-sm"
                    placeholder="General Inquiry, Translation Feedback, App Support..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Message *</label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-gold-500 text-sm"
                    placeholder="Write your message here..."
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center space-x-2 bg-gold-500 hover:bg-gold-600 text-white font-semibold text-xs px-6 py-3 rounded-full shadow transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Contact Details & Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gold-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900 font-serif-heading border-b border-gold-100 pb-2">
                Contact Information
              </h3>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-800">Location:</strong>
                    <span>Near Sachkhand Sri Harmandir Sahib, Amritsar, Punjab, India</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-800">Email:</strong>
                    <span>support@dailyhukamnama.in</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MessageCircle className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-800">WhatsApp Broadcast:</strong>
                    <span>Available daily for Sangat</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile App promo box */}
            <div className="bg-gradient-to-br from-gold-50 via-white to-amber-50 rounded-2xl p-6 border border-gold-200 text-center space-y-3">
              <h4 className="font-bold text-sm text-slate-800">
                Nitnem Path Mobile App
              </h4>
              <p className="text-xs text-slate-600">
                Download the free Nitnem Path app on Android to receive automatic daily notifications for Hukamnama Sahib and listen to Live Kirtan.
              </p>
              <a
                href="https://play.google.com/store/apps/details?id=com.nitnem.path&hl=en_IN&gl=US"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs px-5 py-2.5 rounded-full font-medium shadow transition"
              >
                <span>Get App on Google Play</span>
              </a>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gold-200 space-y-6">
          <div className="flex items-center space-x-2 border-b border-gold-100 pb-3">
            <HelpCircle className="w-5 h-5 text-gold-600" />
            <h3 className="text-lg font-bold text-slate-900 font-serif-heading">
              Frequently Asked Questions (FAQ)
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 space-y-1">
                <h4 className="text-sm font-bold text-slate-800">
                  {faq.q}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
