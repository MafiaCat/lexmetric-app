import React, { useState } from 'react';
import { Headset, Send, CheckCircle2, AlertTriangle, Bug, Zap, CreditCard, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createTicket } from '../../services/api';

export const SupportForm: React.FC = () => {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [ticketType, setTicketType] = useState<string>('other');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('low');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) return;

        setIsSubmitting(true);
        try {
            await createTicket(
                {
                    ticket_type: ticketType as any,
                    subject,
                    description,
                    priority,
                    status: 'open'
                },
                user.id,
                user.company_id
            );

            setIsSuccess(true);
            setSubject('');
            setDescription('');
            setTicketType('other');
            setPriority('low');

            setTimeout(() => {
                setIsSuccess(false);
            }, 5000);

        } catch (error) {
            console.error("Failed to submit ticket", error);
            alert("Une erreur est survenue lors de l'envoi de votre demande.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const ticketOptions = [
        { id: 'profile_update', label: 'Mise à jour d\'un profil avocat', icon: <HelpCircle className="w-5 h-5 text-indigo-500" /> },
        { id: 'fake_review_report', label: 'Signaler un faux avis', icon: <AlertTriangle className="w-5 h-5 text-orange-500" /> },
        { id: 'bug_report', label: 'Signaler un bug technique', icon: <Bug className="w-5 h-5 text-red-500" /> },
        { id: 'feature_request', label: 'Suggestion d\'amélioration', icon: <Zap className="w-5 h-5 text-yellow-500" /> },
        { id: 'billing_issue', label: 'Problème de facturation', icon: <CreditCard className="w-5 h-5 text-blue-500" /> },
        { id: 'other', label: 'Autre demande', icon: <Headset className="w-5 h-5 text-slate-500" /> },
    ];

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                    <Headset className="w-8 h-8 text-rose-500" />
                    Support Utilisateur
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Notre équipe de modération est à votre écoute. Sélectionnez le type de demande pour un traitement optimisé.
                </p>
            </div>

            {isSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-semibold text-emerald-800">Demande envoyée avec succès</h4>
                        <p className="text-sm text-emerald-700 mt-1">
                            Votre ticket a bien été transmis à nos équipes de modération. Vous serez notifié de son traitement.
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">

                <div className="space-y-6">
                    {/* Category Selection */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-3">
                            Catégorie de la demande <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {ticketOptions.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setTicketType(option.id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${ticketType === option.id
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 ring-1 ring-indigo-500 shadow-sm'
                                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-indigo-300'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${ticketType === option.id ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-transparent'}`}>
                                        {option.icon}
                                    </div>
                                    <span className={`font-medium text-sm ${ticketType === option.id ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {option.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Sujet principal <span className="text-red-500">*</span></label>
                            <input
                                required
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                placeholder="Résumé court de votre demande"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Niveau d'urgence</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as any)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="low">Faible (Information)</option>
                                <option value="medium">Moyen (Anomalie mineure)</option>
                                <option value="high">Haut (Bloquant)</option>
                                <option value="critical">Critique (Urgence métier)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Description détaillée <span className="text-red-500">*</span></label>
                        <textarea
                            required
                            rows={5}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none"
                            placeholder="Décrivez votre problème avec le plus de détails possible (Lien de la page, nom de l'avocat, actions effectuées...)"
                        />
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting || !subject || !description}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Transmission...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Envoyer le ticket
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};
