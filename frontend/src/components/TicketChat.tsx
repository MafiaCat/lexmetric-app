import React, { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getTicketMessages, createTicketMessage } from '../services/api';
import { TicketMessage } from '../types';

interface TicketChatProps {
    ticketId: number;
}

export const TicketChat: React.FC<TicketChatProps> = ({ ticketId }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<TicketMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadMessages = async () => {
        try {
            const data = await getTicketMessages(ticketId);
            setMessages(data);
        } catch (error) {
            console.error("Erreur lors du chargement des messages", error);
        } finally {
            setIsLoading(false);
            scrollToBottom();
        }
    };

    useEffect(() => {
        loadMessages();
        // Optionnel : Ajouter un polling pour rafraîchir les messages (Polling désactivé pour simplifier MVP)
    }, [ticketId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || !user) return;

        setIsSending(true);
        try {
            const createdMsg = await createTicketMessage(ticketId, newMessage.trim(), user.id);
            setMessages([...messages, createdMsg]);
            setNewMessage('');
        } catch (error) {
            console.error("Erreur lors de l'envoi du message", error);
            alert("Erreur lors de l'envoi");
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[500px]">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Clock className="w-8 h-8 mb-2 opacity-50" />
                        <p>Aucun message dans ce ticket.</p>
                        <p className="text-sm">Envoyez le premier message !</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = user?.id === msg.sender_id;
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex items-end max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${isMe
                                            ? 'bg-indigo-100 border-indigo-200 text-indigo-600 dark:bg-indigo-900/50 dark:border-indigo-800'
                                            : 'bg-slate-200 border-slate-300 text-slate-600 dark:bg-slate-700 dark:border-slate-600'
                                        } ${isMe ? 'ml-2' : 'mr-2'}`}>
                                        <UserIcon className="w-4 h-4" />
                                    </div>

                                    {/* Bubble */}
                                    <div className={`px-4 py-2.5 rounded-2xl ${isMe
                                            ? 'bg-indigo-600 text-white rounded-br-sm'
                                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-sm'
                                        }`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        <span className={`text-[10px] block mt-1 ${isMe ? 'text-indigo-200 text-right' : 'text-slate-400 text-left'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                <form
                    onSubmit={handleSendMessage}
                    className="flex items-end gap-2"
                >
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Écrivez votre message..."
                        className="flex-1 max-h-32 min-h-[44px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="flex-shrink-0 w-11 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isSending ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Send className="w-4 h-4 ml-0.5" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
