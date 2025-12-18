import React, { useRef, useEffect } from 'react';
import { ExpertMode } from '../types';

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  selectedMode: ExpertMode;
  setInput: (value: string) => void;
  onSendMessage: () => void;
  onOpenKnowledge: () => void;
  onSelectMode: (mode: ExpertMode) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  isLoading,
  selectedMode,
  setInput,
  onSendMessage,
  onOpenKnowledge,
  onSelectMode
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px'; // Cap height
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const modes = [
    { id: ExpertMode.GENERAL, label: '일반 법률', color: 'bg-blue-100 text-blue-700 border-blue-300', activeColor: 'bg-blue-600 text-white shadow-md' },
    { id: ExpertMode.TAX, label: '세무/회계', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', activeColor: 'bg-emerald-600 text-white shadow-md' },
    { id: ExpertMode.LABOR, label: '인사/노무', color: 'bg-amber-100 text-amber-700 border-amber-300', activeColor: 'bg-amber-600 text-white shadow-md' },
    { id: ExpertMode.CORPORATE, label: '기업 법무', color: 'bg-slate-200 text-slate-700 border-slate-300', activeColor: 'bg-slate-700 text-white shadow-md' },
  ];

  return (
    // Mobile: No padding (full width). Desktop: px-6 py-4.
    <div className="bg-white border-t border-slate-200 p-0 md:px-6 md:py-4 flex-shrink-0 z-20 pb-safe">
      <div className="max-w-3xl mx-auto flex flex-col gap-0 md:gap-2">
         {/* Expert Mode Tabs */}
         {/* Mobile: Add padding since parent has none. */}
         <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 px-3 md:px-0 md:-mx-1">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap flex-shrink-0 ${
                  selectedMode === mode.id 
                    ? `${mode.activeColor} border-transparent` 
                    : `bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100`
                }`}
              >
                {selectedMode === mode.id && <span className="mr-1.5">✓</span>}
                {mode.label}
              </button>
            ))}
         </div>

         {/* Input Area */}
         {/* Mobile: Square corners (rounded-none), no side borders, full width. Desktop: rounded-2xl. */}
         <div className={`flex items-end gap-2 bg-slate-50 border-t md:border border-slate-300 rounded-none md:rounded-2xl p-2 shadow-none md:shadow-sm focus-within:ring-0 md:focus-within:ring-2 focus-within:ring-opacity-50 transition-all ${
             selectedMode === ExpertMode.TAX ? 'md:focus-within:ring-emerald-500 md:focus-within:border-emerald-500' :
             selectedMode === ExpertMode.LABOR ? 'md:focus-within:ring-amber-500 md:focus-within:border-amber-500' :
             selectedMode === ExpertMode.CORPORATE ? 'md:focus-within:ring-slate-500 md:focus-within:border-slate-500' :
             'md:focus-within:ring-blue-500 md:focus-within:border-blue-500'
         }`}>
             <button
               onClick={onOpenKnowledge}
               className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-xl hover:bg-slate-200 flex-shrink-0"
               title="자료(계약서 등) 추가"
             >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             </button>

             <textarea
               ref={inputRef}
               rows={1}
               className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 text-slate-800 py-2.5 px-1 leading-relaxed placeholder-slate-400 text-sm md:text-base min-h-[44px]"
               placeholder={
                 selectedMode === ExpertMode.TAX ? "상속세, 증여세, 절세 관련 문의..." :
                 selectedMode === ExpertMode.LABOR ? "해고, 임금, 근로계약 문의..." :
                 selectedMode === ExpertMode.CORPORATE ? "계약 검토, 주주총회, 법인 자문..." :
                 "법률적인 궁금증을 입력하세요..."
               }
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={handleKeyDown}
             />
             
             <button
               onClick={onSendMessage}
               disabled={!input.trim() || isLoading}
               className={`p-2 mb-0.5 text-white rounded-xl disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex-shrink-0 shadow-sm ${
                   selectedMode === ExpertMode.TAX ? 'bg-emerald-600 hover:bg-emerald-700' :
                   selectedMode === ExpertMode.LABOR ? 'bg-amber-600 hover:bg-amber-700' :
                   selectedMode === ExpertMode.CORPORATE ? 'bg-slate-700 hover:bg-slate-800' :
                   'bg-blue-600 hover:bg-blue-700'
               }`}
             >
               {isLoading ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
               ) : (
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7"></path></svg>
               )}
             </button>
         </div>
         
         <p className="text-center text-[10px] text-slate-400 hidden md:block">
           AI 법률 자문은 참고용이며, 최종 의사결정은 실제 전문가와 상의하십시오.
         </p>
      </div>
    </div>
  );
};

export default ChatInput;