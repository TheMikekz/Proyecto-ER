const express = require("express");
const cors = require("cors");
require("dotenv").config();
const googleCalendarService = require("./services/googleCalendarService");

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

// ================================
// Google Calendar OAuth (SOLO 1 VEZ)
// ================================

// Iniciar autenticación con Google
app.get("/api/google/auth", (req, res) => {
  const url = googleCalendarService.getAuthUrl();
  res.redirect(url);
});

// Callback de Google OAuth
app.get("/api/google/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send("No se recibió el código de Google");
  }

  try {
    await googleCalendarService.getTokensFromCode(code);
    res.send(
      "✅ Google Calendar conectado correctamente. Ya puedes cerrar esta ventana."
    );
  } catch (error) {
    console.error("❌ Error OAuth Google:", error);
    res.status(500).send("Error al conectar Google Calendar");
  }
});

// Ruta de prueba
app.get("/api/test", (req, res) => {
  res.json({ message: "🚀 Backend funcionando correctamente" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
