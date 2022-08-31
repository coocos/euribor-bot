import TelegramBot from "node-telegram-bot-api";

import { listChats, addChat, deleteChat, getRates, addRate } from "./db.js";
import { fetchRate } from "./euribor.js";

async function getRateMessage() {
  const rates = await getRates();
  const [prev, current] = rates.slice(-2);
  if (prev === undefined) {
    return "No rates found";
  }
  if (current === undefined) {
    return `Joribor: ${prev.rate}%`;
  }
  const emoji = current.rate > prev.rate ? "🚀" : "📉";
  return `Joribor: ${current.rate}% ${emoji}`;
}

export function startBot(token: string) {
  const bot = new TelegramBot(token, { polling: true });

  bot.onText(/\/euribor (register|unregister|rate).*/i, async (msg, match) => {
    if (match === null) {
      return;
    }
    const command = match[1];
    switch (command) {
      case "register":
        console.log(`Registering chat: ${msg.chat.id}`);
        await addChat(msg.chat.id);
        await bot.sendMessage(msg.chat.id, "Chat registered");
        break;
      case "unregister":
        console.log(`Deleting chat: ${msg.chat.id}`);
        await deleteChat(msg.chat.id);
        await bot.sendMessage(msg.chat.id, "Chat removed");
        break;
      case "rate":
        const message = await getRateMessage();
        await bot.sendMessage(msg.chat.id, message);
        break;
    }
  });

  return async () => {
    console.log("Updating euribor rates");
    const rate = await fetchRate();
    await addRate(rate);
    const message = await getRateMessage();
    for (const chat of await listChats()) {
      await bot.sendMessage(chat, message);
    }
  };
}
