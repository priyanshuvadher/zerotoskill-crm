import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/mongodb';
import { signToken, hashPassword, verifyPassword, getUserFromRequest } from '@/lib/auth';

const ok = (data, status = 200) => NextResponse.json(data, { status });
const err = (message, status = 400) => NextResponse.json({ error: message }, { status });

async function requireAuth(request) {
  const u = getUserFromRequest(request);
  if (!u) return null;
  return u;
}

// ---------------- SEED ----------------
async function seedDemoData() {
  const db = await getDb();
  const existing = await db.collection('users').countDocuments();
  if (existing > 0) return { seeded: false, message: 'Data already exists' };

  const now = new Date().toISOString();

  const users = [
    { id: uuidv4(), name: 'Super Admin', email: 'admin@zerotoskill.com', password: await hashPassword('admin123'), role: 'super_admin', phone: '9999999999', avatar: '', createdAt: now },
    { id: uuidv4(), name: 'Priya Sharma', email: 'priya@zerotoskill.com', password: await hashPassword('faculty123'), role: 'faculty', phone: '9876543210', avatar: '', createdAt: now, specialization: 'Digital Marketing', rating: 4.8 },
    { id: uuidv4(), name: 'Rahul Verma', email: 'rahul@zerotoskill.com', password: await hashPassword('faculty123'), role: 'faculty', phone: '9876543211', avatar: '', createdAt: now, specialization: 'Graphic Design', rating: 4.9 },
    { id: uuidv4(), name: 'Anita Desai', email: 'anita@zerotoskill.com', password: await hashPassword('faculty123'), role: 'faculty', phone: '9876543212', avatar: '', createdAt: now, specialization: 'Video Editing', rating: 4.7 },
    { id: uuidv4(), name: 'Vikram Singh', email: 'vikram@zerotoskill.com', password: await hashPassword('counselor123'), role: 'counselor', phone: '9876543213', avatar: '', createdAt: now },
    { id: uuidv4(), name: 'Neha Patel', email: 'neha@zerotoskill.com', password: await hashPassword('manager123'), role: 'academic_manager', phone: '9876543214', avatar: '', createdAt: now },
  ];

  const students = [
    { name: 'Aarav Kumar', email: 'aarav@student.com', course: 'Digital Marketing' },
    { name: 'Diya Reddy', email: 'diya@student.com', course: 'Graphic Design' },
    { name: 'Ishaan Gupta', email: 'ishaan@student.com', course: 'Video Editing' },
    { name: 'Kavya Nair', email: 'kavya@student.com', course: 'Digital Marketing' },
    { name: 'Aditya Rao', email: 'aditya@student.com', course: 'AI Tools' },
  ];
  for (const s of students) {
    users.push({ id: uuidv4(), name: s.name, email: s.email, password: await hashPassword('student123'), role: 'student', phone: '90000' + Math.floor(10000 + Math.random()*90000), avatar: '', createdAt: now, course: s.course });
  }

  await db.collection('users').insertMany(users);

  const faculty = users.filter(u => u.role === 'faculty');
  const studentUsers = users.filter(u => u.role === 'student');

  // Batches
  const batches = [
    { id: uuidv4(), name: 'DM-Jun-2025', course: 'Digital Marketing', startDate: '2025-06-01', endDate: '2025-12-01', facultyId: faculty[0].id, facultyName: faculty[0].name, capacity: 40, createdAt: now },
    { id: uuidv4(), name: 'GD-Jun-2025', course: 'Graphic Design', startDate: '2025-06-05', endDate: '2025-11-05', facultyId: faculty[1].id, facultyName: faculty[1].name, capacity: 30, createdAt: now },
    { id: uuidv4(), name: 'VE-Jul-2025', course: 'Video Editing', startDate: '2025-07-01', endDate: '2025-12-15', facultyId: faculty[2].id, facultyName: faculty[2].name, capacity: 25, createdAt: now },
  ];
  await db.collection('batches').insertMany(batches);

  // Enroll students & create fees
  const fees = [];
  const courseFee = { 'Digital Marketing': 45000, 'Graphic Design': 35000, 'Video Editing': 40000, 'AI Tools': 30000 };
  for (const s of studentUsers) {
    const batch = batches.find(b => b.course === s.course) || batches[0];
    await db.collection('users').updateOne({ id: s.id }, { $set: { batchId: batch.id, batchName: batch.name, mentorId: batch.facultyId, mentorName: batch.facultyName } });
    const total = courseFee[s.course] || 30000;
    const paid = Math.random() > 0.5 ? total : Math.floor(total * (Math.random() * 0.7));
    fees.push({
      id: uuidv4(),
      studentId: s.id,
      studentName: s.name,
      studentEmail: s.email,
      course: s.course,
      batchId: batch.id,
      batchName: batch.name,
      totalAmount: total,
      paidAmount: paid,
      pendingAmount: total - paid,
      planType: Math.random() > 0.5 ? 'emi' : 'onetime',
      status: paid >= total ? 'paid' : (paid > 0 ? 'partial' : 'pending'),
      dueDate: '2025-08-15',
      installments: [
        { amount: Math.floor(total/3), dueDate: '2025-06-15', paid: paid >= Math.floor(total/3), paidDate: paid >= Math.floor(total/3) ? '2025-06-10' : null },
        { amount: Math.floor(total/3), dueDate: '2025-07-15', paid: paid >= Math.floor(2*total/3), paidDate: paid >= Math.floor(2*total/3) ? '2025-07-10' : null },
        { amount: total - 2 * Math.floor(total/3), dueDate: '2025-08-15', paid: paid >= total, paidDate: paid >= total ? '2025-08-10' : null },
      ],
      createdAt: now,
    });
  }
  await db.collection('fees').insertMany(fees);

  // Leads - Admission CRM pipeline
  const stages = ['inquiry', 'counseling', 'followup', 'confirmed', 'fees_pending', 'onboarded'];
  const leadNames = [
    ['Rohan Malhotra', 'Digital Marketing', 'Instagram Ad'],
    ['Sneha Iyer', 'Graphic Design', 'Website Form'],
    ['Karan Joshi', 'Video Editing', 'Referral'],
    ['Meera Kapoor', 'AI Tools', 'Google Ad'],
    ['Arjun Bhatia', 'Digital Marketing', 'Walk-in'],
    ['Riya Chawla', 'Graphic Design', 'YouTube Ad'],
    ['Sameer Khan', 'Freelancing', 'LinkedIn'],
    ['Priyanka Roy', 'Video Editing', 'Instagram Ad'],
    ['Nikhil Menon', 'AI Tools', 'Website Form'],
    ['Tanvi Shah', 'Digital Marketing', 'Referral'],
    ['Vivaan Agarwal', 'Graphic Design', 'Website Form'],
    ['Ananya Pillai', 'Career Guidance', 'Instagram Ad'],
  ];
  const leads = leadNames.map((l, i) => ({
    id: uuidv4(),
    name: l[0],
    email: l[0].toLowerCase().replace(' ', '.') + '@gmail.com',
    phone: '98' + Math.floor(10000000 + Math.random()*90000000),
    parentName: 'Parent of ' + l[0].split(' ')[0],
    parentPhone: '99' + Math.floor(10000000 + Math.random()*90000000),
    course: l[1],
    source: l[2],
    status: stages[i % stages.length],
    notes: 'Interested in ' + l[1] + '. Follow up scheduled.',
    counselorId: users.find(u => u.role === 'counselor').id,
    counselorName: users.find(u => u.role === 'counselor').name,
    followupDate: '2025-06-' + (10 + i),
    education: '12th Pass',
    createdAt: now,
  }));
  await db.collection('leads').insertMany(leads);

  return { seeded: true, users: users.length, batches: batches.length, leads: leads.length, fees: fees.length };
}

// ---------------- HANDLERS ----------------
export async function GET(request, { params }) {
  const p = (await params).path || [];
  const route = p.join('/');
  const db = await getDb();

  try {
    if (route === '' || route === 'health') return ok({ status: 'ok', service: 'zero-to-skill-crm' });

    if (route === 'seed') return ok(await seedDemoData());

    if (route === 'auth/me') {
      const u = await requireAuth(request); if (!u) return err('Unauthorized', 401);
      const user = await db.collection('users').findOne({ id: u.id }, { projection: { password: 0, _id: 0 } });
      return ok({ user });
    }

    if (route === 'leads') {
      const leads = await db.collection('leads').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
      return ok({ leads });
    }

    if (route === 'students') {
      const students = await db.collection('users').find({ role: 'student' }, { projection: { _id: 0, password: 0 } }).toArray();
      return ok({ students });
    }

    if (route === 'faculty') {
      const faculty = await db.collection('users').find({ role: 'faculty' }, { projection: { _id: 0, password: 0 } }).toArray();
      // add students count
      for (const f of faculty) {
        f.studentsCount = await db.collection('users').countDocuments({ role: 'student', mentorId: f.id });
        f.batchesCount = await db.collection('batches').countDocuments({ facultyId: f.id });
      }
      return ok({ faculty });
    }

    if (route === 'batches') {
      const batches = await db.collection('batches').find({}, { projection: { _id: 0 } }).toArray();
      for (const b of batches) {
        b.studentsCount = await db.collection('users').countDocuments({ role: 'student', batchId: b.id });
      }
      return ok({ batches });
    }

    if (route === 'fees') {
      const fees = await db.collection('fees').find({}, { projection: { _id: 0 } }).toArray();
      return ok({ fees });
    }

    if (route === 'fees/stats') {
      const fees = await db.collection('fees').find({}).toArray();
      const totalRevenue = fees.reduce((a, f) => a + (f.paidAmount || 0), 0);
      const pendingRevenue = fees.reduce((a, f) => a + (f.pendingAmount || 0), 0);
      const totalStudentsPaying = fees.length;
      const fullyPaid = fees.filter(f => f.status === 'paid').length;
      const partial = fees.filter(f => f.status === 'partial').length;
      const pending = fees.filter(f => f.status === 'pending').length;
      // By course
      const byCourse = {};
      for (const f of fees) {
        if (!byCourse[f.course]) byCourse[f.course] = { collected: 0, pending: 0, count: 0 };
        byCourse[f.course].collected += f.paidAmount || 0;
        byCourse[f.course].pending += f.pendingAmount || 0;
        byCourse[f.course].count += 1;
      }
      return ok({ totalRevenue, pendingRevenue, totalStudentsPaying, fullyPaid, partial, pending, byCourse });
    }

    if (route === 'dashboard/stats') {
      const [totalStudents, totalLeads, totalBatches, totalFaculty] = await Promise.all([
        db.collection('users').countDocuments({ role: 'student' }),
        db.collection('leads').countDocuments({}),
        db.collection('batches').countDocuments({}),
        db.collection('users').countDocuments({ role: 'faculty' }),
      ]);
      const fees = await db.collection('fees').find({}).toArray();
      const totalRevenue = fees.reduce((a, f) => a + (f.paidAmount || 0), 0);
      const pendingRevenue = fees.reduce((a, f) => a + (f.pendingAmount || 0), 0);
      const leads = await db.collection('leads').find({}).toArray();
      const pipelineCount = {};
      for (const l of leads) pipelineCount[l.status] = (pipelineCount[l.status] || 0) + 1;
      const confirmedAdmissions = (pipelineCount.confirmed || 0) + (pipelineCount.fees_pending || 0) + (pipelineCount.onboarded || 0);
      const conversionRate = leads.length > 0 ? Math.round((confirmedAdmissions / leads.length) * 100) : 0;
      return ok({ totalStudents, totalLeads, totalBatches, totalFaculty, totalRevenue, pendingRevenue, pipelineCount, conversionRate });
    }

    return err('Not found', 404);
  } catch (e) {
    console.error('GET error', e);
    return err(e.message || 'Server error', 500);
  }
}

export async function POST(request, { params }) {
  const p = (await params).path || [];
  const route = p.join('/');
  const db = await getDb();

  try {
    if (route === 'auth/register') {
      const body = await request.json();
      const { name, email, password, role = 'student', phone = '' } = body;
      if (!name || !email || !password) return err('Missing fields');
      const existing = await db.collection('users').findOne({ email });
      if (existing) return err('Email already registered');
      const user = {
        id: uuidv4(), name, email, password: await hashPassword(password), role, phone,
        avatar: '', createdAt: new Date().toISOString(),
      };
      await db.collection('users').insertOne(user);
      const token = signToken({ id: user.id, email: user.email, role: user.role });
      const { password: _p, _id, ...safe } = user;
      return ok({ user: safe, token });
    }

    if (route === 'auth/login') {
      const { email, password } = await request.json();
      const user = await db.collection('users').findOne({ email });
      if (!user) return err('Invalid credentials', 401);
      const okPw = await verifyPassword(password, user.password);
      if (!okPw) return err('Invalid credentials', 401);
      const token = signToken({ id: user.id, email: user.email, role: user.role });
      const { password: _p, _id, ...safe } = user;
      return ok({ user: safe, token });
    }

    if (route === 'leads') {
      const body = await request.json();
      const lead = {
        id: uuidv4(),
        status: 'inquiry',
        createdAt: new Date().toISOString(),
        ...body,
      };
      await db.collection('leads').insertOne(lead);
      const { _id, ...safe } = lead;
      return ok({ lead: safe });
    }

    if (route === 'faculty') {
      const body = await request.json();
      const { name, email, password = 'faculty123', specialization = '', phone = '' } = body;
      const existing = await db.collection('users').findOne({ email });
      if (existing) return err('Email already exists');
      const user = { id: uuidv4(), name, email, password: await hashPassword(password), role: 'faculty', phone, specialization, rating: 5.0, createdAt: new Date().toISOString() };
      await db.collection('users').insertOne(user);
      const { password: _p, _id, ...safe } = user;
      return ok({ faculty: safe });
    }

    if (route === 'batches') {
      const body = await request.json();
      const batch = { id: uuidv4(), createdAt: new Date().toISOString(), ...body };
      await db.collection('batches').insertOne(batch);
      const { _id, ...safe } = batch;
      return ok({ batch: safe });
    }

    if (route === 'fees/pay') {
      const { feeId, amount } = await request.json();
      const fee = await db.collection('fees').findOne({ id: feeId });
      if (!fee) return err('Fee not found', 404);
      const newPaid = Math.min(fee.totalAmount, (fee.paidAmount || 0) + Number(amount));
      const newPending = fee.totalAmount - newPaid;
      const status = newPaid >= fee.totalAmount ? 'paid' : (newPaid > 0 ? 'partial' : 'pending');
      await db.collection('fees').updateOne({ id: feeId }, { $set: { paidAmount: newPaid, pendingAmount: newPending, status } });
      // Record payment
      await db.collection('payments').insertOne({
        id: uuidv4(), feeId, studentId: fee.studentId, studentName: fee.studentName,
        amount: Number(amount), method: 'manual', receiptNo: 'RCP-' + Date.now(),
        paidAt: new Date().toISOString(),
      });
      return ok({ success: true, status, paidAmount: newPaid, pendingAmount: newPending });
    }

    return err('Not found', 404);
  } catch (e) {
    console.error('POST error', e);
    return err(e.message || 'Server error', 500);
  }
}

export async function PATCH(request, { params }) {
  const p = (await params).path || [];
  const route = p.join('/');
  const db = await getDb();
  try {
    if (route === 'leads/status') {
      const { id, status } = await request.json();
      await db.collection('leads').updateOne({ id }, { $set: { status, updatedAt: new Date().toISOString() } });
      return ok({ success: true });
    }
    if (route.startsWith('leads/')) {
      const id = p[1];
      const body = await request.json();
      await db.collection('leads').updateOne({ id }, { $set: { ...body, updatedAt: new Date().toISOString() } });
      return ok({ success: true });
    }
    return err('Not found', 404);
  } catch (e) {
    console.error('PATCH error', e);
    return err(e.message || 'Server error', 500);
  }
}

export async function DELETE(request, { params }) {
  const p = (await params).path || [];
  const db = await getDb();
  try {
    if (p[0] === 'leads' && p[1]) {
      await db.collection('leads').deleteOne({ id: p[1] });
      return ok({ success: true });
    }
    if (p[0] === 'faculty' && p[1]) {
      await db.collection('users').deleteOne({ id: p[1], role: 'faculty' });
      return ok({ success: true });
    }
    if (p[0] === 'batches' && p[1]) {
      await db.collection('batches').deleteOne({ id: p[1] });
      return ok({ success: true });
    }
    return err('Not found', 404);
  } catch (e) {
    console.error('DELETE error', e);
    return err(e.message || 'Server error', 500);
  }
}
