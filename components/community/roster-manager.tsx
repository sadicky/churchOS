"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addMemberToGroupAction,
  removeMemberFromGroupAction,
  addMemberToMinistryAction,
  removeMemberFromMinistryAction,
} from "@/actions/community.actions";
import type { SimpleMemberOption } from "@/services/community.service";
import {
  UserPlus,
  Trash2,
  Loader2,
  Search,
  Shield,
  Phone,
  Mail,
  AlertCircle,
  Users,
} from "lucide-react";

interface AssignedMember {
  id: string; // group_members.id or ministry_members.id
  role: string;
  joined_at: string;
  member: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    membership_status: string;
  };
}

interface RosterManagerProps {
  type: "group" | "ministry";
  targetId: string;
  assignedMembers: AssignedMember[];
  availableMembers: SimpleMemberOption[];
}

export function RosterManager({
  type,
  targetId,
  assignedMembers,
  availableMembers,
}: RosterManagerProps) {
  const router = useRouter();

  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedRole, setSelectedRole] = useState(
    type === "group" ? "MEMBER" : "VOLUNTEER"
  );
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Set des membres déjà affectés
  const assignedMemberIds = new Set(assignedMembers.map((m) => m.member.id));
  const unassignedMembers = availableMembers.filter(
    (m) => !assignedMemberIds.has(m.id)
  );

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      setError("Veuillez choisir un membre à affecter.");
      return;
    }

    setLoadingAdd(true);
    setError(null);

    try {
      if (type === "group") {
        const res = await addMemberToGroupAction({
          group_id: targetId,
          member_id: selectedMemberId,
          role: selectedRole as any,
        });

        if (!res.success) {
          setError(res.error || "Échec de l'affectation à la cellule.");
          setLoadingAdd(false);
          return;
        }
      } else {
        const res = await addMemberToMinistryAction({
          ministry_id: targetId,
          member_id: selectedMemberId,
          role: selectedRole as any,
        });

        if (!res.success) {
          setError(res.error || "Échec de l'affectation au département.");
          setLoadingAdd(false);
          return;
        }
      }

      setSelectedMemberId("");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue.");
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleRemoveMember = async (membershipId: string, memberName: string) => {
    const confirmRemove = window.confirm(
      `Êtes-vous sûr de vouloir retirer ${memberName} de cette liste ?`
    );
    if (!confirmRemove) return;

    setRemovingId(membershipId);
    setError(null);

    try {
      if (type === "group") {
        const res = await removeMemberFromGroupAction(membershipId, targetId);
        if (!res.success) {
          setError(res.error || "Impossible de retirer le membre.");
        }
      } else {
        const res = await removeMemberFromMinistryAction(membershipId, targetId);
        if (!res.success) {
          setError(res.error || "Impossible de retirer le serviteur.");
        }
      }
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Erreur lors du retrait.");
    } finally {
      setRemovingId(null);
    }
  };

  const filteredMembers = assignedMembers.filter((item) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${item.member.first_name} ${item.member.last_name}`.toLowerCase();
    const email = item.member.email?.toLowerCase() || "";
    const phone = item.member.phone || "";
    return fullName.includes(term) || email.includes(term) || phone.includes(term);
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "LEADER":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
            {type === "group" ? "Conducteur" : "Responsable"}
          </span>
        );
      case "CO_LEADER":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
            Adjoint
          </span>
        );
      case "HOST":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400">
            Hôte d&apos;accueil
          </span>
        );
      case "COORDINATOR":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            Coordinateur
          </span>
        );
      case "VOLUNTEER":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
            Bénévole
          </span>
        );
      case "MEMBER":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
            Membre
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Formulaire d'affectation rapide */}
      <div className="p-5 bg-card border border-border rounded-2xl shadow-sm">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-primary" />
          {type === "group" ? "Affecter un fidèle à la cellule" : "Affecter un serviteur au département"}
        </h3>

        <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-6">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Sélectionner le membre
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            >
              <option value="">-- Choisir un membre ({unassignedMembers.length} disponibles) --</option>
              {unassignedMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.last_name.toUpperCase()} {m.first_name} {m.phone ? `(${m.phone})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Rôle / Responsabilité
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3.5 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
            >
              {type === "group" ? (
                <>
                  <option value="MEMBER">Membre régulier</option>
                  <option value="HOST">Hôte d&apos;accueil (Lieu de réunion)</option>
                  <option value="CO_LEADER">Conducteur adjoint</option>
                  <option value="LEADER">Conducteur principal</option>
                </>
              ) : (
                <>
                  <option value="VOLUNTEER">Bénévole actif</option>
                  <option value="COORDINATOR">Coordinateur d&apos;équipe</option>
                  <option value="CO_LEADER">Responsable adjoint</option>
                  <option value="LEADER">Responsable de département</option>
                </>
              )}
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loadingAdd || !selectedMemberId}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-xl hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
            >
              {loadingAdd ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Ajouter
            </button>
          </div>
        </form>
      </div>

      {/* Liste des membres affectés */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground text-sm">
              {type === "group" ? "Membres de la cellule" : "Roster des serviteurs"}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              {assignedMembers.length}
            </span>
          </div>

          {assignedMembers.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filtrer la liste..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
              />
            </div>
          )}
        </div>

        {assignedMembers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3 text-muted-foreground">
              <Users className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Aucun membre affecté pour le moment
            </p>
            <p className="text-xs text-muted-foreground">
              Utilisez le formulaire ci-dessus pour rattacher des fidèles à cette entité.
            </p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Aucun membre ne correspond au filtre &quot;{searchTerm}&quot;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Fidèle</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Rôle</th>
                  <th className="py-3 px-4">Date d&apos;entrée</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredMembers.map((item) => {
                  const m = item.member;
                  const fullName = `${m.first_name} ${m.last_name}`;
                  const isRemoving = removingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                            {m.first_name[0]}
                            {m.last_name[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{fullName}</div>
                            <span className="text-[10px] text-muted-foreground">
                              Statut : {m.membership_status}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1 text-muted-foreground">
                          {m.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3 w-3 text-muted-foreground/70" />
                              <span>{m.phone}</span>
                            </div>
                          )}
                          {m.email && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3 w-3 text-muted-foreground/70" />
                              <span className="truncate max-w-[160px]">{m.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">{getRoleBadge(item.role)}</td>

                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(item.joined_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(item.id, fullName)}
                          disabled={isRemoving}
                          className="inline-flex items-center justify-center p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition disabled:opacity-50"
                          title="Retirer de la liste"
                        >
                          {isRemoving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
