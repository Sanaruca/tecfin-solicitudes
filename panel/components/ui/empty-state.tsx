import type { ReactNode } from "react";
import { InboxIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center",
        className,
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
        {icon ?? <InboxIcon className="h-5 w-5" />}
      </span>
      <p className="text-sm font-semibold text-zinc-900">{title}</p>
      {description ? <p className="max-w-sm text-sm text-zinc-500">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
