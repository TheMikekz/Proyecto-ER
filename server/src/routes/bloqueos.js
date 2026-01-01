const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth");
const {
  getBloqueos,
  createBloqueo,
  deleteBloqueo,
  checkBloqueo,
} = require("../controllers/bloqueosController");

// Todas las rutas requieren autenticación
router.get("/", authMiddleware, getBloqueos);
router.post("/", authMiddleware, createBloqueo);
router.delete("/:id", authMiddleware, deleteBloqueo);
router.get("/check", checkBloqueo); // Esta puede ser pública

module.exports = router;
