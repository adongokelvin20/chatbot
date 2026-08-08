"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Package,
  Rocket,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/common/StatsCard";
import { formatCurrency } from "@/lib/format";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { DashboardStats, TopProductStat } from "@/types";

// ---------- Types ----------

interface OrderRow {
  id: string;
  orderNumber?: string;
  customerName: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

interface ProductRow {
  id: string;
  name: string;
  stock: number;
  category?: { name: string } | null;
}

interface DashboardData {
  stats: DashboardStats;
  topProducts: TopProductStat[];
  charts?: Record<string, { date: string; value: number }[]>;
}

// ---------- Helpers ----------

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------- Component ----------

export default function DashboardSection() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderRow[]>([]);
  const [outOfStock, setOutOfStock] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);

  const runSetup = async () => {
    try {
      setSetupLoading(true);
      const res = await fetch('/api/setup', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        window.location.reload();
      } else {
        setError('Setup failed: ' + (json.error || 'Unknown error'));
      }
    } catch (err) {
      setError('Setup failed: ' + (err instanceof Error ? err.message : 'Network error'));
    } finally {
      setSetupLoading(false);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashRes, ordersRes, productsRes] = await Promise.all([
        fetch("/api/analytics/dashboard"),
        fetch("/api/orders?pageSize=5"),
        fetch("/api/products?active=true&pageSize=50"),
      ]);

      if (!dashRes.ok) throw new Error("Failed to fetch dashboard stats");
      const dashJson = await dashRes.json();
      if (dashJson.success) {
        setDashboard(dashJson.data);
      }

      if (ordersRes.ok) {
        const ordersJson = await ordersRes.json();
        const ordersData = ordersJson.data || (ordersJson.success ? [] : []);
        // Handle paginated or array response
        const ordersArr = Array.isArray(ordersData)
          ? ordersData
          : ordersData?.data || [];
        setRecentOrders(ordersArr);
      }

      if (productsRes.ok) {
        const prodJson = await productsRes.json();
        const prodData = prodJson.data || [];
        const prodArr = Array.isArray(prodData)
          ? prodData
          : prodData?.data || [];
        setOutOfStock(
          prodArr.filter((p: ProductRow) => p.stock === 0)
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ----- Skeleton Loading -----

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="py-4">
              <CardContent className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="size-10 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ----- Error / Setup Required State -----

  if (error) {
    const needsSetup = error.includes('No business found') || error.includes('seed') || error.includes('Failed to fetch');
    return (
      <div className="space-y-6">
        <EmptyState
          icon={needsSetup ? Rocket : AlertTriangle}
          title={needsSetup ? "Welcome! Let's set up your store" : "Something went wrong"}
          description={needsSetup
            ? "Your AI Sales Employee needs to be initialized. Click the button below to set up everything automatically — products, payments, delivery zones, and more."
            : error
          }
          action={
            <button
              onClick={needsSetup ? runSetup : fetchData}
              disabled={setupLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {setupLoading ? (
                <>
                  <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Setting up...
                </>
              ) : needsSetup ? (
                <>
                  <Rocket className="size-4" />
                  Set Up My Store
                </>
              ) : (
                'Try again'
              )}
            </button>
          }
        />
      </div>
    );
  }

  const stats = dashboard?.stats;
  const topProducts = dashboard?.topProducts || [];

  return (
    <div className="space-y-6">
      {/* ----- Stats Cards ----- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Messages"
          value={stats?.conversations?.active ?? 0}
          change={undefined}
          icon={MessageSquare}
          description="Active conversations"
        />
        <StatsCard
          title="Orders"
          value={stats?.orders?.total ?? 0}
          change={stats?.orders?.changePercent}
          changeType={
            (stats?.orders?.changePercent ?? 0) >= 0 ? "increase" : "decrease"
          }
          icon={ShoppingCart}
          description={`${stats?.orders?.pending ?? 0} pending`}
        />
        <StatsCard
          title="Revenue"
          value={formatCurrency(stats?.revenue?.thisMonth ?? 0)}
          change={stats?.revenue?.changePercent}
          changeType={
            (stats?.revenue?.changePercent ?? 0) >= 0 ? "increase" : "decrease"
          }
          icon={DollarSign}
          description="This month"
        />
        <StatsCard
          title="AI Resolution"
          value={
            stats?.conversations?.aiResolutionRate != null
              ? `${stats.conversations.aiResolutionRate.toFixed(0)}%`
              : "—"
          }
          icon={TrendingUp}
          description="AI handled conversations"
        />
      </div>

      {/* ----- Top Selling Products ----- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Top Selling Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No sales data yet"
              description="Top selling products will appear here once orders come in."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="size-8 rounded object-cover"
                          />
                        ) : (
                          <div className="flex size-8 items-center justify-center rounded bg-muted">
                            <Package className="size-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {product.sold}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(product.revenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ----- Recent Orders ----- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="No orders yet"
              description="Recent orders will appear here once customers start ordering."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderNumber || `#${order.id.slice(0, 8)}`}
                    </TableCell>
                    <TableCell>{order.customerName || "—"}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={order.status || "pending"}
                        type="order"
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={order.paymentStatus || "pending"}
                        type="payment"
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ----- Out of Stock Alerts ----- */}
      {outOfStock.length > 0 && (
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-red-600 dark:text-red-400">
              <AlertTriangle className="size-4" />
              Out of Stock ({outOfStock.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outOfStock.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.category?.name || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">Out of Stock</Badge>
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
