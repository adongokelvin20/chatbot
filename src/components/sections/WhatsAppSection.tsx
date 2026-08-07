"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2,
  Copy,
  RefreshCw,
  ExternalLink,
  Key,
  Phone,
  Shield,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// ---------- Types ----------

interface WhatsAppStatus {
  isConfigured: boolean;
  isFullySetup: boolean;
  connectionStatus: "not_configured" | "connected" | "error";
  phoneDisplay: string;
  webhookUrl: string;
  config: {
    accessToken: string;
    phoneNumberId: string;
    businessAccountId: string;
    webhookVerifyToken: string;
    webhookUrl: string;
  };
}

// ---------- Component ----------

export default function WhatsAppSection() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp/config");
      const data = await res.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch {
      toast.error("Failed to fetch WhatsApp status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const testConnection = async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/whatsapp/config", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success(`Connected: ${data.data.displayPhone || data.data.verifiedName || "WhatsApp Business"}`);
        fetchStatus();
      } else {
        toast.error(data.error || "Connection test failed");
      }
    } catch {
      toast.error("Connection test failed");
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getWebhookUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/api/whatsapp/webhook`;
    }
    return "/api/whatsapp/webhook";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">WhatsApp Business</h2>
            <p className="text-sm text-muted-foreground">
              Connect your WhatsApp Business number to enable AI sales chatbot
            </p>
          </div>
        </div>
        {status && (
          <Badge
            variant={status.connectionStatus === "connected" ? "default" : "destructive"}
            className="gap-1"
          >
            {status.connectionStatus === "connected" ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <XCircle className="h-3 w-3" />
            )}
            {status.connectionStatus === "connected"
              ? "Connected"
              : status.connectionStatus === "error"
                ? "Connection Error"
                : "Not Configured"}
          </Badge>
        )}
      </div>

      {/* Connection Status */}
      {status && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-4 w-4" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium">
                  {status.phoneDisplay || "Not connected"}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Webhook URL</p>
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-xs">{getWebhookUrl()}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => copyToClipboard(getWebhookUrl())}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={testConnection} disabled={testing} variant="outline">
                {testing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Test Connection
              </Button>
              <Button variant="outline" onClick={fetchStatus}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Configuration Checklist
          </CardTitle>
          <CardDescription>
            Environment variables that need to be set for WhatsApp to work
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {status?.config && (
              <>
                <ConfigItem
                  label="WA_ACCESS_TOKEN"
                  status={status.config.accessToken}
                  description="Permanent access token from Meta App Dashboard"
                />
                <ConfigItem
                  label="WA_PHONE_NUMBER_ID"
                  status={status.config.phoneNumberId}
                  description="Phone number ID from WhatsApp Business API"
                />
                <ConfigItem
                  label="WA_WEBHOOK_VERIFY_TOKEN"
                  status={status.config.webhookVerifyToken}
                  description="Custom token you create for webhook verification"
                />
                <ConfigItem
                  label="WA_BUSINESS_ACCOUNT_ID"
                  status={status.config.businessAccountId}
                  description="Your WhatsApp Business Account ID"
                />
                <ConfigItem
                  label="WA_WEBHOOK_URL"
                  status={status.config.webhookUrl}
                  description="Public URL for receiving webhook events"
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            Setup Guide (5 Minutes)
          </CardTitle>
          <CardDescription>
            Follow these steps to connect WhatsApp Business to your AI Sales Employee
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Step 1 */}
            <SetupStep
              step={1}
              title="Create a Meta Developer Account"
              description={
                <>
                  Go to{" "}
                  <a
                    href="https://developers.facebook.com/apps/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    developers.facebook.com/apps
                  </a>{" "}
                  and create a new app. Select &quot;Business&quot; type and add the
                  &quot;WhatsApp&quot; product.
                </>
              }
            />

            {/* Step 2 */}
            <SetupStep
              step={2}
              title="Get Your Access Token & Phone Number"
              description={
                <>
                  In your Meta App dashboard, go to WhatsApp &gt; API Setup. Add or
                  select a phone number. Copy the{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">Permanent Token</code>{" "}
                  and the{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">Phone Number ID</code>.
                </>
              }
            />

            {/* Step 3 */}
            <SetupStep
              step={3}
              title="Set Environment Variables"
              description={
                <div className="space-y-2">
                  <p>
                    Add these to your <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code>{" "}
                    file (or deployment environment variables):
                  </p>
                  <div className="rounded-lg bg-muted p-3 font-mono text-xs space-y-1">
                    <div>
                      WA_ACCESS_TOKEN=your_permanent_token_here
                    </div>
                    <div>
                      WA_PHONE_NUMBER_ID=your_phone_number_id
                    </div>
                    <div>
                      WA_BUSINESS_ACCOUNT_ID=your_business_account_id
                    </div>
                    <div>
                      WA_WEBHOOK_VERIFY_TOKEN=make_up_any_secret_string
                    </div>
                    <div>
                      WA_WEBHOOK_URL={getWebhookUrl()}
                    </div>
                  </div>
                </div>
              }
            />

            {/* Step 4 */}
            <SetupStep
              step={4}
              title="Configure Webhook in Meta Dashboard"
              description={
                <>
                  In WhatsApp &gt; Configuration &gt; Webhook, set:
                  <ul className="mt-2 list-disc pl-4 space-y-1 text-sm">
                    <li>
                      <strong>Callback URL:</strong>{" "}
                      <code className="rounded bg-muted px-1 py-0.5 text-xs">{getWebhookUrl()}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-1 inline h-5 w-5"
                        onClick={() => copyToClipboard(getWebhookUrl())}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </li>
                    <li>
                      <strong>Verify Token:</strong> The same secret you put in WA_WEBHOOK_VERIFY_TOKEN
                    </li>
                    <li>
                      <strong>Subscribe to events:</strong>{" "}
                      <code className="rounded bg-muted px-1 py-0.5 text-xs">messages</code> field
                    </li>
                  </ul>
                </>
              }
            />

            {/* Step 5 */}
            <SetupStep
              step={5}
              title="Test It"
              description={
                <>
                  <p>After setup, your AI chatbot is live! Send a WhatsApp message to your
                  business number and it will auto-reply.</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Messages also appear in the Conversations section of this dashboard,
                    so staff can take over anytime by toggling AI mode off.
                  </p>
                </>
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* OpenAI Configuration Notice */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="h-4 w-4" />
            AI Brain: OpenAI (Optional but Recommended)
          </CardTitle>
          <CardDescription>
            Connect OpenAI for smarter AI responses. Without it, the bot uses keyword matching.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              To enable OpenAI-powered responses, go to{" "}
              <strong>AI Settings</strong> and add your OpenAI API key, or set the{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">OPENAI_API_KEY</code>{" "}
              environment variable.
            </p>
            <p className="text-sm text-muted-foreground">
              The AI will use your products, delivery zones, payment methods, and FAQs as context
              to give accurate, personalized responses to customers on WhatsApp.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Meta Developer Link */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          asChild
        >
          <a
            href="https://developers.facebook.com/apps/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Meta Developer Dashboard
          </a>
        </Button>
      </div>
    </div>
  );
}

// ---------- Sub-Components ----------

function ConfigItem({
  label,
  status,
  description,
}: {
  label: string;
  status: string;
  description: string;
}) {
  const isOk = status === "configured";
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      {isOk ? (
        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
      )}
      <div>
        <p className="font-mono text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        <Badge variant={isOk ? "default" : "destructive"} className="mt-1">
          {status}
        </Badge>
      </div>
    </div>
  );
}

function SetupStep({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
        {step}
      </div>
      <div className="pt-1">
        <h4 className="font-medium">{title}</h4>
        <div className="mt-1 text-sm text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}
