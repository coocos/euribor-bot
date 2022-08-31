import { JSONFile, Low } from "lowdb";
import { join } from "path";

type Data = {
  chats: number[];
  rates: {
    date: string;
    rate: number;
  }[];
};

const adapter = new JSONFile<Data>(join("data", "db.json"));
const db = new Low(adapter);

// Initialize database
await db.read();
if (db.data === null) {
  db.data = {
    chats: [],
    rates: [],
  };
  await db.write();
}

export async function addRate(rate: number) {
  await db.read();
  if (db.data === null) {
    throw new Error("Database is empty!");
  }
  db.data.rates.push({
    date: new Date().toISOString(),
    rate,
  });
  await db.write();
}

export async function getRates() {
  await db.read();
  if (db.data === null) {
    throw new Error("Database is empty!");
  }
  return db.data.rates;
}

export async function listChats() {
  await db.read();
  if (db.data === null) {
    throw new Error("Database is empty!");
  }
  return db.data.chats;
}

export async function addChat(id: number) {
  await db.read();
  if (db.data === null) {
    throw new Error("Database is empty!");
  }
  db.data.chats = [...new Set([...db.data.chats, id])];
  await db.write();
}

export async function deleteChat(id: number) {
  await db.read();
  if (db.data === null) {
    throw new Error("Database is empty!");
  }
  db.data.chats = db.data.chats.filter((chatId) => chatId !== id);
  await db.write();
}
