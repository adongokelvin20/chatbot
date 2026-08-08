"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Tag,
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
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { formatCurrency } from "@/lib/format";
import type { PromotionType, DiscountType } from "@/types";

// ---------- Types ----------

interface Promotion {
  id: string;
  name: string;
  type: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  minOrder?: number | null;
  maxDiscount?: number | null;
  code?: string | null;
  validFrom?: string | null;
  validUntil?: string | null;
  autoApply: boolean;
  description?: string | null;
  active: boolean;
  createdAt: string;
}

interface PromotionFormData {
  name: string;
  type: PromotionType;
  discountType: DiscountType;
  discountValue: string;
  minOrder: string;
  maxDiscount: string;
  code: string;
  validFrom: string;
  validUntil: string;
  autoApply: boolean;
  description: string;
  active: boolean;
}

const emptyForm: PromotionFormData = {
  name: "",
  type: "discount",
  discountType: "percentage",
  discountValue: "",
  minOrder: "",
  maxDiscount: "",
  code: "",
  validFrom: "",
  validUntil: "",
  autoApply: false,
  description: "",
  active: true,
};

const promotionTypes: { value: PromotionType; label: string }[] = [
  { value: "discount", label: "Discount" },
  { value: "flash_sale", label: "Flash Sale" },
  { value: "coupon", label: "Coupon" },
  { value: "limited_offer", label: "Limited Offer" },
];

const discountTypes: { value: DiscountType; label: string }[] = [
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed Amount (GH₵)" },
];

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ---------- Component ----------

export default function PromotionsSection() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState<PromotionFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ---------- Data Fetching ----------

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/promotions?active=false");
      if (!res.ok) throw new Error("Failed to fetch promotions");
      const json = await res.json();
      setPromotions(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load promotions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // ---------- Helpers ----------

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(promo: Promotion) {
    setEditing(promo);
    setForm({
      name: promo.name,
      type: promo.type,
      discountType: promo.discountType,
      discountValue: String(promo.discountValue),
      minOrder: promo.minOrder ? String(promo.minOrder) : "",
      maxDiscount: promo.maxDiscount ? String(promo.maxDiscount) : "",
      code: promo.code || "",
      validFrom: promo.validFrom ? promo.validFrom.slice(0, 10) : "",
      validUntil: promo.validUntil ? promo.validUntil.slice(0, 10) : "",
      autoApply: promo.autoApply,
      description: promo.description || "",
      active: promo.active,
    });
    setFormOpen(true);
  }

  // ---------- CRUD ----------

  async function handleSave() {
    if (!form.name.trim() || !form.discountValue) return;
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        type: form.type,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue) || 0,
        minOrder: form.minOrder ? parseFloat(form.minOrder) || undefined : undefined,
        maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) || undefined : undefined,
        code: form.code.trim() || undefined,
        validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : undefined,
        validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
        autoApply: form.autoApply,
        description: form.description.trim() || undefined,
        active: form.active,
      };

      const url = editing
        ? `/api/promotions/${editing.id}`
        : "/api/promotions";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save promotion");
      setFormOpen(false);
      await fetchPromotions();
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
      const res = await fetch(`/api/promotions/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete promotion");
      setDeleteTarget(null);
      await fetchPromotions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  // ---------- Render ----------

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotions"
        description="Manage discounts, coupons, and special offers"
        action={
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            Add Promotion
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
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Valid Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
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
      {!loading && promotions.length === 0 && (
        <EmptyState
          icon={Tag}
          title="No promotions"
          description="Create promotions to attract and retain customers."
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-2 size-4" />
              Add Promotion
            </Button>
          }
        />
      )}

      {/* Table */}
      {!loading && promotions.length > 0 && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Valid Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell className="font-medium">{promo.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {promo.type.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {promo.discountType === "percentage"
                      ? `${promo.discountValue}%`
                      : formatCurrency(promo.discountValue)}
                  </TableCell>
                  <TableCell>
                    {promo.code ? (
                      <Badge variant="secondary" className="font-mono">
                        {promo.code}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(promo.validFrom)} — {formatDate(promo.validUntil)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={promo.active ? "default" : "secondary"}>
                      {promo.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(promo)}
                        title="Edit"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-red-500 hover:text-red-600"
                        onClick={() => setDeleteTarget(promo)}
                        title="Delete"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Promotion" : "Create Promotion"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update promotion details."
                : "Set up a new discount or coupon."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="promo-name">Name *</Label>
              <Input
                id="promo-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Summer Sale"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="promo-type">Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as PromotionType })}>
                  <SelectTrigger id="promo-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {promotionTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="promo-dtype">Discount Type</Label>
                <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v as DiscountType })}>
                  <SelectTrigger id="promo-dtype">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {discountTypes.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="promo-value">Discount Value *</Label>
                <Input
                  id="promo-value"
                  type="number"
                  step="0.01"
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  placeholder={form.discountType === "percentage" ? "10" : "5.00"}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="promo-min">Min Order (GH₵)</Label>
                <Input
                  id="promo-min"
                  type="number"
                  step="0.01"
                  value={form.minOrder}
                  onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="promo-max">Max Discount (GH₵)</Label>
                <Input
                  id="promo-max"
                  type="number"
                  step="0.01"
                  value={form.maxDiscount}
                  onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="promo-code">Coupon Code</Label>
              <Input
                id="promo-code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER2024"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="promo-from">Valid From</Label>
                <Input
                  id="promo-from"
                  type="date"
                  value={form.validFrom}
                  onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="promo-until">Valid Until</Label>
                <Input
                  id="promo-until"
                  type="date"
                  value={form.validUntil}
                  onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="promo-auto">Auto-Apply</Label>
              <Switch
                id="promo-auto"
                checked={form.autoApply}
                onCheckedChange={(v) => setForm({ ...form, autoApply: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="promo-active">Active</Label>
              <Switch
                id="promo-active"
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim() || !form.discountValue}>
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
        title="Delete Promotion"
        description={`Are you sure you want to delete "${deleteTarget?.name || "this promotion"}"?`}
        onConfirm={handleDelete}
        variant="destructive"
        confirmLabel="Delete"
        isLoading={deleting}
      />
    </div>
  );
}
