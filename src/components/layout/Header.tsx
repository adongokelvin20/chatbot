"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { NotificationBell } from "./NotificationBell";
import { cn } from "@/lib/utils";
import type { NotificationPayload } from "@/types";

export type NavSection =
  | "dashboard"
  | "products"
  | "categories"
  | "orders"
  | "customers"
  | "conversations"
  | "ai-sales"
  | "whatsapp"
  | "delivery"
  | "payments"
  | "promotions"
  | "analytics"
  | "staff"
  | "settings"
  | "faq"
  | "notifications";

interface HeaderProps {
  currentSection?: NavSection;
  breadcrumbs?: { label: string; href?: string }[];
  userName?: string;
  userEmail?: string;
  userImage?: string | null;
  notifications?: NotificationPayload[];
  unreadCount?: number;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onNotificationClick?: (notification: NotificationPayload) => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogout?: () => void;
  className?: string;
}

const sectionLabels: Record<NavSection, string> = {
  dashboard: "Dashboard",
  products: "Products",
  categories: "Categories",
  orders: "Orders",
  customers: "Customers",
  conversations: "Conversations",
  "ai-sales": "AI Sales Employee",
  whatsapp: "WhatsApp",
  delivery: "Delivery",
  payments: "Payments",
  promotions: "Promotions",
  analytics: "Analytics",
  staff: "Staff",
  settings: "Settings",
  faq: "FAQs",
  notifications: "Notifications",
};

export function Header({
  currentSection = "dashboard",
  breadcrumbs,
  userName,
  userEmail,
  userImage,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
  onProfileClick,
  onSettingsClick,
  onLogout,
  className,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const displayBreadcrumbs = breadcrumbs || [
    { label: sectionLabels[currentSection] || currentSection },
  ];

  return (
    <>
      <header
        className={cn(
          "flex h-14 shrink-0 items-center gap-2 border-b px-4",
          className
        )}
      >
        <div className="flex flex-1 items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {displayBreadcrumbs.map((crumb, index) => {
                const isLast = index === displayBreadcrumbs.length - 1;
                return (
                  <React.Fragment key={index}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href || "#"}>
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center gap-1">
          {/* Search trigger */}
          <Button
            variant="outline"
            size="sm"
            className="hidden h-8 w-64 justify-start gap-2 text-muted-foreground sm:flex"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="size-3.5" />
            <span className="text-xs">Search...</span>
            <kbd className="pointer-events-none ml-auto hidden select-none items-center gap-0.5 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground lg:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 sm:hidden"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="size-4" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Notification bell */}
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onNotificationClick={onNotificationClick}
          />

          {/* Dark mode toggle - only render icon after mount to avoid mismatch */}
          {mounted ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="size-8" aria-hidden>
              <div className="size-4" />
            </Button>
          )}

          {/* User menu */}
          <UserMenu
            name={userName}
            email={userEmail}
            image={userImage}
            onProfileClick={onProfileClick}
            onSettingsClick={onSettingsClick}
            onLogout={onLogout}
          />
        </div>
      </header>

      {/* Command palette (Cmd+K search) */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search products, orders, customers..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <Search className="mr-2 size-4" />
              <span>Search products</span>
            </CommandItem>
            <CommandItem>
              <Search className="mr-2 size-4" />
              <span>Search orders</span>
            </CommandItem>
            <CommandItem>
              <Search className="mr-2 size-4" />
              <span>Search customers</span>
            </CommandItem>
            <CommandItem>
              <Search className="mr-2 size-4" />
              <span>Search conversations</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
