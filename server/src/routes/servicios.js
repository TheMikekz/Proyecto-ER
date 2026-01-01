const express = require("express");
const router = express.Router();
const {
  getServicios,
  getServicioById,
} = require("../controllers/serviciosController");

router.get("/", getServicios);
router.get("/:id", getServicioById);

module.exports = router;
