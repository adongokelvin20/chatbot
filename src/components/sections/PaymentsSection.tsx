"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  CreditCard,
  Wallet,
  Banknote,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { PaymentMethodType } from "@/types";

// ---------- Types ----------

interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  config: Record<string, string> | null;
  active: boolean;
  createdAt: string;
}

interface PaymentFormData {
  name: string;
  type: PaymentMethodType;
  config: Record<string, string>;
  active: boolean;
}

const emptyForm: PaymentFormData = {
  name: "",
  type: "cash_on_delivery",
  config: {},
  active: true,
};

const methodTypes: { value: PaymentMethodType; label: string }[] = [
  { value: "momo", label: "MoMo" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash_on_delivery", label: "Cash on Delivery" },
  { value: "card", label: "Card" },
];

const typeIcons: Record<PaymentMethodType, React.ElementType> = {
  momo: Wallet,
  bank_transfer: CreditCard,
  cash_on_delivery: Banknote,
  card: CreditCard,
};

function getConfigFields(type: PaymentMethodType): { key: string; label: string; placeholder: string }[] {
  switch (type) {
    case "momo":
      return [
        { key: "merchantId", label: "Merchant ID", placeholder: "Merchant ID" },
        { key: "apiKey", label: "API Key", placeholder: "API Key" },
      ];
    case "bank_transfer":
      return [
        { key: "bankName", label: "Bank Name", placeholder: "Bank name" },
        { key: "accountNumber", label: "Account Number", placeholder: "Account number" },
        { key: "accountName", label: "Account Name", placeholder: "Account holder name" },
      ];
    case "card":
      return [
        { key: "stripePublicKey", label: "Stripe Public Key", placeholder: "pk_..." },
        { key: "stripeSecretKey", label: "Stripe Secret Key", placeholder: "sk_..." },
      ];
    default:
      return [];
  }
}

// ---------- Component ----------

export default function PaymentsSection() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [form, setForm] = useState<PaymentFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ---------- Data Fetching ----------

  const fetchMethods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/payment-methods?active=false");
      if (!res.ok) throw new Error("Failed to fetch payment methods");
      const json = await res.json();
      setMethods(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  // ---------- Helpers ----------

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(method: PaymentMethod) {
    setEditing(method);
    setForm({
      name: method.name,
      type: method.type,
      config: (method.config as Record<string, string>) || {},
      active: method.active,
    });
    setFormOpen(true);
  }

  function handleTypeChange(newType: PaymentMethodType) {
    setForm({
      ...form,
      type: newType,
      config: {},
    });
  }

  // ---------- CRUD ----------

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        type: form.type,
        config: Object.keys(form.config).length > 0 ? form.config : undefined,
        active: form.active,
      };

      const url = editing
        ? `/api/payment-methods/${editing.id}`
        : "/api/payment-methods";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save payment method");
      setFormOpen(false);
      await fetchMethods();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/payment-methods/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete payment method");
      setDeleteTarget(null);
      await fetchMethods();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  // ---------- Render ----------

  const configFields = getConfigFields(form.type);
  const TypeIcon = typeIcons[form.type];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Methods"
        description="Configure how customers can pay"
        action={
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            Add Method
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && methods.length === 0 && (
        <EmptyState
          icon={CreditCard}
          title="No payment methods"
          description="Add payment methods to let customers pay for orders."
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-2 size-4" />
              Add Method
            </Button>
          }
        />
      )}

      {/* Cards */}
      {!loading && methods.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {methods.map((method) => {
            const Icon = typeIcons[method.type] || CreditCard;
            const config = method.config as Record<string, string> | null;
            return (
              <Card key={method.id} className={!method.active ? "opacity-60" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                        <Icon className="size-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{method.name}</h3>
                        <Badge variant="outline" className="mt-1 capitalize text-xs">
                          {method.type.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant={method.active ? "default" : "secondary"}>
                      {method.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {config && Object.keys(config).length > 0 && (
                    <div className="mt-4 space-y-1">
                      {Object.entries(config).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </span>
                          <span className="font-mono text-xs">
                            {value.length > 12 ? value.slice(0, 12) + "..." : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-1 border-t pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => openEdit(method)}
                    >
                      <Pencil className="mr-1 size-3" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-red-500 hover:text-red-600"
                      onClick={() => setDeleteTarget(method)}
                    >
                      <Trash2 className="mr-1 size-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Payment Method" : "Add Payment Method"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update payment method details."
                : "Configure a new payment method."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="pm-name">Name *</Label>
              <Input
                id="pm-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., MoMo, Bank Transfer"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pm-type">Type</Label>
              <Select value={form.type} onValueChange={(v) => handleTypeChange(v as PaymentMethodType)}>
                <SelectTrigger id="pm-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {methodTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Config fields based on type */}
            {configFields.map((field) => (
              <div key={field.key} className="grid gap-2">
                <Label htmlFor={`pm-config-${field.key}`}>{field.label}</Label>
                <Input
                  id={`pm-config-${field.key}`}
                  value={form.config[field.key] || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      config: { ...form.config, [field.key]: e.target.value },
                    })
                  }
                  placeholder={field.placeholder}
                />
              </div>
            ))}

            <div className="flex items-center justify-between">
              <Label htmlFor="pm-active">Active</Label>
              <Switch
                id="pm-active"
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Payment Method"
        description={`Are you sure you want to delete "${deleteTarget?.name || "this method"}"?`}
        onConfirm={handleDelete}
        variant="destructive"
        confirmLabel="Delete"
        isLoading={deleting}
      />
    </div>
  );
}
