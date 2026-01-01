// src/components/admin/CitasView.jsx
import { Search, Calendar, Clock, Mail, Phone, FileText, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

const CitasView = ({
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    loading,
    sortedAgendamientos,
    updatingId,
    handleUpdateEstado
}) => {

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

    const capitalize = (text) => {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1);
    };


    return (
        <div className="space-y-6">
            {/* Búsqueda y Filtros */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email o teléfono..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-olive-500 outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['todos', 'pendiente', 'confirmado', 'cancelado'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${filterStatus === status
                                    ? 'bg-olive-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Lista de Citas */}
            {loading ? (
                <div className="bg-white rounded-xl p-12 text-center">
                    <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-3" />
                    <p className="text-slate-500">Cargando citas...</p>
                </div>
            ) : sortedAgendamientos.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No se encontraron citas</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedAgendamientos.map(ag => (
                        <div key={ag.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-olive-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                            {ag.cliente_nombre?.charAt(0) || 'C'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">{ag.cliente_nombre}</h3>
                                            <p className="text-sm text-slate-600">{ag.servicio_nombre || 'Consulta general'}</p>
                                        </div>
                                    </div>
                                    {getEstadoBadge(ag.estado)}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm">
                                            <span className="text-sm">
                                                {capitalize(
                                                    new Date(ag.fecha).toLocaleDateString('es-CL', {
                                                        weekday: 'long',
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })
                                                )}
                                            </span>


                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm">{ag.hora?.substring(0, 5)} hrs</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm">{ag.cliente_email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm">{ag.cliente_telefono}</span>
                                    </div>
                                </div>

                                {ag.comentarios && (
                                    <div className="bg-slate-50 rounded-lg p-3 mb-4">
                                        <div className="flex items-start gap-2">
                                            <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-slate-700">{ag.comentarios}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
                                    {ag.estado !== 'confirmado' && (
                                        <button
                                            onClick={() => handleUpdateEstado(ag.id, 'confirmado')}
                                            disabled={updatingId === ag.id}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all text-sm font-medium disabled:opacity-50"
                                        >
                                            {updatingId === ag.id ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4" />
                                            )}
                                            Confirmar
                                        </button>
                                    )}
                                    {ag.estado !== 'pendiente' && (
                                        <button
                                            onClick={() => handleUpdateEstado(ag.id, 'pendiente')}
                                            disabled={updatingId === ag.id}
                                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all text-sm font-medium disabled:opacity-50"
                                        >
                                            {updatingId === ag.id ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <AlertCircle className="w-4 h-4" />
                                            )}
                                            Pendiente
                                        </button>
                                    )}
                                    {ag.estado !== 'cancelado' && (
                                        <button
                                            onClick={() => handleUpdateEstado(ag.id, 'cancelado')}
                                            disabled={updatingId === ag.id}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all text-sm font-medium disabled:opacity-50"
                                        >
                                            {updatingId === ag.id ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <XCircle className="w-4 h-4" />
                                            )}
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CitasView;