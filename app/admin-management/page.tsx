"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";
import { getAuthToken, removeAuthToken, getAdminUser } from "@/lib/auth";
import { Trash2, Plus, Users, KeyRound, Loader2 } from "lucide-react";
import ETISidebar from "@/components/layout/DabangSidebar";
import ETIHeader from "@/components/layout/DabangHeader";

interface Admin {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_superuser: boolean;
}

/** Mirrors the server-side policy in app/router/admin.py. The server remains
 *  the authority; this only tells the user what is expected before they submit. */
const PASSWORD_RULES: { label: string; test: (v: string) => boolean }[] = [
  { label: "At least 10 characters", test: (v) => v.length >= 10 },
  { label: "An uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "A lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "A number", test: (v) => /[0-9]/.test(v) },
  { label: "A symbol", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

function passwordMeetsPolicy(value: string) {
  return PASSWORD_RULES.every((r) => r.test(value));
}

function PasswordChecklist({ value }: { value: string }) {
  if (!value) {
    return (
      <p className="mt-1.5 text-[11.5px] text-[var(--eti-ink-subtle)]">
        At least 10 characters, with upper and lower case, a number and a symbol.
      </p>
    );
  }
  return (
    <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(value);
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-1.5 text-[11.5px] ${
              ok ? "text-[var(--eti-good)]" : "text-[var(--eti-ink-subtle)]"
            }`}
          >
            <span
              aria-hidden="true"
              className={`inline-block w-1.5 h-1.5 rounded-full ${
                ok ? "bg-[var(--eti-good)]" : "bg-[var(--eti-border-strong)]"
              }`}
            />
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

export default function AdminManagementPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Password Reset State
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);

  useEffect(() => {
    // Check if user is super admin
    const userStr = localStorage.getItem("admin_user");
    if (!userStr) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (!user.is_superuser) {
        router.push("/");
        return;
      }
    } catch {
      router.push("/login");
      return;
    }

    loadAdmins();
  }, [router]);

  const loadAdmins = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(apiUrl("api/admin/list"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          removeAuthToken();
          router.push("/login");
          return;
        }
        throw new Error("Failed to load admins");
      }

      const data = await response.json();
      setAdmins(data);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(apiUrl("api/admin/create"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create admin");
      }

      // Reset form and reload admins
      setFormData({ email: "", password: "", first_name: "", last_name: "" });
      setShowForm(false);
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminId || !newPassword) return;

    setResetSubmitting(true);
    setError("");

    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(apiUrl(`api/admin/${selectedAdminId}/reset-password`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to reset password");
      }

      alert("Password reset successfully");
      setShowResetPassword(false);
      setNewPassword("");
      setSelectedAdminId(null);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Failed to reset password");
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleDelete = async (adminId: number) => {
    if (!confirm("Are you sure you want to delete this admin?")) {
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(apiUrl(`api/admin/${adminId}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete admin");
      }

      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Failed to delete admin");
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="lg:flex lg:h-screen bg-[var(--eti-canvas)] lg:overflow-hidden">
        <ETISidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="mt-4 text-[var(--eti-ink-muted)]">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:flex lg:h-screen bg-[var(--eti-canvas)] lg:overflow-hidden">
      {/* Left Sidebar */}
      <ETISidebar />

      {/* Main Content */}
      <div className="min-w-0 lg:flex-1 lg:flex lg:flex-col lg:overflow-hidden">
        {/* Header */}
        <ETIHeader />

        {/* Main Content */}
        <div className="eti-page bg-[var(--eti-canvas)] lg:flex-1 lg:overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-[var(--eti-critical)]">{error}</p>
              </div>
            )}

            {/* Create Admin Button */}
            <div className="mb-4">
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium cursor-pointer"
              >
                {!showForm && <Plus className="w-5 h-5" />}
                {showForm ? "Cancel" : "Create New Admin"}
              </button>
            </div>

            {/* Create Admin Form */}
            {showForm && (
              <div className="mb-6 eti-card p-6">
                <h2 className="text-xl font-semibold text-[var(--eti-ink)] mb-4">Create New Admin</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 border border-[var(--eti-border-strong)] rounded-[10px] bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        required
                        className="w-full px-4 py-2.5 border border-[var(--eti-border-strong)] rounded-[10px] bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border border-[var(--eti-border-strong)] rounded-[10px] bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={10}
                      autoComplete="new-password"
                      className="w-full px-4 py-2.5 border border-[var(--eti-border-strong)] rounded-[10px] bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    />
                    <PasswordChecklist value={formData.password} />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !passwordMeetsPolicy(formData.password)}
                    className="eti-btn eti-btn-primary"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      "Create Admin"
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Admins List */}
            <div className="eti-card overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[var(--eti-border)] bg-[#f7f9fb]">
                <h2 className="text-lg font-semibold text-[var(--eti-ink)]">Admin Accounts</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {admins.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-[var(--eti-ink-subtle)]">
                          <Users className="w-12 h-12 mx-auto mb-3 text-[var(--eti-ink-subtle)]" />
                          <p className="text-sm">No admins found. Create your first admin account.</p>
                        </td>
                      </tr>
                    ) : (
                      admins.map((admin) => (
                        <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <div className="text-sm font-medium text-[var(--eti-ink)]">
                              {admin.first_name} {admin.last_name}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <div className="text-sm text-[var(--eti-ink-muted)]">{admin.email}</div>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-secondary-100 text-secondary-800">
                              Admin
                            </span>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedAdminId(admin.id);
                                setShowResetPassword(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer mr-2"
                            >
                              <KeyRound className="w-4 h-4" />
                              Reset
                            </button>
                            {!admin.is_superuser && (
                              <button
                                onClick={() => handleDelete(admin.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[var(--eti-critical)] hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reset Password Modal */}
            {showResetPassword && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="eti-card eti-card-pad w-full max-w-md shadow-[var(--eti-shadow-lg)]">
                  <h2 className="text-xl font-semibold mb-4 text-[var(--eti-ink)]">Reset Password</h2>
                  <form onSubmit={handleResetPassword}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={resetSubmitting}
                        className="w-full px-3 py-2 border border-[var(--eti-border-strong)] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                        minLength={10}
                        autoComplete="new-password"
                      />
                      <PasswordChecklist value={newPassword} />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(false)}
                        disabled={resetSubmitting}
                        className="px-4 py-2 text-[var(--eti-ink-muted)] hover:bg-gray-100 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={resetSubmitting}
                        className="eti-btn eti-btn-primary"
                      >
                        {resetSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Resetting…
                          </>
                        ) : (
                          "Reset Password"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

