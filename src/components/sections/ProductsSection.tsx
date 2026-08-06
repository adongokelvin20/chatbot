"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Package,
  Pencil,
  Copy,
  ToggleLeft,
  ToggleRight,
  Star,
  StarOff,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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

// ---------- Types ----------

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description?: string | null;
  sku?: string | null;
  price: number;
  salePrice?: number | null;
  stock: number;
  colors?: string[] | null;
  sizes?: string[] | null;
  images?: string[] | null;
  active: boolean;
  featured: boolean;
  categoryId?: string | null;
  category?: Category | null;
  createdAt: string;
}

interface ProductFormData {
  name: string;
  description: string;
  categoryId: string;
  sku: string;
  price: string;
  salePrice: string;
  stock: string;
  colors: string;
  sizes: string;
  images: string;
  active: boolean;
  featured: boolean;
}

const emptyForm: ProductFormData = {
  name: "",
  description: "",
  categoryId: "",
  sku: "",
  price: "",
  salePrice: "",
  stock: "",
  colors: "",
  sizes: "",
  images: "",
  active: true,
  featured: false,
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// ---------- Component ----------

export default function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");

  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ---------- Data Fetching ----------

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter !== "all") params.set("categoryId", categoryFilter);
      if (statusFilter === "active") params.set("active", "true");
      if (statusFilter === "inactive") params.set("active", "false");
      if (featuredFilter === "featured") params.set("featured", "true");

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      const data = json.data;
      setProducts(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    }
  }, [search, categoryFilter, statusFilter, featuredFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories?active=false");
      if (!res.ok) return;
      const json = await res.json();
      setCategories(Array.isArray(json.data) ? json.data : []);
    } catch {
      // categories are optional, don't block
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchProducts(), fetchCategories()]);
    setLoading(false);
  }, [fetchProducts, fetchCategories]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ---------- Helpers ----------

  function openCreate() {
    setEditingProduct(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || "",
      categoryId: product.categoryId || "",
      sku: product.sku || "",
      price: String(product.price),
      salePrice: product.salePrice ? String(product.salePrice) : "",
      stock: String(product.stock),
      colors: product.colors?.join(", ") || "",
      sizes: product.sizes?.join(", ") || "",
      images: product.images?.join(", ") || "",
      active: product.active,
      featured: product.featured,
    });
    setFormOpen(true);
  }

  // ---------- CRUD ----------

  async function handleSave() {
    if (!form.name.trim() || !form.price) return;
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        categoryId: form.categoryId || undefined,
        sku: form.sku.trim() || undefined,
        price: parseFloat(form.price) || 0,
        salePrice: form.salePrice ? parseFloat(form.salePrice) || undefined : undefined,
        stock: parseInt(form.stock, 10) || 0,
        colors: form.colors
          ? form.colors.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        sizes: form.sizes
          ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        images: form.images
          ? form.images.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        active: form.active,
        featured: form.featured,
      };

      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save product");

      setFormOpen(false);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDuplicate(product: Product) {
    try {
      const res = await fetch(`/api/products/${product.id}/duplicate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to duplicate");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to duplicate");
    }
  }

  async function handleToggleStatus(product: Product) {
    try {
      const res = await fetch(`/api/products/${product.id}/toggle-status`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  }

  async function handleToggleFeatured(product: Product) {
    try {
      const res = await fetch(`/api/products/${product.id}/toggle-featured`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to toggle featured");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setDeleteTarget(null);
      await loadAll();
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
        title="Products"
        description="Manage your product catalog"
        action={
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            Add Product
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Featured" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="featured">Featured Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border bg-card p-4 space-y-3"
            >
              <Skeleton className="aspect-square w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <EmptyState
          icon={Package}
          title="No products found"
          description={
            search || categoryFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Get started by adding your first product."
          }
          action={
            !search && categoryFilter === "all" ? (
              <Button onClick={openCreate}>
                <Plus className="mr-2 size-4" />
                Add Product
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Product Grid */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
            >
              {/* Image */}
              <div className="relative mb-3 aspect-square overflow-hidden rounded-md bg-muted">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <Package className="size-10 text-muted-foreground/40" />
                  </div>
                )}
                {/* Badges */}
                <div className="absolute left-2 top-2 flex flex-col gap-1">
                  {!product.active && (
                    <Badge variant="secondary" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                  {product.featured && (
                    <Badge className="bg-amber-500 text-xs text-white">
                      Featured
                    </Badge>
                  )}
                </div>
                {product.stock === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Badge variant="destructive">Out of Stock</Badge>
                  </div>
                )}
              </div>

              {/* Info */}
              <h3 className="truncate text-sm font-semibold">{product.name}</h3>
              <p className="text-xs text-muted-foreground">
                {product.category?.name || "Uncategorized"}
              </p>

              {/* Price */}
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-sm font-bold">
                  {formatCurrency(product.salePrice ?? product.price)}
                </span>
                {product.salePrice && product.salePrice < product.price && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>

              {/* Colors & Sizes */}
              <div className="mt-1 flex flex-wrap gap-1 text-xs text-muted-foreground">
                {product.colors && product.colors.length > 0 && (
                  <span>Colors: {product.colors.length}</span>
                )}
                {product.sizes && product.sizes.length > 0 && (
                  <span>Sizes: {product.sizes.length}</span>
                )}
              </div>

              {/* Stock */}
              <p
                className={`mt-1 text-xs ${product.stock === 0 ? "text-red-500 font-medium" : product.stock <= 5 ? "text-amber-500" : "text-muted-foreground"}`}
              >
                Stock: {product.stock}
              </p>

              {/* Actions */}
              <div className="mt-3 flex items-center gap-1 border-t pt-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => openEdit(product)}
                  title="Edit"
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => handleDuplicate(product)}
                  title="Duplicate"
                >
                  <Copy className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => handleToggleStatus(product)}
                  title={product.active ? "Deactivate" : "Activate"}
                >
                  {product.active ? (
                    <ToggleRight className="size-3.5" />
                  ) : (
                    <ToggleLeft className="size-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => handleToggleFeatured(product)}
                  title={product.featured ? "Unfeature" : "Feature"}
                >
                  {product.featured ? (
                    <Star className="size-3.5 fill-amber-500 text-amber-500" />
                  ) : (
                    <StarOff className="size-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-red-500 hover:text-red-600"
                  onClick={() => setDeleteTarget(product)}
                  title="Delete"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Update product details below."
                : "Fill in the details to create a new product."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="prod-name">Name *</Label>
              <Input
                id="prod-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Product name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prod-desc">Description</Label>
              <Textarea
                id="prod-desc"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Product description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="prod-category">Category</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) =>
                    setForm({ ...form, categoryId: v })
                  }
                >
                  <SelectTrigger id="prod-category">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prod-sku">SKU</Label>
                <Input
                  id="prod-sku"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="SKU-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="prod-price">Price *</Label>
                <Input
                  id="prod-price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prod-sale">Sale Price</Label>
                <Input
                  id="prod-sale"
                  type="number"
                  step="0.01"
                  value={form.salePrice}
                  onChange={(e) =>
                    setForm({ ...form, salePrice: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prod-stock">Stock</Label>
                <Input
                  id="prod-stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="prod-colors">Colors</Label>
                <Input
                  id="prod-colors"
                  value={form.colors}
                  onChange={(e) => setForm({ ...form, colors: e.target.value })}
                  placeholder="Red, Blue, Green"
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prod-sizes">Sizes</Label>
                <Input
                  id="prod-sizes"
                  value={form.sizes}
                  onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                  placeholder="S, M, L, XL"
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prod-images">Image URLs</Label>
              <Textarea
                id="prod-images"
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated image URLs
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="prod-active">Active</Label>
              <Switch
                id="prod-active"
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="prod-featured">Featured</Label>
              <Switch
                id="prod-featured"
                checked={form.featured}
                onCheckedChange={(v) => setForm({ ...form, featured: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim() || !form.price}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editingProduct ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteTarget?.name || "this product"}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        variant="destructive"
        confirmLabel="Delete"
        isLoading={deleting}
      />
    </div>
  );
}
