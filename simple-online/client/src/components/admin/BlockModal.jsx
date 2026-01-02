import { AlertTriangle, X, Calendar } from 'lucide-react';

const BlockModal = ({
    setShowBlockModal,
    blockForm,
    setBlockForm,
    abogados,
    handleCreateBloqueo,
    citasAfectadas = [],
    showConflictWarning = false
}) => {

    const formatearFecha = (fecha) => {
        const date = new Date(fecha + 'T00:00:00');
        return date.toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Crear Bloqueo</h3>
                            <p className="text-sm text-slate-500 mt-1">Bloquea fechas u horarios no disponibles</p>
                        </div>
                        <button
                            onClick={() => {
                                setShowBlockModal(false);
                                setBlockForm({
                                    abogado_id: '',
                                    fecha: '',
                                    hora_inicio: '',
                                    hora_fin: '',
                                    motivo: '',
                                    tipo: 'dia_completo'
                                });
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4">

                    {/* ADVERTENCIA DE CONFLICTO */}
                    {showConflictWarning && citasAfectadas.length > 0 && (
                        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-amber-900 mb-2">
                                        ⚠️ Hay {citasAfectadas.length} cita(s) agendada(s) para este horario
                                    </h4>
                                    <div className="space-y-2 mb-4">
                                        {citasAfectadas.map(cita => (
                                            <div key={cita.id} className="bg-white rounded-lg p-3 text-sm border border-amber-200">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{cita.cliente_nombre}</p>
                                                        <p className="text-slate-600 text-xs mt-1">
                                                            <Calendar className="w-3 h-3 inline mr-1" />
                                                            {formatearFecha(cita.fecha)} a las {cita.hora.substring(0, 5)}
                                                        </p>
                                                        <p className="text-slate-600 text-xs">{cita.servicio_nombre}</p>
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${cita.estado === 'confirmado'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {cita.estado}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm text-amber-800 font-medium">
                                        Si continúas, estas citas se marcarán como "Requiere Reagendamiento" y deberás contactar a los clientes para buscar un nuevo horario.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-slate-900 font-semibold mb-2 text-sm">
                            Tipo de Bloqueo
                        </label>
                        <select
                            value={blockForm.tipo}
                            onChange={(e) => setBlockForm({ ...blockForm, tipo: e.target.value })}
                            className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-olive-600 focus:ring-2 focus:ring-olive-100 outline-none"
                        >
                            <option value="dia_completo">Día completo</option>
                            <option value="horas_especificas">Horas específicas</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-slate-900 font-semibold mb-2 text-sm">
                            Abogado <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={blockForm.abogado_id}
                            onChange={(e) => setBlockForm({ ...blockForm, abogado_id: e.target.value })}
                            className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-olive-600 focus:ring-2 focus:ring-olive-100 outline-none"
                        >
                            <option value="">Seleccionar abogado</option>
                            {abogados.map(abogado => (
                                <option key={abogado.id} value={abogado.id}>
                                    {abogado.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-slate-900 font-semibold mb-2 text-sm">
                            Fecha <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={blockForm.fecha}
                            onChange={(e) => setBlockForm({ ...blockForm, fecha: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-olive-600 focus:ring-2 focus:ring-olive-100 outline-none"
                        />
                    </div>

                    {blockForm.tipo === 'horas_especificas' && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-slate-900 font-semibold mb-2 text-sm">
                                    Hora inicio
                                </label>
                                <input
                                    type="time"
                                    value={blockForm.hora_inicio}
                                    onChange={(e) => setBlockForm({ ...blockForm, hora_inicio: e.target.value })}
                                    className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-olive-600 focus:ring-2 focus:ring-olive-100 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-900 font-semibold mb-2 text-sm">
                                    Hora fin
                                </label>
                                <input
                                    type="time"
                                    value={blockForm.hora_fin}
                                    onChange={(e) => setBlockForm({ ...blockForm, hora_fin: e.target.value })}
                                    className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-olive-600 focus:ring-2 focus:ring-olive-100 outline-none"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-slate-900 font-semibold mb-2 text-sm">
                            Motivo (opcional)
                        </label>
                        <input
                            type="text"
                            value={blockForm.motivo}
                            onChange={(e) => setBlockForm({ ...blockForm, motivo: e.target.value })}
                            placeholder="Ej: Audiencia en tribunal, vacaciones..."
                            className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-olive-600 focus:ring-2 focus:ring-olive-100 outline-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => {
                                setShowBlockModal(false);
                                setBlockForm({
                                    abogado_id: '',
                                    fecha: '',
                                    hora_inicio: '',
                                    hora_fin: '',
                                    motivo: '',
                                    tipo: 'dia_completo'
                                });
                            }}
                            className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCreateBloqueo}
                            className="flex-1 px-4 py-3 bg-olive-600 hover:bg-olive-700 text-white rounded-lg font-semibold transition-all"
                        >
                            {showConflictWarning && citasAfectadas.length > 0
                                ? `Crear Bloqueo (${citasAfectadas.length} citas afectadas)`
                                : 'Crear Bloqueo'
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlockModal;