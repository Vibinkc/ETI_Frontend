"use client";

import { CheckCircle2, AlertCircle, UserPlus, Palette, Code, FileText, Trash2 } from "lucide-react";

const notifications = [
  { text: "You fixed a bug.", time: "Just now", icon: CheckCircle2 },
  { text: "New user registered.", time: "59 minutes ago", icon: UserPlus },
  { text: "You fixed a bug.", time: "12 hours ago", icon: CheckCircle2 },
  { text: "Andi Lane subscribed to you.", time: "Today, 11:59 AM", icon: UserPlus },
];

const activities = [
  { text: "Changed the style.", time: "Just now", icon: Palette },
  { text: "Released a new version.", time: "59 minutes ago", icon: Code },
  { text: "Submitted a bug.", time: "12 hours ago", icon: AlertCircle },
  { text: "Modified A data in Page X.", time: "Today, 11:59 AM", icon: FileText },
  { text: "Deleted a page in Project X.", time: "Feb 2, 2025", icon: Trash2 },
];

const contacts = [
  { name: "Natali Craig", avatar: "NC" },
  { name: "Drew Cano", avatar: "DC" },
  { name: "Andi Lane", avatar: "AL" },
  { name: "Koray Okumus", avatar: "KO" },
  { name: "Kate Morrison", avatar: "KM" },
  { name: "Melody Macy", avatar: "MM" },
];

function NotificationItem({ text, time, icon: Icon }: { text: string; time: string; icon: any }) {
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{text}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
}

function ActivityItem({ text, time, icon: Icon }: { text: string; time: string; icon: any }) {
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{text}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
}

export default function RightSidebar() {
  return (
    <div className="w-80 bg-white border-l border-gray-200 h-screen overflow-y-auto flex-shrink-0">
      <div className="p-6 space-y-8">
        {/* Notifications */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-1">
            {notifications.map((notification, index) => (
              <NotificationItem key={index} {...notification} />
            ))}
          </div>
        </div>

        {/* Activities */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activities</h3>
          <div className="space-y-1">
            {activities.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
          </div>
        </div>

        {/* Contacts */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contacts</h3>
          <div className="space-y-3">
            {contacts.map((contact, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700 flex-shrink-0">
                  {contact.avatar}
                </div>
                <span className="text-sm text-gray-900 truncate">{contact.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

