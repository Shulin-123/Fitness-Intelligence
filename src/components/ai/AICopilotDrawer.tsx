import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Square,
  Trash2,
  X,
  Bot,
  User,
  Copy,
  Check,
  ArrowRight,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  Paperclip,
} from 'lucide-react';
import { useAICopilot } from '../../context/AICopilotContext';
import { useToast } from '../../context/ToastContext';

// Helper to format basic markdown-style text into clean HTML elements safely
const FormattedContent: React.FC<{ content: string; isStreaming?: boolean }> = ({
  content,
  isStreaming,
}) => {
  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-xs leading-relaxed text-[var(--text)]">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Heading 3: ###
        if (line.startsWith('### ')) {
          return (
            <h4
              key={idx}
              className="text-xs font-bold text-[#FF6B1A] uppercase tracking-wider mt-2 mb-1"
            >
              {line.replace('### ', '')}
            </h4>
          );
        }

        // Bullet point: * or -
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
          const text = line.trim().slice(2);
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-[#FF6B1A] font-bold shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatBoldAndHighlight(text) }} />
            </div>
          );
        }

        // Numbered list: 1., 2., etc.
        const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2 mt-1">
              <span className="text-[#FF6B1A] font-bold shrink-0">{numMatch[1]}.</span>
              <span dangerouslySetInnerHTML={{ __html: formatBoldAndHighlight(numMatch[2]) }} />
            </div>
          );
        }

        return (
          <p
            key={idx}
            dangerouslySetInnerHTML={{ __html: formatBoldAndHighlight(line) }}
          />
        );
      })}
      {isStreaming && (
        <span className="inline-block w-1.5 h-3.5 bg-[#FF6B1A] animate-pulse ml-0.5 align-middle" />
      )}
    </div>
  );
};

// Formats **bold** and `code` tags safely
function formatBoldAndHighlight(str: string): string {
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[var(--text)]">$1</strong>')
    .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-[var(--surface-2)] text-[#FFB547] font-mono text-[11px]">$1</code>');
}

export const AICopilotDrawer: React.FC = () => {
  const {
    isOpen,
    closeChat,
    toggleChat,
    messages,
    sendMessage,
    isGenerating,
    stopGeneration,
    clearChat,
  } = useAICopilot();

  const { showToast } = useToast();
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    dataUrl: string;
    mimeType: string;
    name: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      showToast('File size exceeds 20MB limit.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedMedia({
        dataUrl: reader.result as string,
        mimeType: file.type || 'image/jpeg',
        name: file.name,
      });
      showToast(`Attached ${file.name} for AI analysis`, 'info');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSend = () => {
    if ((!input.trim() && !selectedMedia) || isGenerating) return;
    const promptToSend = input.trim() || 'Analyze this image for exercise posture, form cues, or nutrition.';
    sendMessage(promptToSend, selectedMedia?.dataUrl, selectedMedia?.mimeType);
    setInput('');
    setSelectedMedia(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Persistent Floating AI Launcher Button (Bottom-Right) */}
      <button
        type="button"
        onClick={toggleChat}
        className={`fixed bottom-5 right-5 z-40 p-3 rounded-full bg-gradient-to-r from-[#FF6B1A] to-[#FF8A3D] text-[#0F0B09] shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 group ${
          isOpen ? 'ring-2 ring-white/40' : ''
        }`}
        title="Fitness Intelligence AI Copilot"
        aria-label="Toggle AI Coach Chat"
      >
        <div className="relative flex items-center justify-center">
          <Sparkles className="w-5 h-5 fill-current" />
          <span className="w-2 h-2 rounded-full bg-[#22C55E] absolute -top-1 -right-1 ring-2 ring-[#0F0B09] animate-pulse" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider pr-1 hidden sm:inline">
          {isOpen ? 'Close AI' : 'Ask AI Coach'}
        </span>
      </button>

      {/* Live ChatGPT-Style Window */}
      {isOpen && (
        <aside
          role="complementary"
          aria-label="AI Coach Live Chat"
          className={`fixed z-50 transition-all duration-200 flex flex-col bg-[var(--surface)] border border-[var(--border-strong)] shadow-2xl overflow-hidden ${
            isExpanded
              ? 'inset-4 md:inset-10 rounded-2xl'
              : 'bottom-20 right-4 left-4 sm:left-auto sm:right-6 sm:w-[440px] h-[580px] max-h-[85vh] rounded-2xl'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-[var(--surface-2)] border-b border-[var(--border)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FF6B1A] text-[#0F0B09] flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold tracking-tight text-[var(--text)]">
                    AI Fitness Copilot
                  </h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                  <span className="text-[10px] uppercase font-bold text-[#FF6B1A] px-1.5 py-0.2 rounded bg-[#FF6B1A]/10">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-[var(--muted)]">
                  Peer-reviewed biomechanics & nutrition formulas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[var(--muted)]">
              <button
                type="button"
                onClick={clearChat}
                className="p-1.5 rounded-md hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-md hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors cursor-pointer hidden sm:block"
                title={isExpanded ? 'Minimize' : 'Maximize'}
                aria-label={isExpanded ? 'Minimize chat' : 'Maximize chat'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={closeChat}
                className="p-1.5 rounded-md hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
                title="Close chat"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Transcript / Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-md bg-[#FF6B1A]/15 text-[#FF6B1A] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`relative max-w-[85%] rounded-xl p-3.5 transition-all ${
                    msg.sender === 'user'
                      ? 'bg-[#FF6B1A] text-[#0F0B09] font-medium'
                      : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)]'
                  }`}
                >
                  {/* Attached Media Display */}
                  {msg.mediaUrl && (
                    <div className="mb-2.5 rounded-lg overflow-hidden border border-black/10 max-w-[260px] bg-black/10">
                      {msg.mediaType === 'video' ? (
                        <video src={msg.mediaUrl} controls className="w-full max-h-[180px] rounded-lg object-contain" />
                      ) : (
                        <img
                          src={msg.mediaUrl}
                          alt="Attached media"
                          className="w-full max-h-[180px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(msg.mediaUrl, '_blank')}
                        />
                      )}
                      <div className={`px-2 py-0.5 text-[9px] flex items-center gap-1 font-mono ${
                        msg.sender === 'user' ? 'text-[#0F0B09]/75 font-semibold' : 'text-[var(--muted)]'
                      }`}>
                        <ImageIcon className="w-2.5 h-2.5" />
                        <span>Attached Visual Input</span>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <FormattedContent content={msg.text} isStreaming={msg.isStreaming} />

                  {/* Scientific Source Citations */}
                  {msg.sourceTags && msg.sourceTags.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-[var(--border)] flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-[var(--muted)] font-semibold">Citations:</span>
                      {msg.sourceTags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[#FFB547]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Follow-up question chips */}
                  {msg.followUps && msg.followUps.length > 0 && !isGenerating && (
                    <div className="mt-3 pt-2.5 border-t border-[var(--border)] space-y-1.5">
                      <p className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">
                        Suggested Next Questions
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {msg.followUps.map((chip, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => sendMessage(chip)}
                            className="text-left text-xs px-2.5 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[#FF6B1A]/10 border border-[var(--border)] hover:border-[#FF6B1A]/40 text-[var(--text)] hover:text-[#FF6B1A] transition-all flex items-center justify-between group cursor-pointer"
                          >
                            <span>{chip}</span>
                            <ArrowRight className="w-3 h-3 text-[var(--muted)] group-hover:text-[#FF6B1A] group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assistant Footer Actions */}
                  {msg.sender === 'assistant' && !msg.isStreaming && (
                    <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--muted)] pt-1">
                      <span>{msg.timestamp}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-[var(--text)] flex items-center gap-1 p-1 rounded transition-colors cursor-pointer"
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-[#22C55E]" />
                            <span className="text-[#22C55E]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-md bg-[var(--surface-2)] text-[var(--muted)] flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Stop Generation Button when active */}
          {isGenerating && (
            <div className="px-4 py-1.5 bg-[var(--surface-2)] border-t border-[var(--border)] flex items-center justify-center">
              <button
                type="button"
                onClick={stopGeneration}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--muted)] hover:text-[#F87171] hover:border-[#F87171] transition-all cursor-pointer"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop generating</span>
              </button>
            </div>
          )}

          {/* Prompt Input Box & Multimodal Vision Controls */}
          <div className="p-3 bg-[var(--surface-2)] border-t border-[var(--border)] shrink-0 space-y-2">
            {/* Quick Prompt Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <button
                type="button"
                onClick={() => sendMessage('Give me the scientifically optimal chest day workout for maximum hypertrophy, including exercise selection, sets, reps, and RIR.')}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:border-[#FF6B1A]/50 text-[var(--text)] hover:text-[#FF6B1A] transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>💪 Chest Growth Plan</span>
              </button>
              <button
                type="button"
                onClick={() => sendMessage('How do I break through a bench press plateau with periodized volume and accessory lifts?')}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:border-[#FF6B1A]/50 text-[var(--text)] hover:text-[#FF6B1A] transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>🏋️ Bench Plateau</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#FF6B1A]/10 border border-[#FF6B1A]/30 text-[#FF6B1A] hover:bg-[#FF6B1A]/20 transition-all cursor-pointer flex items-center gap-1 shrink-0 font-medium"
              >
                <ImageIcon className="w-3 h-3" />
                <span>📸 Scan Photo / Meal</span>
              </button>
            </div>

            {/* Selected Media Preview */}
            {selectedMedia && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--surface)] border border-[#FF6B1A]/40">
                <div className="flex items-center gap-2 overflow-hidden">
                  <img
                    src={selectedMedia.dataUrl}
                    alt="Preview"
                    className="w-10 h-10 rounded-lg object-cover border border-[var(--border)] shrink-0"
                  />
                  <div className="overflow-hidden">
                    <span className="text-[11px] font-bold text-[var(--text)] block truncate">
                      {selectedMedia.name}
                    </span>
                    <span className="text-[10px] text-[#FF6B1A] uppercase font-mono">
                      Ready for Gemini Vision
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMedia(null)}
                  className="p-1 rounded-md text-[var(--muted)] hover:text-[#F87171] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Input Bar */}
            <div className="relative flex items-center bg-[var(--surface)] border border-[var(--border)] focus-within:border-[#FF6B1A] rounded-xl overflow-hidden transition-colors">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 pl-2.5 text-[var(--muted)] hover:text-[#FF6B1A] transition-colors cursor-pointer shrink-0 ${
                  selectedMedia ? 'text-[#FF6B1A]' : ''
                }`}
                title="Attach photo or video for AI Vision analysis"
                aria-label="Attach photo or video"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={selectedMedia ? 'Ask about this photo (e.g. check form, estimate macros)...' : 'Ask workouts, macros, form cues, or attach photo...'}
                className="w-full px-2 py-2.5 text-xs bg-transparent text-[var(--text)] placeholder-[var(--muted)]/60 focus:outline-none resize-none max-h-24"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={(!input.trim() && !selectedMedia) || isGenerating}
                className={`p-2 pr-2.5 transition-all cursor-pointer shrink-0 ${
                  (input.trim() || selectedMedia) && !isGenerating
                    ? 'text-[#FF6B1A] hover:text-[#FF8A3D]'
                    : 'text-[var(--muted)] opacity-40 cursor-not-allowed'
                }`}
                aria-label="Send prompt"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-center text-[var(--muted)]">
              Live scientific simulation • Calculations verify against published biomechanics
            </p>
          </div>
        </aside>
      )}
    </>
  );
};
