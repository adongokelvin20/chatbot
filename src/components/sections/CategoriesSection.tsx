"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  FolderOpen,
  Package,
  MoreVertical,
  Search,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  active: boolean;
  createdAt: string;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  active: boolean;
}

const EMPTY_FORM: CategoryFormData = {
  name: "",
  slug: "",
  description: "",
  active: true,
};

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_CATEGORIES: Category[] = [
  {
    id: "cat-men",
    name: "Men",
    slug: "men",
    description: "Men's clothing including t-shirts, jeans, jackets, and accessories.",
    productCount: 48,
    active: true,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "cat-women",
    name: "Women",
    slug: "women",
    description:
      "Women's fashion featuring dresses, tops, jeans, and seasonal collections.",
    productCount: 72,
    active: true,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "cat-kids",
    name: "Kids",
    slug: "kids",
    description:
      "Fun and durable clothing for children of all ages. Comfortable and stylish.",
    productCount: 35,
    active: true,
    createdAt: "2024-02-01T10:00:00Z",
  },
  {
    id: "cat-accessories",
    name: "Accessories",
    slug: "accessories",
    description:
      "Complete your look with our accessories range: bags, scarves, belts, and more.",
    productCount: 24,
    active: true,
    createdAt: "2024-02-15T10:00:00Z",
  },
  {
    id: "cat-shoes",
    name: "Shoes",
    slug: "shoes",
    description:
      "Footwear for every occasion from casual sneakers to formal shoes.",
    productCount: 18,
    active: true,
    createdAt: "2024-03-01T10:00:00Z",
  },
  {
    id: "cat-sale",
    name: "Sale",
    slug: "sale",
    description: "Discounted items and clearance sale products.",
    productCount: 12,
    active: false,
    createdAt: "2024-06-01T10:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function CategoriesSection() {
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");

  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryFormData>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // Fetch categories
  const { isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/categories?businessId=DEMO");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setCategories(json.data);
            return json.data;
          }
        }
      } catch {
        // fallback
      }
      await new Promise((r) => setTimeout(r, 500));
      setCategories(DEMO_CATEGORIES);
      return DEMO_CATEGORIES;
    },
    staleTime: 30_000,
  });

  // Filtered categories
  const filteredCategories = useMemo(() => {
    const source = categories.length > 0 ? categories : DEMO_CATEGORIES;
    if (!search.trim()) return source;
    const q = search.toLowerCase();
    return source.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [categories, search]);

  // Form helpers
  function openAddForm() {
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEditForm(category: Category) {
    setEditingCategory(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      active: category.active,
    });
    setFormOpen(true);
  }

  function handleNameChange(name: string) {
    const slug = editingCategory
      ? form.slug
      : slugify(name);
    setForm({ ...form, name, slug });
  }

  function handleSave() {
    if (!form.name.trim()) return;
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: form.name,
                slug: form.slug || slugify(form.name),
                description: form.description,
                active: form.active,
              }
            : c
        )
      );
    } else {
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: form.name,
        slug: form.slug || slugify(form.name),
        description: form.description,
        productCount: 0,
        active: form.active,
        createdAt: new Date().toISOString(),
      };
      setCategories((prev) => [...prev, newCategory]);
    }
    setFormOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  function handleToggleStatus(category: Category) {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === category.id ? { ...c, active: !c.active } : c
      )
    );
  }

  const totalProducts = useMemo(() => {
    const source = categories.length > 0 ? categories : DEMO_CATEGORIES;
    return source.reduce((sum, c) => sum + c.productCount, 0);
  }, [categories]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Categories"
        description={`${totalProducts} products across ${(categories.length > 0 ? categories : DEMO_CATEGORIES).length} categories`}
        action={
          <Button onClick={openAddForm}>
            <Plus className="size-4" />
            Add Category
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Categories Table */}
      {isLoading ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-4 w-16" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, rowIdx) => (
                <TableRow key={rowIdx}>
                  {Array.from({ length: 5 }).map((_, colIdx) => (
                    <TableCell key={colIdx}>
                      <Skeleton className="h-5 w-full max-w-[140px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : filteredCategories.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No categories found"
          description={
            search
              ? "No categories match your search."
              : "Create your first category to start organizing products."
          }
          action={
            !search ? (
              <Button onClick={openAddForm}>
                <Plus className="size-4" />
                Add Category
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%]">Name</TableHead>
                <TableHead className="w-[15%]">Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[10%] text-center">Products</TableHead>
                <TableHead className="w-[10%] text-center">Status</TableHead>
                <TableHead className="w-[10%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                        <FolderOpen className="size-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                      /{category.slug}
                    </code>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <p className="truncate text-sm text-muted-foreground">
                      {category.description || "—"}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="font-mono">
                      <Package className="size-3 mr-1" />
                      {category.productCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={
                        category.active
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                          : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                      }
                    >
                      {category.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreVertical className="size-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => openEditForm(category)}>
                          <Pencil className="size-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(category)}>
                          {category.active ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(category)}
                        >
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update category details below."
                : "Create a new category to organize your products."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="cat-name">Category Name *</Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Men, Women, Kids"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="cat-slug">URL Slug</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  /
                </span>
                <Input
                  id="cat-slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="category-slug"
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Auto-generated from the name. You can customize it.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Brief description of this category..."
                rows={3}
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="cat-active" className="text-sm">
                  Active
                </Label>
                <p className="text-xs text-muted-foreground">
                  Category will be visible on the storefront
                </p>
              </div>
              <Switch
                id="cat-active"
                checked={form.active}
                onCheckedChange={(checked) =>
                  setForm({ ...form, active: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!form.name.trim()}>
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Products in this category will become uncategorized. This action cannot be undone.`}
        onConfirm={handleDelete}
        variant="destructive"
        confirmLabel="Delete"
      />
    </div>
  );
}
