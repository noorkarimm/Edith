/*
  # Create conversations and documents tables

  1. New Tables
    - `conversations`
      - `id` (text, primary key)
      - `current_step` (text)
      - `responses` (jsonb)
      - `initial_description` (text)
      - `selected_model` (text)
      - `conversation_history` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `documents`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `user_id` (uuid, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (since we don't have auth yet)
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id text PRIMARY KEY,
  current_step text NOT NULL DEFAULT 'chatting',
  responses jsonb DEFAULT '{}',
  initial_description text NOT NULL,
  selected_model text DEFAULT 'gpt-4o',
  conversation_history jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text DEFAULT '',
  user_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (temporary - replace with proper auth later)
CREATE POLICY "Allow all operations on conversations"
  ON conversations
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations on documents"
  ON documents
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS conversations_created_at_idx ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS conversations_updated_at_idx ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS documents_created_at_idx ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS documents_updated_at_idx ON documents(updated_at DESC);
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents(user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();