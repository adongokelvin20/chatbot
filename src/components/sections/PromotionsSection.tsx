"use client";

import React, { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  Tag,
  Calendar,
  Percent,
  Zap,
  Gift,
  Ticket,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import type { PromotionType, DiscountType } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Promotion {
  id: string;
  name: string;
  type: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  minOrder?: number;
  maxDiscount?: number;
  code?: string;
  validFrom: string;
  validUntil: string;
  autoApply: boolean;
  description?: string;
  active: boolean;
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
}

// ---------------------------------------------------------------------------
// Demo Data
// ---------------------------------------------------------------------------

const DEMO_PROMOTIONS: Promotion[] = [
  {
    id: "promo1",
    name: "New Year Sale",
    type: "discount",
    discountType: "percentage",
    discountValue: 15,
    minOrder: 20000,
    maxDiscount: 30000,
    code: undefined,
    validFrom: "2025-01-01",
    validUntil: "2025-01-31",
    autoApply: true,
    description: "Start the new year in style! 15% off all items over 20,000 RWF.",
    active: true,
  },
  {
    id: "promo2",
    name: "Flash Friday",
    type: "flash_sale",
    discountType: "percentage",
    discountValue: 25,
    minOrder: 10000,
    maxDiscount: 15000,
    code: "FLASH25",
    validFrom: "2025-01-17",
    validUntil: "2025-01-17",
    autoApply: false,
    description: "Every Friday, 25% off for 6 hours only (noon to 6 PM). Use code FLASH25.",
    active: true,
  },
  {
    id: "promo3",
    name: "Welcome Coupon",
    type: "coupon",
    discountType: "fixed",
    discountValue: 5000,
    minOrder: 15000,
    code: "KARIBU5000",
    validFrom: "2025-01-01",
    validUntil: "2025-06-30",
    autoApply: false,
    description: "New customers get 5,000 RWF off their first order. Minimum order 15,000 RWF.",
    active: true,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<PromotionType, { label: string; icon: React.ElementType; color: string }> = {
  discount: { label: "Discount", icon: Percent, color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  flash_sale: { label: "Flash Sale", icon: Zap, color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  coupon: { label: "Coupon", icon: Ticket, color: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300" },
  limited_offer: { label: "Limited Offer", icon: Gift, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
};

function formatDiscount(promo: Promotion): string {
  return promo.discountType === "percentage"
    ? `${promo.discountValue}% off`
    : `${new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(promo.discountValue)} off`;
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
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PromotionsSection() {
  const [promotions, setPromotions] = useState<Promotion[]>(DEMO_PROMOTIONS);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<PromotionFormData>(emptyForm);
  const [editTarget, setEditTarget] = useState<Promotion | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);

  function openAdd() {
    setFormMode("add");
    setFormData(emptyForm);
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(promo: Promotion) {
    setFormMode("edit");
    setEditTarget(promo);
    setFormData({
      name: promo.name,
      type: promo.type,
      discountType: promo.discountType,
      discountValue: String(promo.discountValue),
      minOrder: promo.minOrder ? String(promo.minOrder) : "",
      maxDiscount: promo.maxDiscount ? String(promo.maxDiscount) : "",
      code: promo.code ?? "",
      validFrom: promo.validFrom,
      validUntil: promo.validUntil,
      autoApply: promo.autoApply,
      description: promo.description ?? "",
    });
    setFormOpen(true);
  }

  function handleSave() {
    const data = {
      name: formData.name,
      type: formData.type,
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue) || 0,
      minOrder: formData.minOrder ? Number(formData.minOrder) : undefined,
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
      code: formData.code.trim() || undefined,
      validFrom: formData.validFrom,
      validUntil: formData.validUntil,
      autoApply: formData.autoApply,
      description: formData.description.trim() || undefined,
      active: true,
    };

    if (formMode === "add") {
      setPromotions((prev) => [...prev, { id: `promo-${Date.now()}`, ...data }]);
    } else if (editTarget) {
      setPromotions((prev) =>
        prev.map((p) => (p.id === editTarget.id ? { ...p, ...data } : p))
      );
    }
    setFormOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setPromotions((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  function toggleActive(promo: Promotion) {
    setPromotions((prev) =>
      prev.map((p) => (p.id === promo.id ? { ...p, active: !p.active } : p))
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotions"
        description="Create and manage discounts and offers"
        action={
          <Button onClick={openAdd}>
            <Plus className="mr-2 size-4" />
            Create Promotion
          </Button>
        }
      />

      {promotions.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No promotions"
          description="Create a promotion to attract customers."
          action={
            <Button size="sm" onClick={openAdd}>
              <Plus className="mr-2 size-4" />
              Create Promotion
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Promotion</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead className="hidden md:table-cell">Code</TableHead>
                  <TableHead className="hidden lg:table-cell">Valid Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promo) => {
                  const typeConfig = TYPE_CONFIG[promo.type];
                  const TypeIcon = typeConfig.icon;
                  return (
                    <TableRow key={promo.id} className={!promo.active ? "opacity-60" : ""}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{promo.name}</p>
                          {promo.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate">
                              {promo.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className={typeConfig.color}>
                          <TypeIcon className="size-3 mr-1" />
                          {typeConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{formatDiscount(promo)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {promo.code ? (
                          <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono">
                            {promo.code}
                          </code>
                        ) : (
                          <span className="text-xs text-muted-foreground">Auto-apply</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="size-3" />
                          {promo.validFrom} — {promo.validUntil}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={promo.active ? "default" : "secondary"}
                          className={promo.active ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                        >
                          {promo.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toggleActive(promo)}>
                              {promo.active ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(promo)}>
                              <Pencil className="mr-2 size-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setDeleteTarget(promo);
                                setDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 size-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{formMode === "add" ? "Create Promotion" : "Edit Promotion"}</DialogTitle>
            <DialogDescription>
              {formMode === "add" ? "Set up a new promotion for your store." : "Update promotion details."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Holiday Sale"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData((f) => ({ ...f, type: v as PromotionType }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">Discount</SelectItem>
                    <SelectItem value="flash_sale">Flash Sale</SelectItem>
                    <SelectItem value="coupon">Coupon</SelectItem>
                    <SelectItem value="limited_offer">Limited Offer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Discount Type *</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(v) => setFormData((f) => ({ ...f, discountType: v as DiscountType }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (RWF)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Value *</Label>
                <Input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData((f) => ({ ...f, discountValue: e.target.value }))}
                  placeholder={formData.discountType === "percentage" ? "e.g., 15" : "e.g., 5000"}
                />
              </div>
              <div className="space-y-2">
                <Label>Min Order (RWF)</Label>
                <Input
                  type="number"
                  value={formData.minOrder}
                  onChange={(e) => setFormData((f) => ({ ...f, minOrder: e.target.value }))}
                  placeholder="e.g., 20000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Discount (RWF)</Label>
                <Input
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData((f) => ({ ...f, maxDiscount: e.target.value }))}
                  placeholder="e.g., 30000"
                />
              </div>
              <div className="space-y-2">
                <Label>Promo Code</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData((f) => ({ ...f, code: e.target.value }))}
                  placeholder="e.g., SALE25"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valid From *</Label>
                <Input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData((f) => ({ ...f, validFrom: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Valid Until *</Label>
                <Input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData((f) => ({ ...f, validUntil: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of the promotion..."
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Apply</Label>
                <p className="text-xs text-muted-foreground">Automatically apply at checkout</p>
              </div>
              <Switch
                checked={formData.autoApply}
                onCheckedChange={(checked) => setFormData((f) => ({ ...f, autoApply: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.name.trim() || !formData.discountValue || !formData.validFrom || !formData.validUntil}>
              {formMode === "add" ? "Create" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Promotion</DialogTitle>
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
