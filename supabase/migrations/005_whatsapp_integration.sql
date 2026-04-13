-- Migration: 005_whatsapp_integration
-- Date: 2026-04-13
-- Description: WhatsApp integration tables for Phase 3 (scaffolding)

CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verification_code TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  message_type TEXT CHECK (message_type IN ('text', 'image', 'document', 'button_reply')),
  content TEXT,
  media_url TEXT,
  wa_message_id TEXT,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_user_id ON whatsapp_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_user_id ON whatsapp_messages(user_id);

ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own whatsapp sessions" ON whatsapp_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own whatsapp messages" ON whatsapp_messages
  FOR SELECT USING (auth.uid() = user_id);
