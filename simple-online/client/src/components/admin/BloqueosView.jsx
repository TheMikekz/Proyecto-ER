// src/components/admin/BloqueosView.jsx
import { Plus, Ban, Trash2, RefreshCw } from 'lucide-react';

const BloqueosView = ({ setShowBlockModal, loading, sortedBloqueos, handleDeleteBloqueo }) => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Bloqueos de Agenda</h3>
                        <p className="text-slate-600 text-sm mt-1">Bloquea fechas u horarios cuando no puedas atender</p>
                    </div>
                    <button
                        onClick={() => setShowBlockModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-sm font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Bloqueo
                    </button>
                </div>
            </div>

            {/* Lista de Bloqueos */}
            {loading ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
                    <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-3" />
                    <p className="text-slate-500">Cargando bloqueos...</p>
                </div>
            ) : sortedBloqueos.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
                    <Ban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-lg font-medium">No hay bloqueos activos</p>
                    <p className="text-slate-400 text-sm mt-1">Crea un bloqueo para fechas no disponibles</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {sortedBloqueos.map(bloqueo => {
                        // Normalizar la fecha (quitar la parte de hora si viene en ISO)
                        const fechaString = bloqueo.fecha_inicio.includes('T')
                            ? bloqueo.fecha_inicio.split('T')[0]
                            : bloqueo.fecha_inicio;
                        const fechaInicio = new Date(fechaString + 'T00:00:00');
                        const isPast = fechaInicio < new Date();

                        return (
                            <div key={bloqueo.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${isPast ? 'border-slate-200 opacity-60' : 'border-purple-200'
                                }`}>
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isPast ? 'bg-slate-100' : 'bg-purple-100'
                                                }`}>
                                                <Ban className={`w-6 h-6 ${isPast ? 'text-slate-400' : 'text-purple-600'}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-bold text-slate-900 capitalize">
                                                        {fechaInicio.toLocaleDateString('es-CL', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </h3>
                                                    {isPast && (
                                                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                                                            Pasado
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-600 mb-1">
                                                    <strong>Abogado:</strong> {bloqueo.abogado_nombre || 'Todos'}
                                                </p>
                                                {bloqueo.motivo && (
                                                    <p className="text-sm text-slate-600">
                                                        <strong>Motivo:</strong> {bloqueo.motivo}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteBloqueo(bloqueo.id)}
                                            className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all text-sm font-medium"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BloqueosView;