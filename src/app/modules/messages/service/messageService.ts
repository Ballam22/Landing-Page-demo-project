import {Message, ConversationSummary} from '../model/Message'
import * as messageRepository from '../repository/messageRepository'

export function deriveConversations(
  messages: Message[],
  currentUserId: string
): ConversationSummary[] {
  const grouped = new Map<string, Message[]>()

  for (const msg of messages) {
    const otherId = msg.senderId === currentUserId ? msg.recipientId : msg.senderId
    const existing = grouped.get(otherId) ?? []
    grouped.set(otherId, [...existing, msg])
  }

  return Array.from(grouped.entries())
    .map(([userId, msgs]) => ({
      userId,
      lastMessage: msgs[msgs.length - 1] ?? null,
      unreadCount: msgs.filter(
        (m) => m.recipientId === currentUserId && m.readAt === null
      ).length,
    }))
    .sort((a, b) => {
      const aTime = a.lastMessage?.createdAt ?? ''
      const bTime = b.lastMessage?.createdAt ?? ''
      return bTime.localeCompare(aTime)
    })
}

export async function sendMessage(
  senderId: string,
  recipientId: string,
  body: string
): Promise<Message> {
  const trimmed = body.trim()
  if (!trimmed) throw new Error('Message body cannot be empty')
  return messageRepository.send(senderId, recipientId, trimmed)
}
