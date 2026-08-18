"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  trendData: number[];
}

function MetricCard({ title, value, change, isPositive, trendData }: MetricCardProps) {
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const chartData = trendData.map((val, idx) => ({ value: val, index: idx }));
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`flex items-center gap-1 text-xs font-medium ${
          isPositive ? "text-[var(--eti-good)]" : "text-[var(--eti-critical)]"
        }`}>
          <TrendIcon className="w-4 h-4" />
          <span>{change}</span>
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-4">{value}</div>
      <div className="h-12 w-full" style={{ minHeight: "48px" }}>
        <ResponsiveContainer width="100%" height={48} minHeight={48}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={isPositive ? "#10b981" : "#ef4444"}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function OverviewCards() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
        <select className="px-4 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300">
          <option>Today</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="min-w-0">
          <MetricCard
            title="Views"
            value="7,265"
            change="+11.01%"
            isPositive={true}
            trendData={[60, 65, 70, 68, 72, 75, 78]}
          />
        </div>
        <div className="min-w-0">
          <MetricCard
            title="Visits"
            value="3,671"
            change="-0.03%"
            isPositive={false}
            trendData={[80, 78, 75, 77, 74, 72, 70]}
          />
        </div>
        <div className="min-w-0">
          <MetricCard
            title="New Users"
            value="256"
            change="+15.03%"
            isPositive={true}
            trendData={[40, 45, 50, 48, 55, 58, 62]}
          />
        </div>
        <div className="min-w-0">
          <MetricCard
            title="Active Users"
            value="2,318"
            change="+6.08%"
            isPositive={true}
            trendData={[50, 52, 54, 53, 56, 58, 60]}
          />
        </div>
      </div>
    </div>
  );
}

