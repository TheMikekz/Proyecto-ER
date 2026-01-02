const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

class GoogleCalendarService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Si tienes tokens guardados, cargarlos
    this.loadTokens();
  }

  loadTokens() {
    try {
      const tokenPath = path.join(__dirname, "../../google-tokens.json");
      if (fs.existsSync(tokenPath)) {
        const tokens = JSON.parse(fs.readFileSync(tokenPath, "utf-8"));
        this.oauth2Client.setCredentials(tokens);
      }
    } catch (error) {
      console.log("No hay tokens guardados, necesita autenticación");
    }
  }

  saveTokens(tokens) {
    const tokenPath = path.join(__dirname, "../../google-tokens.json");
    fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
    this.oauth2Client.setCredentials(tokens);
  }

  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
      ],
    });
  }

  async getTokensFromCode(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.saveTokens(tokens);
    return tokens;
  }

  async createCalendarEvent(eventData) {
    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    const {
      cliente_nombre,
      cliente_email,
      servicio_nombre,
      fecha,
      hora,
      duracion_minutos,
      abogado_email,
    } = eventData;

    // Normalizar fecha a YYYY-MM-DD
    let fechaISO;

    if (fecha instanceof Date) {
      fechaISO = fecha.toISOString().split("T")[0];
    } else if (typeof fecha === "string" && fecha.includes("T")) {
      fechaISO = fecha.split("T")[0];
    } else {
      fechaISO = fecha;
    }

    // Normalizar hora a HH:mm
    const horaISO = typeof hora === "string" ? hora.substring(0, 5) : hora;

    console.log("📅 Fecha normalizada:", fechaISO);
    console.log("🕐 Hora normalizada:", horaISO);

    // Construir fecha/hora válida
    const fechaHoraInicio = new Date(`${fechaISO}T${horaISO}:00`);

    if (isNaN(fechaHoraInicio.getTime())) {
      throw new Error(
        `Fecha u hora inválida -> fecha: ${fechaISO}, hora: ${horaISO}`
      );
    }

    const fechaHoraFin = new Date(
      fechaHoraInicio.getTime() + duracion_minutos * 60000
    );

    const event = {
      summary: `Consulta: ${servicio_nombre}`,
      description: `Consulta con ${cliente_nombre}\nServicio: ${servicio_nombre}`,
      location: "Google Meet",
      start: {
        dateTime: fechaHoraInicio.toISOString(),
        timeZone: "America/Santiago",
      },
      end: {
        dateTime: fechaHoraFin.toISOString(),
        timeZone: "America/Santiago",
      },
      attendees: [{ email: cliente_email }, { email: abogado_email }],
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 1 día antes
          { method: "popup", minutes: 30 }, // 30 min antes
        ],
      },
    };

    try {
      const response = await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
        conferenceDataVersion: 1,
        resource: event,
        sendUpdates: "all",
      });

      return {
        eventId: response.data.id,
        meetLink: response.data.hangoutLink,
        htmlLink: response.data.htmlLink,
      };
    } catch (error) {
      console.error("Error al crear evento en Google Calendar:", error);
      throw error;
    }
  }

  async updateCalendarEvent(eventId, updates) {
    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    try {
      const response = await calendar.events.patch({
        calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
        eventId: eventId,
        resource: updates,
        sendUpdates: "all",
      });

      return response.data;
    } catch (error) {
      console.error("Error al actualizar evento:", error);
      throw error;
    }
  }

  async deleteCalendarEvent(eventId) {
    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    try {
      await calendar.events.delete({
        calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
        eventId: eventId,
        sendUpdates: "all",
      });

      return { success: true };
    } catch (error) {
      console.error("Error al eliminar evento:", error);
      throw error;
    }
  }

  async listEvents(timeMin, timeMax) {
    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    try {
      const response = await calendar.events.list({
        calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax,
        singleEvents: true,
        orderBy: "startTime",
      });

      return response.data.items;
    } catch (error) {
      console.error("Error al listar eventos:", error);
      throw error;
    }
  }
}

module.exports = new GoogleCalendarService();
