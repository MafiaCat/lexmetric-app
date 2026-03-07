import { useState, useEffect } from 'react';
import { Sun, Moon, LayoutDashboard, Users, FileText, Database, Settings, Ticket, Activity } from 'lucide-react';
import { ModerationDashboard } from './features/moderation/ModerationDashboard';
import { AdminDashboardStats } from './features/moderation/AdminDashboardStats';
import { AdminLawyerManager } from './features/moderation/AdminLawyerManager';
import { AdminUserManager } from './features/moderation/AdminUserManager';
import { AdminAuditLogs } from './features/moderation/AdminAuditLogs';
import { useAuth } from './context/AuthContext';

type AdminTab = 'overview' | 'lawyers' | 'reviews' | 'users' | 'tickets' | 'audit' | 'settings';

export function ModeratorApp() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [isDarkMode, setIsDarkMode] = useState(true); // Default dark for admin

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const navItems = [
        { id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
        { id: 'lawyers', label: 'Avocats & Cabinets', icon: Users },
        { id: 'tickets', label: 'Support & Tickets', icon: Ticket },
        { id: 'reviews', label: 'Modération Avis', icon: FileText },
        { id: 'users', label: 'Comptes & B2B', icon: Database },
        { id: 'audit', label: 'Logs & Sécurité', icon: Activity },
        { id: 'settings', label: 'Paramètres', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 flex font-sans transition-colors duration-300">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-slate-950 border-r border-slate-800 fixed h-full flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-white font-bold text-xl">L</span>
                        </div>
                        <div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">LexMetric</span>
                            <span className="block text-xs font-semibold text-rose-400 tracking-wider">MODERATOR</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as AdminTab)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${activeTab === item.id
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-300">
                            {user?.full_name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">{user?.full_name}</p>
                            <p className="text-xs text-rose-400 truncate">Administrateur</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full py-2 text-sm text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
                    >
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Admin Main Content Area */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto bg-slate-900">
                {/* Admin Header */}
                <header className="flex justify-between items-center mb-10 pb-4 border-b border-slate-800 sticky top-0 bg-slate-900/80 backdrop-blur-md z-10 pt-2">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        Control Panel
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors border border-slate-700/50 flex items-center justify-center"
                            aria-label="Toggle Dark Mode"
                        >
                            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
                        </button>
                    </div>
                </header>

                {/* Routing content */}
                <div className="animate-in fade-in duration-500">
                    {activeTab === 'overview' && <AdminDashboardStats />}
                    {activeTab === 'lawyers' && <AdminLawyerManager />}

                    {/* Ticketing is using old ModerationDashboard (to be broken down next) */}
                    {activeTab === 'tickets' && <ModerationDashboard />}

                    {activeTab === 'reviews' && (
                        <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                            <h2 className="text-xl font-semibold text-slate-300">Modération des Avis</h2>
                            <p className="text-slate-500 mt-2">Module en cours de construction (Phase 3)</p>
                        </div>
                    )}

                    {activeTab === 'users' && <AdminUserManager />}
                    {activeTab === 'audit' && <AdminAuditLogs />}
                </div>
            </main>
        </div>
    );
}

export default ModeratorApp;
