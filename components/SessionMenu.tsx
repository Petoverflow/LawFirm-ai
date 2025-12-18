import React from 'react';
import { Session } from '../types';

interface SessionMenuProps {
  activeSession: Session;
  position: { top: number, left: number };
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const SessionMenu: React.FC<SessionMenuProps> = ({ 
  activeSession, 
  position, 
  onPin, 
  onDelete,
  onClose 
}) => {
  return (
    <>
      {/* Backdrop to close menu */}
      <div 
        className="fixed inset-0 z-[99]" 
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />
      <div 
        className="fixed w-32 bg-white rounded-md shadow-lg py-1 z-[100] border border-slate-200"
        style={{ top: position.top, left: position.left }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
            onPin(activeSession.id);
          }}
          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center"
        >
          {activeSession.isPinned ? (
            <>
              <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
              고정 해제
            </>
          ) : (
            <>
              <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
              상단 고정
            </>
          )}
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(activeSession.id);
          }}
          className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center"
        >
          <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          대화 삭제
        </button>
      </div>
    </>
  );
};

export default SessionMenu;