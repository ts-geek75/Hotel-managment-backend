import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateInvoicePDF = async (invoice: any) => {
  const doc = new PDFDocument({ margin: 50 });

  const pdfPath = path.join(process.cwd(), `invoices/${invoice.invoice_number}.pdf`);
  doc.pipe(fs.createWriteStream(pdfPath));

  doc.fontSize(20).text("Invoice", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Invoice Number: ${invoice.invoice_number}`);
  doc.text(`Booking ID: ${invoice.booking_id}`);
  doc.text(`Base Amount: ₹${invoice.base_amount}`);
  doc.text(`Tax Amount: ₹${invoice.tax_amount}`);
  doc.text(`Total Amount: ₹${invoice.total_amount}`);
  doc.moveDown();

  doc.text("Thank you for your booking!", { align: "center" });

  doc.end();

  return pdfPath;
};
