import { useState } from 'react';
import { useBooking } from '../../store/BookingContext';
import { createAgendamiento } from '../../utils/api';

const Confirmation = () => {
    const { bookingData, prevStep, resetBooking } = useBooking();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        setError(null);

        try {
            const agendamientoData = {
                servicio_id: bookingData.servicio.id,
                abogado_id: bookingData.abogado.id,
                cliente_nombre: bookingData.clienteNombre,
                cliente_email: bookingData.clienteEmail,
                cliente_telefono: bookingData.clienteTelefono,
                fecha: bookingData.fecha,
                hora: bookingData.hora,
                comentarios: bookingData.comentarios || null
            };

            const response = await createAgendamiento(agendamientoData);

            setSuccess(true);

            setTimeout(() => {
                resetBooking();
            }, 2000);

        } catch (err) {
            console.error('Error al crear agendamiento:', err);
            setError(err.response?.data?.error || 'Error al crear el agendamiento. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-white text-2xl font-bold mb-2">¡Agendamiento Confirmado!</h3>
                <p className="text-gray-400">Recibirás un correo de confirmación a {bookingData.clienteEmail}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Resumen */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
                <h3 className="text-white text-2xl font-bold mb-4">Resumen de tu cita</h3>

                <div className="space-y-3">
                    <div>
                        <p className="text-gray-400 text-sm">Servicio</p>
                        <p className="text-white font-semibold">{bookingData.servicio?.nombre}</p>
                    </div>

                    <div>
                        <p className="text-gray-400 text-sm">Abogado</p>
                        <p className="text-white font-semibold">{bookingData.abogado?.nombre}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-400 text-sm">Fecha</p>
                            <p className="text-white font-semibold">
                                {new Date(bookingData.fecha + 'T00:00:00').toLocaleDateString('es-CL', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Hora</p>
                            <p className="text-white font-semibold">{bookingData.hora}</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-gray-400 text-sm">Cliente</p>
                        <p className="text-white font-semibold">{bookingData.clienteNombre}</p>
                        <p className="text-gray-400 text-sm">{bookingData.clienteEmail}</p>
                        <p className="text-gray-400 text-sm">{bookingData.clienteTelefono}</p>
                    </div>

                    {bookingData.comentarios && (
                        <div>
                            <p className="text-gray-400 text-sm">Comentarios</p>
                            <p className="text-white">{bookingData.comentarios}</p>
                        </div>
                    )}

                    <div className="pt-2 border-t border-gray-700">
                        <p className="text-gray-400 text-sm">Precio</p>
                        <p className="text-primary-400 text-2xl font-bold">
                            ${bookingData.servicio?.precio?.toLocaleString('es-CL')}
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-900 border border-red-700 rounded-lg p-4">
                    <p className="text-red-200">{error}</p>
                </div>
            )}

            {/* Botones */}
            <div className="flex justify-between pt-4">
                <button
                    onClick={prevStep}
                    disabled={loading}
                    className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                >
                    ← Atrás
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Procesando...
                        </>
                    ) : (
                        <>✓ Confirmar Agendamiento</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Confirmation;