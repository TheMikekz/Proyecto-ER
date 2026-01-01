// src/components/admin/TopBar.jsx
import { Menu, Home, RefreshCw } from 'lucide-react';

const TopBar = ({ sidebarOpen, setSidebarOpen, activeView, user, navigate, loading, fetchAllData }) => {
    const getTitle = () => {
        switch (activeView) {
            case 'dashboard': return 'Dashboard';
            case 'citas': return 'Gestión de Citas';
            case 'agenda': return 'Bloqueos de Agenda';
            default: return 'Panel de Administración';
        }
    };

    return (
        <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
            <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
                    >
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{getTitle()}</h1>
                        <p className="text-slate-500 text-sm">Bienvenido, {user?.nombre}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                    >
                    </button>
                    <button
                        onClick={fetchAllData}
                        disabled={loading}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                    >
                        <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TopBar;