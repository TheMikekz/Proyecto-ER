// src/pages/Admin.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAgendamientos, updateAgendamiento, getBloqueos, createBloqueo, deleteBloqueo, getAbogados } from '../utils/api';
import { RefreshCw } from 'lucide-react';

// Importar componentes
import Sidebar from '../components/admin/Sidebar';
import TopBar from '../components/admin/TopBar';
import DashboardView from '../components/admin/DashboardView';
import CitasView from '../components/admin/CitasView';
import BloqueosView from '../components/admin/BloqueosView';
import BlockModal from '../components/admin/BlockModal';

const Admin = () => {
    const { user, logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Estados principales
    const [activeView, setActiveView] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [agendamientos, setAgendamientos] = useState([]);
    const [bloqueos, setBloqueos] = useState([]);
    const [abogados, setAbogados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    // Estados para búsqueda y filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('todos');

    // Estados para modales
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockForm, setBlockForm] = useState({
        abogado_id: '',
        fecha: '',
        hora_inicio: '',
        hora_fin: '',
        motivo: '',
        tipo: 'dia_completo'
    });

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (user) {
            fetchAllData();
        }
    }, [user]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [agendamientosRes, bloqueosRes, abogadosRes] = await Promise.all([
                getAgendamientos(),
                getBloqueos(),
                getAbogados()
            ]);

            // Normalizar fechas de agendamientos (quitar la hora del ISO)
            const agendamientosNormalizados = (Array.isArray(agendamientosRes.data) ? agendamientosRes.data : []).map(ag => ({
                ...ag,
                fecha: ag.fecha.split('T')[0] // Convierte "2026-01-02T03:00:00.000Z" a "2026-01-02"
            }));

            setAgendamientos(agendamientosNormalizados);
            setBloqueos(Array.isArray(bloqueosRes.data) ? bloqueosRes.data : []);
            setAbogados(Array.isArray(abogadosRes.data) ? abogadosRes.data : []);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            setAgendamientos([]);
            setBloqueos([]);
            setAbogados([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEstado = async (id, nuevoEstado) => {
        setUpdatingId(id);
        try {
            await updateAgendamiento(id, { estado: nuevoEstado });
            await fetchAllData();
        } catch (error) {
            console.error('Error al actualizar estado:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleCreateBloqueo = async () => {
        try {
            // Validar campos requeridos
            if (!blockForm.abogado_id || !blockForm.fecha) {
                alert('Por favor completa los campos requeridos');
                return;
            }

            // Validar horas si es tipo horas_especificas
            if (blockForm.tipo === 'horas_especificas' && (!blockForm.hora_inicio || !blockForm.hora_fin)) {
                alert('Por favor completa las horas de inicio y fin');
                return;
            }

            await createBloqueo(blockForm);
            setShowBlockModal(false);
            setBlockForm({
                abogado_id: '',
                fecha: '',
                hora_inicio: '',
                hora_fin: '',
                motivo: '',
                tipo: 'dia_completo'
            });
            await fetchAllData();
        } catch (error) {
            console.error('Error al crear bloqueo:', error);
            alert('Error al crear el bloqueo: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleDeleteBloqueo = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este bloqueo?')) {
            try {
                await deleteBloqueo(id);
                await fetchAllData();
            } catch (error) {
                console.error('Error al eliminar bloqueo:', error);
                alert('Error al eliminar el bloqueo');
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Cálculos para stats
    const hoy = new Date().toISOString().split('T')[0];
    const citasHoy = agendamientos.filter(a => a.fecha === hoy);
    const proximaCita = agendamientos
        .filter(a => new Date(a.fecha + 'T' + a.hora) > new Date() && a.estado !== 'cancelado')
        .sort((a, b) => new Date(a.fecha + 'T' + a.hora) - new Date(b.fecha + 'T' + b.hora))[0];

    const stats = {
        citasHoy: citasHoy.length,
        proximaCita: proximaCita,
        confirmadas: agendamientos.filter(a => a.estado === 'confirmado').length,
        pendientes: agendamientos.filter(a => a.estado === 'pendiente').length,
        canceladas: agendamientos.filter(a => a.estado === 'cancelado').length,
        bloqueosActivos: bloqueos.filter(b => new Date(b.fecha_inicio) >= new Date()).length
    };

    // Filtrado de agendamientos
    const filteredAgendamientos = agendamientos.filter(ag => {
        const matchSearch = ag.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ag.cliente_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ag.cliente_telefono?.includes(searchTerm);
        const matchFilter = filterStatus === 'todos' || ag.estado === filterStatus;
        return matchSearch && matchFilter;
    });

    const sortedAgendamientos = [...filteredAgendamientos].sort((a, b) => {
        const dateA = new Date(a.fecha + 'T' + a.hora);
        const dateB = new Date(b.fecha + 'T' + b.hora);
        return dateB - dateA;
    });

    const sortedBloqueos = [...bloqueos].sort((a, b) => {
        return new Date(b.fecha_inicio) - new Date(a.fecha_inicio);
    });

    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
                    <div className="text-slate-700 text-xl font-medium">Cargando...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">

            {/* Sidebar */}
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                activeView={activeView}
                setActiveView={setActiveView}
                handleLogout={handleLogout}
            />

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>

                {/* Top Bar */}
                <TopBar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    activeView={activeView}
                    user={user}
                    navigate={navigate}
                    loading={loading}
                    fetchAllData={fetchAllData}
                />

                {/* Content Area */}
                <div className="p-6">

                    {/* DASHBOARD VIEW */}
                    {activeView === 'dashboard' && (
                        <DashboardView
                            stats={stats}
                            citasHoy={citasHoy}
                        />
                    )}

                    {/* CITAS VIEW */}
                    {activeView === 'citas' && (
                        <CitasView
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            filterStatus={filterStatus}
                            setFilterStatus={setFilterStatus}
                            loading={loading}
                            sortedAgendamientos={sortedAgendamientos}
                            updatingId={updatingId}
                            handleUpdateEstado={handleUpdateEstado}
                        />
                    )}

                    {/* BLOQUEOS VIEW */}
                    {activeView === 'agenda' && (
                        <BloqueosView
                            setShowBlockModal={setShowBlockModal}
                            loading={loading}
                            sortedBloqueos={sortedBloqueos}
                            handleDeleteBloqueo={handleDeleteBloqueo}
                        />
                    )}

                </div>
            </div>

            {/* Modal para crear bloqueo */}
            {showBlockModal && (
                <BlockModal
                    setShowBlockModal={setShowBlockModal}
                    blockForm={blockForm}
                    setBlockForm={setBlockForm}
                    abogados={abogados}
                    handleCreateBloqueo={handleCreateBloqueo}
                />
            )}

        </div>
    );
};

export default Admin;