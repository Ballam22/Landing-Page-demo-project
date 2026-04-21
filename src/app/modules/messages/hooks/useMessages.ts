import {useMutation, useQuery, useQueryClient} from 'react-query'
import {
  fetchConversation,
  fetchMessagesForUser,
  fetchUnreadMessageCount,
  markConversationAsRead,
  sendMessage,
} from '../_requests'

export const MESSAGE_QUERY_ROOT = ['messages'] as const

export function useMessagesForUser(userId?: string) {
  return useQuery(
    [...MESSAGE_QUERY_ROOT, 'list', userId],
    () => fetchMessagesForUser(userId ?? ''),
    {
      enabled: !!userId,
      staleTime: 0,
    }
  )
}

export function useConversation(userId?: string, otherUserId?: string) {
  return useQuery(
    [...MESSAGE_QUERY_ROOT, 'conversation', userId, otherUserId],
    () => fetchConversation(userId ?? '', otherUserId ?? ''),
    {
      enabled: !!userId && !!otherUserId,
      staleTime: 0,
    }
  )
}

export function useUnreadMessageCount(userId?: string) {
  return useQuery(
    [...MESSAGE_QUERY_ROOT, 'unread-count', userId],
    () => fetchUnreadMessageCount(userId ?? ''),
    {
      enabled: !!userId,
      staleTime: 0,
      refetchInterval: 30_000,
    }
  )
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation(sendMessage, {
    onSuccess: (_message, variables) => {
      queryClient.invalidateQueries([...MESSAGE_QUERY_ROOT, 'list', variables.senderId])
      queryClient.invalidateQueries([...MESSAGE_QUERY_ROOT, 'list', variables.recipientId])
      queryClient.invalidateQueries([
        ...MESSAGE_QUERY_ROOT,
        'conversation',
        variables.senderId,
        variables.recipientId,
      ])
      queryClient.invalidateQueries([
        ...MESSAGE_QUERY_ROOT,
        'conversation',
        variables.recipientId,
        variables.senderId,
      ])
      queryClient.invalidateQueries([...MESSAGE_QUERY_ROOT, 'unread-count', variables.recipientId])
      queryClient.invalidateQueries([...MESSAGE_QUERY_ROOT, 'unread-count', variables.senderId])
    },
  })
}

export function useMarkConversationAsRead() {
  const queryClient = useQueryClient()

  return useMutation(markConversationAsRead, {
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries([...MESSAGE_QUERY_ROOT, 'list', variables.userId])
      queryClient.invalidateQueries([
        ...MESSAGE_QUERY_ROOT,
        'conversation',
        variables.userId,
        variables.otherUserId,
      ])
      queryClient.invalidateQueries([
        ...MESSAGE_QUERY_ROOT,
        'conversation',
        variables.otherUserId,
        variables.userId,
      ])
      queryClient.invalidateQueries([...MESSAGE_QUERY_ROOT, 'unread-count', variables.userId])
    },
  })
}
