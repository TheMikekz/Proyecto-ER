import { useState } from 'react';
import { updateAgendamiento } from '../../utils/api';

const AppointmentCard = ({ agendamiento, onUpdate }) => {
    const [loading, setLoading] = useState(false);

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'confirmado':
                return 'bg-green-900 text-green-200 border-green-700';
            case 'pendiente':
                return 'bg-yellow-900 text-yellow-200 border-yellow-700';
            case 'cancelado':
                return 'bg-red-900 text-red-200 border-red-700';
            default:
                return 'bg-gray-700 text-gray-200 border-gray-600';
        }
    };

    const handleChangeStatus = async (newStatus) => {
        if (window.confirm(`¿Estás seguro de ${newStatus === 'confirmado' ? 'confirmar' : 'cancelar'} esta cita?`)) {
            setLoading(true);
            try {
                await updateAgendamiento(agendamiento.id, { estado: newStatus });
                onUpdate();
            } catch (error) {
                console.error('Error al actualizar:', error);
                alert('Error al actualizar el agendamiento');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">
                        {agendamiento.cliente_nombre}
                    </h3>
                    <p className="text-gray-400 text-sm">{agendamiento.cliente_email}</p>
                    <p className="text-gray-400 text-sm">{agendamiento.cliente_telefono}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getEstadoColor(agendamiento.estado)}`}>
                    {agendamiento.estado.toUpperCase()}
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                    <p className="text-gray-400">Servicio</p>
                    <p className="text-white font-semibold">{agendamiento.servicio_nombre}</p>
                </div>
                <div>
                    <p className="text-gray-400">Abogado</p>
                    <p className="text-white font-semibold">{agendamiento.abogado_nombre}</p>
                </div>
                <div>
                    <p className="text-gray-400">Fecha</p>
                    <p className="text-white font-semibold">
                        {new Date(agendamiento.fecha + 'T00:00:00').toLocaleDateString('es-CL')}
                    </p>
                </div>
                <div>
                    <p className="text-gray-400">Hora</p>
                    <p className="text-white font-semibold">{agendamiento.hora}</p>
                </div>
            </div>

            {agendamiento.comentarios && (
                <div className="mb-4 pb-4 border-b border-gray-700">
                    <p className="text-gray-400 text-sm mb-1">Comentarios:</p>
                    <p className="text-white text-sm">{agendamiento.comentarios}</p>
                </div>
            )}

            {agendamiento.estado === 'pendiente' && (
                <div className="flex gap-3 pt-4 border-t border-gray-700">
                    <button
                        onClick={() => handleChangeStatus('confirmado')}
                        disabled={loading}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                    >
                        ✓ Confirmar
                    </button>
                    <button
                        onClick={() => handleChangeStatus('cancelado')}
                        disabled={loading}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                    >
                        ✕ Cancelar
                    </button>
                </div>
            )}

            {agendamiento.estado === 'confirmado' && (
                <div className="pt-4 border-t border-gray-700">
                    <button
                        onClick={() => handleChangeStatus('cancelado')}
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                    >
                        ✕ Cancelar Cita
                    </button>
                </div>
            )}
        </div>
    );
};

export default AppointmentCard;