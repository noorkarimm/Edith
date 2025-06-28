/*
  # Add user_id columns to conversations and documents tables

  1. Changes
    - Add `user_id` column to `conversations` table
    - Add `user_id` column to `documents` table (already exists but ensuring consistency)
    - Update indexes for better performance with user filtering

  2. Security
    - Policies remain the same for now (public access)
    - In production, these should be updated to filter by authenticated user
*/

-- Add user_id to conversations table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE conversations ADD COLUMN user_id text;
  END IF;
END $$;

-- Ensure user_id column exists in documents table (should already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE documents ADD COLUMN user_id text;
  END IF;
END $$;

-- Create indexes for user_id columns for better performance
CREATE INDEX IF NOT EXISTS conversations_user_id_idx ON conversations(user_id);
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents(user_id);

-- Create composite indexes for user + timestamp queries
CREATE INDEX IF NOT EXISTS conversations_user_updated_idx ON conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS documents_user_updated_idx ON documents(user_id, updated_at DESC);