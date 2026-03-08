import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, ShieldAlert, MapPin, Briefcase, X, Eye, Calendar } from 'lucide-react';
import { getLawyers, getLawyerStats } from '../../services/api';
import { Lawyer, LawyerStats } from '../../types';
import { LawyerStatsCard } from '../../components/LawyerStatsCard';

export const Annuaire: React.FC = () => {
    const [lawyers, setLawyers] = useState<Lawyer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 12;

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset to page 1 on new search
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        const fetchLawyers = async () => {
            setLoading(true);
            try {
                const data = await getLawyers(currentPage, itemsPerPage, debouncedSearch);
                setLawyers(data.items);
                setTotalPages(data.pages);
            } catch (err) {
                console.error("Failed to load directory", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLawyers();
    }, [currentPage, debouncedSearch]);

    const currentLawyers = lawyers;

    // Profile viewer
    const [viewingLawyer, setViewingLawyer] = useState<Lawyer | null>(null);

    return (
        <>
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Header section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                            <Users className="w-8 h-8 text-indigo-500" />
                            Annuaire des Avocats
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Consultez l'ensemble des professionnels du droit référencés dans la base LexMetric.
                        </p>
                    </div>
                </div>

                {/* Advanced Filters Panel - Always Visible */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-5 items-center">
                        {/* Search Bar */}
                        <div className="relative w-full">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Recherche textuelle</label>
                            <input
                                type="text"
                                placeholder="Rechercher un nom, un barreau, une ville..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                            />
                            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-9" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Chargement de l'annuaire...</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Grid wrapper */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentLawyers.map((lawyer) => (
                                <div key={lawyer.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col hover:shadow-xl transition-all duration-300 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-100 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xl font-bold border border-indigo-200 dark:border-indigo-800/50">
                                            {lawyer.first_name[0]}{lawyer.last_name[0]}
                                        </div>
                                        {lawyer.in_network ? (
                                            <div className="flex items-center text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-400/10 px-2 py-1 rounded-full border border-green-200 dark:border-green-500/20" title="Réseau d'Assurance Partenaire">
                                                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Partenaire
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-400/10 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-500/20" title="Hors Réseau">
                                                <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Hors Réseau
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                        Me {lawyer.first_name} {lawyer.last_name}
                                    </h3>

                                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-4 space-x-2">
                                        <MapPin className="w-4 h-4" />
                                        <span>Barreau de {lawyer.bar_association}</span>
                                    </div>

                                    <div className="space-y-3 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                        <div className="flex flex-wrap gap-2">
                                            {lawyer.specialties.map(spec => (
                                                <span key={spec} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 rounded-lg">
                                                    {spec}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between text-sm mt-4">
                                            <div className="flex items-center text-slate-500 dark:text-slate-400">
                                                <Briefcase className="w-4 h-4 mr-1.5" />
                                                {lawyer.oath_date ? `${new Date().getFullYear() - new Date(lawyer.oath_date).getFullYear()} ans exp.` : 'Exp. inconnue'}
                                            </div>
                                            <div className="font-semibold text-slate-700 dark:text-slate-300">
                                                {lawyer.average_hourly_rate > 0 ? `${lawyer.average_hourly_rate}€/h` : 'N/R'}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setViewingLawyer(lawyer)}
                                            className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-xl border border-indigo-100 dark:border-indigo-500/20 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" /> Voir la fiche
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {currentLawyers.length === 0 && (
                                <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
                                    Aucun avocat trouvé pour cette recherche.
                                </div>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2 pt-8 border-t border-slate-200 dark:border-slate-700/50">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm shadow-sm"
                                >
                                    Précédent
                                </button>

                                <div className="flex space-x-1 overflow-x-auto max-w-sm px-2 scrollbar-none">
                                    {(() => {
                                        // Complex classic pagination rendering to restrict huge button lists
                                        let pages = [];
                                        let startPage = Math.max(1, currentPage - 2);
                                        let endPage = Math.min(totalPages, currentPage + 2);

                                        if (currentPage <= 3) endPage = Math.min(5, totalPages);
                                        if (currentPage >= totalPages - 2) startPage = Math.max(1, totalPages - 4);

                                        for (let i = startPage; i <= endPage; i++) {
                                            pages.push(
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentPage(i)}
                                                    className={`w-10 h-10 flex-shrink-0 rounded-lg text-sm font-medium transition-colors ${currentPage === i
                                                        ? 'bg-indigo-600 text-white shadow-md'
                                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                        }`}
                                                >
                                                    {i}
                                                </button>
                                            );
                                        }
                                        return pages;
                                    })()}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm shadow-sm"
                                >
                                    Suivant
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Profile Viewer Modal */}
            {viewingLawyer && <LawyerProfileModal lawyer={viewingLawyer!} onClose={() => setViewingLawyer(null)} />}
        </>
    );
};



/* ----- Profile Modal (Lawyer Detail) ----- */
const LawyerProfileModal: React.FC<{ lawyer: Lawyer; onClose: () => void }> = ({ lawyer, onClose }) => {
    const [stats, setStats] = useState<LawyerStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoadingStats(true);
            try {
                const data = await getLawyerStats(lawyer.id);
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch lawyer stats:", error);
            } finally {
                setLoadingStats(false);
            }
        };
        fetchStats();
    }, [lawyer.id]);

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-slate-900/60 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
            <div
                className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-400 to-blue-400 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                            {lawyer.first_name[0]}{lawyer.last_name[0]}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Me {lawyer.first_name} {lawyer.last_name}</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">{lawyer.firm_type || 'Cabinet non renseigné'}</p>
                            <div className="mt-2">
                                {lawyer.in_network ? (
                                    <span className="inline-flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-400/10 px-2.5 py-1 rounded-full border border-green-200 dark:border-green-500/20">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Partenaire Réseau
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-600">
                                        <ShieldAlert className="w-3.5 h-3.5" /> Hors Réseau
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                    {/* Left Column: Details */}
                    <div className="md:col-span-3 p-6 space-y-6 border-r border-slate-100 dark:border-slate-800">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Barreau</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{lawyer.bar_association}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Ville</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{lawyer.city || '—'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Prestation de serment</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{lawyer.oath_date ? new Date(lawyer.oath_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : 'Non renseignée'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                <Briefcase className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Taux horaire indicatif</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{lawyer.average_hourly_rate > 0 ? `${lawyer.average_hourly_rate} €/h` : 'Non renseigné'}</p>
                                </div>
                            </div>
                        </div>

                        {lawyer.specialties && lawyer.specialties.length > 0 && (
                            <div>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider font-bold">Domaines d'intervention</p>
                                <div className="flex flex-wrap gap-2">
                                    {lawyer.specialties.map(s => (
                                        <span key={s} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20 text-xs font-semibold rounded-lg">{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Stats Card */}
                    <div className="md:col-span-2 p-4 bg-slate-50/50 dark:bg-slate-800/20">
                        {stats && <LawyerStatsCard stats={stats} loading={loadingStats} />}
                        {!stats && loadingStats && <div className="p-8 text-center text-slate-400">Chargement des stats...</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};
