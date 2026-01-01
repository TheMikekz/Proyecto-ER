import { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const useBooking = () => {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error('useBooking debe usarse dentro de BookingProvider');
    }
    return context;
};

export const BookingProvider = ({ children }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [bookingData, setBookingData] = useState({
        servicio: null,
        abogado: null,
        fecha: null,
        hora: null,
        clienteNombre: '',
        clienteEmail: '',
        clienteTelefono: '',
        comentarios: ''
    });

    const updateBookingData = (field, value) => {
        setBookingData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const nextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, 4));
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const resetBooking = () => {
        setCurrentStep(1);
        setBookingData({
            servicio: null,
            abogado: null,
            fecha: null,
            hora: null,
            clienteNombre: '',
            clienteEmail: '',
            clienteTelefono: '',
            comentarios: ''
        });
    };

    const value = {
        currentStep,
        bookingData,
        updateBookingData,
        nextStep,
        prevStep,
        resetBooking
    };


    return (
        <BookingContext.Provider value={value}>
            {children}
        </BookingContext.Provider>
    );
};