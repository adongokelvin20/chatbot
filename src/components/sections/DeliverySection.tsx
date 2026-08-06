"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  Truck,
  MapPin,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DeliveryZone {
  id: string;
  city: string;
  fee: number;
  estimatedDays: string;
  courierNotes: string;
  active: boolean;
}

interface DeliveryFormData {
  city: string;
  fee: string;
  estimatedDays: string;
  courierNotes: string;
  active: boolean;
}

// ---------------------------------------------------------------------------
// Demo Data
// ---------------------------------------------------------------------------

const DEMO_ZONES: DeliveryZone[] = [
  {
    id: "dz1",
    city: "Kigali",
    fee: 2000,
    estimatedDays: "1-2",
    courierNotes: "Same-day delivery for orders before 12 PM. Use Kigali Express courier.",
    active: true,
  },
  {
    id: "dz2",
    city: "Kigali Outskirts",
    fee: 3500,
    estimatedDays: "2-3",
    courierNotes: "Areas: Kicukiro outer, Gasabo outer, Nyarugenge outer. Use City Rider.",
    active: true,
  },
  {
    id: "dz3",
    city: "Musanze",
    fee: 5000,
    estimatedDays: "3-5",
    courierNotes: "Volcano Express. Deliveries on Mon, Wed, Fri only.",
    active: true,
  },
  {
    id: "dz4",
    city: "Rubavu",
    fee: 6000,
    estimatedDays: "3-5",
    courierNotes: "Lake Side Logistics. Road conditions may affect delivery time.",
    active: true,
  },
  {
    id: "dz5",
    city: "Gisenyi",
    fee: 6000,
    estimatedDays: "4-6",
    courierNotes: "Shared delivery with Rubavu route on Tue and Sat.",
    active: false,
  },
];

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

const emptyForm: DeliveryFormData = {
  city: "",
  fee: "",
  estimatedDays: "",
  courierNotes: "",
  active: true,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DeliverySection() {
  const [zones, setZones] = useState<DeliveryZone[]>(DEMO_ZONES);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<DeliveryFormData>(emptyForm);
  const [editTarget, setEditTarget] = useState<DeliveryZone | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeliveryZone | null>(null);

  function openAdd() {
    setFormMode("add");
    setFormData(emptyForm);
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(zone: DeliveryZone) {
    setFormMode("edit");
    setEditTarget(zone);
    setFormData({
      city: zone.city,
      fee: String(zone.fee),
      estimatedDays: zone.estimatedDays,
      courierNotes: zone.courierNotes,
      active: zone.active,
    });
    setFormOpen(true);
  }

  function handleSave() {
    if (formMode === "add") {
      const newZone: DeliveryZone = {
        id: `dz-${Date.now()}`,
        city: formData.city,
        fee: Number(formData.fee) || 0,
        estimatedDays: formData.estimatedDays,
        courierNotes: formData.courierNotes,
        active: formData.active,
      };
      setZones((prev) => [...prev, newZone]);
    } else if (editTarget) {
      setZones((prev) =>
        prev.map((z) =>
          z.id === editTarget.id
            ? {
                ...z,
                city: formData.city,
                fee: Number(formData.fee) || 0,
                estimatedDays: formData.estimatedDays,
                courierNotes: formData.courierNotes,
                active: formData.active,
              }
            : z
        )
      );
    }
    setFormOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setZones((prev) => prev.filter((z) => z.id !== deleteTarget.id));
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  function toggleActive(zone: DeliveryZone) {
    setZones((prev) =>
      prev.map((z) => (z.id === zone.id ? { ...z, active: !z.active } : z))
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery Zones"
        description="Manage delivery areas and fees"
        action={
          <Button onClick={openAdd}>
            <Plus className="mr-2 size-4" />
            Add Zone
          </Button>
        }
      />

      {zones.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No delivery zones"
          description="Add your first delivery zone to get started."
          action={
            <Button size="sm" onClick={openAdd}>
              <Plus className="mr-2 size-4" />
              Add Zone
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>City</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead>Est. Delivery</TableHead>
                  <TableHead className="hidden md:table-cell">Courier Notes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {zones.map((zone) => (
                  <TableRow key={zone.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-muted-foreground" />
                        <span className="font-medium">{zone.city}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatRWF(zone.fee)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <Truck className="size-3 mr-1" />
                        {zone.estimatedDays} days
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[250px] truncate text-muted-foreground text-sm">
                      {zone.courierNotes}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={zone.active ? "default" : "secondary"}
                        className={zone.active ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                      >
                        {zone.active ? "Active" : "Inactive"}
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
                          <DropdownMenuItem onClick={() => toggleActive(zone)}>
                            {zone.active ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(zone)}>
                            <Pencil className="mr-2 size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setDeleteTarget(zone);
                              setDeleteOpen(true);
                            }}
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

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formMode === "add" ? "Add Delivery Zone" : "Edit Delivery Zone"}</DialogTitle>
            <DialogDescription>
              {formMode === "add"
                ? "Add a new delivery zone with fees and timing."
                : "Update delivery zone details."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="city">City / Area *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData((f) => ({ ...f, city: e.target.value }))}
                placeholder="e.g., Kigali"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fee">Delivery Fee (RWF) *</Label>
                <Input
                  id="fee"
                  type="number"
                  value={formData.fee}
                  onChange={(e) => setFormData((f) => ({ ...f, fee: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="days">Est. Days *</Label>
                <Input
                  id="days"
                  value={formData.estimatedDays}
                  onChange={(e) => setFormData((f) => ({ ...f, estimatedDays: e.target.value }))}
                  placeholder="e.g., 1-2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Courier Notes</Label>
              <Input
                id="notes"
                value={formData.courierNotes}
                onChange={(e) => setFormData((f) => ({ ...f, courierNotes: e.target.value }))}
                placeholder="Courier company, delivery schedule..."
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">Enable this zone for delivery</p>
              </div>
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData((f) => ({ ...f, active: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.city.trim() || !formData.fee}>
              {formMode === "add" ? "Add Zone" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Delivery Zone</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the <strong>{deleteTarget?.city}</strong> delivery zone? This action cannot be undone.
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
