import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuditLog {
    id: number;
    user_id: number;
    action: string;
    target_resource: string;
    created_at: string;
}

export const AdminAuditLogs: React.FC = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${apiUrl}/api/admin/audit-logs`, {
                headers: {
                    'x-user-role': user?.role || ''
                }
            });
            if (response.ok) {
                const data = await response.json();
                setLogs(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(date);
    };

    const getActionBadge = (action: string) => {
        if (action.includes('DELETE')) {
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">{action}</span>;
        }
        if (action.includes('APPROVE') || action.includes('IMPORT')) {
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{action}</span>;
        }
        if (action.includes('IMPERSONATE')) {
            return <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{action}</span>;
        }
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">{action}</span>;
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Activity className="w-8 h-8 text-indigo-400" />
                        Audit Log (Sécurité)
                    </h1>
                    <p className="text-slate-400">Historique complet des actions de modération et des opérations sensibles.</p>
                </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mt-6">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher une action..."
                            className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 w-64 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-900/80 text-xs uppercase text-slate-500 border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-medium">Date & Heure</th>
                                <th className="px-6 py-4 font-medium">Utilisateur (Modo ID)</th>
                                <th className="px-6 py-4 font-medium">Action</th>
                                <th className="px-6 py-4 font-medium">Cible (Resource)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        Chargement de l'historique...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 flex flex-col items-center gap-2">
                                        <ShieldAlert className="w-8 h-8 text-slate-600" />
                                        Aucun journal d'audit enregistré.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-300">
                                            {formatDate(log.created_at)}
                                        </td>
                                        <td className="px-6 py-4">Utilisateur #{log.user_id}</td>
                                        <td className="px-6 py-4">
                                            {getActionBadge(log.action)}
                                        </td>
                                        <td className="px-6 py-4 max-w-[200px] truncate">{log.target_resource}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
