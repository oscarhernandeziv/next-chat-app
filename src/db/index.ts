import { neon } from "@neondatabase/serverless";

import type { Chat, Message, ChatWithMessages } from "../types";

const sql = neon(process.env.DATABASE_URL!);

export async function getChat(
  chatId: number
): Promise<ChatWithMessages | null> {
  const chats = await sql`SELECT * FROM chats WHERE id = ${chatId}`;
  if (!chats[0]) {
    return null;
  }
  const messages = await sql`SELECT * FROM messages WHERE chat_id = ${chatId}`;

  return {
    ...chats[0],
    messages: messages.map((msg) => ({
      ...msg,
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
  } as ChatWithMessages;
}

export async function getChats(userEmail: string): Promise<Chat[]> {
  const chats = await sql`SELECT * FROM chats WHERE user_email = ${userEmail}`;
  return chats as Chat[];
}

export async function getChatsWithMessages(
  userEmail: string
): Promise<ChatWithMessages[]> {
  const chats =
    await sql`SELECT * FROM chats WHERE user_email = ${userEmail} ORDER BY timestamp DESC LIMIT 3`;

  for (const chat of chats) {
    const messages =
      await sql`SELECT * FROM messages WHERE chat_id = ${chat.id}`;
    chat.messages = messages.map((msg) => ({
      ...msg,
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));
  }

  return chats as ChatWithMessages[];
}

export async function getMessages(chatId: number): Promise<Message[]> {
  const messages = await sql`SELECT * FROM messages WHERE chat_id = ${chatId}`;

  return messages.map((msg) => ({
    ...msg,
    role: msg.role as "user" | "assistant",
    content: msg.content,
  }));
}

export async function updateChat(chatId: number, msgs: Message[]) {
  await sql`DELETE FROM messages WHERE chat_id = ${chatId}`;
  for (const msg of msgs) {
    await sql`INSERT INTO messages (chat_id, role, content) VALUES (${chatId}, ${msg.role}, ${msg.content})`;
  }
}

export async function createChat(
  userEmail: string,
  name: string,
  msgs: Message[]
): Promise<number> {
  const chats = await sql`
    INSERT INTO chats (user_email, name)
    VALUES (${userEmail}, ${name})
    RETURNING id
  `;

  const chatId = chats[0].id;

  for (const msg of msgs) {
    await sql`
      INSERT INTO messages (chat_id, role, content)
      VALUES (${chatId}, ${msg.role}, ${msg.content})
    `;
  }

  return chatId;
}
