/**
 * GAFOOR DRIVING SCHOOL — SUPABASE CLIENT & DATA SYNC
 * Enables cloud database integration for student records, unique codes, and tuition accounts.
 */

import { createClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'gafoor_supabase_url';
const STORAGE_ANON_KEY = 'gafoor_supabase_anon_key';

let cachedClient = null;

export function sanitizeSupabaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let url = rawUrl.trim();
  url = url.replace(/[\/\.\s]+$/, '');
  url = url.replace(/\/rest\/v1\/?$/i, '');
  url = url.replace(/[\/\.\s]+$/, '');
  return url;
}

export function getSupabaseCredentials() {
  const envUrl = import.meta.env?.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = (typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_URL_KEY) : '') || '';
  const localKey = (typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_ANON_KEY) : '') || '';

  const rawUrl = (localUrl || envUrl).trim();
  const url = sanitizeSupabaseUrl(rawUrl);
  const anonKey = (localKey || envKey).trim();

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey && url.startsWith('http'))
  };
}

export function saveSupabaseCredentials(url, anonKey) {
  if (typeof localStorage === 'undefined') return;
  if (url) {
    localStorage.setItem(STORAGE_URL_KEY, url.trim());
  } else {
    localStorage.removeItem(STORAGE_URL_KEY);
  }

  if (anonKey) {
    localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
  } else {
    localStorage.removeItem(STORAGE_ANON_KEY);
  }

  cachedClient = null; // force re-creation
  return getSupabaseClient();
}

export function getSupabaseClient() {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) return null;

  if (!cachedClient) {
    try {
      cachedClient = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      cachedClient = null;
    }
  }

  return cachedClient;
}

export async function testSupabaseConnection() {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase credentials not configured yet.' };
  }

  try {
    const { data, error } = await client
      .from('students')
      .select('id')
      .limit(1);

    if (error) {
      // Check if table missing error or auth error
      if (error.code === '42P01') {
        return { 
          success: false, 
          message: 'Connected to Supabase, but "students" table is missing! Please execute supabase_schema.sql in your Supabase SQL editor.',
          code: 'TABLE_MISSING'
        };
      }
      return { success: false, message: error.message || 'Supabase query error', error };
    }

    return { success: true, message: 'Successfully connected to Supabase database!' };
  } catch (err) {
    return { success: false, message: err.message || 'Network error connecting to Supabase' };
  }
}

// Convert app student object to Supabase column names
export function mapStudentToSupabase(s) {
  return {
    id: s.id,
    student_code: s.studentCode || s.id,
    name: s.name,
    phone: s.phone || '',
    email: s.email || '',
    address: s.address || '',
    permit_number: s.permitNumber || '',
    assigned_trainer_id: s.assignedTrainerId || 'TRN-1',
    current_day: typeof s.currentDay === 'number' ? s.currentDay : 1,
    total_days: typeof s.totalDays === 'number' ? s.totalDays : 20,
    category: s.category || 'street',
    status: s.status || 'Active',
    registered_date: s.registeredDate || new Date().toISOString().split('T')[0],
    package: s.package || '20-Day Comprehensive Licensing Package',
    avatar: s.avatar || 'ST',
    attendance_rate: s.attendanceRate || '100%',
    payment_status: s.paymentStatus || 'pending',
    emergency_contact: s.emergencyContact || '',
    emergency_phone: s.emergencyPhone || ''
  };
}

// Convert Supabase row to app student object
export function mapSupabaseToStudent(row) {
  return {
    id: row.id,
    studentCode: row.student_code || row.id,
    name: row.name,
    phone: row.phone || '',
    email: row.email || '',
    address: row.address || '',
    permitNumber: row.permit_number || '',
    assignedTrainerId: row.assigned_trainer_id || 'TRN-1',
    currentDay: row.current_day || 1,
    totalDays: row.total_days || 20,
    category: row.category || 'street',
    status: row.status || 'Active',
    registeredDate: row.registered_date || new Date().toISOString().split('T')[0],
    package: row.package || '20-Day Comprehensive Licensing Package',
    avatar: row.avatar || (row.name ? row.name.substring(0, 2).toUpperCase() : 'ST'),
    attendanceRate: row.attendance_rate || '100%',
    paymentStatus: row.payment_status || 'pending',
    emergencyContact: row.emergency_contact || '',
    emergencyPhone: row.emergency_phone || ''
  };
}

/**
 * Fetch all students from Supabase
 */
export async function fetchStudentsFromSupabase() {
  const client = getSupabaseClient();
  if (!client) return { success: false, data: [] };

  try {
    const { data, error } = await client
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error reading students from Supabase:', error);
      return { success: false, error, data: [] };
    }

    const students = (data || []).map(mapSupabaseToStudent);
    return { success: true, data: students };
  } catch (err) {
    console.warn('Supabase fetch exception:', err);
    return { success: false, error: err, data: [] };
  }
}

/**
 * Save new or updated student to Supabase
 */
export async function saveStudentToSupabase(student) {
  const client = getSupabaseClient();
  if (!client) {
    // Graceful offline fallback
    return { success: false, offline: true, message: 'Supabase is not configured' };
  }

  try {
    const payload = mapStudentToSupabase(student);
    const { data, error } = await client
      .from('students')
      .upsert(payload, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('Supabase student save failed:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Supabase student save exception:', err);
    return { success: false, error: err };
  }
}

/**
 * Update specific student fields in Supabase
 */
export async function updateStudentInSupabase(studentId, fields) {
  const client = getSupabaseClient();
  if (!client) return { success: false, offline: true };

  try {
    const payload = {};
    if (fields.name !== undefined) payload.name = fields.name;
    if (fields.phone !== undefined) payload.phone = fields.phone;
    if (fields.email !== undefined) payload.email = fields.email;
    if (fields.address !== undefined) payload.address = fields.address;
    if (fields.permitNumber !== undefined) payload.permit_number = fields.permitNumber;
    if (fields.assignedTrainerId !== undefined) payload.assigned_trainer_id = fields.assignedTrainerId;
    if (fields.currentDay !== undefined) payload.current_day = fields.currentDay;
    if (fields.category !== undefined) payload.category = fields.category;
    if (fields.status !== undefined) payload.status = fields.status;
    if (fields.package !== undefined) payload.package = fields.package;
    if (fields.paymentStatus !== undefined) payload.payment_status = fields.paymentStatus;
    if (fields.emergencyContact !== undefined) payload.emergency_contact = fields.emergencyContact;
    if (fields.emergencyPhone !== undefined) payload.emergency_phone = fields.emergencyPhone;

    const { data, error } = await client
      .from('students')
      .update(payload)
      .eq('id', studentId);

    if (error) {
      console.error('Supabase student update error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Supabase student update exception:', err);
    return { success: false, error: err };
  }
}

/**
 * ============================================================================
 * SUPABASE CLOUD DRIVING SLOT & CONCURRENT BOOKING SYNC
 * ============================================================================
 */

export async function fetchSlotsFromSupabase(dateStr) {
  const client = getSupabaseClient();
  if (!client) return { success: false, data: [] };

  try {
    let query = client.from('slots').select('*');
    if (dateStr) {
      query = query.eq('date', dateStr);
    }
    const { data, error } = await query;
    if (error) {
      console.warn('Error reading slots from Supabase:', error);
      return { success: false, error, data: [] };
    }
    const mapped = (data || []).map(row => ({
      id: row.id,
      name: row.name || `${row.time_display || row.start_time} Practical Driving Slot`,
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      timeDisplay: row.time_display || `${row.start_time} – ${row.end_time}`,
      status: row.status || 'Available',
      capacity: row.capacity || null,
      location: row.location || 'Pulivendula Academy Track',
      description: row.description || '',
      assignedTrainerId: row.assigned_trainer_id || null,
      courseId: row.course_id || 'ALL',
      createdBy: row.created_by || 'ADMIN',
      isDefault: false
    }));
    return { success: true, data: mapped };
  } catch (err) {
    console.warn('Supabase fetch slots exception:', err);
    return { success: false, error: err, data: [] };
  }
}

export async function fetchBookingsFromSupabase(dateStr, filters = {}) {
  const client = getSupabaseClient();
  if (!client) return { success: false, data: [] };

  try {
    let query = client.from('slot_bookings').select('*');
    if (dateStr) query = query.eq('date', dateStr);
    if (filters.traineeId) query = query.eq('trainee_id', filters.traineeId);
    if (filters.trainerId) query = query.eq('trainer_id', filters.trainerId);
    if (filters.status) query = query.eq('status', filters.status);

    const { data, error } = await query.order('start_time', { ascending: true });
    if (error) {
      console.warn('Error reading slot bookings from Supabase:', error);
      return { success: false, error, data: [] };
    }
    return { success: true, data: data || [] };
  } catch (err) {
    console.warn('Supabase fetch bookings exception:', err);
    return { success: false, error: err, data: [] };
  }
}

/**
 * Atomic Slot Booking via Supabase Stored Procedure
 * Enforces row-level lock, capacity validation (trainers * 2),
 * and duplicate check.
 */
export async function bookSlotInSupabase({
  bookingId,
  slotId,
  date,
  startTime,
  endTime,
  traineeId,
  traineeName,
  course,
  bookedBy,
  preferredTrainerId
}) {
  const client = getSupabaseClient();
  if (!client) return { success: false, offline: true };

  try {
    const { data, error } = await client.rpc('book_driving_slot_atomic', {
      p_booking_id: bookingId,
      p_slot_id: slotId,
      p_date: date,
      p_start_time: startTime,
      p_end_time: endTime,
      p_trainee_id: traineeId,
      p_trainee_name: traineeName,
      p_course: course || 'Practical Driving Class',
      p_booked_by: bookedBy || traineeName,
      p_preferred_trainer_id: preferredTrainerId || null
    });

    if (error) {
      console.error('Supabase atomic booking error:', error);
      return { success: false, message: error.message || 'Slot booking failed in database', error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Supabase book slot exception:', err);
    return { success: false, message: err.message || 'Database connection error', error: err };
  }
}

/**
 * Cancel a booking atomically in Supabase
 */
export async function cancelSlotBookingInSupabase(bookingId, cancelledBy, reason = '') {
  const client = getSupabaseClient();
  if (!client) return { success: false, offline: true };

  try {
    const { data, error } = await client.rpc('cancel_driving_slot_booking_atomic', {
      p_booking_id: bookingId,
      p_cancelled_by: cancelledBy,
      p_reason: reason
    });

    if (error) {
      console.error('Supabase cancel booking error:', error);
      return { success: false, message: error.message, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Supabase cancel slot booking exception:', err);
    return { success: false, error: err };
  }
}

/**
 * Upsert Slot Definition in Supabase
 */
export async function saveSlotToSupabase(slot) {
  const client = getSupabaseClient();
  if (!client) return { success: false, offline: true };

  try {
    const payload = {
      id: slot.id,
      name: slot.name || `${slot.timeDisplay || slot.startTime} Practical Driving Slot`,
      date: slot.date,
      start_time: slot.startTime,
      end_time: slot.endTime,
      time_display: slot.timeDisplay || `${slot.startTime} – ${slot.endTime}`,
      status: (slot.status || 'AVAILABLE').toUpperCase(),
      capacity: slot.capacity || null,
      location: slot.location || 'Pulivendula Academy Track',
      description: slot.description || '',
      assigned_trainer_id: slot.assignedTrainerId || null,
      course_id: slot.courseId || 'ALL',
      created_by: slot.createdBy || 'ADMIN'
    };

    const { data, error } = await client
      .from('slots')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase slot save warning:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.warn('Supabase slot save exception:', err);
    return { success: false, error: err };
  }
}

/**
 * Trainer Slot Availability in Supabase
 */
export async function updateTrainerAvailabilityInSupabase(trainerId, date, slotTime, isAvailable, reason = '') {
  const client = getSupabaseClient();
  if (!client) return { success: false, offline: true };

  try {
    const id = `AVAIL-${trainerId}-${date}-${slotTime.replace(/[^a-zA-Z0-9]/g, '')}`;
    const payload = {
      id,
      trainer_id: trainerId,
      date,
      slot_time: slotTime,
      is_available: isAvailable,
      reason
    };

    const { data, error } = await client
      .from('trainer_slot_availability')
      .upsert(payload, { onConflict: 'trainer_id,date,slot_time' });

    if (error) {
      console.warn('Supabase trainer availability update warning:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
}
