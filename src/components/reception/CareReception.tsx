import React, { useState } from 'react';
import {
  UserPlus,
  CalendarCheck,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
  Users,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useCareOS } from '../../services/store';
import { DepartmentType, PriorityClass } from '../../types/hospital';

export const CareReception: React.FC = () => {
  const {
    patients,
    doctors,
    appointments,
    queueEntries,
    registerPatient,
    bookAppointment,
    checkInPatient,
  } = useCareOS();

  const [activeTab, setActiveTab] = useState<'checkin' | 'book' | 'register'>('checkin');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');

  // New Patient Form
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: 35,
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    phone: '',
    email: '',
    emergencyContact: '',
    bloodGroup: 'B+',
    address: 'Visakhapatnam, AP',
  });
  const [registeredSuccess, setRegisteredSuccess] = useState<string | null>(null);

  // Booking Form
  const [bookingPatientId, setBookingPatientId] = useState(patients[0]?.id || '');
  const [bookingDept, setBookingDept] = useState<DepartmentType>('Cardiology');
  const [bookingDoctorId, setBookingDoctorId] = useState(doctors[0]?.id || '');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [bookingReason, setBookingReason] = useState('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Check-in Priority
  const [checkinPriority, setCheckinPriority] = useState<PriorityClass>('P3_SCHEDULED');

  // Metrics
  const checkedInCount = queueEntries.filter((q) => q.state !== 'CANCELLED').length;
  const waitingCount = queueEntries.filter((q) => q.state === 'WAITING').length;
  const completedCount = queueEntries.filter((q) => q.state === 'COMPLETED').length;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.phone) {
      alert('Patient name and phone number are required.');
      return;
    }
    const created = registerPatient(newPatient);
    setRegisteredSuccess(`Successfully registered ${created.name}! Generated ${created.uhid}.`);
    setBookingPatientId(created.id);
    setNewPatient({
      name: '',
      age: 35,
      gender: 'Male',
      phone: '',
      email: '',
      emergencyContact: '',
      bloodGroup: 'B+',
      address: 'Visakhapatnam, AP',
    });
    setTimeout(() => setRegisteredSuccess(null), 5000);
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setBookingSuccess(null);

    const res = bookAppointment({
      patientId: bookingPatientId,
      doctorId: bookingDoctorId,
      scheduledTime: bookingTime,
      date: '2026-10-24',
      type: 'scheduled',
      reason: bookingReason || 'General OPD Consultation',
    });

    if (res.success && res.appointment) {
      setBookingSuccess(`Appointment booked successfully! Ref: ${res.appointment.id}. Ready for check-in.`);
      setBookingReason('');
    } else {
      setBookingError(res.error || 'Failed to book appointment');
    }
  };

  // Filtered appointments for checkin
  const filteredAppointments = appointments.filter((apt) => {
    const q = searchTerm.toLowerCase();
    return (
      apt.patientName.toLowerCase().includes(q) ||
      apt.patientPhone.includes(q) ||
      apt.doctorName.toLowerCase().includes(q) ||
      apt.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-[#536B7E] block mb-1">Today's Appointments</span>
          <span className="text-2xl font-bold font-mono text-[#243746] tabular-nums">
            {appointments.length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-[#536B7E] block mb-1">Checked-In Patients</span>
          <span className="text-2xl font-bold font-mono text-[#0F9D8A] tabular-nums">
            {checkedInCount}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-[#536B7E] block mb-1">In Waiting Hall</span>
          <span className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
            {waitingCount}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-[#536B7E] block mb-1">Completed Visits</span>
          <span className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
            {completedCount}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('checkin')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'checkin'
              ? 'bg-[#0F9D8A] text-white shadow-xs'
              : 'text-[#243746] hover:text-[#0F9D8A] hover:bg-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Patient Check-In Desk</span>
        </button>

        <button
          onClick={() => setActiveTab('book')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'book'
              ? 'bg-[#0F9D8A] text-white shadow-xs'
              : 'text-[#243746] hover:text-[#0F9D8A] hover:bg-white'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>

        <button
          onClick={() => setActiveTab('register')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'register'
              ? 'bg-[#0F9D8A] text-white shadow-xs'
              : 'text-[#243746] hover:text-[#0F9D8A] hover:bg-white'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Tab 1: Check-in Desk */}
      {activeTab === 'checkin' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#243746]">Outpatient Arrival &amp; Check-In</h3>
              <p className="text-xs text-[#536B7E]">
                Confirm patient arrival, assign priority class, and issue instant queue token.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search patient, phone, doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#F8FCFB] border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#243746] outline-none w-64 focus:border-[#0F9D8A]"
                />
              </div>

              <select
                value={checkinPriority}
                onChange={(e) => setCheckinPriority(e.target.value as PriorityClass)}
                className="bg-[#F8FCFB] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-[#243746] outline-none cursor-pointer"
                title="Default Priority for Check-in"
              >
                <option value="P3_SCHEDULED">P3 - Scheduled</option>
                <option value="P2_TIME_SENSITIVE">P2 - Time Sensitive</option>
                <option value="P2A_ASSISTANCE">P2A - Elderly / Wheelchair</option>
                <option value="P1_EMERGENCY">P1 - Emergency Escalation</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#E8F7F3]/70 text-[#243746] uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Patient Details</th>
                  <th className="py-2.5 px-3">Doctor &amp; Dept</th>
                  <th className="py-2.5 px-3">Scheduled Slot</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((apt) => {
                  const isCheckedIn = apt.status === 'checked_in';
                  const activeQueueEntry = queueEntries.find((q) => q.appointmentId === apt.id);

                  return (
                    <tr key={apt.id} className="hover:bg-[#F8FCFB] transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-[#243746] block">{apt.patientName}</span>
                        <span className="text-[11px] text-[#536B7E] font-mono">{apt.patientPhone}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[#243746] font-medium block">{apt.doctorName}</span>
                        <span className="text-[10px] text-[#536B7E]">{apt.department}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[#243746]">
                        {apt.scheduledTime}
                      </td>
                      <td className="py-3 px-3">
                        {isCheckedIn ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#E8F7F3] text-[#0F9D8A] border border-[#0F9D8A]/30">
                            <CheckCircle className="w-3 h-3" />
                            {activeQueueEntry ? activeQueueEntry.token : 'Checked In'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600 border border-slate-200">
                            Booked
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isCheckedIn ? (
                          <span className="text-[11px] text-[#536B7E] font-mono">
                            Wait: ~{activeQueueEntry?.estimatedWaitMinutes ?? 0}m
                          </span>
                        ) : (
                          <button
                            onClick={() => checkInPatient(apt.id, checkinPriority)}
                            className="px-3 py-1 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white text-xs font-bold rounded transition-colors shadow-xs cursor-pointer"
                          >
                            Check-In Patient
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Book Appointment */}
      {activeTab === 'book' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 max-w-2xl">
          <h3 className="text-sm font-bold text-[#243746] mb-1">Book Outpatient Consultation</h3>
          <p className="text-xs text-[#536B7E] mb-4">
            CareOS validates clinician availability in real-time to prevent overlapping schedule conflicts.
          </p>

          {bookingError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{bookingError}</span>
            </div>
          )}

          {bookingSuccess && (
            <div className="mb-4 p-3 bg-[#E8F7F3] border border-[#0F9D8A]/30 rounded-lg text-[#0F9D8A] text-xs flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{bookingSuccess}</span>
            </div>
          )}

          <form onSubmit={handleBook} className="space-y-4 text-xs">
            <div>
              <label className="text-[#243746] font-semibold block mb-1">Select Patient</label>
              <select
                value={bookingPatientId}
                onChange={(e) => setBookingPatientId(e.target.value)}
                className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2.5 text-[#243746] outline-none focus:border-[#0F9D8A]"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.uhid}) — {p.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[#243746] font-semibold block mb-1">Department</label>
                <select
                  value={bookingDept}
                  onChange={(e) => {
                    const dept = e.target.value as DepartmentType;
                    setBookingDept(dept);
                    const doc = doctors.find((d) => d.department === dept);
                    if (doc) setBookingDoctorId(doc.id);
                  }}
                  className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2.5 text-[#243746] outline-none focus:border-[#0F9D8A]"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Neurology">Neurology</option>
                </select>
              </div>

              <div>
                <label className="text-[#243746] font-semibold block mb-1">Clinician</label>
                <select
                  value={bookingDoctorId}
                  onChange={(e) => setBookingDoctorId(e.target.value)}
                  className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2.5 text-[#243746] outline-none focus:border-[#0F9D8A]"
                >
                  {doctors
                    .filter((d) => d.department === bookingDept)
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.roomNumber})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[#243746] font-semibold block mb-1">Time Slot</label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2.5 text-[#243746] outline-none focus:border-[#0F9D8A] font-mono"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="09:15 AM">09:15 AM</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="09:45 AM">09:45 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="10:15 AM">10:15 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                </select>
              </div>

              <div>
                <label className="text-[#243746] font-semibold block mb-1">Date</label>
                <input
                  type="text"
                  disabled
                  value="Today (2026-10-24)"
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-[#536B7E] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[#243746] font-semibold block mb-1">Reason for Visit / Symptoms</label>
              <input
                type="text"
                placeholder="e.g. Chest heaviness, routine diabetic review, joint stiffness"
                value={bookingReason}
                onChange={(e) => setBookingReason(e.target.value)}
                className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2.5 text-[#243746] outline-none focus:border-[#0F9D8A]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Confirm Appointment &amp; Reserve Slot
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Register New Patient */}
      {activeTab === 'register' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 max-w-2xl">
          <h3 className="text-sm font-bold text-[#243746] mb-1">Register New Patient</h3>
          <p className="text-xs text-[#536B7E] mb-4">
            Generates standardized CareOS UHID (Unique Hospital Identifier) for Visakhapatnam Medical Center.
          </p>

          {registeredSuccess && (
            <div className="mb-4 p-3 bg-[#E8F7F3] border border-[#0F9D8A]/30 rounded-lg text-[#0F9D8A] text-xs flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{registeredSuccess}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[#243746] font-semibold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Srinivas Rao"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2.5 text-[#243746] outline-none focus:border-[#0F9D8A]"
                />
              </div>

              <div>
                <label className="text-[#243746] font-semibold block mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 98480 12345"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2.5 text-[#243746] outline-none focus:border-[#0F9D8A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[#243746] font-semibold block mb-1">Age</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({ ...newPatient, age: Number(e.target.value) })}
                  className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2.5 text-[#243746] outline-none focus:border-[#0F9D8A]"
                />
              </div>

              <div>
                <label className="text-[#243746] font-semibold block mb-1">Gender</label>
                <select
                  value={newPatient.gender}
                  onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as any })}
                  className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2.5 text-[#243746] outline-none focus:border-[#0F9D8A]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[#243746] font-semibold block mb-1">Blood Group</label>
                <select
                  value={newPatient.bloodGroup}
                  onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                  className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2.5 text-[#243746] outline-none focus:border-[#0F9D8A]"
                >
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="O+">O+</option>
                  <option value="AB+">AB+</option>
                  <option value="A-">A-</option>
                  <option value="B-">B-</option>
                  <option value="O-">O-</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[#243746] font-semibold block mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2.5 text-[#243746] outline-none focus:border-[#0F9D8A]"
                />
              </div>

              <div>
                <label className="text-[#243746] font-semibold block mb-1">Emergency Contact</label>
                <input
                  type="text"
                  placeholder="+91 98480 99999 (Relationship)"
                  value={newPatient.emergencyContact}
                  onChange={(e) => setNewPatient({ ...newPatient, emergencyContact: e.target.value })}
                  className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2.5 text-[#243746] outline-none focus:border-[#0F9D8A]"
                />
              </div>
            </div>

            <div>
              <label className="text-[#243746] font-semibold block mb-1">Address / Locality (Visakhapatnam)</label>
              <input
                type="text"
                placeholder="e.g. Madhurawada / MVP Colony / Gajuwaka"
                value={newPatient.address}
                onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                className="w-full bg-[#F8FCFB] border border-slate-200 rounded-lg p-2.5 text-[#243746] outline-none focus:border-[#0F9D8A]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-[#0F9D8A] hover:bg-[#0B7A6B] text-white font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Register Patient &amp; Issue UHID
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
