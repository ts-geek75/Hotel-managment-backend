--! Previous: sha1:cfab821cf8edc66ad598de592edd0a6a5237dd76
--! Hash: sha1:e957921c23697d4c8dbb6ed5419a0280d75c3fa3
--! Message: Booking_Table_Ceated

-- Enter migration here

CREATE EXTENSION IF NOT EXISTS btree_gist;


CREATE TYPE booking_status AS ENUM (
  'booked',
  'checked_in',
  'checked_out',
  'cancelled'
);

CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  room_id uuid NOT NULL
    REFERENCES rooms(id)
    ON DELETE RESTRICT,

  user_id uuid NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  check_in_date date NOT NULL,
  check_out_date date NOT NULL,

  status booking_status NOT NULL DEFAULT 'booked',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CHECK (check_out_date > check_in_date)
);

CREATE INDEX IF NOT EXISTS bookings_room_id_idx
ON bookings (room_id);

CREATE INDEX IF NOT EXISTS bookings_date_idx
ON bookings (check_in_date, check_out_date);

CREATE INDEX IF NOT EXISTS bookings_status_idx
ON bookings (status);

ALTER TABLE bookings
ADD CONSTRAINT no_overlapping_bookings
EXCLUDE USING gist (
  room_id WITH =,
  daterange(check_in_date, check_out_date, '[]') WITH &&
)
WHERE (status IN ('booked', 'checked_in'));
