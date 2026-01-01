import { useBooking } from '../../store/BookingContext';

const ClientForm = () => {
    const { bookingData, updateBookingData, nextStep, prevStep } = useBooking();

    const isFormValid = () => {
        return (
            bookingData.clienteNombre &&
            bookingData.clienteEmail &&
            bookingData.clienteTelefono
        );
    };

    const handleContinue = () => {
        if (isFormValid()) {
            nextStep();
        }
    };

    return (
        <div className="space-y-6">
            {/* Nombre */}
            <div>
                <label className="block text-white font-semibold mb-2">
                    * Nombre completo:
                </label>
                <input
                    type="text"
                    value={bookingData.clienteNombre}
                    onChange={(e) => updateBookingData('clienteNombre', e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500"
                />
            </div>

            {/* Email */}
            <div>
                <label className="block text-white font-semibold mb-2">
                    * Email:
                </label>
                <input
                    type="email"
                    value={bookingData.clienteEmail}
                    onChange={(e) => updateBookingData('clienteEmail', e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500"
                />
            </div>

            {/* Teléfono */}
            <div>
                <label className="block text-white font-semibold mb-2">
                    * Teléfono:
                </label>
                <input
                    type="tel"
                    value={bookingData.clienteTelefono}
                    onChange={(e) => updateBookingData('clienteTelefono', e.target.value)}
                    placeholder="+56912345678"
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500"
                />
            </div>

            {/* Comentarios */}
            <div>
                <label className="block text-white font-semibold mb-2">
                    Comentarios o motivo de consulta (opcional):
                </label>
                <textarea
                    value={bookingData.comentarios}
                    onChange={(e) => updateBookingData('comentarios', e.target.value)}
                    placeholder="Describe brevemente tu consulta..."
                    rows="4"
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 resize-none"
                />
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
                    disabled={!isFormValid()}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all ${isFormValid()
                            ? 'bg-primary-500 hover:bg-primary-600 text-white cursor-pointer'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    Continuar
                </button>
            </div>
        </div>
    );
};

export default ClientForm;