/* ==========================================================================
   REACTIVE STATE STORE & MOCK DATA
   GAFOOR DRIVING SCHOOL — PULIVENDULA, ANDHRA PRADESH
   "Walk in & Drive out"
   Accredited by Andhra Pradesh Motor Vehicles Department (AP RTO Pulivendula / Kadapa)
   All copy, roles, and candidate records formatted in English words only.
   ========================================================================== */

const STORAGE_KEY = 'gafoor_driving_school_v1_pulivendula_state';

const INITIAL_TRAINERS = [
  { 
    id: 'TRN-1', 
    name: 'K. Srinivas Rao', 
    role: 'Senior Master Instructor (18+ Years Experience)', 
    specialty: 'Pulivendula RTO 8-Track & Half-Clutch Balance Mastery', 
    rating: 4.96, 
    activeStudents: 8, 
    car: 'Maruti Suzuki Swift Dual-Ctrl #AP-04-ED-4041',
    phone: '+91 98480 11223',
    email: 'srinivas.rao@gafoordriving.in'
  },
  { 
    id: 'TRN-2', 
    name: 'Anitha Reddy', 
    role: 'Senior Lady Driving Specialist & Mentor', 
    specialty: 'Confidence Building & Pulivendula Town Traffic Navigation', 
    rating: 4.95, 
    activeStudents: 7, 
    car: 'Hyundai Grand i10 Dual-Ctrl #AP-04-AB-2020',
    phone: '+91 94401 22334',
    email: 'anitha.reddy@gafoordriving.in'
  },
  { 
    id: 'TRN-3', 
    name: 'M. Venkataramana', 
    role: 'Kadapa Highway & Ghat Road Lead Trainer', 
    specialty: 'Pulivendula Ghat Incline, Night Driving & Highway Speed Control', 
    rating: 4.88, 
    activeStudents: 6, 
    car: 'Tata Punch Dual-Ctrl #AP-04-CT-7072',
    phone: '+91 98665 33445',
    email: 'm.venkat@gafoordriving.in'
  },
  { 
    id: 'TRN-4', 
    name: 'D. Ravi Kumar', 
    role: 'AP RTO Ground Test Specialist', 
    specialty: 'H-Track, Reverse Bay Docking & Pulivendula Sensor Compliance', 
    rating: 4.92, 
    activeStudents: 7, 
    car: 'Maruti WagonR Dual-Ctrl #AP-04-KL-8088',
    phone: '+91 99890 55667',
    email: 'ravi.kumar@gafoordriving.in'
  }
];

const INITIAL_TRAINEES = [
  {
    id: 'APX-9021',
    name: 'Sai Kiran Varma',
    email: 'sai.kiran@gafoordriving.in',
    phone: '+91 98480 22334',
    permitNumber: 'AP004/LLR/2026/8941',
    address: 'Bakarapuram, Pulivendula, AP',
    emergencyContact: 'Suresh Varma (Father)',
    emergencyPhone: '+91 98480 99881',
    assignedTrainerId: 'TRN-1',
    currentDay: 14,
    totalDays: 20,
    category: 'highway',
    status: 'Active',
    registeredDate: '2026-08-12',
    package: '20-Day Comprehensive Licensing Package',
    avatar: 'SK',
    attendanceRate: '100%',
    paymentStatus: 'partial'
  },
  {
    id: 'APX-9022',
    name: 'Lavanya Goud',
    email: 'lavanya.goud@gafoordriving.in',
    phone: '+91 94401 55678',
    permitNumber: 'AP004/LLR/2026/4102',
    address: 'Kadapa Road, Pulivendula, AP',
    emergencyContact: 'Rajesh Goud (Husband)',
    emergencyPhone: '+91 94401 11220',
    assignedTrainerId: 'TRN-2',
    currentDay: 7,
    totalDays: 20,
    category: 'street',
    status: 'Active',
    registeredDate: '2026-08-25',
    package: 'Ladies Special Mentorship Package',
    avatar: 'LG',
    attendanceRate: '95%',
    paymentStatus: 'paid'
  },
  {
    id: 'APX-9023',
    name: 'Harika Chowdary',
    email: 'harika.c@gafoordriving.in',
    phone: '+91 98665 12090',
    permitNumber: 'AP004/LLR/2026/7788',
    address: 'JNTU Campus Road, Pulivendula, AP',
    emergencyContact: 'Srinivasa Rao (Father)',
    emergencyPhone: '+91 98665 99001',
    assignedTrainerId: 'TRN-2',
    currentDay: 20,
    totalDays: 20,
    category: 'test',
    status: 'Graduating',
    registeredDate: '2026-08-01',
    package: '20-Day Comprehensive Licensing Package',
    avatar: 'HC',
    attendanceRate: '100%',
    paymentStatus: 'paid'
  },
  {
    id: 'APX-9024',
    name: 'Vamshi Krishna',
    email: 'vamshi.k@gafoordriving.in',
    phone: '+91 99890 44321',
    permitNumber: 'AP004/LLR/2026/1209',
    address: 'Near RTC Bus Stand, Pulivendula, AP',
    emergencyContact: 'Venkateshwarlu (Brother)',
    emergencyPhone: '+91 99890 11990',
    assignedTrainerId: 'TRN-3',
    currentDay: 3,
    totalDays: 20,
    category: 'street',
    status: 'Active',
    registeredDate: '2026-09-05',
    package: 'City Traffic & 8-Track Mastery',
    avatar: 'VK',
    attendanceRate: '100%',
    paymentStatus: 'pending'
  },
  {
    id: 'APX-9025',
    name: 'Sneha Reddy',
    email: 'sneha.r@gafoordriving.in',
    phone: '+91 97012 33445',
    permitNumber: 'AP004/LLR/2026/6634',
    address: 'Shilparamam Ring Road, Pulivendula, AP',
    emergencyContact: 'Kishore Reddy (Father)',
    emergencyPhone: '+91 97012 88990',
    assignedTrainerId: 'TRN-1',
    currentDay: 11,
    totalDays: 20,
    category: 'highway',
    status: 'Active',
    registeredDate: '2026-08-18',
    package: '20-Day Comprehensive Licensing Package',
    avatar: 'SR',
    attendanceRate: '92%',
    paymentStatus: 'paid'
  },
  {
    id: 'APX-9026',
    name: 'Karthik Raju',
    email: 'karthik.raju@gafoordriving.in',
    phone: '+91 91210 77889',
    permitNumber: 'AP004/LLR/2026/3312',
    address: 'Bypass Road, Pulivendula, AP',
    emergencyContact: 'Ramakrishnam Raju (Uncle)',
    emergencyPhone: '+91 91210 22331',
    assignedTrainerId: 'TRN-4',
    currentDay: 9,
    totalDays: 20,
    category: 'street',
    status: 'Active',
    registeredDate: '2026-08-20',
    package: 'City Traffic & 8-Track Mastery',
    avatar: 'KR',
    attendanceRate: '88%',
    paymentStatus: 'partial'
  },
  {
    id: 'APX-9027',
    name: 'Divya Bharathi',
    email: 'divya.b@gafoordriving.in',
    phone: '+91 93901 88900',
    permitNumber: 'AP004/LLR/2026/5521',
    address: 'Main Bazaar Road, Pulivendula, AP',
    emergencyContact: 'Srinivas (Father)',
    emergencyPhone: '+91 93901 22110',
    assignedTrainerId: 'TRN-2',
    currentDay: 18,
    totalDays: 20,
    category: 'highway',
    status: 'Active',
    registeredDate: '2026-08-05',
    package: '20-Day Comprehensive Licensing Package',
    avatar: 'DB',
    attendanceRate: '96%',
    paymentStatus: 'overdue'
  },
  {
    id: 'APX-9028',
    name: 'Manoj Kumar',
    email: 'manoj.k@gafoordriving.in',
    phone: '+91 98499 11223',
    permitNumber: 'AP004/LLR/2026/9012',
    address: 'Vempalli Road, Pulivendula, AP',
    emergencyContact: 'Suryanarayana (Father)',
    emergencyPhone: '+91 98499 77881',
    assignedTrainerId: 'TRN-3',
    currentDay: 1,
    totalDays: 20,
    category: 'street',
    status: 'New Intake',
    registeredDate: '2026-09-15',
    package: 'City Traffic & 8-Track Mastery',
    avatar: 'MK',
    attendanceRate: '100%',
    paymentStatus: 'pending'
  }
];

const INITIAL_PAYMENTS = [
  { id: 'INV-4011', traineeId: 'APX-9021', traineeName: 'Sai Kiran Varma', package: '20-Day Comprehensive', amount: 7500, paid: 4500, balance: 3000, dueDate: '2026-09-22', status: 'partial', method: 'UPI (PhonePe QR)' },
  { id: 'INV-4012', traineeId: 'APX-9022', traineeName: 'Lavanya Goud', package: 'Ladies Special Batch', amount: 8500, paid: 8500, balance: 0, dueDate: '2026-09-10', status: 'paid', method: 'Google Pay UPI' },
  { id: 'INV-4013', traineeId: 'APX-9023', traineeName: 'Harika Chowdary', package: '20-Day Comprehensive', amount: 7500, paid: 7500, balance: 0, dueDate: '2026-08-20', status: 'paid', method: 'BHIM UPI Transfer' },
  { id: 'INV-4014', traineeId: 'APX-9024', traineeName: 'Vamshi Krishna', package: 'City & Track Mastery', amount: 5500, paid: 0, balance: 5500, dueDate: '2026-09-20', status: 'pending', method: 'Pending UPI Verification' },
  { id: 'INV-4015', traineeId: 'APX-9025', traineeName: 'Sneha Reddy', package: '20-Day Comprehensive', amount: 7500, paid: 7500, balance: 0, dueDate: '2026-08-28', status: 'paid', method: 'Paytm UPI' },
  { id: 'INV-4016', traineeId: 'APX-9026', traineeName: 'Karthik Raju', package: 'City & Track Mastery', amount: 5500, paid: 2500, balance: 3000, dueDate: '2026-09-25', status: 'partial', method: 'Cash at Branch' },
  { id: 'INV-4017', traineeId: 'APX-9027', traineeName: 'Divya Bharathi', package: '20-Day Comprehensive', amount: 7500, paid: 3500, balance: 4000, dueDate: '2026-09-02', status: 'overdue', method: 'Late Notice Sent' },
  { id: 'INV-4018', traineeId: 'APX-9028', traineeName: 'Manoj Kumar', package: 'City & Track Mastery', amount: 5500, paid: 0, balance: 5500, dueDate: '2026-09-29', status: 'pending', method: 'Awaiting UPI Deposit' }
];

const INITIAL_SCHEDULE = [
  { id: 'SLOT-1', time: '07:30 AM – 09:00 AM', traineeId: 'APX-9022', studentName: 'Lavanya Goud', topic: 'Day 7: Pulivendula RTO H-Track & Reverse Bay Docking', car: 'Hyundai Grand i10 Dual-Ctrl #AP-04-AB-2020', attendance: 'present' },
  { id: 'SLOT-2', time: '09:30 AM – 11:00 AM', traineeId: 'APX-9021', studentName: 'Sai Kiran Varma', topic: 'Day 14: Pulivendula Bypass Incline & Half-Clutch Hold', car: 'Maruti Suzuki Swift Dual-Ctrl #AP-04-ED-4041', attendance: 'present' },
  { id: 'SLOT-3', time: '02:00 PM – 03:30 PM', traineeId: 'APX-9023', studentName: 'Harika Chowdary', topic: 'Day 20: Official Pulivendula RTO Automated Driving Test Mock Exam', car: 'Hyundai Grand i10 Dual-Ctrl #AP-04-AB-2020', attendance: 'late' },
  { id: 'SLOT-4', time: '04:00 PM – 05:30 PM', traineeId: 'APX-9024', studentName: 'Vamshi Krishna', topic: 'Day 3: Clutch Modulation, Biting Point & 3-Point Turn', car: 'Tata Punch Dual-Ctrl #AP-04-CT-7072', attendance: 'none' }
];

const CURRICULUM_DAYS = [
  { day: 1, category: 'street', title: 'Vehicle Cockpit Drill & Controls', desc: 'ABC (Accelerator, Brake, Clutch) orientation, mirror positioning, seat ergonomics, and blind-spot identification.' },
  { day: 2, category: 'street', title: 'Smooth Moving & Progressive Braking', desc: 'Gentle creeping in 1st gear, threshold braking without jerks, and 1st to 2nd gear transition.' },
  { day: 3, category: 'street', title: 'Half-Clutch Modulation & Biting Point', desc: 'Discovering the friction bite point, low-speed crawling without stalling, and 3-point street turnaround.' },
  { day: 4, category: 'street', title: 'Steering Rotation & Controlled U-Turns', desc: 'Hand-over-hand steering rhythm, indicator discipline, and pedestrian yielding at intersections.' },
  { day: 5, category: 'street', title: 'RTO 8-Track Forward Arc Alignment', desc: 'Entering the official figure-8 circuit, maintaining arc trajectory, and zero pole collision penalty.' },
  { day: 6, category: 'street', title: 'RTO 8-Track Reverse Navigation', desc: 'Reverse 8-track maneuvers using side mirrors, steady reverse creeping, and reverse steering geometry.' },
  { day: 7, category: 'street', title: 'RTO H-Track & Perpendicular Bay Docking', desc: 'Navigating into the narrow H-track bay, reverse 45-degree angle entry, and centered curbside docking.' },
  { day: 8, category: 'street', title: 'Traffic Signals & Intersection Rules', desc: 'Stop lines, zebra crossings, signal light sequence, and traffic circle (roundabout) right of way.' },
  { day: 9, category: 'street', title: 'Pulivendula Ghat Incline & Hill Hold Balance', desc: 'Handbrake coordination on steep inclines and flyovers, zero rollback half-clutch start technique.' },
  { day: 10, category: 'street', title: 'Bumper-to-Bumper Pulivendula Town Traffic Crawling', desc: 'Heavy town traffic micro-navigation, auto-rickshaw and bike scanning, and anti-stall clutch modulation.' },
  { day: 11, category: 'highway', title: '4-Lane Kadapa-Pulivendula Highway Entry', desc: 'Merging from service roads to main highway flow, 3-second buffer rule, and cruising at 60+ km/h.' },
  { day: 12, category: 'highway', title: 'Highway Lane Keeping & Mirror Check Rhythm', desc: 'Lane discipline, mirror-signal-maneuver routine, crosswind compensation, and blind spot sweeps.' },
  { day: 13, category: 'highway', title: 'Commercial Vehicle & Bus Overtaking', desc: 'Anticipating heavy vehicle blind spots, speed differential calculation, and safe return to cruising lane.' },
  { day: 14, category: 'highway', title: 'Pulivendula Ring Road Junction & Deceleration', desc: 'High-speed deceleration lane approach, curved ramp speed control, and exit ramp signage awareness.' },
  { day: 15, category: 'highway', title: 'Monsoon Wet Road & Skid Prevention', desc: 'Hydroplaning mitigation, extended stopping distance, defogger and wiper operation on wet tarmac.' },
  { day: 16, category: 'highway', title: 'Night Driving & High-Beam Discipline', desc: 'Headlight glare reduction, low-beam etiquette, and nocturnal pedestrian hazard recognition.' },
  { day: 17, category: 'highway', title: 'Narrow Pulivendula Bazaar Street Micro-Steering', desc: 'Navigating tight residential lanes with parked bikes, horn courtesy, and spatial clearance judgment.' },
  { day: 18, category: 'highway', title: 'Emergency Braking & Shoulder Pull-Off', desc: 'Controlled threshold emergency stop, hazard light activation, and vehicle triangle placement.' },
  { day: 19, category: 'test', title: 'Pulivendula RTO Automated Sensor Track Rehearsal', desc: 'Full automated driving test simulation covering 8-track, H-track, gradient stop, and S-bend.' },
  { day: 20, category: 'test', title: 'Official AP RTO Driving License Test & Graduation', desc: 'Independent examination with Motor Vehicle Inspector (MVI) and certificate of competency issuance.' }
];

class Store {
  constructor() {
    this.listeners = [];
    this.loadState();
  }

  loadState() {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        this.currentRole = parsed.currentRole || 'admin';
        this.trainers = parsed.trainers || INITIAL_TRAINERS;
        this.trainees = parsed.trainees || INITIAL_TRAINEES;
        this.payments = parsed.payments || INITIAL_PAYMENTS;
        this.schedule = parsed.schedule || INITIAL_SCHEDULE;
        this.traineeTestDay = parsed.traineeTestDay || 14;
        this.feedbackSubmitted = parsed.feedbackSubmitted || false;
        return;
      }
    } catch (e) {
      console.warn('Failed to load cached store state, using defaults', e);
    }

    this.currentRole = 'admin';
    this.trainers = INITIAL_TRAINERS;
    this.trainees = INITIAL_TRAINEES;
    this.payments = INITIAL_PAYMENTS;
    this.schedule = INITIAL_SCHEDULE;
    this.traineeTestDay = 14;
    this.feedbackSubmitted = false;
    this.saveState();
  }

  saveState() {
    try {
      const payload = {
        currentRole: this.currentRole,
        trainers: this.trainers,
        trainees: this.trainees,
        payments: this.payments,
        schedule: this.schedule,
        traineeTestDay: this.traineeTestDay,
        feedbackSubmitted: this.feedbackSubmitted
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(event, payload) {
    this.saveState();
    this.listeners.forEach(fn => fn(event, payload));
  }

  setRole(role) {
    this.currentRole = role;
    this.notify('ROLE_CHANGED', role);
  }

  getRole() {
    return this.currentRole;
  }

  assignTrainer(traineeId, newTrainerId) {
    const trainee = this.trainees.find(t => t.id === traineeId);
    const trainer = this.trainers.find(tr => tr.id === newTrainerId);
    if (!trainee || !trainer) return false;

    trainee.assignedTrainerId = newTrainerId;
    this.notify('TRAINER_ASSIGNED', { trainee, trainer });
    return true;
  }

  addTrainer(data) {
    const newId = `TRN-${this.trainers.length + 1}`;
    const newTrainer = {
      id: newId,
      name: data.name,
      role: data.role || 'Certified Motor Driving Instructor',
      specialty: data.specialty || 'RTO Track & City Traffic Navigation',
      rating: parseFloat(data.rating) || 4.90,
      activeStudents: 0,
      car: data.car || 'Maruti Suzuki Swift Dual-Ctrl #AP-04-ED-9001',
      phone: data.phone || '+91 98480 00112',
      email: `${data.name.toLowerCase().replace(/\s+/g, '.')}@gafoordriving.in`
    };
    this.trainers.push(newTrainer);
    this.notify('TRAINER_ADDED', newTrainer);
    return newTrainer;
  }

  updateTrainer(trainerId, updatedData) {
    const trainer = this.trainers.find(tr => tr.id === trainerId);
    if (!trainer) return false;

    Object.assign(trainer, updatedData);
    this.notify('TRAINER_UPDATED', trainer);
    return true;
  }

  addTrainee(data) {
    const newId = `APX-${9020 + this.trainees.length + 1}`;
    const initials = data.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'ST';
    const trainee = {
      id: newId,
      name: data.name,
      email: data.email || `${data.name.toLowerCase().replace(/\s+/g, '.')}@gafoordriving.in`,
      phone: data.phone || '+91 98480 00000',
      permitNumber: data.permitNumber || `AP004/LLR/2026/${Math.floor(1000 + Math.random() * 9000)}`,
      address: data.address || 'Pulivendula, Andhra Pradesh',
      emergencyContact: data.emergencyContact || 'Guardian / Family Contact',
      emergencyPhone: data.emergencyPhone || '+91 98480 11222',
      assignedTrainerId: data.assignedTrainerId || 'TRN-1',
      currentDay: 1,
      totalDays: 20,
      category: 'street',
      status: 'Active',
      registeredDate: new Date().toISOString().split('T')[0],
      package: data.package || '20-Day Comprehensive Licensing Package',
      avatar: initials,
      attendanceRate: '100%',
      paymentStatus: data.paymentStatus || 'pending'
    };

    this.trainees.unshift(trainee);

    // Create payment ledger entry in ₹ INR
    const invoiceId = `INV-${4010 + this.payments.length + 1}`;
    const amount = trainee.package.includes('20') ? 7500 : (trainee.package.includes('Ladies') ? 8500 : 5500);
    const paid = trainee.paymentStatus === 'paid' ? amount : (trainee.paymentStatus === 'partial' ? 3500 : 0);
    this.payments.unshift({
      id: invoiceId,
      traineeId: trainee.id,
      traineeName: trainee.name,
      package: trainee.package,
      amount: amount,
      paid: paid,
      balance: amount - paid,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: trainee.paymentStatus,
      method: 'UPI (PhonePe / Google Pay QR)'
    });

    this.notify('TRAINEE_ADDED', trainee);
    return trainee;
  }

  updateTrainee(traineeId, updatedFields) {
    const trainee = this.trainees.find(t => t.id === traineeId);
    if (!trainee) return false;

    Object.assign(trainee, updatedFields);
    this.notify('TRAINEE_UPDATED', trainee);
    return true;
  }

  recordPayment(invoiceId, paidAddition) {
    const invoice = this.payments.find(p => p.id === invoiceId);
    if (!invoice) return false;

    const addition = parseFloat(paidAddition) || 0;
    invoice.paid = Math.min(invoice.amount, invoice.paid + addition);
    invoice.balance = invoice.amount - invoice.paid;
    if (invoice.balance === 0) {
      invoice.status = 'paid';
    } else {
      invoice.status = 'partial';
    }

    const trainee = this.trainees.find(t => t.id === invoice.traineeId);
    if (trainee) {
      trainee.paymentStatus = invoice.status;
    }

    this.notify('PAYMENT_RECORDED', invoice);
    return true;
  }

  updateAttendance(slotId, status) {
    const slot = this.schedule.find(s => s.id === slotId);
    if (!slot) return false;

    slot.attendance = status;
    this.notify('ATTENDANCE_UPDATED', slot);
    return true;
  }

  setTraineeTestDay(dayNumber) {
    this.traineeTestDay = parseInt(dayNumber, 10);
    const mainTrainee = this.trainees.find(t => t.id === 'APX-9021');
    if (mainTrainee) {
      mainTrainee.currentDay = this.traineeTestDay;
      if (this.traineeTestDay <= 10) {
        mainTrainee.category = 'street';
      } else if (this.traineeTestDay < 20) {
        mainTrainee.category = 'highway';
      } else {
        mainTrainee.category = 'test';
      }
    }
    this.notify('TRAINEE_DAY_CHANGED', this.traineeTestDay);
  }

  submitFeedback(feedbackData) {
    this.feedbackSubmitted = true;
    this.notify('FEEDBACK_SUBMITTED', feedbackData);
  }

  getTrainerById(id) {
    return this.trainers.find(tr => tr.id === id);
  }

  getCurriculum() {
    return CURRICULUM_DAYS;
  }
}

export const store = new Store();
