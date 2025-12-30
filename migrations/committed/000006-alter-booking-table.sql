--! Previous: sha1:482eee9a139de8fe272e27ebe4d943a665718fd7
--! Hash: sha1:5a16237e7998eaf6c5a7492506c85810fc591ca3
--! Message: Alter-booking-table

-- Enter migration here
ALTER TABLE bookings
ALTER COLUMN updated_at SET DEFAULT now();

CREATE OR REPLACE FUNCTION update_booking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_booking
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_booking_updated_at();
