import type { ComponentType, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "./components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { cn } from "./lib/utils";

export function AppPage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("flex min-h-svh flex-col gap-6 bg-background p-4 md:p-6", className)}>
      {children}
    </main>
  );
}

export function AppPageHeader({
  actions,
  description,
  eyebrow,
  title,
}: {
  actions?: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? <div className="mb-1 text-xs font-medium text-muted-foreground">{eyebrow}</div> : null}
        <h1 className="truncate text-2xl font-semibold tracking-normal text-foreground">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-3xl text-sm leading-5 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function AppFilterBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-3 md:flex-row md:flex-wrap md:items-center",
        className
      )}
    >
      {children}
    </section>
  );
}

export function MetricGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("grid gap-3 md:grid-cols-2 xl:grid-cols-4", className)}>
      {children}
    </section>
  );
}

export function MetricCard({
  delta,
  description,
  icon: Icon,
  label,
  tone = "default",
  value,
}: {
  delta?: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon | ComponentType<{ className?: string }>;
  label: ReactNode;
  tone?: "default" | "success" | "warning" | "destructive";
  value: ReactNode;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          <div className="mt-2 truncate text-2xl font-semibold tabular-nums text-foreground">{value}</div>
          {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
          {delta ? <div className="mt-2 text-xs">{delta}</div> : null}
        </div>
        {Icon ? (
          <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", metricIconTone[tone])}>
            <Icon className="size-4" />
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}

const metricIconTone = {
  default: "bg-primary/10 text-primary",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  destructive: "bg-rose-50 text-rose-600",
};

export function DataPanel({
  actions,
  children,
  className,
  description,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  title?: ReactNode;
}) {
  return (
    <Card className={className}>
      {title || actions || description ? (
        <CardHeader className="border-b pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {title ? <CardTitle>{title}</CardTitle> : null}
              {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
            </div>
            {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
          </div>
        </CardHeader>
      ) : null}
      <CardContent className={cn(title || actions || description ? "pt-4" : "")}>{children}</CardContent>
    </Card>
  );
}

export function DetailPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside className={cn("rounded-lg border bg-card p-4", className)}>
      {children}
    </aside>
  );
}

export function AppStatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "primary" | "success" | "warning" | "destructive";
}) {
  return (
    <Badge className={statusTone[tone]} variant="outline">
      {children}
    </Badge>
  );
}

const statusTone = {
  neutral: "border-border bg-muted/50 text-muted-foreground",
  primary: "border-primary/20 bg-primary/10 text-primary",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  destructive: "border-rose-200 bg-rose-50 text-rose-700",
};
