import {supabase} from '../../../lib/supabaseClient'
import {Message} from '../model/Message'

type DbMessageRow = {
  id: string
  sender_id: string
  recipient_id: string
  body: string
  created_at: string
  read_at: string | null
}

function rowToMessage(row: DbMessageRow): Message {
  return {
    id: row.id,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    body: row.body,
    createdAt: row.created_at,
    readAt: row.read_at,
  }
}

function isMissingDeleteColumnError(error: {message?: string; code?: string} | null): boolean {
  if (!error) return false
  const message = error.message ?? ''
  return (
    error.code === 'PGRST204' ||
    message.includes('deleted_by_sender_at') ||
    message.includes('deleted_by_recipient_at')
  )
}

export async function getAllForUser(userId: string): Promise<Message[]> {
  const visibleMessagesQuery = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${userId},deleted_by_sender_at.is.null),and(recipient_id.eq.${userId},deleted_by_recipient_at.is.null)`
    )
    .order('created_at', {ascending: true})

  if (!visibleMessagesQuery.error) {
    return (visibleMessagesQuery.data as DbMessageRow[]).map(rowToMessage)
  }

  if (!isMissingDeleteColumnError(visibleMessagesQuery.error)) {
    throw new Error(visibleMessagesQuery.error.message)
  }

  const {data, error} = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', {ascending: true})

  if (error) throw new Error(error.message)
  return (data as DbMessageRow[]).map(rowToMessage)
}

export async function getConversation(userId: string, otherUserId: string): Promise<Message[]> {
  const visibleConversationQuery = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${userId},recipient_id.eq.${otherUserId},deleted_by_sender_at.is.null),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId},deleted_by_recipient_at.is.null)`
    )
    .order('created_at', {ascending: true})

  if (!visibleConversationQuery.error) {
    return (visibleConversationQuery.data as DbMessageRow[]).map(rowToMessage)
  }

  if (!isMissingDeleteColumnError(visibleConversationQuery.error)) {
    throw new Error(visibleConversationQuery.error.message)
  }

  const {data, error} = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`
    )
    .order('created_at', {ascending: true})

  if (error) throw new Error(error.message)
  return (data as DbMessageRow[]).map(rowToMessage)
}

export async function send(
  senderId: string,
  recipientId: string,
  body: string
): Promise<Message> {
  const {data, error} = await supabase
    .from('messages')
    .insert({sender_id: senderId, recipient_id: recipientId, body})
    .select()
    .single()
  if (error) throw new Error(error.message)
  return rowToMessage(data as DbMessageRow)
}

export async function markAsRead(userId: string, otherUserId: string): Promise<void> {
  const readQuery = await supabase
    .from('messages')
    .update({read_at: new Date().toISOString()})
    .eq('recipient_id', userId)
    .eq('sender_id', otherUserId)
    .is('read_at', null)
    .is('deleted_by_recipient_at', null)

  if (!readQuery.error) return
  if (!isMissingDeleteColumnError(readQuery.error)) throw new Error(readQuery.error.message)

  const {error} = await supabase
    .from('messages')
    .update({read_at: new Date().toISOString()})
    .eq('recipient_id', userId)
    .eq('sender_id', otherUserId)
    .is('read_at', null)

  if (error) throw new Error(error.message)
}

export async function deleteMessage(userId: string, messageId: string): Promise<void> {
  const deletedAt = new Date().toISOString()

  const {data: sentMessage, error: sentError} = await supabase
    .from('messages')
    .update({deleted_by_sender_at: deletedAt})
    .eq('id', messageId)
    .eq('sender_id', userId)
    .select('id')
    .maybeSingle()

  if (sentError && !isMissingDeleteColumnError(sentError)) throw new Error(sentError.message)
  if (sentMessage) return

  const {data: receivedMessage, error: receivedError} = await supabase
    .from('messages')
    .update({deleted_by_recipient_at: deletedAt})
    .eq('id', messageId)
    .eq('recipient_id', userId)
    .select('id')
    .maybeSingle()

  if (receivedError) {
    if (!isMissingDeleteColumnError(receivedError)) {
      throw new Error(receivedError.message)
    }

    const {error: deleteError} = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)

    if (deleteError) throw new Error(deleteError.message)
    return
  }

  if (!receivedMessage) throw new Error('Message not found')
}

export async function deleteConversation(userId: string, otherUserId: string): Promise<void> {
  const deletedAt = new Date().toISOString()

  const sentMessagesQuery = await supabase
    .from('messages')
    .update({deleted_by_sender_at: deletedAt})
    .eq('sender_id', userId)
    .eq('recipient_id', otherUserId)

  if (sentMessagesQuery.error && !isMissingDeleteColumnError(sentMessagesQuery.error)) {
    throw new Error(sentMessagesQuery.error.message)
  }

  const receivedMessagesQuery = await supabase
    .from('messages')
    .update({deleted_by_recipient_at: deletedAt})
    .eq('sender_id', otherUserId)
    .eq('recipient_id', userId)

  if (receivedMessagesQuery.error && !isMissingDeleteColumnError(receivedMessagesQuery.error)) {
    throw new Error(receivedMessagesQuery.error.message)
  }

  if (
    isMissingDeleteColumnError(sentMessagesQuery.error) ||
    isMissingDeleteColumnError(receivedMessagesQuery.error)
  ) {
    const {error} = await supabase
      .from('messages')
      .delete()
      .or(
        `and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`
      )

    if (error) throw new Error(error.message)
  }
}
