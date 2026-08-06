"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus, PaymentStatus, ConversationStatus } from "@/types";

// ---------------------------------------------------------------------------
// Order status styles
// ---------------------------------------------------------------------------

const orderStatusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  processing: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
  shipped: "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  cancelled: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
};

const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// ---------------------------------------------------------------------------
// Payment status styles
// ---------------------------------------------------------------------------

const paymentStatusStyles: Record<PaymentStatus, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  failed: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
};

// ---------------------------------------------------------------------------
// Conversation status styles
// ---------------------------------------------------------------------------

const conversationStatusStyles: Record<ConversationStatus, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  resolved: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  archived: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
};

const conversationStatusLabels: Record<ConversationStatus, string> = {
  active: "Active",
  resolved: "Resolved",
  archived: "Archived",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StatusType = "order" | "payment" | "conversation";

type StatusValue =
  | OrderStatus
  | PaymentStatus
  | ConversationStatus
  | (string & {});

interface StatusBadgeProps {
  status: StatusValue;
  type?: StatusType;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StatusBadge({
  status,
  type,
  className,
}: StatusBadgeProps) {
  let style = "bg-secondary text-secondary-foreground border-secondary";
  let label = capitalize(status);

  if (type === "order" && status in orderStatusStyles) {
    style = orderStatusStyles[status as OrderStatus];
    label = orderStatusLabels[status as OrderStatus];
  } else if (type === "payment" && status in paymentStatusStyles) {
    style = paymentStatusStyles[status as PaymentStatus];
    label = paymentStatusLabels[status as PaymentStatus];
  } else if (type === "conversation" && status in conversationStatusStyles) {
    style = conversationStatusStyles[status as ConversationStatus];
    label = conversationStatusLabels[status as ConversationStatus];
  }

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", style, className)}
    >
      {label}
    </Badge>
  );
}
