-- ============================================================================
-- GAFOOR DRIVING SCHOOL — SUPABASE DATABASE SCHEMA
-- Accredited by AP RTO Pulivendula / Kadapa
-- Copy and run this script in your Supabase SQL Editor:
-- https://app.supabase.com/project/_/sql/new
-- ============================================================================

-- 1. Create the 'students' table
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,                       -- Unique Code, e.g. "MA-G01"
  student_code TEXT UNIQUE NOT NULL,         -- Formatted student code (e.g. "MA-G01")
  name TEXT NOT NULL,                        -- Candidate Full Name
  phone TEXT,                                -- Phone Number
  email TEXT,                                -- Student Email
  address TEXT,                              -- Residential Address / Branch
  permit_number TEXT,                        -- AP RTO LLR Number (e.g. "AP004/LLR/2026/8941")
  assigned_trainer_id TEXT DEFAULT 'TRN-1',  -- Assigned Instructor ID
  current_day INT DEFAULT 1,                 -- Curriculum Day (1 to 20)
  total_days INT DEFAULT 20,                 -- Total Course Days
  category TEXT DEFAULT 'street',            -- 'street' | 'highway' | 'test'
  status TEXT DEFAULT 'Active',              -- 'Active' | 'Graduating' | 'New Intake'
  registered_date DATE DEFAULT CURRENT_DATE, -- Date of Enrollment
  package TEXT DEFAULT '20-Day Comprehensive Licensing Package',
  avatar TEXT,                               -- Initials, e.g. "MA"
  attendance_rate TEXT DEFAULT '100%',       -- e.g. "100%"
  payment_status TEXT DEFAULT 'pending',     -- 'paid' | 'partial' | 'pending' | 'overdue'
  emergency_contact TEXT,                    -- Parent / Guardian Name
  emergency_phone TEXT,                      -- Emergency Contact Phone
  password TEXT,                             -- Student Generated Password
  is_first_login BOOLEAN DEFAULT TRUE,       -- First-Time Login Activation Flag
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- In case table already exists, add columns if not present:
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT TRUE;

-- 2. Create the 'payments' table (Optional Ledger Tracking)
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY,                       -- e.g. "INV-4011"
  trainee_id TEXT REFERENCES public.students(id) ON DELETE CASCADE,
  trainee_name TEXT,
  package TEXT,
  amount NUMERIC DEFAULT 7500,
  paid NUMERIC DEFAULT 0,
  balance NUMERIC DEFAULT 7500,
  due_date DATE,
  status TEXT DEFAULT 'pending',
  method TEXT DEFAULT 'UPI (PhonePe / Google Pay QR)',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for Public Web App Access using Anon Key
DROP POLICY IF EXISTS "Public Full Access on Students" ON public.students;
CREATE POLICY "Public Full Access on Students" 
ON public.students 
FOR ALL 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access on Payments" ON public.payments;
CREATE POLICY "Public Full Access on Payments" 
ON public.payments 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. Create Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_students_updated_at ON public.students;
CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
