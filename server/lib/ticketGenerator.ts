import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";

export interface TicketData {
  pnr: string;
  customerName: string;
  contactEmail: string;
  route: {
    from: string;
    to: string;
    fromCode: string;
    toCode: string;
    departureDate: string;
    departureTime?: string;
    arrivalTime?: string;
  };
  passengers: Array<{
    title: string;
    firstName: string;
    lastName: string;
    seatNumber?: string;
  }>;
  totalAmount: number;
  currency: string;
  bookingDate: string;
  airline?: string;
  flightNumber?: string;
  gate?: string;
  terminal?: string;
  checkInTime?: string;
  boardingTime?: string;
}

export class TicketGenerator {
  private static readonly TICKETS_DIR = path.join(
    process.cwd(),
    "public",
    "tickets",
  );

  /**
   * Initialize tickets directory
   */
  private static initializeTicketsDirectory(): void {
    if (!fs.existsSync(this.TICKETS_DIR)) {
      fs.mkdirSync(this.TICKETS_DIR, { recursive: true });
    }
  }

  /**
   * Generate a professional airline ticket PDF
   */
  static async generateTicketPDF(ticketData: TicketData): Promise<string> {
    this.initializeTicketsDirectory();

    const fileName = `${ticketData.pnr}.pdf`;
    const filePath = path.join(this.TICKETS_DIR, fileName);
    const publicUrl = `/tickets/${fileName}`;

    return new Promise((resolve, reject) => {
      try {
        // Create PDF document
        const doc = new PDFDocument({
          size: "A4",
          margin: 40,
          info: {
            Title: `E-Ticket - ${ticketData.pnr}`,
            Subject: "OnboardTicket E-Ticket",
            Author: "OnboardTicket",
            Creator: "OnboardTicket",
            Producer: "OnboardTicket",
          },
        });

        // Stream to file
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Colors
        const primaryColor = "#505BFB";
        const secondaryColor = "#878EFF";
        const accentColor = "#C6FF9A";
        const textColor = "#20242A";
        const lightGray = "#F6F6FF";

        // Header with company branding
        this.addHeader(doc, primaryColor, accentColor);

        // Title
        doc
          .fontSize(24)
          .fillColor(primaryColor)
          .text("E-TICKET RECEIPT", 40, 120, { align: "center" })
          .fontSize(14)
          .fillColor(textColor)
          .text("Electronic Ticket Confirmation", 40, 150, { align: "center" });

        // Booking reference section
        doc
          .rect(40, 180, 515, 60)
          .fillAndStroke(lightGray, primaryColor)
          .fillColor(primaryColor)
          .fontSize(16)
          .text("BOOKING REFERENCE", 50, 195)
          .fontSize(24)
          .text(ticketData.pnr, 50, 215);

        // Flight details section
        let yPos = 260;
        doc
          .fillColor(primaryColor)
          .fontSize(16)
          .text("FLIGHT DETAILS", 40, yPos);

        yPos += 30;
        doc.rect(40, yPos, 515, 140).stroke(primaryColor);

        // Route info
        doc
          .fillColor(textColor)
          .fontSize(14)
          .text("FROM", 60, yPos + 20)
          .fontSize(18)
          .fillColor(primaryColor)
          .text(ticketData.route.fromCode, 60, yPos + 40)
          .fontSize(12)
          .fillColor(textColor)
          .text(ticketData.route.from, 60, yPos + 65, { width: 150 });

        // Arrow
        doc
          .fontSize(20)
          .fillColor(secondaryColor)
          .text("→", 270, yPos + 40);

        // Destination
        doc
          .fillColor(textColor)
          .fontSize(14)
          .text("TO", 350, yPos + 20)
          .fontSize(18)
          .fillColor(primaryColor)
          .text(ticketData.route.toCode, 350, yPos + 40)
          .fontSize(12)
          .fillColor(textColor)
          .text(ticketData.route.to, 350, yPos + 65, { width: 150 });

        // Date and time info
        yPos += 85;
        doc
          .fontSize(12)
          .fillColor(textColor)
          .text(
            `Departure: ${new Date(ticketData.route.departureDate).toLocaleDateString()}`,
            60,
            yPos,
          )
          .text(
            `Departure Time: ${ticketData.route.departureTime || "TBA"}`,
            60,
            yPos + 15,
          )
          .text(
            `Arrival Time: ${ticketData.route.arrivalTime || "TBA"}`,
            60,
            yPos + 30,
          );

        // Flight info
        if (ticketData.airline || ticketData.flightNumber) {
          doc
            .text(`Airline: ${ticketData.airline || "TBA"}`, 300, yPos)
            .text(`Flight: ${ticketData.flightNumber || "TBA"}`, 300, yPos + 15)
            .text(`Gate: ${ticketData.gate || "TBA"}`, 300, yPos + 30);
        }

        // Passenger details
        yPos += 70;
        doc
          .fillColor(primaryColor)
          .fontSize(16)
          .text("PASSENGER DETAILS", 40, yPos);

        yPos += 30;
        const passengerHeight = 30 + ticketData.passengers.length * 25;
        doc.rect(40, yPos, 515, passengerHeight).stroke(primaryColor);

        doc
          .fillColor(textColor)
          .fontSize(12)
          .text("Name", 60, yPos + 15)
          .text("Seat", 400, yPos + 15);

        ticketData.passengers.forEach((passenger, index) => {
          const passengerY = yPos + 40 + index * 25;
          doc
            .text(
              `${passenger.title} ${passenger.firstName} ${passenger.lastName}`,
              60,
              passengerY,
            )
            .text(passenger.seatNumber || "TBA", 400, passengerY);
        });

        // Payment details
        yPos += passengerHeight + 30;
        doc
          .fillColor(primaryColor)
          .fontSize(16)
          .text("PAYMENT DETAILS", 40, yPos);

        yPos += 30;
        doc.rect(40, yPos, 515, 80).stroke(primaryColor);

        doc
          .fillColor(textColor)
          .fontSize(12)
          .text("Total Amount Paid:", 60, yPos + 20)
          .fontSize(18)
          .fillColor(primaryColor)
          .text(
            `${ticketData.currency} ${ticketData.totalAmount}`,
            60,
            yPos + 40,
          )
          .fontSize(12)
          .fillColor(textColor)
          .text(
            `Booking Date: ${new Date(ticketData.bookingDate).toLocaleDateString()}`,
            300,
            yPos + 30,
          );

        // Important information
        yPos += 110;
        doc
          .fillColor(primaryColor)
          .fontSize(14)
          .text("IMPORTANT INFORMATION", 40, yPos);

        yPos += 25;
        const importantInfo = [
          "• Please arrive at the airport at least 2 hours before domestic flights and 3 hours before international flights",
          "• Check-in online 24 hours before departure to save time",
          "• Ensure you have valid identification and travel documents",
          "• Review baggage allowance and restrictions on our website",
          "• Contact customer service for any changes or cancellations",
        ];

        doc.fontSize(10).fillColor(textColor);

        importantInfo.forEach((info, index) => {
          doc.text(info, 40, yPos + index * 15, { width: 515 });
        });

        // Footer
        yPos += 110;
        doc.rect(40, yPos, 515, 60).fillAndStroke(lightGray, primaryColor);

        doc
          .fontSize(12)
          .fillColor(primaryColor)
          .text("Thank you for choosing OnboardTicket!", 40, yPos + 15, {
            align: "center",
          })
          .fontSize(10)
          .fillColor(textColor)
          .text(
            "For support, visit www.onboardticket.com or call our 24/7 helpline",
            40,
            yPos + 35,
            { align: "center" },
          );

        // Generate QR Code for ticket verification
        const ticketViewUrl = `${process.env.CLIENT_URL || "https://onboardticket.com"}/guest-booking-lookup?pnr=${ticketData.pnr}&email=${encodeURIComponent(ticketData.contactEmail || ticketData.customerName)}`;

        try {
          // Generate QR code as data URL
          const qrCodeDataUrl = await QRCode.toDataURL(ticketViewUrl, {
            width: 60,
            margin: 1,
            color: {
              dark: primaryColor,
              light: '#FFFFFF'
            }
          });

          // Convert data URL to buffer for PDF
          const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');

          // Add QR code to PDF
          doc.image(qrCodeBuffer, 480, 180, { width: 60, height: 60 });

          // Add label below QR code
          doc
            .fontSize(8)
            .fillColor(textColor)
            .text("Scan to view", 485, 245, { width: 50, align: 'center' })
            .text("ticket details", 485, 255, { width: 50, align: 'center' });
        } catch (qrError) {
          console.error("❌ Error generating QR code:", qrError);
          // Fallback to text if QR generation fails
          doc
            .rect(480, 180, 60, 60)
            .stroke(primaryColor)
            .fontSize(8)
            .fillColor(textColor)
            .text("QR CODE", 485, 205, { width: 50, align: 'center' })
            .text("ERROR", 485, 215, { width: 50, align: 'center' });
        }

        // Finalize PDF
        doc.end();

        stream.on("finish", () => {
          console.log(`✅ Ticket PDF generated: ${publicUrl}`);
          resolve(publicUrl);
        });

        stream.on("error", (error) => {
          console.error("❌ Error generating ticket PDF:", error);
          reject(error);
        });
      } catch (error) {
        console.error("❌ Error creating ticket PDF:", error);
        reject(error);
      }
    });
  }

  /**
   * Add header with branding
   */
  private static addHeader(
    doc: PDFKit.PDFDocument,
    primaryColor: string,
    accentColor: string,
  ): void {
    // Header background
    doc.rect(0, 0, 595, 100).fillAndStroke(primaryColor, primaryColor);

    // Company name
    doc.fontSize(28).fillColor("white").text("OnboardTicket", 40, 35);

    // Accent decoration
    doc.rect(450, 30, 100, 40).fillAndStroke(accentColor, accentColor);

    doc.fillColor(primaryColor).fontSize(14).text("✈️ FLY", 460, 45);
  }

  /**
   * Generate ticket and return the public URL
   */
  static async createTicket(bookingData: any): Promise<string> {
    const ticketData: TicketData = {
      pnr: bookingData.pnr,
      customerName: bookingData.contactEmail, // Using email as customer identifier
      route: {
        from: bookingData.route.from,
        to: bookingData.route.to,
        fromCode: bookingData.route.fromCode,
        toCode: bookingData.route.toCode,
        departureDate: bookingData.route.departureDate,
        departureTime: bookingData.route.departureTime,
        arrivalTime: bookingData.route.arrivalTime,
      },
      passengers: bookingData.passengers.map((p: any) => ({
        title: p.title,
        firstName: p.firstName,
        lastName: p.lastName,
        seatNumber: p.seatNumber,
      })),
      totalAmount: bookingData.totalAmount,
      currency: bookingData.currency || "USD",
      bookingDate: new Date().toISOString(),
      airline: bookingData.airline,
      flightNumber: bookingData.flightNumber,
      gate: bookingData.gate,
      terminal: bookingData.terminal,
      checkInTime: bookingData.checkInTime,
      boardingTime: bookingData.boardingTime,
    };

    return await this.generateTicketPDF(ticketData);
  }

  /**
   * Delete a ticket file
   */
  static deleteTicket(pnr: string): boolean {
    try {
      const filePath = path.join(this.TICKETS_DIR, `${pnr}.pdf`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Ticket deleted: ${pnr}.pdf`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("❌ Error deleting ticket:", error);
      return false;
    }
  }
}

export default TicketGenerator;
