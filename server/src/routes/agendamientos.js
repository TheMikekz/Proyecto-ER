// routes/agendamientos.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const pool = require("../config/database"); // ⚠️ AGREGA ESTO SI NO LO TIENES

const {
  createAgendamiento,
  getAgendamientos,
  getAgendamientoById,
  updateAgendamiento,
  checkDisponibilidad,
} = require("../controllers/agendamientosController");

// RUTAS PÚBLICAS
router.post("/", createAgendamiento);
router.get("/disponibilidad", checkDisponibilidad);

router.get("/", authMiddleware, getAgendamientos);
router.get("/:id", authMiddleware, getAgendamientoById);
router.patch("/:id", authMiddleware, updateAgendamiento);

module.exports = router;
