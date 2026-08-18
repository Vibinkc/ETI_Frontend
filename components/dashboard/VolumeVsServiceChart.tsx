"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const data = [
  { category: "Q1", volume: 1135, services: 635 },
  { category: "Q2", volume: 1200, services: 700 },
  { category: "Q3", volume: 1150, services: 650 },
  { category: "Q4", volume: 1250, services: 750 },
];

export default function VolumeVsServiceChart() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Study Hours vs Performance</h3>
      <div className="w-full" style={{ height: "150px", minHeight: "150px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="category" 
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "white", 
                border: "1px solid #e5e7eb",
                borderRadius: "8px"
              }}
            />
            <Bar dataKey="volume" name="Study Hours" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`volume-${index}`} fill="#002c5c" />
              ))}
            </Bar>
            <Bar dataKey="services" name="Performance Score" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`services-${index}`} fill="#81c341" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#002c5c] rounded"></div>
          <span className="text-xs text-gray-700">Study Hours: 1,135</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#81c341] rounded"></div>
          <span className="text-xs text-gray-700">Performance: 635</span>
        </div>
      </div>
    </div>
  );
}

