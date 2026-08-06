"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Tags,
  ShoppingCart,
  Users,
  MessageSquare,
  Bot,
  Truck,
  CreditCard,
  Percent,
  BarChart3,
  UserCog,
  Settings,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarInset,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Header, type NavSection } from "./Header";
import { cn } from "@/lib/utils";
import type { NotificationPayload } from "@/types";

// ---------------------------------------------------------------------------
// Navigation items
// ---------------------------------------------------------------------------

interface NavItemDef {
  section: NavSection;
  label: string;
  icon: React.ElementType;
  badge?: number;
  children?: { section: NavSection; label: string }[];
}

const mainNavItems: NavItemDef[] = [
  { section: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { section: "products", label: "Products", icon: ShoppingBag },
  { section: "categories", label: "Categories", icon: Tags },
  { section: "orders", label: "Orders", icon: ShoppingCart },
  { section: "customers", label: "Customers", icon: Users },
  { section: "conversations", label: "Conversations", icon: MessageSquare },
  { section: "ai-sales", label: "AI Sales Employee", icon: Bot, badge: 0 },
  { section: "delivery", label: "Delivery", icon: Truck },
  { section: "payments", label: "Payments", icon: CreditCard },
  { section: "promotions", label: "Promotions", icon: Percent },
  { section: "analytics", label: "Analytics", icon: BarChart3 },
  { section: "staff", label: "Staff", icon: UserCog },
];

const settingsNavItems: NavItemDef[] = [
  {
    section: "settings",
    label: "Settings",
    icon: Settings,
    children: [
      { section: "settings", label: "Business Profile" },
      { section: "settings", label: "AI Configuration" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardLayoutProps {
  children: React.ReactNode;
  businessName?: string;
  businessLogo?: string;
  userName?: string;
  userEmail?: string;
  userImage?: string | null;
  activeSection?: NavSection;
  onSectionChange?: (section: NavSection) => void;
  notifications?: NotificationPayload[];
  unreadCount?: number;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onNotificationClick?: (notification: NotificationPayload) => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onLogout?: () => void;
  conversationBadgeCount?: number;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DashboardLayout({
  children,
  businessName = "My Business",
  businessLogo,
  userName,
  userEmail,
  userImage,
  activeSection = "dashboard",
  onSectionChange,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
  onProfileClick,
  onSettingsClick,
  onLogout,
  conversationBadgeCount,
  className,
}: DashboardLayoutProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleNavClick = useCallback(
    (section: NavSection) => {
      onSectionChange?.(section);
    },
    [onSectionChange]
  );

  const navItems = useMemo(() => {
    return mainNavItems.map((item) => {
      if (item.section === "conversations" && conversationBadgeCount !== undefined) {
        return { ...item, badge: conversationBadgeCount };
      }
      return item;
    });
  }, [conversationBadgeCount]);

  const currentYear = new Date().getFullYear();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        {/* Sidebar header – Logo + Business name */}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip={businessName}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  {businessLogo ? (
                    <img
                      src={businessLogo}
                      alt={businessName}
                      className="size-5 rounded object-contain"
                    />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{businessName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    AI Sales Platform
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarSeparator />

        {/* Main navigation */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.section}>
                    <SidebarMenuButton
                      isActive={activeSection === item.section}
                      tooltip={item.label}
                      onClick={() => handleNavClick(item.section)}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute right-2 top-1.5 flex size-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground group-data-[collapsible=icon]:hidden">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* Settings group with sub-items */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsNavItems.map((item) => (
                  <Collapsible
                    key={item.section}
                    open={settingsOpen}
                    onOpenChange={setSettingsOpen}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          isActive={activeSection === "settings"}
                          tooltip={item.label}
                          onClick={() => handleNavClick("settings")}
                        >
                          <item.icon />
                          <span>{item.label}</span>
                          <ChevronRight
                            className={cn(
                              "ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden",
                              settingsOpen && "rotate-90"
                            )}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      {item.children && item.children.length > 0 && (
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.children.map((child, idx) => (
                              <SidebarMenuSubItem key={idx}>
                                <SidebarMenuSubButton
                                  isActive={activeSection === "settings"}
                                  onClick={() => handleNavClick("settings")}
                                >
                                  {child.label}
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )}
                    </SidebarMenuItem>
                  </Collapsible>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Sidebar footer */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg">
                <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                  <span className="text-xs font-medium">
                    {userName
                      ? userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "A"}
                  </span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userName || "Admin"}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {userEmail || "admin@business.com"}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* Main content area */}
      <SidebarInset>
        <Header
          currentSection={activeSection}
          userName={userName}
          userEmail={userEmail}
          userImage={userImage}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
          onNotificationClick={onNotificationClick}
          onProfileClick={onProfileClick}
          onSettingsClick={onSettingsClick}
          onLogout={onLogout}
        />
        <div className={cn("flex flex-1 flex-col", className)}>
          <div className="flex-1 p-4 md:p-6">{children}</div>
          <footer className="border-t px-4 py-3 md:px-6">
            <p className="text-center text-xs text-muted-foreground">
              &copy; {currentYear} {businessName}. Powered by{" "}
              <span className="font-medium text-foreground">AI Sales Employee</span>.
              All rights reserved.
            </p>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
