"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("admin_token");
    if (token) {
      // Everyone lands on the dashboard, super admin included
      router.push("/");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(apiUrl("api/admin/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // Store token in localStorage
      localStorage.setItem("admin_token", data.access_token);
      localStorage.setItem("admin_user", JSON.stringify(data.user));

      // Every admin lands on the dashboard; the super admin reaches
      // Admin Management and the Activity Log from the sidebar.
      router.push("/");
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full lg:h-screen lg:overflow-hidden grid lg:grid-cols-[1.05fr_1fr] bg-[var(--eti-canvas)]">
      {/* Brand panel - hidden on small screens where it would just push the form down */}
      <div className="relative hidden lg:flex flex-col overflow-hidden bg-[var(--color-primary)] text-white p-12">
        {/* Brand footage behind the panel. Muted + playsInline so mobile browsers
            will autoplay it, and aria-hidden because it carries no information. */}
        <video
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          src="/images/assets/eti-home.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        {/* Navy wash: the copy sits on top of moving footage, so it needs a
            consistent ground rather than whatever frame happens to be showing. */}
        {/* Navy wash over the footage, plus a slightly stronger band at the
            base. At 75% white text holds 6.43:1 even on a fully white frame. */}
        <div
          className="pointer-events-none absolute inset-0 bg-[var(--color-primary)]/75"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/45 via-transparent to-transparent"
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-4 shrink-0">
          <div className="w-16 h-16 shrink-0 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <img src="/ETI_logo.svg" alt="Electrical Training Institute" className="w-12 h-auto" />
          </div>
          <span className="text-[17px] font-medium leading-snug text-white/85 max-w-[13rem]">
            Electrical Training Institute
          </span>
        </div>

        <div className="relative flex-1 flex flex-col justify-center max-w-md">
          <h2 className="text-[2.375rem] leading-[1.18] font-semibold tracking-tight">
            The knowledge behind every answer.
          </h2>
          <p className="mt-4 text-[16.5px] leading-relaxed text-white/80">
            Your assistant only knows what you give it. This is where that
            knowledge lives, and where you decide how it gets used.
          </p>

          <div className="mt-9 h-px w-16 bg-[var(--color-secondary)]" />
          <ul className="mt-6 space-y-3 text-[15.5px] text-white/85">
            <li className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-secondary)]" />
              Upload documents and scrape pages
            </li>
            <li className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-secondary)]" />
              Edit the assistant&apos;s instructions
            </li>
            <li className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-secondary)]" />
              Review every conversation
            </li>
          </ul>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-10 lg:overflow-y-auto">
        <div className="w-full max-w-[400px]">
          {/* Compact brand lockup for small screens - the light panel needs no
              white plate behind the logo */}
          <div className="lg:hidden mb-8">
            <img src="/ETI_logo.svg" alt="Electrical Training Institute" className="h-10 w-auto" />
          </div>

          <h1 className="text-[2rem] font-semibold tracking-tight text-[var(--eti-ink)]">
            Sign in
          </h1>
          <p className="mt-1.5 text-[15px] text-[var(--eti-ink-muted)]">
            Enter your credentials to access the admin console.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-[10px] border border-[#f4cdc9] bg-[#fef3f2] px-3.5 py-3"
            >
              <AlertCircle className="w-[18px] h-[18px] shrink-0 mt-px text-[var(--eti-critical)]" />
              <p className="text-[13px] leading-relaxed text-[var(--eti-critical)]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label htmlFor="email" className="eti-label text-[13.5px]">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="eti-input h-11 text-[15px]"
                placeholder="you@sdett.org"
              />
            </div>

            <div>
              <label htmlFor="password" className="eti-label text-[13.5px]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="eti-input pr-11 h-11 text-[15px]"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-[var(--eti-ink-subtle)] hover:text-[var(--eti-ink)] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="eti-btn eti-btn-primary w-full h-11 text-[15px]">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[13px] text-[var(--eti-ink-subtle)]">
            Trouble signing in? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

