"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  ShoppingCart,
  Eye,
  MoreVertical,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Package,
  Calendar,
  Clock,
  User,
  CreditCard,
  Truck,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import type { OrderStatus, PaymentStatus } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  deliveryAddress: string;
  notes: string;
  source: "ai" | "manual" | "whatsapp";
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_ORDERS: Order[] = [
  {
    id: "ord-1",
    orderNumber: "ORD-20241201-001",
    customerName: "Sarah Johnson",
    customerPhone: "+1 (555) 123-4567",
    customerEmail: "sarah.j@email.com",
    items: [
      {
        id: "item-1",
        productName: "High-Waisted Skinny Jeans",
        quantity: 1,
        price: 79.99,
        size: "28",
        color: "Dark Blue",
      },
      {
        id: "item-2",
        productName: "Floral Midi Summer Dress",
        quantity: 1,
        price: 89.99,
        size: "M",
        color: "Pink Floral",
      },
      {
        id: "item-3",
        productName: "Leather Crossbody Bag",
        quantity: 1,
        price: 99.99,
        color: "Black",
      },
    ],
    subtotal: 269.97,
    discount: 10.0,
    total: 259.97,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Card",
    deliveryAddress: "123 Oak Street, Apt 4B, New York, NY 10001",
    notes: "Please leave at the door.",
    source: "ai",
    createdAt: "2024-12-01T14:23:00Z",
    updatedAt: "2024-12-03T10:00:00Z",
  },
  {
    id: "ord-2",
    orderNumber: "ORD-20241201-002",
    customerName: "Michael Chen",
    customerPhone: "+1 (555) 234-5678",
    customerEmail: "m.chen@email.com",
    items: [
      {
        id: "item-4",
        productName: "Running Sneakers - Pro Series",
        quantity: 1,
        price: 119.99,
        size: "10",
        color: "White/Black",
      },
    ],
    subtotal: 119.99,
    discount: 0,
    total: 119.99,
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "Momo",
    deliveryAddress: "456 Maple Avenue, Los Angeles, CA 90001",
    notes: "",
    source: "manual",
    createdAt: "2024-12-01T12:45:00Z",
    updatedAt: "2024-12-02T09:00:00Z",
  },
  {
    id: "ord-3",
    orderNumber: "ORD-20241201-003",
    customerName: "Emily Davis",
    customerPhone: "+1 (555) 345-6789",
    customerEmail: "emily.d@email.com",
    items: [
      {
        id: "item-5",
        productName: "Oversized Graphic Hoodie",
        quantity: 2,
        price: 54.99,
        size: "L",
        color: "Charcoal",
      },
      {
        id: "item-6",
        productName: "Classic Cotton Crew Neck T-Shirt",
        quantity: 3,
        price: 29.99,
        size: "M",
        color: "Black",
      },
      {
        id: "item-7",
        productName: "Cashmere Blend Scarf",
        quantity: 1,
        price: 44.99,
        color: "Camel",
      },
    ],
    subtotal: 244.94,
    discount: 20.0,
    total: 224.94,
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "Bank Transfer",
    deliveryAddress: "789 Pine Road, Suite 12, Chicago, IL 60601",
    notes: "Gift wrapping please.",
    source: "ai",
    createdAt: "2024-12-01T11:30:00Z",
    updatedAt: "2024-12-01T14:00:00Z",
  },
  {
    id: "ord-4",
    orderNumber: "ORD-20241201-004",
    customerName: "James Wilson",
    customerPhone: "+1 (555) 456-7890",
    customerEmail: "jwilson@email.com",
    items: [
      {
        id: "item-8",
        productName: "Slim Fit Chino Pants",
        quantity: 1,
        price: 64.99,
        size: "32",
        color: "Khaki",
      },
      {
        id: "item-9",
        productName: "Classic Cotton Crew Neck T-Shirt",
        quantity: 1,
        price: 39.99,
        size: "L",
        color: "White",
      },
    ],
    subtotal: 104.98,
    discount: 0,
    total: 104.98,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "Cash on Delivery",
    deliveryAddress: "321 Elm Street, Houston, TX 77001",
    notes: "",
    source: "whatsapp",
    createdAt: "2024-12-01T10:15:00Z",
    updatedAt: "2024-12-01T10:15:00Z",
  },
  {
    id: "ord-5",
    orderNumber: "ORD-20241130-001",
    customerName: "Lisa Park",
    customerPhone: "+1 (555) 567-8901",
    customerEmail: "lisa.park@email.com",
    items: [
      {
        id: "item-10",
        productName: "Floral Midi Summer Dress",
        quantity: 1,
        price: 69.99,
        size: "S",
        color: "Blue Floral",
      },
      {
        id: "item-11",
        productName: "Leather Crossbody Bag",
        quantity: 1,
        price: 99.99,
        color: "Tan",
      },
      {
        id: "item-12",
        productName: "Cashmere Blend Scarf",
        quantity: 2,
        price: 44.99,
        color: "Grey",
      },
      {
        id: "item-13",
        productName: "Running Sneakers - Pro Series",
        quantity: 1,
        price: 119.99,
        size: "7",
        color: "Black/Red",
      },
      {
        id: "item-14",
        productName: "High-Waisted Skinny Jeans",
        quantity: 1,
        price: 79.99,
        size: "26",
        color: "Black",
      },
    ],
    subtotal: 459.93,
    discount: 30.0,
    total: 429.93,
    status: "confirmed",
    paymentStatus: "paid",
    paymentMethod: "Card",
    deliveryAddress: "555 Broadway, Apt 8C, Brooklyn, NY 11211",
    notes: "Birthday gift for my sister. Handle with care!",
    source: "ai",
    createdAt: "2024-11-30T16:45:00Z",
    updatedAt: "2024-12-01T08:00:00Z",
  },
  {
    id: "ord-6",
    orderNumber: "ORD-20241130-002",
    customerName: "David Brown",
    customerPhone: "+1 (555) 678-9012",
    customerEmail: "d.brown@email.com",
    items: [
      {
        id: "item-15",
        productName: "Oversized Graphic Hoodie",
        quantity: 1,
        price: 69.99,
        size: "XL",
        color: "Burgundy",
      },
    ],
    subtotal: 69.99,
    discount: 0,
    total: 69.99,
    status: "cancelled",
    paymentStatus: "failed",
    paymentMethod: "Card",
    deliveryAddress: "222 Cedar Lane, Miami, FL 33101",
    notes: "Customer cancelled - changed their mind.",
    source: "manual",
    createdAt: "2024-11-30T14:20:00Z",
    updatedAt: "2024-11-30T18:00:00Z",
  },
  {
    id: "ord-7",
    orderNumber: "ORD-20241129-001",
    customerName: "Anna Martinez",
    customerPhone: "+1 (555) 789-0123",
    customerEmail: "anna.m@email.com",
    items: [
      {
        id: "item-16",
        productName: "Kids Denim Jacket - Indigo",
        quantity: 2,
        price: 49.99,
        size: "6",
        color: "Indigo",
      },
      {
        id: "item-17",
        productName: "Classic Cotton Crew Neck T-Shirt",
        quantity: 2,
        price: 39.99,
        size: "S",
        color: "Navy",
      },
    ],
    subtotal: 179.96,
    discount: 15.0,
    total: 164.96,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Momo",
    deliveryAddress: "888 Birch Drive, Phoenix, AZ 85001",
    notes: "",
    source: "whatsapp",
    createdAt: "2024-11-29T09:30:00Z",
    updatedAt: "2024-12-01T12:00:00Z",
  },
  {
    id: "ord-8",
    orderNumber: "ORD-20241128-001",
    customerName: "Robert Kim",
    customerPhone: "+1 (555) 890-1234",
    customerEmail: "r.kim@email.com",
    items: [
      {
        id: "item-18",
        productName: "Linen Blend Summer Blazer",
        quantity: 1,
        price: 149.99,
        size: "L",
        color: "Navy",
      },
      {
        id: "item-19",
        productName: "Slim Fit Chino Pants",
        quantity: 2,
        price: 64.99,
        size: "34",
        color: "Navy",
      },
      {
        id: "item-20",
        productName: "Leather Crossbody Bag",
        quantity: 1,
        price: 129.99,
        color: "Burgundy",
      },
    ],
    subtotal: 409.96,
    discount: 25.0,
    total: 384.96,
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "Bank Transfer",
    deliveryAddress: "444 Walnut Court, San Francisco, CA 94102",
    notes: "",
    source: "ai",
    createdAt: "2024-11-28T13:10:00Z",
    updatedAt: "2024-11-30T11:00:00Z",
  },
  {
    id: "ord-9",
    orderNumber: "ORD-20241201-005",
    customerName: "Jessica Lee",
    customerPhone: "+1 (555) 901-2345",
    customerEmail: "jess.lee@email.com",
    items: [
      {
        id: "item-21",
        productName: "High-Waisted Skinny Jeans",
        quantity: 1,
        price: 79.99,
        size: "30",
        color: "Light Wash",
      },
    ],
    subtotal: 79.99,
    discount: 0,
    total: 79.99,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "Momo",
    deliveryAddress: "777 Spruce Way, Seattle, WA 98101",
    notes: "",
    source: "ai",
    createdAt: "2024-12-01T08:00:00Z",
    updatedAt: "2024-12-01T08:00:00Z",
  },
  {
    id: "ord-10",
    orderNumber: "ORD-20241130-003",
    customerName: "Tom Anderson",
    customerPhone: "+1 (555) 012-3456",
    customerEmail: "tom.a@email.com",
    items: [
      {
        id: "item-22",
        productName: "Running Sneakers - Pro Series",
        quantity: 1,
        price: 119.99,
        size: "11",
        color: "Gray/Blue",
      },
      {
        id: "item-23",
        productName: "Oversized Graphic Hoodie",
        quantity: 1,
        price: 54.99,
        size: "M",
        color: "Heather Gray",
      },
      {
        id: "item-24",
        productName: "Slim Fit Chino Pants",
        quantity: 1,
        price: 64.99,
        size: "32",
        color: "Olive",
      },
    ],
    subtotal: 239.97,
    discount: 0,
    total: 239.97,
    status: "confirmed",
    paymentStatus: "paid",
    paymentMethod: "Card",
    deliveryAddress: "666 Ash Boulevard, Denver, CO 80201",
    notes: "Please confirm stock before shipping.",
    source: "manual",
    createdAt: "2024-11-30T17:30:00Z",
    updatedAt: "2024-12-01T09:30:00Z",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

function formatFullDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

const ORDER_STATUS_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

const SOURCE_STYLES: Record<string, string> = {
  ai: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
  manual: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  whatsapp: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
};

const SOURCE_LABELS: Record<string, string> = {
  ai: "AI",
  manual: "Manual",
  whatsapp: "WhatsApp",
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function OrdersSection() {
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Detail dialog
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch orders
  const { isLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/orders?businessId=DEMO");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setOrders(json.data);
            return json.data;
          }
        }
      } catch {
        // fallback
      }
      await new Promise((r) => setTimeout(r, 700));
      setOrders(DEMO_ORDERS);
      return DEMO_ORDERS;
    },
    staleTime: 30_000,
  });

  // Filtered orders
  const filteredOrders = useMemo(() => {
    const source = orders.length > 0 ? orders : DEMO_ORDERS;
    return source.filter((o) => {
      // Search
      const matchesSearch =
        !search.trim() ||
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(search.toLowerCase());

      // Status
      const matchesStatus =
        filterStatus === "all" || o.status === filterStatus;

      // Date filter
      let matchesDate = true;
      if (dateFilter !== "all") {
        const now = new Date();
        const orderDate = new Date(o.createdAt);
        const diffDays = Math.floor(
          (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        switch (dateFilter) {
          case "today":
            matchesDate = diffDays === 0;
            break;
          case "7days":
            matchesDate = diffDays <= 7;
            break;
          case "30days":
            matchesDate = diffDays <= 30;
            break;
          case "90days":
            matchesDate = diffDays <= 90;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, search, filterStatus, dateFilter]);

  // Status update
  function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: newStatus, updatedAt: new Date().toISOString() }
          : o
      )
    );
    // Also update selectedOrder if viewing
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) =>
        prev
          ? { ...prev, status: newStatus, updatedAt: new Date().toISOString() }
          : null
      );
    }
  }

  function approveOrder(order: Order) {
    updateOrderStatus(order.id, "confirmed");
  }

  function rejectOrder(order: Order) {
    updateOrderStatus(order.id, "cancelled");
  }

  // Stats
  const orderStats = useMemo(() => {
    const source = orders.length > 0 ? orders : DEMO_ORDERS;
    const pending = source.filter((o) => o.status === "pending").length;
    const total = source.reduce((sum, o) => sum + o.total, 0);
    return { total: source.length, pending, totalRevenue: total };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Orders"
        description={`${orderStats.total} orders · ${orderStats.pending} pending · ${formatCurrency(orderStats.totalRevenue)} total`}
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order #, customer, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-16" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, rowIdx) => (
                <TableRow key={rowIdx}>
                  {Array.from({ length: 8 }).map((_, colIdx) => (
                    <TableCell key={colIdx}>
                      <Skeleton className="h-5 w-full max-w-[120px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No orders found"
          description={
            search || filterStatus !== "all" || dateFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Orders will appear here once customers start placing them."
          }
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[18%]">Order #</TableHead>
                <TableHead className="w-[15%]">Customer</TableHead>
                <TableHead className="w-[8%] text-center">Items</TableHead>
                <TableHead className="w-[12%] text-right">Total</TableHead>
                <TableHead className="w-[12%]">Status</TableHead>
                <TableHead className="w-[10%]">Payment</TableHead>
                <TableHead className="w-[10%]">Source</TableHead>
                <TableHead className="w-[10%]">Date</TableHead>
                <TableHead className="w-[5%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <TableCell>
                    <span className="font-mono text-sm font-medium">
                      {order.orderNumber}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {order.customerEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="font-mono">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} type="order" />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.paymentStatus} type="payment" />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={SOURCE_STYLES[order.source] || ""}
                    >
                      {SOURCE_LABELS[order.source] || order.source}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    {/* Quick approve/reject for pending */}
                    {order.status === "pending" && (
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950"
                          onClick={() => approveOrder(order)}
                          title="Approve"
                        >
                          <CheckCircle2 className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                          onClick={() => rejectOrder(order)}
                          title="Reject"
                        >
                          <XCircle className="size-4" />
                        </Button>
                      </div>
                    )}
                    {/* Status update dropdown for non-pending */}
                    {order.status !== "pending" && order.status !== "cancelled" && order.status !== "delivered" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7">
                            <ChevronDown className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {ORDER_STATUS_FLOW.map((status) => (
                            <DropdownMenuItem
                              key={status}
                              disabled={status === order.status}
                              onClick={() => updateOrderStatus(order.id, status)}
                            >
                              <StatusBadge status={status} type="order" />
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span>Order Details</span>
                  <StatusBadge status={selectedOrder.status} type="order" />
                  <StatusBadge status={selectedOrder.paymentStatus} type="payment" />
                </DialogTitle>
                <DialogDescription>
                  {selectedOrder.orderNumber}
                </DialogDescription>
              </DialogHeader>

              {/* Customer Info */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-lg border p-4 bg-muted/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <User className="size-3.5" />
                    Customer
                  </div>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customerPhone}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customerEmail}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <Truck className="size-3.5" />
                    Delivery Address
                  </div>
                  <p className="text-sm">{selectedOrder.deliveryAddress || "—"}</p>
                </div>
              </div>

              {/* Order Meta */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="size-3" />
                    Created
                  </div>
                  <p className="text-sm font-medium">{formatFullDate(selectedOrder.createdAt)}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    Updated
                  </div>
                  <p className="text-sm font-medium">{formatFullDate(selectedOrder.updatedAt)}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CreditCard className="size-3" />
                    Payment
                  </div>
                  <p className="text-sm font-medium">{selectedOrder.paymentMethod}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Package className="size-3" />
                    Source
                  </div>
                  <Badge variant="outline" className={SOURCE_STYLES[selectedOrder.source] || ""}>
                    {SOURCE_LABELS[selectedOrder.source] || selectedOrder.source}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Items */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Order Items</h4>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Variant</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium text-sm">
                            {item.productName}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {item.color && (
                                <Badge variant="outline" className="text-[10px] font-normal">
                                  {item.color}
                                </Badge>
                              )}
                              {item.size && (
                                <Badge variant="outline" className="text-[10px] font-normal">
                                  {item.size}
                                </Badge>
                              )}
                              {!item.color && !item.size && (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.price)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full max-w-[250px] space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-red-600 dark:text-red-400">
                        -{formatCurrency(selectedOrder.discount)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="rounded-lg border p-3 bg-muted/30">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                {selectedOrder.status === "pending" && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        rejectOrder(selectedOrder);
                        setSelectedOrder(null);
                      }}
                    >
                      <XCircle className="size-4" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => {
                        approveOrder(selectedOrder);
                        setSelectedOrder(null);
                      }}
                    >
                      <CheckCircle2 className="size-4" />
                      Approve Order
                    </Button>
                  </>
                )}
                {selectedOrder.status !== "pending" &&
                  selectedOrder.status !== "cancelled" &&
                  selectedOrder.status !== "delivered" && (
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(val) => {
                        updateOrderStatus(selectedOrder.id, val as OrderStatus);
                        setSelectedOrder(null);
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUS_FLOW.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
