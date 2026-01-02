const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendConfirmationEmail(agendamientoData) {
    const {
      cliente_nombre,
      cliente_email,
      servicio_nombre,
      abogado_nombre,
      fecha,
      hora,
      meetLink,
    } = agendamientoData;

    const fechaFormateada = new Date(fecha + "T00:00:00").toLocaleDateString(
      "es-CL",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6b7c3d 0%, #8a9a5b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #6b7c3d; border-radius: 5px; }
          .info-item { margin: 10px 0; }
          .info-label { font-weight: bold; color: #6b7c3d; }
          .button { display: inline-block; padding: 15px 30px; background: #6b7c3d; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Cita Confirmada</h1>
            <p>Simple y Legal</p>
          </div>
          <div class="content">
            <p>Hola <strong>${cliente_nombre}</strong>,</p>
            <p>Tu cita ha sido confirmada exitosamente. Aquí están los detalles:</p>
            
            <div class="info-box">
              <div class="info-item">
                <span class="info-label">📋 Servicio:</span> ${servicio_nombre}
              </div>
              <div class="info-item">
                <span class="info-label">👨‍⚖️ Abogado:</span> ${abogado_nombre}
              </div>
              <div class="info-item">
                <span class="info-label">📅 Fecha:</span> ${fechaFormateada}
              </div>
              <div class="info-item">
                <span class="info-label">🕐 Hora:</span> ${hora.substring(
                  0,
                  5
                )} hrs
              </div>
            </div>

            ${
              meetLink
                ? `
              <div style="text-align: center;">
                <p><strong>La reunión será por videollamada:</strong></p>
                <a href="${meetLink}" class="button">📹 Unirse a Google Meet</a>
                <p style="font-size: 12px; color: #666;">
                  También puedes copiar este enlace: <br>
                  <a href="${meetLink}">${meetLink}</a>
                </p>
              </div>
            `
                : ""
            }

            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0;"><strong>⏰ Recordatorio:</strong> Te enviaremos un recordatorio 24 horas antes de tu cita.</p>
            </div>

            <p>Si necesitas reprogramar o cancelar, por favor contáctanos lo antes posible.</p>
          </div>
          <div class="footer">
            <p>Simple y Legal - Asesoría Legal Profesional</p>
            <p>📧 er.polanco@simpleylegal.cl | 📞 +56 9 4860 8996</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: cliente_email,
      subject: `✓ Cita confirmada - ${fechaFormateada} ${hora.substring(0, 5)}`,
      html: htmlContent,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("✅ Email enviado:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Error al enviar email:", error);
      throw error;
    }
  }

  async sendCancellationEmail(agendamientoData) {
    const { cliente_nombre, cliente_email, fecha, hora } = agendamientoData;

    const fechaFormateada = new Date(fecha + "T00:00:00").toLocaleDateString(
      "es-CL",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✕ Cita Cancelada</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${cliente_nombre}</strong>,</p>
            <p>Tu cita programada para el <strong>${fechaFormateada}</strong> a las <strong>${hora.substring(
      0,
      5
    )}</strong> ha sido cancelada.</p>
            <p>Si deseas reagendar, puedes hacerlo a través de nuestra página web.</p>
            <p>📧 er.polanco@simpleylegal.cl | 📞 +56 9 4860 8996</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: cliente_email,
      subject: `✕ Cita cancelada - ${fechaFormateada}`,
      html: htmlContent,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error("Error al enviar email de cancelación:", error);
      throw error;
    }
  }
}

module.exports = new EmailService();
