import { useBooking } from '../../context/BookingContext';

const StepIndicator = () => {
    const { currentStep } = useBooking();

    const steps = [
        { number: 1, title: 'Selección del servicio' },
        { number: 2, title: 'Fecha y Hora' },
        { number: 3, title: 'Tu información' },
        { number: 4, title: 'Confirmación' }
    ];

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
                {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center flex-1">
                        {/* Círculo del paso */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentStep >= step.number
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-700 text-gray-400'
                                    }`}
                            >
                                {currentStep > step.number ? '✓' : step.number}
                            </div>
                            <span
                                className={`text-xs mt-2 text-center ${currentStep >= step.number ? 'text-white' : 'text-gray-500'
                                    }`}
                            >
                                {step.title}
                            </span>
                        </div>

                        {/* Línea conectora */}
                        {index < steps.length - 1 && (
                            <div
                                className={`h-1 flex-1 mx-2 transition-all ${currentStep > step.number ? 'bg-primary' : 'bg-gray-700'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StepIndicator;