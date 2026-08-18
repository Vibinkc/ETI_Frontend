"use client";

import { useState } from "react";
import ETISidebar from "@/components/layout/DabangSidebar";
import ETIHeader from "@/components/layout/DabangHeader";
import DocumentUpload from "@/components/ai/DocumentUpload";
import AIChatInterface from "@/components/ai/AIChatInterface";

export default function AIPage() {
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  return (
    <div className="lg:flex lg:h-screen w-full bg-[var(--eti-canvas)] lg:overflow-hidden">
      {/* Left Sidebar */}
      <ETISidebar />

      {/* Main Content */}
      <div className="min-w-0 lg:flex-1 lg:flex lg:flex-col lg:overflow-hidden">
        {/* Header */}
        <ETIHeader />

        {/* AI Content */}
        <div className="eti-page bg-[var(--eti-canvas)] lg:flex-1 lg:overflow-y-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Document Upload */}
            <div>
              <DocumentUpload />
            </div>

            {/* AI Chat Section */}
            <div className="flex justify-center lg:justify-start relative min-w-0">
              {isWidgetOpen ? (
                <AIChatInterface onClose={() => setIsWidgetOpen(false)} />
              ) : (
                <div className="hidden lg:block w-full h-[500px]" aria-hidden="true"></div>
              )}
            </div>
          </div>
        </div>

        {/* Toggle Button - Fixed at bottom right corner */}
        {!isWidgetOpen && (
          <button
            type="button"
            onClick={() => setIsWidgetOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-[#002c5c] to-[#81c341] border-none text-white cursor-pointer shadow-[0_4px_16px_rgba(0,44,92,0.4)] flex items-center justify-center transition-all hover:scale-105 hover:shadow-[0_6px_20px_rgba(0,44,92,0.5)] z-50"
            title="Open ETI Assistant"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8V4H8"></path>
              <rect width="16" height="12" x="4" y="8" rx="2"></rect>
              <path d="M2 14h2"></path>
              <path d="M20 14h2"></path>
              <path d="M15 13v2"></path>
              <path d="M9 13v2"></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

