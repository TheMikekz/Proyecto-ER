import { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Calendar as CalendarIcon, Clock, User, X, CheckCircle, AlertCircle } from 'lucide-react';

// Configurar el localizador con date-fns
const locales = {
    'es': es,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const CalendarView = ({ agendamientos, loading, onSelectEvent }) => {
    const [view, setView] = useState('month'); // month, week, day
    const [selectedEvent, setSelectedEvent] = useState(null);

    // Convertir agendamientos a eventos del calendario
    const events = useMemo(() => {
        return agendamientos.map(ag => {
            const fechaHora = new Date(`${ag.fecha}T${ag.hora}`);
            const duracion = ag.duracion_minutos || 60;
            const fechaFin = new Date(fechaHora.getTime() + duracion * 60000);

            return {
                id: ag.id,
                title: `${ag.cliente_nombre} - ${ag.servicio_nombre}`,
                start: fechaHora,
                end: fechaFin,
                resource: ag, // Datos completos del agendamiento
            };
        });
    }, [agendamientos]);

    // Estilos personalizados para eventos según estado
    const eventStyleGetter = (event) => {
        const ag = event.resource;
        let backgroundColor = '#64748b'; // gris por defecto

        if (ag.estado === 'confirmado') {
            backgroundColor = '#16a34a'; // verde
        } else if (ag.estado === 'pendiente') {
            backgroundColor = '#f59e0b'; // ámbar
        } else if (ag.estado === 'cancelado') {
            backgroundColor = '#dc2626'; // rojo
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '5px',
                opacity: ag.estado === 'cancelado' ? 0.6 : 1,
                color: 'white',
                border: 'none',
                display: 'block',
                fontSize: '0.875rem',
                padding: '2px 5px',
            },
        };
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event.resource);
    };

    const handleCloseModal = () => {
        setSelectedEvent(null);
    };

    // Mensajes en español
    const messages = {
        allDay: 'Todo el día',
        previous: 'Anterior',
        next: 'Siguiente',
        today: 'Hoy',
        month: 'Mes',
        week: 'Semana',
        day: 'Día',
        agenda: 'Agenda',
        date: 'Fecha',
        time: 'Hora',
        event: 'Evento',
        noEventsInRange: 'No hay eventos en este rango',
        showMore: (total) => `+ Ver más (${total})`,
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
                <div className="w-12 h-12 border-4 border-olive-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500">Cargando calendario...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <CalendarIcon className="w-6 h-6 text-olive-600" />
                            Calendario de Citas
                        </h3>
                        <p className="text-slate-600 text-sm mt-1">Vista general de todas las citas programadas</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setView('month')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${view === 'month'
                                    ? 'bg-olive-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            Mes
                        </button>
                        <button
                            onClick={() => setView('week')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${view === 'week'
                                    ? 'bg-olive-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            Semana
                        </button>
                        <button
                            onClick={() => setView('day')}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${view === 'day'
                                    ? 'bg-olive-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            Día
                        </button>
                    </div>
                </div>
            </div>

            {/* Leyenda de colores */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-600 rounded"></div>
                        <span className="text-slate-700">Confirmada</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-amber-500 rounded"></div>
                        <span className="text-slate-700">Pendiente</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-600 rounded opacity-60"></div>
                        <span className="text-slate-700">Cancelada</span>
                    </div>
                </div>
            </div>

            {/* Calendario */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200" style={{ height: '700px' }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    messages={messages}
                    culture="es"
                    view={view}
                    onView={setView}
                    eventPropGetter={eventStyleGetter}
                    onSelectEvent={handleSelectEvent}
                    views={['month', 'week', 'day']}
                    step={30}
                    showMultiDayTimes
                    defaultDate={new Date()}
                />
            </div>

            {/* Modal de detalle del evento */}
            {selectedEvent && (
                <EventDetailModal
                    event={selectedEvent}
                    onClose={handleCloseModal}
                    onUpdate={onSelectEvent}
                />
            )}
        </div>
    );
};

// Modal de detalle del evento
const EventDetailModal = ({ event, onClose, onUpdate }) => {
    const getEstadoBadge = (estado) => {
        const badges = {
            pendiente: { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertCircle },
            confirmado: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
            cancelado: { bg: 'bg-red-100', text: 'text-red-700', icon: X }
        };
        const badge = badges[estado] || badges.pendiente;
        const Icon = badge.icon;
        return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                <Icon className="w-4 h-4" />
                <span className="text-sm font-semibold capitalize">{estado}</span>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900">Detalle de la Cita</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Estado */}
                    <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">Estado:</span>
                        {getEstadoBadge(event.estado)}
                    </div>

                    {/* Cliente */}
                    <div>
                        <div className="flex items-center gap-2 text-slate-600 mb-1">
                            <User className="w-4 h-4" />
                            <span className="font-medium">Cliente:</span>
                        </div>
                        <p className="text-slate-900 font-semibold">{event.cliente_nombre}</p>
                        <p className="text-sm text-slate-600">{event.cliente_email}</p>
                        <p className="text-sm text-slate-600">{event.cliente_telefono}</p>
                    </div>

                    {/* Servicio */}
                    <div>
                        <span className="text-slate-600 font-medium">Servicio:</span>
                        <p className="text-slate-900 font-semibold">{event.servicio_nombre}</p>
                    </div>

                    {/* Abogado */}
                    <div>
                        <span className="text-slate-600 font-medium">Abogado:</span>
                        <p className="text-slate-900 font-semibold">{event.abogado_nombre}</p>
                    </div>

                    {/* Fecha y Hora */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-slate-600 mb-1">
                                <CalendarIcon className="w-4 h-4" />
                                <span className="font-medium">Fecha:</span>
                            </div>
                            <p className="text-slate-900">
                                {new Date(event.fecha + 'T00:00:00').toLocaleDateString('es-CL', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-slate-600 mb-1">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">Hora:</span>
                            </div>
                            <p className="text-slate-900 font-semibold">{event.hora.substring(0, 5)} hrs</p>
                        </div>
                    </div>

                    {/* Link de Meet si existe */}
                    {event.meet_link && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-900 font-medium mb-2">📹 Enlace de videollamada:</p>
                            <a
                                href={event.meet_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline break-all"
                            >
                                {event.meet_link}
                            </a>
                        </div>
                    )}

                    {/* Comentarios */}
                    {event.comentarios && (
                        <div className="bg-slate-50 rounded-lg p-4">
                            <p className="text-slate-600 font-medium mb-1">Comentarios:</p>
                            <p className="text-slate-700 text-sm">{event.comentarios}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-3 bg-olive-600 hover:bg-olive-700 text-white rounded-lg font-semibold transition-all"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalendarView;