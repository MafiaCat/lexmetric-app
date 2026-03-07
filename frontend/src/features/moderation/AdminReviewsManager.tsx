import React, { useState, useEffect } from 'react';
import { FileText, Search, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Review } from '../../types';
import { getAdminReviews, deleteAdminReview } from '../../services/api';

export const AdminReviewsManager: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const data = await getAdminReviews();
            setReviews(data);
        } catch (error) {
            console.error(error);
            setNotification({ type: 'error', message: "Impossible de récupérer les avis." });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet avis définitivement ?")) return;

        try {
            await deleteAdminReview(id);
            setNotification({ type: 'success', message: `L'avis a été supprimé.` });
            setReviews(reviews.filter(r => r.id !== id));
        } catch (error) {
            console.error(error);
            setNotification({ type: 'error', message: "Erreur lors de la suppression de l'avis." });
        }
    };

    const filteredReviews = reviews.filter(r =>
        r.comment?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-indigo-400" />
                        Modération des Avis
                    </h1>
                    <p className="text-slate-400">Supervisez et modérez les avis déposés sur la plateforme.</p>
                </div>
            </div>

            {notification && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${notification.type === 'error'
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                    {notification.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
                    <p className="text-sm">{notification.message}</p>
                </div>
            )}

            <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mt-6">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher par commentaire..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 w-64 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-900/80 text-xs uppercase text-slate-500 border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-medium">Scores</th>
                                <th className="px-6 py-4 font-medium w-1/2">Commentaire</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        Chargement des avis...
                                    </td>
                                </tr>
                            ) : reviews.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        Aucun avis enregistré.
                                    </td>
                                </tr>
                            ) : filteredReviews.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                        Aucun résultat pour "{searchTerm}".
                                    </td>
                                </tr>
                            ) : (
                                filteredReviews.map((review) => {
                                    const average = ((review.reactivity_score + review.technical_expertise_score + review.negotiation_score + review.fee_respect_score) / 4).toFixed(1);
                                    return (
                                        <tr key={review.id} className="hover:bg-slate-800/20 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-200">
                                                <span className="text-amber-400 font-bold">{average}</span><span className="text-slate-500">/5</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="line-clamp-2 italic text-slate-300">"{review.comment}"</p>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(review.id!)}
                                                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
