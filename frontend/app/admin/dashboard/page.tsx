"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Feedback {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  submitterName?: string;
  submitterEmail?: string;
  aiCategory?: string;
  aiSentiment?: string;
  aiPriority?: number;
  aiSummary?: string;
  aiTags?: string[];
  aiProcessed: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showReport, setShowReport] = useState(false);

  const totalFeedbacks = feedbacks.length;
  const newCount = feedbacks.filter((f) => f.status === "New").length;
  const inReviewCount = feedbacks.filter(
    (f) => f.status === "In Review",
  ).length;
  const resolvedCount = feedbacks.filter((f) => f.status === "Resolved").length;

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    fetchFeedbacks(token);
  }, [categoryFilter, statusFilter]);

  const fetchFeedbacks = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const params = new URLSearchParams();
      if (categoryFilter) params.append("category", categoryFilter);
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`${apiUrl}/api/feedback?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) setFeedbacks(data.data);
    } catch (error) {
      console.error("Failed to fetch feedbacks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiUrl}/api/feedback/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (data.success) {
        setFeedbacks((prev) =>
          prev.map((f) => (f._id === id ? { ...f, status } : f)),
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  const getSentimentColor = (sentiment?: string) => {
    if (sentiment === "Positive")
      return "bg-green-900/50 text-green-400 border-green-700";
    if (sentiment === "Negative")
      return "bg-red-900/50 text-red-400 border-red-700";
    return "bg-yellow-900/50 text-yellow-400 border-yellow-700";
  };

  const getStatusColor = (status: string) => {
    if (status === "Resolved") return "bg-green-900/50 text-green-400";
    if (status === "In Review") return "bg-blue-900/50 text-blue-400";
    return "bg-gray-800 text-gray-400";
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const matchesSearch =
      feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.aiSummary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.aiTags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesCategory = categoryFilter
      ? feedback.category === categoryFilter
      : true;
    const matchesStatus = statusFilter
      ? feedback.status === statusFilter
      : true;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  const categoryCounts = {
    Bug: feedbacks.filter((f) => f.category === 'Bug').length,
    'Feature Request': feedbacks.filter((f) => f.category === 'Feature Request').length,
    Improvement: feedbacks.filter((f) => f.category === 'Improvement').length,
    Other: feedbacks.filter((f) => f.category === 'Other').length,
  };

const sentimentCounts = {
  Positive: feedbacks.filter((f) => f.aiSentiment === 'Positive').length,
  Neutral: feedbacks.filter((f) => f.aiSentiment === 'Neutral').length,
  Negative: feedbacks.filter((f) => f.aiSentiment === 'Negative').length,
};

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <span className="text-xl font-bold text-blue-400">FeedPulse Admin</span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          Logout →
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Feedback Dashboard</h1>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search feedback..."
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 w-64"
            aria-label="Search feedback"
          />

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            <option>Bug</option>
            <option>Feature Request</option>
            <option>Improvement</option>
            <option>Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option>New</option>
            <option>In Review</option>
            <option>Resolved</option>
          </select>

          <div className="ml-auto">
            <button
              onClick={() => setShowReport((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
              aria-label={showReport ? "Hide Feedback Report" : "Generate Feedback Report"}
            >
              {showReport ? "Hide Report" : "Generate Summary"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-2">Total Feedback</p>
            <h2 className="text-2xl font-bold text-white">{totalFeedbacks}</h2>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-2">New</p>
            <h2 className="text-2xl font-bold text-yellow-400">{newCount}</h2>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-2">In Review</p>
            <h2 className="text-2xl font-bold text-blue-400">
              {inReviewCount}
            </h2>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-sm text-gray-400 mb-2">Resolved</p>
            <h2 className="text-2xl font-bold text-green-400">
              {resolvedCount}
            </h2>
          </div>
        </div>

        {showReport && (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
    <h2 className="text-xl font-bold mb-4 text-white">Feedback Report</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-blue-400">Category Breakdown</h3>
        <ul className="space-y-1 text-gray-300">
          <li>Bug: {categoryCounts.Bug}</li>
          <li>Feature Request: {categoryCounts['Feature Request']}</li>
          <li>Improvement: {categoryCounts.Improvement}</li>
          <li>Other: {categoryCounts.Other}</li>
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2 text-green-400">Sentiment Breakdown</h3>
        <ul className="space-y-1 text-gray-300">
          <li>Positive: {sentimentCounts.Positive}</li>
          <li>Neutral: {sentimentCounts.Neutral}</li>
          <li>Negative: {sentimentCounts.Negative}</li>
        </ul>
      </div>
    </div>

    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2 text-purple-400">Summary</h3>
      <p className="text-gray-300 leading-7">
        A total of {feedbacks.length} feedback item(s) have been submitted. Most feedback is currently in the
        "{feedbacks.filter((f) => f.status === 'New').length > 0 ? 'New' : 'tracked'}" stage, and the dominant category appears to be
        {" "}
        {Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0]}.
        Overall sentiment is mostly {Object.entries(sentimentCounts).sort((a, b) => b[1] - a[1])[0][0].toLowerCase()}.
      </p>
    </div>
  </div>
)}

        {/* Feedback Table */}
        {filteredFeedbacks.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No feedback found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedbacks.map((feedback) => (
              <div
                key={feedback._id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{feedback.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {feedback.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {/* Sentiment Badge */}
                    {feedback.aiSentiment && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${getSentimentColor(feedback.aiSentiment)}`}
                      >
                        {feedback.aiSentiment}
                      </span>
                    )}
                    {/* Priority Badge */}
                    {feedback.aiPriority && (
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-900/50 text-purple-400 border border-purple-700">
                        P{feedback.aiPriority}
                      </span>
                    )}
                  </div>
                </div>

                {/* AI Summary */}
                {feedback.aiSummary && (
                  <p className="text-blue-300 text-sm mb-3 italic">
                    AI: {feedback.aiSummary}
                  </p>
                )}

                {/* Tags */}
                {feedback.aiTags && feedback.aiTags.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-3">
                    {feedback.aiTags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>{feedback.category}</span>
                    <span>•</span>
                    <span>
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </span>
                    {feedback.submitterName && (
                      <>
                        <span>•</span>
                        <span>{feedback.submitterName}</span>
                      </>
                    )}
                  </div>

                  {/* Status Selector */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(feedback.status)}`}
                    >
                      {feedback.status}
                    </span>
                    <select
                      value={feedback.status}
                      onChange={(e) =>
                        updateStatus(feedback._id, e.target.value)
                      }
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                      aria-label="Update feedback status"
                    >
                      <option>New</option>
                      <option>In Review</option>
                      <option>Resolved</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
