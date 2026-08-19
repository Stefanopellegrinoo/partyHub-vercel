import type { Ticket } from "@/types/ticket"
import type { Party } from "@/types/party"
import { api } from "@/lib/axios"
import { formatDate, formatCurrency } from "@/lib/utils"

// Mock email templates
const getTicketEmailTemplate = (ticket: Ticket, party: Party, qrCodeUrl: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Entrada - ${party.name}</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #eee;
        }
        .logo {
          max-width: 150px;
          height: auto;
        }
        .content {
          padding: 20px 0;
        }
        .ticket-info {
          background-color: #f5f5f5;
          border-radius: 6px;
          padding: 15px;
          margin: 20px 0;
        }
        .qr-code {
          text-align: center;
          margin: 30px 0;
        }
        .qr-code img {
          max-width: 200px;
          height: auto;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #999;
          font-size: 12px;
        }
        .button {
          display: inline-block;
          background-color: #4f46e5;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 4px;
          margin: 20px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        table td {
          padding: 8px;
          border-bottom: 1px solid #eee;
        }
        table td:first-child {
          font-weight: bold;
          width: 40%;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Tu entrada está confirmada!</h1>
          <p>Gracias por comprar una entrada para ${party.name}</p>
        </div>
        
        <div class="content">
          <p>Hola ${ticket.customerName || ticket.attendee?.fullName || "Asistente"},</p>
          
          <p>Tu compra ha sido confirmada. A continuación encontrarás los detalles de tu entrada:</p>
          
          <div class="ticket-info">
            <table>
              <tr>
                <td>Evento:</td>
                <td>${party.name}</td>
              </tr>
              <tr>
                <td>Fecha:</td>
                <td>${formatDate(party.date)}</td>
              </tr>
              <tr>
                <td>Ubicación:</td>
                <td>${party.location}</td>
              </tr>
              <tr>
                <td>Tipo de entrada:</td>
                <td>${ticket.batchName}</td>
              </tr>
              <tr>
                <td>Precio:</td>
                <td>${formatCurrency(ticket.price)}</td>
              </tr>
              <tr>
                <td>Fecha de compra:</td>
                <td>${formatDate(ticket.purchaseDate)}</td>
              </tr>
              <tr>
                <td>ID de entrada:</td>
                <td>${ticket.id}</td>
              </tr>
            </table>
          </div>
          
          <p>Por favor, presenta el siguiente código QR en la entrada del evento:</p>
          
          <div class="qr-code">
            <img src="${qrCodeUrl}" alt="Código QR de entrada" />
            <p>Este código QR es tu entrada al evento. No lo compartas con nadie.</p>
          </div>
          
          <p>Si tienes alguna pregunta o necesitas asistencia, por favor contacta al organizador del evento.</p>
          
          <p>¡Esperamos verte pronto!</p>
        </div>
        
        <div class="footer">
          <p>Este correo fue enviado por PartyHub en nombre de los organizadores del evento.</p>
          <p>&copy; ${new Date().getFullYear()} PartyHub. Todos los derechos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Sends a ticket confirmation email with QR code to the customer
 */
export async function sendTicketConfirmationEmail(ticket: Ticket, party: Party, qrCodeUrl: string): Promise<boolean> {
  try {
    // In development without API, just log the email
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_URL) {

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      return true
    }

    // In production, send the actual email
    const response = await api.post("/emails/send-ticket", {
      ticketId: ticket.id,
      partyId: party.id,
      email: ticket.customerEmail || ticket.attendee?.email,
      subject: `Confirmación de Entrada - ${party.name}`,
      html: getTicketEmailTemplate(ticket, party, qrCodeUrl),
    })

    return response.success === true
  } catch (error) {
    console.error("Error sending ticket confirmation email:", error)
    return false
  }
}

/**
 * Sends a batch of ticket confirmation emails
 */
export async function sendBulkTicketEmails(
  tickets: Ticket[],
  party: Party,
  qrCodeUrls: Record<string, string>,
): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  for (const ticket of tickets) {
    if (!ticket.customerEmail && !ticket.attendee?.email) {
      failed++
      continue
    }

    const qrCodeUrl = qrCodeUrls[ticket.id]
    if (!qrCodeUrl) {
      failed++
      continue
    }

    const result = await sendTicketConfirmationEmail(ticket, party, qrCodeUrl)
    if (result) {
      success++
    } else {
      failed++
    }
  }

  return { success, failed }
}

/**
 * Resends a ticket confirmation email
 */
export async function resendTicketEmail(ticketId: string, partyId: string): Promise<boolean> {
  try {
    // In development without API, just log the email
    if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_URL) {

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      return true
    }

    // In production, resend the actual email
    const response = await api.post(`/emails/resend-ticket/${ticketId}`, {
      partyId,
    })

    return response.success === true
  } catch (error) {
    console.error("Error resending ticket email:", error)
    return false
  }
}
