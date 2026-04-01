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
  originalLanguage?: string;
  translatedTitle?: string;
  translatedDescription?: string;
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
  const [languageFilter, setLanguageFilter] = useState("");
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

  const generateProfessionalPdf = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const autoTableModule = await import("jspdf-autotable");
      const autoTable = autoTableModule.default;

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();
      const now = new Date();

      const reportTitle = "FeedPulse Professional Feedback Report";
      const generatedAt = now.toLocaleString();
      const total = feedbacks.length;
      const newCount = feedbacks.filter((f) => f.status === "New").length;
      const reviewCount = feedbacks.filter((f) => f.status === "In Review").length;
      const resolvedCount = feedbacks.filter((f) => f.status === "Resolved").length;

      const categoryCounts = {
        Bug: feedbacks.filter((f) => f.category === "Bug").length,
        "Feature Request": feedbacks.filter((f) => f.category === "Feature Request").length,
        Improvement: feedbacks.filter((f) => f.category === "Improvement").length,
        Other: feedbacks.filter((f) => f.category === "Other").length,
      };

      const sentimentCounts = {
        Positive: feedbacks.filter((f) => f.aiSentiment === "Positive").length,
        Neutral: feedbacks.filter((f) => f.aiSentiment === "Neutral").length,
        Negative: feedbacks.filter((f) => f.aiSentiment === "Negative").length,
      };

      const averagePriority =
        feedbacks.filter((f) => typeof f.aiPriority === "number").reduce((sum, f) => sum + (f.aiPriority || 0), 0) /
        (feedbacks.filter((f) => typeof f.aiPriority === "number").length || 1);

      const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
      const topSentiment = Object.entries(sentimentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

      const addHeaderFooter = (data: any) => {
        doc.setFontSize(10);
        doc.setTextColor("#555555");
        doc.text("FeedPulse Inc.", 40, 40);
        doc.text(`Generated: ${generatedAt}`, width - 170, 40, { align: "right" });

        doc.setFontSize(8);
        doc.setTextColor("#888888");
        const pageCount = doc.internal.getNumberOfPages();
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, width - 40, height - 30, { align: "right" });
        doc.text("Confidential - Internal Use Only", 40, height - 30);
      };

      doc.setFontSize(18);
      doc.setTextColor("#1F2937");
      doc.text(reportTitle, width / 2, 80, { align: "center" });

      doc.setFontSize(12);
      doc.setTextColor("#374151");
      doc.text(`Report Date: ${generatedAt}`, 40, 110);
      doc.text(
        `Total Feedback: ${total}  |  New: ${newCount}  |  In Review: ${reviewCount}  |  Resolved: ${resolvedCount}`,
        40,
        130,
      );

      doc.setFontSize(11);
      doc.text("Major Insights:", 40, 160);
      doc.setFontSize(10);
      doc.text(
        `Top category: ${topCategory}  |  Top sentiment: ${topSentiment}  |  Average AI priority: ${averagePriority.toFixed(1)}`,
        40,
        176,
        { maxWidth: width - 80 },
      );

      doc.setFontSize(11);
      doc.text("Category Breakdown:", 40, 198);
      doc.setFontSize(10);
      doc.text(
        `Bug: ${categoryCounts.Bug}, Feature Request: ${categoryCounts["Feature Request"]}, Improvement: ${categoryCounts.Improvement}, Other: ${categoryCounts.Other}`,
        40,
        214,
        { maxWidth: width - 80 },
      );

      doc.setFontSize(11);
      doc.text("Sentiment Breakdown:", 40, 236);
      doc.setFontSize(10);
      doc.text(
        `Positive: ${sentimentCounts.Positive}, Neutral: ${sentimentCounts.Neutral}, Negative: ${sentimentCounts.Negative}`,
        40,
        252,
        { maxWidth: width - 80 },
      );

      const recordsBody = feedbacks.map((item) => [
        item.title,
        item.originalLanguage?.toUpperCase() || "N/A",
        item.translatedTitle || "-",
        item.category,
        item.status,
        item.aiSentiment || "N/A",
        item.aiPriority ? `P${item.aiPriority}` : "N/A",
        item.submitterName || "Anonymous",
        item.submitterEmail || "n/a",
        new Date(item.createdAt).toLocaleDateString(),
        item.aiTags?.join(", ") || "-",
      ]);

      autoTable(doc, {
        startY: 280,
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [15, 23, 42], textColor: "#ffffff" },
        theme: "grid",
        head: [["Title", "Lang", "Translated Title", "Category", "Status", "Sentiment", "Priority", "Submitter", "Email", "Created", "Tags"]],
        body: recordsBody,
        didDrawPage: addHeaderFooter,
        margin: { top: 270, bottom: 40 },
      });

      const detailsStartY = doc.previousAutoTable?.finalY ? doc.previousAutoTable.finalY + 20 : 280;
      if (feedbacks.length > 0) {
        const detailsBody = feedbacks.map((item) => [
          item.title,
          item.originalLanguage?.toUpperCase() || "N/A",
          item.description.replace(/\n/g, " ").substring(0, 180),
          item.translatedDescription
            ? item.translatedDescription.replace(/\n/g, " ").substring(0, 220)
            : "-",
          item.aiSummary || "-",
          item.aiTags?.join(", ") || "-",
        ]);

        autoTable(doc, {
          startY: detailsStartY,
          styles: { fontSize: 8, cellPadding: 4 },
          headStyles: { fillColor: [31, 41, 55], textColor: "#ffffff" },
          theme: "striped",
          head: [["Title", "Lang", "Original Desc", "Translated Desc", "AI Summary", "AI Tags"]],
          body: detailsBody,
          didDrawPage: addHeaderFooter,
          margin: { bottom: 40 },
          columnStyles: {
            2: { cellWidth: 120 },
            3: { cellWidth: 130 },
            4: { cellWidth: 130 },
            5: { cellWidth: 100 },
          },
        });
      }

      doc.save(`FeedPulse_Professional_Report_${now.toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Unable to generate PDF. Please install jsPDF and jspdf-autotable dependencies or check console for detail.");
    }
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
    const matchesLanguage = languageFilter
      ? feedback.originalLanguage === languageFilter
      : true;

    return matchesSearch && matchesCategory && matchesStatus && matchesLanguage;
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

          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            aria-label="Filter by language"
          >
            <option value="">All Languages</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="hi">Hindi</option>
            <option value="zh">Chinese</option>
          </select>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={generateProfessionalPdf}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
              aria-label="Export  PDF"
            >
              Export Professional PDF
            </button>

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
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{feedback.title}</h3>
                      {feedback.originalLanguage && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-900 text-indigo-300 border border-indigo-700">
                          {feedback.originalLanguage.toUpperCase()}
                        </span>
                      )}
                    </div>
                    {feedback.translatedTitle && feedback.translatedTitle !== feedback.title ? (
                      <p className="text-cyan-300 text-sm italic mb-1">
                        Translated Title: {feedback.translatedTitle}
                      </p>
                    ) : null}
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

                {/* Translated Description */}
                {feedback.translatedDescription && feedback.translatedDescription !== feedback.description && (
                  <p className="text-cyan-200 text-sm mb-2 italic">
                    Translated: {feedback.translatedDescription}
                  </p>
                )}

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
