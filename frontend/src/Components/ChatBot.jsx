// src/components/ChatBot.js
import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! I am your IoT Security Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { type: 'user', text: input }]);
    setInput('');
    // Simulate bot response
    setTimeout(() => {
      setMessages((msgs) => [...msgs, { type: 'bot', text: "I'm here to help!" }]);
    }, 700);
  };

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white shadow-lg rounded-lg flex flex-col">
      <div className="flex items-center px-4 py-2 border-b">
        <MessageSquare className="mr-2 text-blue-500" />
        <span className="font-semibold">Fix Assistant</span>
      </div>
      <div className="flex-1 px-4 py-2 overflow-y-auto" style={{ maxHeight: '300px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-3 py-2 rounded-lg text-sm ${msg.type === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex border-t px-2 py-2">
        <input
          type="text"
          className="flex-1 px-2 py-1 rounded border focus:outline-none"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit" className="ml-2 px-3 py-1 bg-blue-500 text-white rounded">Send</button>
      </form>
    </div>
  );
};

export default ChatBot;