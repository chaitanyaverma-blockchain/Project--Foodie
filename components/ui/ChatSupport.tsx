'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';

export function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hi there! 👋 How can we help you today?', isBot: true },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, text: message, isBot: false },
    ]);
    setMessage('');

    // Auto reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          text: "Thanks for your message! Our team will get back to you shortly. You can also call us at 1800-123-4567.",
          isBot: true,
        },
      ]);
    }, 1000);
  };

  return (
    <>
      {/* Chat Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-[#FF6B00] hover:bg-[#E56000] text-white rounded-full flex items-center justify-center shadow-orange hover:shadow-glow-orange transition-all group"
            aria-label="Open chat support"
          >
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-[#FF6B00] animate-ping opacity-20" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-40 w-80 sm:w-96 bg-bg-card dark:bg-[#1E1E1E] rounded-2xl shadow-2xl border border-border-light dark:border-[#2A2A2A] overflow-hidden flex flex-col"
            style={{ maxHeight: '480px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#FF6B00] text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Foodie Support</p>
                  <p className="text-[10px] text-white/70 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                    Online now
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[300px]">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.isBot
                        ? 'bg-bg-secondary dark:bg-[#262626] text-text-primary rounded-bl-md'
                        : 'bg-[#FF6B00] text-white rounded-br-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-border-light dark:border-[#2A2A2A] px-3 py-2.5 flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 px-3 py-2 bg-bg-secondary dark:bg-[#18181B] rounded-xl text-sm text-text-primary dark:text-white placeholder:text-text-muted dark:placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#FF6B00] border border-transparent dark:border-[#353B46]"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#FF6B00] text-white hover:bg-[#E56000] transition-colors disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
