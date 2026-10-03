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

-- ============================================================================
-- 6. DRIVING SLOT MANAGEMENT & ATOMIC BOOKING SYSTEM
-- Dynamic capacity = Available Trainers × 2 (Max 2 learners per trainer)
-- Only 6 bookable daily slots:
-- 1. 08:00 AM - 09:00 AM
-- 2. 09:15 AM - 10:15 AM
-- 3. 10:30 AM - 11:30 AM
-- 4. 01:00 PM - 02:00 PM
-- 5. 02:15 PM - 03:15 PM
-- 6. 03:30 PM - 04:30 PM
-- ============================================================================

-- Table: public.slots
CREATE TABLE IF NOT EXISTS public.slots (
  id TEXT PRIMARY KEY,                       -- e.g. "SLOT-2026-09-30-0800-0900"
  date DATE NOT NULL,                        -- Slot Date
  start_time TEXT NOT NULL,                  -- e.g. "08:00 AM" or "08:00"
  end_time TEXT NOT NULL,                    -- e.g. "09:00 AM" or "09:00"
  time_display TEXT NOT NULL,                -- e.g. "08:00 AM – 09:00 AM"
  status TEXT DEFAULT 'AVAILABLE',           -- 'AVAILABLE' | 'ALMOST FULL' | 'FULL' | 'CANCELLED' | 'COMPLETED' | 'INACTIVE'
  course_id TEXT DEFAULT 'ALL',
  created_by TEXT DEFAULT 'ADMIN',
  name TEXT,
  description TEXT,
  capacity INT,
  location TEXT,
  assigned_trainer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- In case public.slots already exists, add new fields if not present:
ALTER TABLE public.slots ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.slots ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.slots ADD COLUMN IF NOT EXISTS capacity INT;
ALTER TABLE public.slots ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.slots ADD COLUMN IF NOT EXISTS assigned_trainer_id TEXT;

-- Table: public.trainer_slot_availability
CREATE TABLE IF NOT EXISTS public.trainer_slot_availability (
  id TEXT PRIMARY KEY,                       -- e.g. "AVAIL-TRN-1-2026-09-30-0800"
  trainer_id TEXT NOT NULL,                  -- Trainer ID (e.g. "TRN-1")
  date DATE NOT NULL,
  slot_time TEXT NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  reason TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trainer_id, date, slot_time)
);

-- Table: public.slot_bookings
CREATE TABLE IF NOT EXISTS public.slot_bookings (
  id TEXT PRIMARY KEY,                       -- e.g. "SB-20260930-0800-01"
  slot_id TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  trainee_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  trainee_name TEXT NOT NULL,
  trainer_id TEXT NOT NULL,
  trainer_name TEXT NOT NULL,
  vehicle TEXT,
  course TEXT,
  status TEXT DEFAULT 'CONFIRMED',           -- 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'RESCHEDULED'
  booked_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: public.slot_audit_logs
CREATE TABLE IF NOT EXISTS public.slot_audit_logs (
  id TEXT PRIMARY KEY,                       -- e.g. "AUD-101"
  slot_id TEXT,
  booking_id TEXT,
  action TEXT NOT NULL,                      -- 'BOOKING_CREATED' | 'BOOKING_CANCELLED' | 'TRAINER_REASSIGNED' | 'SLOT_DEACTIVATED' | etc.
  performed_by TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for rapid querying & backend concurrency protection
CREATE INDEX IF NOT EXISTS idx_slots_date ON public.slots(date);
CREATE INDEX IF NOT EXISTS idx_slot_bookings_date ON public.slot_bookings(date);
CREATE INDEX IF NOT EXISTS idx_slot_bookings_slot ON public.slot_bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_slot_bookings_trainee ON public.slot_bookings(trainee_id);
CREATE INDEX IF NOT EXISTS idx_slot_bookings_trainer ON public.slot_bookings(trainer_id);

-- CONCURRENT & DUPLICATE BOOKING PREVENTION AT DATABASE LEVEL:
-- A student can never have two active confirmed bookings on the same date and overlapping start_time!
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_trainee_slot 
ON public.slot_bookings (trainee_id, date, start_time) 
WHERE (status = 'CONFIRMED');

-- Enable RLS
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_slot_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slot_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slot_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Full Access on Slots" ON public.slots;
CREATE POLICY "Public Full Access on Slots" ON public.slots FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access on Trainer Availability" ON public.trainer_slot_availability;
CREATE POLICY "Public Full Access on Trainer Availability" ON public.trainer_slot_availability FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access on Slot Bookings" ON public.slot_bookings;
CREATE POLICY "Public Full Access on Slot Bookings" ON public.slot_bookings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access on Slot Audit Logs" ON public.slot_audit_logs;
CREATE POLICY "Public Full Access on Slot Audit Logs" ON public.slot_audit_logs FOR ALL USING (true) WITH CHECK (true);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_slots_updated_at ON public.slots;
CREATE TRIGGER update_slots_updated_at
BEFORE UPDATE ON public.slots
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_slot_bookings_updated_at ON public.slot_bookings;
CREATE TRIGGER update_slot_bookings_updated_at
BEFORE UPDATE ON public.slot_bookings
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================================
-- 7. ATOMIC CONCURRENT DRIVING SLOT BOOKING RPC
-- Guarantees atomic transaction, row-locking, dynamic capacity enforcement,
-- and strict limit of maximum 2 learners per trainer.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.book_driving_slot_atomic(
  p_booking_id TEXT,
  p_slot_id TEXT,
  p_date DATE,
  p_start_time TEXT,
  p_end_time TEXT,
  p_trainee_id TEXT,
  p_trainee_name TEXT,
  p_course TEXT,
  p_booked_by TEXT,
  p_preferred_trainer_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slot_status TEXT;
  v_active_bookings INT;
  v_available_trainers INT;
  v_total_capacity INT;
  v_assigned_trainer_id TEXT := NULL;
  v_assigned_trainer_name TEXT := NULL;
  v_assigned_vehicle TEXT := NULL;
  v_trainer_rec RECORD;
  v_booking_record RECORD;
BEGIN
  -- 1. Ensure slot exists and acquire exclusive transaction row lock
  SELECT status INTO v_slot_status
  FROM public.slots
  WHERE id = p_slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    -- If slot row does not exist yet in DB, create it with AVAILABLE status
    INSERT INTO public.slots (id, date, start_time, end_time, time_display, status)
    VALUES (p_slot_id, p_date, p_start_time, p_end_time, p_start_time || ' – ' || p_end_time, 'AVAILABLE')
    ON CONFLICT (id) DO UPDATE SET updated_at = NOW();
    
    v_slot_status := 'AVAILABLE';
  END IF;

  -- 2. Reject if slot is deactivated or cancelled
  IF v_slot_status IN ('CANCELLED', 'INACTIVE', 'COMPLETED') THEN
    RAISE EXCEPTION 'Slot is not open for booking (Status: %)', v_slot_status;
  END IF;

  -- 3. Duplicate booking prevention for this trainee on this date & time
  IF EXISTS (
    SELECT 1 FROM public.slot_bookings
    WHERE trainee_id = p_trainee_id
      AND date = p_date
      AND start_time = p_start_time
      AND status = 'CONFIRMED'
  ) THEN
    RAISE EXCEPTION 'You already have a driving session during this time.';
  END IF;

  -- 4. Calculate dynamic available trainers (default 4 active trainers unless marked unavailable)
  -- Default trainers: TRN-1, TRN-2, TRN-3, TRN-4
  SELECT COUNT(*) INTO v_available_trainers
  FROM (
    SELECT 'TRN-1' AS tid UNION SELECT 'TRN-2' UNION SELECT 'TRN-3' UNION SELECT 'TRN-4'
  ) all_tr
  WHERE NOT EXISTS (
    SELECT 1 FROM public.trainer_slot_availability tsa
    WHERE tsa.trainer_id = all_tr.tid
      AND tsa.date = p_date
      AND tsa.slot_time = p_start_time
      AND tsa.is_available = FALSE
  );

  IF v_available_trainers <= 0 THEN
    RAISE EXCEPTION 'No driving instructors are available for this slot.';
  END IF;

  -- Formula: Total Capacity = Available Trainers × 2
  v_total_capacity := v_available_trainers * 2;

  -- 5. Count currently confirmed bookings for this slot
  SELECT COUNT(*) INTO v_active_bookings
  FROM public.slot_bookings
  WHERE slot_id = p_slot_id
    AND status = 'CONFIRMED';

  -- 6. Enforce capacity limit atomically
  IF v_active_bookings >= v_total_capacity THEN
    UPDATE public.slots SET status = 'FULL' WHERE id = p_slot_id;
    RAISE EXCEPTION 'Sorry, this slot is now full. Please select another available slot.';
  END IF;

  -- 7. Deterministic Trainer Allocation:
  -- Find an available trainer with fewer than 2 active learners for this slot
  IF p_preferred_trainer_id IS NOT NULL THEN
    -- Check preferred trainer load
    SELECT COUNT(*) INTO v_active_bookings
    FROM public.slot_bookings
    WHERE slot_id = p_slot_id
      AND trainer_id = p_preferred_trainer_id
      AND status = 'CONFIRMED';

    IF v_active_bookings < 2 THEN
      v_assigned_trainer_id := p_preferred_trainer_id;
    END IF;
  END IF;

  IF v_assigned_trainer_id IS NULL THEN
    -- Pick trainer with the least active bookings (< 2)
    FOR v_trainer_rec IN
      SELECT tr.tid,
             COALESCE(COUNT(sb.id) FILTER (WHERE sb.status = 'CONFIRMED' AND sb.slot_id = p_slot_id), 0) AS current_load
      FROM (
        SELECT 'TRN-1' AS tid UNION SELECT 'TRN-2' UNION SELECT 'TRN-3' UNION SELECT 'TRN-4'
      ) tr
      LEFT JOIN public.slot_bookings sb ON sb.trainer_id = tr.tid AND sb.slot_id = p_slot_id
      WHERE NOT EXISTS (
        SELECT 1 FROM public.trainer_slot_availability tsa
        WHERE tsa.trainer_id = tr.tid
          AND tsa.date = p_date
          AND tsa.slot_time = p_start_time
          AND tsa.is_available = FALSE
      )
      GROUP BY tr.tid
      HAVING COALESCE(COUNT(sb.id) FILTER (WHERE sb.status = 'CONFIRMED' AND sb.slot_id = p_slot_id), 0) < 2
      ORDER BY current_load ASC, tr.tid ASC
      LIMIT 1
    LOOP
      v_assigned_trainer_id := v_trainer_rec.tid;
    END LOOP;
  END IF;

  IF v_assigned_trainer_id IS NULL THEN
    RAISE EXCEPTION 'No trainer capacity available for this slot.';
  END IF;

  -- Map trainer name & vehicle
  IF v_assigned_trainer_id = 'TRN-1' THEN
    v_assigned_trainer_name := 'K. Srinivas Rao';
    v_assigned_vehicle := 'Maruti Suzuki Swift Dual-Ctrl #AP-04-ED-4041';
  ELSIF v_assigned_trainer_id = 'TRN-2' THEN
    v_assigned_trainer_name := 'Anitha Reddy';
    v_assigned_vehicle := 'Hyundai Grand i10 Dual-Ctrl #AP-04-AB-2020';
  ELSIF v_assigned_trainer_id = 'TRN-3' THEN
    v_assigned_trainer_name := 'M. Venkataramana';
    v_assigned_vehicle := 'Tata Punch Dual-Ctrl #AP-04-CT-7072';
  ELSE
    v_assigned_trainer_name := 'D. Ravi Kumar';
    v_assigned_vehicle := 'Maruti WagonR Dual-Ctrl #AP-04-KL-8088';
  END IF;

  -- 8. Insert confirmed booking
  INSERT INTO public.slot_bookings (
    id, slot_id, date, start_time, end_time, trainee_id, trainee_name,
    trainer_id, trainer_name, vehicle, course, status, booked_at
  ) VALUES (
    p_booking_id, p_slot_id, p_date, p_start_time, p_end_time, p_trainee_id, p_trainee_name,
    v_assigned_trainer_id, v_assigned_trainer_name, v_assigned_vehicle, p_course, 'CONFIRMED', NOW()
  )
  RETURNING * INTO v_booking_record;

  -- 9. Log audit history
  INSERT INTO public.slot_audit_logs (
    id, slot_id, booking_id, action, performed_by, details
  ) VALUES (
    'AUD-' || floor(random()*900000 + 100000)::TEXT,
    p_slot_id,
    p_booking_id,
    'BOOKING_CREATED',
    p_booked_by,
    p_trainee_name || ' booked seat under ' || v_assigned_trainer_name || ' (' || v_assigned_vehicle || ')'
  );

  -- 10. Update slot status in parent table
  SELECT COUNT(*) INTO v_active_bookings
  FROM public.slot_bookings
  WHERE slot_id = p_slot_id
    AND status = 'CONFIRMED';

  IF v_active_bookings >= v_total_capacity THEN
    UPDATE public.slots SET status = 'FULL' WHERE id = p_slot_id;
  ELSIF v_active_bookings = (v_total_capacity - 1) THEN
    UPDATE public.slots SET status = 'ALMOST FULL' WHERE id = p_slot_id;
  ELSE
    UPDATE public.slots SET status = 'AVAILABLE' WHERE id = p_slot_id;
  END IF;

  RETURN to_jsonb(v_booking_record);
END;
$$;

-- Function: Cancel booking atomically
CREATE OR REPLACE FUNCTION public.cancel_driving_slot_booking_atomic(
  p_booking_id TEXT,
  p_cancelled_by TEXT,
  p_reason TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rec RECORD;
  v_slot_id TEXT;
  v_active_bookings INT;
  v_available_trainers INT;
  v_total_capacity INT;
BEGIN
  SELECT * INTO v_rec
  FROM public.slot_bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found: %', p_booking_id;
  END IF;

  IF v_rec.status = 'CANCELLED' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Booking already cancelled');
  END IF;

  v_slot_id := v_rec.slot_id;

  -- Mark cancelled
  UPDATE public.slot_bookings
  SET status = 'CANCELLED',
      cancelled_at = NOW(),
      notes = COALESCE(notes, '') || ' Cancelled: ' || p_reason
  WHERE id = p_booking_id;

  -- Audit log
  INSERT INTO public.slot_audit_logs (
    id, slot_id, booking_id, action, performed_by, details
  ) VALUES (
    'AUD-' || floor(random()*900000 + 100000)::TEXT,
    v_slot_id,
    p_booking_id,
    'BOOKING_CANCELLED',
    p_cancelled_by,
    'Booking for ' || v_rec.trainee_name || ' was cancelled. Reason: ' || p_reason
  );

  -- Recalculate capacity & status
  SELECT COUNT(*) INTO v_active_bookings
  FROM public.slot_bookings
  WHERE slot_id = v_slot_id
    AND status = 'CONFIRMED';

  -- Check available trainers
  SELECT COUNT(*) INTO v_available_trainers
  FROM (
    SELECT 'TRN-1' AS tid UNION SELECT 'TRN-2' UNION SELECT 'TRN-3' UNION SELECT 'TRN-4'
  ) all_tr
  WHERE NOT EXISTS (
    SELECT 1 FROM public.trainer_slot_availability tsa
    WHERE tsa.trainer_id = all_tr.tid
      AND tsa.date = v_rec.date
      AND tsa.slot_time = v_rec.start_time
      AND tsa.is_available = FALSE
  );

  v_total_capacity := GREATEST(1, v_available_trainers) * 2;

  IF v_active_bookings >= v_total_capacity THEN
    UPDATE public.slots SET status = 'FULL' WHERE id = v_slot_id;
  ELSIF v_active_bookings = (v_total_capacity - 1) THEN
    UPDATE public.slots SET status = 'ALMOST FULL' WHERE id = v_slot_id;
  ELSE
    UPDATE public.slots SET status = 'AVAILABLE' WHERE id = v_slot_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'booking_id', p_booking_id, 'slot_id', v_slot_id);
END;
$$;
