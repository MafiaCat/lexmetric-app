import React, { useEffect, useState } from 'react';
import { SupportTicket } from '../../types';
import { getMyTickets } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Ticket, AlertTriangle, Bug, Zap, CreditCard, HelpCircle, MessageSquare, Clock } from 'lucide-react';
import { TicketChat } from '../../components/TicketChat';

export const MyTickets: React.FC = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

    const fetchTickets = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getMyTickets(user.id);
            setTickets(data);
        } catch (error) {
            console.error("Erreur lors de la récupération des tickets", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [user]);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'fake_review_report': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
            case 'bug_report': return <Bug className="w-4 h-4 text-red-500" />;
            case 'feature_request': return <Zap className="w-4 h-4 text-yellow-500" />;
            case 'billing_issue': return <CreditCard className="w-4 h-4 text-blue-500" />;
            default: return <HelpCircle className="w-4 h-4 text-slate-500" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'profile_update': return 'Mise à jour profil';
            case 'fake_review_report': return 'Signalement abus';
            case 'bug_report': return 'Bug technique';
            case 'feature_request': return 'Amélioration';
            case 'billing_issue': return 'Facturation';
            default: return 'Autre demande';
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'open': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 ring-1 ring-rose-200';
            case 'in_progress': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-amber-200';
            case 'resolved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-1 ring-emerald-200';
            case 'closed': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'open': return 'Ouvert';
            case 'in_progress': return 'En cours';
            case 'resolved': return 'Résolu';
            case 'closed': return 'Clôturé';
            default: return status;
        }
    };

    if (loading) return <div className="text-center p-8 text-slate-500">Chargement de vos demandes...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                    <Ticket className="w-8 h-8 text-indigo-500" />
                    Mes Demandes
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Suivez l'état d'avancement de vos tickets et échangez avec notre équipe de support.
                </p>
            </div>

            {tickets.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm">
                    <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Aucune demande en cours</h3>
                    <p className="text-slate-500 mt-1 mb-6">Vous n'avez pas encore contacté le support.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">

                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${getStatusStyle(ticket.status)}`}>
                                            {getStatusLabel(ticket.status)}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                                            {getTypeIcon(ticket.ticket_type)}
                                            {getTypeLabel(ticket.ticket_type)}
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{ticket.subject}</h4>
                                </div>
                                <span className="text-xs text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                    ID #{ticket.id}
                                </span>
                            </div>

                            <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                {ticket.description}
                            </p>

                            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-700 pt-4">
                                <span className="text-xs font-medium text-slate-500">
                                    Créé le {new Date(ticket.created_at).toLocaleDateString()}
                                </span>

                                <button
                                    onClick={() => setSelectedTicketId(selectedTicketId === ticket.id ? null : ticket.id)}
                                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${selectedTicketId === ticket.id
                                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 dark:text-slate-200'
                                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400'
                                        }`}
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    {selectedTicketId === ticket.id ? 'Masquer la discussion' : 'Voir la discussion'}
                                </button>
                            </div>

                            {/* Chat Window */}
                            {selectedTicketId === ticket.id && (
                                <div className="mt-6 h-96 animate-in slide-in-from-top-4 duration-300">
                                    <TicketChat ticketId={ticket.id} />
                                </div>
                            )}

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
