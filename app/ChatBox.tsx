import React from 'react';
import { useChat } from 'ai/react';
import { Send, User, Bot } from 'lucide-react';

export default function ChatBox() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="bg-gray-100 rounded-lg p-4 flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4">旅行アシスタント</h2>
      <div className="flex-grow overflow-y-auto mb-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
            <div className={`max-w-[70%] p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white'}`}>
              <div className="flex items-center mb-1">
                {message.role === 'user' ? <User className="w-4 h-4 mr-1" /> : <Bot className="w-4 h-4 mr-1" />}
                <span className="text-xs font-semibold">{message.role === 'user' ? 'あなた' : 'アシスタント'}</span>
              </div>
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="メッセージを入力..."
          className="flex-grow p-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}