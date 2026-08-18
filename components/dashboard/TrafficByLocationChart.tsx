"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "United States", value: 52.1, color: "#1f2937" },
  { name: "Canada", value: 22.8, color: "#60a5fa" },
  { name: "Mexico", value: 13.9, color: "#10b981" },
  { name: "Other", value: 11.2, color: "#d1d5db" },
];

export default function TrafficByLocationChart() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 w-full h-full min-w-0">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Traffic by Location</h3>
      <div className="flex items-center flex-wrap lg:flex-nowrap gap-4">
        <div className="flex-1 min-w-0" style={{ height: "260px", minHeight: "260px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "white", 
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px"
                }}
                formatter={(value: number) => `${value}%`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-shrink-0 lg:ml-8">
          <div className="space-y-3">
            {data.map((entry, index) => (
              <div key={index} className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900">{entry.name}</div>
                  <div className="text-xs text-gray-500">{entry.value}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

