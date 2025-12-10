/*
  # Add popularity tracking to medications

  1. New Columns
    - `search_count` on medications table to track how many times a medication has been searched
  
  2. Purpose
    - Enable ranking of medications by popularity for the "Popular Medications" feature
    - Used to show which medications are most frequently searched by users
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'medications' AND column_name = 'search_count'
  ) THEN
    ALTER TABLE medications ADD COLUMN search_count integer DEFAULT 0;
  END IF;
END $$;
