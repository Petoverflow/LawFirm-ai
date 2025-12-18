import React, { useState, useEffect, useCallback } from 'react';
import { Sender, Message, CustomKnowledge, GroundingChunk, Session, ExpertMode } from './types';
import { sendMessageToGeminiStream } from './services/geminiService';
import KnowledgeBase from './components/KnowledgeBase';
import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import ChatInput from './components/ChatInput';
import SessionMenu from './components/SessionMenu';
import ApiKeyModal from './components/ApiKeyModal';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<ExpertMode>(ExpertMode.GENERAL);

  // -- API Key State --
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // -- Session State Management --
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');

  // -- UI State --
  const [isLoading, setIsLoading] = useState(false);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenuSessionId, setActiveMenuSessionId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number, left: number } | null>(null);

  // Delete Modal State
  const [sessionToDeleteId, setSessionToDeleteId] = useState<string | null>(null);

  // Load API Key on mount
  useEffect(() => {
    // Shared Key (from GitHub Secrets) takes priority so everyone uses the paid key
    const sharedKey = process.env.GEMINI_API_KEY;
    const storedKey = localStorage.getItem('lawbot_api_key');

    // Use shared key if available, otherwise fall back to user-entered key
    const keyToUse = sharedKey || storedKey;

    if (keyToUse) {
      setApiKey(keyToUse);
    } else {
      setIsApiKeyModalOpen(true);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('lawbot_api_key', key);
    setApiKey(key);
    setIsApiKeyModalOpen(false);
  };

  const handleOpenSettings = () => {
    setIsApiKeyModalOpen(true);
    setIsSidebarOpen(false);
  };

  // Initialize with one session if none exist
  useEffect(() => {
    if (sessions.length === 0) {
      createNewSession();
    }
  }, []);

  // -- Helpers to get current session data --
  const getCurrentSession = useCallback(() => {
    return sessions.find(s => s.id === currentSessionId) || sessions[0];
  }, [sessions, currentSessionId]);

  // Sort sessions: Pinned first, then by lastModified desc
  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
  });

  const createNewSession = () => {
    const newId = Date.now().toString();
    const newSession: Session = {
      id: newId,
      title: '새로운 법률 상담',
      messages: [{
        id: `welcome-${newId}`,
        text: '안녕하세요. **Personal LawBot**입니다.\n\n저는 **2025년 최신 판례와 개정 법령**까지 실시간으로 검색하여 분석해 드리는 귀하만의 **개인 전담 법률 파트너**입니다.\n\n아래에서 전문 분야(일반/세무/노무/기업)를 선택하시고, 편하게 질문해 주세요.',
        sender: Sender.BOT,
        timestamp: new Date()
      }],
      customKnowledge: [],
      createdAt: new Date(),
      lastModified: new Date(),
      isPinned: false
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);

    // Reset UI state
    setInput('');
    setIsLoading(false);
    setIsSidebarOpen(false);
  };

  // Step 1: Request Delete (Opens Modal)
  const handleDeleteRequest = (sessionId: string) => {
    setActiveMenuSessionId(null); // Close the menu first
    setSessionToDeleteId(sessionId); // Open the confirmation modal
  };

  // Step 2: Confirm Delete (Actual Logic)
  const confirmDelete = () => {
    if (!sessionToDeleteId) return;

    const newSessions = sessions.filter(s => s.id !== sessionToDeleteId);
    let nextSessionId = currentSessionId;

    // If we are deleting the currently active session
    if (currentSessionId === sessionToDeleteId) {
      if (newSessions.length > 0) {
        nextSessionId = newSessions[0].id;
      } else {
        nextSessionId = "";
      }
    }

    if (nextSessionId === "") {
      // Create a fresh session if we deleted the last one
      const tempId = (Date.now() + 1).toString();
      const newSession: Session = {
        id: tempId,
        title: '새로운 법률 상담',
        messages: [{
          id: `welcome-${tempId}`,
          text: '안녕하세요. **Personal LawBot**입니다.\n\n저는 **2025년 최신 판례와 개정 법령**까지 실시간으로 검색하여 분석해 드리는 귀하만의 **개인 전담 법률 파트너**입니다.\n\n아래에서 전문 분야(일반/세무/노무/기업)를 선택하시고, 편하게 질문해 주세요.',
          sender: Sender.BOT,
          timestamp: new Date()
        }],
        customKnowledge: [],
        createdAt: new Date(),
        lastModified: new Date(),
        isPinned: false
      };
      setSessions([newSession]);
      setCurrentSessionId(tempId);
    } else {
      setSessions(newSessions);
      setCurrentSessionId(nextSessionId);
    }

    setSessionToDeleteId(null); // Close modal
  };

  const togglePinSession = (sessionId: string) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId ? { ...s, isPinned: !s.isPinned } : s
    ));
    setActiveMenuSessionId(null);
  };

  const updateCurrentSession = (updater: (session: Session) => Session) => {
    setSessions(prev => prev.map(s =>
      s.id === currentSessionId ? updater(s) : s
    ));
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = typeof textOverride === 'string' ? textOverride : input;

    if (!textToSend.trim() || isLoading) return;

    // Check for API Key
    if (!apiKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

    // 1. Add User Message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: Sender.USER,
      timestamp: new Date()
    };

    let isFirstUserMessage = false;

    updateCurrentSession(session => {
      const hasUserMessages = session.messages.some(m => m.sender === Sender.USER);
      if (!hasUserMessages) isFirstUserMessage = true;

      const newTitle = isFirstUserMessage
        ? (textToSend.length > 20 ? textToSend.substring(0, 20) + '...' : textToSend)
        : session.title;

      return {
        ...session,
        title: newTitle,
        messages: [...session.messages, userMessage],
        lastModified: new Date()
      };
    });

    if (!textOverride) setInput('');
    setIsLoading(true);

    // 2. Add Placeholder Bot Message
    const botMessageId = (Date.now() + 1).toString();
    const initialBotMessage: Message = {
      id: botMessageId,
      text: "",
      sender: Sender.BOT,
      timestamp: new Date(),
    };

    updateCurrentSession(s => ({
      ...s,
      messages: [...s.messages, initialBotMessage]
    }));

    try {
      const session = getCurrentSession();
      if (!session) return;

      const currentHistoryMessages = [...session.messages, userMessage];
      const MAX_HISTORY_CHARS = 12000;
      let currentChars = 0;
      const historyPayload: string[] = [];

      for (let i = currentHistoryMessages.length - 1; i >= 0; i--) {
        const msg = currentHistoryMessages[i];
        if (msg.sender === Sender.SYSTEM || msg.isError) continue;

        const role = msg.sender === Sender.USER ? 'User' : 'LawBot';
        const formattedMsg = `${role}: ${msg.text}`;

        if (currentChars + formattedMsg.length > MAX_HISTORY_CHARS) break;

        historyPayload.unshift(formattedMsg);
        currentChars += formattedMsg.length;
      }

      // Pass selectedMode and apiKey to the service
      const stream = sendMessageToGeminiStream(
        apiKey,
        userMessage.text,
        historyPayload,
        session.customKnowledge,
        selectedMode // Pass the current mode
      );

      let accumulatedText = "";
      let accumulatedGrounding: GroundingChunk[] = [];

      for await (const chunk of stream) {
        if (chunk.text) accumulatedText += chunk.text;
        if (chunk.groundingChunks && chunk.groundingChunks.length > 0) {
          accumulatedGrounding = chunk.groundingChunks;
        }

        updateCurrentSession(s => ({
          ...s,
          messages: s.messages.map(msg =>
            msg.id === botMessageId
              ? { ...msg, text: accumulatedText, groundingChunks: accumulatedGrounding.length > 0 ? accumulatedGrounding : undefined }
              : msg
          )
        }));
      }

    } catch (error: any) {
      const errorMessage = error.message || "오류가 발생했습니다.";
      updateCurrentSession(s => ({
        ...s,
        messages: s.messages.map(msg =>
          msg.id === botMessageId
            ? { ...msg, text: `[시스템 오류] ${errorMessage}`, isError: true }
            : msg
        )
      }));

      // Re-open modal if authentication failed
      if (errorMessage.includes("API 키")) {
        setIsApiKeyModalOpen(true);
      }

    } finally {
      setIsLoading(false);
    }
  };

  const addKnowledge = (title: string, content: string) => {
    const newKnowledge: CustomKnowledge = {
      id: Date.now().toString(),
      title,
      content,
      dateAdded: new Date()
    };

    const systemMsg: Message = {
      id: Date.now().toString(),
      text: `[시스템] 검토 자료가 등록되었습니다: "${title}". \n해당 자료를 바탕으로 정밀 분석을 시작합니다.`,
      sender: Sender.SYSTEM,
      timestamp: new Date()
    };

    updateCurrentSession(s => ({
      ...s,
      customKnowledge: [...s.customKnowledge, newKnowledge],
      messages: [...s.messages, systemMsg]
    }));

    setIsKnowledgeModalOpen(false);
  };

  const removeKnowledge = (id: string) => {
    updateCurrentSession(s => ({
      ...s,
      customKnowledge: s.customKnowledge.filter(k => k.id !== id)
    }));
  };

  const handleResetCurrentSession = () => {
    updateCurrentSession(s => ({
      ...s,
      title: '새로운 상담 (초기화됨)',
      customKnowledge: [],
      messages: [{
        id: `reset-${Date.now()}`,
        text: '상담 내용이 초기화되었습니다. 새로운 분야나 주제로 다시 말씀해 주십시오.',
        sender: Sender.BOT,
        timestamp: new Date()
      }]
    }));
    setInput('');
    setIsLoading(false);
  };

  const handleLatestBriefing = () => {
    // Switch to General mode for briefing
    setSelectedMode(ExpertMode.GENERAL);
    const prompt = "대한민국의 최근 1개월 이내 주요 법령 개정 사항과 대법원 중요 판례를 검색하여 핵심 내용을 요약해줘.";
    handleSendMessage(prompt);
  };

  const handleMenuTrigger = (sessionId: string, rect: DOMRect) => {
    if (activeMenuSessionId === sessionId) {
      setActiveMenuSessionId(null);
    } else {
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 128
      });
      setActiveMenuSessionId(sessionId);
    }
  };

  const activeMenuSession = sessions.find(s => s.id === activeMenuSessionId);
  const currentSession = getCurrentSession();

  return (
    // Changed h-screen to h-[100dvh] for mobile browsers
    <div className="flex h-[100dvh] w-full bg-slate-50 relative overflow-hidden">

      {/* Sidebar Component */}
      <Sidebar
        isOpen={isSidebarOpen}
        sessions={sortedSessions}
        currentSessionId={currentSessionId}
        knowledgeCount={currentSession?.customKnowledge.length || 0}
        activeMenuSessionId={activeMenuSessionId}
        onClose={() => setIsSidebarOpen(false)}
        onNewSession={createNewSession}
        onSelectSession={setCurrentSessionId}
        onOpenKnowledge={() => setIsKnowledgeModalOpen(true)}
        onLatestBriefing={handleLatestBriefing}
        onMenuTrigger={handleMenuTrigger}
        onOpenSettings={handleOpenSettings}
      />

      {/* Main Content Area */}
      {/* Added overflow-hidden to prevent inner content from scrolling the page */}
      <main className="flex-1 flex flex-col h-full relative min-w-0 overflow-hidden">
        {currentSession && (
          <ChatList
            currentSession={currentSession}
            onResetSession={handleResetCurrentSession}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onNewSession={createNewSession}
          />
        )}

        <ChatInput
          input={input}
          isLoading={isLoading && currentSession?.messages[currentSession.messages.length - 1]?.sender === Sender.USER}
          selectedMode={selectedMode}
          onSelectMode={setSelectedMode}
          setInput={setInput}
          onSendMessage={() => handleSendMessage()}
          onOpenKnowledge={() => setIsKnowledgeModalOpen(true)}
        />
      </main>

      {/* Session Menu (Dropdown) */}
      {activeMenuSession && menuPosition && (
        <SessionMenu
          activeSession={activeMenuSession}
          position={menuPosition}
          onPin={togglePinSession}
          onDelete={handleDeleteRequest}
          onClose={() => setActiveMenuSessionId(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {sessionToDeleteId && (
        <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">대화 삭제</h3>
            <p className="text-slate-600 mb-6 leading-relaxed text-sm">
              이 상담 기록을 영구적으로 삭제하시겠습니까?<br />
              <span className="text-red-500 text-xs">삭제 후에는 복구할 수 없습니다.</span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSessionToDeleteId(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium shadow-sm transition-colors"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Knowledge Base Modal */}
      <KnowledgeBase
        isOpen={isKnowledgeModalOpen}
        onClose={() => setIsKnowledgeModalOpen(false)}
        knowledge={currentSession?.customKnowledge || []}
        onAdd={addKnowledge}
        onRemove={removeKnowledge}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onSave={handleSaveApiKey}
        onClose={() => setIsApiKeyModalOpen(false)}
        hasKey={!!apiKey}
      />
    </div>
  );
};

export default App;