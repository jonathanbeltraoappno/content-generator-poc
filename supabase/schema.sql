-- Approved Content Variant Generator – Supabase schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor) or via CLI against your Cloud project.

-- Enum types for constrained columns
CREATE TYPE content_channel AS ENUM ('email', 'web', 'sms');
CREATE TYPE content_audience AS ENUM ('hcp', 'patient', 'internal');
CREATE TYPE content_tone AS ENUM ('professional', 'friendly', 'formal', 'conversational');
CREATE TYPE variant_status AS ENUM ('draft', 'in_review', 'approved', 'rejected');

-- Approved source content (one row per approved piece)
CREATE TABLE approved_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  brand TEXT,
  campaign TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Generated variants
CREATE TABLE content_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approved_content_id UUID NOT NULL REFERENCES approved_content(id) ON DELETE CASCADE,
  channel content_channel NOT NULL,
  audience content_audience NOT NULL,
  tone content_tone NOT NULL,
  status variant_status NOT NULL DEFAULT 'draft',
  generated_text TEXT NOT NULL,
  n8n_execution_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_approved_content_user_id ON approved_content(user_id);
CREATE INDEX idx_content_variants_approved_content_id ON content_variants(approved_content_id);
CREATE INDEX idx_content_variants_status ON content_variants(status);

-- RLS
ALTER TABLE approved_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_variants ENABLE ROW LEVEL SECURITY;

-- approved_content: users see only their own rows
CREATE POLICY approved_content_select_own ON approved_content
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY approved_content_insert_own ON approved_content
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY approved_content_update_own ON approved_content
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY approved_content_delete_own ON approved_content
  FOR DELETE USING (auth.uid() = user_id);

-- content_variants: users see variants only for their approved_content
CREATE POLICY content_variants_select_own ON content_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM approved_content ac
      WHERE ac.id = content_variants.approved_content_id AND ac.user_id = auth.uid()
    )
  );
CREATE POLICY content_variants_insert_own ON content_variants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM approved_content ac
      WHERE ac.id = content_variants.approved_content_id AND ac.user_id = auth.uid()
    )
  );
CREATE POLICY content_variants_update_own ON content_variants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM approved_content ac
      WHERE ac.id = content_variants.approved_content_id AND ac.user_id = auth.uid()
    )
  );
CREATE POLICY content_variants_delete_own ON content_variants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM approved_content ac
      WHERE ac.id = content_variants.approved_content_id AND ac.user_id = auth.uid()
    )
  );

-- Optional: updated_at trigger (recommended)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER approved_content_updated_at
  BEFORE UPDATE ON approved_content
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER content_variants_updated_at
  BEFORE UPDATE ON content_variants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
