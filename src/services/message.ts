import LRUCache from "lru-cache";

import { getRates } from "../db.js";
import { generateComment } from "./gpt.js";

const CACHE_KEY = "rate.message";
const CACHE_TTL = 1000 * 60 * 15;
const CACHE_MAX_SIZE = 64;

const cache = new LRUCache<string, string>({
  ttl: CACHE_TTL,
  max: CACHE_MAX_SIZE,
});

export async function createRateMessage(useCache = true) {
  if (useCache && cache.has(CACHE_KEY)) {
    console.log("Cache hit for rate message");
    return cache.get(CACHE_KEY)!;
  }
  console.log("Cache miss for rate message");

  const rates = await getRates();
  const [prev, current] = rates.slice(-2);
  if (prev === undefined) {
    return "No rates found";
  }
  if (current === undefined) {
    return `Euribor: ${prev.rate}%`;
  }
  let message = `12 kk euribor on edelleen ${current.rate}%. `;
  if (current.rate > prev.rate) {
    message = `12 kk euribor nousi ja on jo ${
      current.rate
    }%! ${await generateComment("negative")}`;
  } else if (current.rate < prev.rate) {
    message = `12 kk euribor laski ja on taas ${
      current.rate
    }%! ${await generateComment("positive")}`;
  } else {
    message += await generateComment("neutral");
  }
  cache.set(CACHE_KEY, message);
  return message;
}
