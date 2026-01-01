import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Servicios
export const getServicios = () => api.get("/servicios");
export const getServicioById = (id) => api.get(`/servicios/${id}`);

// Abogados
export const getAbogados = () => api.get("/abogados");
export const getAbogadoById = (id) => api.get(`/abogados/${id}`);
export const getDisponibilidad = (id) =>
  api.get(`/abogados/${id}/disponibilidad`);

// Agendamientos
export const createAgendamiento = (data) => api.post("/agendamientos", data);
export const getAgendamientos = () => api.get("/agendamientos");
export const getAgendamientoById = (id) => api.get(`/agendamientos/${id}`);
export const updateAgendamiento = (id, data) =>
  api.patch(`/agendamientos/${id}`, data);
export const checkDisponibilidad = (abogadoId, fecha) =>
  api.get(
    `/agendamientos/disponibilidad?abogado_id=${abogadoId}&fecha=${fecha}`
  );

// Bloqueos
export const getBloqueos = () => api.get("/bloqueos");
export const createBloqueo = (data) => api.post("/bloqueos", data);
export const deleteBloqueo = (id) => api.delete(`/bloqueos/${id}`);
export const checkBloqueo = (abogadoId, fecha) => {
  const params = new URLSearchParams({ fecha });
  if (abogadoId) params.append("abogado_id", abogadoId);
  return api.get(`/bloqueos/check?${params}`);
};

// Auth
export const login = (email, password) =>
  api.post("/auth/login", { email, password });
export const verifyToken = () => api.get("/auth/verify");

export default api;
