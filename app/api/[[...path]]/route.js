import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/mongodb';
import { signToken, hashPassword, verifyPassword, getUserFromRequest } from '@/lib/auth';

const ok = (data, status = 200) => NextResponse.json(data, { status });
const err = (message, status = 400) => NextResponse.json({ error: message }, { status });

const XP_ACTIONS = { post: 10, comment: 5, like_received: 2, question: 15, answer: 20, assignment_submit: 15, lesson_complete: 10 };
const DEFAULT_COURSES = [
  { name: 'Digital Marketing With AI', fee: 45000, duration: '6 Months', description: 'Master Digital Marketing supercharged with AI tools' },
  { name: 'Graphics Design With AI', fee: 40000, duration: '5 Months', description: 'Learn design fundamentals and AI-powered creation' },
];

async function requireAuth(request) {
  const u = getUserFromRequest(request);
  if (!u) return null;
  return u;
}

async function currentUser(request) {
  const t = await requireAuth(request);
  if (!t) return null;
  const db = await getDb();
  return db.collection('users').findOne({ id: t.id });
}

function buildInstallments(total, count, startDate = '2025-06-15') {
  const n = Math.max(1, Math.min(24, Number(count) || 1));
  if (n === 1) return [{ amount: total, dueDate: startDate, paid: false, paidDate: null, label: 'Full Payment' }];
  const per = Math.floor(total / n);
  const last = total - per * (n - 1);
  const insts = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + i);
    insts.push({
      amount: i === n - 1 ? last : per,
      dueDate: d.toISOString().slice(0, 10),
      paid: false, paidDate: null,
      label: `Installment ${i + 1}`,
    });
  }
  return insts;
}

function recomputeFee(fee) {
  const paidAmount = (fee.installments || []).filter(i => i.paid).reduce((a, i) => a + i.amount, 0);
  const pendingAmount = fee.totalAmount - paidAmount;
  const status = paidAmount >= fee.totalAmount ? 'paid' : paidAmount > 0 ? 'partial' : 'pending';
  return { ...fee, paidAmount, pendingAmount, status };
}

async function awardXP(db, userId, action) {
  const xp = XP_ACTIONS[action] || 0;
  if (!xp) return;
  await db.collection('users').updateOne({ id: userId }, { $inc: { xp: xp } });
}

async function getCourseFees(db) {
  const courses = await db.collection('courses').find({}).toArray();
  const map = {};
  for (const c of courses) map[c.name] = c.fee;
  return map;
}

// ---------------- SEED ----------------
async function seedDemoData(force = false) {
  const db = await getDb();
  if (force) {
    for (const c of ['users', 'leads', 'batches', 'fees', 'payments', 'posts', 'comments', 'courses', 'modules', 'lessons', 'lessonProgress', 'assignments', 'submissions', 'folders', 'messages']) {
      await db.collection(c).deleteMany({});
    }
  }
  const existing = await db.collection('users').countDocuments();
  if (existing > 0 && !force) {
    const cCount = await db.collection('courses').countDocuments();
    if (cCount === 0) {
      for (const c of DEFAULT_COURSES) await db.collection('courses').insertOne({ id: uuidv4(), ...c, thumbnail: '', active: true, createdAt: new Date().toISOString() });
    }
    return { seeded: false, message: 'Data already exists' };
  }

  const now = new Date().toISOString();
  const admin = {
    id: uuidv4(), name: 'Super Admin', email: 'admin@zerotoskill.com',
    password: await hashPassword('admin@123'), plainPassword: 'admin@123',
    role: 'super_admin', phone: '9999999999', avatar: '', xp: 0, createdAt: now,
  };
  await db.collection('users').insertOne(admin);
  for (const c of DEFAULT_COURSES) {
    await db.collection('courses').insertOne({ id: uuidv4(), ...c, thumbnail: '', active: true, createdAt: now });
  }
  return { seeded: true, message: 'Initial super admin + courses created', email: 'admin@zerotoskill.com', password: 'admin@123' };
}

// ---------------- HANDLERS ----------------
export async function GET(request, { params }) {
  const p = (await params).path || [];
  const route = p.join('/');
  const db = await getDb();

  try {
    if (route === '' || route === 'health') return ok({ status: 'ok' });
    if (route === 'seed') return ok(await seedDemoData());
    if (route === 'seed/reset') return ok(await seedDemoData(true));

    if (route === 'auth/me') {
      const u = await requireAuth(request); if (!u) return err('Unauthorized', 401);
      const user = await db.collection('users').findOne({ id: u.id }, { projection: { password: 0, _id: 0 } });
      return ok({ user });
    }

    if (route === 'users') {
      const me = await currentUser(request); if (!me) return err('Unauthorized', 401);
      let filter = {};
      if (me.role === 'super_admin') filter = {};
      else if (['counselor', 'academic_manager'].includes(me.role)) filter = { role: 'student' };
      else return err('Forbidden', 403);
      const users = await db.collection('users').find(filter, { projection: { password: 0, _id: 0 } }).sort({ createdAt: -1 }).toArray();
      return ok({ users });
    }

    // COURSES
    if (route === 'courses') {
      const courses = await db.collection('courses').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
      for (const c of courses) {
        c.studentsCount = await db.collection('users').countDocuments({ role: 'student', course: c.name });
        c.batchesCount = await db.collection('batches').countDocuments({ course: c.name });
      }
      return ok({ courses });
    }

    if (route === 'leads') {
      const leads = await db.collection('leads').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
      return ok({ leads });
    }

    if (route === 'leads/today-followups') {
      const today = new Date().toISOString().slice(0, 10);
      const leads = await db.collection('leads').find({ followupDate: { $lte: today }, status: { $nin: ['onboarded', 'confirmed'] } }, { projection: { _id: 0 } }).toArray();
      return ok({ followups: leads, count: leads.length, today });
    }

    if (route === 'students') {
      const students = await db.collection('users').find({ role: 'student' }, { projection: { _id: 0, password: 0 } }).sort({ createdAt: -1 }).toArray();
      return ok({ students });
    }

    if (route === 'faculty') {
      const faculty = await db.collection('users').find({ role: 'faculty' }, { projection: { _id: 0, password: 0 } }).toArray();
      for (const f of faculty) {
        f.studentsCount = await db.collection('users').countDocuments({ role: 'student', mentorId: f.id });
        f.batchesCount = await db.collection('batches').countDocuments({ facultyId: f.id });
        // Commission earnings
        if (f.commissionPercent) {
          const fees = await db.collection('fees').find({ course: f.specialization }).toArray();
          const totalPaid = fees.reduce((a, x) => a + (x.paidAmount || 0), 0);
          f.commissionEarned = Math.round(totalPaid * (f.commissionPercent / 100));
        }
      }
      return ok({ faculty });
    }

    if (route === 'batches') {
      const batches = await db.collection('batches').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
      for (const b of batches) {
        b.studentsCount = await db.collection('users').countDocuments({ role: 'student', batchId: b.id });
        const fees = await db.collection('fees').find({ batchId: b.id }).toArray();
        b.totalRevenue = fees.reduce((a, f) => a + (f.paidAmount || 0), 0);
        b.pendingRevenue = fees.reduce((a, f) => a + (f.pendingAmount || 0), 0);
      }
      return ok({ batches });
    }

    if (route === 'fees') {
      const fees = await db.collection('fees').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
      return ok({ fees });
    }

    if (route === 'fees/stats') {
      const fees = await db.collection('fees').find({}).toArray();
      const totalRevenue = fees.reduce((a, f) => a + (f.paidAmount || 0), 0);
      const pendingRevenue = fees.reduce((a, f) => a + (f.pendingAmount || 0), 0);
      const fullyPaid = fees.filter(f => f.status === 'paid').length;
      const partial = fees.filter(f => f.status === 'partial').length;
      const pending = fees.filter(f => f.status === 'pending').length;
      const byCourse = {};
      for (const f of fees) {
        if (!byCourse[f.course]) byCourse[f.course] = { collected: 0, pending: 0, count: 0 };
        byCourse[f.course].collected += f.paidAmount || 0;
        byCourse[f.course].pending += f.pendingAmount || 0;
        byCourse[f.course].count += 1;
      }
      return ok({ totalRevenue, pendingRevenue, fullyPaid, partial, pending, byCourse });
    }

    if (route === 'dashboard/stats') {
      const [totalStudents, totalLeads, totalBatches, totalFaculty, totalCourses] = await Promise.all([
        db.collection('users').countDocuments({ role: 'student' }),
        db.collection('leads').countDocuments({}),
        db.collection('batches').countDocuments({}),
        db.collection('users').countDocuments({ role: 'faculty' }),
        db.collection('courses').countDocuments({}),
      ]);
      const fees = await db.collection('fees').find({}).toArray();
      const totalRevenue = fees.reduce((a, f) => a + (f.paidAmount || 0), 0);
      const pendingRevenue = fees.reduce((a, f) => a + (f.pendingAmount || 0), 0);
      const leads = await db.collection('leads').find({}).toArray();
      const pipelineCount = {};
      for (const l of leads) pipelineCount[l.status] = (pipelineCount[l.status] || 0) + 1;
      const confirmedAdmissions = (pipelineCount.confirmed || 0) + (pipelineCount.fees_pending || 0) + (pipelineCount.onboarded || 0);
      const conversionRate = leads.length > 0 ? Math.round((confirmedAdmissions / leads.length) * 100) : 0;
      const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
      const weekly = days.map(d => ({ day: d, hours: 2 + Math.floor(Math.random() * 6) }));
      const recentStudents = await db.collection('users').find({ role: 'student' }).sort({ createdAt: -1 }).limit(3).toArray();
      const today = new Date().toISOString().slice(0, 10);
      const todaysFollowups = await db.collection('leads').countDocuments({ followupDate: { $lte: today }, status: { $nin: ['onboarded', 'confirmed'] } });
      return ok({ totalStudents, totalLeads, totalBatches, totalFaculty, totalCourses, totalRevenue, pendingRevenue, pipelineCount, conversionRate, weekly, recentStudents: recentStudents.map(s => ({ id: s.id, name: s.name, course: s.course, batch: s.batchName })), todaysFollowups });
    }

    // COMMUNITY
    if (route === 'community/posts') {
      const url = new URL(request.url);
      const batchId = url.searchParams.get('batchId');
      const filter = batchId && batchId !== 'all' ? (batchId === 'global' ? { batchId: null } : { batchId }) : {};
      const posts = await db.collection('posts').find(filter, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
      for (const post of posts) {
        post.commentsCount = await db.collection('comments').countDocuments({ postId: post.id });
      }
      return ok({ posts });
    }

    if (p[0] === 'community' && p[1] === 'posts' && p[2] && p[3] === 'comments') {
      const comments = await db.collection('comments').find({ postId: p[2] }, { projection: { _id: 0 } }).sort({ createdAt: 1 }).toArray();
      return ok({ comments });
    }

    if (route === 'community/leaderboard') {
      const users = await db.collection('users').find({ role: 'student' }, { projection: { _id: 0, password: 0, plainPassword: 0 } }).toArray();
      users.sort((a, b) => (b.xp || 0) - (a.xp || 0));
      return ok({ leaderboard: users.slice(0, 20) });
    }

    // LMS
    if (p[0] === 'lms' && p[1] === 'course' && p[2]) {
      const courseId = p[2];
      const course = await db.collection('courses').findOne({ id: courseId }, { projection: { _id: 0 } });
      const modules = await db.collection('modules').find({ courseId }, { projection: { _id: 0 } }).sort({ order: 1 }).toArray();
      for (const m of modules) {
        m.lessons = await db.collection('lessons').find({ moduleId: m.id }, { projection: { _id: 0 } }).sort({ order: 1 }).toArray();
      }
      return ok({ course, modules });
    }

    if (route === 'lms/my-progress') {
      const me = await currentUser(request); if (!me) return err('Unauthorized', 401);
      const progress = await db.collection('lessonProgress').find({ studentId: me.id }, { projection: { _id: 0 } }).toArray();
      return ok({ progress });
    }

    // ASSIGNMENTS
    if (route === 'assignments') {
      const url = new URL(request.url);
      const batchId = url.searchParams.get('batchId');
      const filter = batchId && batchId !== 'all' ? { batchId } : {};
      const assignments = await db.collection('assignments').find(filter, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
      for (const a of assignments) {
        a.submissionsCount = await db.collection('submissions').countDocuments({ assignmentId: a.id });
      }
      return ok({ assignments });
    }

    if (p[0] === 'assignments' && p[1] && p[2] === 'submissions') {
      const subs = await db.collection('submissions').find({ assignmentId: p[1] }, { projection: { _id: 0 } }).sort({ submittedAt: -1 }).toArray();
      return ok({ submissions: subs });
    }

    if (route === 'assignments/my') {
      const me = await currentUser(request); if (!me) return err('Unauthorized', 401);
      const filter = me.role === 'student' ? { batchId: me.batchId } : {};
      const assignments = await db.collection('assignments').find(filter, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
      for (const a of assignments) {
        const my = await db.collection('submissions').findOne({ assignmentId: a.id, studentId: me.id }, { projection: { _id: 0 } });
        a.mySubmission = my || null;
      }
      return ok({ assignments });
    }

    // FOLDERS
    if (route === 'folders') {
      const url = new URL(request.url);
      const type = url.searchParams.get('type') || 'student';
      const folders = await db.collection('folders').find({ type }, { projection: { _id: 0 } }).toArray();
      return ok({ folders });
    }

    // MESSAGES (WhatsApp log)
    if (route === 'messages') {
      const url = new URL(request.url);
      const studentId = url.searchParams.get('studentId');
      const filter = studentId ? { studentId } : {};
      const msgs = await db.collection('messages').find(filter, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
      return ok({ messages: msgs });
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

    if (route === 'auth/change-password') {
      const me = await currentUser(request); if (!me) return err('Unauthorized', 401);
      const { currentPassword, newPassword } = await request.json();
      const okPw = await verifyPassword(currentPassword, me.password);
      if (!okPw) return err('Current password incorrect');
      await db.collection('users').updateOne({ id: me.id }, { $set: { password: await hashPassword(newPassword), plainPassword: newPassword } });
      return ok({ success: true });
    }

    if (route === 'auth/change-email') {
      const me = await currentUser(request); if (!me) return err('Unauthorized', 401);
      const { newEmail, password } = await request.json();
      const okPw = await verifyPassword(password, me.password);
      if (!okPw) return err('Password incorrect');
      const existing = await db.collection('users').findOne({ email: newEmail });
      if (existing && existing.id !== me.id) return err('Email already in use');
      await db.collection('users').updateOne({ id: me.id }, { $set: { email: newEmail } });
      return ok({ success: true });
    }

    if (route === 'users') {
      const me = await currentUser(request); if (!me || me.role !== 'super_admin') return err('Forbidden', 403);
      const body = await request.json();
      const { name, email, password, role, phone = '', specialization = '', commissionPercent = 0 } = body;
      if (!name || !email || !password || !role) return err('Missing fields');
      const existing = await db.collection('users').findOne({ email });
      if (existing) return err('Email already exists');
      const user = { id: uuidv4(), name, email, password: await hashPassword(password), plainPassword: password, role, phone, specialization, commissionPercent: Number(commissionPercent) || 0, rating: role === 'faculty' ? 5.0 : undefined, xp: 0, createdAt: new Date().toISOString() };
      await db.collection('users').insertOne(user);
      const { password: _p, _id, ...safe } = user;
      return ok({ user: safe });
    }

    // COURSES
    if (route === 'courses') {
      const me = await currentUser(request); if (!me || me.role !== 'super_admin') return err('Forbidden', 403);
      const body = await request.json();
      const { name, fee, duration = '', description = '', thumbnail = '' } = body;
      if (!name || !fee) return err('Name and fee required');
      const existing = await db.collection('courses').findOne({ name });
      if (existing) return err('Course already exists');
      const course = { id: uuidv4(), name, fee: Number(fee), duration, description, thumbnail, active: true, createdAt: new Date().toISOString() };
      await db.collection('courses').insertOne(course);
      const { _id, ...safe } = course;
      return ok({ course: safe });
    }

    if (route === 'leads') {
      const body = await request.json();
      const lead = { id: uuidv4(), status: 'inquiry', createdAt: new Date().toISOString(), ...body };
      await db.collection('leads').insertOne(lead);
      const { _id, ...safe } = lead;
      return ok({ lead: safe });
    }

    if (route === 'students') {
      const me = await currentUser(request);
      if (!me || !['super_admin', 'counselor', 'academic_manager'].includes(me.role)) return err('Forbidden', 403);
      const body = await request.json();
      const { firstName, lastName, email, phone, dob, gender, aadhaar, address, city, state, pincode, parentName, parentPhone, parentOccupation, source, course, batchId, installmentCount = 3, folderId, password = 'student@123' } = body;
      if (!firstName || !lastName || !email || !course) return err('Missing required fields');
      const existing = await db.collection('users').findOne({ email });
      if (existing) return err('Email already exists');
      const batch = batchId ? await db.collection('batches').findOne({ id: batchId }) : null;
      const now = new Date().toISOString();
      const user = {
        id: uuidv4(), name: `${firstName} ${lastName}`, firstName, lastName, email,
        password: await hashPassword(password), plainPassword: password,
        role: 'student', phone, dob, gender, aadhaar, address, city, state, pincode,
        parentName, parentPhone, parentOccupation, source, course,
        batchId: batch?.id || null, batchName: batch?.name || null,
        mentorId: batch?.facultyId || null, mentorName: batch?.facultyName || null,
        folderId: folderId || null,
        enrollmentDate: now, xp: 0, avatar: '', createdAt: now,
      };
      await db.collection('users').insertOne(user);

      const feesMap = await getCourseFees(db);
      const totalAmount = feesMap[course] || 30000;
      const installments = buildInstallments(totalAmount, installmentCount);
      const fee = {
        id: uuidv4(), studentId: user.id, studentName: user.name, studentEmail: user.email,
        course, batchId: batch?.id || null, batchName: batch?.name || null,
        totalAmount, paidAmount: 0, pendingAmount: totalAmount,
        planType: installmentCount === 1 ? 'full' : 'installment',
        installmentCount: Number(installmentCount),
        status: 'pending', dueDate: installments[installments.length - 1].dueDate,
        installments, createdAt: now,
      };
      await db.collection('fees').insertOne(fee);
      const { password: _p, _id, ...safe } = user;
      return ok({ student: safe, fee: { ...fee, _id: undefined } });
    }

    if (route === 'faculty') {
      const body = await request.json();
      const { name, email, password = 'faculty@123', specialization = '', phone = '', commissionPercent = 0 } = body;
      const existing = await db.collection('users').findOne({ email });
      if (existing) return err('Email already exists');
      const user = { id: uuidv4(), name, email, password: await hashPassword(password), plainPassword: password, role: 'faculty', phone, specialization, commissionPercent: Number(commissionPercent) || 0, rating: 5.0, xp: 0, createdAt: new Date().toISOString() };
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

    if (route === 'fees') {
      const body = await request.json();
      const { studentId, totalAmount, installmentCount = 3, customInstallments } = body;
      const student = await db.collection('users').findOne({ id: studentId });
      if (!student) return err('Student not found');
      let insts;
      if (Array.isArray(customInstallments) && customInstallments.length) {
        insts = customInstallments.map((ci, i) => ({ amount: Number(ci.amount) || 0, dueDate: ci.dueDate, label: ci.label || `Installment ${i+1}`, paid: false, paidDate: null }));
      } else {
        insts = buildInstallments(Number(totalAmount), installmentCount);
      }
      const actualTotal = insts.reduce((a, i) => a + i.amount, 0);
      const fee = {
        id: uuidv4(), studentId, studentName: student.name, studentEmail: student.email,
        course: student.course, batchId: student.batchId, batchName: student.batchName,
        totalAmount: actualTotal, paidAmount: 0, pendingAmount: actualTotal,
        planType: insts.length === 1 ? 'full' : 'installment',
        installmentCount: insts.length,
        status: 'pending', dueDate: insts[insts.length - 1].dueDate,
        installments: insts, createdAt: new Date().toISOString(),
      };
      await db.collection('fees').insertOne(fee);
      const { _id, ...safe } = fee;
      return ok({ fee: safe });
    }

    if (route === 'fees/pay-installment') {
      const { feeId, installmentIndex, method = 'cash' } = await request.json();
      const fee = await db.collection('fees').findOne({ id: feeId });
      if (!fee) return err('Fee not found', 404);
      if (!fee.installments?.[installmentIndex]) return err('Invalid installment');
      if (fee.installments[installmentIndex].paid) return err('Already paid');
      fee.installments[installmentIndex].paid = true;
      fee.installments[installmentIndex].paidDate = new Date().toISOString().slice(0, 10);
      fee.installments[installmentIndex].method = method;
      const updated = recomputeFee(fee);
      await db.collection('fees').updateOne({ id: feeId }, { $set: { installments: updated.installments, paidAmount: updated.paidAmount, pendingAmount: updated.pendingAmount, status: updated.status } });
      const receiptNo = 'ZTS-' + Date.now().toString().slice(-8);
      await db.collection('payments').insertOne({ id: uuidv4(), feeId, studentId: fee.studentId, studentName: fee.studentName, amount: fee.installments[installmentIndex].amount, method, receiptNo, paidAt: new Date().toISOString(), installmentLabel: fee.installments[installmentIndex].label });
      return ok({ success: true, receiptNo, fee: { ...updated, _id: undefined } });
    }

    // COMMUNITY
    if (route === 'community/posts') {
      const me = await currentUser(request); if (!me) return err('Unauthorized', 401);
      const { title, body: content, type = 'discussion', tag = 'General', batchId = null } = await request.json();
      const post = { id: uuidv4(), authorId: me.id, authorName: me.name, authorRole: me.role, batchId, title, body: content, type, tag, likes: [], likesCount: 0, createdAt: new Date().toISOString() };
      await db.collection('posts').insertOne(post);
      await awardXP(db, me.id, type === 'question' ? 'question' : 'post');
      const { _id, ...safe } = post;
      return ok({ post: safe });
    }

    if (p[0] === 'community' && p[1] === 'posts' && p[2] && p[3] === 'like') {
      const me = await currentUser(request); if (!me) return err('Unauthorized', 401);
      const post = await db.collection('posts').findOne({ id: p[2] });
      if (!post) return err('Not found', 404);
      const likes = post.likes || [];
      const idx = likes.indexOf(me.id);
      if (idx > -1) likes.splice(idx, 1);
      else { likes.push(me.id); await awardXP(db, post.authorId, 'like_received'); }
      await db.collection('posts').updateOne({ id: p[2] }, { $set: { likes, likesCount: likes.length } });
      return ok({ liked: idx === -1, likesCount: likes.length });
    }

    if (p[0] === 'community' && p[1] === 'posts' && p[2] && p[3] === 'comments') {
      const me = await currentUser(request); if (!me) return err('Unauthorized', 401);
      const { body: content } = await request.json();
      const comment = { id: uuidv4(), postId: p[2], authorId: me.id, authorName: me.name, authorRole: me.role, body: content, createdAt: new Date().toISOString() };
      await db.collection('comments').insertOne(comment);
      const post = await db.collection('posts').findOne({ id: p[2] });
      if (post?.type === 'question' && me.id !== post.authorId) await awardXP(db, me.id, 'answer');
      else await awardXP(db, me.id, 'comment');
      const { _id, ...safe } = comment;
      return ok({ comment: safe });
    }

    // LMS
    if (route === 'lms/modules') {
      const me = await currentUser(request); if (!me || !['super_admin', 'faculty', 'academic_manager'].includes(me.role)) return err('Forbidden', 403);
      const body = await request.json();
      const module = { id: uuidv4(), courseId: body.courseId, title: body.title, order: body.order || 0, createdAt: new Date().toISOString() };
      await db.collection('modules').insertOne(module);
      const { _id, ...safe } = module;
      return ok({ module: safe });
    }

    if (route === 'lms/lessons') {
      const me = await currentUser(request); if (!me || !['super_admin', 'faculty', 'academic_manager'].includes(me.role)) return err('Forbidden', 403);
      const body = await request.json();
      const lesson = { id: uuidv4(), moduleId: body.moduleId, courseId: body.courseId, title: body.title, type: body.type || 'video', contentUrl: body.contentUrl || '', description: body.description || '', duration: body.duration || '', order: body.order || 0, createdAt: new Date().toISOString() };
      await db.collection('lessons').insertOne(lesson);
      const { _id, ...safe } = lesson;
      return ok({ lesson: safe });
    }

    if (route === 'lms/complete') {
      const me = await currentUser(request); if (!me) return err('Unauthorized', 401);
      const { lessonId, courseId } = await request.json();
      const existing = await db.collection('lessonProgress').findOne({ studentId: me.id, lessonId });
      if (!existing) {
        await db.collection('lessonProgress').insertOne({ id: uuidv4(), studentId: me.id, lessonId, courseId, completedAt: new Date().toISOString() });
        await awardXP(db, me.id, 'lesson_complete');
      }
      return ok({ success: true });
    }

    // ASSIGNMENTS
    if (route === 'assignments') {
      const me = await currentUser(request); if (!me || !['super_admin', 'faculty', 'academic_manager'].includes(me.role)) return err('Forbidden', 403);
      const body = await request.json();
      const a = { id: uuidv4(), title: body.title, description: body.description, batchId: body.batchId, batchName: body.batchName || '', dueDate: body.dueDate, createdBy: me.id, createdByName: me.name, maxScore: body.maxScore || 100, createdAt: new Date().toISOString() };
      await db.collection('assignments').insertOne(a);
      const { _id, ...safe } = a;
      return ok({ assignment: safe });
    }

    if (p[0] === 'assignments' && p[1] && p[2] === 'submit') {
      const me = await currentUser(request); if (!me) return err('Unauthorized', 401);
      const { fileUrl, notes } = await request.json();
      const existing = await db.collection('submissions').findOne({ assignmentId: p[1], studentId: me.id });
      if (existing) {
        await db.collection('submissions').updateOne({ id: existing.id }, { $set: { fileUrl, notes, submittedAt: new Date().toISOString(), grade: null, feedback: '' } });
      } else {
        await db.collection('submissions').insertOne({ id: uuidv4(), assignmentId: p[1], studentId: me.id, studentName: me.name, fileUrl, notes, submittedAt: new Date().toISOString(), grade: null, feedback: '' });
        await awardXP(db, me.id, 'assignment_submit');
      }
      return ok({ success: true });
    }

    if (p[0] === 'assignments' && p[1] === 'grade') {
      const me = await currentUser(request); if (!me || !['super_admin', 'faculty', 'academic_manager'].includes(me.role)) return err('Forbidden', 403);
      const { submissionId, grade, feedback } = await request.json();
      await db.collection('submissions').updateOne({ id: submissionId }, { $set: { grade: Number(grade), feedback, gradedAt: new Date().toISOString() } });
      return ok({ success: true });
    }

    // FOLDERS
    if (route === 'folders') {
      const me = await currentUser(request); if (!me) return err('Unauthorized', 401);
      const { name, type = 'student', color = 'orange' } = await request.json();
      if (!name) return err('Name required');
      const folder = { id: uuidv4(), name, type, color, createdBy: me.id, createdAt: new Date().toISOString() };
      await db.collection('folders').insertOne(folder);
      const { _id, ...safe } = folder;
      return ok({ folder: safe });
    }

    // MESSAGES (log WhatsApp send)
    if (route === 'messages') {
      const me = await currentUser(request); if (!me) return err('Unauthorized', 401);
      const { studentId, phone, message, direction = 'outgoing' } = await request.json();
      const msg = { id: uuidv4(), studentId, phone, message, direction, sentBy: me.id, sentByName: me.name, createdAt: new Date().toISOString() };
      await db.collection('messages').insertOne(msg);
      const { _id, ...safe } = msg;
      return ok({ message: safe });
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
    if (p[0] === 'leads' && p[1]) {
      const body = await request.json();
      await db.collection('leads').updateOne({ id: p[1] }, { $set: { ...body, updatedAt: new Date().toISOString() } });
      return ok({ success: true });
    }
    if (p[0] === 'users' && p[1]) {
      const me = await currentUser(request); if (!me || me.role !== 'super_admin') return err('Forbidden', 403);
      const body = await request.json();
      const update = { ...body, updatedAt: new Date().toISOString() };
      if (body.password) { update.password = await hashPassword(body.password); update.plainPassword = body.password; }
      await db.collection('users').updateOne({ id: p[1] }, { $set: update });
      return ok({ success: true });
    }
    if (p[0] === 'students' && p[1]) {
      const me = await currentUser(request);
      if (!me || !['super_admin', 'counselor', 'academic_manager'].includes(me.role)) return err('Forbidden', 403);
      const body = await request.json();
      if (body.firstName || body.lastName) body.name = `${body.firstName || ''} ${body.lastName || ''}`.trim();
      if (body.batchId) { const b = await db.collection('batches').findOne({ id: body.batchId }); if (b) { body.batchName = b.name; body.mentorId = b.facultyId; body.mentorName = b.facultyName; } }
      if (body.password) { body.password = await hashPassword(body.password); body.plainPassword = body.password; }
      await db.collection('users').updateOne({ id: p[1], role: 'student' }, { $set: { ...body, updatedAt: new Date().toISOString() } });
      if (body.name) await db.collection('fees').updateMany({ studentId: p[1] }, { $set: { studentName: body.name } });
      return ok({ success: true });
    }
    if (p[0] === 'batches' && p[1]) {
      const body = await request.json();
      if (body.facultyId) { const f = await db.collection('users').findOne({ id: body.facultyId }); if (f) body.facultyName = f.name; }
      await db.collection('batches').updateOne({ id: p[1] }, { $set: { ...body, updatedAt: new Date().toISOString() } });
      return ok({ success: true });
    }
    if (p[0] === 'fees' && p[1]) {
      const body = await request.json();
      // Custom installments override
      if (Array.isArray(body.customInstallments)) {
        const fee = await db.collection('fees').findOne({ id: p[1] });
        if (fee) {
          const paidLabels = new Set((fee.installments || []).filter(i => i.paid).map(i => i.label));
          const paidByLabel = {}; (fee.installments || []).forEach(i => { if (i.paid) paidByLabel[i.label] = i; });
          const insts = body.customInstallments.map((ci, i) => {
            const p = paidByLabel[ci.label];
            return { amount: Number(ci.amount) || 0, dueDate: ci.dueDate, label: ci.label || `Installment ${i+1}`, paid: !!p, paidDate: p?.paidDate || null };
          });
          const total = insts.reduce((a, i) => a + i.amount, 0);
          const updated = recomputeFee({ ...fee, totalAmount: total, installments: insts });
          await db.collection('fees').updateOne({ id: p[1] }, { $set: { totalAmount: total, installmentCount: insts.length, planType: insts.length === 1 ? 'full' : 'installment', installments: updated.installments, paidAmount: updated.paidAmount, pendingAmount: updated.pendingAmount, status: updated.status } });
          return ok({ success: true });
        }
      }
      if (body.totalAmount || body.installmentCount) {
        const fee = await db.collection('fees').findOne({ id: p[1] });
        if (fee) {
          const total = Number(body.totalAmount || fee.totalAmount);
          const count = Number(body.installmentCount || fee.installmentCount || 3);
          const paidLabels = (fee.installments || []).filter(i => i.paid).map(i => i.label);
          const insts = buildInstallments(total, count);
          for (const i of insts) if (paidLabels.includes(i.label)) { i.paid = true; i.paidDate = new Date().toISOString().slice(0,10); }
          const updated = recomputeFee({ ...fee, totalAmount: total, installmentCount: count, installments: insts });
          await db.collection('fees').updateOne({ id: p[1] }, { $set: { totalAmount: total, installmentCount: count, planType: count === 1 ? 'full' : 'installment', installments: updated.installments, paidAmount: updated.paidAmount, pendingAmount: updated.pendingAmount, status: updated.status } });
          return ok({ success: true });
        }
      }
      await db.collection('fees').updateOne({ id: p[1] }, { $set: body });
      return ok({ success: true });
    }
    if (p[0] === 'courses' && p[1]) {
      const me = await currentUser(request); if (!me || me.role !== 'super_admin') return err('Forbidden', 403);
      const body = await request.json();
      await db.collection('courses').updateOne({ id: p[1] }, { $set: body });
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
    if (p[0] === 'leads' && p[1]) { await db.collection('leads').deleteOne({ id: p[1] }); return ok({ success: true }); }
    if (p[0] === 'users' && p[1]) {
      const me = await currentUser(request); if (!me || me.role !== 'super_admin') return err('Forbidden', 403);
      await db.collection('users').deleteOne({ id: p[1] });
      await db.collection('fees').deleteMany({ studentId: p[1] });
      return ok({ success: true });
    }
    if (p[0] === 'students' && p[1]) { await db.collection('users').deleteOne({ id: p[1], role: 'student' }); await db.collection('fees').deleteMany({ studentId: p[1] }); return ok({ success: true }); }
    if (p[0] === 'faculty' && p[1]) { await db.collection('users').deleteOne({ id: p[1], role: 'faculty' }); return ok({ success: true }); }
    if (p[0] === 'batches' && p[1]) { await db.collection('batches').deleteOne({ id: p[1] }); return ok({ success: true }); }
    if (p[0] === 'fees' && p[1]) { await db.collection('fees').deleteOne({ id: p[1] }); return ok({ success: true }); }
    if (p[0] === 'courses' && p[1]) {
      const me = await currentUser(request); if (!me || me.role !== 'super_admin') return err('Forbidden', 403);
      await db.collection('courses').deleteOne({ id: p[1] });
      return ok({ success: true });
    }
    if (p[0] === 'folders' && p[1]) { await db.collection('folders').deleteOne({ id: p[1] }); return ok({ success: true }); }
    if (p[0] === 'assignments' && p[1]) { await db.collection('assignments').deleteOne({ id: p[1] }); await db.collection('submissions').deleteMany({ assignmentId: p[1] }); return ok({ success: true }); }
    if (p[0] === 'lms') {
      if (p[1] === 'modules' && p[2]) { await db.collection('modules').deleteOne({ id: p[2] }); await db.collection('lessons').deleteMany({ moduleId: p[2] }); return ok({ success: true }); }
      if (p[1] === 'lessons' && p[2]) { await db.collection('lessons').deleteOne({ id: p[2] }); return ok({ success: true }); }
    }
    if (p[0] === 'community' && p[1] === 'posts' && p[2]) {
      const me = await currentUser(request); if (!me) return err('Unauthorized', 401);
      const post = await db.collection('posts').findOne({ id: p[2] });
      if (!post) return err('Not found', 404);
      if (post.authorId !== me.id && me.role !== 'super_admin') return err('Forbidden', 403);
      await db.collection('posts').deleteOne({ id: p[2] });
      await db.collection('comments').deleteMany({ postId: p[2] });
      return ok({ success: true });
    }
    return err('Not found', 404);
  } catch (e) {
    console.error('DELETE error', e);
    return err(e.message || 'Server error', 500);
  }
}
