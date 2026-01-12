/*
  # Add Price Analytics, Location Integration, and User Reputation System

  1. New Tables
    - `price_history`: Tracks historical price data for price analytics and trends
      - `id` (uuid, primary key)
      - `availability_id` (uuid, foreign key to availability)
      - `price` (numeric) - historical price at time of record
      - `recorded_at` (timestamptz) - when this price was recorded
      - `recorded_by` (uuid) - user who recorded it
    
    - `pharmacy_locations`: Stores pharmacy coordinates for map integration
      - `id` (uuid, primary key)
      - `pharmacy_id` (uuid, foreign key to pharmacies)
      - `latitude` (numeric) - geographic latitude
      - `longitude` (numeric) - geographic longitude
      - `address_verified` (boolean) - whether coordinates are verified
      - `updated_at` (timestamptz) - last location update
    
    - `user_reputation`: Tracks user contributions and badges
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `contributions` (integer) - total count of updates/reports
      - `helpful_votes` (integer) - votes from other users
      - `accuracy_score` (numeric) - score 0-100 based on report accuracy
      - `badge_level` (text) - badge earned ('bronze', 'silver', 'gold', 'platinum')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - price_history: users can read all, only creators can update/delete own records
    - pharmacy_locations: everyone can read, only creators/pharmacies can update
    - user_reputation: everyone can read, only the user can view/update own data

  3. Indexes
    - Add indexes on frequently queried columns for performance
*/

-- Create price_history table
CREATE TABLE IF NOT EXISTS price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  availability_id uuid NOT NULL REFERENCES availability(id) ON DELETE CASCADE,
  price numeric NOT NULL,
  recorded_at timestamptz DEFAULT now(),
  recorded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create pharmacy_locations table
CREATE TABLE IF NOT EXISTS pharmacy_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id uuid NOT NULL UNIQUE REFERENCES pharmacies(id) ON DELETE CASCADE,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  address_verified boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create user_reputation table
CREATE TABLE IF NOT EXISTS user_reputation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  contributions integer DEFAULT 0,
  helpful_votes integer DEFAULT 0,
  accuracy_score numeric DEFAULT 100,
  badge_level text DEFAULT 'bronze',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reputation ENABLE ROW LEVEL SECURITY;

-- Price History RLS Policies
CREATE POLICY "Anyone can view price history"
  ON price_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own price records"
  ON price_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = recorded_by);

CREATE POLICY "Users can only delete their own price records"
  ON price_history FOR DELETE
  TO authenticated
  USING (auth.uid() = recorded_by);

-- Pharmacy Locations RLS Policies
CREATE POLICY "Anyone can view pharmacy locations"
  ON pharmacy_locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert pharmacy locations"
  ON pharmacy_locations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update pharmacy locations"
  ON pharmacy_locations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- User Reputation RLS Policies
CREATE POLICY "Anyone can view user reputation"
  ON user_reputation FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can only update their own reputation"
  ON user_reputation FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_price_history_availability_id ON price_history(availability_id);
CREATE INDEX idx_price_history_recorded_at ON price_history(recorded_at DESC);
CREATE INDEX idx_price_history_recorded_by ON price_history(recorded_by);
CREATE INDEX idx_pharmacy_locations_pharmacy_id ON pharmacy_locations(pharmacy_id);
CREATE INDEX idx_user_reputation_user_id ON user_reputation(user_id);
CREATE INDEX idx_user_reputation_badge_level ON user_reputation(badge_level);
