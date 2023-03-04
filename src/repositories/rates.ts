import { getDatabase } from "./db.js";

export async function addRate(rate: number) {
  const db = await getDatabase();
  db.data.rates.push({
    date: new Date().toISOString(),
    rate,
  });
  await db.write();
}

export async function getRates() {
  const db = await getDatabase();
  return db.data.rates;
}
