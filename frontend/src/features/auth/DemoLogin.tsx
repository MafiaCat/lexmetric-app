import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDemoUsers } from '../../services/api';
import { User } from '../../types';
import { ShieldCheck, User as UserIcon, Building2, ShieldAlert } from 'lucide-react';

export const DemoLogin: React.FC = () => {
    const { login } = useAuth();
    const [demoUsers, setDemoUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Remove the incorrect nested useEffect and just call the API
                const users = await getDemoUsers();
                setDemoUsers(users);
            } catch (error) {
                console.error("Failed to fetch demo users:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="animate-pulse space-y-4 text-center">
                    <div className="w-12 h-12 bg-indigo-200 rounded-full mx-auto"></div>
                    <div className="h-4 w-32 bg-slate-200 rounded mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
                        <span className="text-3xl font-bold text-white tracking-tighter">L</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">LexMetric</h1>
                    <p className="text-slate-500">Sélectionnez un profil test pour accéder à l'application.</p>
                </div>

                <div className="space-y-4">
                    {demoUsers.length === 0 ? (
                        <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                            <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                            <h3 className="text-sm font-semibold text-slate-700">Aucun profil disponible</h3>
                            <p className="text-xs text-slate-500 mt-1">La base de données (Render) ne contient aucun utilisateur ou n'est pas connectée correctement.</p>
                        </div>
                    ) : (
                        demoUsers.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => login(user)}
                                className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/5 transition-all flex items-center justify-between group text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {user.role === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                            {user.full_name.split(' (')[0]}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                            <Building2 className="w-3 h-3" />
                                            <span>{user.full_name.includes('Allianz') ? 'Allianz' : 'AXA'}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full mx-1"></span>
                                            <span className="font-medium text-slate-600">{user.role === 'admin' ? 'Modérateur' : 'Gestionnaire'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-6 h-6 rounded-full bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center transform group-hover:translate-x-1 transition-all">
                                    <span className="text-slate-400 group-hover:text-indigo-600">→</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className="mt-8 text-center text-xs text-slate-400">
                    <p>Ceci est un environnement de démonstration.<br />Les données sont cloisonnées par entreprise.</p>
                </div>
            </div>
        </div>
    );
};
