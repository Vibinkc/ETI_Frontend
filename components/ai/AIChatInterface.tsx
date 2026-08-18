"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Home, MessageSquare, Clock, Zap, Bot, ArrowLeft, XCircle, ChevronLeft } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  isHtml?: boolean;
}

interface Conversation {
  id: string;
  session_id: string;
  ended: boolean;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

// Format markdown text to HTML logic (kept from original or adapted)
function formatMessage(text: string): string {
  if (!text) return '';

  // Escape HTML first to prevent XSS (basic)
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Convert **bold** to <strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Handle newlines
  const lines = html.split('\n');
  let formattedLines: string[] = [];
  let inList = false;
  let listType = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for bullet points
    if (line.match(/^[•\-\*]\s/)) {
      if (!inList || listType !== 'ul') {
        if (inList && listType === 'ol') formattedLines.push('</ol>');
        formattedLines.push('<ul style="margin: 8px 0; padding-left: 20px; list-style-type: disc;">');
        inList = true;
        listType = 'ul';
      }
      formattedLines.push(`<li style="margin: 4px 0;">${line.replace(/^[•\-\*]\s*/, '')}</li>`);
    }
    // Check for numbered lists
    else if (line.match(/^\d+[\.\)]\s/)) {
      if (!inList || listType !== 'ol') {
        if (inList && listType === 'ul') formattedLines.push('</ul>');
        formattedLines.push('<ol style="margin: 8px 0; padding-left: 20px;">');
        inList = true;
        listType = 'ol';
      }
      formattedLines.push(`<li style="margin: 4px 0;">${line.replace(/^\d+[\.\)]\s*/, '')}</li>`);
    }
    else {
      if (inList) {
        formattedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
        listType = '';
      }
      if (line) formattedLines.push(`<p style="margin: 8px 0;">${line}</p>`);
      else formattedLines.push('<br>');
    }
  }

  if (inList) formattedLines.push(listType === 'ul' ? '</ul>' : '</ol>');

  return formattedLines.join('');
}

interface AIChatInterfaceProps {
  onClose?: () => void;
}

const WELCOME_IMAGE_URL = "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop&q=80";
const WELCOME_IMAGE_FALLBACK = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop&q=80";

export default function AIChatInterface({ onClose }: AIChatInterfaceProps) {
  const [view, setView] = useState<"home" | "conversations" | "chat">("home");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [conversationStarted, setConversationStarted] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize session ID
    let sid = localStorage.getItem('eti_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substr(2, 16);
      localStorage.setItem('eti_session_id', sid);
    }
    setSessionId(sid);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (view === "chat") {
      scrollToBottom();
    }
  }, [messages, view, loading]);

  const loadConversations = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(API_ENDPOINTS.conversations.listUser(sessionId));
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error("Failed to load conversations", err);
    }
  };

  useEffect(() => {
    if (view === "conversations") {
      loadConversations();
    }
  }, [view, sessionId]);

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setConversationStarted(false);
    setShowThankYou(false);
    setView("chat");
    // Show welcome message
    setTimeout(() => {
      const welcomeText = '✨ <strong>Welcome to ETI!</strong> ✨<br/>How can we assist you today? 🤖<br/>We are here to help with any inquiries or support you need. Let us know how we can make your experience better! 😊✨';
      const welcomeMsg: Message = {
        role: 'assistant',
        content: `
              <img src="${WELCOME_IMAGE_URL}" alt="AI Assistant Welcome" style="width: 100%; max-width: 280px; height: auto; border-radius: 8px; margin-bottom: 12px; object-fit: cover;" onerror="this.src='${WELCOME_IMAGE_FALLBACK}';" />
              <div>${welcomeText}</div>
            `,
        timestamp: new Date().toISOString(),
        isHtml: true
      };
      setMessages([welcomeMsg]);
    }, 100);
  };

  const checkAndLoadOngoingConversation = async () => {
    if (!sessionId) return false;
    try {
      const res = await fetch(API_ENDPOINTS.conversations.listUser(sessionId));
      const data = await res.json();
      if (data.conversations && data.conversations.length > 0) {
        const ongoing = data.conversations.find((c: Conversation) => !c.ended);
        if (ongoing) {
          setCurrentConversationId(ongoing.id);
          setMessages(ongoing.messages);
          setConversationStarted(true);
          setView("chat");
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleChatWithUs = async () => {
    const hasOngoing = await checkAndLoadOngoingConversation();
    if (!hasOngoing) {
      startNewConversation();
    }
  };

  const sendMessage = async () => {
    if (!query.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: query.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);
    setConversationStarted(true);

    try {
      const res = await fetch(API_ENDPOINTS.bot.chat, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          session_id: sessionId,
          website_url: typeof window !== 'undefined' ? window.location.href : '',
          user_agent: navigator.userAgent
        }),
      });

      const data = await res.json();

      const botMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        role: "assistant",
        content: "Sorry, there was an error. Please try again."
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const endChat = async () => {
    if (confirm('Are you sure you want to end this chat?')) {
      try {
        await fetch(`${API_ENDPOINTS.conversations.end}?session_id=${sessionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: messages })
        });
        setShowThankYou(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Helper to render conversation list item
  const renderConversationItem = (conv: Conversation) => {
    const lastMsg = conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;
    let preview = "No messages yet";
    if (lastMsg) {
      const div = document.createElement('div');
      div.innerHTML = lastMsg.content; // rough text extraction
      preview = (div.textContent || div.innerText || "").substring(0, 60) + "...";
    }

    return (
      <div
        key={conv.id}
        onClick={() => {
          setCurrentConversationId(conv.id);
          setMessages(conv.messages);
          setConversationStarted(!conv.ended);
          setView("chat");
        }}
        className="bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 hover:border-[#002c5c] transition-all"
      >
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[#212529] mb-1">{conv.ended ? 'Ended' : 'Ongoing'}</p>
            <p className="text-[11px] text-[#6c757d] mb-1">{new Date(conv.created_at).toLocaleDateString()}</p>
            <p className="text-xs text-[#495057] truncate">{preview}</p>
          </div>
          <span className={`w-2 h-2 rounded-full mt-1 ${conv.ended ? 'bg-gray-400' : 'bg-[#81c341]'}`}></span>
        </div>
      </div>
    );
  };

  // --- Views ---

  // Header is common
  const renderHeader = () => (
    <div className="bg-gradient-to-r from-[#002c5c] to-[#81c341] text-white px-4 py-3 rounded-t-2xl flex justify-between items-center flex-shrink-0">
      <div className="flex items-center gap-2.5">
        {view === "chat" && (
          <button onClick={() => setView("home")} className="p-1 hover:opacity-80 transition-opacity">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center overflow-hidden">
          <img
            src="/eti_logo.png"
            alt="ETI"
            className="w-7 h-7 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold leading-tight">ETI Assistant</h3>
          <p className="text-[11px] opacity-95 flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 bg-[#81c341] rounded-full inline-block shadow-[0_0_3px_rgba(129,195,65,0.6)]"></span>
            We are online!
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {view === "chat" && conversationStarted && !showThankYou && (
          <button onClick={endChat} className="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors" title="End Chat">
            <XCircle className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => {
            if (onClose) onClose();
          }}
          className="text-white text-2xl leading-none hover:opacity-80 p-1"
        >
          ×
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl h-full flex flex-col overflow-hidden relative" style={{ width: '450px', height: '600px' }}>

      {renderHeader()}

      {/* Thank You Overlay */}
      {showThankYou && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-6 text-[#81c341]">
            <MessageSquare className="w-16 h-16 mx-auto" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-[#212529] mb-3">Thank You!</h3>
          <p className="text-sm text-[#6c757d] leading-relaxed mb-6">
            We appreciate your time. If you have any more questions, feel free to start a new conversation.
          </p>
          <button
            onClick={startNewConversation}
            className="bg-gradient-to-r from-[#002c5c] to-[#81c341] text-white border-none py-3 px-6 rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all w-full max-w-[280px]"
          >
            Start a New Conversation
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-[#f8f9fa] flex flex-col relative">

        {/* Home View */}
        {view === "home" && !showThankYou && (
          <div className="flex-1 flex flex-col p-4 items-center overflow-y-auto">
            <div className="text-center py-6 w-full">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#002c5c] to-[#81c341] flex items-center justify-center text-2xl shadow-md">🤖</div>
              <h3 className="text-base font-bold text-[#212529] mb-1">Welcome to ETI Assistant</h3>
              <p className="text-xs text-[#6c757d]">Your AI-powered assistant is here to help</p>
            </div>

            <div className="w-full space-y-2.5 mb-6">
              {[
                { icon: Clock, title: "24/7 Support", sub: "Available round the clock" },
                { icon: Zap, title: "Instant Responses", sub: "Get answers in seconds" },
                { icon: Bot, title: "Smart AI Assistant", sub: "Intelligent and helpful responses" }
              ].map((Item, i) => (
                <div key={i} className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#002c5c] to-[#81c341] flex items-center justify-center flex-shrink-0">
                    <Item.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-[#212529]">{Item.title}</h4>
                    <p className="text-[10px] text-[#6c757d]">{Item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleChatWithUs}
              className="mt-auto w-full py-3 bg-gradient-to-r from-[#002c5c] to-[#81c341] text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Chat with us
            </button>
          </div>
        )}

        {/* Conversations View */}
        {view === "conversations" && !showThankYou && (
          <div className="flex-1 bg-[#f8f9fa] flex flex-col overflow-hidden">
            <div className="p-4 flex-1 overflow-y-auto space-y-2">
              {conversations.length > 0 ? (
                conversations.map(renderConversationItem)
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#6c757d] p-8 text-center">
                  <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm">No conversations yet.</p>
                  <p className="text-xs mt-1 opacity-70">Start chatting to see your conversations here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat View */}
        {view === "chat" && !showThankYou && (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#f8f9fa]">
            <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={conversationViewRef}>
              <div className="flex flex-col gap-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-[13px] leading-relaxed ${msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#002c5c] to-[#81c341] text-white rounded-br-sm'
                      : 'bg-[#e9ecef] text-[#212529] rounded-bl-sm'
                      }`}>
                      <div dangerouslySetInnerHTML={{ __html: msg.isHtml ? msg.content : formatMessage(msg.content) }} />
                      {msg.role === 'assistant' && !msg.isHtml && msg.content.includes('<img') && (
                        <div className="mt-1 text-[10px] text-[#6b7280] text-right">
                          {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-[#e9ecef] rounded-2xl px-4 py-3 shadow-sm rounded-bl-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area (Only if ongoing) */}
            {(!currentConversationId || conversationStarted) && (
              <div className="bg-white p-3 border-t border-gray-100">
                <div className="bg-[#f8f9fa] rounded-full border border-gray-200 flex items-center px-1 py-1 pl-4">
                  <input
                    type="text"
                    className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#212529]"
                    placeholder="Enter your message..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    disabled={loading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !query.trim()}
                    className="w-9 h-9 rounded-full bg-gradient-to-r from-[#002c5c] to-[#81c341] flex items-center justify-center text-white shadow-sm hover:shadow-md hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                  </button>
                </div>
              </div>
            )}
            {currentConversationId && !conversationStarted && (
              <div className="bg-[#fee2e2] p-3 text-center text-xs text-[#991b1b] font-medium border-t border-[#fecaca]">
                This conversation has ended.
              </div>
            )}
          </div>
        )}

      </div>

      {/* Bottom Tabs */}
      {!showThankYou && view !== 'chat' && (
        <div className="bg-white border-t border-gray-200 flex">
          <button
            onClick={() => setView("home")}
            className={`flex-1 py-2.5 flex flex-col items-center justify-center gap-1 transition-colors ${view === 'home' ? 'text-[#81c341]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Home className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">Home</span>
            {view === 'home' && <div className="w-full h-0.5 bg-[#81c341] absolute bottom-0 max-w-[50%] rounded-t-full"></div>}
          </button>
          <button
            onClick={() => setView("conversations")}
            className={`flex-1 py-2.5 flex flex-col items-center justify-center gap-1 transition-colors ${view === 'conversations' ? 'text-[#81c341]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <MessageSquare className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">Conversations</span>
            {view === 'conversations' && <div className="w-full h-0.5 bg-[#81c341] absolute bottom-0 max-w-[50%] rounded-t-full"></div>}
          </button>
        </div>
      )}
    </div>
  );
}
