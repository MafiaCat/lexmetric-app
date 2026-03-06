import React, { useState } from 'react';
import { PendingLawyersTable } from './PendingLawyersTable';
import { SupportTicketsTable } from './SupportTicketsTable';
import { ShieldCheck, Users, Ticket } from 'lucide-react';

export const ModerationDashboard: React.FC = () => {
    const [activeView, setActiveView] = useState<'lawyers' | 'tickets'>('lawyers');

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-indigo-500" />
                    Centre de Contrôle Modérateur
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Gérez les demandes d'ajout d'avocats et les requêtes de support de vos utilisateurs (Gestionnaires).
                </p>
            </div>

            {/* Quick Navigation Tabs */}
            <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-800 mb-6">
                <button
                    onClick={() => setActiveView('lawyers')}
                    className={`pb-4 px-2 flex items-center gap-2 font-medium transition-colors border-b-2 ${activeView === 'lawyers'
                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                        }`}
                >
                    <Users className="w-5 h-5" />
                    Avocats en attente
                </button>
                <button
                    onClick={() => setActiveView('tickets')}
                    className={`pb-4 px-2 flex items-center gap-2 font-medium transition-colors border-b-2 ${activeView === 'tickets'
                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                        }`}
                >
                    <Ticket className="w-5 h-5" />
                    Tickets Utilisateurs
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 min-h-[500px]">
                {activeView === 'lawyers' ? <PendingLawyersTable /> : <SupportTicketsTable />}
            </div>
        </div>
    );
};
