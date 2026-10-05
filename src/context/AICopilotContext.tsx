import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { generateScientificResponse } from '../components/ai/aiKnowledgeBase';
import { queryAICoachWithBackend } from '../services/springBootApi';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
  sourceTags?: string[];
  followUps?: string[];
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

interface AICopilotContextType {
  isOpen: boolean;
  messages: ChatMessage[];
  isGenerating: boolean;
  openChat: (initialPrompt?: string) => void;
  closeChat: () => void;
  toggleChat: () => void;
  sendMessage: (prompt: string, imageBase64?: string, mimeType?: string) => Promise<void>;
  stopGeneration: () => void;
  clearChat: () => void;
}

const AICopilotContext = createContext<AICopilotContextType | undefined>(undefined);

const CHAT_STORAGE_KEY = 'fi_ai_chat_history';

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'msg-welcome',
  sender: 'assistant',
  text: `👋 **Welcome to the Fitness Intelligence AI Coach!**

I am your verifiable, peer-reviewed exercise & nutrition intelligence copilot. Every answer is grounded in deterministic biomechanics, metabolic formulas, and published sports science.

**Try asking me anything live:**
* *"How should I break through a bench press plateau?"*
* *"What are my target macros for lean hypertrophy?"*
* *"Why does 150 minutes of Zone 2 cardio increase longevity?"*
* *"How do I brace correctly during heavy deadlifts?"*`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  isStreaming: false,
  sourceTags: ['Verifiable Biomechanics', 'ISSN Consensus', 'WHO Guidelines'],
  followUps: [
    'How do I break a bench press plateau?',
    'Target macros for lean muscle gain',
    'Why does Zone 2 cardio boost longevity?',
    'Ankle mobility cues for deeper squats',
  ],
};

export const AICopilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === 'undefined') return [INITIAL_WELCOME_MESSAGE];
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [INITIAL_WELCOME_MESSAGE];
  });

  // Save to localStorage when messages change
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  const stopGeneration = () => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    setIsGenerating(false);
    setMessages((prev) =>
      prev.map((msg) => (msg.isStreaming ? { ...msg, isStreaming: false } : msg))
    );
  };

  const sendMessage = async (promptText: string, imageBase64?: string, mimeType = 'image/jpeg') => {
    const trimmed = promptText.trim();
    if ((!trimmed && !imageBase64) || isGenerating) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `ai-${Date.now()}`;

    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: trimmed || (imageBase64 ? '📸 [Attached image for analysis]' : ''),
      timestamp: time,
      mediaUrl: imageBase64,
      mediaType: mimeType.startsWith('video') ? 'video' : 'image',
    };

    const emptyAssistantMessage: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      timestamp: time,
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, emptyAssistantMessage]);
    setIsGenerating(true);

    // Compute scientific answer via Spring Boot Backend (or fallback to local knowledge base)
    const promptToSend = trimmed || 'Analyze this image for exercise posture, form cues, or nutrition.';
    const backendResult = await queryAICoachWithBackend(promptToSend, imageBase64, mimeType);
    const { answer, sourceTags, followUps } = backendResult || generateScientificResponse(promptToSend);

    // Live Streaming Token-by-Token Typewriter Engine
    let currentLength = 0;
    const totalLength = answer.length;
    // Step size based on length for snappy realistic streaming
    const step = Math.max(3, Math.floor(totalLength / 80));

    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
    }

    streamIntervalRef.current = setInterval(() => {
      currentLength += step;
      if (currentLength >= totalLength) {
        if (streamIntervalRef.current) {
          clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;
        }
        setIsGenerating(false);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  text: answer,
                  isStreaming: false,
                  sourceTags,
                  followUps,
                }
              : msg
          )
        );
      } else {
        const partial = answer.slice(0, currentLength);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  text: partial,
                }
              : msg
          )
        );
      }
    }, 20);
  };

  const openChat = (initialPrompt?: string) => {
    setIsOpen(true);
    if (initialPrompt && initialPrompt.trim()) {
      // Short delay to let drawer render before starting stream
      setTimeout(() => {
        sendMessage(initialPrompt);
      }, 100);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  const clearChat = () => {
    stopGeneration();
    setMessages([INITIAL_WELCOME_MESSAGE]);
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <AICopilotContext.Provider
      value={{
        isOpen,
        messages,
        isGenerating,
        openChat,
        closeChat,
        toggleChat,
        sendMessage,
        stopGeneration,
        clearChat,
      }}
    >
      {children}
    </AICopilotContext.Provider>
  );
};

export const useAICopilot = (): AICopilotContextType => {
  const context = useContext(AICopilotContext);
  if (!context) {
    throw new Error('useAICopilot must be used within an AICopilotProvider');
  }
  return context;
};
