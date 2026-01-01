const pool = require("../config/database");

// Obtener todos los bloqueos
const getBloqueos = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        b.*,
        a.nombre as abogado_nombre
       FROM bloqueos b
       LEFT JOIN abogados a ON b.abogado_id = a.id
       ORDER BY b.fecha_inicio DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener bloqueos:", error);
    res.status(500).json({ error: "Error al obtener bloqueos" });
  }
};

// Crear nuevo bloqueo
const createBloqueo = async (req, res) => {
  try {
    const { abogado_id, fecha, hora_inicio, hora_fin, motivo, tipo } = req.body;

    if (!fecha || !abogado_id) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    // Para día completo, fecha_inicio y fecha_fin son iguales
    const fecha_inicio = fecha;
    const fecha_fin = fecha;

    const result = await pool.query(
      `INSERT INTO bloqueos 
       (abogado_id, fecha_inicio, fecha_fin, hora_inicio, hora_fin, motivo, tipo)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        abogado_id,
        fecha_inicio,
        fecha_fin,
        hora_inicio || null,
        hora_fin || null,
        motivo || null,
        tipo || "dia_completo",
      ]
    );

    res.status(201).json({
      message: "Bloqueo creado exitosamente",
      bloqueo: result.rows[0],
    });
  } catch (error) {
    console.error("Error al crear bloqueo:", error);
    res.status(500).json({ error: "Error al crear bloqueo" });
  }
};

// Eliminar bloqueo
const deleteBloqueo = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM bloqueos WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Bloqueo no encontrado" });
    }

    res.json({
      message: "Bloqueo eliminado",
      bloqueo: result.rows[0],
    });
  } catch (error) {
    console.error("Error al eliminar bloqueo:", error);
    res.status(500).json({ error: "Error al eliminar bloqueo" });
  }
};

// Verificar si una fecha está bloqueada
const checkBloqueo = async (req, res) => {
  try {
    const { abogado_id, fecha, hora } = req.query;

    if (!fecha) {
      return res.status(400).json({ error: "Falta la fecha" });
    }

    let query = `
      SELECT * FROM bloqueos 
      WHERE abogado_id = $1
      AND fecha_inicio <= $2 
      AND fecha_fin >= $2
    `;
    const params = [abogado_id, fecha];

    // Si se proporciona hora, verificar bloqueos de horas específicas
    if (hora) {
      query += ` AND (
        tipo = 'dia_completo' 
        OR (tipo = 'horas_especificas' AND hora_inicio <= $3 AND hora_fin > $3)
      )`;
      params.push(hora);
    }

    const result = await pool.query(query, params);

    res.json({
      bloqueado: result.rows.length > 0,
      bloqueos: result.rows,
    });
  } catch (error) {
    console.error("Error al verificar bloqueo:", error);
    res.status(500).json({ error: "Error al verificar bloqueo" });
  }
};

module.exports = {
  getBloqueos,
  createBloqueo,
  deleteBloqueo,
  checkBloqueo,
};
