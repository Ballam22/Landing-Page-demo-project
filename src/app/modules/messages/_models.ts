export type Message = {
  id: string
  senderId: string
  recipientId: string
  body: string
  createdAt: string
  readAt: string | null
}

export type ConversationSummary = {
  userId: string
  lastMessage: Message | null
  unreadCount: number
}
