import React from 'react';
import {
    TrendingDown,
    TrendingUp,
    Clock,
    Award,
    BarChart3,
    DollarSign
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

import { Lawyer } from '../../types';
import { getLawyers } from '../../services/api';

export const AnalyticsDashboard: React.FC<{ onLawyerClick?: (lawyer: Lawyer) => void }> = ({ onLawyerClick }) => {
    const [topLawyers, setTopLawyers] = React.useState<Lawyer[]>([]);

    React.useEffect(() => {
        // Fetch real lawyers to make the dashboard cards clickable to an actual profile
        const fetchTop = async () => {
            try {
                const data = await getLawyers();
                // Just take the first 4 for demo purposes of top performers
                setTopLawyers(data.slice(0, 4));
            } catch (err) {
                console.error("Failed to load top lawyers", err);
            }
        };
        fetchTop();
    }, []);

    // Mock data for the dashboard (would come from FastAPI in production)
    const metrics = {
        totalCases: 1248,
        averageCost: 4250,
        costTrend: -12.5, // % decrease
        successRate: 78,
        successTrend: +4.2,
        avgDurationDays: 185,
        durationTrend: -5.1
    };

    const chartData = [
        { month: 'Jan', volume: 65, cost: 4200 },
        { month: 'Fév', volume: 59, cost: 4100 },
        { month: 'Mar', volume: 80, cost: 4500 },
        { month: 'Avr', volume: 81, cost: 3900 },
        { month: 'Mai', volume: 56, cost: 4000 },
        { month: 'Juin', volume: 55, cost: 3850 },
        { month: 'Juil', volume: 40, cost: 3700 },
        { month: 'Août', volume: 30, cost: 3600 },
        { month: 'Sept', volume: 85, cost: 4300 },
        { month: 'Oct', volume: 90, cost: 4400 },
        { month: 'Nov', volume: 75, cost: 4150 },
        { month: 'Déc', volume: 82, cost: 4250 },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10">

            {/* Header section */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Tableau de Bord Direction</h1>
                    <p className="text-slate-500 dark:text-slate-400">Vue globale des performances de votre réseau d'avocats sur l'année en cours.</p>
                </div>
                <div className="flex gap-3">
                    <select className="bg-white dark:bg-slate-800 border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option>Tous les contentieux</option>
                        <option>Préjudice Corporel</option>
                        <option>RC Décennale</option>
                    </select>
                    <select className="bg-white dark:bg-slate-800 border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option>Année 2026</option>
                        <option>Année 2025</option>
                    </select>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* KPI 2: Average Cost */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-lg relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 bg-emerald-500/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Coût Moyen Honoraires</p>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{metrics.averageCost.toLocaleString('fr-FR')} €</h3>
                        </div>
                        <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm">
                        <span className="text-green-400 flex items-center font-medium">
                            <TrendingDown className="w-4 h-4 mr-1" /> {Math.abs(metrics.costTrend)}%
                        </span>
                        <span className="text-slate-500 ml-2">Économie réalisée</span>
                    </div>
                </div>

                {/* KPI 3: Success Rate */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-lg relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 bg-blue-500/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Taux de Succès Global</p>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{metrics.successRate}%</h3>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                            <Award className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm">
                        <span className="text-green-400 flex items-center font-medium">
                            <TrendingUp className="w-4 h-4 mr-1" /> +{metrics.successTrend}%
                        </span>
                        <span className="text-slate-500 ml-2">vs année précédente</span>
                    </div>
                </div>

                {/* KPI 4: Average Duration */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-lg relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 bg-purple-500/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Durée Moy. Procédure</p>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{metrics.avgDurationDays} <span className="text-xl text-slate-500">jours</span></h3>
                        </div>
                        <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm">
                        <span className="text-green-400 flex items-center font-medium">
                            <TrendingDown className="w-4 h-4 mr-1" /> {Math.abs(metrics.durationTrend)}%
                        </span>
                        <span className="text-slate-500 ml-2">Traitement plus rapide</span>
                    </div>
                </div>

            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Placeholder for Main Bar Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 flex flex-col shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-400" />
                            Évolution des Coûts vs Volume de Dossiers
                        </h3>
                    </div>
                    <div className="flex-1 flex items-center justify-center min-h-[300px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#f8fafc' }}
                                    itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                <Bar yAxisId="left" dataKey="volume" name="Dossiers Confiés" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                <Bar yAxisId="right" dataKey="cost" name="Coût Moyen (€)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Performers List */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-lg flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Award className="w-5 h-5 text-yellow-400" />
                            Top Cabinets (Performance)
                        </h3>
                        <button className="text-sm text-blue-400 hover:text-blue-300">Voir tout</button>
                    </div>

                    <div className="space-y-4 flex-1">
                        {topLawyers.map((lawyer, idx) => (
                            <div
                                key={lawyer.id}
                                onClick={() => onLawyerClick && onLawyerClick(lawyer)}
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 group-hover:bg-yellow-500/30' :
                                        idx === 1 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/50 group-hover:bg-slate-400/30' :
                                            idx === 2 ? 'bg-amber-700/20 text-amber-500 border border-amber-700/50 group-hover:bg-amber-700/30' :
                                                'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-slate-700'
                                        }`}>
                                        #{idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[140px] group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" title={`Me ${lawyer.first_name} ${lawyer.last_name}`}>
                                            Me {lawyer.last_name}
                                        </p>
                                        <p className="text-xs text-slate-500">{lawyer.city}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-green-400">{88 - (idx * 3)}%</p>
                                    <p className="text-xs text-slate-500">{lawyer.average_hourly_rate}€/h</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
