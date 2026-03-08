import React, { useState, useEffect } from 'react';
import { Database, Search, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { User as UserType } from '../../types';

export const AdminUserManager: React.FC = () => {
    const { impersonate } = useAuth();
    const [users, setUsers] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            // Re-using the demo-users endpoint to fetch all users for the MVP
            const response = await fetch(`${apiUrl}/api/auth/demo-users`);
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleImpersonate = (targetUser: UserType) => {
        if (window.confirm(`Vous allez naviguer sur la plateforme en tant que ${targetUser.full_name}. Cette action n'est pas silencieuse (vos actions seront tracées). Continuer ?`)) {
            impersonate(targetUser);
        }
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Database className="w-8 h-8 text-indigo-400" />
                        Comptes & B2B
                    </h1>
                    <p className="text-slate-400">Gérez les comptes gestionnaires, les entreprises clientes et le support technique avancé.</p>
                </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mt-6">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur..."
                            className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 w-64 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-900/80 text-xs uppercase text-slate-500 border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-medium">Utilisateur</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">Rôle</th>
                                <th className="px-6 py-4 font-medium">ID Entreprise</th>
                                <th className="px-6 py-4 text-right font-medium">Support Avancé</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        Chargement des comptes...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        Aucun compte trouvé.
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-200">
                                            {u.full_name}
                                        </td>
                                        <td className="px-6 py-4">{u.email}</td>
                                        <td className="px-6 py-4">
                                            {u.role === 'admin' ? (
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Admin</span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">Gestionnaire</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 truncate max-w-[150px]">{u.company_id}</td>
                                        <td className="px-6 py-4 text-right">
                                            {u.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleImpersonate(u)}
                                                    className="flex items-center gap-2 justify-end text-emerald-400 hover:text-emerald-300 font-medium text-xs w-full group"
                                                >
                                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">Voir en tant que</span>
                                                    <UserCheck className="w-4 h-4" />
                                                </button>
                                            )}
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
