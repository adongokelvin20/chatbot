"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  HelpCircle,
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  active: boolean;
}

interface FAQFormData {
  question: string;
  answer: string;
  category: string;
  keywords: string;
  active: boolean;
}

// ---------------------------------------------------------------------------
// Demo Data
// ---------------------------------------------------------------------------

const DEMO_FAQS: FAQ[] = [
  {
    id: "faq1",
    question: "How long does delivery take within Kigali?",
    answer: "Deliveries within Kigali typically take 1-2 business days. Orders placed before 12 PM may qualify for same-day delivery. We use Kigali Express courier for all city deliveries.",
    category: "delivery",
    keywords: ["delivery", "kigali", "shipping", "how long", "days", "time"],
    active: true,
  },
  {
    id: "faq2",
    question: "What is your return and exchange policy?",
    answer: "We accept returns within 7 days of delivery for unworn items with original tags. Exchanges are free for a different size or color. Refunds are processed within 3-5 business days to your original payment method. Items on sale are final sale.",
    category: "returns",
    keywords: ["return", "exchange", "refund", "policy", "money back"],
    active: true,
  },
  {
    id: "faq3",
    question: "What payment methods do you accept?",
    answer: "We accept MTN Mobile Money, Airtel Money, Bank of Kigali transfers, and Cash on Delivery. For online orders, Mobile Money is the fastest payment method. Bank transfers may take 1-2 hours to reflect.",
    category: "payment",
    keywords: ["payment", "pay", "momo", "bank", "cash", "money", "method"],
    active: true,
  },
  {
    id: "faq4",
    question: "How do I know my size? Do you have a size guide?",
    answer: "Yes! We have a detailed size guide available on each product page. For African wear, we recommend measuring your chest, waist, and hips and comparing with our chart. If you're between sizes, we suggest going up one size. You can also message us with your measurements and we'll recommend the best fit.",
    category: "general",
    keywords: ["size", "sizing", "fit", "measurement", "guide", "chart"],
    active: true,
  },
  {
    id: "faq5",
    question: "Do you offer bulk or wholesale orders for events?",
    answer: "Absolutely! We offer special bulk pricing for orders of 5 or more matching outfits. This is popular for weddings, family events, church groups, and corporate events. Contact us directly for a custom quote — we typically offer 10-20% off bulk orders depending on quantity.",
    category: "general",
    keywords: ["bulk", "wholesale", "event", "wedding", "group", "corporate", "custom"],
    active: true,
  },
  {
    id: "faq6",
    question: "What are your business hours?",
    answer: "We're open Monday to Saturday, 8:00 AM to 6:00 PM. Sunday is a rest day. Our AI assistant is available 24/7 to answer questions, take orders, and help with product inquiries. During business hours, human staff is also available for complex requests.",
    category: "general",
    keywords: ["hours", "open", "close", "time", "when", "schedule", "business"],
    active: false,
  },
];

const CATEGORIES = [
  { value: "delivery", label: "Delivery" },
  { value: "payment", label: "Payment" },
  { value: "returns", label: "Returns" },
  { value: "general", label: "General" },
];

const CATEGORY_COLORS: Record<string, string> = {
  delivery: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  payment: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  returns: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  general: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const emptyForm: FAQFormData = {
  question: "",
  answer: "",
  category: "general",
  keywords: "",
  active: true,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FAQSection() {
  const [faqs, setFaqs] = useState<FAQ[]>(DEMO_FAQS);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<FAQFormData>(emptyForm);
  const [editTarget, setEditTarget] = useState<FAQ | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return faqs;
    const q = search.toLowerCase();
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.keywords.some((k) => k.includes(q))
    );
  }, [faqs, search]);

  function openAdd() {
    setFormMode("add");
    setFormData(emptyForm);
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(faq: FAQ) {
    setFormMode("edit");
    setEditTarget(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      keywords: faq.keywords.join(", "),
      active: faq.active,
    });
    setFormOpen(true);
  }

  function handleSave() {
    const data = {
      question: formData.question,
      answer: formData.answer,
      category: formData.category,
      keywords: formData.keywords
        .split(",")
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean),
      active: formData.active,
    };

    if (formMode === "add") {
      setFaqs((prev) => [...prev, { id: `faq-${Date.now()}`, ...data }]);
    } else if (editTarget) {
      setFaqs((prev) =>
        prev.map((f) => (f.id === editTarget.id ? { ...f, ...data } : f))
      );
    }
    setFormOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setFaqs((prev) => prev.filter((f) => f.id !== deleteTarget.id));
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  function toggleActive(faq: FAQ) {
    setFaqs((prev) =>
      prev.map((f) => (f.id === faq.id ? { ...f, active: !f.active } : f))
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="FAQs"
        description="Manage frequently asked questions for your AI assistant"
        action={
          <Button onClick={openAdd}>
            <Plus className="mr-2 size-4" />
            Add FAQ
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search FAQs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No FAQs found"
          description={search ? "Try a different search term." : "Add your first FAQ to help your AI assistant answer common questions."}
          action={
            !search ? (
              <Button size="sm" onClick={openAdd}>
                <Plus className="mr-2 size-4" />
                Add FAQ
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[35%]">Question</TableHead>
                  <TableHead className="hidden lg:table-cell">Answer</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden md:table-cell">Keywords</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((faq) => (
                  <TableRow key={faq.id} className={!faq.active ? "opacity-60" : ""}>
                    <TableCell>
                      <p className="font-medium text-sm line-clamp-1">{faq.question}</p>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-[300px]">
                        {faq.answer}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={CATEGORY_COLORS[faq.category] ?? ""}
                      >
                        {CATEGORIES.find((c) => c.value === faq.category)?.label ?? faq.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {faq.keywords.slice(0, 3).map((kw) => (
                          <Badge key={kw} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {kw}
                          </Badge>
                        ))}
                        {faq.keywords.length > 3 && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            +{faq.keywords.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={faq.active ? "default" : "secondary"}
                        className={faq.active ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                      >
                        {faq.active ? "Active" : "Inactive"}
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
                          <DropdownMenuItem onClick={() => toggleActive(faq)}>
                            {faq.active ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(faq)}>
                            <Pencil className="mr-2 size-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setDeleteTarget(faq);
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{formMode === "add" ? "Add FAQ" : "Edit FAQ"}</DialogTitle>
            <DialogDescription>
              {formMode === "add"
                ? "Add a new FAQ for your AI assistant."
                : "Update the FAQ details."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question *</Label>
              <Input
                value={formData.question}
                onChange={(e) => setFormData((f) => ({ ...f, question: e.target.value }))}
                placeholder="e.g., What are your delivery hours?"
              />
            </div>
            <div className="space-y-2">
              <Label>Answer *</Label>
              <Textarea
                value={formData.answer}
                onChange={(e) => setFormData((f) => ({ ...f, answer: e.target.value }))}
                placeholder="Write the answer your AI will use..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Keywords</Label>
              <Input
                value={formData.keywords}
                onChange={(e) => setFormData((f) => ({ ...f, keywords: e.target.value }))}
                placeholder="delivery, shipping, days, kigali (comma-separated)"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated keywords help the AI match customer questions to this FAQ.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">This FAQ is used by the AI</p>
              </div>
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData((f) => ({ ...f, active: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.question.trim() || !formData.answer.trim()}>
              {formMode === "add" ? "Add FAQ" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete FAQ</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
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
