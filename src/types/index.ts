// ============================================================================
// AI Sales Employee SaaS - Type Definitions
// ============================================================================

import type { Prisma } from "@prisma/client";

// ============================================================================
// ENUM-LIKE UNION TYPES (mirrors Prisma schema string fields)
// ============================================================================

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed";

export type MessageSender = "customer" | "ai" | "staff" | "system";

export type ContentType = "text" | "image" | "product_card" | "order_card";

export type ConversationStatus = "active" | "resolved" | "archived";

export type Channel = "web" | "whatsapp";

export type StaffRole = "owner" | "staff" | "admin";

export type StaffStatus = "active" | "inactive";

export type PromotionType =
  | "discount"
  | "flash_sale"
  | "coupon"
  | "limited_offer";

export type DiscountType = "percentage" | "fixed";

export type PaymentMethodType =
  | "momo"
  | "bank_transfer"
  | "cash_on_delivery"
  | "card";

export type AIpersonality = "professional" | "friendly" | "casual";

export type AITone = "helpful" | "enthusiastic" | "calm";

export type AnalyticsMetricType =
  | "messages"
  | "orders"
  | "revenue"
  | "conversion"
  | "ai_resolution"
  | "human_takeover";

export type NotificationType =
  | "new_order"
  | "bulk_order"
  | "refund_request"
  | "low_stock"
  | "human_takeover";

export type OrderSource = "ai" | "manual" | "whatsapp";

export type FAQCategory = "delivery" | "payment" | "returns" | "general";

// ============================================================================
// SESSION & AUTH TYPES
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  businessId: string;
  businessName: string;
  image?: string | null;
}

export interface AuthSession {
  user: AuthUser;
  expires: string;
  accessToken: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

// ============================================================================
// DASHBOARD STATS TYPES
// ============================================================================

export interface DashboardStats {
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    changePercent: number;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
    changePercent: number;
  };
  conversations: {
    active: number;
    resolved: number;
    awaitingHuman: number;
    aiResolutionRate: number;
  };
  products: {
    total: number;
    active: number;
    lowStock: number;
    outOfStock: number;
  };
}

export interface RevenueChartPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface OrdersChartPoint {
  date: string;
  count: number;
  value: number;
}

export interface ConversationChartPoint {
  date: string;
  aiHandled: number;
  humanHandled: number;
}

export interface TopProductStat {
  productId: string;
  name: string;
  sold: number;
  revenue: number;
  image?: string | null;
}

// ============================================================================
// SEARCH RESULT TYPES
// ============================================================================

export type SearchResultType =
  | "customer"
  | "order"
  | "product"
  | "conversation";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  url: string;
  metadata?: Record<string, string>;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}

// ============================================================================
// ENTITY EXTENDED TYPES (runtime view models that include joins)
// ============================================================================

export type BusinessWithRelations = Prisma.BusinessGetPayload<{
  include: {
    staff: true;
    aiSettings: true;
    _count: {
      select: {
        customers: true;
        products: true;
        orders: true;
        conversations: true;
      };
    };
  };
}>;

export type ProductWithCategory = Prisma.ProductGetPayload<{
  include: { category: true };
}>;

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: { include: { product: true } };
    customer: true;
  };
}>;

export type ConversationWithMessages = Prisma.ConversationGetPayload<{
  include: {
    messages: {
      orderBy: { createdAt: "asc" };
    };
    customer: true;
  };
}>;

export type ConversationWithLatestMessage = Prisma.ConversationGetPayload<{
  include: {
    messages: {
      orderBy: { createdAt: "desc" };
      take: 1;
    };
    customer: true;
  };
}>;

export type CustomerWithOrders = Prisma.CustomerGetPayload<{
  include: {
    orders: { orderBy: { createdAt: "desc" }, take: 10 };
    customerMemory: true;
  };
}>;

// ============================================================================
// INPUT / DTO TYPES (for creating/updating resources)
// ============================================================================

export interface CreateProductInput {
  name: string;
  description?: string;
  categoryId?: string;
  sku?: string;
  price: number;
  salePrice?: number;
  stock: number;
  colors?: string[];
  sizes?: string[];
  images?: string[];
  active?: boolean;
  featured?: boolean;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface CreateCustomerInput {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export type UpdateCustomerInput = Partial<CreateCustomerInput>;

export interface CreateOrderInput {
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: Omit<CreateOrderItemInput, "orderId">[];
  paymentMethod?: string;
  deliveryAddress?: DeliveryAddress;
  notes?: string;
  source?: OrderSource;
  discount?: number;
  promotionCode?: string;
}

export interface CreateOrderItemInput {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
  orderId?: string;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  notes?: string;
}

export interface DeliveryAddress {
  street?: string;
  city?: string;
  zip?: string;
  notes?: string;
}

export interface CreateBusinessInput {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  timezone?: string;
}

export interface AISettingsInput {
  personality?: AIpersonality;
  tone?: AITone;
  greetingMessage?: string;
  workingHoursReply?: string;
  autoReply?: boolean;
  language?: string;
  apiKey?: string;
  model?: string;
}

export interface CreatePromotionInput {
  name: string;
  type: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  minOrder?: number;
  maxDiscount?: number;
  code?: string;
  validFrom?: Date;
  validUntil?: Date;
  autoApply?: boolean;
  description?: string;
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
  contentType?: ContentType;
  metadata?: Record<string, unknown>;
}

export interface AIChatRequest {
  conversationId: string;
  businessId: string;
  customerMessage: string;
  customerPhone?: string;
  customerName?: string;
  customerId?: string;
}

// ============================================================================
// CHAT WIDGET / CLIENT TYPES
// ============================================================================

export interface ChatWidgetConfig {
  businessId: string;
  primaryColor: string;
  position: "bottom-right" | "bottom-left";
  greeting: string;
  placeholder: string;
  poweredBy: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  contentType: ContentType;
  senderType: MessageSender;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface TypingIndicator {
  isTyping: boolean;
  senderType: MessageSender;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

// ============================================================================
// TABLE / DATA GRID TYPES
// ============================================================================

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface FilterConfig {
  key: string;
  value: string | string[] | number | number[] | boolean | null;
  operator?: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "contains";
}

export interface TableState {
  page: number;
  pageSize: number;
  sort?: SortConfig;
  filters?: FilterConfig[];
  search?: string;
}

// ============================================================================
// NAVIGATION & UI TYPES
// ============================================================================

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// ============================================================================
// WORKING HOURS TYPES
// ============================================================================

export interface DayHours {
  open: string;
  close: string;
  closed?: boolean;
}

export type WeekDay =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

export type WorkingHours = Partial<Record<WeekDay, DayHours>>;
