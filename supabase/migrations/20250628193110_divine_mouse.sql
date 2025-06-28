/*
  # Revert June 28th changes - Remove user_id columns and related indexes

  1. Changes to Revert
    - Remove `user_id` column from `conversations` table
    - Remove `user_id` column from `documents` table (keep the original uuid version)
    - Remove user-related indexes added on June 28th

  2. Security
    - Policies remain the same (public access)
*/

-- Remove user-related indexes added on June 28th
DROP INDEX IF EXISTS conversations_user_id_idx;
DROP INDEX IF EXISTS conversations_user_updated_idx;
DROP INDEX IF EXISTS documents_user_updated_idx;

-- Remove user_id column from conversations table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'user_id' AND data_type = 'text'
  ) THEN
    ALTER TABLE conversations DROP COLUMN user_id;
  END IF;
END $$;

-- Keep the original documents table structure with uuid user_id
-- (The documents table originally had user_id as uuid, so we keep that)