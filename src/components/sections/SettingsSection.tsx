"use client";

import React, { useState } from "react";
import {
  Save,
  RotateCcw,
  Building2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DayHours, WeekDay } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BusinessProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  instagram: string;
  facebook: string;
  timezone: string;
  logoUrl: string;
}

// ---------------------------------------------------------------------------
// Default Values
// ---------------------------------------------------------------------------

const DEFAULT_PROFILE: BusinessProfile = {
  name: "Umuhoza Fashion House",
  email: "info@umuhozafashion.rw",
  phone: "+250 788 123 456",
  address: "KG 123 Street, Kicukiro, Kigali, Rwanda",
  website: "https://umuhozafashion.rw",
  instagram: "@umuhozafashion",
  facebook: "UmuhozaFashionHouse",
  timezone: "Africa/Kigali",
  logoUrl: "",
};

const DEFAULT_HOURS: Record<WeekDay, DayHours> = {
  mon: { open: "08:00", close: "18:00", closed: false },
  tue: { open: "08:00", close: "18:00", closed: false },
  wed: { open: "08:00", close: "18:00", closed: false },
  thu: { open: "08:00", close: "18:00", closed: false },
  fri: { open: "08:00", close: "18:00", closed: false },
  sat: { open: "08:00", close: "16:00", closed: false },
  sun: { open: "08:00", close: "18:00", closed: true },
};

const DAY_LABELS: Record<WeekDay, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const TIMEZONES = [
  "Africa/Kigali",
  "Africa/Nairobi",
  "Africa/Dar_es_Salaam",
  "Africa/Lagos",
  "Africa/Johannesburg",
  "Africa/Cairo",
  "UTC",
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SettingsSection() {
  const [profile, setProfile] = useState<BusinessProfile>(DEFAULT_PROFILE);
  const [hours, setHours] = useState<Record<WeekDay, DayHours>>(DEFAULT_HOURS);

  function handleSave() {
    alert("Settings saved! (demo)");
  }

  function handleReset() {
    setProfile(DEFAULT_PROFILE);
    setHours(DEFAULT_HOURS);
  }

  function updateDay(day: WeekDay, field: keyof DayHours, value: string | boolean) {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your business profile and configuration
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-2 size-4" /> Reset
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="mr-2 size-4" /> Save
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <Building2 className="mr-2 size-4" /> Business Profile
          </TabsTrigger>
          <TabsTrigger value="ai">
            AI Configuration
          </TabsTrigger>
        </TabsList>

        {/* Business Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Business Information</CardTitle>
              <CardDescription>
                Your store's public information shown to customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="b-name">Business Name *</Label>
                  <Input
                    id="b-name"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b-email">Business Email *</Label>
                  <Input
                    id="b-email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b-phone">Phone Number</Label>
                  <Input
                    id="b-phone"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b-website">Website</Label>
                  <Input
                    id="b-website"
                    value={profile.website}
                    onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-address">Address</Label>
                <Input
                  id="b-address"
                  value={profile.address}
                  onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="b-insta">Instagram</Label>
                  <Input
                    id="b-insta"
                    value={profile.instagram}
                    onChange={(e) => setProfile((p) => ({ ...p, instagram: e.target.value }))}
                    placeholder="@handle"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b-fb">Facebook</Label>
                  <Input
                    id="b-fb"
                    value={profile.facebook}
                    onChange={(e) => setProfile((p) => ({ ...p, facebook: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={profile.timezone}
                    onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))}
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b-logo">Logo URL</Label>
                  <Input
                    id="b-logo"
                    value={profile.logoUrl}
                    onChange={(e) => setProfile((p) => ({ ...p, logoUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Working Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="size-4" /> Working Hours
              </CardTitle>
              <CardDescription>
                Set your business hours. Outside these hours, the AI will use the working hours reply message.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(Object.keys(DAY_LABELS) as WeekDay[]).map((day) => {
                  const h = hours[day];
                  return (
                    <div
                      key={day}
                      className="flex items-center gap-4 sm:gap-6"
                    >
                      <span className="w-24 text-sm font-medium shrink-0">
                        {DAY_LABELS[day]}
                      </span>
                      <Switch
                        checked={!h.closed}
                        onCheckedChange={(checked) => updateDay(day, "closed", !checked)}
                      />
                      {h.closed ? (
                        <span className="text-sm text-muted-foreground">Closed</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={h.open}
                            onChange={(e) => updateDay(day, "open", e.target.value)}
                            className="w-28 h-8"
                          />
                          <span className="text-sm text-muted-foreground">to</span>
                          <Input
                            type="time"
                            value={h.close}
                            onChange={(e) => updateDay(day, "close", e.target.value)}
                            className="w-28 h-8"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Configuration Tab */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Configuration</CardTitle>
              <CardDescription>
                Configure your AI Sales Employee's behavior and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI settings have been moved to the dedicated{" "}
                <strong>AI Sales Employee</strong> page in the sidebar. Please navigate there to configure personality, tone, model, and other AI-specific settings.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
