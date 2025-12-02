-- Add guest appointment fields to appointments table
ALTER TABLE appointments
  ADD COLUMN is_guest_appointment BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN guest_name VARCHAR(255),
  ADD COLUMN guest_email VARCHAR(255),
  ADD COLUMN guest_phone VARCHAR(50),
  ADD COLUMN guest_purpose TEXT,
  ADD COLUMN guest_organization VARCHAR(255);

-- Make clientId and picId nullable for guest appointments
ALTER TABLE appointments
  ALTER COLUMN client_id DROP NOT NULL,
  ALTER COLUMN pic_id DROP NOT NULL;

-- Add index for guest appointments
CREATE INDEX idx_appointments_is_guest ON appointments(is_guest_appointment);
CREATE INDEX idx_appointments_guest_email ON appointments(guest_email);
