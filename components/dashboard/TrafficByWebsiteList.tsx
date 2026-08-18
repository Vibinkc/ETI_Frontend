"use client";

import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/lib/api";

interface Website {
  website_url: string;
  conversations: number;
  sessions: number;
  submissions: number;
}

export default function TrafficByWebsiteList() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopWebsites() {
      try {
        const response = await fetch(API_ENDPOINTS.dashboard.topWebsites(10));
        if (response.ok) {
          const result = await response.json();
          setWebsites(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching top websites:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTopWebsites();
  }, []);

  if (loading) {
    return (
      <div className="eti-card p-4 w-full h-full min-w-0">
        <h3 className="eti-card-title mb-3">Traffic by Website</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-gray-100 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  const maxConversations = Math.max(...websites.map(w => w.conversations), 1);

  const getWebsiteName = (url: string) => {
    if (!url || url === "Unknown") return "Unknown";
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return url.length > 30 ? url.substring(0, 30) + "..." : url;
    }
  };

  return (
    <div className="eti-card p-4 w-full h-full min-w-0">
      <h3 className="eti-card-title mb-3">Traffic by Website</h3>
      <div className="space-y-4">
        {websites.length > 0 ? (
          websites.map((website) => {
            const percentage = (website.conversations / maxConversations) * 100;
            const name = getWebsiteName(website.website_url);
            return (
              <div key={website.website_url} className="flex items-center gap-4 min-w-0">
                <div className="w-32 text-sm text-gray-600 flex-shrink-0 truncate" title={website.website_url}>
                  {name}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-xs text-gray-500 flex-shrink-0 text-right">
                  {website.conversations}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-sm text-gray-500 py-8">
            No website traffic data yet
          </div>
        )}
      </div>
    </div>
  );
}

