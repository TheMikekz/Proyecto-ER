const pool = require("../config/database");

// Obtener todos los servicios activos
const getServicios = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM servicios WHERE activo = true ORDER BY nombre"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    res.status(500).json({ error: "Error al obtener servicios" });
  }
};

// Obtener un servicio por ID
const getServicioById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM servicios WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Servicio no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener servicio:", error);
    res.status(500).json({ error: "Error al obtener servicio" });
  }
};

module.exports = {
  getServicios,
  getServicioById,
};
