"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Phone,
  Mail,
  FileText,
  ShoppingBag,
  MessageSquare,
  StickyNote,
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  lifetimeValue: number;
  lastInteraction: string;
  notes: string;
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  items: number;
  createdAt: string;
}

interface ConversationEntry {
  id: string;
  message: string;
  sender: "customer" | "ai" | "staff";
  createdAt: string;
}

interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

// ---------------------------------------------------------------------------
// Demo Data
// ---------------------------------------------------------------------------

const DEMO_CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Grace Uwimana",
    phone: "+250 788 123 456",
    email: "grace.uwimana@email.rw",
    totalOrders: 12,
    lifetimeValue: 485000,
    lastInteraction: "2025-01-15T10:30:00Z",
    notes: "Prefers Ankara prints. Regular customer since 2023.",
  },
  {
    id: "c2",
    name: "Jean-Pierre Habimana",
    phone: "+250 785 987 654",
    email: "jp.habimana@email.rw",
    totalOrders: 8,
    lifetimeValue: 320000,
    lastInteraction: "2025-01-14T16:45:00Z",
    notes: "Buys men's shirts and trousers. Sizes L-XL.",
  },
  {
    id: "c3",
    name: "Marie-Claire Mukamana",
    phone: "+250 790 456 789",
    email: "mc.mukamana@email.rw",
    totalOrders: 15,
    lifetimeValue: 620000,
    lastInteraction: "2025-01-15T09:12:00Z",
    notes: "VIP customer. Loves kitenge dresses and matching sets.",
  },
  {
    id: "c4",
    name: "Patrick Niyonzima",
    phone: "+250 783 321 654",
    email: "patrick.n@email.rw",
    totalOrders: 3,
    lifetimeValue: 125000,
    lastInteraction: "2025-01-10T14:20:00Z",
    notes: "New customer. Interested in traditional wear for weddings.",
  },
  {
    id: "c5",
    name: "Diane Ishimwe",
    phone: "+250 788 654 321",
    email: "diane.ishimwe@email.rw",
    totalOrders: 6,
    lifetimeValue: 245000,
    lastInteraction: "2025-01-13T11:05:00Z",
    notes: "College student. Shops for casual wear and accessories.",
  },
  {
    id: "c6",
    name: "Emmanuel Gatera",
    phone: "+250 730 789 012",
    email: "e.gatera@email.rw",
    totalOrders: 10,
    lifetimeValue: 410000,
    lastInteraction: "2025-01-15T08:50:00Z",
    notes: "Bulk buyer. Orders matching family outfits for events.",
  },
  {
    id: "c7",
    name: "Aline Nyirahabimana",
    phone: "+250 782 111 222",
    email: "aline.ny@email.rw",
    totalOrders: 2,
    lifetimeValue: 78000,
    lastInteraction: "2025-01-08T17:30:00Z",
    notes: "Referred by Marie-Claire. Interested in plus-size fashion.",
  },
  {
    id: "c8",
    name: "Eric Ndayisaba",
    phone: "+250 789 444 555",
    email: "eric.nd@email.rw",
    totalOrders: 5,
    lifetimeValue: 198000,
    lastInteraction: "2025-01-12T13:40:00Z",
    notes: "Shops for wife and daughters. Likes surprise gift wrapping.",
  },
];

const DEMO_ORDERS: Record<string, Order[]> = {
  c1: [
    { id: "o1", orderNumber: "ORD-2025-0112", total: 45000, status: "delivered", items: 2, createdAt: "2025-01-12T09:00:00Z" },
    { id: "o2", orderNumber: "ORD-2025-0105", total: 52000, status: "delivered", items: 1, createdAt: "2025-01-05T14:30:00Z" },
    { id: "o3", orderNumber: "ORD-2024-1228", total: 38000, status: "delivered", items: 3, createdAt: "2024-12-28T11:00:00Z" },
  ],
  c3: [
    { id: "o4", orderNumber: "ORD-2025-0115", total: 78000, status: "processing", items: 4, createdAt: "2025-01-15T09:12:00Z" },
    { id: "o5", orderNumber: "ORD-2025-0108", total: 65000, status: "delivered", items: 2, createdAt: "2025-01-08T10:00:00Z" },
  ],
};

const DEMO_CONVERSATIONS: Record<string, ConversationEntry[]> = {
  c1: [
    { id: "m1", message: "Hello! Do you have any new Ankara prints in stock?", sender: "customer", createdAt: "2025-01-15T10:25:00Z" },
    { id: "m2", message: "Hi Grace! Yes, we just received a beautiful new collection of Ankara fabrics. Would you like me to show you some options?", sender: "ai", createdAt: "2025-01-15T10:26:00Z" },
    { id: "m3", message: "Yes please! I'm looking for something in blue and gold tones.", sender: "customer", createdAt: "2025-01-15T10:27:00Z" },
    { id: "m4", message: "Perfect! I found 3 beautiful options that match your preference. Let me send you the details with prices.", sender: "ai", createdAt: "2025-01-15T10:28:00Z" },
  ],
  c3: [
    { id: "m5", message: "I need matching outfits for my daughter's graduation. 5 pieces.", sender: "customer", createdAt: "2025-01-15T09:00:00Z" },
    { id: "m6", message: "Congratulations on your daughter's graduation! We have lovely kitenge matching sets. How about our Royal Gold collection?", sender: "ai", createdAt: "2025-01-15T09:01:00Z" },
  { id: "m7", message: "That sounds perfect! Can you do a bulk discount for 5 pieces?", sender: "customer", createdAt: "2025-01-15T09:05:00Z" },
  ],
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

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const emptyForm: CustomerFormData = {
  name: "",
  phone: "",
  email: "",
  notes: "",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CustomersSection() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>(DEMO_CUSTOMERS);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<CustomerFormData>(emptyForm);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [customers, search]);

  function openAdd() {
    setFormMode("add");
    setFormData(emptyForm);
    setFormOpen(true);
  }

  function openEdit(c: Customer) {
    setFormMode("edit");
    setFormData({ name: c.name, phone: c.phone, email: c.email, notes: c.notes });
    setFormOpen(true);
  }

  function handleSave() {
    if (formMode === "add") {
      const newCustomer: Customer = {
        id: `c${Date.now()}`,
        ...formData,
        totalOrders: 0,
        lifetimeValue: 0,
        lastInteraction: new Date().toISOString(),
      };
      setCustomers((prev) => [newCustomer, ...prev]);
    } else {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === detailCustomer?.id ? { ...c, ...formData } : c
        )
      );
    }
    setFormOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setCustomers((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  const orders = detailCustomer ? (DEMO_ORDERS[detailCustomer.id] ?? []) : [];
  const conversations = detailCustomer ? (DEMO_CONVERSATIONS[detailCustomer.id] ?? []) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description={`${customers.length} total customers`}
        action={
          <Button onClick={openAdd}>
            <Plus className="mr-2 size-4" />
            Add Customer
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No customers found"
          description={search ? "Try a different search term." : "Add your first customer to get started."}
          action={
            !search ? (
              <Button size="sm" onClick={openAdd}>
                <Plus className="mr-2 size-4" />
                Add Customer
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Lifetime Value</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Interaction</TableHead>
                  <TableHead className="hidden xl:table-cell">Notes</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer"
                    onClick={() => setDetailCustomer(customer)}
                  >
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {customer.email}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{customer.totalOrders}</Badge>
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell font-medium">
                      {formatRWF(customer.lifetimeValue)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {formatTimeAgo(customer.lastInteraction)}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell max-w-[200px] truncate text-muted-foreground">
                      {customer.notes}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(customer); }}>
                            <Pencil className="mr-2 size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(customer); setDeleteOpen(true); }}
                          >
                            <Trash2 className="mr-2 size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Customer Detail Dialog */}
      <Dialog open={!!detailCustomer} onOpenChange={(open) => !open && setDetailCustomer(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          {detailCustomer && (
            <>
              <DialogHeader>
                <DialogTitle>{detailCustomer.name}</DialogTitle>
                <DialogDescription>Customer details and activity</DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[65vh] pr-4">
                <div className="space-y-6">
                  {/* Profile Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                        <Phone className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium">{detailCustomer.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                        <Mail className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium">{detailCustomer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                        <ShoppingBag className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Orders</p>
                        <p className="text-sm font-medium">{detailCustomer.totalOrders} orders</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                        <FileText className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Lifetime Value</p>
                        <p className="text-sm font-medium">{formatRWF(detailCustomer.lifetimeValue)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                        <StickyNote className="size-4" /> Customer Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{detailCustomer.notes || "No notes."}</p>
                    </CardContent>
                  </Card>

                  <Separator />

                  {/* Purchase History */}
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                      <ShoppingBag className="size-4" /> Recent Orders
                    </h3>
                    {orders.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No recent orders found.</p>
                    ) : (
                      <div className="space-y-2">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div>
                              <p className="text-sm font-medium">{order.orderNumber}</p>
                              <p className="text-xs text-muted-foreground">
                                {order.items} item{order.items !== 1 ? "s" : ""} · {formatTimeAgo(order.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold">{formatRWF(order.total)}</span>
                              <StatusBadge status={order.status} type="order" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Conversation History */}
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                      <MessageSquare className="size-4" /> Conversation History
                    </h3>
                    {conversations.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No conversations found.</p>
                    ) : (
                      <div className="space-y-2">
                        {conversations.map((msg) => (
                          <div
                            key={msg.id}
                            className={`rounded-lg p-3 text-sm ${
                              msg.sender === "customer"
                                ? "bg-primary/10 ml-8"
                                : "bg-muted mr-8"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {msg.sender === "customer" ? "Customer" : msg.sender === "ai" ? "AI" : "Staff"}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                {formatTimeAgo(msg.createdAt)}
                              </span>
                            </div>
                            <p className="text-muted-foreground">{msg.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Customer Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formMode === "add" ? "Add Customer" : "Edit Customer"}</DialogTitle>
            <DialogDescription>
              {formMode === "add" ? "Add a new customer to your store." : "Update customer information."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                placeholder="Customer name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+250 7XX XXX XXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                placeholder="customer@email.rw"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Any notes about this customer..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.name.trim() || !formData.phone.trim()}>
              {formMode === "add" ? "Add Customer" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
