"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Pencil,
  Copy,
  ToggleLeft,
  Star,
  StarOff,
  Trash2,
  PackageX,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/common/PageHeader";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  category: string;
  sku: string;
  price: number;
  salePrice: number | null;
  stock: number;
  colors: string[];
  sizes: string[];
  images: string[];
  active: boolean;
  featured: boolean;
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

const EMPTY_FORM: ProductFormData = {
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

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

const DEMO_CATEGORIES = [
  { id: "cat-men", name: "Men", slug: "men" },
  { id: "cat-women", name: "Women", slug: "women" },
  { id: "cat-kids", name: "Kids", slug: "kids" },
  { id: "cat-accessories", name: "Accessories", slug: "accessories" },
  { id: "cat-shoes", name: "Shoes", slug: "shoes" },
];

const DEMO_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Classic Cotton Crew Neck T-Shirt",
    description:
      "Premium cotton crew neck t-shirt. Soft, breathable, and perfect for everyday wear. Available in multiple colors.",
    categoryId: "cat-men",
    category: "Men",
    sku: "M-TSH-CCN-S",
    price: 39.99,
    salePrice: 29.99,
    stock: 245,
    colors: ["Black", "White", "Navy", "Gray"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: ["/placeholder-product.jpg"],
    active: true,
    featured: true,
    createdAt: "2024-10-15T10:00:00Z",
  },
  {
    id: "prod-2",
    name: "High-Waisted Skinny Jeans",
    description:
      "Figure-flattering high-waisted skinny jeans with stretch fabric for all-day comfort. Classic five-pocket design.",
    categoryId: "cat-women",
    category: "Women",
    sku: "W-JNS-HWJ-28",
    price: 79.99,
    salePrice: null,
    stock: 178,
    colors: ["Dark Blue", "Black", "Light Wash"],
    sizes: ["24", "26", "28", "30", "32"],
    images: ["/placeholder-product.jpg"],
    active: true,
    featured: true,
    createdAt: "2024-10-12T10:00:00Z",
  },
  {
    id: "prod-3",
    name: "Oversized Graphic Hoodie",
    description:
      "Trendy oversized hoodie with front graphic print. Kangaroo pocket and adjustable drawstring hood. Fleece lined.",
    categoryId: "cat-men",
    category: "Men",
    sku: "M-HOD-OVH-M",
    price: 69.99,
    salePrice: 54.99,
    stock: 92,
    colors: ["Charcoal", "Heather Gray", "Burgundy"],
    sizes: ["S", "M", "L", "XL"],
    images: ["/placeholder-product.jpg"],
    active: true,
    featured: false,
    createdAt: "2024-11-01T10:00:00Z",
  },
  {
    id: "prod-4",
    name: "Floral Midi Summer Dress",
    description:
      "Elegant floral print midi dress perfect for summer occasions. Lightweight fabric with a flattering A-line silhouette.",
    categoryId: "cat-women",
    category: "Women",
    sku: "W-DRS-FLM-M",
    price: 89.99,
    salePrice: 69.99,
    stock: 63,
    colors: ["Blue Floral", "Pink Floral", "Yellow Floral"],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: ["/placeholder-product.jpg"],
    active: true,
    featured: true,
    createdAt: "2024-10-20T10:00:00Z",
  },
  {
    id: "prod-5",
    name: "Kids Denim Jacket - Indigo",
    description:
      "Classic denim jacket for kids with button closure, chest pockets, and adjustable cuffs. Durable and stylish.",
    categoryId: "cat-kids",
    category: "Kids",
    sku: "K-JKT-DNM-6",
    price: 49.99,
    salePrice: null,
    stock: 0,
    colors: ["Indigo", "Light Blue"],
    sizes: ["4T", "5T", "6", "7", "8"],
    images: ["/placeholder-product.jpg"],
    active: true,
    featured: false,
    createdAt: "2024-09-25T10:00:00Z",
  },
  {
    id: "prod-6",
    name: "Leather Crossbody Bag",
    description:
      "Compact crossbody bag made from genuine leather. Adjustable strap, zip closure, and interior card slots.",
    categoryId: "cat-accessories",
    category: "Accessories",
    sku: "A-BAG-LCB-BK",
    price: 129.99,
    salePrice: 99.99,
    stock: 34,
    colors: ["Black", "Tan", "Burgundy"],
    sizes: ["One Size"],
    images: ["/placeholder-product.jpg"],
    active: true,
    featured: false,
    createdAt: "2024-11-05T10:00:00Z",
  },
  {
    id: "prod-7",
    name: "Running Sneakers - Pro Series",
    description:
      "Lightweight performance running sneakers with responsive cushioning and breathable mesh upper. Ideal for daily training.",
    categoryId: "cat-shoes",
    category: "Shoes",
    sku: "S-SNK-RNG-42",
    price: 119.99,
    salePrice: null,
    stock: 156,
    colors: ["White/Black", "Black/Red", "Gray/Blue"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    images: ["/placeholder-product.jpg"],
    active: true,
    featured: true,
    createdAt: "2024-10-08T10:00:00Z",
  },
  {
    id: "prod-8",
    name: "Cashmere Blend Scarf",
    description:
      "Luxurious cashmere blend scarf with fringe detail. Soft, warm, and perfect for layering in cooler months.",
    categoryId: "cat-accessories",
    category: "Accessories",
    sku: "A-SCF-CBS-OS",
    price: 59.99,
    salePrice: 44.99,
    stock: 88,
    colors: ["Camel", "Grey", "Black", "Navy"],
    sizes: ["One Size"],
    images: ["/placeholder-product.jpg"],
    active: false,
    featured: false,
    createdAt: "2024-08-15T10:00:00Z",
  },
  {
    id: "prod-9",
    name: "Slim Fit Chino Pants",
    description:
      "Versatile slim fit chinos crafted from stretch cotton twill. Perfect for casual or smart-casual occasions.",
    categoryId: "cat-men",
    category: "Men",
    sku: "M-PNT-SLC-32",
    price: 64.99,
    salePrice: null,
    stock: 210,
    colors: ["Khaki", "Olive", "Navy", "Black"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    images: ["/placeholder-product.jpg"],
    active: true,
    featured: false,
    createdAt: "2024-09-30T10:00:00Z",
  },
  {
    id: "prod-10",
    name: "Linen Blend Summer Blazer",
    description:
      "Relaxed fit blazer in a breathable linen blend. Unstructured shoulders for a modern, effortless look.",
    categoryId: "cat-men",
    category: "Men",
    sku: "M-BLZ-LIN-40",
    price: 149.99,
    salePrice: null,
    stock: 0,
    colors: ["Navy", "Beige"],
    sizes: ["S", "M", "L", "XL"],
    images: ["/placeholder-product.jpg"],
    active: true,
    featured: false,
    createdAt: "2024-07-20T10:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

const COLOR_MAP: Record<string, string> = {
  black: "#000000",
  white: "#FFFFFF",
  navy: "#000080",
  gray: "#808080",
  "dark blue": "#00008B",
  "light wash": "#A4C8E1",
  charcoal: "#36454F",
  "heather gray": "#B6B6B4",
  burgundy: "#800020",
  "blue floral": "#4169E1",
  "pink floral": "#FF69B4",
  "yellow floral": "#FFD700",
  indigo: "#4B0082",
  "light blue": "#ADD8E6",
  tan: "#D2B48C",
  camel: "#C19A6B",
  khaki: "#C3B091",
  olive: "#808000",
  beige: "#F5F5DC",
  red: "#FF0000",
};

// ---------------------------------------------------------------------------
// Color dot component
// ---------------------------------------------------------------------------

function ColorDots({ colors }: { colors: string[] }) {
  const displayColors = colors.slice(0, 4);
  const remaining = colors.length - 4;
  return (
    <div className="flex items-center gap-1">
      {displayColors.map((color) => (
        <span
          key={color}
          className="size-4 rounded-full border border-border"
          style={{
            backgroundColor: COLOR_MAP[color.toLowerCase()] || "#999",
          }}
          title={color}
        />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-muted-foreground">+{remaining}</span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden py-0">
      <Skeleton className="aspect-square w-full rounded-t-xl" />
      <CardContent className="space-y-3 pt-4 pb-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-6 w-20" />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ProductsSection() {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterFeatured, setFilterFeatured] = useState<string>("all");

  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Fetch products
  const { isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/products?businessId=DEMO");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setProducts(json.data);
            return json.data;
          }
        }
      } catch {
        // fallback
      }
      await new Promise((r) => setTimeout(r, 600));
      setProducts(DEMO_PRODUCTS);
      return DEMO_PRODUCTS;
    },
    staleTime: 30_000,
  });

  // Filtered products
  const filteredProducts = useMemo(() => {
    const source = products.length > 0 ? products : DEMO_PRODUCTS;
    return source.filter((p) => {
      const matchesSearch =
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || p.categoryId === filterCategory;
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && p.active) ||
        (filterStatus === "inactive" && !p.active);
      const matchesFeatured =
        filterFeatured === "all" ||
        (filterFeatured === "featured" && p.featured) ||
        (filterFeatured === "not-featured" && !p.featured);
      return matchesSearch && matchesCategory && matchesStatus && matchesFeatured;
    });
  }, [products, search, filterCategory, filterStatus, filterFeatured]);

  // Form helpers
  function openAddForm() {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      sku: product.sku,
      price: String(product.price),
      salePrice: product.salePrice ? String(product.salePrice) : "",
      stock: String(product.stock),
      colors: product.colors.join(", "),
      sizes: product.sizes.join(", "),
      images: product.images.join(", "),
      active: product.active,
      featured: product.featured,
    });
    setFormOpen(true);
  }

  function handleSave() {
    if (!form.name.trim() || !form.price) return;
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: form.name,
                description: form.description,
                categoryId: form.categoryId,
                sku: form.sku,
                price: parseFloat(form.price) || 0,
                salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
                stock: parseInt(form.stock) || 0,
                colors: form.colors
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
                sizes: form.sizes
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
                images: form.images
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
                active: form.active,
                featured: form.featured,
                category:
                  DEMO_CATEGORIES.find((c) => c.id === form.categoryId)?.name ||
                  p.category,
              }
            : p
        )
      );
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: form.name,
        description: form.description,
        categoryId: form.categoryId,
        sku: form.sku || `SKU-${Date.now()}`,
        price: parseFloat(form.price) || 0,
        salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
        stock: parseInt(form.stock) || 0,
        colors: form.colors
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        sizes: form.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        images: form.images
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        active: form.active,
        featured: form.featured,
        category:
          DEMO_CATEGORIES.find((c) => c.id === form.categoryId)?.name || "Other",
        createdAt: new Date().toISOString(),
      };
      setProducts((prev) => [newProduct, ...prev]);
    }
    setFormOpen(false);
  }

  function handleDuplicate(product: Product) {
    const duplicate: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      name: `${product.name} (Copy)`,
      sku: `${product.sku}-COPY`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [duplicate, ...prev]);
  }

  function handleToggleStatus(product: Product) {
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, active: !p.active } : p))
    );
  }

  function handleToggleFeatured(product: Product) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, featured: !p.featured } : p
      )
    );
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  // Image URL management in form
  const imageUrls = form.images
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  function addImageUrl() {
    setForm((f) => ({ ...f, images: f.images ? `${f.images}, ` : "" }));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Products"
        description="Manage your product catalog"
        action={
          <Button onClick={openAddForm}>
            <Plus className="size-4" />
            Add Product
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {DEMO_CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterFeatured} onValueChange={setFilterFeatured}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Featured" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="not-featured">Not Featured</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={PackageX}
          title="No products found"
          description={
            search || filterCategory !== "all" || filterStatus !== "all"
              ? "Try adjusting your search or filters."
              : "Get started by adding your first product."
          }
          action={
            !search && filterCategory === "all" && filterStatus === "all" ? (
              <Button onClick={openAddForm}>
                <Plus className="size-4" />
                Add Product
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden py-0 group"
            >
              {/* Product Image */}
              <div className="relative aspect-square bg-muted">
                {product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="size-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <PackageX className="size-12" />
                  </div>
                )}

                {/* Badges overlay */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.featured && (
                    <Badge className="bg-amber-500 text-white border-amber-500 text-[10px] px-1.5 py-0">
                      <Star className="size-3 mr-0.5" /> Featured
                    </Badge>
                  )}
                  {!product.active && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      Inactive
                    </Badge>
                  )}
                  {product.salePrice && (
                    <Badge className="bg-red-500 text-white border-red-500 text-[10px] px-1.5 py-0">
                      Sale
                    </Badge>
                  )}
                  {product.stock === 0 && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                      Out of Stock
                    </Badge>
                  )}
                </div>

                {/* Actions overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="secondary" className="size-8 bg-background/90 backdrop-blur-sm shadow-sm">
                        <Pencil className="size-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => openEditForm(product)}>
                        <Pencil className="size-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(product)}>
                        <Copy className="size-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleToggleStatus(product)}>
                        <ToggleLeft className="size-4 mr-2" />
                        {product.active ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleFeatured(product)}>
                        {product.featured ? (
                          <StarOff className="size-4 mr-2" />
                        ) : (
                          <Star className="size-4 mr-2" />
                        )}
                        {product.featured ? "Remove from Featured" : "Set as Featured"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteTarget(product)}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Product Info */}
              <CardContent className="space-y-2 pt-3 pb-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {product.category}
                </p>
                <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
                  {product.name}
                </h3>

                {/* Colors */}
                <ColorDots colors={product.colors} />

                {/* Sizes */}
                <div className="flex flex-wrap gap-1">
                  {product.sizes.slice(0, 5).map((size) => (
                    <Badge key={size} variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                      {size}
                    </Badge>
                  ))}
                  {product.sizes.length > 5 && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                      +{product.sizes.length - 5}
                    </Badge>
                  )}
                </div>

                {/* Price & Stock */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-baseline gap-1.5">
                    {product.salePrice ? (
                      <>
                        <span className="font-bold text-base text-red-600 dark:text-red-400">
                          {formatCurrency(product.salePrice)}
                        </span>
                        <span className="text-xs text-muted-foreground line-through">
                          {formatCurrency(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-base">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      product.stock === 0
                        ? "text-destructive"
                        : product.stock < 10
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-muted-foreground"
                    }`}
                  >
                    {product.stock === 0
                      ? "Out of stock"
                      : `${product.stock} in stock`}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Update product details below."
                : "Fill in the details for your new product."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="prod-name">Product Name *</Label>
              <Input
                id="prod-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Classic Cotton T-Shirt"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="prod-desc">Description</Label>
              <Textarea
                id="prod-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Product description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(val) => setForm({ ...form, categoryId: val })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEMO_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* SKU */}
              <div className="space-y-2">
                <Label htmlFor="prod-sku">SKU</Label>
                <Input
                  id="prod-sku"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  placeholder="e.g., M-TSH-CCN-S"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="prod-price">Price ($) *</Label>
                <Input
                  id="prod-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              {/* Sale Price */}
              <div className="space-y-2">
                <Label htmlFor="prod-sale-price">Sale Price ($)</Label>
                <Input
                  id="prod-sale-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.salePrice}
                  onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                  placeholder="Optional"
                />
              </div>

              {/* Stock */}
              <div className="space-y-2">
                <Label htmlFor="prod-stock">Stock</Label>
                <Input
                  id="prod-stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Colors */}
              <div className="space-y-2">
                <Label htmlFor="prod-colors">
                  Colors{" "}
                  <span className="text-muted-foreground font-normal">
                    (comma-separated)
                  </span>
                </Label>
                <Input
                  id="prod-colors"
                  value={form.colors}
                  onChange={(e) => setForm({ ...form, colors: e.target.value })}
                  placeholder="e.g., Black, White, Navy"
                />
              </div>

              {/* Sizes */}
              <div className="space-y-2">
                <Label htmlFor="prod-sizes">
                  Sizes{" "}
                  <span className="text-muted-foreground font-normal">
                    (comma-separated)
                  </span>
                </Label>
                <Input
                  id="prod-sizes"
                  value={form.sizes}
                  onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                  placeholder="e.g., S, M, L, XL"
                />
              </div>
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label htmlFor="prod-images">
                Image URLs{" "}
                <span className="text-muted-foreground font-normal">
                  (comma-separated)
                </span>
              </Label>
              <Input
                id="prod-images"
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                placeholder="https://example.com/image.jpg, https://..."
              />
              {imageUrls.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {imageUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative size-16 rounded-md border bg-muted overflow-hidden"
                    >
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="size-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = imageUrls.filter((_, i) => i !== idx);
                          setForm({ ...form, images: updated.join(", ") });
                        }}
                        className="absolute -top-1 -right-1 size-5 rounded-full bg-destructive text-white flex items-center justify-center"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Toggles */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="prod-active" className="text-sm">
                  Active
                </Label>
                <p className="text-xs text-muted-foreground">
                  Product will be visible to customers
                </p>
              </div>
              <Switch
                id="prod-active"
                checked={form.active}
                onCheckedChange={(checked) => setForm({ ...form, active: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="prod-featured" className="text-sm">
                  Featured
                </Label>
                <p className="text-xs text-muted-foreground">
                  Highlight this product on the storefront
                </p>
              </div>
              <Switch
                id="prod-featured"
                checked={form.featured}
                onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!form.name.trim() || !form.price}>
              {editingProduct ? "Save Changes" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        variant="destructive"
        confirmLabel="Delete"
      />
    </div>
  );
}
