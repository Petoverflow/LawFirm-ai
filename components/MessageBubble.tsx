import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, Sender } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === Sender.USER;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[95%] md:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-600 ml-3' : 'bg-slate-700 mr-3'}`}>
          {isUser ? (
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          ) : (
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
          )}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full overflow-hidden`}>
          {/* Reverted Text Size: text-sm (mobile) md:text-base (desktop) */}
          <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${
            isUser 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
          }`}>
            {/* Show Typing Indicator if text is empty (loading state) */}
            {!message.text && !isUser ? (
              <div className="flex space-x-1 h-6 items-center px-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            ) : (
              /* Render Markdown */
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="pl-1" {...props} />,
                  h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-4 mb-2" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-base font-bold mt-3 mb-2" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-sm font-bold mt-2 mb-1" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-inherit" {...props} />,
                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                  a: ({node, ...props}) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-300 pl-4 py-1 my-2 text-slate-500 italic bg-slate-50 rounded-r" {...props} />,
                  code: ({node, ...props}) => <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono text-pink-600" {...props} />,
                }}
              >
                {message.text}
              </ReactMarkdown>
            )}
          </div>
          
          {/* Grounding Sources (Only for Bot) */}
          {!isUser && message.groundingChunks && message.groundingChunks.length > 0 && (
             <div className="mt-2 text-xs bg-slate-100 p-2.5 rounded-lg w-full border border-slate-200">
               <span className="font-semibold text-slate-500 block mb-1.5 flex items-center">
                 <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                 참고 자료
               </span>
               <div className="flex flex-wrap gap-2">
                 {message.groundingChunks.map((chunk, idx) => {
                   if (!chunk.web?.uri) return null;
                   return (
                     <a 
                       key={idx} 
                       href={chunk.web.uri} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded border border-blue-100 transition-colors flex items-center max-w-full"
                     >
                       <span className="truncate max-w-[150px] md:max-w-[200px]">{chunk.web.title || chunk.web.uri}</span>
                     </a>
                   );
                 })}
               </div>
             </div>
          )}

          <span className="text-xs text-slate-400 mt-1 px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;