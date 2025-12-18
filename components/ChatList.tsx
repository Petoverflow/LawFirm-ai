import React, { useRef, useEffect } from 'react';
import { Message, Sender, Session } from '../types';
import MessageBubble from './MessageBubble';
import Disclaimer from './Disclaimer';

interface ChatListProps {
  currentSession: Session;
  onResetSession: () => void;
  onOpenSidebar: () => void;
  onNewSession: () => void;
}

const ChatList: React.FC<ChatListProps> = ({
  currentSession,
  onResetSession,
  onOpenSidebar,
  onNewSession
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  const messages = currentSession.messages || [];

  const prevMessagesLengthRef = useRef(messages.length);

  const scrollToBottom = (smooth = false) => {
    // Determine scroll behavior: smooth for new messages, auto (instant) for streaming to allow reading
    // Using 'auto' prevents the "fighting" effect when user tries to scroll up during stream
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      // Reduced threshold to 30px to make it easier for user to "break free" from auto-scroll
      const isBottom = scrollHeight - scrollTop - clientHeight < 30;
      isAtBottomRef.current = isBottom;
    }
  };

  // Scroll on new messages if at bottom
  useEffect(() => {
    const isNewMessage = messages.length > prevMessagesLengthRef.current;

    if (isAtBottomRef.current) {
      scrollToBottom(isNewMessage);
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages, currentSession.id]);

  return (
    // Removed h-full to prevent conflict with flex-col parent containing ChatInput
    <div className="flex-1 flex flex-col relative min-w-0 overflow-hidden">
      {/* Mobile Header - Fixed at top relative to this flex container */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 text-white shadow-md z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="p-1 -ml-1 rounded hover:bg-slate-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <span className="font-bold text-base tracking-tight">Personal LawBot</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onResetSession}
            className="text-slate-300 hover:text-white p-1 rounded-full hover:bg-slate-800"
            title="현재 대화 초기화"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </button>
        </div>
      </header>

      {/* Scrollable Message List */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        // Changed padding: p-4 -> py-4 px-0 (mobile) / md:p-8 (desktop)
        className="flex-1 overflow-y-auto py-4 px-0 md:p-8 scroll-smooth overscroll-contain"
      >
        <div className="max-w-3xl mx-auto">
          {/* Desktop Header / Reset Button */}
          <div className="flex justify-between items-center mb-4 px-4 md:px-1">
            <span className="text-xs md:text-sm font-medium text-slate-500 md:hidden truncate max-w-[200px]">
              {currentSession.title}
            </span>
            <button
              onClick={onResetSession}
              className="ml-auto hidden md:flex items-center text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-slate-100"
              title="현재 상담 내용만 초기화"
            >
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              상담 초기화
            </button>
          </div>

          <div className="px-3 md:px-0">
            <Disclaimer />
          </div>

          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.sender === Sender.SYSTEM ? (
                <div className="flex justify-center mb-6">
                  <span className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                    {msg.text}
                  </span>
                </div>
              ) : (
                <MessageBubble message={msg} />
              )}
            </div>
          ))}
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>
    </div>
  );
};

export default ChatList;