-- Enable Realtime dengan Trigger Approach (Recommended)
-- Ini lebih reliable daripada menggunakan publication/postgres_changes

-- Step 1: Pastikan extension realtime sudah ada
CREATE EXTENSION IF NOT EXISTS "realtime";

-- Step 2: Buat function untuk broadcast changes menggunakan pg_notify
-- Broadcast akan dikirim ke channel yang sama dengan conversation_id
CREATE OR REPLACE FUNCTION realtime.broadcast_message_changes()
RETURNS TRIGGER AS $$
DECLARE
  channel_name TEXT;
  payload_data JSONB;
BEGIN
  -- Tentukan channel name berdasarkan conversation_id
  IF TG_OP = 'INSERT' THEN
    channel_name := 'conversation:' || NEW.conversation_id;
    payload_data := jsonb_build_object(
      'type', 'INSERT',
      'table', 'messages',
      'schema', 'public',
      'new', row_to_json(NEW)
    );

    -- Broadcast ke channel menggunakan pg_notify
    PERFORM pg_notify(channel_name, payload_data::text);
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    channel_name := 'conversation:' || NEW.conversation_id;
    payload_data := jsonb_build_object(
      'type', 'UPDATE',
      'table', 'messages',
      'schema', 'public',
      'old', row_to_json(OLD),
      'new', row_to_json(NEW)
    );

    PERFORM pg_notify(channel_name, payload_data::text);
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    channel_name := 'conversation:' || OLD.conversation_id;
    payload_data := jsonb_build_object(
      'type', 'DELETE',
      'table', 'messages',
      'schema', 'public',
      'old', row_to_json(OLD)
    );

    PERFORM pg_notify(channel_name, payload_data::text);
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Buat trigger untuk messages table
DROP TRIGGER IF EXISTS messages_realtime_trigger ON public.messages;
CREATE TRIGGER messages_realtime_trigger
  AFTER INSERT OR UPDATE OR DELETE
  ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION realtime.broadcast_message_changes();

-- Step 4: Pastikan RLS policy untuk SELECT (WAJIB untuk Realtime)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika ada (optional)
DROP POLICY IF EXISTS "allow realtime select on messages" ON public.messages;

-- Buat policy baru untuk SELECT (WAJIB untuk Realtime bekerja)
CREATE POLICY "allow realtime select on messages"
ON public.messages
FOR SELECT
USING (true);

-- Step 5: Pastikan RLS policy untuk INSERT, UPDATE, DELETE
DROP POLICY IF EXISTS "allow users to insert messages" ON public.messages;
CREATE POLICY "allow users to insert messages"
ON public.messages
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "allow users to update own messages" ON public.messages;
CREATE POLICY "allow users to update own messages"
ON public.messages
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Step 6: Verifikasi
-- Cek apakah trigger sudah dibuat
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'messages';

-- Cek apakah policies sudah dibuat
SELECT * FROM pg_policies WHERE tablename = 'messages';

