import React from 'react';
import { Lawyer } from '../../types';
import {
    ArrowLeft,
    Star,
    ShieldCheck,
    ShieldAlert,
    Briefcase,
    Calendar,
    MapPin,
    DollarSign,
    Award,
    TrendingUp,
    MessageSquare
} from 'lucide-react';

interface LawyerProfileProps {
    lawyer: Lawyer;
    onBack: () => void;
}

export const LawyerProfile: React.FC<LawyerProfileProps> = ({ lawyer, onBack }) => {
    // Mock detailed stats since we don't have them all in the model yet
    const stats = {
        casesHandled: Math.floor(Math.random() * 100) + 20,
        successRate: lawyer.matching_score ? Math.min(lawyer.matching_score + 5, 99) : 85,
        avgSettlementTime: Math.floor(Math.random() * 6) + 4, // months
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            {/* Header / Back action */}
            <button
                onClick={onBack}
                className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors gap-2 font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Retour aux résultats
            </button>

            {/* Main Profile Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden transition-colors duration-300">

                {/* Top Banner */}
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 w-full relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-800 flex items-center justify-center text-3xl font-bold text-slate-400 dark:text-slate-600 shadow-lg">
                            {lawyer.first_name[0]}{lawyer.last_name[0]}
                        </div>
                    </div>
                    {/* Matching Score Badge */}
                    {lawyer.matching_score && (
                        <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md rounded-xl p-3 border border-white/30 text-white flex items-center gap-3 shadow-lg">
                            <div>
                                <p className="text-xs text-white/80 font-medium uppercase tracking-wider">Score LexMetric</p>
                                <p className="text-2xl font-bold leading-none">{lawyer.matching_score}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full border-4 border-green-400 flex items-center justify-center">
                                <Star className="w-6 h-6 text-green-400 fill-current" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-16 px-8 pb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                Me {lawyer.first_name} {lawyer.last_name}
                                {lawyer.in_network ? (
                                    <span className="flex items-center text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-400/10 px-2.5 py-1 rounded-full border border-green-200 dark:border-green-500/20">
                                        <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Partenaire
                                    </span>
                                ) : (
                                    <span className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-400/10 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-500/20">
                                        <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Hors réseau
                                    </span>
                                )}
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-slate-400" />
                                {lawyer.law_firm_id ? "Membre d'un cabinet associé" : "Avocat Indépendant"}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-5 py-2.5 bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-slate-600 font-semibold rounded-xl transition-colors flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Message
                            </button>
                            <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2">
                                Confier le dossier
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Barreau</p>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">{lawyer.bar_association}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Serment</p>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">{new Date(lawyer.oath_date).getFullYear()}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> Taux Moyen</p>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">{lawyer.average_hourly_rate} €/h</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Expertises</p>
                            <div className="flex flex-wrap gap-1.5">
                                {lawyer.specialties.map(spec => (
                                    <span key={spec} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-xs font-medium rounded border border-indigo-200 dark:border-indigo-500/20">
                                        {spec}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data & Performance Section */}
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Analyse de Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <h4 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Dossiers avec nous</h4>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.casesHandled}</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
                    <div className="w-12 h-12 bg-green-50 dark:bg-green-500/10 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                        <Award className="w-6 h-6" />
                    </div>
                    <h4 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Taux de succès estimé</h4>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white flex items-baseline gap-2">
                        {stats.successRate}%
                        <span className="text-sm text-green-500 flex items-center"><TrendingUp className="w-3 h-3 mr-0.5" />+2%</span>
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
                    <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <h4 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Durée moy. clôture</h4>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.avgSettlementTime} <span className="text-lg text-slate-500">mois</span></p>
                </div>
            </div>

            {/* Ratings Section (Mock data for now) */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg mt-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Évaluations Récentes (Managers)</h3>
                <div className="space-y-4">
                    {[
                        { date: "Oct 2025", score: 5, comment: "Excellente plaidoirie, le cabinet a su renverser la situation." },
                        { date: "Sept 2025", score: 4, comment: "Dossier traité sérieusement, légers retards de communication au mois d'août mais résultat positif." }
                    ].map((review, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex gap-1 text-yellow-400">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} className="w-4 h-4" fill={j < review.score ? "currentColor" : "none"} />
                                    ))}
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{review.date}</span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300">"{review.comment}"</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};
