"use client";

import { useState, useEffect } from "react";
import ETISidebar from "@/components/layout/DabangSidebar";
import ETIHeader from "@/components/layout/DabangHeader";
import { Trash2, Mail, Phone, User, Calendar, X } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";

interface FormSubmission {
  id: number;
  name: string;
  email: string;
  phone: string;
  website_url: string | null;
  user_ip: string | null;
  user_agent: string | null;
  session_id: string | null;
  created_at: string;
}

export default function FormsPage() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_ENDPOINTS.forms.list);
      if (!response.ok) {
        throw new Error("Failed to load form submissions");
      }
      const data = await response.json();
      setSubmissions(data);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Failed to load form submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this submission?")) {
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.forms.delete(id), {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete submission");
      }

      setSubmissions(submissions.filter((s) => s.id !== id));
    } catch (err) {
      alert(err instanceof Error && err.message ? err.message : "Failed to delete submission");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Use browser's local timezone automatically
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="lg:flex lg:h-screen w-full bg-[var(--eti-canvas)] lg:overflow-hidden">
      {/* Left Sidebar */}
      <ETISidebar />

      {/* Main Content */}
      <div className="min-w-0 lg:flex-1 lg:flex lg:flex-col lg:overflow-hidden">
        {/* Header */}
        <ETIHeader />

        {/* Content */}
        <div className="eti-page bg-[var(--eti-canvas)] lg:flex-1 lg:overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <X className="w-5 h-5 text-[var(--eti-critical)]" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-[var(--eti-critical)] hover:text-red-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12 text-[var(--eti-ink-subtle)]">Loading submissions...</div>
            ) : submissions.length === 0 ? (
              <div className="eti-card p-8 text-center">
                <Mail className="w-16 h-16 mx-auto mb-4 text-[var(--eti-ink-subtle)]" />
                <h3 className="text-lg font-semibold text-[var(--eti-ink)] mb-2">No submissions yet</h3>
                <p className="text-sm text-[var(--eti-ink-subtle)]">
                  Form submissions from the bot widget will appear here
                </p>
              </div>
            ) : (
              <div className="eti-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#f7f9fb] border-b border-[var(--eti-border)]">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {submissions.map((submission) => (
                        <tr key={submission.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-[var(--eti-ink-subtle)]" />
                              <span className="text-sm font-medium text-[var(--eti-ink)]">
                                {submission.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-[var(--eti-ink-subtle)]" />
                              <span className="text-sm text-gray-700">{submission.email}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-[var(--eti-ink-subtle)]" />
                              <span className="text-sm text-gray-700">{submission.phone}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[var(--eti-ink-subtle)]" />
                              <span className="text-sm text-gray-700">
                                {formatDate(submission.created_at)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDelete(submission.id)}
                              className="text-[var(--eti-critical)] hover:text-red-900 flex items-center gap-1 ml-auto cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

