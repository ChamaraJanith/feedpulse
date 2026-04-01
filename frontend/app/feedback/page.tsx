'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FeedbackForm {
  title: string;
  description: string;
  category: string;
  submitterName: string;
  submitterEmail: string;
}

export default function FeedbackPage() {
  const [form, setForm] = useState<FeedbackForm>({
    title: '',
    description: '',
    category: 'Feature Request',
    submitterName: '',
    submitterEmail: '',
  });

  const [errors, setErrors] = useState<Partial<FeedbackForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'es' | 'fr' | 'de' | 'hi' | 'zh'>('en');

  const validate = (): boolean => {
    const newErrors: Partial<FeedbackForm> = {};

    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (form.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
    if (!form.category) {
      newErrors.category = 'Category is required';
    }
    // Only validate email format if the user actually typed something
    if (form.submitterEmail && !/^\S+@\S+\.\S+$/.test(form.submitterEmail)) {
      newErrors.submitterEmail = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Added a fallback for the API URL to prevent crashes
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          originalLanguage: selectedLanguage,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus('success');
        setForm({
          title: '',
          description: '',
          category: 'Feature Request',
          submitterName: '',
          submitterEmail: '',
        });
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-400">
          FeedPulse
        </Link>
        <Link href="/admin/login" className="text-sm text-gray-400 hover:text-white transition">
          Admin Login →
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Submit Feedback</h1>
        <p className="text-gray-400 mb-8">
          Your feedback is analysed instantly by AI to help us prioritise better.
        </p>

        {/* Success State */}
        {submitStatus === 'success' && (
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mb-6">
            <p className="text-green-400 font-medium">
              Feedback submitted successfully! Our AI is analysing it now.
            </p>
          </div>
        )}

        {/* Error State */}
        {submitStatus === 'error' && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-400 font-medium">
              Something went wrong. Please try again.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Brief summary of your feedback"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
            >
              <option>Bug</option>
              <option>Feature Request</option>
              <option>Improvement</option>
              <option>Other</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-2">
              Feedback Language <span className="text-red-400">*</span>
            </label>
            <select
              id="language"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as 'en' | 'es' | 'fr' | 'de' | 'hi' | 'zh')}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="hi">Hindi</option>
              <option value="zh">Chinese</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              This helps AI find the correct original language and translate automatically.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Please describe your feedback in detail (minimum 20 characters)"
              rows={5}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition resize-none"
            />
            <div className="flex justify-between mt-1">
              {errors.description ? (
                <p className="text-red-400 text-sm">{errors.description}</p>
              ) : (
                <span />
              )}
              <span className={`text-sm ${form.description.length < 20 ? 'text-red-400' : 'text-green-400'}`}>
                {form.description.length} / 20 min
              </span>
            </div>
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name <span className="text-gray-500">(optional)</span>
              </label>
              <input
                type="text"
                value={form.submitterName}
                onChange={(e) => setForm({ ...form, submitterName: e.target.value })}
                placeholder="Your name"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email <span className="text-gray-500">(optional)</span>
              </label>
              <input
                type="email"
                value={form.submitterEmail}
                onChange={(e) => setForm({ ...form, submitterEmail: e.target.value })}
                placeholder="your@email.com"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              />
              {errors.submitterEmail && (
                <p className="text-red-400 text-sm mt-1">{errors.submitterEmail}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </main>
  );
}