import React, { useState, useEffect, useRef } from 'react';
import { Upload, Users, AlertCircle, CheckCircle2, Search, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Lawyer } from '../../types';
import { getLawyers, getPendingLawyers } from '../../services/api';

export const AdminLawyerManager: React.FC = () => {
    const { user } = useAuth();
    const [lawyers, setLawyers] = useState<Lawyer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

    const fetchLawyersData = async () => {
        setIsLoading(true);
        try {
            const all = await getLawyers();
            const pending = await getPendingLawyers();

            // Avoid duplicates if pending lawyers are already returned by getLawyers
            const allIds = new Set(all.map(l => l.id));
            const uniquePending = pending.filter(p => !allIds.has(p.id));

            setLawyers([...all, ...uniquePending]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLawyersData();
    }, []);

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

    const filteredLawyers = lawyers.filter(l =>
        l.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.bar_association.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Users className="w-8 h-8 text-indigo-400" />
                        Gestion des Avocats
                    </h1>
                    <p className="text-slate-400">Ajoutez, modifiez ou supprimez les fiches du répertoire.</p>
                </div>

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
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher un avocat..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 w-64 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-900/80 text-xs uppercase text-slate-500 border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-medium">Nom complet</th>
                                <th className="px-6 py-4 font-medium">Barreau</th>
                                <th className="px-6 py-4 font-medium">Taux Hor.</th>
                                <th className="px-6 py-4 font-medium">Statut</th>
                                <th className="px-6 py-4 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        Chargement des avocats...
                                    </td>
                                </tr>
                            ) : lawyers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        Aucun avocat enregistré dans la base de données.
                                    </td>
                                </tr>
                            ) : filteredLawyers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        Aucun résultat pour "{searchTerm}".
                                    </td>
                                </tr>
                            ) : (
                                filteredLawyers.map((lawyer) => (
                                    <tr key={lawyer.id} className="hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-200">
                                            Me {lawyer.first_name} {lawyer.last_name}
                                        </td>
                                        <td className="px-6 py-4">{lawyer.bar_association}</td>
                                        <td className="px-6 py-4">{lawyer.average_hourly_rate} €</td>
                                        <td className="px-6 py-4">
                                            {lawyer.status === 'pending' ? (
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">En attente</span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Validé</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => alert("L\'édition de fiche sera disponible dans la Phase 4.")}
                                                className="text-indigo-400 hover:text-indigo-300 font-medium text-xs">Éditer fiche
                                            </button>
                                        </td>
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
