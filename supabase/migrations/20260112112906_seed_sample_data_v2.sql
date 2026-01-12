/*
  # Seed sample data for all tables
  
  Populating medications, pharmacies, locations, availability, price history, and user reputation
*/

-- Seed medications
INSERT INTO medications (name, generic_name, search_count) VALUES
('Lisinopril', 'Lisinopril', 45),
('Metformin', 'Metformin', 38),
('Atorvastatin', 'Atorvastatin', 52),
('Omeprazole', 'Omeprazole', 31),
('Amoxicillin', 'Amoxicillin', 28),
('Ibuprofen', 'Ibuprofen', 87),
('Acetaminophen', 'Acetaminophen', 93),
('Albuterol', 'Albuterol sulfate', 22),
('Levothyroxine', 'Levothyroxine', 35),
('Sertraline', 'Sertraline', 40)
ON CONFLICT (name) DO NOTHING;

-- Seed pharmacies
INSERT INTO pharmacies (name, address, phone, hours) VALUES
('Riverside Pharmacy', '123 Main St, Downtown', '(555) 234-5678', '8:00 AM - 10:00 PM'),
('Healthcare Plus', '456 Oak Avenue, Midtown', '(555) 345-6789', '7:00 AM - 9:00 PM'),
('MediCare Pharmacy', '789 Pine Road, North Side', '(555) 456-7890', '9:00 AM - 8:00 PM'),
('Community Rx', '321 Elm Street, South End', '(555) 567-8901', '8:00 AM - 9:00 PM'),
('Express Pharmacy', '654 Maple Drive, West Park', '(555) 678-9012', '10:00 AM - 6:00 PM')
ON CONFLICT DO NOTHING;

-- Seed pharmacy locations
DO $$
DECLARE
  pharmacy_id_1 uuid;
  pharmacy_id_2 uuid;
  pharmacy_id_3 uuid;
  pharmacy_id_4 uuid;
  pharmacy_id_5 uuid;
BEGIN
  -- Get pharmacy IDs
  SELECT id INTO pharmacy_id_1 FROM pharmacies WHERE name = 'Riverside Pharmacy' LIMIT 1;
  SELECT id INTO pharmacy_id_2 FROM pharmacies WHERE name = 'Healthcare Plus' LIMIT 1;
  SELECT id INTO pharmacy_id_3 FROM pharmacies WHERE name = 'MediCare Pharmacy' LIMIT 1;
  SELECT id INTO pharmacy_id_4 FROM pharmacies WHERE name = 'Community Rx' LIMIT 1;
  SELECT id INTO pharmacy_id_5 FROM pharmacies WHERE name = 'Express Pharmacy' LIMIT 1;

  -- Insert only if not exists
  IF NOT EXISTS (SELECT 1 FROM pharmacy_locations) THEN
    INSERT INTO pharmacy_locations (pharmacy_id, latitude, longitude, address_verified) VALUES
      (pharmacy_id_1, 40.7580, -73.9855, true),
      (pharmacy_id_2, 40.7489, -73.9680, true),
      (pharmacy_id_3, 40.7614, -73.9776, true),
      (pharmacy_id_4, 40.7282, -73.9697, true),
      (pharmacy_id_5, 40.7505, -73.9867, true);
  END IF;
END $$;

-- Seed availability data
DO $$
DECLARE
  med_count integer;
BEGIN
  IF (SELECT COUNT(*) FROM availability) = 0 THEN
    INSERT INTO availability (pharmacy_id, medication_id, in_stock, price, last_updated)
    SELECT 
      p.id,
      m.id,
      true,
      (5 + random() * 50)::numeric,
      now() - (random() * interval '7 days')
    FROM pharmacies p, medications m
    LIMIT 30;
  END IF;
END $$;

-- Seed price history data
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM price_history) = 0 THEN
    INSERT INTO price_history (availability_id, price, recorded_at)
    SELECT 
      a.id,
      (3 + random() * 40)::numeric,
      now() - (random() * interval '30 days')
    FROM availability a
    LIMIT 100;

    INSERT INTO price_history (availability_id, price, recorded_at)
    SELECT 
      a.id,
      (2 + random() * 50)::numeric,
      now() - (random() * interval '60 days')
    FROM availability a
    LIMIT 50;
  END IF;
END $$;
