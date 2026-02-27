export interface ChatbotResponse {
  answer: string;
  sources?: {
    document: string;
    chunk_index: number;
    context: string;
  }[];
}

export async function askChatbot(
  question: string,
  context: string | null
): Promise<ChatbotResponse> {
  const response = await fetch("/api/chatbot/ask/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      context,
      top_k: 3,
    }),
  });

  if (!response.ok) {
    throw new Error("Chatbot API failed");
  }

  return response.json();
}