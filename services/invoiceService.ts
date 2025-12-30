import "dotenv/config";
import { Pool, PoolClient } from "pg";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const pool = new Pool({
  connectionString: process.env.ROOT_DATABASE_URL,
});

export const createInvoiceForBooking = async (
  bookingId: string,
  client: Pool | PoolClient = pool 
) => {
  const existing = await client.query(
    "SELECT id, pdf_path FROM public.invoices WHERE booking_id = $1",
    [bookingId]
  );

  if (existing.rowCount && existing.rowCount > 0) {
    return existing.rows[0];
  }

  const result = await client.query(
    `
    SELECT
      b.id,
      b.status,
      b.check_in_date,
      b.check_out_date,
      r.price_per_night
    FROM public.bookings b
    JOIN public.rooms r ON r.id = b.room_id
    WHERE b.id = $1
    `,
    [bookingId]
  );

  const booking = result.rows[0];
  if (!booking) throw new Error("Booking not found");

  let baseAmount = 0;
  if (booking.status === "checked_out" || booking.status === "cancelled") {
    const start = new Date(booking.check_in_date).getTime();
    const end = new Date(booking.check_out_date).getTime();
    const diffInMs = Math.abs(end - start);
    const nights = Math.max(1, Math.ceil(diffInMs / (1000 * 60 * 60 * 24)));
    baseAmount = nights * Number(booking.price_per_night || 0);
  }

  const taxAmount = baseAmount * 0.12;
  const totalAmount = baseAmount + taxAmount;
  const invoiceNumber = `INV-${Date.now()}`;

  // --- PDF Generation ---
  const invoicesDir = path.join(process.cwd(), "invoices");
  if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir);

  const pdfFileName = `${invoiceNumber}.pdf`;
  const pdfPath = path.join(invoicesDir, pdfFileName);

  // const doc = new PDFDocument();
  // doc.pipe(fs.createWriteStream(pdfPath));

  // doc.fontSize(20).text("Invoice", { align: "center" });
  // doc.moveDown();
  // doc.fontSize(12).text(`Invoice Number: ${invoiceNumber}`);
  // doc.text(`Booking ID: ${bookingId}`);
  // doc.text(`Status: ${booking.status}`);
  // doc.text(`Check-in: ${booking.check_in_date}`);
  // doc.text(`Check-out: ${booking.check_out_date}`);
  // doc.text(`Base Amount: $${baseAmount.toFixed(2)}`);
  // doc.text(`Tax (12%): $${taxAmount.toFixed(2)}`);
  // doc.text(`Total Amount: $${totalAmount.toFixed(2)}`);

  // doc.end();

  const insert = await client.query(
    `
    INSERT INTO public.invoices
      (booking_id, invoice_number, base_amount, tax_amount, total_amount, pdf_path)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [
      bookingId,
      invoiceNumber,
      baseAmount,
      taxAmount,
      totalAmount,
      pdfPath, // Save the real path of the PDF
    ]
  );

  return insert.rows[0];
};
