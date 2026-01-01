const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Importar rutas
const authRoutes = require("./routes/auth");
const serviciosRoutes = require("./routes/servicios");
const abogadosRoutes = require("./routes/abogados");
const agendamientosRoutes = require("./routes/agendamientos");
const bloqueosRoutes = require("./routes/bloqueos");

// Usar rutas
app.use("/api/auth", authRoutes);
app.use("/api/servicios", serviciosRoutes);
app.use("/api/abogados", abogadosRoutes);
app.use("/api/agendamientos", agendamientosRoutes);
app.use("/api/bloqueos", bloqueosRoutes);

// Ruta de prueba
app.get("/api/test", (req, res) => {
  res.json({ message: "🚀 Backend funcionando correctamente" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
