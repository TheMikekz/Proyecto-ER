import { useState, useEffect } from 'react';
import { getServicios, getAbogados, checkDisponibilidad, createAgendamiento } from '../../utils/api';
import { X, CheckCircle, Calendar, Clock, User, Mail, Phone, MessageSquare, ChevronRight, ChevronLeft, Scale, Ban } from 'lucide-react';

const BookingWizard = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [servicios, setServicios] = useState([]);
    const [abogados, setAbogados] = useState([]);
    const [selectedServicio, setSelectedServicio] = useState(null);
    const [selectedAbogado, setSelectedAbogado] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [horasOcupadas, setHorasOcupadas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        comentarios: ''
    });

    // Cargar servicios y abogados
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
                console.error('Error al cargar datos:', error);
                setError('Error al cargar los datos');
            }
        };
        fetchData();
    }, []);

    // Verificar disponibilidad cuando cambia fecha o abogado
    useEffect(() => {
        if (selectedAbogado && selectedDate) {
            fetchDisponibilidad();
        }
    }, [selectedDate, selectedAbogado]);

    const fetchDisponibilidad = async () => {
        try {
            const response = await checkDisponibilidad(selectedAbogado.id, selectedDate);
            setHorasOcupadas(response.data.horasOcupadas);
        } catch (error) {
            console.error('Error al verificar disponibilidad:', error);
        }
    };

    // Función para generar horarios según el día de la semana
    const getHorariosDisponibles = () => {
        if (!selectedDate) return [];

        const fecha = new Date(selectedDate + 'T00:00:00');
        const diaSemana = fecha.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado

        // Sábado (día 6): 09:30 - 12:00
        if (diaSemana === 6) {
            return [
                '09:30 - 10:00',
                '10:30 - 11:00',
                '11:30 - 12:00'
            ];
        }

        // Lunes a Viernes (días 1-5): 09:30 - 19:00
        if (diaSemana >= 1 && diaSemana <= 5) {
            return [
                '09:30 - 10:00',
                '10:30 - 11:00',
                '11:30 - 12:00',
                '12:30 - 13:00',
                '13:30 - 14:00',
                '14:30 - 15:00',
                '15:30 - 16:00',
                '16:30 - 17:00',
                '17:30 - 18:00',
                '18:30 - 19:00'
            ];
        }

        // Domingo: no hay atención
        return [];
    };

    const isHoraDisponible = (horario) => {
        // Extraer solo la hora de inicio del bloque (ej: "09:30" de "09:30 - 10:00")
        const horaInicio = horario.split(' - ')[0];

        // Verificar si esta hora está ocupada
        return !horasOcupadas.some(h => {
            const horaOcupada = h.substring(0, 5);
            return horaOcupada === horaInicio;
        });
    };

    // Función para formatear fecha chilena (dd-mm-yyyy)
    const formatearFechaChilena = (fecha) => {
        const date = new Date(fecha + 'T00:00:00');
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const año = date.getFullYear();
        return `${dia}-${mes}-${año}`;
    };

    // Función para formatear precio chileno
    const formatearPrecioChileno = (precio) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(precio);
    };

    const handleNext = () => {
        if (step === 1 && selectedServicio && selectedAbogado) {
            setStep(2);
        } else if (step === 2 && selectedDate && selectedTime) {
            setStep(3);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            // Extraer solo la hora de inicio del bloque seleccionado
            const horaInicio = selectedTime.split(' - ')[0];

            const agendamientoData = {
                servicio_id: selectedServicio.id,
                abogado_id: selectedAbogado.id,
                cliente_nombre: formData.nombre,
                cliente_email: formData.email,
                cliente_telefono: formData.telefono,
                fecha: selectedDate,
                hora: horaInicio + ':00',
                comentarios: formData.comentarios || null
            };

            await createAgendamiento(agendamientoData);
            setSuccess(true);

            setTimeout(() => {
                onClose();
            }, 2500);

        } catch (err) {
            console.error('Error al crear agendamiento:', err);
            setError(err.response?.data?.error || 'Error al crear el agendamiento');
        } finally {
            setLoading(false);
        }
    };

    // Función para verificar si una fecha es válida (no domingo)
    const isFechaValida = (fecha) => {
        const date = new Date(fecha + 'T00:00:00');
        const diaSemana = date.getDay();
        return diaSemana !== 0; // 0 = Domingo
    };

    // Pantalla de éxito
    if (success) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-12 text-center">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Cita Agendada!</h3>
                    <p className="text-slate-600 mb-4">
                        Recibirás un correo de confirmación<br />
                        <span className="font-semibold">{formData.email}</span>
                    </p>
                    <p className="text-sm text-slate-500">
                        Te contactaremos pronto para confirmar tu cita
                    </p>
                </div>
            </div>
        );
    }

    const horarios = getHorariosDisponibles();

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row">

                {/* Sidebar - Navegación y pasos */}
                <div className="w-full md:w-80 bg-olive-700 text-white p-6 md:p-8">
                    <div className="flex items-center justify-between md:justify-start md:mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white from-olive-500 to-olive-700 rounded-lg flex items-center justify-center">
                                <Scale className="w-5 h-5 text-black" />
                            </div>
                            <div>
                                <div className="font-bold text-sm">Simple y Legal</div>
                                <div className="text-xs text-slate-200">Asesoría legal</div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="hidden md:block">
                        <h3 className="text-xl font-bold mb-2">Agenda tu Consulta</h3>
                        <p className="text-slate-200 text-sm mb-8">Completa los siguientes pasos</p>

                        {/* Steps */}
                        <div className="space-y-6">
                            {[
                                { num: 1, title: 'Selección del servicio', icon: <Calendar className="w-5 h-5" /> },
                                { num: 2, title: 'Fecha y Hora', icon: <Clock className="w-5 h-5" /> },
                                { num: 3, title: 'Tu información', icon: <User className="w-5 h-5" /> }
                            ].map(({ num, title, icon }) => (
                                <div key={num} className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${step > num
                                        ? 'bg-black'
                                        : step === num
                                            ? 'bg-olive-600 ring-4 ring-olive-600/0'
                                            : 'bg-black'
                                        }`}>
                                        {step > num ? <CheckCircle className="w-5 h-5" /> : icon}
                                    </div>
                                    <div className="pt-1">
                                        <div className={`font-semibold text-sm ${step >= num ? 'text-white' : 'text-slate-400'}`}>
                                            {title}
                                        </div>
                                        <div className="text-xs text-slate-200">Paso {num} de 3</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Contact info */}
                        <div className="mt-12 pt-8 border-t border-slate-200">
                            <p className="text-xs text-slate-200 mb-3">¿Necesitas ayuda?</p>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-slate-100">
                                    <Phone className="w-4 h-4" />
                                    <span>+56 9 1234 5678</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-100">
                                    <Mail className="w-4 h-4" />
                                    <span>contacto@eirianrubio.cl</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="border-b border-slate-200 p-6 md:p-8 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                {step === 1 && 'Selección del servicio'}
                                {step === 2 && 'Fecha y Hora'}
                                {step === 3 && 'Tu información'}
                            </h2>
                            <p className="text-slate-600 text-sm mt-1">
                                {step === 1 && 'Elige el servicio y abogado que necesitas'}
                                {step === 2 && 'Selecciona el día y horario de tu preferencia'}
                                {step === 3 && 'Completa tus datos de contacto'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="hidden md:flex w-10 h-10 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8">
                        {/* Error message */}
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Step 1: Servicio */}
                        {step === 1 && (
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-slate-900 font-semibold mb-4">
                                        Servicio <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid gap-3">
                                        {servicios.map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => setSelectedServicio(s)}
                                                className={`p-4 border-2 rounded-xl text-left transition-all ${selectedServicio?.id === s.id
                                                    ? 'border-olive-600 bg-olive-50'
                                                    : 'border-slate-200 hover:border-olive-300'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-slate-900 mb-1">{s.nombre}</h3>
                                                        <p className="text-sm text-slate-600">{s.descripcion}</p>
                                                    </div>
                                                    <div className="text-right ml-4">
                                                        <div className="text-lg font-bold text-olive-700">
                                                            {formatearPrecioChileno(s.precio)}
                                                        </div>
                                                        <div className="text-xs text-slate-500">{s.duracion_minutos} min</div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-900 font-semibold mb-4">
                                        Abogado <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid gap-3">
                                        {abogados.map(a => (
                                            <button
                                                key={a.id}
                                                onClick={() => setSelectedAbogado(a)}
                                                className={`p-4 border-2 rounded-xl text-left transition-all flex items-center gap-4 ${selectedAbogado?.id === a.id
                                                    ? 'border-olive-600 bg-olive-50'
                                                    : 'border-slate-200 hover:border-olive-300'
                                                    }`}
                                            >
                                                <div className="w-12 h-12 bg-gradient-to-br from-olive-600 to-olive-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                                    {a.nombre.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-slate-900">{a.nombre}</h3>
                                                    <p className="text-sm text-slate-600">{a.especialidad}</p>
                                                </div>
                                                {selectedAbogado?.id === a.id && (
                                                    <CheckCircle className="w-5 h-5 text-olive-600" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Fecha y Hora */}
                        {step === 2 && (
                            <div className="space-y-6">
                                {/* Resumen */}
                                <div className="bg-olive-50 border border-olive-200 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-olive-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-1">Servicio seleccionado</h4>
                                            <p className="text-sm text-slate-700">{selectedServicio?.nombre}</p>
                                            <p className="text-sm text-slate-600">con {selectedAbogado?.nombre}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-900 font-semibold mb-3">
                                        Fecha <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => {
                                            if (isFechaValida(e.target.value)) {
                                                setSelectedDate(e.target.value);
                                                setSelectedTime('');
                                            } else {
                                                alert('Los domingos no hay atención. Por favor selecciona otro día.');
                                            }
                                        }}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full p-4 border-2 border-slate-300 rounded-xl focus:border-olive-600 focus:ring-4 focus:ring-olive-100 outline-none transition-all"
                                    />
                                    <p className="text-xs text-slate-500 mt-2">
                                        * Atención: Lun-Vie 9:30-19:00 | Sáb 9:30-12:00 | Dom cerrado
                                    </p>
                                </div>

                                {selectedDate && horarios.length > 0 && (
                                    <>
                                        {/* NUEVO: Mensaje si el día está bloqueado */}
                                        {error && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Ban className="w-5 h-5 text-red-600" />
                                                    <p className="text-red-700 text-sm font-medium">{error}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Mostrar horarios solo si NO está bloqueado */}
                                        {!error && (
                                            <div>
                                                <label className="block text-slate-900 font-semibold mb-3">
                                                    Horario disponible <span className="text-red-500">*</span>
                                                </label>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {horarios.map(horario => {
                                                        const disponible = isHoraDisponible(horario);
                                                        return (
                                                            <button
                                                                key={horario}
                                                                onClick={() => disponible && setSelectedTime(horario)}
                                                                disabled={!disponible}
                                                                className={`p-3 border-2 rounded-lg font-semibold transition-all text-sm ${selectedTime === horario
                                                                    ? 'border-olive-600 bg-olive-600 text-white'
                                                                    : disponible
                                                                        ? 'border-slate-200 hover:border-olive-300 text-slate-700'
                                                                        : 'border-slate-100 bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                                                                    }`}
                                                            >
                                                                {horario}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-3">
                                                    * Los bloques incluyen 30 minutos de consulta
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Step 3: Información */}
                        {step === 3 && (
                            <div className="space-y-6">
                                {/* Resumen Final */}
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                                    <h4 className="font-bold text-slate-900 mb-3">Resumen de tu cita</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Servicio:</span>
                                            <span className="font-semibold text-slate-900">{selectedServicio?.nombre}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Abogado:</span>
                                            <span className="font-semibold text-slate-900">{selectedAbogado?.nombre}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Fecha:</span>
                                            <span className="font-semibold text-slate-900">
                                                {formatearFechaChilena(selectedDate)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Horario:</span>
                                            <span className="font-semibold text-slate-900">{selectedTime}</span>
                                        </div>
                                        <div className="flex justify-between pt-3 border-t border-slate-300">
                                            <span className="font-semibold text-slate-900">Total:</span>
                                            <span className="text-lg font-bold text-olive-700">
                                                {formatearPrecioChileno(selectedServicio?.precio)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-slate-900 font-semibold mb-2 text-sm">
                                            <User className="w-4 h-4 inline mr-1" />
                                            Nombre completo <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                            className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-olive-600 focus:ring-4 focus:ring-olive-100 outline-none transition-all"
                                            placeholder="Juan Pérez"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-900 font-semibold mb-2 text-sm">
                                            <Mail className="w-4 h-4 inline mr-1" />
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-olive-600 focus:ring-4 focus:ring-olive-100 outline-none transition-all"
                                            placeholder="juan@email.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-slate-900 font-semibold mb-2 text-sm">
                                        <Phone className="w-4 h-4 inline mr-1" />
                                        Teléfono <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                        className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-olive-600 focus:ring-4 focus:ring-olive-100 outline-none transition-all"
                                        placeholder="+56 9 1234 5678"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-900 font-semibold mb-2 text-sm">
                                        <MessageSquare className="w-4 h-4 inline mr-1" />
                                        Comentarios (opcional)
                                    </label>
                                    <textarea
                                        value={formData.comentarios}
                                        onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
                                        rows="3"
                                        className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-olive-600 focus:ring-4 focus:ring-olive-100 outline-none transition-all resize-none"
                                        placeholder="Describe brevemente tu caso..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer with buttons */}
                    <div className="border-t border-slate-200 p-6 md:p-8 bg-slate-50">
                        <div className="flex gap-3">
                            {step > 1 && (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-white transition-all flex items-center gap-2"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Atrás
                                </button>
                            )}

                            {step < 3 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={
                                        (step === 1 && (!selectedServicio || !selectedAbogado)) ||
                                        (step === 2 && (!selectedDate || !selectedTime))
                                    }
                                    className="flex-1 px-6 py-3 bg-olive-600 text-white rounded-lg font-semibold hover:bg-olive-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    Continuar
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!formData.nombre || !formData.email || !formData.telefono || loading}
                                    className="flex-1 px-6 py-3 bg-olive-600 text-white rounded-lg font-semibold hover:bg-olive-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Confirmar Cita
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BookingWizard;