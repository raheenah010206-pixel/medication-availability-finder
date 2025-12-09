/*
  # Medication Availability Finder - Core Database Schema

  1. New Tables
    - `pharmacies`
      - `id` (uuid, primary key)
      - `name` (text, pharmacy name)
      - `address` (text, full address)
      - `phone` (text, contact number)
      - `hours` (text, operating hours)
      - `created_at` (timestamp)
      - `created_by` (uuid, references auth.users)
    
    - `medications`
      - `id` (uuid, primary key)  
      - `name` (text, medication name)
      - `generic_name` (text, generic equivalent)
      - `created_at` (timestamp)
    
    - `availability`
      - `id` (uuid, primary key)
      - `pharmacy_id` (uuid, references pharmacies)
      - `medication_id` (uuid, references medications)
      - `in_stock` (boolean, availability status)
      - `price` (numeric, price in dollars)
      - `last_updated` (timestamp)
      - `updated_by` (uuid, references auth.users)
    
    - `moderation_flags`
      - `id` (uuid, primary key)
      - `availability_id` (uuid, references availability)
      - `reason` (text, flagging reason)
      - `flagged_by` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `resolved` (boolean, default false)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read all data
    - Add policies for authenticated users to create/update their own data
    - Add policies for public read access to core medication/pharmacy data
*/

-- Pharmacies table
CREATE TABLE IF NOT EXISTS pharmacies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  phone text,
  hours text DEFAULT '9:00 AM - 9:00 PM',
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pharmacies"
  ON pharmacies
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create pharmacies"
  ON pharmacies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  generic_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read medications"
  ON medications
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create medications"
  ON medications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Availability table
CREATE TABLE IF NOT EXISTS availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id uuid NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
  medication_id uuid NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  in_stock boolean NOT NULL DEFAULT false,
  price numeric(10,2),
  last_updated timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  UNIQUE(pharmacy_id, medication_id)
);

ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read availability"
  ON availability
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update availability"
  ON availability
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (auth.uid() = updated_by);

-- Moderation flags table
CREATE TABLE IF NOT EXISTS moderation_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  availability_id uuid NOT NULL REFERENCES availability(id) ON DELETE CASCADE,
  reason text NOT NULL,
  flagged_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  resolved boolean DEFAULT false
);

ALTER TABLE moderation_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read unresolved flags"
  ON moderation_flags
  FOR SELECT
  TO public
  USING (NOT resolved);

CREATE POLICY "Authenticated users can create flags"
  ON moderation_flags
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = flagged_by);

-- Insert sample data
INSERT INTO medications (name, generic_name) VALUES
  ('Advil', 'Ibuprofen'),
  ('Tylenol', 'Acetaminophen'),
  ('Zyrtec', 'Cetirizine'),
  ('Benadryl', 'Diphenhydramine'),
  ('Pepto-Bismol', 'Bismuth Subsalicylate');

INSERT INTO pharmacies (name, address, phone, hours) VALUES
  ('CVS Pharmacy', '123 Main St, New York, NY 10001', '(555) 123-4567', '8:00 AM - 10:00 PM'),
  ('Walgreens', '456 Broadway, New York, NY 10013', '(555) 234-5678', '7:00 AM - 11:00 PM'),
  ('Rite Aid', '789 Park Ave, New York, NY 10021', '(555) 345-6789', '9:00 AM - 9:00 PM'),
  ('Duane Reade', '321 5th Ave, New York, NY 10016', '(555) 456-7890', '24 Hours');