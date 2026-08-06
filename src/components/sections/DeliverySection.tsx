"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Truck,
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

// ---------- Types ----------

interface DeliveryZone {
  id: string;
  city: string;
  fee: number;
  estimatedDays: string;
  courierNotes?: string | null;
  active: boolean;
  createdAt: string;
}

interface DeliveryFormData {
  city: string;
  fee: string;
  estimatedDays: string;
  courierNotes: string;
  active: boolean;
}

const emptyForm: DeliveryFormData = {
  city: "",
  fee: "",
  estimatedDays: "3-5",
  courierNotes: "",
  active: true,
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// ---------- Component ----------

export default function DeliverySection() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DeliveryZone | null>(null);
  const [form, setForm] = useState<DeliveryFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<DeliveryZone | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ---------- Data Fetching ----------

  const fetchZones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/delivery-zones?active=false");
      if (!res.ok) throw new Error("Failed to fetch delivery zones");
      const json = await res.json();
      setZones(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load delivery zones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  // ---------- Helpers ----------

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(zone: DeliveryZone) {
    setEditing(zone);
    setForm({
      city: zone.city,
      fee: String(zone.fee),
      estimatedDays: zone.estimatedDays,
      courierNotes: zone.courierNotes || "",
      active: zone.active,
    });
    setFormOpen(true);
  }

  // ---------- CRUD ----------

  async function handleSave() {
    if (!form.city.trim()) return;
    setSaving(true);
    try {
      const body = {
        city: form.city.trim(),
        fee: parseFloat(form.fee) || 0,
        estimatedDays: form.estimatedDays.trim() || "3-5",
        courierNotes: form.courierNotes.trim() || undefined,
        active: form.active,
      };

      const url = editing
        ? `/api/delivery-zones/${editing.id}`
        : "/api/delivery-zones";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save delivery zone");
      setFormOpen(false);
      await fetchZones();
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
      const res = await fetch(`/api/delivery-zones/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete delivery zone");
      setDeleteTarget(null);
      await fetchZones();
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
        title="Delivery Zones"
        description="Manage delivery areas and fees"
        action={
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            Add Zone
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
                <TableHead>City</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Est. Days</TableHead>
                <TableHead>Courier Notes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
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
      {!loading && zones.length === 0 && (
        <EmptyState
          icon={Truck}
          title="No delivery zones"
          description="Add delivery zones to configure shipping fees and estimated delivery times."
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-2 size-4" />
              Add Zone
            </Button>
          }
        />
      )}

      {/* Table */}
      {!loading && zones.length > 0 && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>City</TableHead>
                <TableHead className="text-right">Fee</TableHead>
                <TableHead>Est. Days</TableHead>
                <TableHead>Courier Notes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.city}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(zone.fee)}
                  </TableCell>
                  <TableCell>{zone.estimatedDays} days</TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {zone.courierNotes || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={zone.active ? "default" : "secondary"}>
                      {zone.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(zone)}
                        title="Edit"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-red-500 hover:text-red-600"
                        onClick={() => setDeleteTarget(zone)}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Delivery Zone" : "Add Delivery Zone"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update delivery zone details."
                : "Configure a new delivery zone."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="dz-city">City *</Label>
              <Input
                id="dz-city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dz-fee">Delivery Fee ($)</Label>
                <Input
                  id="dz-fee"
                  type="number"
                  step="0.01"
                  value={form.fee}
                  onChange={(e) => setForm({ ...form, fee: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dz-days">Est. Days</Label>
                <Input
                  id="dz-days"
                  value={form.estimatedDays}
                  onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })}
                  placeholder="3-5"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dz-notes">Courier Notes</Label>
              <Input
                id="dz-notes"
                value={form.courierNotes}
                onChange={(e) => setForm({ ...form, courierNotes: e.target.value })}
                placeholder="Any special delivery notes"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dz-active">Active</Label>
              <Switch
                id="dz-active"
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.city.trim()}
            >
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
        title="Delete Delivery Zone"
        description={`Are you sure you want to delete the delivery zone for "${deleteTarget?.city || ""}"?`}
        onConfirm={handleDelete}
        variant="destructive"
        confirmLabel="Delete"
        isLoading={deleting}
      />
    </div>
  );
}
