import { useState, useEffect } from 'react';
import { useBooking } from '../../context/BookingContext';
import { checkDisponibilidad } from '../../utils/api';

const DateTimePicker = () => {
    const { bookingData, updateBookingData, nextStep, prevStep } = useBooking();
    const [horasOcupadas, setHorasOcupadas] = useState([]);
    const [loading, setLoading] = useState(false);

    const horariosDisponibles = [
        '09:00', '10:00', '11:00', '12:00',
        '14:00', '15:00', '16:00', '17:00'
    ];

    useEffect(() => {
        if (bookingData.abogado && bookingData.fecha) {
            fetchDisponibilidad();
        }
    }, [bookingData.fecha, bookingData.abogado]);

    const fetchDisponibilidad = async () => {
        if (!bookingData.abogado || !bookingData.fecha) return;

        setLoading(true);
        try {
            const response = await checkDisponibilidad(bookingData.abogado.id, bookingData.fecha);
            setHorasOcupadas(response.data.horasOcupadas);
        } catch (error) {
            console.error('Error al verificar disponibilidad:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = () => {
        if (bookingData.fecha && bookingData.hora) {
            nextStep();
        }
    };

    const isHoraDisponible = (hora) => {
        return !horasOcupadas.includes(hora);
    };

    return (
        <div className="space-y-6">
            {/* Selección de Fecha */}
            <div>
                <label className="block text-white font-semibold mb-3">
                    * Fecha:
                </label>
                <input
                    type="date"
                    value={bookingData.fecha || ''}
                    onChange={(e) => {
                        updateBookingData('fecha', e.target.value);
                        updateBookingData('hora', null); // Reset hora al cambiar fecha
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                />
            </div>

            {/* Selección de Hora */}
            <div>
                <label className="block text-white font-semibold mb-3">
                    * Hora:
                </label>
                {loading ? (
                    <div className="text-gray-400 text-center py-4">Verificando disponibilidad...</div>
                ) : (
                    <div className="grid grid-cols-4 gap-3">
                        {horariosDisponibles.map(hora => {
                            const disponible = isHoraDisponible(hora);
                            return (
                                <button
                                    key={hora}
                                    onClick={() => disponible && updateBookingData('hora', hora)}
                                    disabled={!disponible}
                                    className={`py-3 rounded-lg font-semibold transition-all ${bookingData.hora === hora
                                            ? 'bg-primary text-white'
                                            : disponible
                                                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                                                : 'bg-gray-900 text-gray-600 cursor-not-allowed border border-gray-800'
                                        }`}
                                >
                                    {hora}
                                    {!disponible && <span className="block text-xs">Ocupado</span>}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Botones */}
            <div className="flex justify-between pt-4">
                <button
                    onClick={prevStep}
                    className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
                >
                    ← Atrás
                </button>
                <button
                    onClick={handleContinue}
                    disabled={!bookingData.fecha || !bookingData.hora}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all ${bookingData.fecha && bookingData.hora
                            ? 'bg-primary hover:bg-blue-600 text-white cursor-pointer'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    Continuar
                </button>
            </div>
        </div>
    );
};

export default DateTimePicker;