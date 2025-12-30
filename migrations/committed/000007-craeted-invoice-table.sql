--! Previous: sha1:5a16237e7998eaf6c5a7492506c85810fc591ca3
--! Hash: sha1:fa63fd109eec3c9b89679cb1a85ed95b2cd4e8ee
--! Message: craeted-invoice-table

-- Enter migration here
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE,
  invoice_number TEXT NOT NULL UNIQUE,
  base_amount numeric(10,2) NOT NULL,
  tax_amount numeric(10,2) NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  pdf_path TEXT NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT fk_invoice_booking
    FOREIGN KEY (booking_id)
    REFERENCES bookings(id)
    ON DELETE CASCADE
);
