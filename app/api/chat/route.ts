import { convertToCoreMessages, streamText } from "ai";
import { createOpenAI as createGroq } from "@ai-sdk/openai";

const groq = createGroq({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: groq("llama-3.1-70b-versatile"),
    system:
      "あなたは東京、日本のための頼りになる旅行アシスタントです。観光スポット、交通機関、そして地元の習慣に関するおすすめや質問にお答えします。できるだけ日本語を使用してください。",
    messages: convertToCoreMessages(messages),
  });

  return result.toDataStreamResponse();
}
