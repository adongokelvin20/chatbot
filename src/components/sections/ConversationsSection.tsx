"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Bot,
  UserCircle,
  ArrowLeft,
  Pin,
  CheckCircle2,
  Hand,
  Send,
  Filter,
  MessageSquare,
  Sparkles,
  Headphones,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { MessageSender, ConversationStatus } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ConversationStatusFilter = ConversationStatus | "unread" | "all";
type ActiveFilter = "all" | "ai" | "human";

interface Message {
  id: string;
  content: string;
  sender: MessageSender;
  createdAt: string;
}

interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  status: ConversationStatus;
  aiActive: boolean;
  humanActive: boolean;
  pinned: boolean;
  unread: number;
  lastMessage: string;
  lastMessageAt: string;
  channel: "web" | "whatsapp";
  messages: Message[];
}

// ---------------------------------------------------------------------------
// Demo Data
// ---------------------------------------------------------------------------

const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: "conv1",
    customerId: "c1",
    customerName: "Grace Uwimana",
    status: "active",
    aiActive: true,
    humanActive: false,
    pinned: true,
    unread: 3,
    lastMessage: "Do you have the royal blue one in size M?",
    lastMessageAt: "2025-01-15T10:45:00Z",
    channel: "whatsapp",
    messages: [
      { id: "m1", content: "Hello! I saw your Instagram post about the new collection.", sender: "customer", createdAt: "2025-01-15T10:30:00Z" },
      { id: "m2", content: "Welcome Grace! Thank you for reaching out. Yes, our new Kitenge Heritage collection just arrived. Are you looking for something specific?", sender: "ai", createdAt: "2025-01-15T10:31:00Z" },
      { id: "m3", content: "I'm interested in the matching set — the one with gold embroidery.", sender: "customer", createdAt: "2025-01-15T10:33:00Z" },
      { id: "m4", content: "Great choice! The Royal Gold matching set is one of our bestsellers. It comes in S, M, L, and XL. The set includes a top, wrapper, and headtie for 45,000 RWF.", sender: "ai", createdAt: "2025-01-15T10:34:00Z" },
      { id: "m5", content: "That's perfect for my sister's wedding. Do you have the royal blue one in size M?", sender: "customer", createdAt: "2025-01-15T10:45:00Z" },
      { id: "m6", content: "Let me check our inventory for the royal blue in size M. One moment please!", sender: "ai", createdAt: "2025-01-15T10:46:00Z" },
      { id: "m7", content: "Good news! We have 2 pieces of the royal blue in size M available. Would you like to place an order?", sender: "ai", createdAt: "2025-01-15T10:47:00Z" },
      { id: "m8", content: "Yes! I'll take one. Can I pay with MTN MoMo?", sender: "customer", createdAt: "2025-01-15T10:48:00Z" },
      { id: "m9", content: "Absolutely! I'll send you the MoMo payment details. The total is 45,000 RWF plus 2,000 RWF for delivery within Kigali.", sender: "ai", createdAt: "2025-01-15T10:49:00Z" },
      { id: "m10", content: "Payment request sent to your number. Please confirm once you've completed the payment. 🙏", sender: "ai", createdAt: "2025-01-15T10:50:00Z" },
    ],
  },
  {
    id: "conv2",
    customerId: "c3",
    customerName: "Marie-Claire Mukamana",
    status: "active",
    aiActive: false,
    humanActive: true,
    pinned: false,
    unread: 1,
    lastMessage: "I need to speak to a real person about my order.",
    lastMessageAt: "2025-01-15T09:12:00Z",
    channel: "web",
    messages: [
      { id: "m11", content: "Hi, I placed an order 3 days ago and haven't received any update.", sender: "customer", createdAt: "2025-01-15T08:50:00Z" },
      { id: "m12", content: "Hello Marie-Claire! Let me look up your order. Could you share your order number or the phone number used?", sender: "ai", createdAt: "2025-01-15T08:51:00Z" },
      { id: "m13", content: "ORD-2025-0108. I've been waiting and no one has told me anything.", sender: "customer", createdAt: "2025-01-15T08:55:00Z" },
      { id: "m14", content: "I found your order — 2 Kitenge dresses totaling 65,000 RWF. It's currently being processed and should ship today. Let me get more details.", sender: "ai", createdAt: "2025-01-15T08:56:00Z" },
      { id: "m15", content: "I need to speak to a real person about my order.", sender: "customer", createdAt: "2025-01-15T09:00:00Z" },
      { id: "m16", content: "Conversation handed over to staff.", sender: "system", createdAt: "2025-01-15T09:01:00Z" },
      { id: "m17", content: "Hello Marie-Claire, this is Alice from customer support. I can see your order ORD-2025-0108 is packed and will be dispatched this afternoon via our Kigali courier.", sender: "staff", createdAt: "2025-01-15T09:12:00Z" },
    ],
  },
  {
    id: "conv3",
    customerId: "c6",
    customerName: "Emmanuel Gatera",
    status: "resolved",
    aiActive: true,
    humanActive: false,
    pinned: false,
    unread: 0,
    lastMessage: "Thank you! I'll confirm the order tomorrow.",
    lastMessageAt: "2025-01-14T16:30:00Z",
    channel: "whatsapp",
    messages: [
      { id: "m18", content: "Good afternoon. I need 5 matching family outfits for a traditional ceremony next Saturday.", sender: "customer", createdAt: "2025-01-14T15:00:00Z" },
      { id: "m19", content: "Good afternoon Emmanuel! That's wonderful. We have beautiful family matching sets. How many adults and children, and what sizes do you need?", sender: "ai", createdAt: "2025-01-14T15:01:00Z" },
      { id: "m20", content: "2 adults (L and XL) and 3 children (ages 6, 10, 14).", sender: "customer", createdAt: "2025-01-14T15:05:00Z" },
      { id: "m21", content: "I have the perfect set — our 'Umuganda Heritage' family collection. For 5 pieces, I can offer you a 10% bulk discount. Total would be 185,000 RWF instead of 205,000 RWF.", sender: "ai", createdAt: "2025-01-14T15:06:00Z" },
      { id: "m22", content: "That's a good deal. Let me check with my wife and get back to you.", sender: "customer", createdAt: "2025-01-14T15:10:00Z" },
      { id: "m23", content: "Of course! The offer is valid until Friday. Just let me know when you're ready. 😊", sender: "ai", createdAt: "2025-01-14T15:11:00Z" },
      { id: "m24", content: "Thank you! I'll confirm the order tomorrow.", sender: "customer", createdAt: "2025-01-14T16:30:00Z" },
    ],
  },
  {
    id: "conv4",
    customerId: "c4",
    customerName: "Patrick Niyonzima",
    status: "archived",
    aiActive: true,
    humanActive: false,
    pinned: false,
    unread: 0,
    lastMessage: "Thanks for the help! I'll visit the shop next week.",
    lastMessageAt: "2025-01-10T14:20:00Z",
    channel: "web",
    messages: [
      { id: "m25", content: "Hi, I'm looking for a traditional outfit for my wedding. Can you help?", sender: "customer", createdAt: "2025-01-10T13:00:00Z" },
      { id: "m26", content: "Congratulations on your upcoming wedding, Patrick! 🎉 We specialize in traditional wedding attire. We have several collections: Umwami (Royal), Inzu (Modern Traditional), and Kinyarwanda Classic.", sender: "ai", createdAt: "2025-01-10T13:01:00Z" },
      { id: "m27", content: "What's the price range for the Umwami collection?", sender: "customer", createdAt: "2025-01-10T13:05:00Z" },
      { id: "m28", content: "The Umwami Royal collection ranges from 85,000 to 150,000 RWF. It includes a hand-crafted Mushanana with matching accessories. For couples, we offer a complete set at 220,000 RWF.", sender: "ai", createdAt: "2025-01-10T13:06:00Z" },
      { id: "m29", content: "Thanks for the help! I'll visit the shop next week.", sender: "customer", createdAt: "2025-01-10T14:20:00Z" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ConversationsSection() {
  const [conversations, setConversations] = useState<Conversation[]>(DEMO_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ConversationStatusFilter>("all");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [messageInput, setMessageInput] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId]
  );

  const filtered = useMemo(() => {
    let list = conversations;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.customerName.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") {
      if (statusFilter === "unread") {
        list = list.filter((c) => c.unread > 0);
      } else {
        list = list.filter((c) => c.status === statusFilter);
      }
    }
    if (activeFilter === "ai") list = list.filter((c) => c.aiActive);
    if (activeFilter === "human") list = list.filter((c) => c.humanActive);
    return list;
  }, [conversations, search, statusFilter, activeFilter]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages.length]);

  function selectConversation(id: string) {
    setSelectedId(id);
    setMobileShowChat(true);
    // Mark as read
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  }

  function handleSend() {
    if (!messageInput.trim() || !selectedId) return;
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      content: messageInput.trim(),
      sender: "staff",
      createdAt: new Date().toISOString(),
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              lastMessage: messageInput.trim(),
              lastMessageAt: new Date().toISOString(),
              humanActive: true,
            }
          : c
      )
    );
    setMessageInput("");
  }

  function handleTakeOver() {
    if (!selectedId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId ? { ...c, aiActive: false, humanActive: true } : c
      )
    );
  }

  function handleResumeAI() {
    if (!selectedId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId ? { ...c, aiActive: true, humanActive: false } : c
      )
    );
  }

  function handleMarkResolved() {
    if (!selectedId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId ? { ...c, status: "resolved" as ConversationStatus } : c
      )
    );
  }

  function handleTogglePin() {
    if (!selectedId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId ? { ...c, pinned: !c.pinned } : c
      )
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-0 h-[calc(100vh-8rem)] border rounded-lg overflow-hidden">
      {/* Left Panel - Conversation List */}
      <div
        className={cn(
          "w-full lg:w-80 xl:w-96 border-r flex flex-col bg-background shrink-0",
          mobileShowChat && "hidden lg:flex"
        )}
      >
        {/* Search & Filters */}
        <div className="p-3 space-y-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ConversationStatusFilter)}>
              <SelectTrigger className="h-8 text-xs flex-1">
                <Filter className="mr-1 size-3" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
              </SelectContent>
            </Select>
            <Select value={activeFilter} onValueChange={(v) => setActiveFilter(v as ActiveFilter)}>
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="ai">AI Active</SelectItem>
                <SelectItem value="human">Human Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <MessageSquare className="size-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No conversations found</p>
            </div>
          ) : (
            filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={cn(
                  "w-full text-left p-3 border-b hover:bg-muted/50 transition-colors",
                  selectedId === conv.id && "bg-muted"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative shrink-0">
                      <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {conv.customerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      {conv.unread > 0 && (
                        <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm truncate">{conv.customerName}</span>
                        {conv.pinned && <Pin className="size-3 text-muted-foreground shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {conv.aiActive && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-primary/30 text-primary">
                            <Sparkles className="size-2.5 mr-0.5" /> AI
                          </Badge>
                        )}
                        {conv.humanActive && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-orange-300 text-orange-600 dark:text-orange-400">
                            <Headphones className="size-2.5 mr-0.5" /> Staff
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {formatDate(conv.lastMessageAt)}
                  </span>
                </div>
                <p className={cn(
                  "text-xs mt-1 truncate text-muted-foreground",
                  conv.unread > 0 && "font-medium text-foreground"
                )}>
                  {conv.lastMessage}
                </p>
              </button>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Right Panel - Chat Messages */}
      <div
        className={cn(
          "flex-1 flex flex-col bg-background",
          !mobileShowChat && "hidden lg:flex"
        )}
      >
        {selected ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 border-b gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden shrink-0"
                  onClick={() => setMobileShowChat(false)}
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {selected.customerName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{selected.customerName}</p>
                  <div className="flex items-center gap-1.5">
                    {selected.aiActive ? (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Sparkles className="size-3" /> AI Active
                      </span>
                    ) : selected.humanActive ? (
                      <span className="text-[11px] text-orange-600 dark:text-orange-400 flex items-center gap-1">
                        <Headphones className="size-3" /> Staff Active
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">Inactive</span>
                    )}
                    <span className="text-[11px] text-muted-foreground">· {selected.channel === "whatsapp" ? "WhatsApp" : "Web"}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleTogglePin}
                >
                  <Pin className={cn("size-3 mr-1", selected.pinned && "fill-current")} />
                  {selected.pinned ? "Unpin" : "Pin"}
                </Button>
                {selected.aiActive ? (
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleTakeOver}>
                    <Hand className="size-3 mr-1" /> Take Over
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleResumeAI}>
                    <Sparkles className="size-3 mr-1" /> Resume AI
                  </Button>
                )}
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleMarkResolved}>
                  <CheckCircle2 className="size-3 mr-1" /> Resolve
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3 max-w-2xl mx-auto">
                {selected.messages.map((msg) => (
                  <div key={msg.id}>
                    {msg.sender === "system" ? (
                      <div className="flex justify-center my-4">
                        <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                          <Info className="size-3 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">{msg.content}</span>
                        </div>
                      </div>
                    ) : msg.sender === "customer" ? (
                      <div className="flex justify-end">
                        <div className="max-w-[75%] space-y-1">
                          <div className="rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-2.5">
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground text-right">
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    ) : msg.sender === "ai" ? (
                      <div className="flex justify-start gap-2">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted mt-1">
                          <Bot className="size-3.5 text-primary" />
                        </div>
                        <div className="max-w-[75%] space-y-1">
                          <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-2.5">
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-start gap-2">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40 mt-1">
                          <UserCircle className="size-3.5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="max-w-[75%] space-y-1">
                          <div className="rounded-2xl rounded-bl-md bg-orange-50 dark:bg-orange-950/30 px-4 py-2.5">
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {formatTime(msg.createdAt)} · Staff
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Bar */}
            <Separator />
            <div className="p-3">
              <form
                className="flex gap-2 max-w-2xl mx-auto"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
              >
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!messageInput.trim()}>
                  <Send className="size-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
                <MessageSquare className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Select a conversation</p>
              <p className="text-xs text-muted-foreground">Choose a conversation from the list to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
