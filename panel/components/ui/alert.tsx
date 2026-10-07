import type { ReactNode } from "react";
import { AlertIcon, CheckCircleIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

const TONES = {
  error: "border-rose-200 bg-rose-50 text-rose-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
} as const;

export function Alert({
  tone = "error",
  children,
  className,
}: {
  tone?: keyof typeof TONES;
  children: ReactNode;
  className?: string;
}) {
  const Icon = tone === "success" ? CheckCircleIcon : AlertIcon;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm",
        TONES[tone],
        className,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="leading-5">{children}</div>
    </div>
  );
}
