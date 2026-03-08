import React, { useState, useEffect, useRef } from 'react';
import { Upload, Users, AlertCircle, CheckCircle2, Search, Plus, X, Save, Eye, Database, TrendingUp, MapPin, Calendar, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Lawyer, LawyerStats, LawFirm } from '../../types';
import { getLawyers, getPendingLawyers, updateAdminLawyer, getFirms, updateFirm, getLawyerStats } from '../../services/api';
import { LawyerStatsCard } from '../../components/LawyerStatsCard';


export const AdminLawyerManager: React.FC = () => {
    const { user } = useAuth();
    const [lawyers, setLawyers] = useState<Lawyer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Tabs state
    const [activeTab, setActiveTab] = useState<'lawyers' | 'firms'>('lawyers');

    // Lawyers Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Firms state & pagination
    const [firms, setFirms] = useState<LawFirm[]>([]);
    const [firmPage, setFirmPage] = useState(1);
    const [firmTotalPages, setFirmTotalPages] = useState(1);
    const [firmTotalCount, setFirmTotalCount] = useState(0);

    const PAGE_SIZE = 20;

    // Profile viewer state
    const [viewingLawyer, setViewingLawyer] = useState<Lawyer | null>(null);

    // Modal Edit State
    const [editingLawyer, setEditingLawyer] = useState<Lawyer | null>(null);
    const [editingFirm, setEditingFirm] = useState<LawFirm | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

    const fetchLawyersData = async (page = currentPage) => {
        setIsLoading(true);
        try {
            const paginated = await getLawyers(page, PAGE_SIZE, debouncedSearch);
            const all = paginated.items;
            setTotalPages(paginated.pages);
            setTotalCount(paginated.total);

            // Only add pending lawyers on first page if not searching
            if (page === 1 && !debouncedSearch) {
                const pending = await getPendingLawyers();
                const allIds = new Set(all.map(l => l.id));
                const uniquePending = pending.filter(p => !allIds.has(p.id));
                setLawyers([...uniquePending, ...all]);
            } else {
                setLawyers(all);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFirmsData = async (page = firmPage) => {
        setIsLoading(true);
        try {
            const paginated = await getFirms(page, PAGE_SIZE, debouncedSearch);
            setFirms(paginated.items);
            setFirmTotalPages(paginated.pages);
            setFirmTotalCount(paginated.total);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'lawyers') {
            setCurrentPage(1);
            fetchLawyersData(1);
        } else {
            setFirmPage(1);
            fetchFirmsData(1);
        }
    }, [debouncedSearch, activeTab]);

    useEffect(() => {
        if (activeTab === 'lawyers' && currentPage > 1) fetchLawyersData(currentPage);
    }, [currentPage]);

    useEffect(() => {
        if (activeTab === 'firms' && firmPage > 1) fetchFirmsData(firmPage);
    }, [firmPage]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            setUploadError("Veuillez sélectionner un fichier CSV valide.");
            return;
        }

        setIsUploading(true);
        setUploadError(null);
        setUploadSuccess(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${apiUrl}/api/admin/lawyers/bulk`, {
                method: 'POST',
                headers: {
                    'x-user-role': user?.role || ''
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setUploadSuccess(`${data.created} avocats ont été importés avec succès.`);
                fetchLawyersData(); // Refresh the list
            } else {
                const errData = await response.json();
                setUploadError(errData.detail || "Erreur lors de l'importation");
            }
        } catch (error) {
            setUploadError("Erreur réseau de communication avec le serveur.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLawyer) return;

        setIsSaving(true);
        try {
            await updateAdminLawyer(editingLawyer.id, {
                first_name: editingLawyer.first_name,
                last_name: editingLawyer.last_name,
                bar_association: editingLawyer.bar_association,
                city: editingLawyer.city,
                average_hourly_rate: editingLawyer.average_hourly_rate
            });
            setUploadSuccess(`Le profil de Me ${editingLawyer.last_name} a été mis à jour.`);
            setEditingLawyer(null);
            fetchLawyersData();
        } catch (error) {
            console.error(error);
            setUploadError("Erreur lors de la mise à jour du profil.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveFirm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingFirm) return;

        setIsSaving(true);
        try {
            await updateFirm(editingFirm.id, {
                name: editingFirm.name,
                size: editingFirm.size
            });
            setUploadSuccess(`Le cabinet ${editingFirm.name} a été mis à jour.`);
            setEditingFirm(null);
            fetchFirmsData();
        } catch (error) {
            console.error(error);
            setUploadError("Erreur lors de la mise à jour du cabinet.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Users className="w-8 h-8 text-indigo-400" />
                        Gestion du Répertoire
                    </h1>
                    <p className="text-slate-400">Gérez les avocats et les cabinets partenaires.</p>
                </div>

                {activeTab === 'lawyers' && (
                    <div className="flex gap-4">
                        <button
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium border border-slate-700"
                        >
                            <Plus className="w-4 h-4" /> Ajouter manuellement
                        </button>

                        <div>
                            <input
                                type="file"
                                accept=".csv"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                                id="csv-upload"
                            />
                            <label
                                htmlFor="csv-upload"
                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium cursor-pointer ${isUploading
                                    ? 'bg-indigo-900 text-indigo-300 border border-indigo-800'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 shadow-lg shadow-indigo-500/20'
                                    }`}
                            >
                                <Upload className={`w-4 h-4 ${isUploading ? 'animate-bounce' : ''}`} />
                                {isUploading ? 'Importation...' : 'Importer CSV'}
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Notifications */}
            {uploadError && (
                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{uploadError}</p>
                </div>
            )}

            {uploadSuccess && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{uploadSuccess}</p>
                </div>
            )}

            {/* Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mt-6">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder={activeTab === 'lawyers' ? "Rechercher un avocat..." : "Rechercher un cabinet..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 w-64 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                        <div className="flex bg-slate-950/50 p-1 rounded-xl border border-slate-800">
                            <button
                                onClick={() => setActiveTab('lawyers')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'lawyers' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Avocats ({totalCount})
                            </button>
                            <button
                                onClick={() => setActiveTab('firms')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'firms' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Cabinets ({firmTotalCount})
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-900/80 text-xs uppercase text-slate-500 border-b border-slate-800">
                            {activeTab === 'lawyers' ? (
                                <tr>
                                    <th className="px-6 py-4 font-medium">Nom complet</th>
                                    <th className="px-6 py-4 font-medium">Barreau</th>
                                    <th className="px-6 py-4 font-medium">Ville</th>
                                    <th className="px-6 py-4 font-medium">Source</th>
                                    <th className="px-6 py-4 font-medium">Statut</th>
                                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th className="px-6 py-4 font-medium">Nom du cabinet</th>
                                    <th className="px-6 py-4 font-medium">Taille</th>
                                    <th className="px-6 py-4 font-medium">ID</th>
                                    <th className="px-6 py-4 text-right font-medium">Actions</th>
                                </tr>
                            )}
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        Chargement...
                                    </td>
                                </tr>
                            ) : activeTab === 'lawyers' ? (
                                lawyers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            Aucun avocat trouvé.
                                        </td>
                                    </tr>
                                ) : (
                                    lawyers.map((lawyer) => (
                                        <tr key={lawyer.id} className="hover:bg-slate-800/20 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-200">
                                                Me {lawyer.first_name} {lawyer.last_name}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">{lawyer.bar_association}</td>
                                            <td className="px-6 py-4 text-slate-400">{lawyer.city || '—'}</td>
                                            <td className="px-6 py-4">
                                                {lawyer.source === 'cnb_import' ? (
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1 w-fit">
                                                        <Database className="w-3 h-3" /> CNB
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 w-fit block">Manuel</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {lawyer.status === 'pending' ? (
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">En attente</span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Validé</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => setViewingLawyer(lawyer)}
                                                    className="text-slate-400 hover:text-slate-200 font-medium text-xs flex items-center gap-1"
                                                >
                                                    <Eye className="w-3.5 h-3.5" /> Voir fiche
                                                </button>
                                                <button
                                                    onClick={() => setEditingLawyer(lawyer)}
                                                    className="text-indigo-400 hover:text-indigo-300 font-medium text-xs">Éditer
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )
                            ) : (
                                firms.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                            Aucun cabinet trouvé.
                                        </td>
                                    </tr>
                                ) : (
                                    firms.map((firm) => (
                                        <tr key={firm.id} className="hover:bg-slate-800/20 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-200">
                                                {firm.name}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400">{firm.size || '—'} collaborateurs</td>
                                            <td className="px-6 py-4 text-slate-500 font-mono text-xs">#{firm.id}</td>
                                            <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => setEditingFirm(firm)}
                                                    className="text-indigo-400 hover:text-indigo-300 font-medium text-xs">Éditer
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {((activeTab === 'lawyers' && totalPages > 1) || (activeTab === 'firms' && firmTotalPages > 1)) && (
                <div className="flex justify-between items-center mt-4 pb-2">
                    <span className="text-slate-500 text-sm">
                        {activeTab === 'lawyers' ? `${totalCount.toLocaleString('fr-FR')} avocats` : `${firmTotalCount.toLocaleString('fr-FR')} cabinets`} au total
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => activeTab === 'lawyers' ? setCurrentPage(p => Math.max(1, p - 1)) : setFirmPage(p => Math.max(1, p - 1))}
                            disabled={activeTab === 'lawyers' ? currentPage === 1 : firmPage === 1}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm disabled:opacity-40 hover:bg-slate-700 transition-colors"
                        >
                            Préc.
                        </button>
                        <div className="flex gap-1">
                            {(() => {
                                const pages = [];
                                const currentP = activeTab === 'lawyers' ? currentPage : firmPage;
                                const totalP = activeTab === 'lawyers' ? totalPages : firmTotalPages;
                                const start = Math.max(1, currentP - 2);
                                const end = Math.min(totalP, currentP + 2);
                                if (currentP <= 3) { for (let i = 1; i <= Math.min(5, totalP); i++) pages.push(i); }
                                else if (currentP >= totalP - 2) { for (let i = Math.max(1, totalP - 4); i <= totalP; i++) pages.push(i); }
                                else { for (let i = start; i <= end; i++) pages.push(i); }
                                return pages.map(p => (
                                    <button key={p} onClick={() => activeTab === 'lawyers' ? setCurrentPage(p) : setFirmPage(p)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentP === p ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}>
                                        {p}
                                    </button>
                                ));
                            })()}
                        </div>
                        <button
                            onClick={() => activeTab === 'lawyers' ? setCurrentPage(p => Math.min(totalPages, p + 1)) : setFirmPage(p => Math.min(firmTotalPages, p + 1))}
                            disabled={activeTab === 'lawyers' ? currentPage === totalPages : firmPage === firmTotalPages}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm disabled:opacity-40 hover:bg-slate-700 transition-colors"
                        >
                            Suiv.
                        </button>
                    </div>
                </div>
            )}

            {/* Profile Viewer Modal (Lawyer) */}
            {viewingLawyer && (
                <AdminLawyerProfileModal
                    lawyer={viewingLawyer}
                    onClose={() => setViewingLawyer(null)}
                    onEdit={() => { setViewingLawyer(null); setEditingLawyer(viewingLawyer); }}
                />
            )}

            {/* Edit Lawyer Modal */}
            {editingLawyer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-800">
                            <h3 className="text-xl font-bold text-white">Éditer le profil</h3>
                            <button onClick={() => setEditingLawyer(null)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-sm text-slate-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="font-medium text-slate-400">Prénom</label>
                                    <input
                                        type="text"
                                        value={editingLawyer.first_name}
                                        onChange={(e) => setEditingLawyer({ ...editingLawyer, first_name: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-medium text-slate-400">Nom</label>
                                    <input
                                        type="text"
                                        value={editingLawyer.last_name}
                                        onChange={(e) => setEditingLawyer({ ...editingLawyer, last_name: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-medium text-slate-400">Barreau</label>
                                <input
                                    type="text"
                                    value={editingLawyer.bar_association}
                                    onChange={(e) => setEditingLawyer({ ...editingLawyer, bar_association: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="font-medium text-slate-400">Ville</label>
                                    <input
                                        type="text"
                                        value={editingLawyer.city || ''}
                                        onChange={(e) => setEditingLawyer({ ...editingLawyer, city: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-medium text-slate-400">Taux Hon. (€)</label>
                                    <input
                                        type="number"
                                        value={editingLawyer.average_hourly_rate}
                                        onChange={(e) => setEditingLawyer({ ...editingLawyer, average_hourly_rate: Number(e.target.value) })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setEditingLawyer(null)} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? 'Enregistrement...' : <><Save className="w-4 h-4" /> Enregistrer</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Firm Modal */}
            {editingFirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-800">
                            <h3 className="text-xl font-bold text-white">Éditer le cabinet</h3>
                            <button onClick={() => setEditingFirm(null)} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveFirm} className="p-6 space-y-4 text-sm text-slate-300">
                            <div className="space-y-1.5">
                                <label className="font-medium text-slate-400">Nom du cabinet</label>
                                <input
                                    type="text"
                                    value={editingFirm.name}
                                    onChange={(e) => setEditingFirm({ ...editingFirm, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-medium text-slate-400">Taille (collaborateurs)</label>
                                <input
                                    type="number"
                                    value={editingFirm.size || 0}
                                    onChange={(e) => setEditingFirm({ ...editingFirm, size: Number(e.target.value) })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setEditingFirm(null)} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? 'Enregistrement...' : <><Save className="w-4 h-4" /> Enregistrer</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ----- Admin Profile Modal (Lawyer Detail with Stats) ----- */
const AdminLawyerProfileModal: React.FC<{ lawyer: Lawyer; onClose: () => void; onEdit: () => void }> = ({ lawyer, onClose, onEdit }) => {
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
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 bg-slate-900/90 backdrop-blur-md overflow-y-auto" onClick={onClose}>
            <div
                className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 bg-slate-800/50 border-b border-slate-700 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                            {lawyer.first_name[0]}{lawyer.last_name[0]}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Me {lawyer.first_name} {lawyer.last_name}</h2>
                            <p className="text-slate-400 text-sm">{lawyer.firm_type || 'Individuel'}</p>
                            <div className="mt-2 flex gap-2">
                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${lawyer.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                    {lawyer.status === 'approved' ? 'Validé' : 'En attente'}
                                </span>
                                {lawyer.in_network && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                        Réseau
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                    {/* Details Column */}
                    <div className="md:col-span-3 p-6 space-y-6 border-r border-slate-800">
                        <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-slate-500" />
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Barreau</p>
                                    <p className="text-slate-200">{lawyer.bar_association}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-slate-500" />
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Ville</p>
                                    <p className="text-slate-200">{lawyer.city || '—'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="w-4 h-4 text-slate-500" />
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Serment</p>
                                    <p className="text-slate-200">{lawyer.oath_date || '—'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Briefcase className="w-4 h-4 text-slate-500" />
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Taux Hon.</p>
                                    <p className="text-slate-200">{lawyer.average_hourly_rate} €/h</p>
                                </div>
                            </div>
                        </div>

                        {lawyer.specialties && (
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold mb-2">Domaines d'intervention</p>
                                <div className="flex flex-wrap gap-2">
                                    {lawyer.specialties.map(s => (
                                        <span key={s} className="px-2 py-1 bg-slate-800 text-slate-300 border border-slate-700 text-xs rounded-lg">{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-4 flex gap-3">
                            <button onClick={onEdit} className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20">
                                Éditer la fiche
                            </button>
                            <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold border border-slate-700 transition-all">
                                Fermer
                            </button>
                        </div>
                    </div>

                    {/* Stats Column */}
                    <div className="md:col-span-2 p-4 bg-slate-950/40">
                        {stats ? (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="mb-4 flex items-center gap-2 text-indigo-400">
                                    <TrendingUp className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Performances Réelles</span>
                                </div>
                                <LawyerStatsCard stats={stats} loading={loadingStats} />
                                <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded-xl">
                                    <p className="text-[10px] text-slate-500 italic leading-relaxed text-center">
                                        Statistiques basées sur {stats.review_count} missions analysées sur LexMetric.
                                    </p>
                                </div>
                            </div>
                        ) : loadingStats ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="animate-pulse text-slate-500 text-xs uppercase font-bold">Analyse des données...</div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
                                Aucune donnée statistique disponible.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
