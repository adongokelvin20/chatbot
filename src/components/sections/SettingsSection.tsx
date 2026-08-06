"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Save,
  Loader2,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/common/EmptyState";

// ---------- Types ----------

interface Business {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  timezone?: string | null;
  createdAt: string;
}

interface BusinessFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  instagram: string;
  facebook: string;
  timezone: string;
}

const emptyForm: BusinessFormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  website: "",
  instagram: "",
  facebook: "",
  timezone: "UTC",
};

const timezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Ho_Chi_Minh",
  "Asia/Dubai",
];

// ---------- Component ----------

export default function SettingsSection() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState<BusinessFormData>(emptyForm);

  // ---------- Data Fetching ----------

  const fetchBusiness = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/business");
      if (!res.ok) throw new Error("Failed to fetch business");
      const json = await res.json();
      if (json.success && json.data) {
        setBusiness(json.data);
        setForm({
          name: json.data.name || "",
          email: json.data.email || "",
          phone: json.data.phone || "",
          address: json.data.address || "",
          website: json.data.website || "",
          instagram: json.data.instagram || "",
          facebook: json.data.facebook || "",
          timezone: json.data.timezone || "UTC",
        });
      } else {
        throw new Error(json.error || "Failed to load business");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  // ---------- Save ----------

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) return;
    setSaving(true);
    setSaved(false);
    try {
      const body = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        website: form.website.trim() || undefined,
        instagram: form.instagram.trim() || undefined,
        facebook: form.facebook.trim() || undefined,
        timezone: form.timezone || undefined,
      };

      const res = await fetch("/api/business", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      const json = await res.json();
      setBusiness(json.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  // ---------- Render ----------

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
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

  if (error && !business) {
    return (
      <EmptyState
        icon={Building2}
        title="Failed to load settings"
        description={error}
        action={
          <Button onClick={fetchBusiness}>Try again</Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your business profile and configuration
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <Tabs defaultValue="business">
        <TabsList>
          <TabsTrigger value="business">Business Profile</TabsTrigger>
          <TabsTrigger value="ai">AI Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="biz-name">Business Name *</Label>
                  <Input
                    id="biz-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your business name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="biz-email">Email *</Label>
                  <Input
                    id="biz-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="contact@business.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="biz-phone">Phone</Label>
                  <Input
                    id="biz-phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="biz-address">Address</Label>
                  <Input
                    id="biz-address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Business address"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Online Presence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="biz-website">Website</Label>
                  <Input
                    id="biz-website"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="biz-instagram">Instagram</Label>
                  <Input
                    id="biz-instagram"
                    value={form.instagram}
                    onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                    placeholder="@yourbusiness"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="biz-facebook">Facebook</Label>
                  <Input
                    id="biz-facebook"
                    value={form.facebook}
                    onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                    placeholder="facebook.com/yourbusiness"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="biz-tz">Timezone</Label>
                  <Select
                    value={form.timezone}
                    onValueChange={(v) => setForm({ ...form, timezone: v })}
                  >
                    <SelectTrigger id="biz-tz">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Go to the AI Settings page to configure your AI assistant&apos;s personality, tone, and behavior.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
