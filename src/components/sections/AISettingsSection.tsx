"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Save,
  Loader2,
  Bot,
  Send,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/common/EmptyState";
import type { AIpersonality, AITone } from "@/types";

// ---------- Types ----------

interface AISettings {
  id: string;
  personality?: string | null;
  tone?: string | null;
  language?: string | null;
  greetingMessage?: string | null;
  workingHoursReply?: string | null;
  autoReply?: boolean;
  model?: string | null;
  apiKey?: string | null;
}

interface TestMessage {
  role: "user" | "assistant";
  content: string;
}

const personalities: { value: AIpersonality; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "casual", label: "Casual" },
];

const tones: { value: AITone; label: string }[] = [
  { value: "helpful", label: "Helpful" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "calm", label: "Calm" },
];

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "ar", label: "Arabic" },
  { value: "vi", label: "Vietnamese" },
  { value: "zh", label: "Chinese" },
];

const models = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "claude-3-haiku", label: "Claude 3 Haiku" },
  { value: "claude-3-sonnet", label: "Claude 3 Sonnet" },
];

// ---------- Component ----------

export default function AISettingsSection() {
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Test dialog
  const [testOpen, setTestOpen] = useState(false);
  const [testInput, setTestInput] = useState("");
  const [testMessages, setTestMessages] = useState<TestMessage[]>([]);
  const [testLoading, setTestLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    personality: "professional" as AIpersonality,
    tone: "helpful" as AITone,
    language: "en",
    greetingMessage: "",
    workingHoursReply: "",
    autoReply: true,
    model: "gpt-4o-mini",
    apiKey: "",
  });

  // ---------- Data Fetching ----------

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/ai-settings");
      if (!res.ok) throw new Error("Failed to fetch AI settings");
      const json = await res.json();
      const data = json.data;
      setSettings(data);

      if (data) {
        setForm({
          personality: (data.personality as AIpersonality) || "professional",
          tone: (data.tone as AITone) || "helpful",
          language: data.language || "en",
          greetingMessage: data.greetingMessage || "",
          workingHoursReply: data.workingHoursReply || "",
          autoReply: data.autoReply ?? true,
          model: data.model || "gpt-4o-mini",
          apiKey: data.apiKey || "",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ---------- Save ----------

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/ai-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      const json = await res.json();
      setSettings(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  // ---------- Test AI ----------

  function openTest() {
    setTestMessages([]);
    setTestInput("");
    setTestOpen(true);
  }

  async function handleTestSend() {
    if (!testInput.trim() || testLoading) return;
    const userMsg = testInput.trim();
    setTestInput("");
    setTestMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setTestLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerMessage: userMsg }),
      });
      const json = await res.json();
      if (json.success) {
        setTestMessages((prev) => [
          ...prev,
          { role: "assistant", content: json.data.reply },
        ]);
      } else {
        setTestMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Error: " + (json.error || "Failed") },
        ]);
      }
    } catch {
      setTestMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to get AI response." },
      ]);
    } finally {
      setTestLoading(false);
    }
  }

  // ---------- Render ----------

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <EmptyState
        icon={Bot}
        title="Failed to load AI settings"
        description={error}
        action={
          <Button onClick={fetchSettings}>Try again</Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Configuration</h2>
          <p className="text-sm text-muted-foreground">
            Configure your AI sales assistant behavior
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={openTest}>
            <Bot className="mr-2 size-4" />
            Test AI
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
            Save Settings
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personality */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personality</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={form.personality}
              onValueChange={(v) => setForm({ ...form, personality: v as AIpersonality })}
              className="space-y-2"
            >
              {personalities.map((p) => (
                <div key={p.value} className="flex items-center gap-2">
                  <RadioGroupItem value={p.value} id={`personality-${p.value}`} />
                  <Label htmlFor={`personality-${p.value}`} className="font-normal">
                    {p.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Tone */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tone</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={form.tone}
              onValueChange={(v) => setForm({ ...form, tone: v as AITone })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tones.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Language</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={form.language}
              onValueChange={(v) => setForm({ ...form, language: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Model & API Key */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Model & API Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Model</Label>
              <Select
                value={form.model}
                onValueChange={(v) => setForm({ ...form, model: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>API Key</Label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={form.apiKey}
                  onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                  placeholder="sk-..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showApiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Greeting Message */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Greeting Message</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.greetingMessage}
              onChange={(e) => setForm({ ...form, greetingMessage: e.target.value })}
              placeholder="Hi there! Welcome! How can I help you today?"
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Working Hours Reply */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Working Hours Reply</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={form.workingHoursReply}
              onChange={(e) => setForm({ ...form, workingHoursReply: e.target.value })}
              placeholder="Thanks for reaching out! We're currently outside working hours. We'll get back to you as soon as possible."
              rows={3}
            />
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-reply">Auto-Reply</Label>
              <Switch
                id="auto-reply"
                checked={form.autoReply}
                onCheckedChange={(v) => setForm({ ...form, autoReply: v })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test AI Dialog */}
      <Dialog open={testOpen} onOpenChange={setTestOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Test AI Chat</DialogTitle>
            <DialogDescription>
              Send a test message to see how your AI responds.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <ScrollArea className="h-[300px] rounded-lg border p-4">
              {testMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Send a message to test the AI assistant.
                </p>
              ) : (
                <div className="space-y-3">
                  {testMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          {msg.role === "assistant" && <Bot className="size-3" />}
                          <span className="text-xs font-medium opacity-70">
                            {msg.role === "user" ? "You" : "AI"}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {testLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-3 py-2">
                        <Loader2 className="size-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleTestSend();
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Type a test message..."
                disabled={testLoading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={testLoading || !testInput.trim()}>
                {testLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
