import TelegramBot from "node-telegram-bot-api";

import { listChats, addChat, deleteChat, getRates, addRate } from "./db.js";
import { fetchRate } from "./euribor.js";

function getRisingRateEmoji() {
  const emojis = ["🚀", "📈", "💸", "💀"];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

function getFallingRateEmoji() {
  const emojis = ["📉", "⬇️"];
  return emojis[Math.floor(Math.random() * emojis.length)];
}

async function getRateMessage() {
  const rates = await getRates();
  const [prev, current] = rates.slice(-2);
  if (prev === undefined) {
    return "No rates found";
  }
  if (current === undefined) {
    return `Euribor: ${prev.rate}%`;
  }
  let emoji = "🤷‍♂️";
  if (current.rate > prev.rate) {
    emoji = getRisingRateEmoji();
  } else if (current.rate < prev.rate) {
    emoji = getFallingRateEmoji();
  }
  return `Euribor: ${current.rate}% ${emoji}`;
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

  return {
    publishRate: async () => {
      console.log("Updating euribor rate");
      const rate = await fetchRate();
      await addRate(rate);
      console.log("Publishing euribor rate");
      const message = await getRateMessage();
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
