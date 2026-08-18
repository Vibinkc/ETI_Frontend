"use client";

import { useState } from "react";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  FolderKanban, 
  User, 
  FileText, 
  Users, 
  Settings,
  Building2,
  BookOpen,
  MessageSquare
} from "lucide-react";

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState("Overview");

  const menuItems = {
    Dashboards: [
      { name: "Overview", icon: LayoutDashboard, active: true },
      { name: "eCommerce", icon: ShoppingCart, active: false },
      { name: "Projects", icon: FolderKanban, active: false },
    ],
    Pages: [
      { name: "User Profile", icon: User, active: false },
      { name: "Overview", icon: LayoutDashboard, active: false },
      { name: "Projects", icon: FolderKanban, active: false },
      { name: "Campaigns", icon: FileText, active: false },
      { name: "Documents", icon: FileText, active: false },
      { name: "Followers", icon: Users, active: false },
    ],
    Account: [
      { name: "Settings", icon: Settings, active: false },
    ],
    Corporate: [
      { name: "Corporate", icon: Building2, active: false },
    ],
    Blog: [
      { name: "Blog", icon: BookOpen, active: false },
    ],
    Social: [
      { name: "Social", icon: MessageSquare, active: false },
    ],
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col flex-shrink-0">
      {/* Brand */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-900 rounded"></div>
          <span className="text-xl font-semibold text-gray-900">ByeWind</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 min-h-0">
        {/* Favorites & Recently */}
        <div className="px-6 mb-6">
          <div className="flex gap-4 text-sm">
            <button className="text-gray-500 hover:text-gray-900 transition-colors">Favorites</button>
            <button className="text-gray-500 hover:text-gray-900 transition-colors">Recently</button>
          </div>
        </div>

        {/* Menu Items */}
        {Object.entries(menuItems).map(([category, items]) => (
          <div key={category} className="mb-4">
            <div className="px-6 mb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {category}
              </h3>
            </div>
            <div className="space-y-1">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = item.name === activeItem;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveItem(item.name)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Logo */}
      <div className="p-6 border-t border-gray-200 flex-shrink-0">
        <div className="text-sm font-semibold text-gray-400">SNOWUI</div>
      </div>
    </div>
  );
}

