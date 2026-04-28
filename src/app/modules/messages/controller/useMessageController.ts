import {useMutation, useQuery, useQueryClient} from 'react-query'
import {ConversationSummary, Message} from '../model/Message'
import * as messageRepository from '../repository/messageRepository'
import {deriveConversations, sendMessage} from '../service/messageService'

export const MESSAGE_QUERY_KEY = 'messages'

export function useConversations(userId?: string) {
  return useQuery<{conversations: ConversationSummary[]; allMessages: Message[]}>(
    [MESSAGE_QUERY_KEY, 'all', userId],
    async () => {
      const allMessages = await messageRepository.getAllForUser(userId!)
      return {allMessages, conversations: deriveConversations(allMessages, userId!)}
    },
    {
      enabled: !!userId,
      staleTime: 0,
      refetchInterval: 15_000,
    }
  )
}

export function useThread(userId?: string, otherUserId?: string) {
  return useQuery<Message[]>(
    [MESSAGE_QUERY_KEY, 'thread', userId, otherUserId],
    () => messageRepository.getConversation(userId!, otherUserId!),
    {
      enabled: !!userId && !!otherUserId,
      staleTime: 0,
      refetchInterval: 15_000,
    }
  )
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation(
    ({senderId, recipientId, body}: {senderId: string; recipientId: string; body: string}) =>
      sendMessage(senderId, recipientId, body),
    {
      onSuccess: (_msg, variables) => {
        queryClient.invalidateQueries([MESSAGE_QUERY_KEY, 'all', variables.senderId])
        queryClient.invalidateQueries([MESSAGE_QUERY_KEY, 'all', variables.recipientId])
        queryClient.invalidateQueries([
          MESSAGE_QUERY_KEY,
          'thread',
          variables.senderId,
          variables.recipientId,
        ])
        queryClient.invalidateQueries([
          MESSAGE_QUERY_KEY,
          'thread',
          variables.recipientId,
          variables.senderId,
        ])
      },
    }
  )
}

export function useUnreadCount(userId?: string) {
  const {data} = useConversations(userId)
  const total = (data?.conversations ?? []).reduce((sum, c) => sum + c.unreadCount, 0)
  return {data: total}
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation(
    ({userId, otherUserId}: {userId: string; otherUserId: string}) =>
      messageRepository.markAsRead(userId, otherUserId),
    {
      onSuccess: (_result, variables) => {
        queryClient.invalidateQueries([MESSAGE_QUERY_KEY, 'all', variables.userId])
        queryClient.invalidateQueries([
          MESSAGE_QUERY_KEY,
          'thread',
          variables.userId,
          variables.otherUserId,
        ])
      },
    }
  )
}

export function useDeleteMessage() {
  const queryClient = useQueryClient()
  return useMutation(
    ({
      userId,
      messageId,
    }: {
      userId: string
      otherUserId: string
      messageId: string
    }) => messageRepository.deleteMessage(userId, messageId),
    {
      onSuccess: (_result, variables) => {
        queryClient.invalidateQueries([MESSAGE_QUERY_KEY, 'all', variables.userId])
        queryClient.invalidateQueries([MESSAGE_QUERY_KEY, 'all', variables.otherUserId])
        queryClient.invalidateQueries([
          MESSAGE_QUERY_KEY,
          'thread',
          variables.userId,
          variables.otherUserId,
        ])
        queryClient.invalidateQueries([
          MESSAGE_QUERY_KEY,
          'thread',
          variables.otherUserId,
          variables.userId,
        ])
      },
    }
  )
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()
  return useMutation(
    ({userId, otherUserId}: {userId: string; otherUserId: string}) =>
      messageRepository.deleteConversation(userId, otherUserId),
    {
      onSuccess: (_result, variables) => {
        queryClient.invalidateQueries([MESSAGE_QUERY_KEY, 'all', variables.userId])
        queryClient.invalidateQueries([MESSAGE_QUERY_KEY, 'all', variables.otherUserId])
        queryClient.invalidateQueries([
          MESSAGE_QUERY_KEY,
          'thread',
          variables.userId,
          variables.otherUserId,
        ])
        queryClient.invalidateQueries([
          MESSAGE_QUERY_KEY,
          'thread',
          variables.otherUserId,
          variables.userId,
        ])
      },
    }
  )
}
