"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  ShoppingCart,
  Eye,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatCurrency } from "@/lib/format";
import type { OrderStatus, PaymentStatus } from "@/types";

// ---------- Types ----------

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  color?: string | null;
  size?: string | null;
  product?: { name: string; images?: string[] | null } | null;
}

interface Order {
  id: string;
  orderNumber?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentStatus: string;
  source?: string;
  deliveryAddress?: string;
  notes?: string | null;
  discount?: number;
  promotionCode?: string | null;
  createdAt: string;
  updatedAt: string;
}

const orderStatuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------- Component ----------

export default function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Detail dialog
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // ---------- Data Fetching ----------

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      params.set("pageSize", "50");

      const res = await fetch(`/api/orders?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const json = await res.json();
      const data = json.data;
      setOrders(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, startDate, endDate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ---------- Actions ----------

  async function handleUpdateStatus(orderId: string, newStatus: OrderStatus) {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      await fetchOrders();
      // Update selected order if it's the one being viewed
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setUpdatingStatus(false);
    }
  }

  // ---------- Render ----------

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="View and manage customer orders" />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {orderStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-[160px]"
          placeholder="Start date"
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-[160px]"
          placeholder="End date"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-[100px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Empty */}
      {!loading && orders.length === 0 && (
        <EmptyState
          icon={ShoppingCart}
          title="No orders found"
          description={
            search || statusFilter !== "all"
              ? "Try adjusting your filters."
              : "Orders will appear here once customers start purchasing."
          }
        />
      )}

      {/* Table */}
      {!loading && orders.length > 0 && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[60px]">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.orderNumber || `#${order.id.slice(0, 8)}`}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customerName || "—"}</p>
                      {order.customerPhone && (
                        <p className="text-xs text-muted-foreground">
                          {order.customerPhone}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {order.items?.length ?? 0}
                  </TableCell>
                  <TableCell className="text-right font-medium">
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
                  <TableCell>
                    {order.source ? (
                      <Badge variant="outline" className="capitalize">
                        {order.source}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => setSelectedOrder(order)}
                      title="View details"
                    >
                      <Eye className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Order {selectedOrder?.orderNumber || selectedOrder?.id?.slice(0, 8)}
            </DialogTitle>
            <DialogDescription>
              Placed on {selectedOrder ? formatDate(selectedOrder.createdAt) : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Status & Payment */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <StatusBadge
                    status={selectedOrder.status || "pending"}
                    type="order"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Payment:</span>
                  <StatusBadge
                    status={selectedOrder.paymentStatus || "pending"}
                    type="payment"
                  />
                </div>
                {selectedOrder.source && (
                  <Badge variant="outline" className="capitalize">
                    {selectedOrder.source}
                  </Badge>
                )}
              </div>

              {/* Update Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Update Status:</span>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(v) =>
                    handleUpdateStatus(selectedOrder.id, v as OrderStatus)
                  }
                  disabled={updatingStatus}
                >
                  <SelectTrigger className="w-[180px]">
                    {updatingStatus ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : null}
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Info */}
              <div className="rounded-lg border p-4 space-y-1">
                <h4 className="text-sm font-semibold">Customer</h4>
                <p className="text-sm">{selectedOrder.customerName || "—"}</p>
                {selectedOrder.customerPhone && (
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.customerPhone}
                  </p>
                )}
                {selectedOrder.customerEmail && (
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.customerEmail}
                  </p>
                )}
              </div>

              {/* Items */}
              <div className="rounded-lg border p-4">
                <h4 className="mb-3 text-sm font-semibold">Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-center">Color</TableHead>
                      <TableHead className="text-center">Size</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedOrder.items || []).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.productName || item.product?.name || "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.color || "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.size || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.price * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {(selectedOrder.discount ?? 0) > 0 && (
                  <div className="mt-2 flex justify-end text-sm text-red-600">
                    Discount: -{formatCurrency(selectedOrder.discount!)}
                  </div>
                )}
                <div className="mt-2 flex justify-end text-base font-bold">
                  Total: {formatCurrency(selectedOrder.total)}
                </div>
              </div>

              {/* Delivery & Notes */}
              {selectedOrder.deliveryAddress && (
                <div className="rounded-lg border p-4 space-y-1">
                  <h4 className="text-sm font-semibold">Delivery Address</h4>
                  <p className="text-sm">{selectedOrder.deliveryAddress}</p>
                </div>
              )}
              {selectedOrder.notes && (
                <div className="rounded-lg border p-4 space-y-1">
                  <h4 className="text-sm font-semibold">Notes</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
