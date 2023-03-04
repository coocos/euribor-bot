import { join } from "path";

import { JSONFile, Low } from "lowdb";

type Data = {
  chats: number[];
  rates: {
    date: string;
    rate: number;
  }[];
};

const db = new Low(new JSONFile<Data>(join("data", "db.json")));

export async function getDatabase() {
  await db.read();
  // Initialize if needed
  if (db.data === null) {
    db.data = {
      chats: [],
      rates: [],
    };
    await db.write();
  }
  return db as typeof db & {
    data: Data;
  };
}
