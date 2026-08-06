"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Bot,
  BarChart3,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatsCard } from "@/components/common/StatsCard";
import { EmptyState } from "@/components/common/EmptyState";
import type { DashboardStats, TopProductStat } from "@/types";

// ---------- Types ----------

interface AnalyticsData {
  stats: DashboardStats;
  topProducts: TopProductStat[];
  charts?: Record<string, { date: string; value: number }[]>;
}

// ---------- Helpers ----------

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ---------- Component ----------

export default function AnalyticsSection() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("7d");

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/analytics/dashboard");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        throw new Error(json.error || "Failed to load analytics");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // ----- Skeleton Loading -----

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
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
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ----- Error State -----

  if (error) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={BarChart3}
          title="Failed to load analytics"
          description={error}
          action={
            <button
              onClick={fetchAnalytics}
              className="text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
            >
              Try again
            </button>
          }
        />
      </div>
    );
  }

  const stats = data?.stats;
  const topProducts = data?.topProducts || [];
  const charts = data?.charts || {};
  const revenueChartData = charts["revenue"] || [];
  const ordersChartData = charts["orders"] || [];

  // Compute avg order value
  const totalOrders = stats?.orders?.total ?? 0;
  const monthRevenue = stats?.revenue?.thisMonth ?? 0;
  const avgOrderValue = totalOrders > 0 ? monthRevenue / totalOrders : 0;

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Business performance overview
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ----- Stats Cards ----- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Revenue"
          value={formatCurrency(monthRevenue)}
          change={stats?.revenue?.changePercent}
          changeType={
            (stats?.revenue?.changePercent ?? 0) >= 0 ? "increase" : "decrease"
          }
          icon={DollarSign}
          description="This month"
        />
        <StatsCard
          title="Orders"
          value={totalOrders}
          change={stats?.orders?.changePercent}
          changeType={
            (stats?.orders?.changePercent ?? 0) >= 0 ? "increase" : "decrease"
          }
          icon={ShoppingCart}
          description={`${stats?.orders?.pending ?? 0} pending`}
        />
        <StatsCard
          title="Avg Order Value"
          value={formatCurrency(avgOrderValue)}
          icon={TrendingUp}
          description="Per order this month"
        />
        <StatsCard
          title="AI Resolution"
          value={
            stats?.conversations?.aiResolutionRate != null
              ? `${stats.conversations.aiResolutionRate.toFixed(0)}%`
              : "—"
          }
          icon={Bot}
          description="AI handled conversations"
        />
      </div>

      {/* ----- Top Products ----- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Top Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No sales data yet"
              description="Top products will appear here once orders come in."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Units Sold</TableHead>
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

      {/* ----- AI Performance ----- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            AI Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Active Conversations</p>
              <p className="text-2xl font-bold">
                {stats?.conversations?.active ?? 0}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Resolved by AI</p>
              <p className="text-2xl font-bold">
                {stats?.conversations?.resolved ?? 0}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Awaiting Human</p>
              <p className="text-2xl font-bold">
                {stats?.conversations?.awaitingHuman ?? 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ----- Revenue Chart Data (simple table) ----- */}
      {revenueChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Daily Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenueChartData.map((point) => (
                  <TableRow key={point.date}>
                    <TableCell>{point.date}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(point.value)}
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
