import React from 'react';
import { Session } from '../types';

interface SidebarProps {
  isOpen: boolean;
  sessions: Session[];
  currentSessionId: string;
  knowledgeCount: number;
  activeMenuSessionId: string | null;
  onClose: () => void;
  onNewSession: () => void;
  onSelectSession: (id: string) => void;
  onOpenKnowledge: () => void;
  onLatestBriefing: () => void;
  onMenuTrigger: (sessionId: string, rect: DOMRect) => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  sessions,
  currentSessionId,
  knowledgeCount,
  activeMenuSessionId,
  onClose,
  onNewSession,
  onSelectSession,
  onOpenKnowledge,
  onLatestBriefing,
  onMenuTrigger,
  onOpenSettings
}) => {
  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full bg-slate-900 text-white p-4">
          <div className="flex items-center mb-6 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-700 to-slate-800 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 border border-slate-600">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Personal LawBot</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">My Private Counsel</p>
            </div>
          </div>

          <button
            onClick={onNewSession}
            className="w-full flex items-center justify-center p-3 bg-blue-700 hover:bg-blue-600 rounded-lg transition-colors text-sm mb-4 font-semibold shadow-md active:transform active:scale-95 flex-shrink-0 border border-blue-600"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            새 상담 시작
          </button>

          <div className="mb-4 space-y-2 flex-shrink-0">
            <button
              onClick={() => { onOpenKnowledge(); onClose(); }}
              className="w-full flex items-center p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-xs font-medium text-slate-300"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              의뢰인 자료실 ({knowledgeCount})
            </button>
            <button
              onClick={() => { onLatestBriefing(); onClose(); }}
              className="w-full flex items-center p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-xs font-medium text-slate-300"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
              월간 법률 브리핑
            </button>
          </div>

          <div className="h-px bg-slate-700 my-2 flex-shrink-0"></div>

          <div
            className="flex-1 overflow-y-auto min-h-0 pr-1"
          >
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">상담 기록</h2>
            <div className="space-y-1">
              {sessions.map(session => (
                <div key={session.id} className="relative group mb-1">
                  <div
                    onClick={() => { onSelectSession(session.id); onClose(); }}
                    // Long Press Logic for Mobile
                    onTouchStart={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      // Store the timer ID in a data attribute or closure if possible, but React synthetic events are tricky.
                      // Using a simple window timeout approach for this functional component iteration.
                      const timer = window.setTimeout(() => {
                        onMenuTrigger(session.id, rect);
                      }, 600); // 600ms long press
                      e.currentTarget.dataset.longPressTimer = String(timer);
                    }}
                    onTouchEnd={(e) => {
                      const timer = Number(e.currentTarget.dataset.longPressTimer);
                      if (timer) clearTimeout(timer);
                    }}
                    onTouchMove={(e) => {
                      // Cancel if user scrolls/moves finger
                      const timer = Number(e.currentTarget.dataset.longPressTimer);
                      if (timer) clearTimeout(timer);
                    }}
                    onContextMenu={(e) => {
                      // Prevent default context menu on right click/long press if we are handling it
                      e.preventDefault();
                      const rect = e.currentTarget.getBoundingClientRect();
                      onMenuTrigger(session.id, rect);
                    }}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-all cursor-pointer select-none pr-8 flex items-center ${currentSessionId === session.id
                        ? 'bg-slate-700 text-white shadow'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      } ${session.isPinned ? 'border-l-2 border-blue-400 pl-2.5' : ''}`}
                  >
                    {session.isPinned && (
                      <svg className="w-3 h-3 mr-2 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{session.title}</div>
                      <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                        {session.lastModified.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Three Dots Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      onMenuTrigger(session.id, rect);
                    }}
                    className={`absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-slate-900/50 text-slate-400 hover:text-white transition-all z-10 ${currentSessionId === session.id || activeMenuSessionId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 md:opacity-0'
                      }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-700 text-xs text-slate-500 flex justify-between items-center">
            <p>Powered by Gemini 3.0</p>
            <button
              onClick={onOpenSettings}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
              title="API Key 설정"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;