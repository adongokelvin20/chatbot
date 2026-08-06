"use client";

import React, { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  Shield,
  ShieldCheck,
  UserCog,
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
import { cn } from "@/lib/utils";
import type { StaffRole, StaffStatus } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Staff {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  status: StaffStatus;
  createdAt: string;
}

interface StaffFormData {
  name: string;
  email: string;
  role: StaffRole;
  status: StaffStatus;
}

// ---------------------------------------------------------------------------
// Demo Data
// ---------------------------------------------------------------------------

const DEMO_STAFF: Staff[] = [
  {
    id: "s1",
    name: "Alice Uwimana",
    email: "alice@umuhozafashion.rw",
    role: "owner",
    status: "active",
    createdAt: "2023-06-15T00:00:00Z",
  },
  {
    id: "s2",
    name: "Jean Marie Vianney",
    email: "jmv@umuhozafashion.rw",
    role: "admin",
    status: "active",
    createdAt: "2024-01-10T00:00:00Z",
  },
  {
    id: "s3",
    name: "Diane Mugisha",
    email: "diane.m@umuhozafashion.rw",
    role: "staff",
    status: "active",
    createdAt: "2024-08-20T00:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROLE_CONFIG: Record<StaffRole, { label: string; icon: React.ElementType; className: string }> = {
  owner: {
    label: "Owner",
    icon: Shield,
    className: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
  },
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  },
  staff: {
    label: "Staff",
    icon: UserCog,
    className: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  },
};

const emptyForm: StaffFormData = {
  name: "",
  email: "",
  role: "staff",
  status: "active",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StaffSection() {
  const [staff, setStaff] = useState<Staff[]>(DEMO_STAFF);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<StaffFormData>(emptyForm);
  const [editTarget, setEditTarget] = useState<Staff | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);

  function openAdd() {
    setFormMode("add");
    setFormData(emptyForm);
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(s: Staff) {
    setFormMode("edit");
    setEditTarget(s);
    setFormData({
      name: s.name,
      email: s.email,
      role: s.role,
      status: s.status,
    });
    setFormOpen(true);
  }

  function handleSave() {
    if (formMode === "add") {
      setStaff((prev) => [
        ...prev,
        {
          id: `s-${Date.now()}`,
          ...formData,
          createdAt: new Date().toISOString(),
        },
      ]);
    } else if (editTarget) {
      setStaff((prev) =>
        prev.map((s) => (s.id === editTarget.id ? { ...s, ...formData } : s))
      );
    }
    setFormOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setStaff((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  function toggleStatus(s: Staff) {
    setStaff((prev) =>
      prev.map((st) =>
        st.id === s.id
          ? { ...st, status: (st.status === "active" ? "inactive" : "active") as StaffStatus }
          : st
      )
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff"
        description="Manage team members and permissions"
        action={
          <Button onClick={openAdd}>
            <Plus className="mr-2 size-4" />
            Add Staff
          </Button>
        }
      />

      {staff.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="No staff members"
          description="Add your first team member."
          action={
            <Button size="sm" onClick={openAdd}>
              <Plus className="mr-2 size-4" />
              Add Staff
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((s) => {
                  const roleConfig = ROLE_CONFIG[s.role];
                  const RoleIcon = roleConfig.icon;
                  return (
                    <TableRow key={s.id} className={s.status === "inactive" ? "opacity-60" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-muted font-semibold text-xs text-muted-foreground">
                            {s.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <span className="font-medium">{s.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                        {s.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("gap-1", roleConfig.className)}>
                          <RoleIcon className="size-3" />
                          {roleConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={s.status === "active" ? "default" : "secondary"}
                          className={s.status === "active" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                        >
                          {s.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toggleStatus(s)}>
                              {s.status === "active" ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEdit(s)}>
                              <Pencil className="mr-2 size-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setDeleteTarget(s);
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formMode === "add" ? "Add Staff Member" : "Edit Staff Member"}</DialogTitle>
            <DialogDescription>
              {formMode === "add"
                ? "Add a new team member to your store."
                : "Update staff member details."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="s-name">Name *</Label>
              <Input
                id="s-name"
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-email">Email *</Label>
              <Input
                id="s-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                placeholder="name@store.rw"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v) => setFormData((f) => ({ ...f, role: v as StaffRole }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData((f) => ({ ...f, status: v as StaffStatus }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.name.trim() || !formData.email.trim()}>
              {formMode === "add" ? "Add Staff" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Staff Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
