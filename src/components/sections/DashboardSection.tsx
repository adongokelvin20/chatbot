"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MessageSquare,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatsCard } from "@/components/common/StatsCard";
import { StatusBadge } from "@/components/common/StatusBadge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TopProduct {
  id: string;
  name: string;
  sold: number;
  revenue: number;
  image?: string | null;
  category?: string;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  items: number;
  createdAt: string;
}

interface OutOfStockAlert {
  id: string;
  name: string;
  sku: string;
  category: string;
  lastStocked: string;
}

interface DashboardData {
  stats: {
    messages: number;
    messagesChange: number;
    orders: number;
    ordersChange: number;
    revenue: number;
    revenueChange: number;
    conversionRate: number;
    conversionChange: number;
  };
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
  outOfStock: OutOfStockAlert[];
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_DATA: DashboardData = {
  stats: {
    messages: 247,
    messagesChange: 12.5,
    orders: 34,
    ordersChange: 8.2,
    revenue: 4285.5,
    revenueChange: 15.3,
    conversionRate: 13.8,
    conversionChange: -2.1,
  },
  topProducts: [
    {
      id: "p1",
      name: "Classic Cotton Crew Neck T-Shirt",
      sold: 89,
      revenue: 3560.0,
      category: "Men",
    },
    {
      id: "p2",
      name: "High-Waisted Skinny Jeans",
      sold: 67,
      revenue: 8040.0,
      category: "Women",
    },
    {
      id: "p3",
      name: "Oversized Hoodie - Charcoal",
      sold: 54,
      revenue: 6480.0,
      category: "Men",
    },
    {
      id: "p4",
      name: "Floral Midi Summer Dress",
      sold: 48,
      revenue: 5760.0,
      category: "Women",
    },
    {
      id: "p5",
      name: "Kids Denim Jacket - Indigo",
      sold: 41,
      revenue: 3280.0,
      category: "Kids",
    },
  ],
  recentOrders: [
    {
      id: "o1",
      orderNumber: "ORD-20241201-001",
      customerName: "Sarah Johnson",
      total: 159.98,
      status: "delivered",
      paymentStatus: "paid",
      items: 3,
      createdAt: "2024-12-01T14:23:00Z",
    },
    {
      id: "o2",
      orderNumber: "ORD-20241201-002",
      customerName: "Michael Chen",
      total: 89.99,
      status: "shipped",
      paymentStatus: "paid",
      items: 1,
      createdAt: "2024-12-01T12:45:00Z",
    },
    {
      id: "o3",
      orderNumber: "ORD-20241201-003",
      customerName: "Emily Davis",
      total: 234.5,
      status: "processing",
      paymentStatus: "paid",
      items: 4,
      createdAt: "2024-12-01T11:30:00Z",
    },
    {
      id: "o4",
      orderNumber: "ORD-20241201-004",
      customerName: "James Wilson",
      total: 67.0,
      status: "pending",
      paymentStatus: "pending",
      items: 2,
      createdAt: "2024-12-01T10:15:00Z",
    },
    {
      id: "o5",
      orderNumber: "ORD-20241201-005",
      customerName: "Lisa Park",
      total: 312.0,
      status: "confirmed",
      paymentStatus: "paid",
      items: 5,
      createdAt: "2024-12-01T09:00:00Z",
    },
  ],
  outOfStock: [
    {
      id: "os1",
      name: "Linen Blend Blazer - Navy",
      sku: "M-BLZ-NAV-42",
      category: "Men",
      lastStocked: "2024-11-15",
    },
    {
      id: "os2",
      name: "Silk Camisole Top - Ivory",
      sku: "W-CAM-IVY-S",
      category: "Women",
      lastStocked: "2024-11-20",
    },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// ---------------------------------------------------------------------------
// Skeleton loaders
// ---------------------------------------------------------------------------

function StatsCardSkeleton() {
  return (
    <Card className="py-4">
      <CardContent className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="size-10 rounded-lg" />
      </CardContent>
    </Card>
  );
}

function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: cols }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <TableRow key={rowIdx}>
                {Array.from({ length: cols }).map((_, colIdx) => (
                  <TableCell key={colIdx}>
                    <Skeleton className="h-5 w-full max-w-[120px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function DashboardSection() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard", "DEMO"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/analytics/dashboard?businessId=DEMO");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) return json.data as DashboardData;
        }
      } catch {
        // fallback to demo data
      }
      // Simulate network delay for demo
      await new Promise((r) => setTimeout(r, 800));
      return DEMO_DATA;
    },
    staleTime: 30_000,
    placeholderData: DEMO_DATA,
  });

  const stats = data?.stats ?? DEMO_DATA.stats;
  const topProducts = data?.topProducts ?? DEMO_DATA.topProducts;
  const recentOrders = data?.recentOrders ?? DEMO_DATA.recentOrders;
  const outOfStock = data?.outOfStock ?? DEMO_DATA.outOfStock;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              title="Today's Messages"
              value={stats.messages}
              change={stats.messagesChange}
              changeType={stats.messagesChange >= 0 ? "increase" : "decrease"}
              icon={MessageSquare}
              description="vs yesterday"
            />
            <StatsCard
              title="Today's Orders"
              value={stats.orders}
              change={stats.ordersChange}
              changeType={stats.ordersChange >= 0 ? "increase" : "decrease"}
              icon={ShoppingCart}
              description="vs yesterday"
            />
            <StatsCard
              title="Revenue (Today)"
              value={formatCurrency(stats.revenue)}
              change={stats.revenueChange}
              changeType={stats.revenueChange >= 0 ? "increase" : "decrease"}
              icon={DollarSign}
              description="vs yesterday"
            />
            <StatsCard
              title="Conversion Rate"
              value={`${stats.conversionRate}%`}
              change={Math.abs(stats.conversionChange)}
              changeType={stats.conversionChange >= 0 ? "increase" : "decrease"}
              icon={TrendingUp}
              description="vs last week"
            />
          </>
        )}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Selling Products */}
        {isLoading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="size-4" />
                Top Selling Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Product</TableHead>
                    <TableHead className="text-right">Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product, idx) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="flex size-7 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                            {idx + 1}
                          </span>
                          <span className="font-medium truncate max-w-[180px]">
                            {product.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {product.sold}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(product.revenue)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.category}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Recent Orders */}
        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingCart className="size-4" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <span className="font-medium text-sm">
                            {order.orderNumber}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {order.items} item{order.items > 1 ? "s" : ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.customerName}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} type="order" />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatTimeAgo(order.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Out of Stock Alerts */}
      {!isLoading && outOfStock.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <AlertTriangle className="size-4" />
              Out of Stock Alerts
              <Badge variant="destructive" className="ml-1">
                {outOfStock.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Last Stocked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outOfStock.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {item.sku}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {item.lastStocked}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
