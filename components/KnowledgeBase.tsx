import React, { useState } from 'react';
import { CustomKnowledge } from '../types';

interface KnowledgeBaseProps {
  knowledge: CustomKnowledge[];
  onAdd: (title: string, content: string) => void;
  onRemove: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ knowledge, onAdd, onRemove, isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleAdd = () => {
    if (!title.trim() || !content.trim()) return;
    onAdd(title, content);
    setTitle('');
    setContent('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">나만의 법률 자료 추가</h2>
            <p className="text-sm text-slate-500 mt-1">
              이번 상담에서만 참고할 자료입니다. (계약서, 사규 등 / 영구 저장 안됨)
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Input Area */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-1">자료 제목 (예: 2025 임대차 계약서)</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-4"
              placeholder="자료를 식별할 수 있는 제목을 입력하세요"
            />
            
            <label className="block text-sm font-medium text-slate-700 mb-1">내용 (텍스트 붙여넣기)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="여기에 계약서 조항이나 법률 문서를 복사해서 붙여넣으세요..."
            ></textarea>
            <button 
              onClick={handleAdd}
              disabled={!title || !content}
              className="mt-3 w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              자료 추가하기
            </button>
          </div>

          {/* List Area */}
          <div>
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              현재 추가된 자료 ({knowledge.length})
            </h3>
            {knowledge.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">아직 추가된 자료가 없습니다.</p>
            ) : (
              <ul className="space-y-3">
                {knowledge.map((k) => (
                  <li key={k.id} className="bg-white border border-slate-200 rounded p-3 flex justify-between items-start shadow-sm hover:shadow-md transition-shadow">
                    <div>
                      <h4 className="font-medium text-slate-800">{k.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{k.content}</p>
                    </div>
                    <button 
                      onClick={() => onRemove(k.id)}
                      className="text-red-400 hover:text-red-600 ml-3 p-1"
                      title="삭제"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;