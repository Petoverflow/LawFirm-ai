import React, { useState, useEffect } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
  onClose: () => void;
  hasKey: boolean; // To determine if it's an initial setup or an edit
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave, onClose, hasKey }) => {
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
        setKeyInput('');
        setError('');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!keyInput.trim()) {
      setError('API Key를 입력해주세요.');
      return;
    }
    if (!keyInput.startsWith('AIza')) {
       setError('올바른 Gemini API Key 형식이 아닌 것 같습니다 (AIza로 시작).');
       // We don't block it, just warn, but let's clear error if they proceed
    }
    onSave(keyInput.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 md:p-8 transform transition-all">
        <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 11 9 13.536 8.536 13 7 14.536 7 16l-3 3 1 1 3-3V13l3.536-3.536 2.536-2.536a6 6 0 018-8z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {hasKey ? 'API Key 변경' : 'Personal LawBot 시작하기'}
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
                Gemini API Key를 입력하여 나만의 법률 비서를 활성화하세요.<br/>
                키는 <strong>브라우저에만 저장</strong>되며 서버로 전송되지 않습니다.
            </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gemini API Key</label>
            <input 
              type="password" 
              value={keyInput}
              onChange={(e) => {
                  setKeyInput(e.target.value);
                  setError('');
              }}
              placeholder="AIzaSy..."
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
            />
            {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md active:transform active:scale-[0.98]"
          >
            {hasKey ? '변경 사항 저장' : 'LawBot 시작하기'}
          </button>
          
          {hasKey && (
              <button 
                onClick={onClose}
                className="w-full py-2 text-slate-500 text-sm hover:text-slate-700"
              >
                취소
              </button>
          )}

          <div className="pt-4 border-t border-slate-100 text-center">
             <a 
               href="https://aistudio.google.com/app/apikey" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-xs text-blue-500 hover:text-blue-700 hover:underline flex items-center justify-center gap-1"
             >
               API Key가 없으신가요? 여기서 무료로 발급받으세요
               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
             </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;