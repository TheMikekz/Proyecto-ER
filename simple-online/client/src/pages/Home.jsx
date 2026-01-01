import { useState, useEffect } from 'react';
import BookingWizard from '../components/booking/BookingWizard';
import WhatsAppButton from '../components/shared/WhatsAppButton';
import { Scale, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const Home = () => {
    const [showBooking, setShowBooking] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=1600&fit=crop',
            alt: 'Abogado profesional en oficina'
        },
        {
            image: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=1200&h=1600&fit=crop',
            alt: 'Consulta legal'
        },
        {
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=1600&fit=crop',
            alt: 'Asesoría legal profesional'
        },
        {
            image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&h=1600&fit=crop',
            alt: 'Equipo legal trabajando'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div className="min-h-screen bg-slate-900 relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute inset-0 bg-white from-slate-900 via-slate-800 to-slate-900"></div>

            {/* Main content grid */}
            <div className="relative z-10 min-h-screen grid md:grid-cols-[45%_55%]">

                {/* Left side - Content */}
                <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-20">

                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 bg-olive-600  rounded-lg flex items-center justify-center shadow-xl">
                            <Scale className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-black">Simple y Legal</div>
                            <div className="text-sm text-slate-600">Asesor legal</div>
                        </div>
                    </div>

                    {/* Main heading */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black leading-tight mb-6">
                        Asesoría Legal
                        <span className="block text-olive-600 mt-2">Profesional</span>
                    </h1>

                    {/* Description */}
                    <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed max-w-xl">
                        Soluciones legales personalizadas con más de 7 años de experiencia.
                        Comprometidos con la defensa de tus derechos.
                    </p>

                    {/* CTA Button */}
                    <div>
                        <button
                            onClick={() => setShowBooking(true)}
                            className="group inline-flex items-center gap-3 px-8 py-4 bg-olive-600 text-white text-lg font-bold rounded-lg shadow-xl hover:bg-olive-700 hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 hover:-translate-y-0.5"
                        >
                            <Calendar className="w-5 h-5 text-white" />
                            Agendar Consulta
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-16 pt-8">
                        <div className="flex flex-wrap items-center gap-8 text-slate-400 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Disponible para consultas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                <span>Respuesta en 24 horas</span>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="relative hidden md:block">
                    {/* Overlay sutil */}
                    <div className="absolute inset-0 bg-slate-100/30 backdrop-blur-[2px] z-10 pointer-events-none"></div>

                    {/* Carrusel de imágenes */}
                    <div className="relative h-full w-full overflow-hidden">
                        {slides.map((slide, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                                    }`}
                            >
                                <img
                                    src={slide.image}
                                    alt={slide.alt}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}

                        {/* Gradientes */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/50 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent"></div>

                        {/* Controles del carrusel */}
                        <div className="absolute bottom-8 right-8 z-20 flex items-center gap-4">
                            {/* Botón anterior */}
                            <button
                                onClick={prevSlide}
                                className="w-10 h-10 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
                                aria-label="Imagen anterior"
                            >
                                <ChevronLeft className="w-5 h-5 text-white" />
                            </button>

                            {/* Indicadores de puntos */}
                            <div className="flex gap-2">
                                {slides.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`transition-all ${index === currentSlide
                                            ? 'w-8 h-2 bg-olive-500'
                                            : 'w-2 h-2 bg-white/50 hover:bg-white/70'
                                            } rounded-full`}
                                        aria-label={`Ir a imagen ${index + 1}`}
                                    />
                                ))}
                            </div>

                            {/* Botón siguiente */}
                            <button
                                onClick={nextSlide}
                                className="w-10 h-10 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
                                aria-label="Imagen siguiente"
                            >
                                <ChevronRight className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <WhatsAppButton />
            {showBooking && <BookingWizard onClose={() => setShowBooking(false)} />}
        </div>
    );
};

export default Home;