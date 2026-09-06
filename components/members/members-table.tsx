"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { deleteMemberAction } from "@/actions/member.actions";
import { toast } from "sonner";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  Download,
  Plus,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Building2,
  AlertCircle,
} from "lucide-react";
import type { MemberListItem } from "@/services/member.service";
import type { Campus } from "@/types";

interface MembersTableProps {
  members: MemberListItem[];
  campuses: Campus[];
  total: number;
  page: number;
  totalPages: number;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Actif",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  VISITOR: {
    label: "Visiteur",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  NEW_CONVERT: {
    label: "Nouveau converti",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  INACTIVE: {
    label: "Inactif",
    className: "bg-muted text-muted-foreground border-border/40",
  },
  TRANSFERRED: {
    label: "Transféré",
    className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  DECEASED: {
    label: "Décédé",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export function MembersTable({
  members,
  campuses,
  total,
  page,
  totalPages,
}: MembersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = React.useState(
    searchParams.get("search") || ""
  );
  const [selectedStatus, setSelectedStatus] = React.useState(
    searchParams.get("status") || "ALL"
  );
  const [selectedCampus, setSelectedCampus] = React.useState(
    searchParams.get("campusId") || "ALL"
  );

  // Update query params
  const updateFilters = React.useCallback(
    (newParams: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
        if (value && value !== "ALL") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      // reset page when filtering
      if (!newParams.page) {
        params.set("page", "1");
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  // Handle Search Input submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchTerm });
  };

  // Handle Delete
  const handleDeleteMember = async (id: string, name: string) => {
    if (!confirm(`Confirmez-vous la suppression du membre ${name} ?`)) {
      return;
    }

    try {
      const res = await deleteMemberAction(id);
      if (res.success) {
        toast.success("Membre supprimé avec succès.");
        router.refresh();
      } else {
        toast.error(res.error || "Erreur lors de la suppression.");
      }
    } catch {
      toast.error("Erreur de communication.");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (members.length === 0) {
      toast.info("Aucun membre à exporter.");
      return;
    }

    const headers = [
      "Prénom",
      "Nom",
      "Genre",
      "Statut",
      "Téléphone",
      "Email",
      "Ville",
      "Campus",
      "Date d'adhésion",
    ];

    const rows = members.map((m) => [
      `"${m.first_name || ""}"`,
      `"${m.last_name || ""}"`,
      `"${m.gender || ""}"`,
      `"${m.membership_status || ""}"`,
      `"${m.phone || ""}"`,
      `"${m.email || ""}"`,
      `"${m.city || ""}"`,
      `"${m.campuses?.name || "Campus Principal"}"`,
      `"${m.join_date || ""}"`,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `churchos_membres_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Export CSV téléchargé.");
  };

  return (
    <div className="space-y-4">
      {/* 1. Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/60 p-3.5 rounded-xl border border-border/50 backdrop-blur-sm">
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 max-w-md"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, téléphone, email..."
            className="pl-9 h-9 text-xs bg-muted/30 border-border/40"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              updateFilters({ status: e.target.value });
            }}
            className="h-9 rounded-md border border-border/50 bg-background px-2.5 text-xs text-foreground focus:ring-1 focus:ring-brand-500"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="ACTIVE">Actifs</option>
            <option value="VISITOR">Visiteurs</option>
            <option value="NEW_CONVERT">Nouveaux convertis</option>
            <option value="INACTIVE">Inactifs</option>
            <option value="TRANSFERRED">Transférés</option>
          </select>

          {/* Campus Filter */}
          {campuses.length > 0 && (
            <select
              value={selectedCampus}
              onChange={(e) => {
                setSelectedCampus(e.target.value);
                updateFilters({ campusId: e.target.value });
              }}
              className="h-9 rounded-md border border-border/50 bg-background px-2.5 text-xs text-foreground focus:ring-1 focus:ring-brand-500"
            >
              <option value="ALL">Tous les campus</option>
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Export CSV Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-9 text-xs gap-1.5 border-border/60 hover:bg-accent"
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Exporter CSV</span>
          </Button>
        </div>
      </div>

      {/* 2. Members Table Container */}
      <div className="overflow-hidden rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 bg-muted/20 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                <th className="py-3 px-4">Membre & État civil</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4">Coordonnées</th>
                <th className="py-3 px-4">Campus</th>
                <th className="py-3 px-4">Adhésion</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-xs">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                      <p className="font-medium text-foreground">Aucun fidèle trouvé</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        Aucun membre ne correspond à vos critères de recherche.
                      </p>
                      <Button asChild size="sm" className="mt-2 text-xs">
                        <Link href="/dashboard/members/new">
                          <Plus className="mr-1 h-3.5 w-3.5" />
                          Ajouter un premier membre
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const statusInfo =
                    STATUS_CONFIG[member.membership_status] || {
                      label: member.membership_status,
                      className: "bg-muted text-muted-foreground",
                    };

                  const fullName = `${member.first_name} ${member.last_name}`;

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-accent/40 transition-colors group"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <Link
                          href={`/dashboard/members/${member.id}`}
                          className="flex items-center gap-3"
                        >
                          <Avatar className="h-9 w-9 border border-border/60">
                            <AvatarFallback className="bg-brand-500/10 text-brand-700 dark:text-brand-300 font-bold text-xs">
                              {member.first_name.slice(0, 1)}
                              {member.last_name.slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground group-hover:text-brand-600 transition-colors">
                              {fullName}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {member.occupation ||
                                (member.gender === "MALE"
                                  ? "Homme"
                                  : member.gender === "FEMALE"
                                  ? "Femme"
                                  : "Fidèle")}
                            </span>
                          </div>
                        </Link>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={`text-[10px] py-0.5 px-2 font-medium border ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </Badge>
                      </td>

                      {/* Contacts */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {member.phone ? (
                            <a
                              href={`tel:${member.phone}`}
                              className="flex items-center gap-1.5 text-foreground hover:text-brand-600 transition-colors"
                            >
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{member.phone}</span>
                            </a>
                          ) : (
                            <span className="text-muted-foreground/60">—</span>
                          )}
                          {member.email && (
                            <a
                              href={`mailto:${member.email}`}
                              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Mail className="h-2.5 w-2.5" />
                              <span className="truncate max-w-[150px]">
                                {member.email}
                              </span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Campus */}
                      <td className="py-3 px-4 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground/70" />
                          <span>{member.campuses?.name || "Campus Principal"}</span>
                        </div>
                      </td>

                      {/* Join Date */}
                      <td className="py-3 px-4 text-muted-foreground text-[11px]">
                        {member.join_date
                          ? new Date(member.join_date).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Action Menu */}
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 p-1 shadow-lg">
                            <DropdownMenuItem asChild className="text-xs cursor-pointer">
                              <Link
                                href={`/dashboard/members/${member.id}`}
                                className="flex items-center gap-2"
                              >
                                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>Consulter la fiche</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="text-xs cursor-pointer">
                              <Link
                                href={`/dashboard/members/${member.id}/edit`}
                                className="flex items-center gap-2"
                              >
                                <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>Modifier les infos</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem
                              onClick={() => handleDeleteMember(member.id, fullName)}
                              className="flex items-center gap-2 text-xs text-destructive focus:bg-destructive/10 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Supprimer</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 text-xs text-muted-foreground bg-muted/10">
            <div>
              Affichage de {members.length} sur {total} fidèles
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => updateFilters({ page: (page - 1).toString() })}
                className="h-8 px-2 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Précédent
              </Button>
              <span className="text-xs px-2 font-medium">
                Page {page} sur {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => updateFilters({ page: (page + 1).toString() })}
                className="h-8 px-2 text-xs"
              >
                Suivant
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
