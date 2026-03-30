import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <nav className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-blue-400">FeedPulse</span>
          <span className="text-xs text-gray-500 mt-1">AI-Powered Feedback</span>
        </div>
        <Link
          href="/admin/login"
          className="text-sm text-gray-400 hover:text-white transition"
        >
          Admin Login →
        </Link>
      </nav>

      {/* Hero */}
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Share Your <span className="text-blue-400">Feedback</span>
        </h1>
        <p className="text-gray-400 mb-8">
          Help us improve by sharing your thoughts, reporting bugs, or requesting new features.
          Our AI analyses every submission instantly.
        </p>
        <Link
          href="/feedback"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition"
        >
          Submit Feedback
        </Link>
      </div>
    </main>
  );
}