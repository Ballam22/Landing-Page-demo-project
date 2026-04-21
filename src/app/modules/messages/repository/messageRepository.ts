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

export async function getAllForUser(userId: string): Promise<Message[]> {
  const {data, error} = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', {ascending: true})
  if (error) throw new Error(error.message)
  return (data as DbMessageRow[]).map(rowToMessage)
}

export async function getConversation(userId: string, otherUserId: string): Promise<Message[]> {
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
  const {error} = await supabase
    .from('messages')
    .update({read_at: new Date().toISOString()})
    .eq('recipient_id', userId)
    .eq('sender_id', otherUserId)
    .is('read_at', null)
  if (error) throw new Error(error.message)
}
