import React from 'react';
import { Scale, Users, Settings, Bell, Search, BarChart3, Star, UserPlus, LogOut, ShieldCheck, HelpCircle, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavProps {
    activeTab: 'dashboard' | 'search' | 'review' | 'annuaire' | 'add-lawyer' | 'moderation' | 'support' | 'my-tickets';
    setActiveTab: (tab: 'dashboard' | 'search' | 'review' | 'annuaire' | 'add-lawyer' | 'moderation' | 'support' | 'my-tickets') => void;
}

export const Navigation: React.FC<NavProps> = ({ activeTab, setActiveTab }) => {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <nav className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col text-slate-900 dark:text-white z-20 shadow-2xl transition-colors duration-300">
            <div className="p-6 flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
                <Scale className="text-blue-500 w-8 h-8" />
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">LexMetric</span>
            </div>

            <div className="flex-1 py-6 px-4 space-y-2">
                {user.role === 'admin' && (
                    <>
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`flex w-full items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 shadow-inner' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                        >
                            <BarChart3 className="w-5 h-5" />
                            <span className="font-medium">Tableau de Bord</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('moderation')}
                            className={`flex w-full items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'moderation' ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shadow-inner' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                        >
                            <ShieldCheck className="w-5 h-5" />
                            <span className="font-medium">Centre de Contrôle</span>
                        </button>
                    </>
                )}

                <button
                    onClick={() => setActiveTab('search')}
                    className={`flex w-full items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'search' ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 shadow-inner' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                >
                    <Search className="w-5 h-5" />
                    <span className="font-medium">Trouver un avocat</span>
                </button>
                <button
                    onClick={() => setActiveTab('review')}
                    className={`flex w-full items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'review' ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 shadow-inner' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                >
                    <Star className="w-5 h-5" />
                    <span className="font-medium">Évaluer (Test)</span>
                </button>
                <button
                    onClick={() => setActiveTab('annuaire')}
                    className={`flex items-center space-x-3 px-4 py-3 w-full text-left rounded-xl transition-colors duration-300 ${activeTab === 'annuaire' ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 shadow-inner' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                >
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Annuaire des avocats</span>
                </button>
                <button
                    onClick={() => setActiveTab('add-lawyer')}
                    className={`flex items-center space-x-3 px-4 py-3 w-full text-left rounded-xl transition-colors duration-300 ${activeTab === 'add-lawyer' ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 shadow-inner' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                >
                    <UserPlus className="w-5 h-5" />
                    <span className="font-medium">Ajouter un avocat</span>
                </button>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2 transition-colors duration-300">
                <button className="flex items-center space-x-3 px-4 py-3 w-full text-left text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="font-medium">Notifications</span>
                </button>
                <button
                    onClick={() => setActiveTab('support')}
                    className={`flex items-center space-x-3 px-4 py-3 w-full text-left rounded-xl transition-colors duration-300 ${activeTab === 'support' ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 shadow-inner' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                >
                    <HelpCircle className="w-5 h-5" />
                    <span className="font-medium">Nouveau Support</span>
                </button>
                <button
                    onClick={() => setActiveTab('my-tickets')}
                    className={`flex items-center space-x-3 px-4 py-3 w-full text-left rounded-xl transition-colors duration-300 ${activeTab === 'my-tickets' ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shadow-inner' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                >
                    <Ticket className="w-5 h-5" />
                    <span className="font-medium">Mes Demandes</span>
                </button>
                <button className="flex items-center space-x-3 px-4 py-3 w-full text-left text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Paramètres</span>
                </button>

                <div className="mt-4 flex items-center space-x-3 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors duration-300">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md uppercase">
                        {user.full_name.substring(0, 2)}
                    </div>
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="text-sm font-medium truncate">{user.full_name.split(' (')[0]}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate text-ellipsis">{user.role === 'admin' ? 'Modérateur' : 'Gestionnaire'}</span>
                    </div>
                    <button onClick={logout} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors" title="Déconnexion">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </nav>
    );
};
