const pool = require("../config/database");

const createAgendamiento = async (req, res) => {
  try {
    const {
      servicio_id,
      abogado_id,
      cliente_nombre,
      cliente_email,
      cliente_telefono,
      fecha,
      hora,
      comentarios,
    } = req.body;

    // Validar campos requeridos
    if (
      !servicio_id ||
      !abogado_id ||
      !cliente_nombre ||
      !cliente_email ||
      !cliente_telefono ||
      !fecha ||
      !hora
    ) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    // Obtener duración del servicio
    const servicioResult = await pool.query(
      "SELECT duracion_minutos FROM servicios WHERE id = $1",
      [servicio_id]
    );

    if (servicioResult.rows.length === 0) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    const duracion = servicioResult.rows[0].duracion_minutos;

    // Verificar disponibilidad
    const disponibilidadCheck = await pool.query(
      `SELECT * FROM agendamientos 
       WHERE abogado_id = $1 
       AND fecha = $2 
       AND hora = $3 
       AND estado != 'cancelado'`,
      [abogado_id, fecha, hora]
    );

    if (disponibilidadCheck.rows.length > 0) {
      return res.status(409).json({ error: "Horario no disponible" });
    }

    // Insertar agendamiento (sin cliente_rut)
    const result = await pool.query(
      `INSERT INTO agendamientos 
       (servicio_id, abogado_id, cliente_nombre, cliente_email, cliente_telefono, 
        fecha, hora, duracion_minutos, comentarios, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pendiente')
       RETURNING *`,
      [
        servicio_id,
        abogado_id,
        cliente_nombre,
        cliente_email,
        cliente_telefono,
        fecha,
        hora,
        duracion,
        comentarios,
      ]
    );

    res.status(201).json({
      message: "Agendamiento creado exitosamente",
      agendamiento: result.rows[0],
    });
  } catch (error) {
    console.error("Error al crear agendamiento:", error);
    res.status(500).json({ error: "Error al crear agendamiento" });
  }
};

// Obtener todos los agendamientos
const getAgendamientos = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        a.*,
        s.nombre as servicio_nombre,
        ab.nombre as abogado_nombre
       FROM agendamientos a
       LEFT JOIN servicios s ON a.servicio_id = s.id
       LEFT JOIN abogados ab ON a.abogado_id = ab.id
       ORDER BY a.fecha DESC, a.hora DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener agendamientos:", error);
    res.status(500).json({ error: "Error al obtener agendamientos" });
  }
};

// Obtener agendamiento por ID
const getAgendamientoById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        a.*,
        s.nombre as servicio_nombre,
        s.precio as servicio_precio,
        ab.nombre as abogado_nombre,
        ab.especialidad as abogado_especialidad
       FROM agendamientos a
       LEFT JOIN servicios s ON a.servicio_id = s.id
       LEFT JOIN abogados ab ON a.abogado_id = ab.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Agendamiento no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener agendamiento:", error);
    res.status(500).json({ error: "Error al obtener agendamiento" });
  }
};

// Actualizar estado del agendamiento
const updateAgendamiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!["pendiente", "confirmado", "cancelado"].includes(estado)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    const result = await pool.query(
      "UPDATE agendamientos SET estado = $1 WHERE id = $2 RETURNING *",
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Agendamiento no encontrado" });
    }

    res.json({
      message: "Agendamiento actualizado",
      agendamiento: result.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar agendamiento:", error);
    res.status(500).json({ error: "Error al actualizar agendamiento" });
  }
};

// Verificar disponibilidad de horarios
const checkDisponibilidad = async (req, res) => {
  try {
    const { abogado_id, fecha } = req.query;

    if (!abogado_id || !fecha) {
      return res.status(400).json({ error: "Faltan parámetros" });
    }

    const result = await pool.query(
      `SELECT hora FROM agendamientos 
       WHERE abogado_id = $1 
       AND fecha = $2 
       AND estado != 'cancelado'`,
      [abogado_id, fecha]
    );

    const horasOcupadas = result.rows.map((row) => row.hora);

    res.json({ horasOcupadas });
  } catch (error) {
    console.error("Error al verificar disponibilidad:", error);
    res.status(500).json({ error: "Error al verificar disponibilidad" });
  }
};

module.exports = {
  createAgendamiento,
  getAgendamientos,
  getAgendamientoById,
  updateAgendamiento,
  checkDisponibilidad,
};
