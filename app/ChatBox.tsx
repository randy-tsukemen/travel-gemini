"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import RecommendedPlace from "./RecommendedPlace";
import { API_KEY, API_URL } from "@/config";
import Toast from "@/app/toast";

interface Message {
  text: string;
  sender: "user" | "bot";
  recommendations?: string[];
}

interface ChatBoxProps {
  onPlaceSelect: (place: string) => void;
}

export default function ChatBox({ onPlaceSelect }: ChatBoxProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "こんにちは！旅行の計画をお手伝いします。どんな場所に行きたいですか？",
      sender: "bot",
      isComplete: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isResponseComplete, setIsResponseComplete] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const TypingIndicator = () => (
    <div className="flex space-x-1 mt-2">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
    </div>
  );

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { text: input, sender: "user" };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput("");
      setIsResponseComplete(false);

      try {
        const response = await fetch(`${API_URL}/chat-messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: {},
            query: input,
            response_mode: "streaming",
            conversation_id: "", // You might want to store and pass the conversation_id for continued conversations
            user: "user", // Replace with actual user identifier
          }),
        });

        if (response.ok) {
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let fullBotResponse = "";
          let displayedWords = 0;
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: "", sender: "bot", isComplete: false },
          ]);

          const updateBotMessage = async (
            newText: string,
            isComplete: boolean
          ) => {
            const newWords = newText.split(" ");
            for (let i = displayedWords; i < newWords.length; i++) {
              displayedWords++;
              setMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                newMessages[newMessages.length - 1] = {
                  text: newWords.slice(0, displayedWords).join(" "),
                  sender: "bot",
                  isComplete: isComplete,
                };
                return newMessages;
              });
              await new Promise((resolve) => setTimeout(resolve, 80)); // 0.08 second delay
            }
          };

          while (true) {
            const { done, value } = await reader?.read();
            if (done) {
              await updateBotMessage(fullBotResponse, true);
              setIsResponseComplete(true);
              break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const jsonData = JSON.parse(line.slice(6));
                if (jsonData.event === "message") {
                  const newContent = jsonData.answer;
                  fullBotResponse += newContent;
                  await updateBotMessage(fullBotResponse, false);
                } else if (jsonData.event === "message_end") {
                  await updateBotMessage(fullBotResponse, true);
                  setIsResponseComplete(true);
                }
              }
            }
          }
        } else {
          throw new Error("Failed to fetch response");
        }
      } catch (error) {
        console.error("Error sending message:", error);
        Toast.notify({
          type: "error",
          message: "エラーが発生しました。もう一度お試しください。",
        });
        setIsResponseComplete(true);
      }
    }
  };

  const customComponents = {
    ul: ({ children }: { children: React.ReactNode }) => (
      <ul className="list-disc pl-4 my-2">{children}</ul>
    ),
    ol: ({ children }: { children: React.ReactNode }) => (
      <ol className="list-decimal pl-4 my-2">{children}</ol>
    ),
    li: ({ children }: { children: React.ReactNode }) => (
      <li className="mb-1">{children}</li>
    ),
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-3/4 p-3 rounded-lg ${
                message.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <ReactMarkdown
                components={customComponents}
                rehypePlugins={[rehypeRaw]}
              >
                {message.text}
              </ReactMarkdown>
              {message.sender === "bot" && !message.isComplete && (
                <TypingIndicator />
              )}
              {message.recommendations && (
                <div className="mt-2 space-y-2">
                  {message.recommendations.map((place, placeIndex) => (
                    <RecommendedPlace
                      key={placeIndex}
                      place={place}
                      onSelect={onPlaceSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="メッセージを入力..."
            className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!isResponseComplete}
          />
          <button
            onClick={handleSend}
            className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
            disabled={!isResponseComplete}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
