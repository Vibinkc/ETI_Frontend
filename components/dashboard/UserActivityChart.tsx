"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { API_ENDPOINTS } from "@/lib/api";
import { SERIES } from "@/lib/chartTheme";

interface ActivityData {
  month: string;
  conversations: number;
  documents: number;
  submissions: number;
  sessions: number;
}

export default function UserActivityChart() {
  const [activeTab, setActiveTab] = useState("Conversations");
  const [data, setData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = ["Conversations", "Documents", "Submissions"];

  useEffect(() => {
    async function fetchUserActivity() {
      try {
        const response = await fetch(API_ENDPOINTS.dashboard.userActivity("month"));
        if (response.ok) {
          const result = await response.json();
          setData(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching user activity stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUserActivity();
  }, []);

  const getDataKey = () => {
    switch (activeTab) {
      case "Conversations":
        return "conversations";
      case "Documents":
        return "documents";
      case "Submissions":
        return "submissions";
      default:
        return "conversations";
    }
  };

  if (loading) {
    return (
      <div className="eti-card p-4 w-full h-full min-w-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <div key={tab} className="px-4 py-2 bg-gray-100 rounded-lg animate-pulse w-24 h-10" />
            ))}
          </div>
        </div>
        <div className="w-full h-[220px] bg-gray-100 animate-pulse rounded" />
      </div>
    );
  }

  const chartData = data.length > 0 ? data : [];
  const maxValue = Math.max(
    ...chartData.map(d => Math.max(d.conversations, d.documents, d.submissions)),
    100
  );

  return (
    <div className="eti-card p-4 w-full h-full min-w-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full" style={{ height: "200px", minHeight: "200px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid stroke="#e9edf2" strokeDasharray="0" vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#8494ab" tickLine={false} axisLine={false}
              style={{ fontSize: "12px" }}
            />
            <YAxis 
              stroke="#8494ab" tickLine={false} axisLine={false}
              style={{ fontSize: "12px" }}
              domain={[0, maxValue * 1.1]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "white", 
                border: "1px solid #e5e7eb",
                borderRadius: "8px"
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey={getDataKey()}
              stroke={SERIES[0]}
              strokeWidth={2}
              dot={false}
              name={activeTab}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


