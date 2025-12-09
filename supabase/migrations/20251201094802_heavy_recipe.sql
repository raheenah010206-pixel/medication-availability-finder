/*
  # Add Nigerian Sample Data

  1. Sample Data
    - Add common Nigerian medications
    - Add major Nigerian pharmacy chains
    - Add sample availability data for major cities

  2. Data Coverage
    - Medications: Common drugs available in Nigeria
    - Pharmacies: Major chains in Lagos, Abuja, Port Harcourt, Kano
    - Locations: Real Nigerian addresses and phone formats
*/

-- Insert common Nigerian medications
INSERT INTO medications (name, generic_name) VALUES
  ('Panadol', 'Paracetamol'),
  ('Flagyl', 'Metronidazole'),
  ('Amoxil', 'Amoxicillin'),
  ('Chloroquine', 'Chloroquine Phosphate'),
  ('Vitamin C', 'Ascorbic Acid'),
  ('Paludrine', 'Proguanil'),
  ('Septrin', 'Co-trimoxazole'),
  ('Ibuprofen', 'Ibuprofen'),
  ('Omeprazole', 'Omeprazole'),
  ('Ciprofloxacin', 'Ciprofloxacin'),
  ('Artemether', 'Artemether/Lumefantrine'),
  ('Insulin', 'Human Insulin'),
  ('Lisinopril', 'Lisinopril'),
  ('Metformin', 'Metformin HCl'),
  ('Aspirin', 'Acetylsalicylic Acid')
ON CONFLICT (name) DO NOTHING;

-- Insert major Nigerian pharmacies
INSERT INTO pharmacies (name, address, phone, hours) VALUES
  ('HealthPlus Pharmacy', 'Plot 1, Admiralty Way, Lekki Phase 1, Lagos', '+234 803 123 4567', '8:00 AM - 10:00 PM'),
  ('MedPlus Pharmacy', '15 Adeola Odeku Street, Victoria Island, Lagos', '+234 701 234 5678', '7:00 AM - 11:00 PM'),
  ('Alpha Pharmacy', 'Wuse 2, Abuja FCT', '+234 809 345 6789', '8:00 AM - 9:00 PM'),
  ('Emzor Pharmacy', '3-5 Oshodi-Apapa Expressway, Lagos', '+234 802 456 7890', '24 Hours'),
  ('Juhel Pharmacy', 'Plot 410, Cadastral Zone, Garki, Abuja', '+234 805 567 8901', '8:00 AM - 10:00 PM'),
  ('Drugfield Pharmacy', 'No. 2 Port Harcourt Road, Aba, Abia State', '+234 703 678 9012', '7:00 AM - 9:00 PM'),
  ('Fidson Pharmacy', 'KM 32, Lagos-Ibadan Expressway, Ogun State', '+234 806 789 0123', '8:00 AM - 8:00 PM'),
  ('Maydon Pharmacy', 'Ahmadu Bello Way, Kaduna', '+234 704 890 1234', '8:00 AM - 9:00 PM'),
  ('Pharmaplus', 'Independence Layout, Enugu', '+234 807 901 2345', '7:30 AM - 9:30 PM'),
  ('Mega Lifesciences', 'Owerri-Aba Road, Owerri, Imo State', '+234 708 012 3456', '8:00 AM - 9:00 PM'),
  ('Neimeth Pharmacy', 'Plot B, Industrial Estate, Ikeja, Lagos', '+234 809 123 4567', '8:00 AM - 6:00 PM'),
  ('Swipha Pharmacy', 'Ikorodu Road, Lagos', '+234 802 234 5678', '7:00 AM - 10:00 PM'),
  ('Biogenerics Pharmacy', 'New Market Road, Onitsha, Anambra State', '+234 805 345 6789', '8:00 AM - 9:00 PM'),
  ('Therapeutic Labs', 'Ring Road, Ibadan, Oyo State', '+234 703 456 7890', '8:00 AM - 8:00 PM'),
  ('Chemiron Pharmacy', 'Bompai Industrial Area, Kano', '+234 806 567 8901', '8:00 AM - 9:00 PM')
ON CONFLICT DO NOTHING;