"use client";

import * as React from "react";
import Link from "next/link";
import { TenantSwitcher } from "@/components/dashboard/tenant-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/actions/auth.actions";
import {
  Bell,
  Search,
  Menu,
  User,
  Settings,
  Shield,
  LogOut,
  Calendar,
  Sparkles,
} from "lucide-react";
import type { UserOrganizationMembership } from "@/services/tenant.service";

interface DashboardHeaderProps {
  currentOrg: UserOrganizationMembership;
  organizations: UserOrganizationMembership[];
  userName?: string;
  userEmail?: string;
  userRole?: string;
  onMobileMenuToggle?: () => void;
}

export function DashboardHeader({
  currentOrg,
  organizations,
  userName = "Pasteur",
  userEmail,
  userRole = "ADMIN",
  onMobileMenuToggle,
}: DashboardHeaderProps) {
  const [unreadNotifications] = React.useState(2);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/80 px-4 sm:px-6 backdrop-blur-xl">
      {/* Left: Mobile trigger & Church Selector */}
      <div className="flex items-center gap-3">
        {onMobileMenuToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileMenuToggle}
            className="md:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <TenantSwitcher
          currentOrg={currentOrg}
          organizations={organizations}
        />
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un fidèle, un culte, une dîme..."
            className="w-full pl-9 pr-12 h-9 text-xs bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:ring-1"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions, Notifications, Theme & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative h-9 w-9 rounded-full border-border/60 bg-background/80 backdrop-blur-sm"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white shadow-xs">
                  {unreadNotifications}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2 shadow-lg">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-xs font-semibold text-foreground">Notifications</span>
              <Badge variant="secondary" className="text-[10px] py-0">
                {unreadNotifications} nouvelles
              </Badge>
            </div>
            <DropdownMenuSeparator className="my-1" />
            <div className="space-y-1">
              <div className="p-2 text-xs rounded-md bg-accent/40 border border-border/30">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-brand-600" /> Culte de Dimanche préparé
                </p>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  La session de présence du culte principal a été initialisée.
                </p>
                <span className="text-[10px] text-muted-foreground/60 mt-1 block">Il y a 25 min</span>
              </div>
              <div className="p-2 text-xs rounded-md hover:bg-accent/40">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-brand-600" /> Réunion du conseil pastoral
                </p>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  Prévue pour ce jeudi à 17h00 au Campus Principal.
                </p>
                <span className="text-[10px] text-muted-foreground/60 mt-1 block">Il y a 2h</span>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative flex items-center gap-2 p-1 rounded-full hover:bg-accent focus:ring-0"
            >
              <Avatar className="h-8 w-8 border border-border/60">
                <AvatarFallback className="bg-brand-700 text-white text-xs font-bold">
                  {userName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden xl:inline text-xs font-medium text-foreground max-w-[100px] truncate">
                {userName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-lg">
            <DropdownMenuLabel className="font-normal px-2 py-1.5">
              <div className="flex flex-col space-y-0.5">
                <p className="text-xs font-semibold text-foreground">{userName}</p>
                {userEmail && (
                  <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
                )}
                <div className="pt-1">
                  <Badge variant="outline" className="text-[9px] uppercase px-1.5 py-0 font-medium text-brand-600 border-brand-500/30">
                    {userRole}
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem asChild className="text-xs cursor-pointer">
              <Link href="/dashboard/settings/profile" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Mon Profil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-xs cursor-pointer">
              <Link href="/dashboard/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span>Paramètres de l&apos;Église</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <form action={logoutAction}>
              <DropdownMenuItem asChild>
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 text-xs text-destructive hover:bg-destructive/10 cursor-pointer rounded-sm px-2 py-1.5"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
