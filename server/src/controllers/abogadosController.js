const pool = require("../config/database");

// Obtener todos los abogados activos
const getAbogados = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM abogados WHERE activo = true ORDER BY nombre"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener abogados:", error);
    res.status(500).json({ error: "Error al obtener abogados" });
  }
};

// Obtener un abogado por ID
const getAbogadoById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM abogados WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Abogado no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener abogado:", error);
    res.status(500).json({ error: "Error al obtener abogado" });
  }
};

// Obtener disponibilidad de un abogado
const getDisponibilidad = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM disponibilidad_abogados WHERE abogado_id = $1 ORDER BY dia_semana, hora_inicio",
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener disponibilidad:", error);
    res.status(500).json({ error: "Error al obtener disponibilidad" });
  }
};

module.exports = {
  getAbogados,
  getAbogadoById,
  getDisponibilidad,
};
