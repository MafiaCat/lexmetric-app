import React, { useEffect, useState } from 'react';
import { Users, Building2, Scale, AlertCircle, FileText, Ticket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminStats {
    total_users: number;
    total_companies: number;
    total_lawyers: number;
    pending_lawyers: number;
    total_reviews: number;
    open_tickets: number;
}

export const AdminDashboardStats: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Directly call the endpoint with fetch, injecting the x-user-role header.
                const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
                const response = await fetch(`${apiUrl}/api/admin/stats`, {
                    headers: {
                        'x-user-role': user?.role || ''
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch admin stats:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user?.role === 'admin') {
            fetchStats();
        }
    }, [user]);

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-8">
                    <div className="h-8 bg-slate-800 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-32 bg-slate-800 rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const statCards = [
        { title: "Utilisateurs Inscrits", value: stats?.total_users || 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
        { title: "Entreprises (B2B)", value: stats?.total_companies || 0, icon: Building2, color: "text-indigo-400", bg: "bg-indigo-500/10" },
        { title: "Avocats Référencés", value: stats?.total_lawyers || 0, icon: Scale, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { title: "Avocats en Attente", value: stats?.pending_lawyers || 0, icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10", alert: (stats?.pending_lawyers || 0) > 0 },
        { title: "Avis Déposés", value: stats?.total_reviews || 0, icon: FileText, color: "text-purple-400", bg: "bg-purple-500/10" },
        { title: "Tickets Ouverts", value: stats?.open_tickets || 0, icon: Ticket, color: "text-rose-400", bg: "bg-rose-500/10", alert: (stats?.open_tickets || 0) > 0 },
    ];

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Vue d'ensemble</h1>
                <p className="text-slate-400">Métriques globales et état de santé de la plateforme.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-xl hover:border-slate-700 transition-all flex items-start justify-between group"
                    >
                        <div>
                            <p className="text-slate-400 text-sm font-medium mb-1">{stat.title}</p>
                            <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                                {stat.value}
                                {stat.alert && (
                                    <span className="flex h-3 w-3 relative">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${stat.color.replace('text', 'bg')}`}></span>
                                        <span className={`relative inline-flex rounded-full h-3 w-3 ${stat.color.replace('text', 'bg')}`}></span>
                                    </span>
                                )}
                            </h3>
                        </div>
                        <div className={`p-4 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl">
                    <h2 className="text-xl font-semibold text-white mb-4">Activité Récente</h2>
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-800 rounded-xl">
                        <AlertCircle className="w-8 h-8 text-slate-600 mb-2" />
                        <p className="text-slate-500 text-center text-sm">Le module d'historique (Audit Logs) de l'activité<br />est prévu pour la phase 4.</p>
                    </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl">
                    <h2 className="text-xl font-semibold text-white mb-4">Alertes Système</h2>
                    {stats?.pending_lawyers === 0 && stats?.open_tickets === 0 ? (
                        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                            <Scale className="w-5 h-5" />
                            <p className="font-medium">Tout est au vert, aucune action requise.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {(stats?.pending_lawyers || 0) > 0 && (
                                <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
                                    <AlertCircle className="w-5 h-5" />
                                    <p className="font-medium text-sm">
                                        <span className="font-bold">{stats?.pending_lawyers} avocats</span> en attente de modération.
                                    </p>
                                </div>
                            )}
                            {(stats?.open_tickets || 0) > 0 && (
                                <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg">
                                    <Ticket className="w-5 h-5" />
                                    <p className="font-medium text-sm">
                                        <span className="font-bold">{stats?.open_tickets} tickets support</span> nécessitent votre attention.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
