import { useState, useEffect } from 'react';
import { getServicios, getAbogados, checkDisponibilidad, createAgendamiento } from '../../utils/api';
import { X, Check, CheckCircle, Calendar, Clock, User, Mail, Phone, MessageSquare, ChevronRight, ChevronLeft, Scale, Ban, AlertCircle } from 'lucide-react';

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
    const [bloqueos, setBloqueos] = useState([]);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '+56 ',
        comentarios: ''
    });
    const [formErrors, setFormErrors] = useState({
        nombre: '',
        email: '',
        telefono: ''
    });

    // Validaciones
    const validateNombre = (nombre) => {
        if (!nombre.trim()) {
            return 'El nombre es obligatorio';
        }
        if (nombre.trim().length < 3) {
            return 'El nombre debe tener al menos 3 caracteres';
        }
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
            return 'El nombre solo puede contener letras';
        }
        return '';
    };

    const validateEmail = (email) => {
        if (!email.trim()) {
            return 'El email es obligatorio';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Ingresa un email válido';
        }
        return '';
    };

    const validateTelefono = (telefono) => {
        if (!telefono.trim() || telefono.trim() === '+56') {
            return 'El teléfono es obligatorio';
        }

        // Remover espacios, guiones y el símbolo +
        const telefonoLimpio = telefono.replace(/[\s\-+]/g, '');

        // Debe ser exactamente 11 dígitos: 56 + 9 dígitos (ej: 56912345678)
        if (!/^56\d{9}$/.test(telefonoLimpio)) {
            return 'Formato válido: +56 9 1234 5678 (9 dígitos después del +56)';
        }

        // Verificar que después del 56 venga un 9 (celulares chilenos)
        if (!telefonoLimpio.startsWith('569')) {
            return 'Los celulares chilenos comienzan con 9';
        }

        return '';
    };

    const handleNombreChange = (value) => {
        setFormData({ ...formData, nombre: value });
        setFormErrors({ ...formErrors, nombre: '' });
    };

    const handleEmailChange = (value) => {
        setFormData({ ...formData, email: value });
        setFormErrors({ ...formErrors, email: '' });
    };

    const handleTelefonoChange = (value) => {
        // Si el usuario intenta borrar el prefijo, lo mantenemos
        if (!value.startsWith('+56 ')) {
            value = '+56 ';
        }

        // Obtener solo los dígitos después de +56
        const digitosUnicamente = value.substring(4).replace(/\D/g, '');

        // Limitar a 9 dígitos
        const digitosLimitados = digitosUnicamente.substring(0, 9);

        // Formatear: +56 9 1234 5678
        let telefonoFormateado = '+56 ';
        if (digitosLimitados.length > 0) {
            telefonoFormateado += digitosLimitados[0]; // primer dígito (9)
            if (digitosLimitados.length > 1) {
                telefonoFormateado += ' ' + digitosLimitados.substring(1, 5); // siguientes 4
                if (digitosLimitados.length > 5) {
                    telefonoFormateado += ' ' + digitosLimitados.substring(5, 9); // últimos 4
                }
            }
        }

        setFormData({ ...formData, telefono: telefonoFormateado });
        setFormErrors({ ...formErrors, telefono: '' });
    };

    const validateForm = () => {
        const nombreError = validateNombre(formData.nombre);
        const emailError = validateEmail(formData.email);
        const telefonoError = validateTelefono(formData.telefono);

        setFormErrors({
            nombre: nombreError,
            email: emailError,
            telefono: telefonoError
        });

        return !nombreError && !emailError && !telefonoError;
    };

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
            setHorasOcupadas(response.data.horasOcupadas || []);
            setBloqueos(response.data.bloqueos || []);
        } catch (error) {
            console.error('Error al verificar disponibilidad:', error);
        }
    };

    const isFechaBloqueada = () => {
        if (!selectedDate || bloqueos.length === 0) return false;

        return bloqueos.some(bloqueo => {
            const fechaBloqueo = bloqueo.fecha_inicio.split('T')[0];
            return fechaBloqueo === selectedDate && bloqueo.tipo === 'dia_completo';
        });
    };

    const isHoraBloqueada = (horario) => {
        if (bloqueos.length === 0) return false;

        const horaInicio = horario.split(' - ')[0];

        return bloqueos.some(bloqueo => {
            const fechaBloqueo = bloqueo.fecha_inicio.split('T')[0];
            if (fechaBloqueo !== selectedDate) return false;

            if (bloqueo.tipo === 'dia_completo') return true;

            if (bloqueo.tipo === 'horas_especificas' && bloqueo.hora_inicio && bloqueo.hora_fin) {
                const bloqInicio = bloqueo.hora_inicio.substring(0, 5);
                const bloqFin = bloqueo.hora_fin.substring(0, 5);
                return horaInicio >= bloqInicio && horaInicio < bloqFin;
            }

            return false;
        });
    };

    const getHorariosDisponibles = () => {
        if (!selectedDate) return [];

        const fecha = new Date(selectedDate + 'T00:00:00');
        const diaSemana = fecha.getDay();

        if (diaSemana === 6) {
            return [
                '09:30 - 10:00',
                '10:30 - 11:00',
                '11:30 - 12:00'
            ];
        }

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
        return [];
    };

    const isHoraDisponible = (horario) => {
        const horaInicio = horario.split(' - ')[0];

        const ocupada = horasOcupadas.some(h => {
            const horaOcupada = h.substring(0, 5);
            return horaOcupada === horaInicio;
        });

        const bloqueada = isHoraBloqueada(horario);

        return !ocupada && !bloqueada;
    };

    const formatearFechaChilena = (fecha) => {
        const date = new Date(fecha + 'T00:00:00');
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const año = date.getFullYear();
        return `${dia}-${mes}-${año}`;
    };

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
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const horaInicio = selectedTime.split(' - ')[0];

            const agendamientoData = {
                servicio_id: selectedServicio.id,
                abogado_id: selectedAbogado.id,
                cliente_nombre: formData.nombre.trim(),
                cliente_email: formData.email.trim().toLowerCase(),
                cliente_telefono: formData.telefono.trim(),
                fecha: selectedDate,
                hora: horaInicio + ':00',
                comentarios: formData.comentarios.trim() || null
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

    const isFechaValida = (fecha) => {
        const date = new Date(fecha + 'T00:00:00');
        const diaSemana = date.getDay();
        return diaSemana !== 0;
    };

    if (success) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-12 text-center">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-12 h-12 text-white" />
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
    const fechaBloqueada = isFechaBloqueada();

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
                                        {step > num ? <Check className="w-5 h-5" /> : icon}
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

                    <div className="flex-1 overflow-y-auto p-6 md:p-8">
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
                                                    <Check className="w-5 h-5 text-olive-600" />
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

                                {selectedDate && fechaBloqueada && (
                                    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5">
                                        <div className="flex items-start gap-3">
                                            <Ban className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-bold text-red-900 mb-1">Fecha no disponible</h4>
                                                <p className="text-sm text-red-700">
                                                    El {formatearFechaChilena(selectedDate)} no está disponible para agendar.
                                                    {bloqueos.find(b => b.fecha_inicio.split('T')[0] === selectedDate)?.motivo && (
                                                        <span className="block mt-1 font-medium">
                                                            Motivo: {bloqueos.find(b => b.fecha_inicio.split('T')[0] === selectedDate).motivo}
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-red-600 mt-2">Por favor selecciona otra fecha.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedDate && horarios.length > 0 && !fechaBloqueada && (
                                    <div>
                                        <label className="block text-slate-900 font-semibold mb-3">
                                            Horario disponible <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {horarios.map(horario => {
                                                const disponible = isHoraDisponible(horario);
                                                const bloqueada = isHoraBloqueada(horario);

                                                return (
                                                    <button
                                                        key={horario}
                                                        onClick={() => disponible && setSelectedTime(horario)}
                                                        disabled={!disponible}
                                                        className={`p-3 border-2 rounded-lg font-semibold transition-all text-sm relative ${selectedTime === horario
                                                            ? 'border-olive-600 bg-olive-600 text-white'
                                                            : bloqueada
                                                                ? 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed'
                                                                : disponible
                                                                    ? 'border-slate-200 hover:border-olive-300 text-slate-700'
                                                                    : 'border-slate-100 bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                                                            }`}
                                                    >
                                                        {bloqueada && (
                                                            <Ban className="w-3 h-3 absolute top-1 right-1 text-red-500" />
                                                        )}
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
                            </div>
                        )}

                        {/* Step 3: Información */}
                        {step === 3 && (
                            <div className="space-y-6">
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
                                            onChange={(e) => handleNombreChange(e.target.value)}
                                            onBlur={() => setFormErrors({ ...formErrors, nombre: validateNombre(formData.nombre) })}
                                            className={`w-full p-3 border-2 rounded-lg focus:ring-4 outline-none transition-all ${formErrors.nombre
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                                                : 'border-slate-300 focus:border-olive-600 focus:ring-olive-100'
                                                }`}
                                            placeholder="Juan Pérez"
                                        />
                                        {formErrors.nombre && (
                                            <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                                                <AlertCircle className="w-3 h-3" />
                                                <span>{formErrors.nombre}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-slate-900 font-semibold mb-2 text-sm">
                                            <Mail className="w-4 h-4 inline mr-1" />
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleEmailChange(e.target.value)}
                                            onBlur={() => setFormErrors({ ...formErrors, email: validateEmail(formData.email) })}
                                            className={`w-full p-3 border-2 rounded-lg focus:ring-4 outline-none transition-all ${formErrors.email
                                                ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                                                : 'border-slate-300 focus:border-olive-600 focus:ring-olive-100'
                                                }`}
                                            placeholder="juan@email.com"
                                        />
                                        {formErrors.email && (
                                            <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                                                <AlertCircle className="w-3 h-3" />
                                                <span>{formErrors.email}</span>
                                            </div>
                                        )}
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
                                        onChange={(e) => handleTelefonoChange(e.target.value)}
                                        onBlur={() => setFormErrors({ ...formErrors, telefono: validateTelefono(formData.telefono) })}
                                        className={`w-full p-3 border-2 rounded-lg focus:ring-4 outline-none transition-all ${formErrors.telefono
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                                            : 'border-slate-300 focus:border-olive-600 focus:ring-olive-100'
                                            }`}
                                        placeholder="+56 9 1234 5678"
                                    />
                                    {formErrors.telefono && (
                                        <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
                                            <AlertCircle className="w-3 h-3" />
                                            <span>{formErrors.telefono}</span>
                                        </div>
                                    )}
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
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-olive-600 text-white rounded-lg font-semibold hover:bg-olive-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
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