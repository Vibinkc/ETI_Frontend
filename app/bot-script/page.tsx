"use client";

import { useState, useEffect } from "react";
import ETISidebar from "@/components/layout/DabangSidebar";
import ETIHeader from "@/components/layout/DabangHeader";
import { Copy, Check, Code } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";

export default function BotScriptPage() {
  const [script, setScript] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScript();
  }, []);

  const loadScript = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.bot.script);
      if (!response.ok) {
        throw new Error("Failed to load script");
      }
      const data = await response.json();
      setScript(data.script);
    } catch (err) {
      console.error("Error loading script:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const embedCode = `<script>
${script}
</script>`;

  return (
    <div className="lg:flex lg:h-screen w-full bg-[var(--eti-canvas)] lg:overflow-hidden">
      {/* Left Sidebar */}
      <ETISidebar />

      {/* Main Content */}
      <div className="min-w-0 lg:flex-1 lg:flex lg:flex-col lg:overflow-hidden">
        {/* Header */}
        <ETIHeader />

        {/* Script Content */}
        <div className="eti-page bg-[var(--eti-canvas)] lg:flex-1 lg:overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="eti-card p-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--eti-ink)] flex items-center gap-2">
                    <Code className="w-6 h-6" />
                    Embeddable Bot Script
                  </h2>
                  <p className="text-sm text-[var(--eti-ink-subtle)] mt-2">
                    Copy this script and add it to your website to embed the ETI bot
                  </p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="eti-btn eti-btn-primary"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Script
                    </>
                  )}
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8 text-[var(--eti-ink-subtle)]">Loading script...</div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Simple Embed Code (Recommended)
                    </h3>
                    <p className="text-xs text-[var(--eti-ink-subtle)] mb-2">
                      Just add this single line before the closing &lt;/body&gt; tag:
                    </p>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                      <code>{`<script src="${API_ENDPOINTS.base}/api/bot/widget.js"></script>`}</code>
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`<script src="${API_ENDPOINTS.base}/api/bot/widget.js"></script>`);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="mt-2 px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                    >
                      Copy Simple Code
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                      How to use:
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                      <li>Copy the embed code above</li>
                      <li>Paste it before the closing &lt;/body&gt; tag of your website</li>
                      <li>The bot widget will appear in the bottom-right corner</li>
                      <li>All conversations will be saved and visible in the Messages section</li>
                    </ol>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                    <h4 className="text-sm font-semibold text-green-900 mb-2">
                      🧪 Test the Bot:
                    </h4>
                    <p className="text-sm text-green-800 mb-2">
                      We&apos;ve created a test page where you can try the bot widget:
                    </p>
                    <a
                      href="/test-bot.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Open Test Page →
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

