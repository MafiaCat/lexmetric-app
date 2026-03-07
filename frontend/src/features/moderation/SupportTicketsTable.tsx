import React, { useEffect, useState } from 'react';
import { SupportTicket } from '../../types';
import { getTickets, updateTicketStatus } from '../../services/api';
import { Ticket, AlertTriangle, Bug, Zap, CreditCard, HelpCircle, CheckCircle2 } from 'lucide-react';

export const SupportTicketsTable: React.FC = () => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const data = await getTickets();
            setTickets(data);
        } catch (error) {
            console.error("Erreur lors de la récupération des tickets", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleUpdateStatus = async (ticketId: number, status: 'open' | 'in_progress' | 'resolved' | 'closed') => {
        try {
            const updated = await updateTicketStatus(ticketId, status);
            setTickets(tickets.map(t => t.id === ticketId ? updated : t));
        } catch (error) {
            console.error("Erreur de mise à jour", error);
            alert("Erreur lors de la mise à jour");
        }
    };

    const handleReply = (ticket: SupportTicket) => {
        alert("Le module de messagerie interne est en cours d'intégration (Phase 4).");
        if (ticket.status === 'open') {
            handleUpdateStatus(ticket.id, 'in_progress');
        }
    };

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

    if (loading) return <div className="text-center p-8 text-slate-500">Chargement...</div>;

    if (tickets.length === 0) {
        return (
            <div className="text-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Ticket className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Boîte de réception vide</h3>
                <p className="text-slate-500 mt-1">Aucune demande de support en attente.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map(ticket => (
                <div key={ticket.id} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 hover:shadow-lg transition-all transform hover:-translate-y-1 duration-200">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${getStatusStyle(ticket.status)}`}>
                                {ticket.status.replace('_', ' ')}
                            </span>
                            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                                {getTypeIcon(ticket.ticket_type)}
                                {getTypeLabel(ticket.ticket_type)}
                            </div>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                            ID #{ticket.id}
                        </span>
                    </div>

                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">{ticket.subject}</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 line-clamp-3">{ticket.description}</p>

                    <div className="flex justify-between items-end border-t border-slate-200 dark:border-slate-700/60 pt-4 mt-auto">
                        <span className="text-xs text-slate-400">
                            {new Date(ticket.created_at).toLocaleDateString()}
                        </span>

                        <div className="flex gap-2">
                            {ticket.status !== 'closed' && (
                                <>
                                    <select
                                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium rounded-lg px-3 py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
                                        value={ticket.status}
                                        onChange={(e) => handleUpdateStatus(ticket.id, e.target.value as any)}
                                    >
                                        <option value="open">Ouvrir</option>
                                        <option value="in_progress">En cours...</option>
                                        <option value="resolved">Résolu</option>
                                        <option value="closed">Fermer</option>
                                    </select>
                                    <button
                                        onClick={() => handleReply(ticket)}
                                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 text-sm font-medium rounded-lg transition-transform active:scale-95"
                                    >
                                        Répondre
                                    </button>
                                </>
                            )}
                            {ticket.status === 'closed' && (
                                <span className="text-sm font-medium text-slate-400 flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"><CheckCircle2 className="w-4 h-4" /> Ticket clôturé</span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
