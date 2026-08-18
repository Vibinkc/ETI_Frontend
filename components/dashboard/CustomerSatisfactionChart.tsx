"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { week: "W1", lastMonth: 78, thisMonth: 82 },
  { week: "W2", lastMonth: 79, thisMonth: 85 },
  { week: "W3", lastMonth: 80, thisMonth: 88 },
  { week: "W4", lastMonth: 80, thisMonth: 90 },
];

export default function CustomerSatisfactionChart() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Student Performance</h3>
      <div className="w-full" style={{ height: "150px", minHeight: "150px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="week" 
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
            <Line
              type="monotone"
              dataKey="lastMonth"
              stroke="#002c5c"
              strokeWidth={2}
              dot={false}
              name="Last Month"
            />
            <Line
              type="monotone"
              dataKey="thisMonth"
              stroke="#81c341"
              strokeWidth={2}
              dot={false}
              name="This Month"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-500">Last Month</p>
          <p className="text-base font-semibold text-gray-900">80%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">This Month</p>
          <p className="text-base font-semibold text-gray-900">90%</p>
        </div>
      </div>
    </div>
  );
}

