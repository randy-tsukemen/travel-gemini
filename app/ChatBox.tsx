"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Send } from "lucide-react";
import { ChatClient } from "dify-client";
import RecommendedPlace from "./RecommendedPlace";
import { API_KEY, API_URL } from "@/config";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

interface Message {
  text: string;
  sender: "user" | "bot";
  recommendations?: string[];
}

interface ChatBoxProps {
  onPlaceSelect: (place: string) => void;
}

const client = new ChatClient(API_KEY, API_URL);

export default function ChatBox({ onPlaceSelect }: ChatBoxProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "こんにちは！旅行の計画をお手伝いします。どんな場所に行きたいですか？",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: input, sender: "user" },
      ]);
      setInput("");

      try {
        const response = await client.createChatMessage(
          {}, // inputs (empty object as we don't have any specific inputs)
          input, // query
          "user", // user identifier (you might want to replace this with an actual user ID)
          false, // stream (set to false for blocking response)
          null, // conversation_id (null for a new conversation)
          null // files (null as we're not sending any files)
        );

        const botResponse = getBotResponse(response.data.answer);
        setMessages((prevMessages) => [...prevMessages, botResponse]);
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "エラーが発生しました。もう一度お試しください。",
            sender: "bot",
          },
        ]);
      }
    }
  };

  const getBotResponse = (answer: string): Message => {
    const lowerAnswer = answer.toLowerCase();
    let recommendations: string[] | undefined;

    if (lowerAnswer.includes("観光")) {
      recommendations = ["東京タワー", "浅草寺", "上野公園"];
    } else if (
      lowerAnswer.includes("食事") ||
      lowerAnswer.includes("レストラン")
    ) {
      recommendations = ["寿司 銀座", "ラーメン 一蘭", "天ぷら 天喜"];
    }

    return {
      text: answer,
      sender: "bot",
      recommendations,
    };
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
          />
          <button
            onClick={handleSend}
            className="p-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
