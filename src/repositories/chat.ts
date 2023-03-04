import { getDatabase } from "./db.js";

export async function listChats() {
  const db = await getDatabase();
  return db.data.chats;
}

export async function addChat(id: number) {
  const db = await getDatabase();
  db.data.chats = [...new Set([...db.data.chats, id])];
  await db.write();
}

export async function deleteChat(id: number) {
  const db = await getDatabase();
  db.data.chats = db.data.chats.filter((chatId) => chatId !== id);
  await db.write();
}
