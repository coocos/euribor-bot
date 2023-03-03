import TelegramBot from "node-telegram-bot-api";

import { listChats, addChat, deleteChat, addRate } from "./db.js";
import { fetchRate } from "./services/rates.js";
import { createRateMessage } from "./services/message.js";

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
        const message = await createRateMessage();
        await bot.sendMessage(msg.chat.id, message);
        break;
    }
  });

  return {
    publishRate: async () => {
      console.log("Updating euribor rate");
      const rate = await fetchRate();
      await addRate(rate);
      console.log("Publishing euribor rate");
      const message = await createRateMessage(false);
      for (const chat of await listChats()) {
        try {
          await bot.sendMessage(chat, message);
        } catch (err: unknown) {
          console.log(`Failed to publish rate to chat: ${chat}`, err);
        }
      }
    },
    stopBot: async () => {
      await bot.stopPolling();
    },
  };
}
