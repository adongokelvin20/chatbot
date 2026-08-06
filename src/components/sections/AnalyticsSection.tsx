"use client";

import React, { useState, useMemo } from "react";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Bot,
  Calendar,
  HelpCircle,
  BarChart3,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StatsCard } from "@/components/common/StatsCard";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Period = "today" | "7days" | "30days" | "custom";

interface TopProduct {
  id: string;
  name: string;
  sold: number;
  revenue: number;
}

interface AskedQuestion {
  id: string;
  question: string;
  count: number;
}

// ---------------------------------------------------------------------------
// Demo Data
// ---------------------------------------------------------------------------

const REVENUE_DATA = [
  { date: "Jan 9", revenue: 185000, orders: 12 },
  { date: "Jan 10", revenue: 210000, orders: 15 },
  { date: "Jan 11", revenue: 165000, orders: 10 },
  { date: "Jan 12", revenue: 290000, orders: 22 },
  { date: "Jan 13", revenue: 245000, orders: 18 },
  { date: "Jan 14", revenue: 320000, orders: 25 },
  { date: "Jan 15", revenue: 285000, orders: 20 },
];

const DEMO_TOP_PRODUCTS: TopProduct[] = [
  { id: "p1", name: "Kitenge Heritage Matching Set", sold: 48, revenue: 2160000 },
  { id: "p2", name: "Ankara Maxi Dress - Indigo", sold: 35, revenue: 1225000 },
  { id: "p3", name: "Traditional Mushanana - Royal Gold", sold: 28, revenue: 2520000 },
  { id: "p4", name: "Men's Linen Shirt - White", sold: 25, revenue: 625000 },
  { id: "p5", name: "Kids Kitenge Dress - Pink Floral", sold: 22, revenue: 440000 },
  { id: "p6", name: "Beaded Necklace Set - Multi", sold: 20, revenue: 300000 },
  { id: "p7", name: "Women's Kitenge Blazer", sold: 18, revenue: 720000 },
  { id: "p8", name: "Mud Cloth Wrap - Natural", sold: 15, revenue: 375000 },
  { id: "p9", name: "Men's Kente Pocket Square Set", sold: 14, revenue: 196000 },
  { id: "p10", name: "Bridal Kitenge Collection", sold: 12, revenue: 1800000 },
];

const DEMO_QUESTIONS: AskedQuestion[] = [
  { id: "q1", question: "What are your delivery fees?", count: 87 },
  { id: "q2", question: "Do you have this in size L?", count: 65 },
  { id: "q3", question: "Can I pay with MTN MoMo?", count: 54 },
  { id: "q4", question: "How long until I receive my order?", count: 48 },
  { id: "q5", question: "Do you do custom orders for weddings?", count: 42 },
];

const PERIOD_DATA: Record<Period, { revenue: string; orders: number; aov: string; aiRate: string; revenueChange: number; ordersChange: number; aovChange: number; aiChange: number; aiResolution: number; humanTakeover: number }> = {
  today: {
    revenue: "RWF 285,000",
    orders: 20,
    aov: "RWF 14,250",
    aiRate: "87.3%",
    revenueChange: 12.4,
    ordersChange: 8.2,
    aovChange: 3.1,
    aiChange: 2.1,
    aiResolution: 87.3,
    humanTakeover: 12.7,
  },
  "7days": {
    revenue: "RWF 1,850,000",
    orders: 142,
    aov: "RWF 13,028",
    aiRate: "84.6%",
    revenueChange: 18.7,
    ordersChange: 14.3,
    aovChange: 2.8,
    aiChange: 5.4,
    aiResolution: 84.6,
    humanTakeover: 15.4,
  },
  "30days": {
    revenue: "RWF 7,420,000",
    orders: 578,
    aov: "RWF 12,837",
    aiRate: "82.1%",
    revenueChange: 22.3,
    ordersChange: 19.6,
    aovChange: -1.2,
    aiChange: 8.7,
    aiResolution: 82.1,
    humanTakeover: 17.9,
  },
  custom: {
    revenue: "RWF 7,420,000",
    orders: 578,
    aov: "RWF 12,837",
    aiRate: "82.1%",
    revenueChange: 22.3,
    ordersChange: 19.6,
    aovChange: -1.2,
    aiChange: 8.7,
    aiResolution: 82.1,
    humanTakeover: 17.9,
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRWF(value: number): string {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0,
  }).format(value);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AnalyticsSection() {
  const [period, setPeriod] = useState<Period>("7days");
  const data = PERIOD_DATA[period];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Track your store performance and AI metrics</p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-[160px]">
            <Calendar className="mr-2 size-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={data.revenue}
          change={data.revenueChange}
          changeType={data.revenueChange >= 0 ? "increase" : "decrease"}
          icon={DollarSign}
          description="vs previous period"
        />
        <StatsCard
          title="Total Orders"
          value={data.orders}
          change={data.ordersChange}
          changeType={data.ordersChange >= 0 ? "increase" : "decrease"}
          icon={ShoppingCart}
          description="vs previous period"
        />
        <StatsCard
          title="Avg Order Value"
          value={data.aov}
          change={data.aovChange}
          changeType={data.aovChange >= 0 ? "increase" : "decrease"}
          icon={TrendingUp}
          description="vs previous period"
        />
        <StatsCard
          title="AI Resolution Rate"
          value={data.aiRate}
          change={data.aiChange}
          changeType={data.aiChange >= 0 ? "increase" : "decrease"}
          icon={Bot}
          description="vs previous period"
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="size-4" /> Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REVENUE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [formatRWF(value), "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="size-4" /> AI Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">AI Resolution Rate</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {data.aiResolution}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${data.aiResolution}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Human Takeover Rate</span>
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    {data.humanTakeover}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange-500 transition-all"
                    style={{ width: `${data.humanTakeover}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold">247</p>
                <p className="text-xs text-muted-foreground mt-1">AI Conversations</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold">38</p>
                <p className="text-xs text-muted-foreground mt-1">Human Takeovers</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-xs text-muted-foreground mt-1">Avg Response Time (s)</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold">96%</p>
                <p className="text-xs text-muted-foreground mt-1">Customer Satisfaction</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="size-4" /> Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_TOP_PRODUCTS.map((product, idx) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <span className="flex size-6 items-center justify-center rounded text-xs font-bold bg-muted text-muted-foreground">
                        {idx + 1}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-sm max-w-[200px] truncate">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-right text-sm">{product.sold}</TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {formatRWF(product.revenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Most Asked Questions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <HelpCircle className="size-4" /> Most Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {DEMO_QUESTIONS.map((q, idx) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between gap-4 py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded text-xs font-bold bg-muted text-muted-foreground">
                      {idx + 1}
                    </span>
                    <p className="text-sm truncate">{q.question}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {q.count} times
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
