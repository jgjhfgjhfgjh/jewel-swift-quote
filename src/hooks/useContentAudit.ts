/**
 * useContentAudit — stav auditu copy + struktury z tabulky `content_audit`.
 *
 * Vrací VŽDY plný stav pro každý uzel ze `siteMap` (uzly bez DB řádku → default
 * `todo`, viz mergeRows). Upsert je optimistický, ať jsou přepínače svižné.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import {
  type AuditRow,
  type AuditStatus,
  type StructureChecks,
  mergeRows,
} from '@/lib/audit/cockpit';

const QK = ['content-audit'] as const;

export interface AuditPatch {
  node_id: string;
  copy_status?: AuditStatus;
  structure_status?: AuditStatus;
  structure_checks?: StructureChecks;
  is_live?: boolean;
  notes?: string | null;
  reviewer?: string | null;
}

export function useContentAudit() {
  return useQuery({
    queryKey: QK,
    queryFn: async (): Promise<Record<string, AuditRow>> => {
      const { data, error } = await supabase.from('content_audit').select('*');
      if (error) throw error;
      const rows: AuditRow[] = (data ?? []).map((r) => ({
        node_id: r.node_id,
        copy_status: r.copy_status as AuditStatus,
        structure_status: r.structure_status as AuditStatus,
        structure_checks: (r.structure_checks ?? {}) as StructureChecks,
        is_live: r.is_live,
        notes: r.notes,
        reviewer: r.reviewer,
        updated_at: r.updated_at,
      }));
      return mergeRows(rows);
    },
  });
}

export function useUpsertAuditNode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: AuditPatch) => {
      const payload: Record<string, unknown> = { node_id: patch.node_id };
      if (patch.copy_status !== undefined) payload.copy_status = patch.copy_status;
      if (patch.structure_status !== undefined) payload.structure_status = patch.structure_status;
      if (patch.structure_checks !== undefined) payload.structure_checks = patch.structure_checks as unknown as Json;
      if (patch.is_live !== undefined) payload.is_live = patch.is_live;
      if (patch.notes !== undefined) payload.notes = patch.notes;
      if (patch.reviewer !== undefined) payload.reviewer = patch.reviewer;

      const { error } = await supabase
        .from('content_audit')
        .upsert(payload as never, { onConflict: 'node_id' });
      if (error) throw error;
    },
    // optimistický update cache
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: QK });
      const prev = qc.getQueryData<Record<string, AuditRow>>(QK);
      if (prev) {
        const current = prev[patch.node_id];
        qc.setQueryData<Record<string, AuditRow>>(QK, {
          ...prev,
          [patch.node_id]: {
            ...current,
            ...patch,
            structure_checks: patch.structure_checks ?? current?.structure_checks ?? {},
            updated_at: new Date().toISOString(),
          } as AuditRow,
        });
      }
      return { prev };
    },
    onError: (err, _patch, ctx) => {
      if (ctx?.prev) qc.setQueryData(QK, ctx.prev);
      toast.error('Uložení se nezdařilo', { description: (err as Error).message });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QK });
    },
  });
}
