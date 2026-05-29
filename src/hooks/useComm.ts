import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listTopics, getTopic, createTopic, updateTopicStatus,
  listMessages, postMessage, listAttachments, uploadAttachment,
  getMyLabel, listParticipants, addParticipantByEmail, removeParticipant,
  type TopicFilter, type TopicStatus, type TopicCategory, type PartyLabel,
} from '@/lib/comm';

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

export function useUploadAttachment(topicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadAttachment(topicId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comm', 'attachments', topicId] }),
  });
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
