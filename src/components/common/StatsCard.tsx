"use client";

import React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease";
  icon?: React.ElementType;
  description?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  description,
  className,
}: StatsCardProps) {
  const isIncrease = changeType === "increase";
  const showChange = change !== undefined && change !== 0;

  return (
    <Card className={cn("py-4", className)}>
      <CardContent className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {showChange && (
            <div className="flex items-center gap-1">
              {isIncrease ? (
                <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <ArrowUp className="size-3" />
                  {Math.abs(change).toFixed(1)}%
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                  <ArrowDown className="size-3" />
                  {Math.abs(change).toFixed(1)}%
                </span>
              )}
              {description && (
                <span className="text-xs text-muted-foreground">
                  {description}
                </span>
              )}
            </div>
          )}
          {!showChange && description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {Icon && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-5 text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
