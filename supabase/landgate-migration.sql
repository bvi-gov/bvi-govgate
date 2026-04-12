-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS land_parcels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parcel_number TEXT UNIQUE NOT NULL,
  plan_number TEXT,
  address TEXT NOT NULL,
  district TEXT NOT NULL DEFAULT 'Road Town',
  area_sqft NUMERIC DEFAULT 0,
  land_use_zone TEXT DEFAULT 'residential',
  status TEXT DEFAULT 'registered',
  current_owner TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS land_ownerships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parcel_id UUID REFERENCES land_parcels(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  owner_id_type TEXT NOT NULL DEFAULT 'Passport',
  owner_id_number TEXT NOT NULL,
  ownership_type TEXT DEFAULT 'freehold',
  share_percentage NUMERIC DEFAULT 100,
  acquired_date DATE,
  instrument_number TEXT,
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS land_liens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parcel_id UUID REFERENCES land_parcels(id) ON DELETE CASCADE,
  lien_type TEXT NOT NULL DEFAULT 'mortgage',
  creditor_name TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  filed_date DATE,
  release_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE land_parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE land_ownerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE land_liens ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access on land_parcels" ON land_parcels FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on land_ownerships" ON land_ownerships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on land_liens" ON land_liens FOR ALL USING (true) WITH CHECK (true);
