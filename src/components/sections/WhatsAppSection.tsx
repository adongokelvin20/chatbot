"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  CheckCircle,
  Copy,
  RefreshCw,
  ExternalLink,
  Key,
  Zap,
  DollarSign,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function WhatsAppSection() {
  const [activeTab, setActiveTab] = useState<"green" | "twilio" | "meta">("green");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied!");
    } catch {
      toast.error("Failed to copy");
    }
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
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">WhatsApp Business</h2>
          <p className="text-sm text-muted-foreground">
            Connect WhatsApp so your AI chatbot can talk to customers
          </p>
        </div>
      </div>

      {/* Provider Selection — 3 Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${activeTab === "green" ? "ring-2 ring-green-500" : "opacity-75 hover:opacity-100"}`}
          onClick={() => setActiveTab("green")}
        >
          <CardContent className="flex items-start gap-3 pt-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Green API</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                100% FREE. 50 msgs/day. No credit card. No Meta account.
              </p>
              <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                FREE FOREVER
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${activeTab === "twilio" ? "ring-2 ring-primary" : "opacity-75 hover:opacity-100"}`}
          onClick={() => setActiveTab("twilio")}
        >
          <CardContent className="flex items-start gap-3 pt-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Twilio</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Easy setup but costs money after free trial.
              </p>
              <Badge className="mt-2" variant="secondary">
                PAID
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${activeTab === "meta" ? "ring-2 ring-primary" : "opacity-75 hover:opacity-100"}`}
          onClick={() => setActiveTab("meta")}
        >
          <CardContent className="flex items-start gap-3 pt-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Meta Direct</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Free (1,000/month) but hard setup.
              </p>
              <Badge className="mt-2" variant="secondary">
                FREE / COMPLEX
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ======================== GREEN API (Recommended) ======================== */}
      {activeTab === "green" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4 text-green-500" />
                Green API Setup (3 Minutes, Free Forever)
              </CardTitle>
              <CardDescription>
                No credit card. No trial. No Meta account. Just email + password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <SetupStep
                  step={1}
                  title="Sign Up (30 seconds)"
                  description={
                    <>
                      Go to{" "}
                      <a
                        href="https://green-api.com/en/docs/registration/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 underline hover:text-green-800"
                      >
                        green-api.com
                      </a>{" "}
                      and create a free account with just your email and a password. No credit card.
                    </>
                  }
                />

                <SetupStep
                  step={2}
                  title="Create Instance & Scan QR Code"
                  description={
                    <>
                      <p>
                        After signing up, click <strong>"Create Instance"</strong> in your dashboard.
                        You'll see a <strong>QR code</strong> on screen.
                      </p>
                      <p className="mt-2">
                        Open <strong>WhatsApp on your phone</strong> → Settings → Linked Devices → Link a Device → Scan the QR code.
                      </p>
                      <p className="mt-2 text-sm text-green-600 font-medium">
                        Your WhatsApp is now connected! Copy these 2 things:
                      </p>
                      <ul className="mt-1 list-disc pl-4 text-sm">
                        <li><strong>Instance ID</strong> (e.g. 1234567890)</li>
                        <li><strong>API Token</strong> (a long random string)</li>
                      </ul>
                    </>
                  }
                />

                <SetupStep
                  step={3}
                  title="Set Environment Variables"
                  description={
                    <div className="space-y-2">
                      <p>
                        Add these 2 values to your deployment platform's environment settings
                        (or <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code> file):
                      </p>
                      <div className="rounded-lg bg-muted p-3 font-mono text-xs space-y-1">
                        <div>
                          GREEN_API_INSTANCE_ID=your_instance_id_here
                        </div>
                        <div>
                          GREEN_API_TOKEN=your_api_token_here
                        </div>
                      </div>
                    </div>
                  }
                />

                <SetupStep
                  step={4}
                  title="Set Webhook in Green API"
                  description={
                    <>
                      <p>In your Green API dashboard, find <strong>Settings</strong> and set:</p>
                      <ul className="mt-2 list-disc pl-4 space-y-1 text-sm">
                        <li>
                          <strong>Webhook URL:</strong>{" "}
                          <code className="rounded bg-muted px-1 py-0.5 text-xs">
                            {getWebhookUrl("/api/whatsapp/green")}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-1 inline h-5 w-5"
                            onClick={() => copyToClipboard(getWebhookUrl("/api/whatsapp/green"))}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </li>
                        <li>
                          <strong>Webhook events:</strong> Select <code className="rounded bg-muted px-1 py-0.5 text-xs">incomingMessageReceived</code>
                        </li>
                      </ul>
                    </>
                  }
                />

                <SetupStep
                  step={5}
                  title="Test It!"
                  description={
                    <p>
                      Send a WhatsApp message to your number (the one you scanned with).
                      The AI bot will reply automatically! All conversations appear in your
                      <strong> Conversations</strong> dashboard too.
                    </p>
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
                    Why Green API is Best for You
                  </h4>
                  <ul className="mt-2 list-disc pl-4 text-sm text-green-700 dark:text-green-400 space-y-1">
                    <li><strong>100% free forever</strong> — 50 messages per day, every day</li>
                    <li>No credit card, no trial period, no catch</li>
                    <li>No Meta/Facebook account needed at all</li>
                    <li>Setup in under 3 minutes</li>
                    <li>Works with your <strong>personal</strong> WhatsApp number</li>
                    <li>No approval process — instant activation</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ======================== TWILIO ======================== */}
      {activeTab === "twilio" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-red-500" />
              Twilio Setup
            </CardTitle>
            <CardDescription>
              Easy but costs money after the free trial ends.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <SetupStep
                step={1}
                title="Sign up at twilio.com/try-twilio"
                description="Create a free account. You get a temporary free trial number."
              />
              <SetupStep
                step={2}
                title="Activate WhatsApp Sandbox"
                description="Go to Messaging → Try it out → WhatsApp. Send the join code to the sandbox number."
              />
              <SetupStep
                step={3}
                title="Set Environment Variables"
                description={
                  <div className="rounded-lg bg-muted p-3 font-mono text-xs space-y-1">
                    <div>TWILIO_ACCOUNT_SID=ACxxxx</div>
                    <div>TWILIO_AUTH_TOKEN=your_token</div>
                    <div>TWILIO_WHATSAPP_NUMBER=whatsapp:+14155552671</div>
                  </div>
                }
              />
              <SetupStep
                step={4}
                title="Set Webhook URL"
                description={
                  <p>
                    In Twilio Console → WhatsApp Sandbox Settings → "When a message comes in":
                    <code className="ml-2 rounded bg-muted px-1 py-0.5 text-xs">
                      {getWebhookUrl("/api/whatsapp/twilio")}
                    </code>
                    <Button variant="ghost" size="icon" className="ml-1 inline h-5 w-5"
                      onClick={() => copyToClipboard(getWebhookUrl("/api/whatsapp/twilio"))}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </p>
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ======================== META ======================== */}
      {activeTab === "meta" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-blue-500" />
              Meta Cloud API Setup (Free but Complex)
            </CardTitle>
            <CardDescription>
              Free for 1,000 customer conversations/month. Requires Meta Developer account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <SetupStep step={1} title="Create Meta Developer App"
                description='Go to developers.facebook.com/apps → Create App → "Business" type → Add WhatsApp product.' />
              <SetupStep step={2} title="Get Token & Phone Number ID"
                description="In WhatsApp > API Setup, copy your Permanent Token and Phone Number ID." />
              <SetupStep step={3} title="Set Environment Variables"
                description={
                  <div className="rounded-lg bg-muted p-3 font-mono text-xs space-y-1">
                    <div>WA_ACCESS_TOKEN=your_token</div>
                    <div>WA_PHONE_NUMBER_ID=your_phone_id</div>
                    <div>WA_BUSINESS_ACCOUNT_ID=your_account_id</div>
                    <div>WA_WEBHOOK_VERIFY_TOKEN=any_secret_string</div>
                  </div>
                }
              />
              <SetupStep step={4} title="Configure Webhook"
                description={
                  <p>
                    Callback URL:
                    <code className="ml-2 rounded bg-muted px-1 py-0.5 text-xs">
                      {getWebhookUrl("/api/whatsapp/webhook")}
                    </code>
                    <Button variant="ghost" size="icon" className="ml-1 inline h-5 w-5"
                      onClick={() => copyToClipboard(getWebhookUrl("/api/whatsapp/webhook"))}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </p>
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* OpenAI Notice */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10">
        <CardContent className="pt-5">
          <div className="flex items-start gap-3">
            <Key className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <div>
              <h4 className="font-medium">Make the AI Smarter (Optional)</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Add <code className="rounded bg-muted px-1 py-0.5 text-xs">OPENAI_API_KEY</code> to your
                env vars for smarter AI responses using your products, prices, and FAQs.
                Without it, the bot still works with keyword-based responses.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action */}
      <div className="flex justify-center">
        <Button asChild>
          <a href="https://green-api.com" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Green API — Free Signup
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
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-white text-sm font-bold">
        {step}
      </div>
      <div className="pt-1">
        <h4 className="font-medium">{title}</h4>
        <div className="mt-1 text-sm text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}
