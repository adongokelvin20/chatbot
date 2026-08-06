"use client";

import React, { useCallback, useState } from "react";
import { Bell, Check, CheckCheck, Package, AlertTriangle, CreditCard, UserCheck, ShoppingCart } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { NotificationPayload, NotificationType } from "@/types";

const notificationIconMap: Record<NotificationType, React.ElementType> = {
  new_order: Package,
  bulk_order: ShoppingCart,
  refund_request: CreditCard,
  low_stock: AlertTriangle,
  human_takeover: UserCheck,
};

const notificationColorMap: Record<NotificationType, string> = {
  new_order: "text-blue-500 bg-blue-500/10",
  bulk_order: "text-violet-500 bg-violet-500/10",
  refund_request: "text-orange-500 bg-orange-500/10",
  low_stock: "text-amber-500 bg-amber-500/10",
  human_takeover: "text-rose-500 bg-rose-500/10",
};

interface NotificationBellProps {
  notifications?: NotificationPayload[];
  unreadCount?: number;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onNotificationClick?: (notification: NotificationPayload) => void;
  className?: string;
}

export function NotificationBell({
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
  className,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);

  const handleMarkAsRead = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      onMarkAsRead?.(id);
    },
    [onMarkAsRead]
  );

  const handleMarkAllAsRead = useCallback(() => {
    onMarkAllAsRead?.();
  }, [onMarkAllAsRead]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </button>
          )}
        </div>
        <ScrollArea className="h-[320px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="mb-2 size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => {
                const Icon = notificationIconMap[notification.type] || Bell;
                const colorClasses =
                  notificationColorMap[notification.type] ||
                  "text-muted-foreground bg-muted";
                return (
                  <React.Fragment key={notification.id}>
                    <button
                      onClick={() => onNotificationClick?.(notification)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent",
                        !notification.read && "bg-accent/50"
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                          colorClasses
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p
                            className={cn(
                              "truncate text-sm",
                              !notification.read && "font-semibold"
                            )}
                          >
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="shrink-0 rounded-full bg-primary size-1.5" />
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground/70">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && onMarkAsRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(e, notification.id)}
                          className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          title="Mark as read"
                        >
                          <Check className="size-3" />
                        </button>
                      )}
                    </button>
                    <Separator />
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
