--! Previous: sha1:0f5812962e9e885fef2c6535ce9b35da79feb0bf
--! Hash: sha1:cfab821cf8edc66ad598de592edd0a6a5237dd76
--! Message: Rooms_Table_careted

-- Enter migration here

CREATE TYPE room_type AS ENUM (
  'single',
  'double',
  'deluxe'
);
CREATE TYPE room_status AS ENUM (
  'available',
  'booked',
  'maintenance'
);

DROP TABLE IF EXISTS rooms;


CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number integer NOT NULL UNIQUE,
  type room_type NOT NULL,
  price_per_night numeric(10, 2) NOT NULL CHECK (price_per_night > 0),
  status room_status NOT NULL DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rooms_status_idx
ON rooms (status);

CREATE INDEX IF NOT EXISTS rooms_status_price_idx
ON rooms (status, price_per_night);

CREATE INDEX IF NOT EXISTS rooms_type_idx
ON rooms (type);
