"use client";

import { useEffect, useState } from "react";
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
import { API_ENDPOINTS } from "@/lib/api";
import { SERIES } from "@/lib/chartTheme";

interface DeviceData {
  device: string;
  count: number;
  percentage: number;
}

const colors = [SERIES[0], SERIES[1], "#60a5fa", "#14b8a6", "#1f2937", "#3b82f6", SERIES[3], "#10b981"];

export default function TrafficByDeviceChart() {
  const [data, setData] = useState<DeviceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeviceStats() {
      try {
        const response = await fetch(API_ENDPOINTS.dashboard.devices);
        if (response.ok) {
          const result = await response.json();
          setData(result.devices || []);
        }
      } catch (error) {
        console.error("Error fetching device stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDeviceStats();
  }, []);

  if (loading) {
    return (
      <div className="eti-card p-4 w-full h-full min-w-0 flex flex-col">
        <h3 className="eti-card-title mb-3">Traffic by Device</h3>
        <div className="w-full h-[220px] bg-gray-100 animate-pulse rounded" />
      </div>
    );
  }

  const chartData = data.length > 0 ? data : [];

  return (
    <div className="eti-card p-4 w-full h-full min-w-0 flex flex-col">
      <h3 className="eti-card-title mb-3">Traffic by Device</h3>
      <div className="w-full" style={{ height: "190px", minHeight: "190px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid stroke="#e9edf2" strokeDasharray="0" vertical={false} />
            <XAxis 
              dataKey="device" 
              stroke="#8494ab" tickLine={false} axisLine={false}
              style={{ fontSize: "12px" }}
            />
            <YAxis 
              stroke="#8494ab" tickLine={false} axisLine={false}
              style={{ fontSize: "12px" }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "white", 
                border: "1px solid #e5e7eb",
                borderRadius: "8px"
              }}
            />
            <Bar 
              dataKey="count" 
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

