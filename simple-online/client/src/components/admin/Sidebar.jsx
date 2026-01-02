// src/components/admin/Sidebar.jsx
import { Scale, LayoutDashboard, Calendar, CalendarDays, LogOut, Menu, X as CloseIcon } from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen, activeView, setActiveView, handleLogout }) => {
    return (
        <div className={`fixed left-0 top-0 h-full bg-olive-700 text-white transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-20'
            }`}>
            {/* Logo */}
            <div className="p-6 border-b border-white/50 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                        <Scale className="w-5 h-5 text-black" />
                    </div>
                    {sidebarOpen && (
                        <div className="min-w-0">
                            <div className="font-bold text-sm truncate">Simple y legal</div>
                            <div className="text-xs text-gray-300 truncate">Panel Admin</div>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden p-1 hover:bg-white/10 rounded"
                >
                    {sidebarOpen ? <CloseIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
                <button
                    onClick={() => setActiveView('dashboard')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeView === 'dashboard'
                        ? 'bg-olive-600 text-white'
                        : 'text-white hover:bg-olive-600'
                        }`}
                >
                    <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="font-medium text-sm">Dashboard</span>}
                </button>

                <button
                    onClick={() => setActiveView('citas')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeView === 'citas'
                        ? 'bg-olive-600 text-white'
                        : 'text-white hover:bg-olive-600'
                        }`}
                >
                    <Calendar className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="font-medium text-sm">Citas</span>}
                </button>

                <button
                    onClick={() => setActiveView('calendario')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeView === 'calendario'
                        ? 'bg-olive-600 text-white'
                        : 'text-white hover:bg-olive-600'
                        }`}
                >
                    <Calendar className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="font-medium text-sm">Calendario</span>}
                </button>

                <button
                    onClick={() => setActiveView('agenda')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeView === 'agenda'
                        ? 'bg-olive-600 text-white'
                        : 'text-white hover:bg-olive-600'
                        }`}
                >
                    <CalendarDays className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="font-medium text-sm">Bloqueos</span>}
                </button>
            </nav>

            {/* User Info & Logout */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/50">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-olive-600 transition-all"
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="font-medium text-sm">Cerrar Sesión</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;