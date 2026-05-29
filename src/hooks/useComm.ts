import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  listTopics, getTopic, createTopic, updateTopicStatus,
  listMessages, postMessage, listAttachments, uploadAttachment,
  getMyLabel, listParticipants, addParticipantByEmail, removeParticipant,
  addMetaAttachment, postMessage, resolveQuestion,
  type TopicFilter, type TopicStatus, type TopicCategory, type PartyLabel,
  type CommMessage, type AttachmentKind,
} from '@/lib/comm';

export interface StagedAttachment {
  kind: AttachmentKind;
  file?: File;
  url?: string;
  title?: string;
  note?: string;
}

export function useMyLabel() {
  return useQuery<PartyLabel>({
    queryKey: ['comm', 'my-label'],
    queryFn: getMyLabel,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopics(filter: TopicFilter) {
  return useQuery({
    queryKey: ['comm', 'topics', filter],
    queryFn: () => listTopics(filter),
  });
}

export function useTopic(id: string | undefined) {
  return useQuery({
    queryKey: ['comm', 'topic', id],
    queryFn: () => getTopic(id!),
    enabled: !!id,
  });
}

export function useMessages(topicId: string | undefined) {
  return useQuery({
    queryKey: ['comm', 'messages', topicId],
    queryFn: () => listMessages(topicId!),
    enabled: !!topicId,
  });
}

export function useAttachments(topicId: string | undefined) {
  return useQuery({
    queryKey: ['comm', 'attachments', topicId],
    queryFn: () => listAttachments(topicId!),
    enabled: !!topicId,
  });
}

export function useCreateTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTopic,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comm', 'topics'] }),
  });
}

export function useUpdateTopicStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TopicStatus }) => updateTopicStatus(id, status),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['comm', 'topics'] });
      qc.invalidateQueries({ queryKey: ['comm', 'topic', vars.id] });
    },
  });
}

export function usePostMessage(topicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => postMessage({ topicId, body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comm', 'messages', topicId] });
      qc.invalidateQueries({ queryKey: ['comm', 'topic', topicId] });
      qc.invalidateQueries({ queryKey: ['comm', 'topics'] });
    },
  });
}

/** Odešle zprávu i s připravenými přílohami (jednou akcí). */
export function useSendMessage(topicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { body: string; requiresReply: boolean; staged: StagedAttachment[]; replyToId?: string | null }) => {
      const msg = await postMessage({ topicId, body: input.body, requiresReply: input.requiresReply, replyToId: input.replyToId });
      for (const s of input.staged) {
        if (s.file) {
          await uploadAttachment(topicId, s.file, msg.id);
        } else if (s.kind === 'link' || s.kind === 'video' || s.kind === 'contact' || s.kind === 'note') {
          await addMetaAttachment({ topicId, messageId: msg.id, kind: s.kind, url: s.url, title: s.title, note: s.note });
        }
      }
      return msg;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comm', 'messages', topicId] });
      qc.invalidateQueries({ queryKey: ['comm', 'attachments', topicId] });
      qc.invalidateQueries({ queryKey: ['comm', 'topic', topicId] });
      qc.invalidateQueries({ queryKey: ['comm', 'topics'] });
    },
  });
}

export function useUploadAttachment(topicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadAttachment(topicId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comm', 'attachments', topicId] }),
  });
}

export function useResolveQuestion(topicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, resolved }: { messageId: string; resolved: boolean }) => resolveQuestion(messageId, resolved),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comm', 'messages', topicId] });
      qc.invalidateQueries({ queryKey: ['comm', 'topic', topicId] });
      qc.invalidateQueries({ queryKey: ['comm', 'topics'] });
    },
  });
}

export function useAddMetaAttachment(topicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { kind: 'link' | 'video' | 'contact' | 'note'; title?: string; url?: string; note?: string }) =>
      addMetaAttachment({ topicId, ...input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comm', 'attachments', topicId] }),
  });
}

// ── Realtime ───────────────────────────────────────────────
/** Živé zprávy + přílohy ve vlákně tématu. */
export function useTopicRealtime(topicId: string | undefined) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!topicId) return;
    const channel = supabase
      .channel(`comm-topic-${topicId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comm_messages', filter: `topic_id=eq.${topicId}` },
        (payload) => {
          const m = payload.new as CommMessage;
          qc.setQueryData<CommMessage[]>(['comm', 'messages', topicId], (old = []) =>
            old.some((x) => x.id === m.id) ? old : [...old, m]
          );
          qc.invalidateQueries({ queryKey: ['comm', 'topic', topicId] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'comm_messages', filter: `topic_id=eq.${topicId}` },
        () => qc.invalidateQueries({ queryKey: ['comm', 'messages', topicId] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comm_attachments', filter: `topic_id=eq.${topicId}` },
        () => qc.invalidateQueries({ queryKey: ['comm', 'attachments', topicId] })
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'comm_topics', filter: `id=eq.${topicId}` },
        () => qc.invalidateQueries({ queryKey: ['comm', 'topic', topicId] })
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [topicId, qc]);
}

/** Živý přehled — překreslí seznam témat při jakékoliv změně. */
export function useTopicsRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel('comm-topics-overview')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comm_topics' },
        () => qc.invalidateQueries({ queryKey: ['comm', 'topics'] })
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comm_messages' },
        () => qc.invalidateQueries({ queryKey: ['comm', 'topics'] })
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);
}

export function useParticipants() {
  return useQuery({
    queryKey: ['comm', 'participants'],
    queryFn: listParticipants,
  });
}

export function useAddParticipant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addParticipantByEmail,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comm', 'participants'] }),
  });
}

export function useRemoveParticipant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeParticipant,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comm', 'participants'] }),
  });
}

export type { TopicFilter, TopicStatus, TopicCategory };
