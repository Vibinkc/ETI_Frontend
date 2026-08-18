"use client";

import { Search, Sun, History, Bell, Square } from "lucide-react";

export default function Header() {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-600 flex-shrink-0">
        <span className="text-gray-400">Dashboards</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">Default</span>
      </div>

      {/* Search */}
      {/* <div className="flex-1 max-w-md mx-8 min-w-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
          />
        </div>
      </div> */}

      {/* Icons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Sun className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <History className="w-5 h-5" />
        </button>
        {/* <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
        </button> */}
        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Square className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

