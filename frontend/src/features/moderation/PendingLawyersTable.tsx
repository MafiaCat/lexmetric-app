import React, { useEffect, useState } from 'react';
import { Lawyer } from '../../types';
import { getPendingLawyers, updateLawyerStatus } from '../../services/api';
import { Check, X, Clock, MapPin } from 'lucide-react';

export const PendingLawyersTable: React.FC = () => {
    const [lawyers, setLawyers] = useState<Lawyer[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLawyers = async () => {
        setLoading(true);
        try {
            const data = await getPendingLawyers();
            setLawyers(data);
        } catch (error) {
            console.error("Erreur lors de la récupération des avocats", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLawyers();
    }, []);

    const handleUpdateStatus = async (lawyerId: number, status: 'approved' | 'rejected') => {
        try {
            await updateLawyerStatus(lawyerId, status);
            // On success, remove from list
            setLawyers(lawyers.filter(l => l.id !== lawyerId));
        } catch (error) {
            console.error("Erreur de mise à jour", error);
            alert("Erreur lors de la mise à jour");
        }
    };

    if (loading) return <div className="text-center p-8 text-slate-500">Chargement...</div>;

    if (lawyers.length === 0) {
        return (
            <div className="text-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Aucun avocat en attente</h3>
                <p className="text-slate-500 mt-1">Tous les profils ont été traités.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <th className="py-4 px-4 font-medium">Avocat</th>
                        <th className="py-4 px-4 font-medium">Barreau / Ville</th>
                        <th className="py-4 px-4 font-medium">Spécialités</th>
                        <th className="py-4 px-4 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {lawyers.map((lawyer) => (
                        <tr key={lawyer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                            <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                                        {lawyer.first_name[0]}{lawyer.last_name[0]}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">Me {lawyer.first_name} {lawyer.last_name}</p>
                                        <p className="text-xs text-slate-500">{lawyer.firm_type}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-4">
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span>{lawyer.city} ({lawyer.bar_association})</span>
                                </div>
                            </td>
                            <td className="py-4 px-4">
                                <div className="flex flex-wrap gap-1">
                                    {lawyer.specialties.slice(0, 2).map(spec => (
                                        <span key={spec} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs rounded text-slate-600 dark:text-slate-300">
                                            {spec}
                                        </span>
                                    ))}
                                    {lawyer.specialties.length > 2 && (
                                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs rounded text-slate-500">+{lawyer.specialties.length - 2}</span>
                                    )}
                                </div>
                            </td>
                            <td className="py-4 px-4 text-right space-x-2">
                                <button
                                    onClick={() => handleUpdateStatus(lawyer.id, 'rejected')}
                                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                                    title="Rejeter"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(lawyer.id, 'approved')}
                                    className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                                    title="Approuver"
                                >
                                    <Check className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
