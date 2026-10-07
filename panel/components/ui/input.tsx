import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const inputClassName =
  "block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 " +
  "shadow-sm placeholder:text-zinc-400 transition-colors " +
  "focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 " +
  "disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500";

export const fieldErrorClassName = "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClassName, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(inputClassName, "min-h-[96px] resize-y", className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputClassName, "appearance-none pr-8", className)} {...props}>
      {children}
    </select>
  );
}
