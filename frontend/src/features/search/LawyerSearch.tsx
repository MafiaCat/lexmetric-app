import React, { useState } from 'react';
import { Search, Briefcase, DollarSign, TrendingUp, Filter, Star, ShieldCheck, ShieldAlert } from 'lucide-react';
import { searchLawyers } from '../../services/api';
import { Lawyer, SearchParams } from '../../types';
import { LawyerProfile } from './LawyerProfile';

export const LawyerSearch: React.FC = () => {
    const [params, setParams] = useState<SearchParams>({
        specialty: 'Préjudice Corporel',
        complexity: 3,
        financial_stakes: 50000,
    });

    const [results, setResults] = useState<Lawyer[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
    const [displayLimit, setDisplayLimit] = useState(20);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await searchLawyers(params);
            setResults(data);
        } catch (err) {
            console.error("Failed to fetch lawyers from API", err);
            setResults([]);
        }
        setLoading(false);
        setSearched(true);
        setDisplayLimit(20);
    };

    if (selectedLawyer) {
        return <LawyerProfile lawyer={selectedLawyer} onBack={() => setSelectedLawyer(null)} />;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Recherche de prestataires</h1>
                <p className="text-slate-500 dark:text-slate-400">L'algorithme LexMetric analyse des milliers de profils pour sélectionner le meilleur avocat pour votre sinistre.</p>
            </div>

            {/* Search Form Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-xl overflow-hidden backdrop-blur-sm transition-colors duration-300">
                <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Critères du Dossier</h2>
                </div>

                <form onSubmit={handleSearch} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Spécialité requise
                            </label>
                            <select
                                value={params.specialty}
                                onChange={(e) => setParams({ ...params, specialty: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow appearance-none"
                            >
                                <option value="Préjudice Corporel">Préjudice Corporel</option>
                                <option value="RC Décennale">RC Décennale</option>
                                <option value="Droit du Travail">Droit du Travail</option>
                                <option value="Droit Commercial">Droit Commercial</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Complexité (1-5)
                            </label>
                            <input
                                type="range" min="1" max="5"
                                value={params.complexity}
                                onChange={(e) => setParams({ ...params, complexity: parseInt(e.target.value) })}
                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-4"
                            />
                            <div className="flex justify-between text-xs text-slate-500 px-1 pt-1">
                                <span>Simple</span>
                                <span className="text-blue-400 font-bold">{params.complexity} / 5</span>
                                <span>Très Complexe</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Enjeu Financier (€)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={params.financial_stakes}
                                    onChange={(e) => setParams({ ...params, financial_stakes: parseInt(e.target.value) })}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                                    placeholder="Ex: 50000"
                                />
                                <span className="absolute right-4 top-3 text-slate-400 font-semibold">€</span>
                            </div>
                        </div>

                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl flex items-center space-x-2 transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-500/25 disabled:opacity-70 disabled:transform-none"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Search className="w-5 h-5" />
                            )}
                            <span>Lancer le Matching</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Results Section */}
            {searched && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Star className="text-yellow-500 w-5 h-5" />
                            Résultats de l'Algorithme
                            <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs px-2 py-1 rounded ml-2">{results.length} profil(s)</span>
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {results.slice(0, displayLimit).map((lawyer, index) => (
                            <div key={lawyer.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors group relative overflow-hidden shadow-sm">
                                {/* Visual rank decorator */}
                                {index === 0 && <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-yellow-400 to-yellow-600" />}
                                {index === 1 && <div className="absolute top-0 left-0 w-1 h-full bg-slate-400" />}
                                {index === 2 && <div className="absolute top-0 left-0 w-1 h-full bg-amber-700" />}

                                <div className="flex items-center space-x-6">
                                    {/* Score Circle */}
                                    <div className="relative w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 group-hover:border-blue-500/50 transition-colors">
                                        {/* SVG Circle progress (simulated) */}
                                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                            <circle cx="30" cy="30" r="28" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-200 dark:text-slate-700" />
                                            <circle cx="30" cy="30" r="28" fill="none" stroke="currentColor" strokeWidth="3"
                                                strokeDasharray="175"
                                                strokeDashoffset={175 - (175 * (lawyer.matching_score || 0)) / 100}
                                                className={`transition-all duration-1000 ${lawyer.matching_score! >= 90 ? 'text-green-500' : lawyer.matching_score! >= 75 ? 'text-yellow-500' : 'text-orange-500'}`}
                                            />
                                        </svg>
                                        <div className="flex flex-col items-center leading-none z-10">
                                            <span className="font-bold text-lg text-slate-900 dark:text-white">{lawyer.matching_score}</span>
                                        </div>
                                    </div>

                                    {/* Profile info */}
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            Me {lawyer.first_name} {lawyer.last_name}
                                            {lawyer.in_network ? (
                                                <div className="flex items-center text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-400/10 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-500/20" title="Réseau d'Assurance Partenaire">
                                                    <ShieldCheck className="w-3 h-3 mr-1" /> Réseau Partenaire
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-400/10 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-500/20" title="Hors Réseau">
                                                    <ShieldAlert className="w-3 h-3 mr-1" /> Hors Réseau
                                                </div>
                                            )}
                                        </h4>
                                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1 space-x-4">
                                            <span>Barreau: <strong className="text-slate-700 dark:text-slate-300">{lawyer.bar_association}</strong></span>
                                            <span className="px-1.5">•</span>
                                            <span>Ancienneté: <strong className="text-slate-700 dark:text-slate-300">{new Date().getFullYear() - new Date(lawyer.oath_date).getFullYear()} ans</strong></span>
                                            <span className="px-1.5">•</span>
                                            <span>Taux: <strong className="text-slate-700 dark:text-slate-300">{lawyer.average_hourly_rate}€/h</strong></span>
                                        </div>

                                        <div className="flex gap-2 mt-3">
                                            {lawyer.specialties.map(spec => (
                                                <span key={spec} className="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 rounded-md">
                                                    {spec}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col items-end justify-center space-y-2 ml-4">
                                    <button className="px-4 py-2 bg-blue-50 dark:bg-blue-600/10 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white border border-blue-200 dark:border-blue-500/30 hover:border-transparent font-medium rounded-lg transition-all text-sm">
                                        Confier le dossier
                                    </button>
                                    <button
                                        onClick={() => setSelectedLawyer(lawyer)}
                                        className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium transition-colors"
                                    >
                                        Voir Profil Détaillé
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>

                    {results.length > displayLimit && (
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() => setDisplayLimit(prev => prev + 20)}
                                className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                            >
                                Voir plus de résultats ({results.length - displayLimit} restants)
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
