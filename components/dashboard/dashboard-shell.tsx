"use client";

import * as React from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import type { UserOrganizationMembership } from "@/services/tenant.service";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardShellProps {
  currentOrg: UserOrganizationMembership;
  organizations: UserOrganizationMembership[];
  userName: string;
  userEmail: string;
  userRole: string;
  children: React.ReactNode;
}

export function DashboardShell({
  currentOrg,
  organizations,
  userName,
  userEmail,
  userRole,
  children,
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
        <DashboardSidebar
          userEmail={userEmail}
          userName={userName}
          userRole={userRole}
          orgName={currentOrg.organization.name}
        />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="relative flex flex-col w-72 max-w-xs bg-background shadow-2xl animate-slide-in-right">
            <div className="absolute top-3 right-3 z-50">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <DashboardSidebar
              userEmail={userEmail}
              userName={userName}
              userRole={userRole}
              orgName={currentOrg.organization.name}
              className="border-none w-full"
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 md:pl-64">
        <DashboardHeader
          currentOrg={currentOrg}
          organizations={organizations}
          userName={userName}
          userEmail={userEmail}
          userRole={userRole}
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
