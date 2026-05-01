// src/components/layout/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Search, Plus, Trash2, Pencil, Check, X,
  LogOut, ChevronLeft, ChevronRight, MessageSquare,
  Settings, User, BarChart2,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn, truncate } from "@/lib/utils";
import { useConversations } from "@/hooks/useConversations";

type SidebarUser = {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
};

export function Sidebar({ user }: { user: SidebarUser }) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useClerk();
  const [collapsed, setCollapsed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const { conversations, loading, deleteConv, renameConv } = useConversations();

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteConv(id);
      if (pathname.includes(id)) router.push("/dashboard/chat");
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleRename(id: string) {
    if (!editTitle.trim()) return;
    try {
      await renameConv(id, editTitle);
      setEditingId(null);
      toast.success("Renamed");
    } catch {
      toast.error("Failed to rename");
    }
  }

  const currentConvId = pathname.split("/").pop();

  return (
    <aside className={cn(
      "flex h-full flex-col border-r bg-muted/30 transition-all duration-300",
      collapsed ? "w-14" : "w-64"
    )}>
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-3 border-b shrink-0">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 font-semibold text-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Search className="h-3.5 w-3.5" />
            </div>
            Brainwave
          </Link>
        )}
        <Button
          variant="ghost" size="icon"
          className={cn("h-8 w-8 shrink-0", collapsed && "mx-auto")}
          onClick={() => setCollapsed(c => !c)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* New chat */}
      <div className="p-2 shrink-0">
        <Button
          variant="outline"
          size={collapsed ? "icon" : "sm"}
          className={cn("w-full gap-2", collapsed && "h-9 w-9 mx-auto")}
          onClick={() => router.push("/dashboard/chat")}
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!collapsed && <span>New chat</span>}
        </Button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 min-h-0">
        {!collapsed && (
          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Recent
          </p>
        )}
        {loading ? (
          <div className="space-y-1 px-1">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-8 rounded-md" />)}
          </div>
        ) : conversations.length === 0 ? (
          !collapsed && (
            <div className="flex flex-col items-center py-8 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground">No conversations yet</p>
            </div>
          )
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((conv) => (
              <li key={conv.id}>
                {editingId === conv.id ? (
                  <div className="flex items-center gap-1 px-1">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-7 text-xs"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(conv.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => handleRename(conv.id)}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => setEditingId(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <Link
                    href={`/dashboard/chat/${conv.id}`}
                     prefetch={true}
                    className={cn(
                      "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
                      currentConvId === conv.id && "bg-accent font-medium"
                    )}
                  >
                    {collapsed ? (
                      <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <>
                        <span className="flex-1 truncate text-xs">{truncate(conv.title, 28)}</span>
                        <div className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
                          <button className="rounded p-0.5 hover:bg-muted"
                            onClick={(e) => { e.preventDefault(); setEditingId(conv.id); setEditTitle(conv.title); }}>
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button className="rounded p-0.5 hover:bg-muted text-destructive"
                            onClick={(e) => handleDelete(conv.id, e)}>
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Nav links */}
      <div className="px-2 pb-1 shrink-0">
        <Separator className="mb-2" />
        {[
          { href: "/dashboard/stats", icon: BarChart2, label: "Stats" },
{ href: "/dashboard/profile", icon: User, label: "Profile" },
{ href: "/dashboard/settings", icon: Settings, label: "Settings" },
        ].map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
              collapsed && "justify-center",
              pathname === href && "bg-accent text-foreground"
            )}>
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && label}
          </Link>
        ))}
      </div>

      {/* Footer: user + theme + logout */}
      <div className="border-t p-2 space-y-1 shrink-0">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between")}>
          <ThemeToggle />
          {!collapsed && (
            <Button variant="ghost" size="icon" className="h-8 w-8"
              onClick={() => signOut({ redirectUrl: "/" })} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
        {!collapsed && (
          <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
            {user.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.imageUrl} alt={user.name}
                className="h-7 w-7 rounded-full shrink-0 object-cover" />
            ) : (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                {user.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
