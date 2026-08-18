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
  { month: "Jan", target: 10, reality: 8 },
  { month: "Feb", target: 11, reality: 9 },
  { month: "Mar", target: 12, reality: 10 },
  { month: "Apr", target: 12.5, reality: 11 },
  { month: "May", target: 13, reality: 11.5 },
  { month: "Jun", target: 12.5, reality: 12 },
  { month: "Jul", target: 12.122, reality: 8.823 },
];

export default function TargetVsRealityChart() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Learning Goals vs Achievement</h3>
      <div className="w-full" style={{ height: "150px", minHeight: "150px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: "12px" }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "white", 
                border: "1px solid #e5e7eb",
                borderRadius: "8px"
              }}
            />
            <Bar dataKey="target" name="Target" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`target-${index}`} fill="#002c5c" />
              ))}
            </Bar>
            <Bar dataKey="reality" name="Achievement" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`reality-${index}`} fill="#81c341" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-500">Achievement Rate</p>
          <p className="text-base font-semibold text-gray-900">88%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Target Goal</p>
          <p className="text-base font-semibold text-gray-900">95%</p>
        </div>
      </div>
    </div>
  );
}

