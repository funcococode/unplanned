'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';
import type { MessageDto, TripDto } from '@/types';
import { Avatar } from '@/components/shared/avatar';
import { timeAgo } from '@/lib/utils';

interface ChatRoomProps {
  trip: TripDto;
  initialMessages: MessageDto[];
  currentUserId: string;
}

export function ChatRoom({ trip, initialMessages, currentUserId }: ChatRoomProps) {
  const [messages, setMessages] = useState<MessageDto[]>(initialMessages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastTimestampRef = useRef<string>(
    initialMessages.length > 0 ? initialMessages[initialMessages.length - 1].createdAt : new Date(0).toISOString()
  );

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/trips/${trip.id}/messages?after=${encodeURIComponent(lastTimestampRef.current)}`, { credentials: 'include' });
        if (!res.ok) return;
        const newMsgs: MessageDto[] = await res.json();
        if (newMsgs.length > 0) {
          setMessages((prev) => [...prev, ...newMsgs]);
          lastTimestampRef.current = newMsgs[newMsgs.length - 1].createdAt;
        }
      } catch { /* ignore network errors */ }
    };
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [trip.id]);

  const sendMessage = useCallback(async () => {
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    setInput('');
    try {
      const res = await fetch(`/api/trips/${trip.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const msg: MessageDto = await res.json();
        setMessages((prev) => [...prev, msg]);
        lastTimestampRef.current = msg.createdAt;
      }
    } catch { /* ignore */ } finally { setSending(false); }
  }, [input, sending, trip.id]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shrink-0">
        <Link href={`/trips/${trip.id}`} className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{trip.title}</p>
          <p className="text-xs text-gray-500 truncate">{trip.destination}</p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Live
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">No messages yet. Say hello! 👋</p>
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={`flex items-end gap-2.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
              {!isOwn && <Avatar src={msg.sender.image} name={msg.sender.name} size="sm" className="shrink-0" />}
              <div className={`max-w-[70%] flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                {!isOwn && <span className="text-xs text-gray-500 ml-1">{msg.sender.name}</span>}
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isOwn ? 'bg-gray-900 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                  {msg.content}
                </div>
                <span className="text-xs text-gray-400 mx-1">{timeAgo(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 p-4 shrink-0">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <textarea
            value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Type a message..." rows={1}
            className="flex-1 resize-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent max-h-32"
          />
          <button onClick={sendMessage} disabled={sending || !input.trim()}
            className="flex items-center justify-center w-10 h-10 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-40 transition-colors shrink-0">
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
