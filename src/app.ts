import { env } from "process";
import { CronJob } from "cron";

import { startBot } from "./bot.js";

function callPeriodically(callback: () => Promise<void>) {
  const cronPattern = env.CRON_PATTERN ?? "0 15 11 * * 2-6";
  const job = new CronJob(cronPattern, callback);
  job.start();
  return () => job.stop();
}

function startApp() {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (token === undefined) {
    throw new Error("Set TELEGRAM_BOT_TOKEN to your bot token");
  }

  console.log("Starting bot");
  const { publishRate, stopBot } = startBot(token);
  const stopPeriodicJob = callPeriodically(publishRate);

  process.on("SIGTERM", async () => {
    console.log("Stopping publishing rates");
    stopPeriodicJob();
    console.log("Stopping bot");
    await stopBot();
    process.exit();
  });
}

startApp();
