"use client";

import React, { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Smartphone,
  Building2,
  Banknote,
  CreditCard,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import type { PaymentMethodType } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  active: boolean;
  config: {
    phone?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    instructions?: string;
  };
}

interface PaymentFormData {
  name: string;
  type: PaymentMethodType;
  phone: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  instructions: string;
  active: boolean;
}

// ---------------------------------------------------------------------------
// Demo Data
// ---------------------------------------------------------------------------

const DEMO_METHODS: PaymentMethod[] = [
  {
    id: "pm1",
    name: "MTN Mobile Money",
    type: "momo",
    active: true,
    config: { phone: "+250 788 456 789" },
  },
  {
    id: "pm2",
    name: "Airtel Money",
    type: "momo",
    active: true,
    config: { phone: "+250 730 123 456" },
  },
  {
    id: "pm3",
    name: "Bank of Kigali Transfer",
    type: "bank_transfer",
    active: true,
    config: {
      bankName: "Bank of Kigali",
      accountNumber: "000-1234567-89",
      accountName: "Umuhoza Fashion House Ltd",
    },
  },
  {
    id: "pm4",
    name: "Cash on Delivery",
    type: "cash_on_delivery",
    active: true,
    config: {
      instructions: "Please have the exact amount ready. Our delivery agent will collect payment upon delivery. Ensure someone is available at the delivery address.",
    },
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TYPE_ICONS: Record<PaymentMethodType, React.ElementType> = {
  momo: Smartphone,
  bank_transfer: Building2,
  cash_on_delivery: Banknote,
  card: CreditCard,
};

const TYPE_LABELS: Record<PaymentMethodType, string> = {
  momo: "Mobile Money",
  bank_transfer: "Bank Transfer",
  cash_on_delivery: "Cash on Delivery",
  card: "Card Payment",
};

const TYPE_COLORS: Record<PaymentMethodType, string> = {
  momo: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  bank_transfer: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  cash_on_delivery: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  card: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
};

const emptyForm: PaymentFormData = {
  name: "",
  type: "momo",
  phone: "",
  bankName: "",
  accountNumber: "",
  accountName: "",
  instructions: "",
  active: true,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PaymentsSection() {
  const [methods, setMethods] = useState<PaymentMethod[]>(DEMO_METHODS);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<PaymentFormData>(emptyForm);
  const [editTarget, setEditTarget] = useState<PaymentMethod | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);

  function openAdd() {
    setFormMode("add");
    setFormData(emptyForm);
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(pm: PaymentMethod) {
    setFormMode("edit");
    setEditTarget(pm);
    setFormData({
      name: pm.name,
      type: pm.type,
      phone: pm.config.phone ?? "",
      bankName: pm.config.bankName ?? "",
      accountNumber: pm.config.accountNumber ?? "",
      accountName: pm.config.accountName ?? "",
      instructions: pm.config.instructions ?? "",
      active: pm.active,
    });
    setFormOpen(true);
  }

  function handleSave() {
    const config: PaymentMethod["config"] = {};
    if (formData.type === "momo") config.phone = formData.phone;
    if (formData.type === "bank_transfer") {
      config.bankName = formData.bankName;
      config.accountNumber = formData.accountNumber;
      config.accountName = formData.accountName;
    }
    if (formData.type === "cash_on_delivery") config.instructions = formData.instructions;

    if (formMode === "add") {
      const newMethod: PaymentMethod = {
        id: `pm-${Date.now()}`,
        name: formData.name,
        type: formData.type,
        active: formData.active,
        config,
      };
      setMethods((prev) => [...prev, newMethod]);
    } else if (editTarget) {
      setMethods((prev) =>
        prev.map((m) =>
          m.id === editTarget.id
            ? { ...m, name: formData.name, type: formData.type, active: formData.active, config }
            : m
        )
      );
    }
    setFormOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setMethods((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  function toggleActive(pm: PaymentMethod) {
    setMethods((prev) =>
      prev.map((m) => (m.id === pm.id ? { ...m, active: !m.active } : m))
    );
  }

  function renderConfigDetails(pm: PaymentMethod) {
    switch (pm.type) {
      case "momo":
        return <p className="text-sm text-muted-foreground">{pm.config.phone}</p>;
      case "bank_transfer":
        return (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{pm.config.bankName}</p>
            <p className="text-xs text-muted-foreground font-mono">{pm.config.accountNumber}</p>
            <p className="text-xs text-muted-foreground">{pm.config.accountName}</p>
          </div>
        );
      case "cash_on_delivery":
        return <p className="text-sm text-muted-foreground line-clamp-2">{pm.config.instructions}</p>;
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Methods"
        description="Manage how your customers pay"
        action={
          <Button onClick={openAdd}>
            <Plus className="mr-2 size-4" />
            Add Method
          </Button>
        }
      />

      {methods.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payment methods"
          description="Add a payment method so customers can pay for orders."
          action={
            <Button size="sm" onClick={openAdd}>
              <Plus className="mr-2 size-4" />
              Add Method
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {methods.map((pm) => {
            const Icon = TYPE_ICONS[pm.type];
            return (
              <Card key={pm.id} className={pm.active ? "" : "opacity-60"}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex size-10 items-center justify-center rounded-lg ${TYPE_COLORS[pm.type]}`}>
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{pm.name}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {TYPE_LABELS[pm.type]}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleActive(pm)}>
                            {pm.active ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(pm)}>
                            <Pencil className="mr-2 size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setDeleteTarget(pm);
                              setDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {renderConfigDetails(pm)}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <Switch
                      checked={pm.active}
                      onCheckedChange={() => toggleActive(pm)}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formMode === "add" ? "Add Payment Method" : "Edit Payment Method"}</DialogTitle>
            <DialogDescription>
              {formMode === "add"
                ? "Add a new payment method for your store."
                : "Update payment method configuration."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pm-name">Name *</Label>
              <Input
                id="pm-name"
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., MTN Mobile Money"
              />
            </div>
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData((f) => ({ ...f, type: v as PaymentMethodType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="momo">Mobile Money</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                  <SelectItem value="card">Card Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === "momo" && (
              <div className="space-y-2">
                <Label htmlFor="pm-phone">Phone Number *</Label>
                <Input
                  id="pm-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+250 7XX XXX XXX"
                />
              </div>
            )}

            {formData.type === "bank_transfer" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="pm-bank">Bank Name *</Label>
                  <Input
                    id="pm-bank"
                    value={formData.bankName}
                    onChange={(e) => setFormData((f) => ({ ...f, bankName: e.target.value }))}
                    placeholder="e.g., Bank of Kigali"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pm-account">Account Number *</Label>
                  <Input
                    id="pm-account"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData((f) => ({ ...f, accountNumber: e.target.value }))}
                    placeholder="000-0000000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pm-acctname">Account Name *</Label>
                  <Input
                    id="pm-acctname"
                    value={formData.accountName}
                    onChange={(e) => setFormData((f) => ({ ...f, accountName: e.target.value }))}
                    placeholder="Business name"
                  />
                </div>
              </div>
            )}

            {formData.type === "cash_on_delivery" && (
              <div className="space-y-2">
                <Label htmlFor="pm-instructions">Instructions *</Label>
                <textarea
                  id="pm-instructions"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.instructions}
                  onChange={(e) => setFormData((f) => ({ ...f, instructions: e.target.value }))}
                  placeholder="Instructions for cash on delivery..."
                  rows={3}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">Enable this payment method</p>
              </div>
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData((f) => ({ ...f, active: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.name.trim()}>
              {formMode === "add" ? "Add Method" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Payment Method</DialogTitle>
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
