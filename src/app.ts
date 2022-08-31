import { env } from "process";
import { CronJob } from "cron";

import { startBot } from "./bot.js";

const token = env.TELEGRAM_BOT_TOKEN;
if (token === undefined) {
  throw new Error("Set TELEGRAM_BOT_TOKEN to your bot token");
}

const publishRate = startBot(token);
const cronPattern = env.CRON_PATTERN ?? "0 0 19 * * *";
const job = new CronJob(cronPattern, publishRate);
job.start();
