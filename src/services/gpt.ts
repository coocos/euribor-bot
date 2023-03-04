import { Configuration, OpenAIApi } from "openai";

import prompts from "./prompts.json" assert { type: "json" };

const MODEL = "gpt-3.5-turbo";

function configureClient() {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  return new OpenAIApi(configuration);
}

export async function generateComment(
  mood: "positive" | "negative" | "neutral"
) {
  const client = configureClient();
  const completion = await client.createChatCompletion({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: prompts[mood].system,
      },
      {
        role: "user",
        content: prompts[mood].user,
      },
    ],
  });
  if (!completion.data.choices[0].message) {
    throw new Error("Empty API response");
  }
  return completion.data.choices[0].message.content.replace(/"/g, "");
}
