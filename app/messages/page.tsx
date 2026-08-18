"use client";

import React, { useState, useEffect } from "react";
import ETISidebar from "@/components/layout/DabangSidebar";
import ETIHeader from "@/components/layout/DabangHeader";
import { MessageSquare, Trash2, ExternalLink, Calendar, User, Mail, Phone, Search, X, ChevronLeft } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";

// Function to parse markdown-like formatting
const parseMessageContent = (content: string) => {
  // Helper function to parse inline formatting (bold, etc.)
  const parseInlineFormatting = (text: string): (string | React.ReactElement)[] => {
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    let keyCounter = 0;
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      // Add bold text
      parts.push(<strong key={`bold-${keyCounter++}`} className="font-semibold">{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : [text];
  };
  
  // Split by lines to handle different formatting
  const lines = content.split('\n');
  const elements: React.ReactElement[] = [];
  
  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();
    
    // Skip markdown headings (###, ##, #)
    if (trimmedLine.startsWith('###') || trimmedLine.startsWith('##') || trimmedLine.startsWith('#')) {
      return; // Skip this line
    }
    
    // Handle bullet points with •
    if (trimmedLine.startsWith('•')) {
      const bulletContent = trimmedLine.substring(1).trim();
      const formattedContent = parseInlineFormatting(bulletContent);
      elements.push(
        <div key={`line-${lineIndex}`} className="flex items-start gap-2 my-1">
          <span className="font-bold mt-0.5 text-primary-600">•</span>
          <span>{formattedContent}</span>
        </div>
      );
    }
    // Handle bullet points with -
    else if (trimmedLine.startsWith('- ') && !trimmedLine.startsWith('- **')) {
      const subContent = trimmedLine.substring(2);
      const formattedContent = parseInlineFormatting(subContent);
      elements.push(
        <div key={`line-${lineIndex}`} className="flex items-start gap-2 my-1 ml-4">
          <span className="mt-0.5">-</span>
          <span>{formattedContent}</span>
        </div>
      );
    }
    // Handle bold headings (lines that are entirely bold)
    else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && trimmedLine.split('**').length === 3) {
      const headingText = trimmedLine.replace(/\*\*/g, '').trim();
      elements.push(
        <div key={`line-${lineIndex}`} className="font-semibold text-[var(--eti-ink)] mt-3 mb-1.5">
          {headingText}
        </div>
      );
    }
    // Empty line
    else if (trimmedLine === '') {
      elements.push(<br key={`line-${lineIndex}`} />);
    }
    // Regular paragraph with inline formatting
    else {
      const formattedContent = parseInlineFormatting(line);
      elements.push(
        <p key={`line-${lineIndex}`} className="my-1.5">
          {formattedContent}
        </p>
      );
    }
  });
  
  return elements;
};

interface Message {
  role: string;
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  session_id: string;
  website_url: string | null;
  user_ip: string | null;
  user_agent: string | null;
  messages: Message[];
  created_at: string;
  updated_at: string;
  user_name?: string | null;
  user_email?: string | null;
  user_phone?: string | null;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.conversations.list);
      if (!response.ok) {
        throw new Error("Failed to load conversations");
      }
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (err) {
      setError((err instanceof Error ? err.message : "") || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.conversations.delete(id), {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }
      setConversations(conversations.filter((c) => c.id !== id));
      if (selectedConversation?.id === id) {
        setSelectedConversation(null);
      }
    } catch (err) {
      alert((err instanceof Error ? err.message : "") || "Failed to delete conversation");
    }
  };

  const formatDate = (dateString: string) => {
    // Ensure the date string is treated as UTC if it doesn't have timezone info
    // Backend sends UTC timestamps, so we need to ensure proper parsing
    let date: Date;
    const trimmed = dateString.trim();
    
    // If it's already a valid ISO string with timezone, use it directly
    if (trimmed.includes('Z') || trimmed.match(/[+-]\d{2}:\d{2}$/)) {
      date = new Date(trimmed);
    } else if (trimmed.includes('T')) {
      // ISO format without timezone - assume UTC
      date = new Date(trimmed + 'Z');
    } else {
      // Fallback - try parsing as-is
      date = new Date(trimmed);
    }
    
    // Convert to user's local timezone for display
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    // Ensure the date string is treated as UTC if it doesn't have timezone info
    let date: Date;
    const trimmed = dateString.trim();
    
    // If it's already a valid ISO string with timezone, use it directly
    if (trimmed.includes('Z') || trimmed.match(/[+-]\d{2}:\d{2}$/)) {
      date = new Date(trimmed);
    } else if (trimmed.includes('T')) {
      // ISO format without timezone - assume UTC
      date = new Date(trimmed + 'Z');
    } else {
      // Fallback - try parsing as-is
      date = new Date(trimmed);
    }
    
    // Convert to user's local timezone for display
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="lg:flex lg:h-screen w-full bg-[var(--eti-canvas)] lg:overflow-hidden">
      {/* Left Sidebar */}
      <ETISidebar />

      {/* Main Content */}
      <div className="min-w-0 lg:flex-1 lg:flex lg:flex-col lg:overflow-hidden">
        {/* Header */}
        <ETIHeader />

        {/* Messages Content */}
        <div className="flex flex-col lg:flex-row lg:flex-1 lg:min-h-0 lg:overflow-hidden">
          {/* Conversations List */}
          <div
            className={`w-full lg:w-72 shrink-0 border-b lg:border-b-0 lg:border-r border-[var(--eti-border)] bg-white flex-col lg:flex lg:h-auto ${selectedConversation ? "hidden lg:flex" : "flex"}`}
          >
            <div className="px-3 py-2.5 border-b border-[var(--eti-border)]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--eti-ink-subtle)]" />
                <input
                  type="text"
                  placeholder="Search conversations…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="eti-input pl-8 h-8 text-[13px]"
                />
              </div>
              <p className="text-[11px] text-[var(--eti-ink-subtle)] mt-1.5">
                {conversations.filter(conv =>
                  !searchQuery ||
                  conv.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  conv.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  conv.session_id.toLowerCase().includes(searchQuery.toLowerCase())
                ).length} conversations
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
                  <p className="text-sm text-[var(--eti-ink-subtle)]">Loading conversations...</p>
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">{error}</div>
              ) : conversations.filter(conv => 
                  !searchQuery || 
                  conv.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  conv.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  conv.session_id.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-[var(--eti-ink-subtle)]">
                    {searchQuery ? "No conversations found" : "No conversations yet"}
                  </p>
                </div>
              ) : (
                conversations
                  .filter(conv => 
                    !searchQuery || 
                    conv.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    conv.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    conv.session_id.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((conv) => (
                  <div
                    key={conv.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedConversation(conv)}
                    onKeyDown={(e) => {
                      // Keyboard equivalent of the row click. Guarded on the row
                      // itself so Enter/Space on the nested delete button keeps
                      // behaving exactly as it does today.
                      if (e.target !== e.currentTarget) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedConversation(conv);
                      }
                    }}
                    className={`group relative flex items-center gap-2.5 px-3 py-2 border-b border-[var(--eti-border)] cursor-pointer transition-colors ${
                      selectedConversation?.id === conv.id
                        ? "bg-[#eef3f9]"
                        : "hover:bg-[#f7f9fb]"
                    }`}
                  >
                    {/* Selection rail instead of a border that shifts the row */}
                    <span
                      className={`absolute left-0 inset-y-0 w-[3px] ${
                        selectedConversation?.id === conv.id ? "bg-[var(--color-primary)]" : "bg-transparent"
                      }`}
                    />

                    <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                      conv.user_name
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[#e4e9f0] text-[var(--eti-ink-muted)]"
                    }`}>
                      {conv.user_name ? conv.user_name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[var(--eti-ink)] truncate leading-tight">
                        {conv.user_name || conv.session_id}
                      </p>
                      <p className="text-[11px] text-[var(--eti-ink-subtle)] truncate leading-tight mt-0.5">
                        {formatDate(conv.updated_at)} · {conv.messages.length} msg
                        {conv.user_email ? ` · ${conv.user_email}` : ""}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Are you sure you want to delete this conversation?")) {
                          deleteConversation(conv.id);
                        }
                      }}
                      title="Delete conversation"
                      className="shrink-0 p-1 rounded text-[var(--eti-ink-subtle)] opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-[var(--eti-critical)] hover:bg-[#fef3f2] transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Conversation Detail */}
          <div
            className={`flex-1 min-w-0 bg-[var(--eti-canvas)] flex-col lg:flex ${selectedConversation ? "flex" : "hidden lg:flex"}`}
          >
            {selectedConversation ? (
              <>
                <div className="px-4 py-2.5 border-b border-[var(--eti-border)] bg-white">
                  <button
                    type="button"
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden mb-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-primary)]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    All conversations
                  </button>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        selectedConversation.user_name
                          ? "bg-[var(--color-primary)] text-white"
                          : "bg-[#e4e9f0] text-[var(--eti-ink-muted)]"
                      }`}>
                        {selectedConversation.user_name ? (
                          <span className="text-[12px] font-semibold">
                            {selectedConversation.user_name.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14px] font-semibold text-[var(--eti-ink)] truncate">
                          {selectedConversation.user_name || "Conversation Details"}
                        </h3>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-[var(--eti-ink-subtle)]">
                          {selectedConversation.user_email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span>{selectedConversation.user_email}</span>
                            </div>
                          )}
                          {selectedConversation.user_phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{selectedConversation.user_phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Started: {formatDate(selectedConversation.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
                  {selectedConversation.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex items-end gap-2 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-6 h-6 rounded-full bg-[#e4e9f0] flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-3 h-3 text-[var(--color-primary)]" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] sm:max-w-[68%] rounded-[12px] px-3 py-2 ${
                          msg.role === "user"
                            ? "bg-[var(--color-primary)] text-white rounded-br-[3px]"
                            : "bg-white text-[var(--eti-ink)] border border-[var(--eti-border)] rounded-bl-[3px]"
                        }`}
                      >
                        <div className={`text-[13px] leading-[1.5] ${
                          msg.role === "user" ? "text-white" : "text-[var(--eti-ink)]"
                        }`}>
                          {msg.role === "assistant" ? parseMessageContent(msg.content) : msg.content}
                        </div>
                        <p className={`text-[10px] mt-1 ${
                          msg.role === "user" ? "text-white/60" : "text-[var(--eti-ink-subtle)]"
                        }`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                      {msg.role === "user" && (
                        <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                          <User className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[var(--eti-ink-subtle)]">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-[var(--eti-ink-subtle)]" />
                  </div>
                  <p className="text-[var(--eti-ink-muted)] font-medium">Select a conversation to view messages</p>
                  <p className="text-sm text-[var(--eti-ink-subtle)] mt-1">Choose a conversation from the list to start reading</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

