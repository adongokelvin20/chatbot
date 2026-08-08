// ============================================================================
// AI Sales Employee SaaS - Application Constants
// ============================================================================

import type {
  OrderStatus,
  PaymentStatus,
  ConversationStatus,
  StaffRole,
  NavItem,
  AIpersonality,
  AITone,
  ContentType,
  MessageSender,
} from "@/types";

// ============================================================================
// STATUS COLORS & LABELS
// ============================================================================

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string; textColor: string; description: string }
> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-500",
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-700 dark:text-yellow-400",
    description: "Order placed, awaiting confirmation",
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-500",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-700 dark:text-blue-400",
    description: "Order confirmed by business",
  },
  processing: {
    label: "Processing",
    color: "bg-indigo-500",
    bgColor: "bg-indigo-500/10",
    textColor: "text-indigo-700 dark:text-indigo-400",
    description: "Order is being prepared",
  },
  shipped: {
    label: "Shipped",
    color: "bg-purple-500",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-700 dark:text-purple-400",
    description: "Order has been shipped",
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-500",
    bgColor: "bg-green-500/10",
    textColor: "text-green-700 dark:text-green-400",
    description: "Order delivered successfully",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-500",
    bgColor: "bg-red-500/10",
    textColor: "text-red-700 dark:text-red-400",
    description: "Order was cancelled",
  },
};

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; color: string; bgColor: string; textColor: string }
> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-500",
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-700 dark:text-yellow-400",
  },
  paid: {
    label: "Paid",
    color: "bg-green-500",
    bgColor: "bg-green-500/10",
    textColor: "text-green-700 dark:text-green-400",
  },
  failed: {
    label: "Failed",
    color: "bg-red-500",
    bgColor: "bg-red-500/10",
    textColor: "text-red-700 dark:text-red-400",
  },
};

export const CONVERSATION_STATUS_CONFIG: Record<
  ConversationStatus,
  { label: string; color: string; bgColor: string; textColor: string }
> = {
  active: {
    label: "Active",
    color: "bg-green-500",
    bgColor: "bg-green-500/10",
    textColor: "text-green-700 dark:text-green-400",
  },
  resolved: {
    label: "Resolved",
    color: "bg-blue-500",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-700 dark:text-blue-400",
  },
  archived: {
    label: "Archived",
    color: "bg-gray-500",
    bgColor: "bg-gray-500/10",
    textColor: "text-gray-700 dark:text-gray-400",
  },
};

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  owner: "Owner",
  admin: "Admin",
  staff: "Staff",
};

// ============================================================================
// MESSAGE SENDER CONFIG
// ============================================================================

export const MESSAGE_SENDER_CONFIG: Record<
  MessageSender,
  { label: string; bgColor: string; alignment: string; avatar: string }
> = {
  customer: {
    label: "Customer",
    bgColor: "bg-muted",
    alignment: "justify-start",
    avatar: "user",
  },
  ai: {
    label: "AI Assistant",
    bgColor: "bg-primary/5 border border-primary/20",
    alignment: "justify-end",
    avatar: "bot",
  },
  staff: {
    label: "Staff",
    bgColor: "bg-blue-500/10 border border-blue-500/20",
    alignment: "justify-end",
    avatar: "headset",
  },
  system: {
    label: "System",
    bgColor: "bg-muted/50",
    alignment: "justify-center",
    avatar: "info",
  },
};

// ============================================================================
// DEFAULT AI SETTINGS
// ============================================================================

export const DEFAULT_AI_SETTINGS = {
  personality: "friendly" as AIpersonality,
  tone: "helpful" as AITone,
  greetingMessage:
    "Hello! 👋 Welcome! I'm your AI sales assistant. What can I help you find today?",
  workingHoursReply:
    "Sorry, we're currently closed. Please leave a message and we'll get back to you first thing in the morning. Thank you!",
  autoReply: true,
  language: "en",
  model: "gpt-4o-mini",
};

// Ghana-specific default payment methods for seed data
export const GHANA_PAYMENT_METHODS = [
  { name: "MTN Mobile Money", type: "mobile_money", isActive: true },
  { name: "Vodafone Cash", type: "mobile_money", isActive: true },
  { name: "ATM/AirtelTigo Money", type: "mobile_money", isActive: true },
  { name: "Bank Transfer", type: "bank_transfer", isActive: true },
  { name: "Cash on Delivery", type: "cash", isActive: true },
];

// Ghana delivery zones
export const GHANA_DELIVERY_ZONES = [
  { city: "Accra", fee: 15, estimatedDays: "1-2", isActive: true },
  { city: "Tema", fee: 15, estimatedDays: "1-2", isActive: true },
  { city: "Kumasi", fee: 25, estimatedDays: "2-3", isActive: true },
  { city: "Takoradi", fee: 30, estimatedDays: "2-3", isActive: true },
  { city: "Tamale", fee: 40, estimatedDays: "3-5", isActive: true },
  { city: "Cape Coast", fee: 30, estimatedDays: "2-3", isActive: true },
  { city: "Sunyani", fee: 35, estimatedDays: "3-4", isActive: true },
  { city: "Koforidua", fee: 25, estimatedDays: "2-3", isActive: true },
  { city: "Ho", fee: 30, estimatedDays: "2-3", isActive: true },
  { city: "Wa", fee: 50, estimatedDays: "4-5", isActive: true },
  { city: "Bolgatanga", fee: 50, estimatedDays: "4-5", isActive: true },
];

export const AI_PERSONALITY_OPTIONS: { value: AIpersonality; label: string; description: string }[] = [
  { value: "professional", label: "Professional", description: "Formal and business-like tone" },
  { value: "friendly", label: "Friendly", description: "Warm and approachable tone" },
  { value: "casual", label: "Casual", description: "Relaxed and informal tone" },
];

export const AI_TONE_OPTIONS: { value: AITone; label: string; description: string }[] = [
  { value: "helpful", label: "Helpful", description: "Focus on being useful and clear" },
  { value: "enthusiastic", label: "Enthusiastic", description: "Energetic and positive" },
  { value: "calm", label: "Calm", description: "Relaxed and patient" },
];

export const AI_MODEL_OPTIONS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini", description: "Fast and cost-effective" },
  { value: "gpt-4o", label: "GPT-4o", description: "High quality, more expensive" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo", description: "Legacy high-quality model" },
];

// ============================================================================
// SIDEBAR NAVIGATION
// ============================================================================

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    label: "Conversations",
    href: "/conversations",
    icon: "MessageSquare",
    badge: 0, // dynamically updated
  },
  {
    label: "Orders",
    href: "/orders",
    icon: "ShoppingCart",
  },
  {
    label: "Products",
    href: "/products",
    icon: "Package",
  },
  {
    label: "Customers",
    href: "/customers",
    icon: "Users",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: "BarChart3",
  },
  {
    label: "Promotions",
    href: "/promotions",
    icon: "Tag",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "Settings",
    children: [
      {
        label: "Business Profile",
        href: "/settings/business",
        icon: "Building2",
      },
      {
        label: "AI Settings",
        href: "/settings/ai",
        icon: "Bot",
      },
      {
        label: "Delivery Zones",
        href: "/settings/delivery",
        icon: "Truck",
      },
      {
        label: "Payment Methods",
        href: "/settings/payments",
        icon: "CreditCard",
      },
      {
        label: "FAQs",
        href: "/settings/faqs",
        icon: "HelpCircle",
      },
      {
        label: "Staff",
        href: "/settings/staff",
        icon: "UserCog",
      },
      {
        label: "Chat Widget",
        href: "/settings/widget",
        icon: "MessageCircle",
      },
    ],
  },
];

// ============================================================================
// PAGINATION & TABLE DEFAULTS
// ============================================================================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ============================================================================
// DATE / TIME
// ============================================================================

export const DATE_FORMAT = "MMM d, yyyy";
export const TIME_FORMAT = "h:mm a";
export const DATETIME_FORMAT = "MMM d, yyyy h:mm a";
export const DATE_RANGE_PRESETS = [
  { label: "Today", days: 0 },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "This year", days: 365 },
] as const;

// ============================================================================
// APP METADATA
// ============================================================================

export const APP_NAME = "AI Sales Employee";
export const APP_DESCRIPTION = "AI-powered sales assistant for your business";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ============================================================================
// ROUTE CONSTANTS
// ============================================================================

export const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password"] as const;
export const PROTECTED_ROUTES_PREFIX = ["/dashboard", "/conversations", "/orders", "/products", "/customers", "/analytics", "/promotions", "/settings"] as const;
export const API_ROUTES_PREFIX = "/api";

// ============================================================================
// CHAT WIDGET DEFAULTS
// ============================================================================

export const CHAT_WIDGET_DEFAULTS = {
  primaryColor: "#6366f1",
  position: "bottom-right" as const,
  greeting: "Hi! How can I help you today?",
  placeholder: "Type your message...",
  poweredBy: true,
  maxHeight: "600px",
  maxWidth: "400px",
  autoOpen: false,
  openDelay: 3000,
};

// ============================================================================
// NOTIFICATION CONSTANTS
// ============================================================================

export const NOTIFICATION_ICONS: Record<string, string> = {
  new_order: "ShoppingCart",
  bulk_order: "Package",
  refund_request: "RotateCcw",
  low_stock: "AlertTriangle",
  human_takeover: "UserCheck",
};

export const NOTIFICATION_COLORS: Record<string, string> = {
  new_order: "text-blue-500",
  bulk_order: "text-purple-500",
  refund_request: "text-orange-500",
  low_stock: "text-red-500",
  human_takeover: "text-yellow-500",
};

// ============================================================================
// MISCELLANEOUS
// ============================================================================

export const CURRENCY = {
  code: "GHS",
  symbol: "GH₵",
  name: "Ghana Cedi",
};

export const COUNTRY = {
  code: "GH",
  name: "Ghana",
  phonePrefix: "+233",
  timezone: "Africa/Accra",
};

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "tw", label: "Twi" },
  { code: "ga", label: "Ga" },
  { code: "ha", label: "Hausa" },
  { code: "fr", label: "Français" },
] as const;

export const CONTENT_TYPE_MAX_LENGTH: Record<ContentType, number> = {
  text: 10_000,
  image: 50_000, // base64 data URLs
  product_card: 10_000,
  order_card: 10_000,
};

export const BULK_ORDER_THRESHOLD = 5; // orders or more in a short period
export const LOW_STOCK_THRESHOLD = 5; // units remaining
export const AI_TYPING_DELAY_MS = 800;
export const MAX_MESSAGE_LENGTH = 10_000;
