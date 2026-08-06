"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Eye,
  EyeOff,
  Save,
  TestTube2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { AIpersonality, AITone } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AISettings {
  personality: AIpersonality;
  tone: AITone;
  language: string;
  greetingMessage: string;
  autoReply: boolean;
  workingHoursReply: string;
  model: string;
  apiKey: string;
}

interface TestMessage {
  id: string;
  content: string;
  sender: "user" | "ai";
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Demo / Default Values
// ---------------------------------------------------------------------------

const DEFAULT_SETTINGS: AISettings = {
  personality: "friendly",
  tone: "helpful",
  language: "en",
  greetingMessage:
    "Murakaza neza! 🌟 Welcome to Umuhoza Fashion House. I'm your AI shopping assistant. I can help you find the perfect outfit, check sizes, track orders, or answer any questions. How can I help you today?",
  autoReply: true,
  workingHoursReply:
    "Thank you for reaching out! Our shop hours are Mon-Sat, 8:00 AM - 6:00 PM. We're currently closed, but I'll make sure to get back to you first thing tomorrow. Karibu! 🙏",
  model: "gpt-4o-mini",
  apiKey: "sk-proj-xxxxxxxxxxxxxxxxxxxx",
};

const PERSONALITIES: { value: AIpersonality; label: string; description: string }[] = [
  {
    value: "professional",
    label: "Professional",
    description: "Formal and business-like. Best for high-end boutiques.",
  },
  {
    value: "friendly",
    label: "Friendly",
    description: "Warm and welcoming. Great for building customer relationships.",
  },
  {
    value: "casual",
    label: "Casual",
    description: "Relaxed and informal. Ideal for trendy, youthful brands.",
  },
];

const TONES: { value: AITone; label: string; description: string }[] = [
  { value: "helpful", label: "Helpful", description: "Focused on solving customer problems efficiently." },
  { value: "enthusiastic", label: "Enthusiastic", description: "Excited and energetic. Creates a fun shopping experience." },
  { value: "calm", label: "Calm", description: "Patient and composed. Good for handling complaints." },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "rw", label: "Kinyarwanda" },
  { value: "fr", label: "French" },
];

const MODELS = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AISettingsSection() {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [testMessages, setTestMessages] = useState<TestMessage[]>([]);
  const [testInput, setTestInput] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [testMessages.length]);

  function openTestDialog() {
    setTestMessages([
      {
        id: "greeting",
        content: settings.greetingMessage,
        sender: "ai",
        createdAt: new Date().toISOString(),
      },
    ]);
    setTestInput("");
    setTestOpen(true);
  }

  async function sendTestMessage() {
    if (!testInput.trim()) return;
    const userMsg: TestMessage = {
      id: `user-${Date.now()}`,
      content: testInput.trim(),
      sender: "user",
      createdAt: new Date().toISOString(),
    };
    setTestMessages((prev) => [...prev, userMsg]);
    setTestInput("");
    setIsTesting(true);

    // Simulate AI response
    await new Promise((r) => setTimeout(r, 1200));
    const aiMsg: TestMessage = {
      id: `ai-${Date.now()}`,
      content:
        "This is a simulated AI response. In production, the AI would use your configured model and personality to generate a contextual reply. Your settings look great! ✨",
      sender: "ai",
      createdAt: new Date().toISOString(),
    };
    setTestMessages((prev) => [...prev, aiMsg]);
    setIsTesting(false);
  }

  function handleSave() {
    // In production this would POST to /api/ai-settings
    alert("Settings saved! (demo)");
  }

  function handleReset() {
    setSettings(DEFAULT_SETTINGS);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Sales Employee</h1>
          <p className="text-sm text-muted-foreground">
            Configure your AI assistant's personality and behavior
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-2 size-4" /> Reset
          </Button>
          <Button variant="outline" size="sm" onClick={openTestDialog}>
            <TestTube2 className="mr-2 size-4" /> Test AI
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="mr-2 size-4" /> Save
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personality & Tone */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personality & Tone</CardTitle>
            <CardDescription>Define how your AI communicates with customers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Personality</Label>
              <div className="grid gap-3">
                {PERSONALITIES.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setSettings((s) => ({ ...s, personality: p.value }))}
                    className={cn(
                      "flex flex-col items-start rounded-lg border p-4 text-left transition-colors hover:bg-muted/50",
                      settings.personality === p.value && "border-primary bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "size-3 rounded-full border-2",
                          settings.personality === p.value
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30"
                        )}
                      />
                      <span className="font-medium text-sm">{p.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-5">{p.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Tone</Label>
              <div className="grid gap-3">
                {TONES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setSettings((s) => ({ ...s, tone: t.value }))}
                    className={cn(
                      "flex flex-col items-start rounded-lg border p-4 text-left transition-colors hover:bg-muted/50",
                      settings.tone === t.value && "border-primary bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "size-3 rounded-full border-2",
                          settings.tone === t.value
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30"
                        )}
                      />
                      <span className="font-medium text-sm">{t.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-5">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language, Greeting, Auto-Reply */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Communication</CardTitle>
              <CardDescription>Language and greeting settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(v) => setSettings((s) => ({ ...s, language: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Greeting Message</Label>
                <Textarea
                  value={settings.greetingMessage}
                  onChange={(e) => setSettings((s) => ({ ...s, greetingMessage: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Reply</Label>
                  <p className="text-xs text-muted-foreground">
                    AI automatically responds to new messages
                  </p>
                </div>
                <Switch
                  checked={settings.autoReply}
                  onCheckedChange={(checked) => setSettings((s) => ({ ...s, autoReply: checked }))}
                />
              </div>

              {settings.autoReply && (
                <div className="space-y-2">
                  <Label>Working Hours Reply</Label>
                  <Textarea
                    value={settings.workingHoursReply}
                    onChange={(e) => setSettings((s) => ({ ...s, workingHoursReply: e.target.value }))}
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Model & API Key */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Model</CardTitle>
              <CardDescription>Configure the underlying AI model</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Model</Label>
                <Select
                  value={settings.model}
                  onValueChange={(v) => setSettings((s) => ({ ...s, model: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="relative">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={settings.apiKey}
                    onChange={(e) => setSettings((s) => ({ ...s, apiKey: e.target.value }))}
                    placeholder="sk-proj-..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 size-8"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your API key is stored securely and encrypted.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Test AI Dialog */}
      <Dialog open={testOpen} onOpenChange={setTestOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="size-5" /> Test AI Chat
            </DialogTitle>
            <DialogDescription>
              Test how your AI responds to customer messages
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-muted/30 h-80 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {testMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                      msg.sender === "ai"
                        ? "bg-muted mr-auto rounded-bl-md"
                        : "bg-primary text-primary-foreground ml-auto rounded-br-md"
                    )}
                  >
                    {msg.sender === "ai" && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <Bot className="size-3 text-primary" />
                        <span className="text-[10px] font-medium text-primary">AI</span>
                      </div>
                    )}
                    {msg.content}
                  </div>
                ))}
                {isTesting && (
                  <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 mr-auto">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Bot className="size-3 text-primary" />
                      <span className="text-[10px] font-medium text-primary">AI</span>
                    </div>
                    <div className="flex gap-1">
                      <span className="size-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="size-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="size-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <Separator />
            <form
              className="flex gap-2 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                sendTestMessage();
              }}
            >
              <Input
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Type a test message..."
                disabled={isTesting}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!testInput.trim() || isTesting}>
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
