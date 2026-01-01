// src/components/admin/DashboardView.jsx
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, User } from 'lucide-react';

const DashboardView = ({ stats, citasHoy }) => {

    const getEstadoBadge = (estado) => {
        const badges = {
            pendiente: { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertCircle },
            confirmado: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
            cancelado: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
        };
        const badge = badges[estado] || badges.pendiente;
        const Icon = badge.icon;
        return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold capitalize">{estado}</span>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">{stats.citasHoy}</div>
                    <div className="text-sm text-slate-600">Citas de hoy</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-amber-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">{stats.pendientes}</div>
                    <div className="text-sm text-slate-600">Pendientes</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">{stats.confirmadas}</div>
                    <div className="text-sm text-slate-600">Confirmadas</div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">{stats.canceladas}</div>
                    <div className="text-sm text-slate-600">Canceladas</div>
                </div>
            </div>

            {/* Próxima Cita */}
            {stats.proximaCita && (
                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="text-green-100 text-sm font-medium mb-1">Próxima cita</div>
                            <div className="text-2xl font-bold">{stats.proximaCita.cliente_nombre}</div>
                        </div>
                        <div className="bg-white/20 px-3 py-1 rounded-full">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center gap-6 text-green-100">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                                {new Date(stats.proximaCita.fecha + 'T00:00:00').toLocaleDateString('es-CL')}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{stats.proximaCita.hora.substring(0, 5)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Citas de hoy */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900">Citas de hoy</h3>
                </div>
                <div className="p-6">
                    {citasHoy.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No hay citas programadas para hoy</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {citasHoy
                                .sort((a, b) => {
                                    // Ordenar por hora ascendente (de menor a mayor)
                                    const horaA = a.hora.substring(0, 5);
                                    const horaB = b.hora.substring(0, 5);
                                    return horaA.localeCompare(horaB);
                                })
                                .map(cita => (
                                    <div key={cita.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                                {cita.cliente_nombre.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-900">{cita.cliente_nombre}</div>
                                                <div className="text-sm text-slate-600">{cita.hora.substring(0, 5)}</div>
                                            </div>
                                        </div>
                                        {getEstadoBadge(cita.estado)}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardView;