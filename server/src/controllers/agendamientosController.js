const pool = require("../config/database");
const googleCalendarService = require("../services/googleCalendarService");
const emailService = require("../services/emailService");

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

    // Obtener info del servicio y abogado
    const [servicioResult, abogadoResult] = await Promise.all([
      pool.query("SELECT * FROM servicios WHERE id = $1", [servicio_id]),
      pool.query("SELECT * FROM abogados WHERE id = $1", [abogado_id]),
    ]);

    if (servicioResult.rows.length === 0) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    if (abogadoResult.rows.length === 0) {
      return res.status(404).json({ error: "Abogado no encontrado" });
    }

    const servicio = servicioResult.rows[0];
    const abogado = abogadoResult.rows[0];

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

    // Insertar agendamiento
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
        servicio.duracion_minutos,
        comentarios,
      ]
    );

    const agendamiento = result.rows[0];

    res.status(201).json({
      message: "Agendamiento creado exitosamente",
      agendamiento,
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
        s.duracion_minutos,
        ab.nombre as abogado_nombre,
        ab.especialidad as abogado_especialidad,
        ab.email as abogado_email
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
    const { estado, comentarios } = req.body;

    if (
      ![
        "pendiente",
        "confirmado",
        "cancelado",
        "requiere_reagendamiento",
      ].includes(estado)
    ) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    // Obtener agendamiento actual con todos los datos necesarios
    const currentResult = await pool.query(
      `SELECT a.*, 
              s.nombre as servicio_nombre, 
              s.duracion_minutos,
              ab.nombre as abogado_nombre, 
              ab.email as abogado_email
       FROM agendamientos a
       LEFT JOIN servicios s ON a.servicio_id = s.id
       LEFT JOIN abogados ab ON a.abogado_id = ab.id
       WHERE a.id = $1`,
      [id]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: "Agendamiento no encontrado" });
    }

    const agendamiento = currentResult.rows[0];

    // 🎯 CASO 1: Confirmando una cita (crear evento en Google Calendar + Meet)
    if (estado === "confirmado" && !agendamiento.google_event_id) {
      try {
        console.log("📅 Creando evento en Google Calendar con Meet...");

        // Crear evento en Google Calendar con Meet
        const calendarEvent = await googleCalendarService.createCalendarEvent({
          cliente_nombre: agendamiento.cliente_nombre,
          cliente_email: agendamiento.cliente_email,
          servicio_nombre: agendamiento.servicio_nombre,
          fecha: agendamiento.fecha,
          hora: agendamiento.hora,
          duracion_minutos: agendamiento.duracion_minutos,
          abogado_email: agendamiento.abogado_email,
        });

        console.log("✅ Evento creado:", calendarEvent);

        // Actualizar agendamiento con event_id y meet_link
        let updateQuery =
          "UPDATE agendamientos SET estado = $1, google_event_id = $2, meet_link = $3";
        let updateParams = [
          estado,
          calendarEvent.eventId,
          calendarEvent.meetLink,
        ];

        if (comentarios !== undefined) {
          updateQuery += ", comentarios = $4 WHERE id = $5 RETURNING *";
          updateParams.push(comentarios, id);
        } else {
          updateQuery += " WHERE id = $4 RETURNING *";
          updateParams.push(id);
        }

        await pool.query(updateQuery, updateParams);

        // Enviar email de confirmación con link de Meet
        console.log("📧 Enviando email de confirmación...");
        await emailService.sendConfirmationEmail({
          cliente_nombre: agendamiento.cliente_nombre,
          cliente_email: agendamiento.cliente_email,
          servicio_nombre: agendamiento.servicio_nombre,
          abogado_nombre: agendamiento.abogado_nombre,
          fecha: agendamiento.fecha,
          hora: agendamiento.hora,
          meetLink: calendarEvent.meetLink,
        });

        console.log("✅ Email enviado exitosamente");
      } catch (error) {
        console.error("❌ Error con Google Calendar/Email:", error.message);

        // Si falla Calendar/Email, actualizar solo el estado
        let fallbackQuery = "UPDATE agendamientos SET estado = $1";
        let fallbackParams = [estado];

        if (comentarios !== undefined) {
          fallbackQuery += ", comentarios = $2 WHERE id = $3";
          fallbackParams.push(comentarios, id);
        } else {
          fallbackQuery += " WHERE id = $2";
          fallbackParams.push(id);
        }

        await pool.query(fallbackQuery, fallbackParams);
      }
    }
    // 🎯 CASO 2: Cancelando una cita (eliminar de Google Calendar)
    else if (estado === "cancelado" && agendamiento.google_event_id) {
      try {
        console.log("🗑️ Eliminando evento de Google Calendar...");

        // Eliminar evento de Google Calendar
        await googleCalendarService.deleteCalendarEvent(
          agendamiento.google_event_id
        );

        console.log("✅ Evento eliminado de Calendar");

        // Enviar email de cancelación
        console.log("📧 Enviando email de cancelación...");
        await emailService.sendCancellationEmail({
          cliente_nombre: agendamiento.cliente_nombre,
          cliente_email: agendamiento.cliente_email,
          servicio_nombre: agendamiento.servicio_nombre,
          abogado_nombre: agendamiento.abogado_nombre,
          fecha: agendamiento.fecha,
          hora: agendamiento.hora,
        });

        console.log("✅ Email de cancelación enviado");
      } catch (error) {
        console.error(
          "❌ Error al cancelar en Google Calendar:",
          error.message
        );
      }

      // Actualizar estado a cancelado
      let cancelQuery = "UPDATE agendamientos SET estado = $1";
      let cancelParams = [estado];

      if (comentarios !== undefined) {
        cancelQuery += ", comentarios = $2 WHERE id = $3";
        cancelParams.push(comentarios, id);
      } else {
        cancelQuery += " WHERE id = $2";
        cancelParams.push(id);
      }

      await pool.query(cancelQuery, cancelParams);
    }
    // 🎯 CASO 3: Otros cambios de estado (sin Google Calendar)
    else {
      let query = "UPDATE agendamientos SET estado = $1";
      let params = [estado];

      if (comentarios !== undefined) {
        query += ", comentarios = $2 WHERE id = $3 RETURNING *";
        params.push(comentarios, id);
      } else {
        query += " WHERE id = $2 RETURNING *";
        params.push(id);
      }

      await pool.query(query, params);
    }

    // Obtener agendamiento actualizado
    const updatedResult = await pool.query(
      `SELECT a.*, 
              s.nombre as servicio_nombre,
              ab.nombre as abogado_nombre
       FROM agendamientos a
       LEFT JOIN servicios s ON a.servicio_id = s.id
       LEFT JOIN abogados ab ON a.abogado_id = ab.id
       WHERE a.id = $1`,
      [id]
    );

    res.json({
      message: "Agendamiento actualizado exitosamente",
      agendamiento: updatedResult.rows[0],
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

    // 1. Obtener horas ocupadas
    const horasResult = await pool.query(
      `SELECT hora FROM agendamientos 
       WHERE abogado_id = $1 
       AND fecha = $2 
       AND estado != 'cancelado'`,
      [abogado_id, fecha]
    );

    // 2. Obtener bloqueos para esta fecha
    const bloqueosResult = await pool.query(
      `SELECT id, abogado_id, fecha_inicio, fecha_fin, hora_inicio, hora_fin, tipo, motivo
       FROM bloqueos 
       WHERE abogado_id = $1 
       AND fecha_inicio::date = $2`,
      [abogado_id, fecha]
    );

    const horasOcupadas = horasResult.rows.map((row) => row.hora);

    res.json({
      horasOcupadas,
      bloqueos: bloqueosResult.rows,
    });
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
