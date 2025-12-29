--! Previous: sha1:e957921c23697d4c8dbb6ed5419a0280d75c3fa3
--! Hash: sha1:69b2c8c585ebc4fac825603f5e103e7d54c17722
--! Message: Alter Rooms table 

-- Enter migration here
ALTER TABLE rooms
ALTER COLUMN updated_at SET DEFAULT now();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_room
BEFORE UPDATE ON rooms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
