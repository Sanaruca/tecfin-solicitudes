"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardIcon,
  CloseIcon,
  LogoutIcon,
  MenuIcon,
  UsersIcon,
} from "@/components/icons";
import { useSession } from "@/components/auth/session-context";
import { Badge } from "@/components/ui/badge";
import { ROL_LABELS, ROL_BADGES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { logout } from "@/lib/api/auth";

interface NavItem {
  href: string;
  label: string;
  icon: typeof ClipboardIcon;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/solicitudes", label: "Solicitudes", icon: ClipboardIcon },
  { href: "/usuarios", label: "Usuarios", icon: UsersIcon, adminOnly: true },
];

export function AppShell({ children }: { children: ReactNode }) {
  const user = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || user.rol === "ADMINISTRADOR");

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      router.replace("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  function renderNav(variant: "sidebar" | "drawer") {
    return (
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
              )}
              onClick={() => variant === "drawer" && setMenuOpen(false)}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  function renderUserBlock(compact = false) {
    return (
      <div className={cn("flex items-center gap-3", compact && "flex-col items-stretch gap-3")}>
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
            {user.nombre.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900">{user.nombre}</p>
            <Badge className={cn("mt-0.5", ROL_BADGES[user.rol])}>{ROL_LABELS[user.rol]}</Badge>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-60"
        >
          <LogoutIcon className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-zinc-200 bg-white md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-zinc-200 px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <ClipboardIcon className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-zinc-900">Solicitudes</span>
            <span className="block text-[11px] text-zinc-500">Panel de gestión</span>
          </span>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-3">
          {renderNav("sidebar")}
        </div>
        <div className="border-t border-zinc-200 p-3">{renderUserBlock()}</div>
      </aside>

      {/* Contenido */}
      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur md:px-6">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            className="-ml-1 rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 md:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 md:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-white">
              <ClipboardIcon className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-zinc-900">Solicitudes</span>
          </div>
          <div className="ml-auto hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="text-sm font-medium text-zinc-900">{user.nombre}</p>
              <p className="text-xs text-zinc-500">{ROL_LABELS[user.rol]}</p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
              {user.nombre.charAt(0).toUpperCase()}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="Cerrar sesión"
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-60"
            >
              <LogoutIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="ml-auto sm:hidden">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="Cerrar sesión"
              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-60"
            >
              <LogoutIcon className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>

      {/* Drawer (mobile) */}
      {menuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-zinc-950/40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <ClipboardIcon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-zinc-900">Solicitudes</span>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú"
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-3">{renderNav("drawer")}</div>
            <div className="border-t border-zinc-200 p-3">{renderUserBlock(true)}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
