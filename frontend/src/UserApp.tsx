import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Navigation } from './components/Navigation';
import { LawyerSearch } from './features/search/LawyerSearch';
import { AnalyticsDashboard } from './features/dashboard/Dashboard';
import { MissionReviewForm } from './features/reviews/MissionReviewForm';
import { Annuaire } from './features/directory/Annuaire';
import { AddLawyer } from './features/directory/AddLawyer';
import { SupportForm } from './features/support/SupportForm';
import { useAuth } from './context/AuthContext';

type Tab = 'dashboard' | 'search' | 'review' | 'annuaire' | 'add-lawyer' | 'support';

export function UserApp() {
    const { user, originalAdminUser, stopImpersonating } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('search'); // Default to search for normal users
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 flex font-sans transition-colors duration-300">
            {originalAdminUser && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-rose-600 text-white text-sm font-medium px-4 py-2 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        Vous naviguez en tant que <span className="font-bold underline">{user?.full_name}</span>. Toutes vos actions seront tracées.
                    </div>
                    <button
                        onClick={stopImpersonating}
                        className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs transition-colors"
                    >
                        Quitter le mode impersonation
                    </button>
                </div>
            )}

            <Navigation activeTab={activeTab as any} setActiveTab={setActiveTab as any} />

            {/* Main Content Area */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                {/* Top Header */}
                <header className="flex justify-between items-center mb-10 pb-4 border-b border-slate-200 dark:border-slate-800/60 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-10 pt-2 transition-colors duration-300">
                    <div className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        LexMetric Engine v1.0
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 flex items-center justify-center"
                            aria-label="Toggle Dark Mode"
                        >
                            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('support')}
                            className="px-4 py-2 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-700"
                        >
                            Support
                        </button>
                    </div>
                </header>

                {/* Feature Component Routing */}
                <div className="animate-in fade-in duration-500 pt-4">
                    {activeTab === 'dashboard' && <AnalyticsDashboard />}
                    {activeTab === 'search' && <LawyerSearch />}
                    {activeTab === 'review' && <MissionReviewForm onClose={() => setActiveTab('search')} />}
                    {activeTab === 'annuaire' && <Annuaire />}
                    {activeTab === 'add-lawyer' && <AddLawyer />}
                    {activeTab === 'support' && <SupportForm />}
                </div>
            </main>
        </div>
    );
}

export default UserApp;
