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
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// ---------- Types ----------

interface WhatsAppConfigStatus {
  isConfigured: boolean;
  connectionStatus: "not_configured" | "connected" | "error";
  phoneDisplay: string;
  config: Record<string, string>;
}

// ---------- Component ----------

export default function WhatsAppSection() {
  const [activeTab, setActiveTab] = useState<"twilio" | "meta">("twilio");
  const [metaStatus, setMetaStatus] = useState<WhatsAppConfigStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp/config");
      const data = await res.json();
      if (data.success) {
        setMetaStatus(data.data);
      }
    } catch {
      // ignore
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
        toast.success(`Connected: ${data.data.displayPhone || data.data.verifiedName}`);
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

  const getWebhookUrl = (path: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${path}`;
    }
    return path;
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
              Connect your WhatsApp to enable the AI sales chatbot
            </p>
          </div>
        </div>
      </div>

      {/* Provider Selection */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${activeTab === "twilio" ? "ring-2 ring-primary" : "opacity-80 hover:opacity-100"}`}
          onClick={() => setActiveTab("twilio")}
        >
          <CardContent className="flex items-start gap-3 pt-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Twilio (Recommended)</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Easiest setup. Free sandbox to test immediately. No Meta account needed.
              </p>
              <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Easiest
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${activeTab === "meta" ? "ring-2 ring-primary" : "opacity-80 hover:opacity-100"}`}
          onClick={() => setActiveTab("meta")}
        >
          <CardContent className="flex items-start gap-3 pt-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Meta Cloud API (Direct)</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Direct integration with Meta. More control but complex setup.
              </p>
              <Badge className="mt-2" variant="secondary">
                Advanced
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Twilio Setup Guide */}
      {activeTab === "twilio" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-red-500" />
                Twilio Setup Guide (3 Minutes)
              </CardTitle>
              <CardDescription>
                The fastest way to get your AI chatbot on WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <SetupStep
                  step={1}
                  title="Create a Free Twilio Account"
                  description={
                    <>
                      Go to{" "}
                      <a
                        href="https://www.twilio.com/try-twilio"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        twilio.com/try-twilio
                      </a>{" "}
                      and sign up for free. You get free messages to test with.
                    </>
                  }
                />

                <SetupStep
                  step={2}
                  title="Get Your Twilio WhatsApp Number"
                  description={
                    <>
                      Go to{" "}
                      <strong>Messaging &gt; Try it out &gt; Send a WhatsApp message</strong>.
                      Twilio gives you a sandbox phone number and a join code.
                      Send the code to that number from your WhatsApp to activate it.
                    </>
                  }
                />

                <SetupStep
                  step={3}
                  title="Set Environment Variables"
                  description={
                    <div className="space-y-2">
                      <p>
                        Add these to your{" "}
                        <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code> or
                        deployment environment:
                      </p>
                      <div className="rounded-lg bg-muted p-3 font-mono text-xs space-y-1">
                        <div>
                          TWILIO_ACCOUNT_SID=your_account_sid_here
                        </div>
                        <div>
                          TWILIO_AUTH_TOKEN=your_auth_token_here
                        </div>
                        <div>
                          TWILIO_WHATSAPP_NUMBER=whatsapp:+14155552671
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Find Account SID and Auth Token in your Twilio Console dashboard.
                        The WhatsApp number is the sandbox number Twilio gave you
                        (prepend &quot;whatsapp:&quot; to it).
                      </p>
                    </div>
                  }
                />

                <SetupStep
                  step={4}
                  title="Set Webhook URL in Twilio"
                  description={
                    <>
                      <p>
                        In Twilio Console, go to{" "}
                        <strong>Messaging &gt; Settings &gt; WhatsApp Sandbox Settings</strong>{" "}
                        and set:
                      </p>
                      <ul className="mt-2 list-disc pl-4 space-y-1 text-sm">
                        <li>
                          <strong>When a message comes in:</strong>{" "}
                          <code className="rounded bg-muted px-1 py-0.5 text-xs">
                            {getWebhookUrl("/api/whatsapp/twilio")}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-1 inline h-5 w-5"
                            onClick={() => copyToClipboard(getWebhookUrl("/api/whatsapp/twilio"))}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </li>
                      </ul>
                    </>
                  }
                />

                <SetupStep
                  step={5}
                  title="Test It!"
                  description={
                    <>
                      <p>
                        Send a WhatsApp message to your Twilio sandbox number. The AI chatbot
                        will reply automatically! All messages also appear in the{" "}
                        <strong>Conversations</strong> section of this dashboard.
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Staff can take over anytime by toggling AI mode off in the conversation.
                      </p>
                    </>
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10">
            <CardContent className="pt-5">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-300">
                    Why Twilio is Easier
                  </h4>
                  <ul className="mt-2 list-disc pl-4 text-sm text-green-700 dark:text-green-400">
                    <li>No Meta Developer Account needed</li>
                    <li>No Business Manager setup</li>
                    <li>Free sandbox to test immediately</li>
                    <li>Webhook URL is the only config needed in Twilio</li>
                    <li>Works with ngrok for local testing</li>
                    <li>Production upgrade: apply for a dedicated number anytime</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Meta Setup Guide */}
      {activeTab === "meta" && (
        <>
          {/* Connection Status */}
          {metaStatus && (
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
                    <p className="font-medium">{metaStatus.phoneDisplay || "Not connected"}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Webhook URL</p>
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-xs">
                        {getWebhookUrl("/api/whatsapp/webhook")}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => copyToClipboard(getWebhookUrl("/api/whatsapp/webhook"))}
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
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-blue-500" />
                Meta Cloud API Setup (10-15 Minutes)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <SetupStep
                  step={1}
                  title="Create Meta Developer Account"
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
                      → Create App → &quot;Business&quot; → Add &quot;WhatsApp&quot; product.
                    </>
                  }
                />
                <SetupStep
                  step={2}
                  title="Get Access Token & Phone Number ID"
                  description={
                    <>
                      In WhatsApp &gt; API Setup, add a phone number. Copy the{" "}
                      <code className="rounded bg-muted px-1 py-0.5 text-xs">Permanent Token</code>{" "}
                      and <code className="rounded bg-muted px-1 py-0.5 text-xs">Phone Number ID</code>.
                    </>
                  }
                />
                <SetupStep
                  step={3}
                  title="Set Environment Variables"
                  description={
                    <div className="space-y-2">
                      <p>Add to <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code>:</p>
                      <div className="rounded-lg bg-muted p-3 font-mono text-xs space-y-1">
                        <div>WA_ACCESS_TOKEN=your_permanent_token</div>
                        <div>WA_PHONE_NUMBER_ID=your_phone_number_id</div>
                        <div>WA_BUSINESS_ACCOUNT_ID=your_account_id</div>
                        <div>WA_WEBHOOK_VERIFY_TOKEN=any_secret_string</div>
                        <div>WA_WEBHOOK_URL={getWebhookUrl("/api/whatsapp/webhook")}</div>
                      </div>
                    </div>
                  }
                />
                <SetupStep
                  step={4}
                  title="Configure Webhook in Meta"
                  description={
                    <ul className="list-disc pl-4 space-y-1 text-sm">
                      <li>
                        <strong>Callback URL:</strong>{" "}
                        <code className="rounded bg-muted px-1 py-0.5 text-xs">
                          {getWebhookUrl("/api/whatsapp/webhook")}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-1 inline h-5 w-5"
                          onClick={() => copyToClipboard(getWebhookUrl("/api/whatsapp/webhook"))}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </li>
                      <li><strong>Verify Token:</strong> Same secret as WA_WEBHOOK_VERIFY_TOKEN</li>
                      <li><strong>Subscribe to:</strong> messages field</li>
                    </ul>
                  }
                />
                <SetupStep
                  step={5}
                  title="Test It"
                  description="Send a WhatsApp message to your business number. The AI will auto-reply!"
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* OpenAI Notice */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10">
        <CardContent className="pt-5">
          <div className="flex items-start gap-3">
            <Key className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <div>
              <h4 className="font-medium">
                Smarter AI with OpenAI (Optional)
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Set <code className="rounded bg-muted px-1 py-0.5 text-xs">OPENAI_API_KEY</code>{" "}
                in your environment or add it in AI Settings. The bot will use your products,
                delivery zones, payment methods, and FAQs to give personalized responses.
                Without it, a keyword-based system handles replies.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="outline" asChild>
          <a href="https://www.twilio.com/try-twilio" target="_blank" rel="noopener noreferrer">
            <Zap className="mr-2 h-4 w-4" />
            Create Twilio Account
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Meta Developer Dashboard
          </a>
        </Button>
      </div>
    </div>
  );
}

// ---------- Sub-Components ----------

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
