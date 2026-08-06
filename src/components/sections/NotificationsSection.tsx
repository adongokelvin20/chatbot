"use client";

import React, { useState } from "react";
import {
  ShoppingCart,
  Package,
  AlertTriangle,
  UserPlus,
  RotateCcw,
  Bell,
  Check,
  CheckCheck,
  MessageSquare,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/common/EmptyState";
import type { NotificationType } from "@/types";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  new_order: {
    icon: ShoppingCart,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-950",
  },
  bulk_order: {
    icon: Package,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-100 dark:bg-violet-950",
  },
  refund_request: {
    icon: RotateCcw,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-950",
  },
  low_stock: {
    icon: AlertTriangle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-950",
  },
  human_takeover: {
    icon: UserPlus,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-100 dark:bg-orange-950",
  },
};

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
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
// Demo Data
// ---------------------------------------------------------------------------

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "new_order",
    title: "New Order Received",
    message: "Grace Uwimana placed an order for RWF 45,000 — Royal Gold Kitenge Set (x1). Payment via MTN MoMo confirmed.",
    read: false,
    createdAt: "2025-01-15T10:50:00Z",
  },
  {
    id: "n2",
    type: "human_takeover",
    title: "AI Handed Over Conversation",
    message: "Marie-Claire Mukamana requested to speak with a human agent about order ORD-2025-0108.",
    read: false,
    createdAt: "2025-01-15T09:01:00Z",
  },
  {
    id: "n3",
    type: "bulk_order",
    title: "Bulk Order Inquiry",
    message: "Emmanuel Gatera is interested in 5 matching family outfits for a traditional ceremony. Estimated value: RWF 185,000.",
    read: false,
    createdAt: "2025-01-14T15:06:00Z",
  },
  {
    id: "n4",
    type: "low_stock",
    title: "Low Stock Alert",
    message: "Kitenge Heritage Matching Set - Royal Blue (M) is down to 2 units. Consider restocking soon.",
    read: true,
    createdAt: "2025-01-14T12:00:00Z",
  },
  {
    id: "n5",
    type: "refund_request",
    title: "Refund Request",
    message: "Patrick Niyonzima requested a refund for order ORD-2024-1230 (RWF 38,000). Reason: size too small.",
    read: true,
    createdAt: "2025-01-13T14:30:00Z",
  },
  {
    id: "n6",
    type: "new_order",
    title: "New Order Received",
    message: "Diane Ishimwe placed an order for RWF 28,500 — Ankara Maxi Dress (x1). Cash on Delivery.",
    read: true,
    createdAt: "2025-01-13T11:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NotificationsSection() {
  const [notifications, setNotifications] =
    useState<Notification[]>(DEMO_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="mr-2 size-4" /> Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You'll see alerts for new orders, AI takeovers, and more here."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div>
              {notifications.map((notification, idx) => {
                const config = TYPE_CONFIG[notification.type];
                const Icon = config.icon;
                return (
                  <div key={notification.id}>
                    <button
                      className={cn(
                        "w-full text-left p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors",
                        !notification.read && "bg-primary/[0.03]"
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-full mt-0.5",
                          config.bg
                        )}
                      >
                        <Icon className={cn("size-5", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p
                                className={cn(
                                  "text-sm",
                                  !notification.read && "font-semibold"
                                )}
                              >
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="size-2 rounded-full bg-primary shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          <span className="text-[11px] text-muted-foreground shrink-0 whitespace-nowrap">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 shrink-0 mt-0.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        >
                          <Check className="size-3.5" />
                        </Button>
                      )}
                    </button>
                    {idx < notifications.length - 1 && <Separator />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
