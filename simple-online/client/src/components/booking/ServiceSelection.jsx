import { useState, useEffect } from 'react';
import { useBooking } from '../../context/BookingContext';
import { getServicios, getAbogados } from '../../utils/api';

const ServiceSelection = () => {
    const { bookingData, updateBookingData, nextStep } = useBooking();
    const [servicios, setServicios] = useState([]);
    const [abogados, setAbogados] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [serviciosRes, abogadosRes] = await Promise.all([
                    getServicios(),
                    getAbogados()
                ]);
                setServicios(serviciosRes.data);
                setAbogados(abogadosRes.data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleContinue = () => {
        if (bookingData.servicio && bookingData.abogado) {
            nextStep();
        }
    };

    if (loading) {
        return <div className="text-white text-center">Cargando servicios...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Selección de Servicio */}
            <div>
                <label className="block text-white font-semibold mb-3">
                    * Servicio:
                </label>
                <select
                    value={bookingData.servicio?.id || ''}
                    onChange={(e) => {
                        const servicio = servicios.find(s => s.id === parseInt(e.target.value));
                        updateBookingData('servicio', servicio);
                    }}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                >
                    <option value="">Selecciona el servicio</option>
                    {servicios.map(servicio => (
                        <option key={servicio.id} value={servicio.id}>
                            {servicio.nombre} - ${servicio.precio?.toLocaleString('es-CL')}
                        </option>
                    ))}
                </select>
            </div>

            {/* Selección de Abogado */}
            <div>
                <label className="block text-white font-semibold mb-3">
                    * Abogado:
                </label>
                <select
                    value={bookingData.abogado?.id || ''}
                    onChange={(e) => {
                        const abogado = abogados.find(a => a.id === parseInt(e.target.value));
                        updateBookingData('abogado', abogado);
                    }}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                >
                    <option value="">Selecciona el abogado</option>
                    {abogados.map(abogado => (
                        <option key={abogado.id} value={abogado.id}>
                            {abogado.nombre} - {abogado.especialidad}
                        </option>
                    ))}
                </select>
            </div>

            {/* Botón Continuar */}
            <div className="flex justify-end pt-4">
                <button
                    onClick={handleContinue}
                    disabled={!bookingData.servicio || !bookingData.abogado}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all ${bookingData.servicio && bookingData.abogado
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

export default ServiceSelection;