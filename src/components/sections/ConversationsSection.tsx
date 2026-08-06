"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  MessageSquare,
  Bot,
  User,
  Pin,
  CheckCircle2,
  Zap,
  Pause,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { MessageSender, ConversationStatus } from "@/types";

// ---------- Types ----------

interface Conversation {
  id: string;
  status: ConversationStatus;
  aiActive: boolean;
  channel: string;
  pinned?: boolean;
  lastMessageAt?: string | null;
  customer?: {
    id: string;
    name: string;
    phone: string;
  } | null;
  messages?: ConversationMessage[];
  _count?: { messages: number };
}

interface ConversationMessage {
  id: string;
  content: string;
  contentType: string;
  senderType: MessageSender;
  createdAt: string;
  isRead?: boolean;
  sender?: {
    name?: string;
  } | null;
}

// ---------- Helpers ----------

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ---------- Component ----------

export default function ConversationsSection() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [aiFilter, setAiFilter] = useState<string>("all");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ---------- Data Fetching ----------

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      params.set("pageSize", "50");

      const res = await fetch(`/api/conversations?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch conversations");
      const json = await res.json();
      const data = json.data;
      const arr: Conversation[] = Array.isArray(data)
        ? data
        : data?.data || [];

      // Client-side AI filter
      const filtered =
        aiFilter === "all"
          ? arr
          : aiFilter === "active"
          ? arr.filter((c) => c.aiActive)
          : arr.filter((c) => !c.aiActive);

      setConversations(filtered);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load conversations"
      );
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, aiFilter]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      setMessagesLoading(true);
      setMessagesError(null);
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      const json = await res.json();
      setMessages(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      setMessagesError(
        err instanceof Error ? err.message : "Failed to load messages"
      );
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId);
    } else {
      setMessages([]);
    }
  }, [selectedId, fetchMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------- Actions ----------

  async function handleSelectConversation(id: string) {
    setSelectedId(id);
    setMessageInput("");
  }

  async function handleSendMessage() {
    if (!selectedId || !messageInput.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: messageInput.trim(),
          senderType: "staff",
        }),
      });
      if (!res.ok) throw new Error("Failed to send");
      setMessageInput("");
      await fetchMessages(selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  async function handleToggleAI(conversationId: string, aiActive: boolean) {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/toggle-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiActive }),
      });
      if (!res.ok) throw new Error("Failed to toggle AI");
      await fetchConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  }

  async function handleMarkResolved(conversationId: string) {
    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });
      if (!res.ok) throw new Error("Failed to resolve");
      await fetchConversations();
      if (selectedId === conversationId) setSelectedId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  }

  async function handlePin(conversationId: string) {
    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: true }),
      });
      if (!res.ok) throw new Error("Failed to pin");
      await fetchConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to pin");
    }
  }

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  // ---------- Render ----------

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col gap-4 lg:flex-row">
      {/* ----- Left Panel: Conversation List ----- */}
      <div className="flex w-full flex-col gap-3 rounded-lg border lg:w-80 shrink-0">
        <div className="p-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={aiFilter} onValueChange={setAiFilter}>
              <SelectTrigger className="flex-1 text-xs">
                <SelectValue placeholder="AI" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">AI Active</SelectItem>
                <SelectItem value="paused">AI Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="flex-1 px-1">
          {loading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-3 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={MessageSquare}
                title="No conversations"
                description={
                  search || statusFilter !== "all"
                    ? "Try adjusting your filters."
                    : "Conversations will appear here when customers message you."
                }
              />
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                    selectedId === conv.id
                      ? "border-primary bg-accent"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {conv.customer?.name || "Unknown"}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {conv.aiActive && (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                        >
                          AI
                        </Badge>
                      )}
                      <StatusBadge
                        status={conv.status}
                        type="conversation"
                        className="text-[10px]"
                      />
                    </div>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {conv.customer?.phone || ""}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {conv.lastMessageAt
                      ? `${formatDate(conv.lastMessageAt)} ${formatTime(conv.lastMessageAt)}`
                      : ""}
                  </p>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* ----- Right Panel: Messages ----- */}
      <div className="flex flex-1 flex-col rounded-lg border">
        {!selectedId ? (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState
              icon={MessageSquare}
              title="Select a conversation"
              description="Choose a conversation from the list to view messages."
            />
          </div>
        ) : (
          <>
            {/* Header */}
            {selectedConversation && (
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div>
                  <h3 className="font-semibold">
                    {selectedConversation.customer?.name || "Unknown"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.customer?.phone} ·{" "}
                    <StatusBadge
                      status={selectedConversation.status}
                      type="conversation"
                      className="text-[10px]"
                    />
                    {selectedConversation.aiActive && (
                      <Badge
                        variant="outline"
                        className="ml-1 bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                      >
                        AI Active
                      </Badge>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() =>
                      handleToggleAI(
                        selectedConversation.id,
                        !selectedConversation.aiActive
                      )
                    }
                  >
                    {selectedConversation.aiActive ? (
                      <>
                        <Pause className="mr-1 size-3" />
                        Take Over
                      </>
                    ) : (
                      <>
                        <Zap className="mr-1 size-3" />
                        Resume AI
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() =>
                      handleMarkResolved(selectedConversation.id)
                    }
                  >
                    <CheckCircle2 className="mr-1 size-3" />
                    Resolved
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => handlePin(selectedConversation.id)}
                    title="Pin"
                  >
                    <Pin className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-3/4 max-w-sm" />
                  ))}
                </div>
              ) : messagesError ? (
                <p className="text-sm text-red-500">{messagesError}</p>
              ) : messages.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No messages yet"
                  description="Messages in this conversation will appear here."
                />
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => {
                    if (msg.senderType === "system") {
                      return (
                        <div key={msg.id} className="flex justify-center">
                          <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                            {msg.content}
                          </span>
                        </div>
                      );
                    }

                    const isCustomer = msg.senderType === "customer";
                    const isAI = msg.senderType === "ai";

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${
                          isCustomer ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg px-3 py-2 ${
                            isCustomer
                              ? "bg-primary text-primary-foreground"
                              : isAI
                              ? "bg-muted"
                              : "bg-accent"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            {isAI ? (
                              <Bot className="size-3" />
                            ) : isCustomer ? (
                              <User className="size-3" />
                            ) : (
                              <User className="size-3" />
                            )}
                            <span
                              className={`text-xs font-medium ${
                                isCustomer
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {isAI
                                ? "AI Assistant"
                                : isCustomer
                                ? selectedConversation?.customer?.name || "Customer"
                                : msg.sender?.name || "Staff"}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p
                            className={`mt-1 text-right text-[10px] ${
                              isCustomer
                                ? "text-primary-foreground/50"
                                : "text-muted-foreground"
                            }`}
                          >
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-3">
              {error && (
                <p className="mb-2 text-xs text-red-500">{error}</p>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={sending || !messageInput.trim()}>
                  {sending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
