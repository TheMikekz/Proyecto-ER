const express = require("express");
const router = express.Router();
const {
  getAbogados,
  getAbogadoById,
  getDisponibilidad,
} = require("../controllers/abogadosController");

router.get("/", getAbogados);
router.get("/:id", getAbogadoById);
router.get("/:id/disponibilidad", getDisponibilidad);

module.exports = router;
