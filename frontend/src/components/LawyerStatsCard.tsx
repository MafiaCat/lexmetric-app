import React from 'react';
import { TrendingUp, Target, Clock, Coins, BarChart3 } from 'lucide-react';
import { LawyerStats } from '../types';

interface LawyerStatsCardProps {
    stats: LawyerStats;
    loading?: boolean;
}

export const LawyerStatsCard: React.FC<LawyerStatsCardProps> = ({ stats, loading }) => {
    if (loading) {
        return (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                    <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (stats.review_count === 0) {
        return (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 border border-dashed border-slate-300 dark:border-slate-700 text-center">
                <BarChart3 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pas encore assez de données pour générer des statistiques.</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Les stats apparaissent dès la première évaluation factuelle.</p>
            </div>
        );
    }

    const outcomeLabels: Record<string, string> = {
        'gagné': 'Gagné',
        'perdu': 'Perdu',
        'accord_amiable': 'Accord',
        'en_cours': 'En cours',
        'abandon': 'Abandon'
    };

    const outcomeColors: Record<string, string> = {
        'gagné': 'bg-green-500',
        'perdu': 'bg-red-500',
        'accord_amiable': 'bg-blue-500',
        'en_cours': 'bg-amber-500',
        'abandon': 'bg-slate-400'
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    Statistiques de Performance
                </h3>
                <span className="text-xs font-medium text-slate-500 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {stats.review_count} avis
                </span>
            </div>

            <div className="p-5 space-y-6">
                {/* Primary Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 dark:bg-indigo-500/5 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/10">
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                            <Target className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase">Recommandation</span>
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                            {stats.recommend_rate !== null && stats.recommend_rate !== undefined ? `${Math.round(stats.recommend_rate)}%` : '—'}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 italic"> clients satisfaits</p>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-500/5 p-4 rounded-xl border border-emerald-100 dark:border-emerald-500/10">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                            <Coins className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase">Honoraires Médians</span>
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                            {stats.median_fees_paid !== null && stats.median_fees_paid !== undefined ? `${Math.round(stats.median_fees_paid)}€` : '—'}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 italic">coût réel constaté</p>
                    </div>
                </div>

                {/* Mission Duration */}
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                            <Clock className="w-4 h-4 text-slate-500" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Durée moyenne de mission</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {stats.avg_mission_duration_days ? `${Math.round(stats.avg_mission_duration_days)} jours` : '—'}
                    </span>
                </div>

                {/* Outcome Distribution Bar */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">Issue des dossiers</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Répartition réelle</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                        {Object.entries(stats.mission_outcome_distribution).map(([outcome, count]) => {
                            const percentage = (count / stats.review_count) * 100;
                            return (
                                <div
                                    key={outcome}
                                    title={`${outcomeLabels[outcome] || outcome}: ${count}`}
                                    className={`${outcomeColors[outcome] || 'bg-slate-400'} transition-all hover:brightness-110`}
                                    style={{ width: `${percentage}%` }}
                                />
                            );
                        })}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                        {Object.entries(stats.mission_outcome_distribution).map(([outcome, count]) => (
                            <div key={outcome} className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${outcomeColors[outcome] || 'bg-slate-400'}`}></span>
                                <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">
                                    {outcomeLabels[outcome] || outcome} ({Math.round((count / stats.review_count) * 100)}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Qualitative Averages */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase mb-1">
                        <span>Score Qualitatif Moyen</span>
                        <span>/ 5</span>
                    </div>

                    {[
                        { label: 'Réactivité', value: stats.avg_reactivity },
                        { label: 'Expertise', value: stats.avg_technical },
                        { label: 'Négociation', value: stats.avg_negotiation },
                        { label: 'Honoraires', value: stats.avg_fee_respect },
                    ].map((item) => (
                        <div key={item.label} className="space-y-1">
                            <div className="flex justify-between text-xs transition-colors">
                                <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                                <span className="font-bold text-slate-900 dark:text-white">{item.value || '—'}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                    style={{ width: item.value ? `${(item.value / 5) * 100}%` : '0%' }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
