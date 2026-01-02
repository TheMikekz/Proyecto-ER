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

    let fechaObj;
    if (fecha instanceof Date) {
      fechaObj = fecha;
    } else if (typeof fecha === "string") {
      const [year, month, day] = fecha.split("-");
      fechaObj = new Date(year, month - 1, day);
    } else {
      fechaObj = new Date(fecha);
    }

    let fechaFormateada = fechaObj.toLocaleDateString("es-CL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Capitalizar primera letra
    fechaFormateada =
      fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #1f2937;
            background-color: #f3f4f6;
            padding: 20px;
          }
          .email-wrapper { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #6b7c3d 0%, #8a9a5b 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .header-icon {
  width: 64px;
  height: 64px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: inline-block;
  margin-bottom: 16px;
  line-height: 64px;
  text-align: center;
}
.header-icon-inner {
  display: inline-block;
  width: 40px;
  height: 40px;
  background-color: white;
  border-radius: 50%;
  line-height: 40px;
  text-align: center;
  font-size: 20px;
  vertical-align: middle;
}
          .header h1 { 
            color: white; 
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          .header p { 
            color: rgba(255, 255, 255, 0.9); 
            font-size: 16px;
            font-weight: 500;
          }
          .content { 
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 16px;
            color: #1f2937;
          }
          .greeting strong {
            color: #6b7c3d;
            font-weight: 600;
          }
          .intro-text {
            color: #6b7280;
            margin-bottom: 32px;
            font-size: 15px;
          }
          .details-card { 
            background: #f9fafb;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 32px;
          }
          .details-title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid #e5e7eb;
          }
          .detail-row {
            display: flex;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }
          .detail-icon {
            font-size: 20px;
            margin-right: 12px;
            min-width: 24px;
          }
          .detail-content {
            flex: 1;
          }
          .detail-label { 
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          .detail-value {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
          }
          .meet-section {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 2px solid #bae6fd;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin-bottom: 24px;
          }
          .meet-title {
            font-size: 16px;
            font-weight: 600;
            color: #0c4a6e;
            margin-bottom: 16px;
          }
          .meet-button { 
            display: inline-block;
            padding: 14px 32px;
            background: #4285F4;
            color: white !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            margin-bottom: 12px;
            transition: background 0.2s;
          }
          .meet-button:hover {
            background: #3367d6;
          }
          .meet-link-text {
            font-size: 13px;
            color: #64748b;
            margin-top: 12px;
          }
          .meet-link {
            color: #4285F4 !important;
            text-decoration: none;
            word-break: break-all;
            font-size: 12px;
          }
          .alert-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 24px;
          }
          .alert-content {
            display: flex;
            align-items: start;
            gap: 12px;
          }
          .alert-icon {
            font-size: 20px;
            flex-shrink: 0;
          }
          .alert-text {
            font-size: 14px;
            color: #92400e;
            line-height: 1.5;
          }
          .alert-text strong {
            font-weight: 600;
          }
          .footer-text {
            font-size: 14px;
            color: #6b7280;
            line-height: 1.6;
          }
          .footer { 
            background: #f9fafb;
            padding: 32px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer-brand {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
          }
          .footer-tagline {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 16px;
          }
          .footer-contact {
  display: block;
  text-align: center;
  margin-top: 16px;
  line-height: 2;
}
          .contact-item {
  display: inline-block;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.8;
}
          .divider {
            height: 1px;
            background: #e5e7eb;
            margin: 24px 0;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <div class="header-icon">
              <div class="header-icon-inner">✓</div>
            </div>
            <h1>Cita Confirmada</h1>
            <p>Simple y Legal</p>
          </div>
          
          <div class="content">
            <p class="greeting">Hola <strong>${cliente_nombre}</strong>,</p>
            <p class="intro-text">Tu cita ha sido confirmada exitosamente. A continuación encontrarás todos los detalles:</p>
            
            <div class="details-card">
              <div class="details-title">📋 Detalles de tu Cita</div>
              
              <div class="detail-row">
                <div class="detail-icon">⚖️</div>
                <div class="detail-content">
                  <div class="detail-label">Servicio</div>
                  <div class="detail-value">${servicio_nombre}</div>
                </div>
              </div>
              
              <div class="detail-row">
                <div class="detail-icon">👨‍💼</div>
                <div class="detail-content">
                  <div class="detail-label">Abogado</div>
                  <div class="detail-value">${abogado_nombre}</div>
                </div>
              </div>
              
              <div class="detail-row">
                <div class="detail-icon">📅</div>
                <div class="detail-content">
                  <div class="detail-label">Fecha</div>
                  <div class="detail-value">${fechaFormateada}</div>
                </div>
              </div>
              
              <div class="detail-row">
                <div class="detail-icon">🕐</div>
                <div class="detail-content">
                  <div class="detail-label">Hora</div>
                  <div class="detail-value">${hora.substring(0, 5)} hrs</div>
                </div>
              </div>
            </div>

            ${
              meetLink
                ? `
            <div class="meet-section">
              <div class="meet-title">🎥 Reunión Virtual</div>
              <a href="${meetLink}" class="meet-button">Unirse a Google Meet</a>
              <div class="meet-link-text">
                O copia este enlace:<br>
                <a href="${meetLink}" class="meet-link">${meetLink}</a>
              </div>
            </div>
            `
                : ""
            }

            <div class="alert-box">
              <div class="alert-content">
                <div class="alert-icon">⏰</div>
                <div class="alert-text">
                  <strong>Recordatorio:</strong> Te enviaremos una notificación 24 horas antes de tu cita para que no se te olvide.
                </div>
              </div>
            </div>

            <div class="divider"></div>

            <p class="footer-text">
              Si necesitas reprogramar o cancelar tu cita, por favor contáctanos con la mayor anticipación posible.
            </p>
          </div>
          
          <div class="footer">
            <div class="footer-brand">Simple y Legal</div>
            <div class="footer-tagline">Asesoría Legal Profesional</div>
            <div class="footer-contact">
              <div class="contact-item">📧 er.polanco@simpleylegal.cl</div>
              <div class="contact-item">📞 +56 9 4860 8996</div>
            </div>
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

    let fechaObj;
    if (fecha instanceof Date) {
      fechaObj = fecha;
    } else if (typeof fecha === "string") {
      const [year, month, day] = fecha.split("-");
      fechaObj = new Date(year, month - 1, day);
    } else {
      fechaObj = new Date(fecha);
    }

    let fechaFormateada = fechaObj.toLocaleDateString("es-CL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Capitalizar primera letra
    fechaFormateada =
      fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #1f2937;
            background-color: #f3f4f6;
            padding: 20px;
          }
          .email-wrapper { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .header-icon {
  width: 64px;
  height: 64px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: inline-block;
  margin-bottom: 16px;
  line-height: 64px;
  text-align: center;
}
.header-icon-inner {
  display: inline-block;
  width: 40px;
  height: 40px;
  background-color: white;
  border-radius: 50%;
  line-height: 40px;
  text-align: center;
  font-size: 20px;
  vertical-align: middle;
}
          .header h1 { 
            color: white; 
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          .content { 
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 24px;
            color: #1f2937;
          }
          .greeting strong {
            color: #dc2626;
            font-weight: 600;
          }
          .cancel-message {
            background: #fee2e2;
            border-left: 4px solid #dc2626;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 24px;
          }
          .cancel-message p {
            color: #991b1b;
            font-size: 15px;
            line-height: 1.6;
          }
          .cancel-message strong {
            font-weight: 600;
          }
          .info-box {
            background: #f9fafb;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
          }
          .info-text {
            font-size: 15px;
            color: #4b5563;
            line-height: 1.6;
          }
          .divider {
            height: 1px;
            background: #e5e7eb;
            margin: 24px 0;
          }
          .footer { 
            background: #f9fafb;
            padding: 32px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer-brand {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
          }
          .footer-tagline {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 16px;
          }
          .footer-contact {
  display: block;
  text-align: center;
  margin-top: 16px;
  line-height: 2;
}
          .contact-item {
  display: inline-block;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.8;
}
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <div class="header-icon">
              <div class="header-icon-inner">✕</div>
            </div>
            <h1>Cita Cancelada</h1>
          </div>
          
          <div class="content">
            <p class="greeting">Hola <strong>${cliente_nombre}</strong>,</p>
            
            <div class="cancel-message">
              <p>
                Tu cita programada para el <strong>${fechaFormateada}</strong> 
                a las <strong>${hora.substring(
                  0,
                  5
                )} hrs</strong> ha sido cancelada.
              </p>
            </div>

            <div class="info-box">
              <p class="info-text">
                Si deseas reagendar una nueva cita, puedes hacerlo fácilmente 
                a través de nuestra página web o contactándonos directamente.
              </p>
            </div>

            <div class="divider"></div>

            <p class="info-text" style="text-align: center;">
              Estamos aquí para ayudarte en lo que necesites.
            </p>
          </div>
          
          <div class="footer">
            <div class="footer-brand">Simple y Legal</div>
            <div class="footer-tagline">Asesoría Legal Profesional</div>
            <div class="footer-contact">
              <div class="contact-item">📧 er.polanco@simpleylegal.cl</div>
              <div class="contact-item">📞 +56 9 4860 8996</div>
            </div>
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
