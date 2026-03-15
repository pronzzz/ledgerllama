import { useState } from 'react';
import { useIntelligence } from '../hooks/useIntelligence';
import { BrainCircuit, Download, Sparkles, AlertCircle, MessageSquare } from 'lucide-react';

export default function Intelligence() {
  const { isReady, progress, isLoading, initEngine, categorizeTransactions, categorizing, generateInsight, sendChatMessage } = useIntelligence();
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [generatingInsight, setGeneratingInsight] = useState(false);

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user'|'assistant'|'system', content: string}[]>([
    { role: 'system', content: 'You are a helpful AI financial and budget advisor. Provide concise, actionable advice.' }
  ]);
  const [chatting, setChatting] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !sendChatMessage) return;
    
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatting(true);

    const newHistory = [...chatHistory, { role: 'user' as const, content: userMsg }];
    setChatHistory(newHistory);

    const reply = await sendChatMessage(newHistory);
    if (reply) {
      setChatHistory([...newHistory, { role: 'assistant', content: reply }]);
    }
    setChatting(false);
  };

  const handleGenerate = async () => {
    setGeneratingInsight(true);
    const res = await generateInsight();
    setInsight(res);
    setGeneratingInsight(false);
  };

  const handleCategorize = async () => {
    setResultMessage(null);
    const count = await categorizeTransactions();
    setResultMessage(`Successfully categorized ${count} transactions.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-semibold tracking-tight">AI Intelligence</h2>
        <p className="text-muted-foreground w-full max-w-2xl">
          LedgerLlama uses WebLLM to run AI models entirely inside your browser. No data leaves your device.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent rounded-xl text-accent-foreground">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Local Model Engine</h3>
              <p className="text-sm text-muted-foreground">Llama-3-8B-Instruct (approx. 4GB download)</p>
            </div>
          </div>

          <div className="flex-1 mt-4">
            {!isReady ? (
              <div className="space-y-4">
                <p className="text-sm">
                  The model will be downloaded and cached in your browser. It might take a few minutes depending on your connection.
                </p>
                <button
                  onClick={initEngine}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full disabled:opacity-50"
                >
                  {isLoading ? 'Downloading Engine...' : (
                    <>
                      <Download className="w-4 h-4" /> Load Engine
                    </>
                  )}
                </button>
                {progress && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground break-all">
                      {progress.text}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 bg-green-500/10 rounded-xl border border-green-500/20 text-green-600 dark:text-green-400 gap-3 text-center h-full">
                <CheckCircle className="w-8 h-8" />
                <p className="font-medium">Engine is loaded and ready.</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent rounded-xl text-accent-foreground">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Transaction Categorization</h3>
              <p className="text-sm text-muted-foreground">Auto-assign categories</p>
            </div>
          </div>

          <div className="flex-1 mt-4 space-y-4">
            <p className="text-sm">
              Use the local AI to scan your uncategorized expenses and assign them to your existing categories.
            </p>
            {isReady ? (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCategorize}
                  disabled={categorizing}
                  className="inline-flex items-center gap-2 justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {categorizing ? 'Categorizing...' : 'Categorize Uncategorized (Batch of 10)'}
                </button>
                {resultMessage && (
                  <p className="text-sm text-center text-muted-foreground">{resultMessage}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-4 rounded-xl">
                <AlertCircle className="w-4 h-4" /> Load the engine first.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent rounded-xl text-accent-foreground">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Financial Insight</h3>
              <p className="text-sm text-muted-foreground">30-Day automated summary</p>
            </div>
          </div>

          <div className="flex-1 mt-4 flex flex-col gap-4">
            <p className="text-sm">
              Generate a personalized summary based on your recent transactions to pinpoint spending patterns.
            </p>
            {isReady ? (
              <>
                <button
                  onClick={handleGenerate}
                  disabled={generatingInsight}
                  className="inline-flex items-center gap-2 justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full disabled:opacity-50"
                >
                  <MessageSquare className="w-4 h-4" />
                  {generatingInsight ? 'Thinking...' : 'Generate New Insight'}
                </button>
                {insight && (
                  <div className="p-4 bg-muted/50 rounded-lg text-sm italic border-l-4 border-primary">
                    "{insight}"
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-4 rounded-xl">
                <AlertCircle className="w-4 h-4" /> Load the engine first.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-accent rounded-xl text-accent-foreground">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">AI Budget Planner Chat</h3>
            <p className="text-sm text-muted-foreground">Chat with your local AI advisor</p>
          </div>
        </div>

        <div className="flex flex-col h-[400px] border border-border rounded-xl overflow-hidden mt-4">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
            {chatHistory.filter(m => m.role !== 'system').length === 0 ? (
              <div className="text-center text-sm text-muted-foreground mt-10">
                Ask a question about budgeting, saving, or financial strategies!
              </div>
            ) : (
              chatHistory.filter(m => m.role !== 'system').map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {chatting && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground max-w-[80%] rounded-2xl px-4 py-2 text-sm animate-pulse">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-card flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder={isReady ? "Ask for financial advice..." : "Load engine to chat"}
              disabled={!isReady || chatting}
              className="flex-1 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!isReady || chatting || !chatInput.trim()}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
