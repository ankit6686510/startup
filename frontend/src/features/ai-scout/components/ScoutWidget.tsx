'use client';

import { useState, useRef, useEffect } from 'react';
// @ts-ignore
import { useChat } from '@ai-sdk/react';
import { MessageSquareIcon, XIcon, SendIcon, SparklesIcon, BotIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ScoutWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const { messages, input = '', handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/chat',
    } as any) as any;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {/* Chat Window */}
            <div
                className={cn(
                    "bg-background border border-border shadow-2xl rounded-2xl w-[380px] h-[500px] flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right",
                    isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-10 pointer-events-none"
                )}
            >
                {/* Header */}
                <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <SparklesIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Startup Scout</h3>
                            <p className="text-xs text-primary-foreground/80">AI Interaction Agent</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary-foreground hover:bg-white/20 h-8 w-8"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close chat"
                    >
                        <XIcon className="h-4 w-4" />
                    </Button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                    {messages.length === 0 && (
                        <div className="text-center text-muted-foreground text-sm mt-10 px-4">
                            <BotIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>Hi! I can help you find startups, analyze trends, or compare companies. Try asking:</p>
                            <div className="flex flex-col gap-2 mt-4">
                                <button
                                    onClick={() => {
                                        const e = { target: { value: 'Show me trending AI startups' } } as any;
                                        handleInputChange(e);
                                    }}
                                    className="bg-card border border-border p-2 rounded-lg text-xs hover:bg-muted transition text-left"
                                >
                                    "Show me trending AI startups"
                                </button>
                                <button
                                    onClick={() => {
                                        const e = { target: { value: 'Compare Stripe vs Plaid' } } as any;
                                        handleInputChange(e);
                                    }}
                                    className="bg-card border border-border p-2 rounded-lg text-xs hover:bg-muted transition text-left"
                                >
                                    "Compare Stripe vs Plaid"
                                </button>
                            </div>
                        </div>
                    )}

                    {messages.map((m: any) => (
                        <div
                            key={m.id}
                            className={cn(
                                "flex w-full",
                                m.role === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            <div className={cn(
                                "max-w-[80%] rounded-2xl p-3 text-sm shadow-sm",
                                m.role === 'user'
                                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                                    : "bg-card border border-border rounded-tl-sm text-foreground"
                            )}>
                                {m.content.split('\n').map((line: string, i: number) => (
                                    <p key={i} className={line.startsWith('-') || line.startsWith('1.') ? "ml-2" : ""}>
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-card border border-border p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="p-3 bg-card border-t border-border flex gap-2">
                    <input
                        className="flex-1 bg-muted/50 border border-input rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={input || ''}
                        onChange={handleInputChange}
                        placeholder="Ask anything..."
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="rounded-xl h-10 w-10 shrink-0 shadow-sm"
                        disabled={isLoading || !(input || '').trim()}
                        aria-label="Send message"
                    >
                        <SendIcon className="h-4 w-4" />
                    </Button>
                </form>
            </div>

            {/* FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group",
                    isOpen ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                )}
                aria-label="Toggle chat"
            >
                {isOpen ? (
                    <XIcon className="h-6 w-6" />
                ) : (
                    <SparklesIcon className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                )}
            </button>
        </div>
    );
}
