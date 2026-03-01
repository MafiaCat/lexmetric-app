import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Navigation } from './components/Navigation';
import { LawyerSearch } from './features/search/LawyerSearch';
import { AnalyticsDashboard } from './features/dashboard/Dashboard';
import { MissionReviewForm } from './features/reviews/MissionReviewForm';
import { Annuaire } from './features/directory/Annuaire';
import { AddLawyer } from './features/directory/AddLawyer';

type Tab = 'dashboard' | 'search' | 'review' | 'annuaire' | 'add-lawyer';

function App() {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
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
            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

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
                        <button className="px-4 py-2 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-200 dark:border-slate-700">
                            Support
                        </button>
                    </div>
                </header>

                {/* Feature Component Routing */}
                <div className="animate-in fade-in duration-500 pt-4">
                    {activeTab === 'dashboard' && <AnalyticsDashboard />}
                    {activeTab === 'search' && <LawyerSearch />}
                    {activeTab === 'review' && <MissionReviewForm onClose={() => setActiveTab('dashboard')} />}
                    {activeTab === 'annuaire' && <Annuaire />}
                    {activeTab === 'add-lawyer' && <AddLawyer />}
                </div>
            </main>
        </div>
    );
}

export default App;
