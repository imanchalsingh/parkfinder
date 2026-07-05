import PDFDocument from "pdfkit";

export const generateBookingReceiptPDF = (booking, user, res) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });

      // Pipe the document to the response directly
      doc.pipe(res);

      // Add Content to PDF
      generateHeader(doc);
      generateCustomerInformation(doc, booking, user);
      generateBookingDetails(doc, booking);
      generatePaymentSummary(doc, booking);
      generateFooter(doc);

      doc.end();
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

function generateHeader(doc) {
  doc
    .fillColor("#1B42CB")
    .fontSize(24)
    .text("SmartPark", 50, 50)
    .fillColor("#444444")
    .fontSize(10)
    .text("Official Booking Receipt", 50, 80)
    .text("contact@smartpark.com", 50, 95)
    .moveDown();
}

function generateCustomerInformation(doc, booking, user) {
  doc
    .fillColor("#444444")
    .fontSize(14)
    .text("Customer Information", 50, 140);
    
  doc.strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, 155)
    .lineTo(550, 155)
    .stroke();

  const customerTop = 170;
  
  doc
    .fontSize(10)
    .text("Receipt Number:", 50, customerTop)
    .font("Helvetica-Bold")
    .text(booking._id.toString(), 150, customerTop)
    .font("Helvetica")
    .text("Booking Date:", 50, customerTop + 15)
    .text(new Date(booking.bookingDate || booking.createdAt || Date.now()).toLocaleString(), 150, customerTop + 15)
    
    .text("Name:", 300, customerTop)
    .font("Helvetica-Bold")
    .text(user.name || "N/A", 350, customerTop)
    .font("Helvetica")
    .text("Email:", 300, customerTop + 15)
    .text(user.email || "N/A", 350, customerTop + 15);
    
  doc.moveDown();
}

function generateBookingDetails(doc, booking) {
  const detailsTop = 230;
  
  doc
    .fontSize(14)
    .text("Parking Details", 50, detailsTop);
    
  doc.strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, detailsTop + 15)
    .lineTo(550, detailsTop + 15)
    .stroke();

  const parking = booking.parkingId || {};
  
  doc
    .fontSize(10)
    .text("Location Name:", 50, detailsTop + 30)
    .font("Helvetica-Bold")
    .text(parking.name || "Unknown", 150, detailsTop + 30)
    .font("Helvetica")
    .text("Address:", 50, detailsTop + 45)
    .text(parking.location || "N/A", 150, detailsTop + 45)
    
    .text("Duration:", 50, detailsTop + 60)
    .text(`${booking.duration || 1} hours`, 150, detailsTop + 60)
    
    .text("Status:", 300, detailsTop + 30)
    .font("Helvetica-Bold")
    .fillColor(booking.bookingStatus === 'completed' ? 'green' : booking.bookingStatus === 'cancelled' ? 'red' : 'blue')
    .text(booking.bookingStatus ? booking.bookingStatus.toUpperCase() : "N/A", 350, detailsTop + 30)
    .fillColor("#444444")
    .font("Helvetica");
}

function generatePaymentSummary(doc, booking) {
  const summaryTop = 330;
  
  doc
    .fontSize(14)
    .text("Payment Summary", 50, summaryTop);
    
  doc.strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, summaryTop + 15)
    .lineTo(550, summaryTop + 15)
    .stroke();

  const parking = booking.parkingId || {};
  const rate = parking.pricePerHour || 0;
  const duration = booking.duration || 1;
  const subtotal = rate * duration;
  const taxes = subtotal * 0.18; // 18% generic tax
  const total = booking.totalPrice || (subtotal + taxes);

  doc
    .fontSize(10)
    .text("Rate per Hour:", 50, summaryTop + 30)
    .text(`Rs. ${rate.toFixed(2)}`, 450, summaryTop + 30, { width: 100, align: "right" })
    
    .text("Subtotal:", 50, summaryTop + 45)
    .text(`Rs. ${subtotal.toFixed(2)}`, 450, summaryTop + 45, { width: 100, align: "right" })
    
    .text("Taxes (18%):", 50, summaryTop + 60)
    .text(`Rs. ${taxes.toFixed(2)}`, 450, summaryTop + 60, { width: 100, align: "right" });
    
  doc.strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(400, summaryTop + 80)
    .lineTo(550, summaryTop + 80)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("Total Paid:", 50, summaryTop + 90)
    .text(`Rs. ${total.toFixed(2)}`, 450, summaryTop + 90, { width: 100, align: "right" })
    .font("Helvetica");
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      "Payment is processed securely. Thank you for choosing SmartPark.",
      50,
      700,
      { align: "center", width: 500 }
    )
    .text(
      "For queries, visit our Contact Support page.",
      50,
      715,
      { align: "center", width: 500 }
    );
}
