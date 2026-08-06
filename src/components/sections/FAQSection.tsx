"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  HelpCircle,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import type { FAQCategory } from "@/types";

// ---------- Types ----------

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
  keywords?: string[] | null;
  active: boolean;
  createdAt: string;
}

interface FAQFormData {
  question: string;
  answer: string;
  category: string;
  keywords: string;
  active: boolean;
}

const emptyForm: FAQFormData = {
  question: "",
  answer: "",
  category: "",
  keywords: "",
  active: true,
};

const faqCategories: { value: FAQCategory; label: string }[] = [
  { value: "delivery", label: "Delivery" },
  { value: "payment", label: "Payment" },
  { value: "returns", label: "Returns" },
  { value: "general", label: "General" },
];

// ---------- Component ----------

export default function FAQSection() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form, setForm] = useState<FAQFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ---------- Data Fetching ----------

  const fetchFAQs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/faqs?active=false");
      if (!res.ok) throw new Error("Failed to fetch FAQs");
      const json = await res.json();
      setFaqs(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  // ---------- Helpers ----------

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(faq: FAQ) {
    setEditing(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "",
      keywords: faq.keywords?.join(", ") || "",
      active: faq.active,
    });
    setFormOpen(true);
  }

  // ---------- CRUD ----------

  async function handleSave() {
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    try {
      const body = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        category: form.category || undefined,
        keywords: form.keywords
          ? form.keywords.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        active: form.active,
      };

      const url = editing
        ? `/api/faqs/${editing.id}`
        : "/api/faqs";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save FAQ");
      setFormOpen(false);
      await fetchFAQs();
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
      const res = await fetch(`/api/faqs/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete FAQ");
      setDeleteTarget(null);
      await fetchFAQs();
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
        title="FAQs"
        description="Manage frequently asked questions for AI assistant"
        action={
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            Add FAQ
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
                <TableHead>Question</TableHead>
                <TableHead>Answer</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Keywords</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Empty */}
      {!loading && faqs.length === 0 && (
        <EmptyState
          icon={HelpCircle}
          title="No FAQs yet"
          description="Add FAQs to help your AI assistant answer common questions."
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-2 size-4" />
              Add FAQ
            </Button>
          }
        />
      )}

      {/* Table */}
      {!loading && faqs.length > 0 && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Question</TableHead>
                <TableHead className="min-w-[200px]">Answer</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Keywords</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faqs.map((faq) => (
                <TableRow key={faq.id}>
                  <TableCell className="font-medium">{faq.question}</TableCell>
                  <TableCell className="max-w-[250px] truncate text-muted-foreground">
                    {faq.answer}
                  </TableCell>
                  <TableCell>
                    {faq.category ? (
                      <Badge variant="outline" className="capitalize">
                        {faq.category}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(faq.keywords || []).slice(0, 3).map((kw, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {kw}
                        </Badge>
                      ))}
                      {(faq.keywords || []).length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{faq.keywords!.length - 3}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={faq.active ? "default" : "secondary"}>
                      {faq.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(faq)}
                        title="Edit"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-red-500 hover:text-red-600"
                        onClick={() => setDeleteTarget(faq)}
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
              {editing ? "Edit FAQ" : "Add FAQ"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update this FAQ entry."
                : "Add a new question and answer for the AI assistant."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="faq-question">Question *</Label>
              <Input
                id="faq-question"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                placeholder="e.g., What are your delivery hours?"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="faq-answer">Answer *</Label>
              <Textarea
                id="faq-answer"
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                placeholder="The answer the AI should give..."
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="faq-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger id="faq-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {faqCategories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="faq-keywords">Keywords</Label>
              <Input
                id="faq-keywords"
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                placeholder="delivery, shipping, time"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated keywords for AI matching
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="faq-active">Active</Label>
              <Switch
                id="faq-active"
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
              disabled={saving || !form.question.trim() || !form.answer.trim()}
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
        title="Delete FAQ"
        description={`Are you sure you want to delete this FAQ?`}
        onConfirm={handleDelete}
        variant="destructive"
        confirmLabel="Delete"
        isLoading={deleting}
      />
    </div>
  );
}
