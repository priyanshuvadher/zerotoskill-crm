import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/mongodb';
import { signToken, hashPassword, verifyPassword, getUserFromRequest } from '@/lib/auth';

const ok = (data, status = 200) => NextResponse.json(data, { status });
const err = (message, status = 400) => NextResponse.json({ error: message }, { status });

const COURSES = ['Digital Marketing With AI', 'Graphics Design With AI'];
const COURSE_FEES = { 'Digital Marketing With AI': 45000, 'Graphics Design With AI': 40000 };
const XP_ACTIONS = { post: 10, comment: 5, like_received: 2, question: 15, answer: 20 };

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

function buildInstallments(total, plan, startDate = '2025-06-15') {
  if (plan === 'full') return [{ amount: total, dueDate: startDate, paid: false, paidDate: null, label: 'Full Payment' }];
  const per = Math.floor(total / 3);
  const last = total - per * 2;
  return [
    { amount: per, dueDate: startDate, paid: false, paidDate: null, label: 'Installment 1' },
    { amount: per, dueDate: '2025-07-15', paid: false, paidDate: null, label: 'Installment 2' },
    { amount: last, dueDate: '2025-08-15', paid: false, paidDate: null, label: 'Installment 3' },
  ];
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

// ---------------- SEED ----------------
async function seedDemoData(force = false) {
  const db = await getDb();
  if (force) {
    await db.collection('users').deleteMany({});
    await db.collection('leads').deleteMany({});
    await db.collection('batches').deleteMany({});
    await db.collection('fees').deleteMany({});
    await db.collection('payments').deleteMany({});
    await db.collection('posts').deleteMany({});
    await db.collection('comments').deleteMany({});
  }
  const existing = await db.collection('users').countDocuments();
  if (existing > 0 && !force) return { seeded: false, message: 'Data already exists' };

  const now = new Date().toISOString();

  // ONLY super admin by default
  const admin = {
    id: uuidv4(),
    name: 'Super Admin',
    email: 'admin@zerotoskill.com',
    password: await hashPassword('admin@123'),
    plainPassword: 'admin@123',
    role: 'super_admin',
    phone: '9999999999',
    avatar: '',
    xp: 0,
    createdAt: now,
  };
  await db.collection('users').insertOne(admin);
  return { seeded: true, message: 'Initial super admin created', email: 'admin@zerotoskill.com', password: 'admin@123' };
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
    if (route === 'courses') return ok({ courses: COURSES, fees: COURSE_FEES });

    if (route === 'auth/me') {
      const u = await requireAuth(request); if (!u) return err('Unauthorized', 401);
      const user = await db.collection('users').findOne({ id: u.id }, { projection: { password: 0, _id: 0 } });
      return ok({ user });
    }

    // Only super_admin can view all users with plainPassword; counselor/manager can view students
    if (route === 'users') {
      const me = await currentUser(request); if (!me) return err('Unauthorized', 401);
      let filter = {};
      if (me.role === 'super_admin') filter = {};
      else if (['counselor', 'academic_manager'].includes(me.role)) filter = { role: 'student' };
      else return err('Forbidden', 403);
      const users = await db.collection('users').find(filter, { projection: { password: 0, _id: 0 } }).sort({ createdAt: -1 }).toArray();
      // Non-super-admin should NOT see plainPassword? User asked super admin, counselor, academic manager can see student passwords. Faculty/students no.
      if (!['super_admin', 'counselor', 'academic_manager'].includes(me.role)) {
        users.forEach(u => delete u.plainPassword);
      }
      return ok({ users });
    }

    if (route === 'leads') {
      const leads = await db.collection('leads').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
      return ok({ leads });
    }

    if (route === 'students') {
      const me = await currentUser(request);
      const projection = { _id: 0, password: 0 };
      const students = await db.collection('users').find({ role: 'student' }, { projection }).sort({ createdAt: -1 }).toArray();
      if (!me || !['super_admin', 'counselor', 'academic_manager'].includes(me.role)) {
        students.forEach(s => delete s.plainPassword);
      }
      return ok({ students });
    }

    if (route === 'faculty') {
      const faculty = await db.collection('users').find({ role: 'faculty' }, { projection: { _id: 0, password: 0 } }).toArray();
      for (const f of faculty) {
        f.studentsCount = await db.collection('users').countDocuments({ role: 'student', mentorId: f.id });
        f.batchesCount = await db.collection('batches').countDocuments({ facultyId: f.id });
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
        b.feesTotal = fees.reduce((a, f) => a + (f.totalAmount || 0), 0);
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

    if (p[0] === 'fees' && p[1] === 'receipt' && p[2]) {
      // Get payment history for receipt
      const feeId = p[2];
      const fee = await db.collection('fees').findOne({ id: feeId }, { projection: { _id: 0 } });
      const payments = await db.collection('payments').find({ feeId }, { projection: { _id: 0 } }).sort({ paidAt: -1 }).toArray();
      const student = fee ? await db.collection('users').findOne({ id: fee.studentId }, { projection: { _id: 0, password: 0, plainPassword: 0 } }) : null;
      return ok({ fee, payments, student });
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
      const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
      const weekly = days.map(d => ({ day: d, hours: 2 + Math.floor(Math.random() * 6) }));
      const recentStudents = await db.collection('users').find({ role: 'student' }).sort({ createdAt: -1 }).limit(3).toArray();
      return ok({ totalStudents, totalLeads, totalBatches, totalFaculty, totalRevenue, pendingRevenue, pipelineCount, conversionRate, weekly, recentStudents: recentStudents.map(s => ({ id: s.id, name: s.name, course: s.course, batch: s.batchName })) });
    }

    // ---- COMMUNITY ----
    if (route === 'community/posts') {
      const posts = await db.collection('posts').find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
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
      await db.collection('users').updateOne({ id: me.id }, { $set: { password: await hashPassword(newPassword), plainPassword: newPassword, updatedAt: new Date().toISOString() } });
      return ok({ success: true });
    }

    if (route === 'auth/change-email') {
      const me = await currentUser(request); if (!me) return err('Unauthorized', 401);
      const { newEmail, password } = await request.json();
      const okPw = await verifyPassword(password, me.password);
      if (!okPw) return err('Password incorrect');
      const existing = await db.collection('users').findOne({ email: newEmail });
      if (existing && existing.id !== me.id) return err('Email already in use');
      await db.collection('users').updateOne({ id: me.id }, { $set: { email: newEmail, updatedAt: new Date().toISOString() } });
      return ok({ success: true });
    }

    // Super admin creates any user (counselor / faculty / academic_manager / student)
    if (route === 'users') {
      const me = await currentUser(request); if (!me || me.role !== 'super_admin') return err('Forbidden', 403);
      const body = await request.json();
      const { name, email, password, role, phone = '', specialization = '' } = body;
      if (!name || !email || !password || !role) return err('Missing fields');
      const existing = await db.collection('users').findOne({ email });
      if (existing) return err('Email already exists');
      const user = {
        id: uuidv4(), name, email,
        password: await hashPassword(password),
        plainPassword: password,
        role, phone, specialization,
        rating: role === 'faculty' ? 5.0 : undefined,
        xp: 0,
        createdAt: new Date().toISOString(),
      };
      await db.collection('users').insertOne(user);
      const { password: _p, _id, ...safe } = user;
      return ok({ user: safe });
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
      const {
        firstName, lastName, email, phone, dob, gender, aadhaar,
        address, city, state, pincode,
        parentName, parentPhone, parentOccupation,
        source, course, batchId, paymentPlan = 'installment',
        password = 'student@123',
      } = body;
      if (!firstName || !lastName || !email || !course) return err('Missing required fields');
      const existing = await db.collection('users').findOne({ email });
      if (existing) return err('Email already exists');
      const batch = batchId ? await db.collection('batches').findOne({ id: batchId }) : null;
      const now = new Date().toISOString();
      const user = {
        id: uuidv4(),
        name: `${firstName} ${lastName}`,
        firstName, lastName, email,
        password: await hashPassword(password),
        plainPassword: password,
        role: 'student',
        phone, dob, gender, aadhaar,
        address, city, state, pincode,
        parentName, parentPhone, parentOccupation,
        source, course,
        batchId: batch?.id || null,
        batchName: batch?.name || null,
        mentorId: batch?.facultyId || null,
        mentorName: batch?.facultyName || null,
        enrollmentDate: now,
        xp: 0,
        avatar: '',
        createdAt: now,
      };
      await db.collection('users').insertOne(user);

      const totalAmount = COURSE_FEES[course] || 30000;
      const installments = buildInstallments(totalAmount, paymentPlan === 'full' ? 'full' : 'installment');
      const fee = {
        id: uuidv4(),
        studentId: user.id,
        studentName: user.name,
        studentEmail: user.email,
        course,
        batchId: batch?.id || null,
        batchName: batch?.name || null,
        totalAmount,
        paidAmount: 0,
        pendingAmount: totalAmount,
        planType: paymentPlan === 'full' ? 'full' : 'installment',
        status: 'pending',
        dueDate: installments[installments.length - 1].dueDate,
        installments,
        createdAt: now,
      };
      await db.collection('fees').insertOne(fee);
      const { password: _p, _id, ...safe } = user;
      return ok({ student: safe, fee: { ...fee, _id: undefined } });
    }

    if (route === 'faculty') {
      const body = await request.json();
      const { name, email, password = 'faculty@123', specialization = '', phone = '' } = body;
      const existing = await db.collection('users').findOne({ email });
      if (existing) return err('Email already exists');
      const user = { id: uuidv4(), name, email, password: await hashPassword(password), plainPassword: password, role: 'faculty', phone, specialization, rating: 5.0, xp: 0, createdAt: new Date().toISOString() };
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
      const { studentId, totalAmount, planType = 'installment' } = body;
      const student = await db.collection('users').findOne({ id: studentId });
      if (!student) return err('Student not found');
      const insts = buildInstallments(Number(totalAmount), planType);
      const fee = {
        id: uuidv4(), studentId, studentName: student.name, studentEmail: student.email,
        course: student.course, batchId: student.batchId, batchName: student.batchName,
        totalAmount: Number(totalAmount), paidAmount: 0, pendingAmount: Number(totalAmount),
        planType, status: 'pending', dueDate: insts[insts.length - 1].dueDate,
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
      await db.collection('payments').insertOne({
        id: uuidv4(), feeId, studentId: fee.studentId, studentName: fee.studentName,
        amount: fee.installments[installmentIndex].amount, method,
        receiptNo, paidAt: new Date().toISOString(),
        installmentLabel: fee.installments[installmentIndex].label,
      });
      return ok({ success: true, receiptNo, fee: { ...updated, _id: undefined } });
    }

    // ---- COMMUNITY ----
    if (route === 'community/posts') {
      const me = await currentUser(request); if (!me) return err('Unauthorized', 401);
      const { title, body: content, type = 'discussion', tag = 'General' } = await request.json();
      const post = {
        id: uuidv4(),
        authorId: me.id, authorName: me.name, authorRole: me.role,
        title, body: content, type, tag,
        likes: [], likesCount: 0,
        createdAt: new Date().toISOString(),
      };
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
      if (idx > -1) { likes.splice(idx, 1); }
      else { likes.push(me.id); await awardXP(db, post.authorId, 'like_received'); }
      await db.collection('posts').updateOne({ id: p[2] }, { $set: { likes, likesCount: likes.length } });
      return ok({ liked: idx === -1, likesCount: likes.length });
    }

    if (p[0] === 'community' && p[1] === 'posts' && p[2] && p[3] === 'comments') {
      const me = await currentUser(request); if (!me) return err('Unauthorized', 401);
      const { body: content } = await request.json();
      const comment = {
        id: uuidv4(), postId: p[2], authorId: me.id, authorName: me.name, authorRole: me.role,
        body: content, createdAt: new Date().toISOString(),
      };
      await db.collection('comments').insertOne(comment);
      const post = await db.collection('posts').findOne({ id: p[2] });
      if (post?.type === 'question' && me.id !== post.authorId) await awardXP(db, me.id, 'answer');
      else await awardXP(db, me.id, 'comment');
      const { _id, ...safe } = comment;
      return ok({ comment: safe });
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
      if (body.batchId) {
        const b = await db.collection('batches').findOne({ id: body.batchId });
        if (b) { body.batchName = b.name; body.mentorId = b.facultyId; body.mentorName = b.facultyName; }
      }
      if (body.password) { body.password = await hashPassword(body.password); body.plainPassword = body.password; }
      await db.collection('users').updateOne({ id: p[1], role: 'student' }, { $set: { ...body, updatedAt: new Date().toISOString() } });
      if (body.name) await db.collection('fees').updateMany({ studentId: p[1] }, { $set: { studentName: body.name } });
      return ok({ success: true });
    }
    if (p[0] === 'batches' && p[1]) {
      const body = await request.json();
      if (body.facultyId) {
        const f = await db.collection('users').findOne({ id: body.facultyId });
        if (f) body.facultyName = f.name;
      }
      await db.collection('batches').updateOne({ id: p[1] }, { $set: { ...body, updatedAt: new Date().toISOString() } });
      return ok({ success: true });
    }
    if (p[0] === 'fees' && p[1]) {
      const body = await request.json();
      if (body.totalAmount || body.planType) {
        const fee = await db.collection('fees').findOne({ id: p[1] });
        if (fee) {
          const total = Number(body.totalAmount || fee.totalAmount);
          const plan = body.planType || fee.planType;
          const paidLabels = (fee.installments || []).filter(i => i.paid).map(i => i.label);
          const insts = buildInstallments(total, plan);
          for (const i of insts) if (paidLabels.includes(i.label)) { i.paid = true; i.paidDate = new Date().toISOString().slice(0,10); }
          const updated = recomputeFee({ ...fee, totalAmount: total, planType: plan, installments: insts });
          await db.collection('fees').updateOne({ id: p[1] }, { $set: { totalAmount: total, planType: plan, installments: updated.installments, paidAmount: updated.paidAmount, pendingAmount: updated.pendingAmount, status: updated.status } });
          return ok({ success: true });
        }
      }
      await db.collection('fees').updateOne({ id: p[1] }, { $set: body });
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
    if (p[0] === 'students' && p[1]) {
      await db.collection('users').deleteOne({ id: p[1], role: 'student' });
      await db.collection('fees').deleteMany({ studentId: p[1] });
      return ok({ success: true });
    }
    if (p[0] === 'faculty' && p[1]) { await db.collection('users').deleteOne({ id: p[1], role: 'faculty' }); return ok({ success: true }); }
    if (p[0] === 'batches' && p[1]) { await db.collection('batches').deleteOne({ id: p[1] }); return ok({ success: true }); }
    if (p[0] === 'fees' && p[1]) { await db.collection('fees').deleteOne({ id: p[1] }); return ok({ success: true }); }
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
