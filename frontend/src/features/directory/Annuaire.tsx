import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, ShieldAlert, MapPin, Briefcase, Filter } from 'lucide-react';
import { getLawyers } from '../../services/api';
import { Lawyer } from '../../types';

export const Annuaire: React.FC = () => {
    const [lawyers, setLawyers] = useState<Lawyer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
    const [selectedBar, setSelectedBar] = useState<string>('');
    const [inNetworkOnly, setInNetworkOnly] = useState<boolean>(false);

    useEffect(() => {
        const fetchLawyers = async () => {
            try {
                const data = await getLawyers();
                setLawyers(data);
            } catch (err) {
                console.error("Failed to load directory", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLawyers();
    }, []);

    // Reset to first page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedSpecialty, selectedBar, inNetworkOnly]);

    // Compute unique options for filters
    const uniqueSpecialties = Array.from(new Set(lawyers.flatMap(l => l.specialties))).sort();
    const uniqueBars = Array.from(new Set(lawyers.map(l => l.bar_association))).sort();

    const filteredLawyers = lawyers.filter(lawyer => {
        const matchesSearch = lawyer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lawyer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lawyer.bar_association.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSpecialty = selectedSpecialty === '' || lawyer.specialties.includes(selectedSpecialty);
        const matchesBar = selectedBar === '' || lawyer.bar_association === selectedBar;
        const matchesNetwork = !inNetworkOnly || lawyer.in_network;

        return matchesSearch && matchesSpecialty && matchesBar && matchesNetwork;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredLawyers.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLawyers = filteredLawyers.slice(indexOfFirstItem, indexOfLastItem);

    return (
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
                <div className="flex flex-col md:flex-row gap-5 items-end">
                    {/* Search Bar */}
                    <div className="relative w-full md:w-80">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Recherche vocale ou textuelle</label>
                        <input
                            type="text"
                            placeholder="Rechercher un nom, un barreau..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                        />
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-9" />
                    </div>

                    <div className="w-full md:w-48 space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Spécialité</label>
                        <select
                            value={selectedSpecialty}
                            onChange={(e) => setSelectedSpecialty(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Toutes les spécialités</option>
                            {uniqueSpecialties.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full md:w-48 space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Barreau</label>
                        <select
                            value={selectedBar}
                            onChange={(e) => setSelectedBar(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Tous les barreaux</option>
                            {uniqueBars.map(bar => (
                                <option key={bar} value={bar}>{bar}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center mb-2.5 ml-0 md:ml-4">
                        <label className="flex items-center cursor-pointer space-x-3">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={inNetworkOnly}
                                    onChange={() => setInNetworkOnly(!inNetworkOnly)}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${inNetworkOnly ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${inNetworkOnly ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Réseau Partenaire
                            </span>
                        </label>
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
                                            {new Date().getFullYear() - new Date(lawyer.oath_date).getFullYear()} ans exp.
                                        </div>
                                        <div className="font-semibold text-slate-700 dark:text-slate-300">
                                            {lawyer.average_hourly_rate}€/h
                                        </div>
                                    </div>
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

                            <div className="flex space-x-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
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
    );
};
