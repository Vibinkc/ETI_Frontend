"use client";

import { useState } from "react";

import ETISidebar from "@/components/layout/DabangSidebar";
import ETIHeader from "@/components/layout/DabangHeader";
import TodaysSalesCards from "@/components/dashboard/TodaysSalesCards";
import VisitorInsightsChart from "@/components/dashboard/VisitorInsightsChart";
import TotalRevenueChart from "@/components/dashboard/TotalRevenueChart";
import TopProductsTable from "@/components/dashboard/TopProductsTable";
import DocumentImportanceChart from "@/components/dashboard/DocumentImportanceChart";
import DashboardFilter, { type DashboardRange } from "@/components/dashboard/DashboardFilter";
import AuthGuard from "@/components/auth/AuthGuard";
// Not used: template placeholders with no backend data behind them.
// CustomerSatisfactionChart, TargetVsRealityChart, VolumeVsServiceChart,
// SalesMappingChart, TrafficByLocationChart

export default function Home() {
  const [range, setRange] = useState<DashboardRange>({ period: "day" });

  return (
    <AuthGuard>
    <div className="lg:flex lg:h-screen w-full bg-[var(--eti-canvas)] lg:overflow-hidden">
      {/* Left Sidebar */}
      <ETISidebar />

      {/* Main Content */}
      <div className="min-w-0 lg:flex-1 lg:flex lg:flex-col lg:overflow-hidden">
        {/* Header */}
        <ETIHeader />

        {/* Dashboard Content */}
        <div className="eti-page bg-[var(--eti-canvas)] lg:flex-1 lg:overflow-y-auto">
          <div className="max-w-full">
            {/* Section title and range filter share one row */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="eti-card-title">Overall Activity</h2>
                <p className="eti-card-sub">Scoped to the selected period</p>
              </div>
              <DashboardFilter value={range} onChange={setRange} />
            </div>

            <TodaysSalesCards range={range} />

            {/* Middle Row Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3 items-stretch">
              <div className="lg:col-span-2 min-w-0">
                <VisitorInsightsChart range={range} />
              </div>
              <div className="min-w-0">
                <TotalRevenueChart range={range} />
              </div>
            </div>

            {/* Which content the bot is actually using */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
              <div className="min-w-0">
                <TopProductsTable range={range} />
              </div>
              <div className="min-w-0">
                <DocumentImportanceChart range={range} />
              </div>
            </div>
          </div>
        </div>
        </div>
    </div>
    </AuthGuard>
  );
}
