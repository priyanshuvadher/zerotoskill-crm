'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { browserNotify, requestNotifPermission } from '@/lib/notify';
import {
  LayoutDashboard, Users, UserPlus, GraduationCap, IndianRupee, BookOpen,
  LogOut, Plus, Menu, X, Search, Sparkles, Bell, ArrowUpRight,
  TrendingUp, Wallet, CheckCircle2, Clock, AlertCircle, Folder, FolderOpen,
  Phone, Mail, Star, ChevronRight, Kanban, List, Sheet, ArrowLeft,
  Edit3, Trash2, Eye, Download, CalendarDays, Settings, MessageSquare,
  Trophy, Heart, MessageCircle, Send, KeyRound, ShieldCheck, EyeOff,
  Receipt, Printer, HelpCircle, ThumbsUp, Flame, Award, UserCog,
  ChevronLeft, PanelLeftClose, PanelLeftOpen, Layers, Video, FileText,
  PlayCircle, ClipboardList, Upload, Zap, Percent, FolderPlus, Library,
} from 'lucide-react';

const API = '/api';

const ROLE_META = {
  super_admin: { label: 'Super Admin', chip: 'bg-orange-100 text-orange-800' },
  academic_manager: { label: 'Academic Manager', chip: 'bg-blue-100 text-blue-800' },
  faculty: { label: 'Faculty', chip: 'bg-emerald-100 text-emerald-800' },
  counselor: { label: 'Counselor', chip: 'bg-purple-100 text-purple-800' },
  student: { label: 'Student', chip: 'bg-pink-100 text-pink-800' },
};

const STAGES = [
  { key: 'inquiry', label: 'Inquiry', dot: 'bg-slate-400', chip: 'bg-slate-100 text-slate-700' },
  { key: 'counseling', label: 'Counseling', dot: 'bg-blue-500', chip: 'bg-blue-100 text-blue-700' },
  { key: 'followup', label: 'Follow-up', dot: 'bg-amber-500', chip: 'bg-amber-100 text-amber-700' },
  { key: 'confirmed', label: 'Confirmed', dot: 'bg-emerald-500', chip: 'bg-emerald-100 text-emerald-700' },
  { key: 'fees_pending', label: 'Fees Pending', dot: 'bg-orange-500', chip: 'bg-orange-100 text-orange-700' },
  { key: 'onboarded', label: 'Onboarded', dot: 'bg-lime-500', chip: 'bg-lime-100 text-lime-700' },
];

const api = async (path, opts = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(opts.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

const formatINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
const initials = (name) => (name || '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

// Notify + toast helper
function notify(title, body) {
  toast.success(title, { description: body });
  browserNotify(title, body || '');
}

// WhatsApp send helper
function openWhatsApp(phone, message) {
  const clean = (phone || '').replace(/\D/g, '');
  if (!clean) return toast.error('No phone number');
  const num = clean.length === 10 ? '91' + clean : clean;
  const url = `https://wa.me/${num}?text=${encodeURIComponent(message || '')}`;
  window.open(url, '_blank');
}

// ---------------- LOGIN ----------------
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('admin@zerotoskill.com');
  const [password, setPassword] = useState('admin@123');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { api('/seed').catch(() => {}); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      localStorage.setItem('token', r.token);
      localStorage.setItem('user', JSON.stringify(r.user));
      requestNotifPermission();
      onLogin(r.user);
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-orange-50 to-white p-4 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-400/30 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-orange-300/30 blur-3xl" />
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2 relative z-10">
        <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-10 flex flex-col justify-between overflow-hidden min-h-[500px]">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 -left-10 w-72 h-72 rounded-full bg-black/20 blur-3xl" />
          <div className="relative z-10"><div className="bg-white rounded-2xl p-3 inline-block shadow-lg"><Image src="/logo.png" alt="Zero to Skill" width={140} height={80} className="h-16 w-auto" /></div></div>
          <div className="relative z-10 text-white">
            <div className="text-white/80 text-sm mb-2 font-medium">You can easily</div>
            <div className="text-4xl font-bold leading-tight">Get your students from Zero to Skill.</div>
            <div className="mt-6 flex items-center gap-2 text-white/90 text-sm"><Sparkles className="w-4 h-4" /> Premium EdTech CRM Platform</div>
          </div>
        </div>
        <div className="p-10 md:p-12 flex flex-col justify-center">
          <div className="mb-6 md:hidden"><Image src="/logo.png" alt="Zero to Skill" width={100} height={60} className="h-12 w-auto" /></div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Welcome back</h2>
          <p className="text-slate-500 mt-2">Access your dashboard, manage students, and grow your institute — all in one place.</p>
          <form onSubmit={submit} className="space-y-4 mt-8">
            <div className="space-y-1.5"><Label className="font-semibold text-slate-700">Your email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="h-12 rounded-xl" /></div>
            <div className="space-y-1.5"><Label className="font-semibold text-slate-700">Password</Label>
              <div className="relative"><Input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="h-12 rounded-xl pr-12" /><button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl text-base font-semibold shadow-lg shadow-orange-500/30">{loading ? 'Signing in...' : 'Get Started →'}</Button>
            <div className="text-xs text-center text-slate-400 pt-2">Default: <span className="font-mono">admin@zerotoskill.com</span> / <span className="font-mono">admin@123</span></div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ---------------- SIDEBAR ----------------
function Sidebar({ user, active, setActive, onLogout, open, setOpen, collapsed, setCollapsed }) {
  const roleItems = {
    super_admin: ['dashboard', 'admissions', 'students', 'fees', 'faculty', 'batches', 'courses', 'lms', 'assignments', 'users', 'community', 'settings'],
    academic_manager: ['dashboard', 'students', 'batches', 'faculty', 'courses', 'lms', 'assignments', 'community', 'settings'],
    faculty: ['dashboard', 'students', 'batches', 'lms', 'assignments', 'community', 'settings'],
    counselor: ['dashboard', 'admissions', 'students', 'fees', 'community', 'settings'],
    student: ['dashboard', 'fees', 'lms', 'assignments', 'community', 'settings'],
  };
  const items = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'admissions', label: 'Admission CRM', icon: UserPlus },
    { key: 'students', label: 'Students', icon: GraduationCap },
    { key: 'fees', label: 'Fees & Finance', icon: IndianRupee },
    { key: 'faculty', label: 'Faculty', icon: Users },
    { key: 'batches', label: 'Batches', icon: BookOpen },
    { key: 'courses', label: 'Courses', icon: Library },
    { key: 'lms', label: 'LMS', icon: PlayCircle },
    { key: 'assignments', label: 'Assignments', icon: ClipboardList },
    { key: 'users', label: 'User Management', icon: UserCog },
    { key: 'community', label: 'Community', icon: MessageSquare },
    { key: 'settings', label: 'Settings', icon: Settings },
  ].filter(i => roleItems[user.role]?.includes(i.key));

  const width = collapsed ? 'w-16' : 'w-64';

  return (
    <>
      {open && <div className="lg:hidden fixed inset-0 bg-black/40 z-30" onClick={() => setOpen(false)} />}
      <aside className={`fixed lg:sticky top-0 z-40 h-screen ${width} bg-slate-950 text-slate-300 transition-all duration-300 flex flex-col ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className={`p-4 border-b border-slate-800 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center flex-shrink-0"><Image src="/logo.png" alt="ZTS" width={36} height={36} className="w-full h-full object-contain" /></div>
            {!collapsed && (<div className="min-w-0"><div className="font-bold text-white text-sm leading-tight">Zero to Skill</div><div className="text-[10px] text-orange-400 uppercase tracking-widest">CRM Platform</div></div>)}
          </div>
          {!collapsed && <button className="lg:hidden text-slate-400" onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>}
        </div>

        <button onClick={() => setCollapsed(c => !c)} className="hidden lg:flex items-center justify-center mx-3 mt-3 mb-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs">
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <><PanelLeftClose className="w-3.5 h-3.5 mr-1" /> Collapse</>}
        </button>

        <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
          {items.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => { setActive(key); setOpen(false); }}
              title={collapsed ? label : ''}
              className={`w-full flex items-center gap-3 ${collapsed ? 'justify-center px-2' : 'px-4'} py-2.5 rounded-full text-sm font-medium transition ${active === key ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />{!collapsed && label}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-slate-800">
          <div className={`flex items-center gap-2 px-2 py-2 ${collapsed ? 'justify-center' : ''}`}>
            <Avatar className="flex-shrink-0"><AvatarFallback className="bg-orange-500 text-white text-sm font-bold">{initials(user.name)}</AvatarFallback></Avatar>
            {!collapsed && (<><div className="flex-1 min-w-0"><div className="font-semibold text-sm text-white truncate">{user.name}</div><div className="text-xs text-slate-400 truncate">{ROLE_META[user.role]?.label}</div></div><button onClick={onLogout} className="p-2 rounded-md hover:bg-slate-800"><LogOut className="w-4 h-4" /></button></>)}
          </div>
        </div>
      </aside>
    </>
  );
}

// ---------------- FIELD HELPERS ----------------
const Section = ({ title, children }) => (<div className="mt-3"><div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{title}</div><div className="grid grid-cols-2 gap-3">{children}</div></div>);
const Field = ({ label, children, full }) => (<div className={`space-y-1.5 ${full ? 'col-span-2' : ''}`}><Label className="text-xs">{label}</Label>{children}</div>);
const InfoCard = ({ title, items, full }) => (<div className={`p-4 rounded-xl border bg-white ${full ? 'md:col-span-2' : ''}`}><div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{title}</div><div className="space-y-1.5 text-sm">{items.map(([k, v]) => v && <div key={k} className="flex gap-2"><span className="text-slate-500 min-w-24">{k}:</span><span className="font-medium">{v}</span></div>)}</div></div>);

// ---------------- useCourses hook ----------------
function useCourses() {
  const [courses, setCourses] = useState([]);
  useEffect(() => { api('/courses').then(r => setCourses(r.courses)).catch(() => {}); }, []);
  return courses;
}

// ---------------- DASHBOARD ----------------
function Dashboard({ user, goTo }) {
  const [stats, setStats] = useState(null);
  useEffect(() => { api('/dashboard/stats').then(setStats).catch(() => {}); }, []);
  if (!stats) return <div className="text-slate-500">Loading...</div>;
  const maxH = Math.max(...(stats.weekly || []).map(w => w.hours), 1);
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-3xl font-bold">Welcome back {user.name.split(' ')[0]} 👋</h1><p className="text-slate-500">Here's what's happening at Zero to Skill today.</p></div>
        <div className="flex items-center gap-3"><div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><Input placeholder="Search anything..." className="pl-9 w-64 bg-white rounded-full" /></div><Button size="icon" variant="outline" className="rounded-full"><Bell className="w-4 h-4" /></Button></div>
      </div>

      {stats.todaysFollowups > 0 && ['super_admin', 'counselor'].includes(user.role) && (
        <Card className="rounded-2xl border-0 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
          <CardContent className="p-5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4"><Zap className="w-10 h-10 opacity-80" /><div><div className="text-sm font-medium opacity-90">Good morning ☀️ You have</div><div className="text-2xl font-bold">{stats.todaysFollowups} follow-ups scheduled for today</div></div></div>
            <Button onClick={() => goTo('admissions')} className="bg-white text-orange-600 hover:bg-orange-50 rounded-full font-semibold">Start Follow-ups →</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: stats.totalStudents, icon: GraduationCap, bg: 'bg-orange-100', text: 'text-orange-700' },
          { label: 'Active Leads', value: stats.totalLeads, icon: UserPlus, bg: 'bg-amber-100', text: 'text-amber-700' },
          { label: 'Revenue Collected', value: formatINR(stats.totalRevenue), icon: TrendingUp, bg: 'bg-emerald-100', text: 'text-emerald-700' },
          { label: 'Pending Fees', value: formatINR(stats.pendingRevenue), icon: Wallet, bg: 'bg-red-100', text: 'text-red-700' },
        ].map(c => (
          <Card key={c.label} className="rounded-2xl border-0 shadow-sm"><CardContent className="p-5">
            <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.text} flex items-center justify-center`}><c.icon className="w-5 h-5" /></div>
            <div className="mt-3 text-2xl font-bold">{c.value}</div><div className="text-sm text-slate-500">{c.label}</div>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-0 shadow-sm lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle>Hours Activity</CardTitle><CardDescription>Weekly engagement</CardDescription></div><Badge variant="outline" className="rounded-full">Weekly</Badge></CardHeader>
          <CardContent>
            <div className="flex justify-between gap-3 px-2 h-56">
              {(stats.weekly || []).map((w, i) => { const h = Math.round((w.hours / maxH) * 100); const isHi = w.hours === maxH; return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full">
                  <div className="relative w-full flex-1 flex flex-col justify-end">
                    {isHi && <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">{w.hours}h · Peak</div>}
                    <div className={`w-full rounded-t-lg ${isHi ? 'bg-orange-500' : 'bg-slate-900'}`} style={{ height: `${Math.max(h, 8)}%`, minHeight: '20px' }} />
                  </div>
                  <span className="text-xs text-slate-500">{w.day}</span>
                </div>
              );})}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-base">{monthName}</CardTitle><CalendarDays className="w-4 h-4 text-slate-400" /></CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400 mb-2">{['S','M','T','W','T','F','S'].map((d, i) => <div key={i}>{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {Array.from({length: firstDay}).map((_, i) => <div key={'e'+i} />)}
              {Array.from({length: daysInMonth}).map((_, i) => { const d = i + 1; const isToday = d === today.getDate(); return <div key={d} className={`aspect-square flex items-center justify-center rounded-full ${isToday ? 'bg-orange-500 text-white font-bold' : 'hover:bg-slate-100'}`}>{d}</div>; })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-0 shadow-sm lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle>Admission Pipeline</CardTitle><CardDescription>{stats.conversionRate}% conversion rate</CardDescription></div><Button variant="ghost" size="sm" onClick={() => goTo('admissions')} className="text-xs">View All <ChevronRight className="w-3 h-3" /></Button></CardHeader>
          <CardContent className="space-y-3">
            {STAGES.map(s => { const count = stats.pipelineCount[s.key] || 0; const pct = stats.totalLeads > 0 ? Math.round((count / stats.totalLeads) * 100) : 0; return (
              <div key={s.key}><div className="flex items-center justify-between text-sm mb-1"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${s.dot}`} /><span className="font-medium">{s.label}</span></div><span className="text-slate-500 text-xs">{count} leads · {pct}%</span></div><Progress value={pct} className="h-1.5" /></div>
            );})}
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle className="text-base">Recent Students</CardTitle><Button variant="ghost" size="sm" onClick={() => goTo('students')} className="text-xs">All</Button></CardHeader>
          <CardContent className="space-y-3">
            {stats.recentStudents?.map(s => (
              <div key={s.id} className="flex items-center gap-3"><Avatar className="w-9 h-9"><AvatarFallback className="bg-orange-500 text-white text-xs font-bold">{initials(s.name)}</AvatarFallback></Avatar><div className="flex-1 min-w-0"><div className="font-medium text-sm truncate">{s.name}</div><div className="text-xs text-slate-500 truncate">{s.course}</div></div>{s.batch && <Badge variant="secondary" className="text-[10px]">{s.batch}</Badge>}</div>
            ))}
            {!stats.recentStudents?.length && <div className="text-sm text-slate-400 text-center py-4">No students yet</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------------- STUDENT FORM ----------------
function StudentFormDialog({ open, setOpen, existing, batches, courses, folders, onSaved, currentUser }) {
  const empty = { firstName: '', lastName: '', dob: '', gender: 'Male', aadhaar: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', parentName: '', parentPhone: '', parentOccupation: '', source: 'Instagram', course: courses[0]?.name || '', batchId: '', installmentCount: 3, folderId: '', password: 'student@123' };
  const [form, setForm] = useState(empty);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  useEffect(() => { setForm(existing ? { ...empty, installmentCount: 3, ...existing } : { ...empty, course: courses[0]?.name || '' }); }, [existing, open, courses]);

  const submit = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.course) return toast.error('Name, email and course required');
    try {
      if (existing) { await api(`/students/${existing.id}`, { method: 'PATCH', body: JSON.stringify(form) }); notify('Student updated', form.firstName + ' ' + form.lastName); }
      else { await api('/students', { method: 'POST', body: JSON.stringify(form) }); notify('New student added', `${form.firstName} enrolled in ${form.course}`); }
      setOpen(false); onSaved();
    } catch (e) { toast.error(e.message); }
  };

  const filteredBatches = batches.filter(b => b.course === form.course);
  const canSeePw = ['super_admin', 'counselor', 'academic_manager'].includes(currentUser?.role);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{existing ? 'Edit Student' : 'Add New Student'}</DialogTitle><DialogDescription>Auto-generates fee based on course + installment plan.</DialogDescription></DialogHeader>
        <Section title="Personal Information">
          <Field label="First Name *"><Input value={form.firstName} onChange={e => set('firstName', e.target.value)} /></Field>
          <Field label="Last Name *"><Input value={form.lastName} onChange={e => set('lastName', e.target.value)} /></Field>
          <Field label="Date of Birth"><Input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} /></Field>
          <Field label="Gender"><Select value={form.gender} onValueChange={v => set('gender', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Male','Female','Other'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Aadhaar Number" full><Input value={form.aadhaar} onChange={e => set('aadhaar', e.target.value)} /></Field>
        </Section>
        <Section title="Contact Information">
          <Field label="Email *"><Input type="email" value={form.email} onChange={e => set('email', e.target.value)} /></Field>
          <Field label="Mobile Number"><Input value={form.phone} onChange={e => set('phone', e.target.value)} /></Field>
          <Field label="Residential Address" full><Textarea rows={2} value={form.address} onChange={e => set('address', e.target.value)} /></Field>
          <Field label="City"><Input value={form.city} onChange={e => set('city', e.target.value)} /></Field>
          <Field label="State"><Input value={form.state} onChange={e => set('state', e.target.value)} /></Field>
          <Field label="Pin Code"><Input value={form.pincode} onChange={e => set('pincode', e.target.value)} /></Field>
        </Section>
        <Section title="Parent Details">
          <Field label="Full Name"><Input value={form.parentName} onChange={e => set('parentName', e.target.value)} /></Field>
          <Field label="Contact Number"><Input value={form.parentPhone} onChange={e => set('parentPhone', e.target.value)} /></Field>
          <Field label="Occupation" full><Input value={form.parentOccupation} onChange={e => set('parentOccupation', e.target.value)} /></Field>
        </Section>
        <Section title="Enrollment">
          <Field label="Source"><Select value={form.source} onValueChange={v => set('source', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Instagram','Facebook','YouTube','Google Ads','LinkedIn','Referral','Website','Walk-in','WhatsApp'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Course *"><Select value={form.course} onValueChange={v => { set('course', v); set('batchId', ''); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.name}>{c.name} · {formatINR(c.fee)}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Batch"><Select value={form.batchId} onValueChange={v => set('batchId', v)}><SelectTrigger><SelectValue placeholder={filteredBatches.length ? 'Select batch' : 'Create batch first'} /></SelectTrigger><SelectContent>{filteredBatches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Folder (optional)"><Select value={form.folderId} onValueChange={v => set('folderId', v)}><SelectTrigger><SelectValue placeholder="No folder" /></SelectTrigger><SelectContent><SelectItem value="">No folder</SelectItem>{folders.filter(f => f.type === 'student').map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Number of Installments" full>
            <RadioGroup value={String(form.installmentCount)} onValueChange={v => set('installmentCount', Number(v))} className="flex gap-3 pt-1">
              {[1,2,3].map(n => <label key={n} className={`flex items-center gap-2 cursor-pointer border rounded-full px-4 py-1.5 ${form.installmentCount === n ? 'border-orange-500 bg-orange-50' : ''}`}><RadioGroupItem value={String(n)} /><span>{n === 1 ? 'Full (1 payment)' : `${n} Installments`}</span></label>)}
            </RadioGroup>
          </Field>
          {canSeePw && !existing && <Field label="Login Password" full><Input value={form.password} onChange={e => set('password', e.target.value)} /></Field>}
          {canSeePw && existing && <Field label="Reset Password (leave blank)" full><Input placeholder="New password" value={form.password || ''} onChange={e => set('password', e.target.value)} /></Field>}
        </Section>
        <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} className="bg-orange-500 hover:bg-orange-600 text-white">{existing ? 'Update' : 'Add Student'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- STUDENT DETAIL ----------------
function StudentDetailDialog({ student, open, setOpen, onEdit, onDelete, currentUser }) {
  const [fees, setFees] = useState(null);
  useEffect(() => { if (!student) return; api('/fees').then(r => setFees(r.fees.filter(f => f.studentId === student.id))).catch(() => {}); }, [student]);
  if (!student) return null;
  const canSeePw = ['super_admin', 'counselor', 'academic_manager'].includes(currentUser?.role);
  const sendWA = () => openWhatsApp(student.phone, `Hi ${student.firstName || student.name}, this is Zero to Skill Institute. How can we help you today?`);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16"><AvatarFallback className="bg-orange-500 text-white text-lg font-bold">{initials(student.name)}</AvatarFallback></Avatar>
            <div className="flex-1"><DialogTitle className="text-2xl">{student.name}</DialogTitle><DialogDescription className="flex items-center gap-2 mt-1"><Badge className="bg-orange-100 text-orange-800 border-0">{student.course}</Badge>{student.batchName && <Badge variant="secondary">{student.batchName}</Badge>}</DialogDescription></div>
            <Button onClick={sendWA} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white"><MessageCircle className="w-4 h-4 mr-1" /> WhatsApp</Button>
          </div>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <InfoCard title="Personal Info" items={[['DOB', student.dob], ['Gender', student.gender], ['Aadhaar', student.aadhaar]]} />
          <InfoCard title="Contact" items={[['Email', student.email], ['Phone', student.phone], ['City', student.city], ['State', student.state], ['Pincode', student.pincode]]} />
          <InfoCard title="Address" items={[['Residence', student.address]]} full />
          <InfoCard title="Parent" items={[['Name', student.parentName], ['Phone', student.parentPhone], ['Occupation', student.parentOccupation]]} />
          <InfoCard title="Enrollment" items={[['Source', student.source], ['Mentor', student.mentorName], ['Enrolled', (student.enrollmentDate || '').slice(0,10)]]} />
        </div>
        {canSeePw && student.plainPassword && (
          <div className="mt-4 p-4 rounded-xl bg-orange-50 border border-orange-200">
            <div className="flex items-center gap-2 text-sm"><KeyRound className="w-4 h-4 text-orange-600" /><span className="font-semibold">Login Credentials</span></div>
            <div className="mt-2 grid grid-cols-2 gap-3 text-sm"><div><span className="text-slate-500">Email:</span> <span className="font-mono">{student.email}</span></div><div><span className="text-slate-500">Password:</span> <span className="font-mono font-bold">{student.plainPassword}</span></div></div>
          </div>
        )}
        {fees && fees.length > 0 && (<div className="mt-4"><div className="text-xs font-bold text-slate-500 uppercase mb-2">Fees</div>{fees.map(f => (<div key={f.id} className="p-4 rounded-xl border bg-slate-50 space-y-2"><div className="flex items-center justify-between"><div className="font-semibold">{formatINR(f.totalAmount)} · {f.installmentCount || 3} installment(s)</div><Badge className={`border-0 ${f.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : f.status === 'partial' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>{f.status}</Badge></div><div className="text-sm text-slate-600">Paid: <span className="text-emerald-600 font-medium">{formatINR(f.paidAmount)}</span> · Pending: <span className="text-red-500 font-medium">{formatINR(f.pendingAmount)}</span></div></div>))}</div>)}
        <DialogFooter className="flex-wrap gap-2"><Button variant="outline" onClick={() => { onEdit(student); setOpen(false); }}><Edit3 className="w-4 h-4 mr-1" /> Edit</Button><Button variant="outline" className="text-red-600" onClick={() => { onDelete(student); setOpen(false); }}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button><Button onClick={() => setOpen(false)}>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- CREATE FOLDER DIALOG ----------------
function CreateFolderDialog({ open, setOpen, type, onCreated }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('orange');
  const submit = async () => { if (!name) return toast.error('Name required'); try { await api('/folders', { method: 'POST', body: JSON.stringify({ name, type, color }) }); notify('Folder created', name); setOpen(false); setName(''); onCreated(); } catch (e) { toast.error(e.message); } };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent><DialogHeader><DialogTitle>Create New Folder</DialogTitle></DialogHeader>
        <div className="space-y-3"><Field label="Folder Name" full><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. VIP Students / High Value Leads" /></Field>
          <Field label="Color" full><div className="flex gap-2">{['orange','blue','emerald','pink','purple','amber'].map(c => <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full bg-${c}-500 ${color === c ? 'ring-2 ring-offset-2 ring-slate-900' : ''}`} />)}</div></Field>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} className="bg-orange-500 hover:bg-orange-600 text-white">Create</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- STUDENTS ----------------
function Students({ currentUser }) {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [folders, setFolders] = useState([]);
  const courses = useCourses();
  const [openBatchId, setOpenBatchId] = useState(null);
  const [openFolderId, setOpenFolderId] = useState(null);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [detailStudent, setDetailStudent] = useState(null);

  const load = async () => {
    const [s, b, f] = await Promise.all([api('/students'), api('/batches'), api('/folders?type=student')]);
    setStudents(s.students); setBatches(b.batches); setFolders(f.folders);
  };
  useEffect(() => { load(); }, []);

  const del = async (s) => { if (!confirm('Delete ' + s.name + '?')) return; try { await api(`/students/${s.id}`, { method: 'DELETE' }); notify('Deleted', s.name); load(); } catch (e) { toast.error(e.message); } };
  const canManage = ['super_admin', 'counselor', 'academic_manager'].includes(currentUser?.role);

  const filteredStudents = students.filter(s => { if (!search) return true; const q = search.toLowerCase(); return s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.phone?.includes(search); });

  const openBatch = openBatchId ? batches.find(b => b.id === openBatchId) : null;
  const openFolder = openFolderId ? folders.find(f => f.id === openFolderId) : null;
  const inBatch = openBatchId ? filteredStudents.filter(s => s.batchId === openBatchId) : [];
  const inFolder = openFolderId ? filteredStudents.filter(s => s.folderId === openFolderId) : [];
  const unassigned = filteredStudents.filter(s => !s.batchId);
  const showList = openBatch || openFolder || openBatchId === '__unassigned__';
  const listData = openFolder ? inFolder : openBatch ? inBatch : openBatchId === '__unassigned__' ? unassigned : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          {showList ? (<><Button variant="ghost" size="sm" onClick={() => { setOpenBatchId(null); setOpenFolderId(null); }} className="mb-1 -ml-2"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button><h1 className="text-3xl font-bold flex items-center gap-2"><FolderOpen className="w-7 h-7 text-orange-500" /> {openFolder?.name || openBatch?.name || 'Unassigned'}</h1><p className="text-slate-500">{listData.length} students</p></>) : (<><h1 className="text-3xl font-bold">Students</h1><p className="text-slate-500">{students.length} total · {batches.length} batches · {folders.length} folders</p></>)}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><Input placeholder="Search..." className="pl-9 w-56 rounded-full bg-white" value={search} onChange={e => setSearch(e.target.value)} /></div>
          {!showList && canManage && <Button variant="outline" onClick={() => setFolderOpen(true)} className="rounded-full"><FolderPlus className="w-4 h-4 mr-1" /> New Folder</Button>}
          {canManage && <Button onClick={() => { setEditStudent(null); setAddOpen(true); }} className="rounded-full bg-orange-500 hover:bg-orange-600 text-white"><Plus className="w-4 h-4 mr-1" /> New Student</Button>}
        </div>
      </div>

      {!showList && (
        <>
          {folders.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Custom Folders</div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {folders.map(f => { const count = students.filter(s => s.folderId === f.id).length; return (
                  <button key={f.id} onClick={() => setOpenFolderId(f.id)} className="text-left group">
                    <Card className="rounded-2xl border-0 shadow-sm hover:shadow-xl transition group-hover:-translate-y-1 overflow-hidden"><div className={`h-24 bg-gradient-to-br from-${f.color}-400 to-${f.color}-600 relative`}><Folder className="absolute right-4 bottom-4 w-16 h-16 text-white/20" /></div><CardContent className="p-4"><div className="font-bold text-lg">{f.name}</div><div className="mt-3 text-sm"><span className="font-bold">{count}</span> <span className="text-slate-500">students</span></div></CardContent></Card>
                  </button>
                );})}
              </div>
            </div>
          )}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Batch Folders</div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batches.map(b => { const count = students.filter(s => s.batchId === b.id).length; return (
                <button key={b.id} onClick={() => setOpenBatchId(b.id)} className="text-left group">
                  <Card className="rounded-2xl border-0 shadow-sm hover:shadow-xl transition group-hover:-translate-y-1 overflow-hidden"><div className="h-24 bg-gradient-to-br from-orange-400 to-orange-600 relative"><Folder className="absolute right-4 bottom-4 w-16 h-16 text-white/20" /><div className="absolute top-4 left-4 text-white/90 text-xs font-semibold">{b.course}</div></div><CardContent className="p-4"><div className="font-bold text-lg">{b.name}</div><div className="text-xs text-slate-500 mt-0.5">Mentor: {b.facultyName || '—'}</div><div className="flex items-center justify-between mt-3"><div className="flex items-center gap-1 text-sm"><GraduationCap className="w-4 h-4 text-orange-500" /><span className="font-bold">{count}</span><span className="text-slate-500">students</span></div><ChevronRight className="w-4 h-4 text-slate-400" /></div></CardContent></Card>
                </button>
              );})}
              {unassigned.length > 0 && (<button onClick={() => setOpenBatchId('__unassigned__')} className="text-left group"><Card className="rounded-2xl border-2 border-dashed hover:shadow-md transition overflow-hidden"><div className="h-24 bg-slate-100 relative"><Folder className="absolute right-4 bottom-4 w-16 h-16 text-slate-300" /></div><CardContent className="p-4"><div className="font-bold text-lg">Unassigned</div><div className="text-xs text-slate-500 mt-0.5">No batch</div><div className="mt-3 text-sm"><span className="font-bold">{unassigned.length}</span> <span className="text-slate-500">students</span></div></CardContent></Card></button>)}
            </div>
          </div>
        </>
      )}

      {showList && (
        <Card className="rounded-2xl border-0 shadow-sm"><CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50"><TableRow><TableHead>Student</TableHead><TableHead>Course</TableHead><TableHead>Batch</TableHead><TableHead>City</TableHead><TableHead>Contact</TableHead><TableHead>Source</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {listData.map(s => (
                <TableRow key={s.id} className="cursor-pointer" onClick={() => setDetailStudent(s)}>
                  <TableCell><div className="flex items-center gap-3"><Avatar className="w-9 h-9"><AvatarFallback className="bg-orange-500 text-white text-xs font-bold">{initials(s.name)}</AvatarFallback></Avatar><div><div className="font-medium">{s.name}</div><div className="text-xs text-slate-500">{s.email}</div></div></div></TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{s.course || '—'}</Badge></TableCell>
                  <TableCell className="text-sm">{s.batchName || '—'}</TableCell>
                  <TableCell className="text-sm">{s.city || '—'}</TableCell>
                  <TableCell className="text-sm">{s.phone || '—'}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px]">{s.source || '—'}</Badge></TableCell>
                  <TableCell><div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600" onClick={() => openWhatsApp(s.phone, `Hi ${s.firstName || s.name}, Zero to Skill here.`)}><MessageCircle className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setDetailStudent(s)}><Eye className="w-3.5 h-3.5" /></Button>
                    {canManage && <><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditStudent(s); setAddOpen(true); }}><Edit3 className="w-3.5 h-3.5" /></Button><Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => del(s)}><Trash2 className="w-3.5 h-3.5" /></Button></>}
                  </div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      )}

      <StudentFormDialog open={addOpen} setOpen={setAddOpen} existing={editStudent} batches={batches} courses={courses} folders={folders} onSaved={load} currentUser={currentUser} />
      <StudentDetailDialog student={detailStudent} open={!!detailStudent} setOpen={(o) => !o && setDetailStudent(null)} onEdit={s => { setEditStudent(s); setAddOpen(true); }} onDelete={del} currentUser={currentUser} />
      <CreateFolderDialog open={folderOpen} setOpen={setFolderOpen} type="student" onCreated={load} />
    </div>
  );
}

// ---------------- ADMISSIONS ----------------
function Admissions({ currentUser }) {
  const [leads, setLeads] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [view, setView] = useState('kanban');
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [dragId, setDragId] = useState(null);
  const courses = useCourses();

  const load = async () => { try { const [l, f] = await Promise.all([api('/leads'), api('/leads/today-followups')]); setLeads(l.leads); setFollowups(f.followups); } catch (e) { toast.error(e.message); } };
  useEffect(() => { load(); }, []);

  const moveLead = async (id, status) => { setLeads(ls => ls.map(l => l.id === id ? { ...l, status } : l)); try { await api('/leads/status', { method: 'PATCH', body: JSON.stringify({ id, status }) }); notify('Lead moved', STAGES.find(s => s.key === status).label); } catch (e) { toast.error(e.message); load(); } };
  const del = async (id) => { if (!confirm('Delete this lead?')) return; await api(`/leads/${id}`, { method: 'DELETE' }); notify('Lead deleted'); load(); };

  const filtered = leads.filter(l => { if (stageFilter !== 'all' && l.status !== stageFilter) return false; if (!search) return true; const q = search.toLowerCase(); return l.name?.toLowerCase().includes(q) || l.course?.toLowerCase().includes(q) || l.phone?.includes(search); });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-3xl font-bold">Admission CRM</h1><p className="text-slate-500">{filtered.length} of {leads.length} leads</p></div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-white border rounded-full p-0.5">{[{k:'kanban',I:Kanban,L:'Kanban'},{k:'list',I:List,L:'List'},{k:'excel',I:Sheet,L:'Excel'}].map(v => (<button key={v.k} onClick={() => setView(v.k)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${view === v.k ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><v.I className="w-3.5 h-3.5" /> {v.L}</button>))}</div>
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><Input placeholder="Search..." className="pl-9 w-56 rounded-full bg-white" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <Select value={stageFilter} onValueChange={setStageFilter}><SelectTrigger className="w-36 rounded-full bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Stages</SelectItem>{STAGES.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent></Select>
          <AddLeadDialog open={addOpen} setOpen={setAddOpen} onCreated={load} courses={courses} />
        </div>
      </div>

      {followups.length > 0 && (
        <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-r from-orange-50 to-amber-50">
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Zap className="w-5 h-5 text-orange-500" /> Today's Follow-ups · {followups.length} pending</CardTitle><CardDescription>Reach out to these leads now — scheduled for today or earlier</CardDescription></CardHeader>
          <CardContent className="p-0">
            <div className="max-h-56 overflow-y-auto px-6 pb-4 space-y-2">
              {followups.map(l => (
                <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border">
                  <Avatar className="w-9 h-9"><AvatarFallback className="bg-orange-500 text-white text-xs font-bold">{initials(l.name)}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0"><div className="font-semibold text-sm">{l.name} <Badge className="ml-1 bg-amber-100 text-amber-800 border-0 text-[10px]">{l.status}</Badge></div><div className="text-xs text-slate-500 truncate">{l.course} · Due: {l.followupDate}</div></div>
                  <Button size="sm" onClick={() => openWhatsApp(l.phone, `Hi ${l.name}, this is Zero to Skill Institute. Is this a good time to talk about the ${l.course} program?`)} className="bg-emerald-500 hover:bg-emerald-600 text-white h-8"><MessageCircle className="w-3.5 h-3.5 mr-1" /> WhatsApp</Button>
                  <a href={`tel:${l.phone}`} className="text-blue-600 hover:bg-blue-50 rounded-full p-2"><Phone className="w-4 h-4" /></a>
                  <Button size="sm" variant="outline" onClick={() => moveLead(l.id, 'counseling')} className="h-8">Mark Counseling</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {view === 'kanban' && (
        <div className="overflow-x-auto pb-4"><div className="flex gap-4 min-w-max">
          {STAGES.map(stage => { const stageLeads = filtered.filter(l => l.status === stage.key); return (
            <div key={stage.key} onDragOver={e => e.preventDefault()} onDrop={() => { if (dragId) { moveLead(dragId, stage.key); setDragId(null); } }} className="w-80 flex-shrink-0">
              <div className="flex items-center justify-between px-3 py-2 rounded-t-xl bg-white"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${stage.dot}`} /><span className="font-semibold text-sm">{stage.label}</span></div><Badge variant="secondary" className="bg-slate-100">{stageLeads.length}</Badge></div>
              <div className="bg-slate-100 rounded-b-xl p-2 min-h-[400px] space-y-2">
                {stageLeads.map(l => (
                  <div key={l.id} draggable onDragStart={() => setDragId(l.id)} className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md cursor-grab transition">
                    <div className="flex items-start justify-between gap-2"><div className="flex-1 min-w-0"><div className="font-semibold text-sm truncate">{l.name}</div><div className="text-xs text-slate-500 truncate">{l.course}</div></div><Badge variant="outline" className="text-[10px] px-1.5">{l.source}</Badge></div>
                    <div className="mt-2 space-y-1 text-xs text-slate-600"><div className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{l.phone}</div></div>
                    <div className="mt-2 pt-2 border-t flex items-center justify-between gap-1">
                      <button onClick={() => openWhatsApp(l.phone, `Hi ${l.name}, Zero to Skill here about ${l.course}`)} className="text-emerald-600 hover:bg-emerald-50 rounded p-1"><MessageCircle className="w-3.5 h-3.5" /></button>
                      <Select value={l.status} onValueChange={v => moveLead(l.id, v)}><SelectTrigger className="h-7 flex-1 text-[10px]"><SelectValue /></SelectTrigger><SelectContent>{STAGES.map(s => <SelectItem key={s.key} value={s.key} className="text-xs">{s.label}</SelectItem>)}</SelectContent></Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );})}
        </div></div>
      )}

      {view === 'list' && (
        <div className="grid gap-3">
          {filtered.map(l => { const stage = STAGES.find(s => s.key === l.status); return (
            <Card key={l.id} className="rounded-2xl border-0 shadow-sm"><CardContent className="p-4 flex items-center gap-4 flex-wrap">
              <Avatar className="w-11 h-11"><AvatarFallback className="bg-orange-500 text-white text-sm font-bold">{initials(l.name)}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-[180px]"><div className="flex items-center gap-2"><div className="font-semibold">{l.name}</div><Badge className={`${stage.chip} border-0 text-[10px]`}>{stage.label}</Badge></div><div className="text-xs text-slate-500">{l.course} · {l.city || '—'}</div></div>
              <div className="text-sm"><div className="flex items-center gap-1.5 text-slate-600"><Phone className="w-3 h-3" />{l.phone}</div></div>
              <Badge variant="outline" className="text-[10px]">{l.source}</Badge>
              <Button size="sm" onClick={() => openWhatsApp(l.phone, `Hi ${l.name}, Zero to Skill`)} className="bg-emerald-500 hover:bg-emerald-600 text-white h-8"><MessageCircle className="w-3.5 h-3.5" /></Button>
              <Select value={l.status} onValueChange={v => moveLead(l.id, v)}><SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger><SelectContent>{STAGES.map(s => <SelectItem key={s.key} value={s.key} className="text-xs">{s.label}</SelectItem>)}</SelectContent></Select>
              <Button size="icon" variant="ghost" onClick={() => del(l.id)} className="text-red-500 h-8 w-8"><Trash2 className="w-3.5 h-3.5" /></Button>
            </CardContent></Card>
          );})}
        </div>
      )}

      {view === 'excel' && (
        <Card className="rounded-2xl border-0 shadow-sm"><CardContent className="p-0 overflow-x-auto"><table className="w-full text-xs border-collapse"><thead className="bg-slate-900 text-white"><tr>{['Name','Course','Source','Phone','City','Stage','Followup','Actions'].map(h => <th key={h} className="text-left px-3 py-2 font-semibold border border-slate-700">{h}</th>)}</tr></thead><tbody>{filtered.map((l, i) => { const stage = STAGES.find(s => s.key === l.status); return (<tr key={l.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}><td className="px-3 py-2 border font-medium">{l.name}</td><td className="px-3 py-2 border">{l.course}</td><td className="px-3 py-2 border">{l.source}</td><td className="px-3 py-2 border">{l.phone}</td><td className="px-3 py-2 border">{l.city || '—'}</td><td className="px-3 py-2 border"><Badge className={`${stage.chip} border-0 text-[10px]`}>{stage.label}</Badge></td><td className="px-3 py-2 border">{l.followupDate}</td><td className="px-3 py-2 border"><Select value={l.status} onValueChange={v => moveLead(l.id, v)}><SelectTrigger className="h-6 text-[10px] w-28"><SelectValue /></SelectTrigger><SelectContent>{STAGES.map(s => <SelectItem key={s.key} value={s.key} className="text-xs">{s.label}</SelectItem>)}</SelectContent></Select></td></tr>);})}</tbody></table></CardContent></Card>
      )}
    </div>
  );
}

function AddLeadDialog({ open, setOpen, onCreated, courses }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', course: '', source: 'Website Form', notes: '', followupDate: '', parentName: '', parentPhone: '', city: '' });
  useEffect(() => { if (courses.length && !form.course) setForm(f => ({ ...f, course: courses[0].name })); }, [courses]);
  const change = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = async () => {
    if (!form.name || !form.phone) return toast.error('Name and phone required');
    try { await api('/leads', { method: 'POST', body: JSON.stringify(form) }); notify('Lead added', form.name); setOpen(false); onCreated(); setForm({ ...form, name: '', email: '', phone: '', notes: '' }); }
    catch (e) { toast.error(e.message); }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="rounded-full bg-orange-500 hover:bg-orange-600 text-white"><Plus className="w-4 h-4 mr-1" /> New Lead</Button></DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Capture New Lead</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name *"><Input value={form.name} onChange={e => change('name', e.target.value)} /></Field>
          <Field label="Phone *"><Input value={form.phone} onChange={e => change('phone', e.target.value)} /></Field>
          <Field label="Email"><Input value={form.email} onChange={e => change('email', e.target.value)} /></Field>
          <Field label="City"><Input value={form.city} onChange={e => change('city', e.target.value)} /></Field>
          <Field label="Course"><Select value={form.course} onValueChange={v => change('course', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Source"><Select value={form.source} onValueChange={v => change('source', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Website Form','Instagram Ad','YouTube Ad','Google Ad','Referral','Walk-in','LinkedIn','WhatsApp'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></Field>
          <Field label="Followup Date"><Input type="date" value={form.followupDate} onChange={e => change('followupDate', e.target.value)} /></Field>
          <Field label="Notes" full><Textarea value={form.notes} onChange={e => change('notes', e.target.value)} /></Field>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} className="bg-orange-500 hover:bg-orange-600 text-white">Save Lead</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- RECEIPT ----------------
function ReceiptView({ receipt, onClose }) {
  if (!receipt) return null;
  const print = () => window.print();
  return (
    <Dialog open={!!receipt} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Payment Receipt</DialogTitle></DialogHeader>
        <div className="p-6 border rounded-xl bg-white space-y-4">
          <div className="flex items-center justify-between border-b pb-4"><div><div className="font-black text-orange-600 text-xl">Zero to Skill</div><div className="text-xs text-slate-500">Institute · EdTech CRM</div></div><div className="text-right"><div className="text-xs text-slate-500">Receipt No.</div><div className="font-mono font-bold">{receipt.receiptNo}</div></div></div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><div className="text-slate-500 text-xs">Student</div><div className="font-semibold">{receipt.studentName}</div></div>
            <div><div className="text-slate-500 text-xs">Date</div><div className="font-semibold">{new Date(receipt.paidAt).toLocaleDateString()}</div></div>
            <div><div className="text-slate-500 text-xs">Course</div><div className="font-semibold">{receipt.course}</div></div>
            <div><div className="text-slate-500 text-xs">Batch</div><div className="font-semibold">{receipt.batchName || '—'}</div></div>
            <div><div className="text-slate-500 text-xs">For</div><div className="font-semibold">{receipt.installmentLabel}</div></div>
            <div><div className="text-slate-500 text-xs">Method</div><div className="font-semibold uppercase">{receipt.method}</div></div>
          </div>
          <div className="p-4 rounded-xl bg-orange-50 border border-orange-200"><div className="text-xs text-slate-600">Amount Paid</div><div className="text-3xl font-black text-orange-600">{formatINR(receipt.amount)}</div></div>
          <div className="text-center text-xs text-slate-400 pt-4 border-t">This is a system-generated receipt. Thank you!</div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Close</Button><Button onClick={print} className="bg-orange-500 hover:bg-orange-600 text-white"><Printer className="w-4 h-4 mr-1" /> Print / PDF</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- FEES ----------------
function Fees({ currentUser }) {
  const [fees, setFees] = useState([]);
  const [batches, setBatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [openBatchId, setOpenBatchId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ studentId: '', totalAmount: 45000, installmentCount: 3 });
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ totalAmount: 0, installmentCount: 3 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [receipt, setReceipt] = useState(null);

  const load = async () => {
    const [f, s, st, b] = await Promise.all([api('/fees'), api('/fees/stats'), api('/students'), api('/batches')]);
    setFees(f.fees); setStats(s); setStudents(st.students); setBatches(b.batches);
  };
  useEffect(() => { load(); }, []);

  const payInstallment = async (fee, idx) => {
    try {
      const r = await api('/fees/pay-installment', { method: 'POST', body: JSON.stringify({ feeId: fee.id, installmentIndex: idx, method: 'cash' }) });
      notify('Payment recorded', formatINR(fee.installments[idx].amount) + ' · ' + fee.studentName);
      setDetail(r.fee); load();
      setReceipt({ receiptNo: r.receiptNo, studentName: fee.studentName, course: fee.course, batchName: fee.batchName, paidAt: new Date().toISOString(), amount: fee.installments[idx].amount, installmentLabel: fee.installments[idx].label, method: 'cash' });
    } catch (e) { toast.error(e.message); }
  };

  const addFee = async () => { if (!addForm.studentId) return toast.error('Select a student'); try { await api('/fees', { method: 'POST', body: JSON.stringify(addForm) }); notify('Fee created'); setAddOpen(false); load(); } catch (e) { toast.error(e.message); } };
  const saveEdit = async () => { try { await api(`/fees/${detail.id}`, { method: 'PATCH', body: JSON.stringify(editForm) }); notify('Fee updated'); setEditOpen(false); load(); setDetail(null); } catch (e) { toast.error(e.message); } };
  const del = async (id) => { if (!confirm('Delete this fee?')) return; await api(`/fees/${id}`, { method: 'DELETE' }); notify('Fee deleted'); setDetail(null); load(); };

  const filtered = fees.filter(f => {
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    if (openBatchId && openBatchId !== '__all__' && openBatchId !== '__unassigned__' && f.batchId !== openBatchId) return false;
    if (openBatchId === '__unassigned__' && f.batchId) return false;
    if (!search) return true;
    return f.studentName?.toLowerCase().includes(search.toLowerCase());
  });

  if (!stats) return <div className="text-slate-500">Loading...</div>;
  const openBatch = openBatchId && !['__all__','__unassigned__'].includes(openBatchId) ? batches.find(b => b.id === openBatchId) : null;
  const kpis = [
    { label: 'Total Collected', value: formatINR(stats.totalRevenue), icon: CheckCircle2, bg: 'bg-emerald-100', text: 'text-emerald-700' },
    { label: 'Total Pending', value: formatINR(stats.pendingRevenue), icon: AlertCircle, bg: 'bg-red-100', text: 'text-red-700' },
    { label: 'Fully Paid', value: stats.fullyPaid, icon: CheckCircle2, bg: 'bg-orange-100', text: 'text-orange-700' },
    { label: 'Partial / Pending', value: `${stats.partial} / ${stats.pending}`, icon: Clock, bg: 'bg-amber-100', text: 'text-amber-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>{openBatch ? (<><Button variant="ghost" size="sm" onClick={() => setOpenBatchId(null)} className="mb-1 -ml-2"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button><h1 className="text-3xl font-bold flex items-center gap-2"><FolderOpen className="w-7 h-7 text-orange-500" /> {openBatch.name} · Fees</h1></>) : (<><h1 className="text-3xl font-bold">Fees & Finance</h1><p className="text-slate-500">Manage collections, EMIs & installments</p></>)}</div>
        <Button onClick={() => setAddOpen(true)} className="rounded-full bg-orange-500 hover:bg-orange-600 text-white"><Plus className="w-4 h-4 mr-1" /> New Fee</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(c => (<Card key={c.label} className="rounded-2xl border-0 shadow-sm"><CardContent className="p-5"><div className={`w-10 h-10 rounded-xl ${c.bg} ${c.text} flex items-center justify-center`}><c.icon className="w-5 h-5" /></div><div className="mt-3 text-2xl font-bold">{c.value}</div><div className="text-sm text-slate-500">{c.label}</div></CardContent></Card>))}
      </div>

      {!openBatchId && (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(stats.byCourse).map(([course, d]) => (
              <Card key={course} className="rounded-2xl border-0 shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-base">{course}</CardTitle><CardDescription>{d.count} students</CardDescription></CardHeader><CardContent><div className="flex justify-between text-sm mb-1"><span className="text-emerald-700 font-semibold">Collected</span><span>{formatINR(d.collected)}</span></div><div className="flex justify-between text-sm mb-3"><span className="text-red-600 font-semibold">Pending</span><span>{formatINR(d.pending)}</span></div><Progress value={d.collected + d.pending > 0 ? (d.collected / (d.collected + d.pending)) * 100 : 0} className="h-2" /></CardContent></Card>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between mb-3"><h3 className="font-bold text-lg">Batch Folders</h3><Button variant="outline" size="sm" onClick={() => setOpenBatchId('__all__')}>Show All Fees</Button></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batches.map(b => (
                <button key={b.id} onClick={() => setOpenBatchId(b.id)} className="text-left group"><Card className="rounded-2xl border-0 shadow-sm hover:shadow-xl transition group-hover:-translate-y-1 overflow-hidden"><div className="h-24 bg-gradient-to-br from-orange-400 to-red-500 relative"><Folder className="absolute right-4 bottom-4 w-16 h-16 text-white/20" /><div className="absolute top-4 left-4 text-white/90 text-xs font-semibold">{b.course}</div></div><CardContent className="p-4"><div className="font-bold text-lg">{b.name}</div><div className="grid grid-cols-2 gap-2 mt-3 text-sm"><div><div className="text-xs text-slate-500">Collected</div><div className="font-bold text-emerald-600">{formatINR(b.totalRevenue)}</div></div><div><div className="text-xs text-slate-500">Pending</div><div className="font-bold text-red-500">{formatINR(b.pendingRevenue)}</div></div></div></CardContent></Card></button>
              ))}
            </div>
          </div>
        </>
      )}

      {openBatchId && (
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>Student Fee Records</CardTitle><div className="flex gap-2"><div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><Input placeholder="Search..." className="pl-9 w-56 rounded-full" value={search} onChange={e => setSearch(e.target.value)} /></div><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-32 rounded-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="paid">Paid</SelectItem><SelectItem value="partial">Partial</SelectItem><SelectItem value="pending">Pending</SelectItem></SelectContent></Select></div></CardHeader>
          <CardContent className="p-0"><Table>
            <TableHeader className="bg-slate-50"><TableRow><TableHead>Student</TableHead><TableHead>Course</TableHead><TableHead>Batch</TableHead><TableHead>Installments</TableHead><TableHead>Total</TableHead><TableHead>Paid</TableHead><TableHead>Pending</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(f => (
                <TableRow key={f.id} className="cursor-pointer" onClick={() => setDetail(f)}>
                  <TableCell><div className="font-medium">{f.studentName}</div><div className="text-xs text-slate-500">{f.studentEmail}</div></TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{f.course}</Badge></TableCell>
                  <TableCell className="text-sm">{f.batchName || '—'}</TableCell>
                  <TableCell><Badge variant="outline">{f.installmentCount || 3} × EMI</Badge></TableCell>
                  <TableCell className="font-medium">{formatINR(f.totalAmount)}</TableCell>
                  <TableCell className="text-emerald-700 font-medium">{formatINR(f.paidAmount)}</TableCell>
                  <TableCell className="text-red-600 font-medium">{formatINR(f.pendingAmount)}</TableCell>
                  <TableCell><Badge className={`border-0 ${f.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : f.status === 'partial' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>{f.status}</Badge></TableCell>
                  <TableCell><Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setDetail(f); }}><Eye className="w-4 h-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></CardContent>
        </Card>
      )}

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          {detail && (<>
            <DialogHeader><DialogTitle className="flex items-center justify-between"><span>{detail.studentName}</span><Badge className={`border-0 ${detail.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : detail.status === 'partial' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>{detail.status}</Badge></DialogTitle><DialogDescription>{detail.course} · {detail.batchName || 'No batch'}</DialogDescription></DialogHeader>
            <div className="grid grid-cols-3 gap-3"><div className="p-4 rounded-xl bg-slate-100"><div className="text-xs text-slate-500">Total</div><div className="text-xl font-bold">{formatINR(detail.totalAmount)}</div></div><div className="p-4 rounded-xl bg-emerald-50"><div className="text-xs text-emerald-700">Paid</div><div className="text-xl font-bold text-emerald-700">{formatINR(detail.paidAmount)}</div></div><div className="p-4 rounded-xl bg-red-50"><div className="text-xs text-red-600">Pending</div><div className="text-xl font-bold text-red-600">{formatINR(detail.pendingAmount)}</div></div></div>
            <div><div className="text-xs font-bold text-slate-500 uppercase mb-2">Installments ({detail.installmentCount || detail.installments?.length})</div><div className="space-y-2">
              {detail.installments?.map((i, idx) => (<div key={idx} className="flex items-center justify-between p-3 rounded-xl border"><div><div className="font-semibold text-sm">{i.label}</div><div className="text-xs text-slate-500">Due: {i.dueDate} {i.paid && `· Paid ${i.paidDate}`}</div></div><div className="flex items-center gap-3"><div className="font-bold">{formatINR(i.amount)}</div>{i.paid ? <Badge className="bg-emerald-100 text-emerald-800 border-0">Paid</Badge> : <Button size="sm" onClick={() => payInstallment(detail, idx)} className="bg-orange-500 hover:bg-orange-600 text-white">Collect</Button>}</div></div>))}
            </div></div>
            <DialogFooter className="flex-wrap gap-2"><Button variant="outline" onClick={() => { setEditForm({ totalAmount: detail.totalAmount, installmentCount: detail.installmentCount || detail.installments?.length || 3 }); setEditOpen(true); }}><Edit3 className="w-4 h-4 mr-1" /> Edit</Button><Button variant="outline" className="text-red-600" onClick={() => del(detail.id)}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button><Button onClick={() => setDetail(null)}>Close</Button></DialogFooter>
          </>)}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent><DialogHeader><DialogTitle>Edit Fee</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Field label="Total Amount (₹)"><Input type="number" value={editForm.totalAmount} onChange={e => setEditForm({...editForm, totalAmount: Number(e.target.value)})} /></Field>
            <Field label="Number of Installments"><RadioGroup value={String(editForm.installmentCount)} onValueChange={v => setEditForm({...editForm, installmentCount: Number(v)})} className="flex gap-3 pt-1">{[1,2,3].map(n => <label key={n} className={`flex items-center gap-2 cursor-pointer border rounded-full px-4 py-1.5 ${editForm.installmentCount === n ? 'border-orange-500 bg-orange-50' : ''}`}><RadioGroupItem value={String(n)} /><span>{n === 1 ? 'Full' : `${n} Installments`}</span></label>)}</RadioGroup></Field>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button><Button onClick={saveEdit} className="bg-orange-500 hover:bg-orange-600 text-white">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent><DialogHeader><DialogTitle>Create Fee Record</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Field label="Student"><Select value={addForm.studentId} onValueChange={v => { const s = students.find(x => x.id === v); setAddForm(f => ({...f, studentId: v })); }}><SelectTrigger><SelectValue placeholder="Choose student" /></SelectTrigger><SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.name} · {s.course}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Total Amount (₹)"><Input type="number" value={addForm.totalAmount} onChange={e => setAddForm({...addForm, totalAmount: Number(e.target.value)})} /></Field>
            <Field label="Installments"><RadioGroup value={String(addForm.installmentCount)} onValueChange={v => setAddForm({...addForm, installmentCount: Number(v)})} className="flex gap-3 pt-1">{[1,2,3].map(n => <label key={n} className={`flex items-center gap-2 cursor-pointer border rounded-full px-4 py-1.5 ${addForm.installmentCount === n ? 'border-orange-500 bg-orange-50' : ''}`}><RadioGroupItem value={String(n)} /><span>{n === 1 ? 'Full' : `${n} EMI`}</span></label>)}</RadioGroup></Field>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={addFee} className="bg-orange-500 hover:bg-orange-600 text-white">Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ReceiptView receipt={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}

// ---------------- FACULTY ----------------
function Faculty() {
  const [faculty, setFaculty] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const courses = useCourses();
  const [form, setForm] = useState({ name: '', email: '', phone: '', specialization: '', password: 'faculty@123', commissionPercent: 0 });
  useEffect(() => { if (courses.length && !form.specialization) setForm(f => ({ ...f, specialization: courses[0].name })); }, [courses]);
  const load = () => api('/faculty').then(r => setFaculty(r.faculty));
  useEffect(() => { load(); }, []);
  const submit = async () => { if (!form.name || !form.email) return toast.error('Name and email required'); try { await api('/faculty', { method: 'POST', body: JSON.stringify(form) }); notify('Faculty added', form.name); setAddOpen(false); load(); } catch (e) { toast.error(e.message); } };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-3xl font-bold">Faculty</h1><p className="text-slate-500">{faculty.length} mentors</p></div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button className="rounded-full bg-orange-500 hover:bg-orange-600 text-white"><Plus className="w-4 h-4 mr-1" /> Add Faculty</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Faculty</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Field label="Full Name"><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></Field>
              <Field label="Email"><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></Field>
              <Field label="Phone"><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></Field>
              <Field label="Specialization"><Select value={form.specialization} onValueChange={v => setForm({...form, specialization: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select></Field>
              <Field label="Password"><Input value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></Field>
              <Field label="Commission % per student (optional)"><Input type="number" value={form.commissionPercent} onChange={e => setForm({...form, commissionPercent: Number(e.target.value)})} placeholder="e.g. 10 for 10%" /></Field>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={submit} className="bg-orange-500 hover:bg-orange-600 text-white">Add</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {faculty.map(f => (
          <Card key={f.id} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Avatar className="w-14 h-14"><AvatarFallback className="bg-orange-500 text-white text-lg font-bold">{initials(f.name)}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0"><div className="font-bold truncate">{f.name}</div><div className="text-xs text-slate-500 truncate">{f.email}</div><Badge className="mt-2 bg-orange-100 text-orange-800 border-0 text-[10px]">{f.specialization || 'Mentor'}</Badge></div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t"><div className="text-center"><div className="flex items-center justify-center gap-1 text-amber-500"><Star className="w-3 h-3 fill-amber-400" /><span className="text-sm font-bold">{f.rating?.toFixed(1) || '5.0'}</span></div><div className="text-[10px] text-slate-500 uppercase">Rating</div></div><div className="text-center"><div className="text-sm font-bold">{f.studentsCount || 0}</div><div className="text-[10px] text-slate-500 uppercase">Students</div></div><div className="text-center"><div className="text-sm font-bold">{f.batchesCount || 0}</div><div className="text-[10px] text-slate-500 uppercase">Batches</div></div></div>
              {f.commissionPercent > 0 && (<div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200"><div className="flex items-center justify-between text-sm"><div className="flex items-center gap-1.5 text-emerald-700"><Percent className="w-3.5 h-3.5" /><span className="font-semibold">{f.commissionPercent}% commission</span></div><div className="font-bold text-emerald-700">{formatINR(f.commissionEarned || 0)}</div></div></div>)}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------------- BATCHES ----------------
function Batches() {
  const [batches, setBatches] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const courses = useCourses();
  const [addOpen, setAddOpen] = useState(false);
  const [editBatch, setEditBatch] = useState(null);
  const [form, setForm] = useState({ name: '', course: '', startDate: '', endDate: '', capacity: 30, facultyId: '' });
  useEffect(() => { if (courses.length && !form.course) setForm(f => ({ ...f, course: courses[0].name })); }, [courses]);
  const load = async () => { const [b, f] = await Promise.all([api('/batches'), api('/faculty')]); setBatches(b.batches); setFaculty(f.faculty); };
  useEffect(() => { load(); }, []);
  const openAdd = () => { setEditBatch(null); setForm({ name: '', course: courses[0]?.name || '', startDate: '', endDate: '', capacity: 30, facultyId: '' }); setAddOpen(true); };
  const openEdit = (b) => { setEditBatch(b); setForm({ name: b.name, course: b.course, startDate: b.startDate, endDate: b.endDate, capacity: b.capacity, facultyId: b.facultyId }); setAddOpen(true); };
  const submit = async () => { if (!form.name || !form.facultyId) return toast.error('Name and faculty required'); const fm = faculty.find(f => f.id === form.facultyId); try { if (editBatch) { await api(`/batches/${editBatch.id}`, { method: 'PATCH', body: JSON.stringify({ ...form, facultyName: fm?.name }) }); notify('Batch updated'); } else { await api('/batches', { method: 'POST', body: JSON.stringify({ ...form, facultyName: fm?.name }) }); notify('Batch created', form.name); } setAddOpen(false); load(); } catch (e) { toast.error(e.message); } };
  const del = async (id) => { if (!confirm('Delete this batch?')) return; try { await api(`/batches/${id}`, { method: 'DELETE' }); notify('Batch deleted'); load(); } catch (e) { toast.error(e.message); } };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3"><div><h1 className="text-3xl font-bold">Batches</h1><p className="text-slate-500">{batches.length} active</p></div><Button onClick={openAdd} className="rounded-full bg-orange-500 hover:bg-orange-600 text-white"><Plus className="w-4 h-4 mr-1" /> New Batch</Button></div>
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editBatch ? 'Edit Batch' : 'Create Batch'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Field label="Batch Name"><Input placeholder="e.g. DM-AI-Aug-2025" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></Field>
            <Field label="Course"><Select value={form.course} onValueChange={v => setForm({...form, course: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select></Field>
            <div className="grid grid-cols-2 gap-3"><Field label="Start"><Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} /></Field><Field label="End"><Input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} /></Field></div>
            <Field label="Faculty"><Select value={form.facultyId} onValueChange={v => setForm({...form, facultyId: v})}><SelectTrigger><SelectValue placeholder="Select faculty" /></SelectTrigger><SelectContent>{faculty.map(f => <SelectItem key={f.id} value={f.id}>{f.name} · {f.specialization}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Capacity"><Input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: Number(e.target.value)})} /></Field>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={submit} className="bg-orange-500 hover:bg-orange-600 text-white">{editBatch ? 'Update' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {batches.map(b => (
          <Card key={b.id} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-orange-400 to-red-500" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between"><div><div className="font-bold text-lg">{b.name}</div><Badge variant="secondary" className="mt-1 text-[10px]">{b.course}</Badge></div><div className="flex gap-1"><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(b)}><Edit3 className="w-3.5 h-3.5" /></Button><Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => del(b.id)}><Trash2 className="w-3.5 h-3.5" /></Button></div></div>
              <div className="mt-3 space-y-1.5 text-sm"><div className="flex items-center gap-2 text-slate-600"><Users className="w-4 h-4" /> {b.facultyName || '—'}</div><div className="flex items-center gap-2 text-slate-600"><Clock className="w-4 h-4" /> {b.startDate} → {b.endDate}</div></div>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t text-center"><div><div className="text-lg font-bold text-orange-600">{b.studentsCount || 0}</div><div className="text-[10px] text-slate-500 uppercase">Students</div></div><div><div className="text-sm font-bold text-emerald-600">{formatINR(b.totalRevenue)}</div><div className="text-[10px] text-slate-500 uppercase">Collected</div></div><div><div className="text-sm font-bold text-red-500">{formatINR(b.pendingRevenue)}</div><div className="text-[10px] text-slate-500 uppercase">Pending</div></div></div>
              <div className="mt-3"><div className="flex items-center justify-between text-xs mb-1"><span>Enrollment</span><span>{b.studentsCount || 0}/{b.capacity}</span></div><Progress value={((b.studentsCount || 0) / (b.capacity || 1)) * 100} className="h-2" /></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------------- COURSES ----------------
function Courses({ currentUser }) {
  const [courses, setCourses] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', fee: 30000, duration: '3 Months', description: '' });
  const load = () => api('/courses').then(r => setCourses(r.courses));
  useEffect(() => { load(); }, []);
  const isAdmin = currentUser?.role === 'super_admin';
  const submit = async () => { if (!form.name || !form.fee) return toast.error('Name and fee required'); try { await api('/courses', { method: 'POST', body: JSON.stringify(form) }); notify('Course created', form.name); setAddOpen(false); load(); setForm({ name: '', fee: 30000, duration: '3 Months', description: '' }); } catch (e) { toast.error(e.message); } };
  const del = async (id) => { if (!confirm('Delete this course?')) return; await api(`/courses/${id}`, { method: 'DELETE' }); notify('Course deleted'); load(); };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3"><div><h1 className="text-3xl font-bold">Course Management</h1><p className="text-slate-500">{courses.length} courses offered</p></div>{isAdmin && <Button onClick={() => setAddOpen(true)} className="rounded-full bg-orange-500 hover:bg-orange-600 text-white"><Plus className="w-4 h-4 mr-1" /> New Course</Button>}</div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(c => (
          <Card key={c.id} className="rounded-2xl border-0 shadow-sm hover:shadow-lg transition overflow-hidden">
            <div className="h-28 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 relative"><Library className="absolute right-4 bottom-4 w-20 h-20 text-white/20" /><Badge className="absolute top-4 left-4 bg-white text-orange-600 border-0 font-bold">{c.duration}</Badge></div>
            <CardContent className="p-5">
              <div className="flex items-start justify-between"><div className="font-bold text-lg leading-tight">{c.name}</div>{isAdmin && <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => del(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>}</div>
              <div className="text-sm text-slate-500 mt-2 line-clamp-2">{c.description}</div>
              <div className="mt-4 pt-4 border-t"><div className="text-xs text-slate-500 uppercase">Course Fee</div><div className="text-2xl font-black text-orange-600">{formatINR(c.fee)}</div></div>
              <div className="grid grid-cols-2 gap-2 mt-4 text-center"><div className="p-2 rounded-lg bg-slate-100"><div className="text-lg font-bold">{c.studentsCount}</div><div className="text-[10px] text-slate-500 uppercase">Students</div></div><div className="p-2 rounded-lg bg-slate-100"><div className="text-lg font-bold">{c.batchesCount}</div><div className="text-[10px] text-slate-500 uppercase">Batches</div></div></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent><DialogHeader><DialogTitle>Add New Course</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Field label="Course Name" full><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Full Stack Development" /></Field>
            <div className="grid grid-cols-2 gap-3"><Field label="Fee (₹)"><Input type="number" value={form.fee} onChange={e => setForm({...form, fee: Number(e.target.value)})} /></Field><Field label="Duration"><Input value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} placeholder="e.g. 6 Months" /></Field></div>
            <Field label="Description" full><Textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></Field>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={submit} className="bg-orange-500 hover:bg-orange-600 text-white">Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------- LMS ----------------
function LMS({ currentUser }) {
  const courses = useCourses();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);
  const [moduleOpen, setModuleOpen] = useState(false);
  const [moduleForm, setModuleForm] = useState({ title: '', order: 0 });
  const [lessonOpen, setLessonOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState({ moduleId: '', title: '', type: 'video', contentUrl: '', description: '', duration: '' });
  const [activeLesson, setActiveLesson] = useState(null);
  const isAdmin = ['super_admin', 'faculty', 'academic_manager'].includes(currentUser?.role);

  const loadCourse = async (courseId) => {
    const r = await api(`/lms/course/${courseId}`);
    setModules(r.modules);
    if (currentUser?.role === 'student') { const pg = await api('/lms/my-progress'); setProgress(pg.progress); }
  };
  useEffect(() => { if (selectedCourse) loadCourse(selectedCourse.id); }, [selectedCourse]);

  const addModule = async () => { if (!moduleForm.title) return toast.error('Title required'); try { await api('/lms/modules', { method: 'POST', body: JSON.stringify({ ...moduleForm, courseId: selectedCourse.id }) }); notify('Module added'); setModuleOpen(false); setModuleForm({ title: '', order: 0 }); loadCourse(selectedCourse.id); } catch (e) { toast.error(e.message); } };
  const addLesson = async () => { if (!lessonForm.title || !lessonForm.moduleId) return toast.error('Title and module required'); try { await api('/lms/lessons', { method: 'POST', body: JSON.stringify({ ...lessonForm, courseId: selectedCourse.id }) }); notify('Lesson added'); setLessonOpen(false); setLessonForm({ moduleId: '', title: '', type: 'video', contentUrl: '', description: '', duration: '' }); loadCourse(selectedCourse.id); } catch (e) { toast.error(e.message); } };
  const complete = async (lesson) => { try { await api('/lms/complete', { method: 'POST', body: JSON.stringify({ lessonId: lesson.id, courseId: selectedCourse.id }) }); notify('Lesson completed! +10 XP'); loadCourse(selectedCourse.id); } catch (e) { toast.error(e.message); } };
  const delModule = async (id) => { if (!confirm('Delete module?')) return; await api(`/lms/modules/${id}`, { method: 'DELETE' }); notify('Deleted'); loadCourse(selectedCourse.id); };
  const delLesson = async (id) => { if (!confirm('Delete lesson?')) return; await api(`/lms/lessons/${id}`, { method: 'DELETE' }); notify('Deleted'); loadCourse(selectedCourse.id); };

  const isCompleted = (lessonId) => progress.some(p => p.lessonId === lessonId);
  const totalLessons = modules.reduce((a, m) => a + (m.lessons?.length || 0), 0);
  const completedLessons = modules.reduce((a, m) => a + (m.lessons?.filter(l => isCompleted(l.id)).length || 0), 0);
  const coursePct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const lessonIcon = { video: Video, pdf: FileText, text: BookOpen };

  if (!selectedCourse) return (
    <div className="space-y-4">
      <div><h1 className="text-3xl font-bold">Learning Management System</h1><p className="text-slate-500">Select a course to manage modules & lessons</p></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(c => (<button key={c.id} onClick={() => setSelectedCourse(c)} className="text-left group"><Card className="rounded-2xl border-0 shadow-sm hover:shadow-xl transition group-hover:-translate-y-1 overflow-hidden"><div className="h-28 bg-gradient-to-br from-orange-400 to-red-500 relative"><PlayCircle className="absolute right-4 bottom-4 w-20 h-20 text-white/20" /><Badge className="absolute top-4 left-4 bg-white text-orange-600 border-0 font-bold">{c.duration}</Badge></div><CardContent className="p-5"><div className="font-bold text-lg">{c.name}</div><div className="text-xs text-slate-500 mt-1">{c.studentsCount} students enrolled</div><div className="flex items-center gap-1 mt-3 text-orange-500 font-medium text-sm">Enter Course <ChevronRight className="w-4 h-4" /></div></CardContent></Card></button>))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><Button variant="ghost" size="sm" onClick={() => setSelectedCourse(null)} className="mb-1 -ml-2"><ArrowLeft className="w-4 h-4 mr-1" /> All Courses</Button><h1 className="text-3xl font-bold">{selectedCourse.name}</h1><p className="text-slate-500">{modules.length} modules · {totalLessons} lessons</p></div>
        {isAdmin && (<div className="flex gap-2"><Button onClick={() => setModuleOpen(true)} variant="outline" className="rounded-full"><Layers className="w-4 h-4 mr-1" /> New Module</Button><Button onClick={() => { setLessonForm(f => ({ ...f, moduleId: modules[0]?.id || '' })); setLessonOpen(true); }} className="rounded-full bg-orange-500 hover:bg-orange-600 text-white"><Plus className="w-4 h-4 mr-1" /> New Lesson</Button></div>)}
      </div>

      {currentUser?.role === 'student' && totalLessons > 0 && (
        <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-r from-orange-50 to-amber-50"><CardContent className="p-5 flex items-center gap-4 flex-wrap"><Trophy className="w-10 h-10 text-orange-500" /><div className="flex-1 min-w-[200px]"><div className="text-sm text-slate-500">Your progress</div><div className="text-2xl font-bold">{coursePct}% Complete</div><Progress value={coursePct} className="h-2 mt-2" /></div><div className="text-right"><div className="text-3xl font-black text-orange-600">{completedLessons}/{totalLessons}</div><div className="text-xs text-slate-500">Lessons</div></div></CardContent></Card>
      )}

      <div className="space-y-3">
        {modules.map((m, mIdx) => (
          <Card key={m.id} className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="flex-row items-center justify-between space-y-0"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">{mIdx + 1}</div><div><CardTitle className="text-base">{m.title}</CardTitle><CardDescription>{m.lessons?.length || 0} lessons</CardDescription></div></div>{isAdmin && <Button size="icon" variant="ghost" className="text-red-500 h-8 w-8" onClick={() => delModule(m.id)}><Trash2 className="w-3.5 h-3.5" /></Button>}</CardHeader>
            <CardContent className="pt-0 space-y-2">
              {m.lessons?.map((l, lIdx) => { const Icon = lessonIcon[l.type] || Video; const done = isCompleted(l.id); return (
                <div key={l.id} className={`flex items-center gap-3 p-3 rounded-xl border ${done ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 hover:bg-slate-100'}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${done ? 'bg-emerald-500 text-white' : 'bg-white text-orange-600'}`}>{done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}</div>
                  <div className="flex-1 min-w-0"><div className="font-medium text-sm">{lIdx + 1}. {l.title}</div><div className="text-xs text-slate-500 flex items-center gap-2"><Badge variant="outline" className="text-[9px] px-1">{l.type}</Badge>{l.duration && <span>· {l.duration}</span>}</div></div>
                  <Button size="sm" onClick={() => setActiveLesson(l)} className="bg-slate-900 hover:bg-slate-800 text-white h-8"><PlayCircle className="w-3.5 h-3.5 mr-1" />Open</Button>
                  {currentUser?.role === 'student' && !done && <Button size="sm" onClick={() => complete(l)} variant="outline" className="h-8">Mark Done</Button>}
                  {isAdmin && <Button size="icon" variant="ghost" className="text-red-500 h-8 w-8" onClick={() => delLesson(l.id)}><Trash2 className="w-3.5 h-3.5" /></Button>}
                </div>
              );})}
              {!m.lessons?.length && <div className="text-sm text-slate-400 py-3 text-center">No lessons yet</div>}
            </CardContent>
          </Card>
        ))}
        {!modules.length && <div className="text-center py-10 text-slate-400"><Layers className="w-12 h-12 mx-auto mb-3 opacity-30" /><div>No modules yet. {isAdmin && 'Add your first module to get started!'}</div></div>}
      </div>

      <Dialog open={moduleOpen} onOpenChange={setModuleOpen}><DialogContent><DialogHeader><DialogTitle>New Module</DialogTitle></DialogHeader><div className="space-y-3"><Field label="Module Title" full><Input value={moduleForm.title} onChange={e => setModuleForm({...moduleForm, title: e.target.value})} placeholder="e.g. Introduction to Digital Marketing" /></Field><Field label="Order" full><Input type="number" value={moduleForm.order} onChange={e => setModuleForm({...moduleForm, order: Number(e.target.value)})} /></Field></div><DialogFooter><Button variant="outline" onClick={() => setModuleOpen(false)}>Cancel</Button><Button onClick={addModule} className="bg-orange-500 hover:bg-orange-600 text-white">Create</Button></DialogFooter></DialogContent></Dialog>

      <Dialog open={lessonOpen} onOpenChange={setLessonOpen}><DialogContent className="max-w-xl"><DialogHeader><DialogTitle>New Lesson</DialogTitle></DialogHeader><div className="space-y-3">
        <Field label="Module" full><Select value={lessonForm.moduleId} onValueChange={v => setLessonForm({...lessonForm, moduleId: v})}><SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger><SelectContent>{modules.map(m => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Title" full><Input value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} /></Field>
        <Field label="Type" full><RadioGroup value={lessonForm.type} onValueChange={v => setLessonForm({...lessonForm, type: v})} className="flex gap-3 pt-1">{[['video','Video'],['pdf','PDF'],['text','Text Notes']].map(([v,l]) => <label key={v} className={`flex items-center gap-2 cursor-pointer border rounded-full px-4 py-1.5 ${lessonForm.type === v ? 'border-orange-500 bg-orange-50' : ''}`}><RadioGroupItem value={v} /><span>{l}</span></label>)}</RadioGroup></Field>
        <Field label={lessonForm.type === 'video' ? 'Video URL (YouTube/Vimeo/etc.)' : lessonForm.type === 'pdf' ? 'PDF URL / Drive Link' : 'Content'} full><Input value={lessonForm.contentUrl} onChange={e => setLessonForm({...lessonForm, contentUrl: e.target.value})} placeholder={lessonForm.type === 'video' ? 'https://youtube.com/embed/...' : 'https://...'} /></Field>
        <Field label="Duration"><Input value={lessonForm.duration} onChange={e => setLessonForm({...lessonForm, duration: e.target.value})} placeholder="e.g. 15 min" /></Field>
        <Field label="Description"><Input value={lessonForm.description} onChange={e => setLessonForm({...lessonForm, description: e.target.value})} /></Field>
      </div><DialogFooter><Button variant="outline" onClick={() => setLessonOpen(false)}>Cancel</Button><Button onClick={addLesson} className="bg-orange-500 hover:bg-orange-600 text-white">Add Lesson</Button></DialogFooter></DialogContent></Dialog>

      <Dialog open={!!activeLesson} onOpenChange={(o) => !o && setActiveLesson(null)}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          {activeLesson && (<>
            <DialogHeader><DialogTitle>{activeLesson.title}</DialogTitle><DialogDescription>{activeLesson.description}</DialogDescription></DialogHeader>
            {activeLesson.type === 'video' && activeLesson.contentUrl && (
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                <iframe src={activeLesson.contentUrl.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen title={activeLesson.title} />
              </div>
            )}
            {activeLesson.type === 'pdf' && activeLesson.contentUrl && (<div className="p-4 rounded-xl bg-slate-100"><a href={activeLesson.contentUrl} target="_blank" rel="noopener" className="text-orange-600 font-medium flex items-center gap-2"><FileText className="w-4 h-4" /> Open PDF in new tab</a></div>)}
            {activeLesson.type === 'text' && (<div className="p-4 rounded-xl bg-slate-50 whitespace-pre-wrap text-sm">{activeLesson.contentUrl}</div>)}
            <DialogFooter>{currentUser?.role === 'student' && !isCompleted(activeLesson.id) && <Button onClick={() => { complete(activeLesson); setActiveLesson(null); }} className="bg-orange-500 hover:bg-orange-600 text-white">Mark Complete · +10 XP</Button>}<Button onClick={() => setActiveLesson(null)}>Close</Button></DialogFooter>
          </>)}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------- ASSIGNMENTS ----------------
function Assignments({ currentUser }) {
  const [assignments, setAssignments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [batchFilter, setBatchFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', batchId: '', dueDate: '', maxScore: 100 });
  const [openA, setOpenA] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitForm, setSubmitForm] = useState({ fileUrl: '', notes: '' });
  const isAdmin = ['super_admin', 'faculty', 'academic_manager'].includes(currentUser?.role);

  const load = async () => {
    const url = currentUser?.role === 'student' ? '/assignments/my' : `/assignments${batchFilter !== 'all' ? '?batchId=' + batchFilter : ''}`;
    const [a, b] = await Promise.all([api(url), api('/batches')]);
    setAssignments(a.assignments); setBatches(b.batches);
  };
  useEffect(() => { load(); }, [batchFilter]);

  const submitAssign = async () => { if (!form.title || !form.batchId) return toast.error('Title and batch required'); const b = batches.find(x => x.id === form.batchId); try { await api('/assignments', { method: 'POST', body: JSON.stringify({ ...form, batchName: b?.name }) }); notify('Assignment created', form.title); setAddOpen(false); load(); setForm({ title: '', description: '', batchId: '', dueDate: '', maxScore: 100 }); } catch (e) { toast.error(e.message); } };
  const del = async (id) => { if (!confirm('Delete assignment?')) return; await api(`/assignments/${id}`, { method: 'DELETE' }); notify('Deleted'); load(); };
  const openDetail = async (a) => { setOpenA(a); if (isAdmin) { const r = await api(`/assignments/${a.id}/submissions`); setSubmissions(r.submissions); } };
  const submitWork = async () => { if (!submitForm.fileUrl) return toast.error('URL required'); try { await api(`/assignments/${openA.id}/submit`, { method: 'POST', body: JSON.stringify(submitForm) }); notify('Submitted', 'Assignment submission received'); setSubmitOpen(false); setSubmitForm({ fileUrl: '', notes: '' }); load(); openDetail(openA); } catch (e) { toast.error(e.message); } };
  const grade = async (subId, gradeVal, feedback) => { try { await api(`/assignments/grade`, { method: 'POST', body: JSON.stringify({ submissionId: subId, grade: gradeVal, feedback }) }); notify('Graded'); openDetail(openA); } catch (e) { toast.error(e.message); } };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-3xl font-bold">Assignments</h1><p className="text-slate-500">{assignments.length} assignments</p></div>
        <div className="flex gap-2">
          {isAdmin && <Select value={batchFilter} onValueChange={setBatchFilter}><SelectTrigger className="w-48 rounded-full bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Batches</SelectItem>{batches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select>}
          {isAdmin && <Button onClick={() => setAddOpen(true)} className="rounded-full bg-orange-500 hover:bg-orange-600 text-white"><Plus className="w-4 h-4 mr-1" /> New Assignment</Button>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {assignments.map(a => (
          <Card key={a.id} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition cursor-pointer" onClick={() => openDetail(a)}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between"><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><ClipboardList className="w-4 h-4 text-orange-500" /><div className="font-bold">{a.title}</div></div><div className="text-xs text-slate-500 mt-1">{a.batchName} · Due {a.dueDate}</div></div>{isAdmin && <Button size="icon" variant="ghost" className="text-red-500 h-8 w-8" onClick={(e) => { e.stopPropagation(); del(a.id); }}><Trash2 className="w-3.5 h-3.5" /></Button>}</div>
              <div className="text-sm text-slate-600 mt-2 line-clamp-2">{a.description}</div>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t text-xs">
                <div className="flex items-center gap-1"><Trophy className="w-3 h-3 text-amber-500" /><span>Max {a.maxScore} pts</span></div>
                {isAdmin && <div className="flex items-center gap-1"><Upload className="w-3 h-3 text-emerald-500" /><span>{a.submissionsCount || 0} submissions</span></div>}
                {a.mySubmission && <Badge className={`ml-auto border-0 ${a.mySubmission.grade !== null ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>{a.mySubmission.grade !== null ? `Graded: ${a.mySubmission.grade}/${a.maxScore}` : 'Submitted'}</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
        {!assignments.length && <div className="col-span-2 text-center py-10 text-slate-400"><ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" /><div>No assignments yet</div></div>}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}><DialogContent><DialogHeader><DialogTitle>New Assignment</DialogTitle></DialogHeader><div className="space-y-3"><Field label="Title" full><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></Field><Field label="Description" full><Textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></Field><Field label="Batch" full><Select value={form.batchId} onValueChange={v => setForm({...form, batchId: v})}><SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger><SelectContent>{batches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></Field><div className="grid grid-cols-2 gap-3"><Field label="Due Date"><Input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} /></Field><Field label="Max Score"><Input type="number" value={form.maxScore} onChange={e => setForm({...form, maxScore: Number(e.target.value)})} /></Field></div></div><DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={submitAssign} className="bg-orange-500 hover:bg-orange-600 text-white">Create</Button></DialogFooter></DialogContent></Dialog>

      <Dialog open={!!openA} onOpenChange={(o) => !o && setOpenA(null)}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          {openA && (<>
            <DialogHeader><DialogTitle>{openA.title}</DialogTitle><DialogDescription>{openA.batchName} · Due {openA.dueDate} · Max {openA.maxScore} pts</DialogDescription></DialogHeader>
            <div className="whitespace-pre-wrap text-sm p-4 rounded-xl bg-slate-50">{openA.description}</div>

            {currentUser?.role === 'student' && (
              <div>
                {openA.mySubmission ? (
                  <div className="p-4 rounded-xl border bg-emerald-50">
                    <div className="flex items-center justify-between"><div className="font-semibold">Your Submission</div>{openA.mySubmission.grade !== null && <Badge className="bg-emerald-500 text-white border-0">Graded: {openA.mySubmission.grade}/{openA.maxScore}</Badge>}</div>
                    <a href={openA.mySubmission.fileUrl} target="_blank" rel="noopener" className="text-blue-600 text-sm mt-2 flex items-center gap-1"><Upload className="w-3 h-3" /> {openA.mySubmission.fileUrl}</a>
                    {openA.mySubmission.notes && <div className="text-xs text-slate-600 mt-2">Notes: {openA.mySubmission.notes}</div>}
                    {openA.mySubmission.feedback && <div className="text-xs mt-2 p-2 rounded bg-white"><b>Feedback:</b> {openA.mySubmission.feedback}</div>}
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => setSubmitOpen(true)}>Resubmit</Button>
                  </div>
                ) : (
                  <Button onClick={() => setSubmitOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white w-full"><Upload className="w-4 h-4 mr-1" /> Submit Your Work</Button>
                )}
              </div>
            )}

            {isAdmin && (
              <div><div className="text-xs font-bold text-slate-500 uppercase mb-2">Submissions ({submissions.length})</div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {submissions.map(s => (
                    <div key={s.id} className="p-3 rounded-xl border">
                      <div className="flex items-center justify-between"><div className="font-semibold text-sm">{s.studentName}</div><div className="text-xs text-slate-500">{new Date(s.submittedAt).toLocaleString()}</div></div>
                      <a href={s.fileUrl} target="_blank" rel="noopener" className="text-blue-600 text-xs mt-1 block truncate">{s.fileUrl}</a>
                      {s.notes && <div className="text-xs text-slate-600 mt-1">Note: {s.notes}</div>}
                      <div className="flex items-center gap-2 mt-2">
                        <Input type="number" placeholder="Grade" defaultValue={s.grade || ''} className="w-24 h-8" onBlur={e => e.target.value !== (s.grade === null ? '' : String(s.grade)) && grade(s.id, e.target.value, s.feedback || '')} />
                        <Input placeholder="Feedback" defaultValue={s.feedback || ''} className="h-8" onBlur={e => e.target.value !== (s.feedback || '') && grade(s.id, s.grade || 0, e.target.value)} />
                      </div>
                    </div>
                  ))}
                  {!submissions.length && <div className="text-sm text-slate-400 text-center py-4">No submissions yet</div>}
                </div>
              </div>
            )}
          </>)}
        </DialogContent>
      </Dialog>

      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent><DialogHeader><DialogTitle>Submit Assignment</DialogTitle><DialogDescription>Upload your work to Google Drive, Dropbox, or similar and paste the shareable link.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <Field label="Submission Link / File URL" full><Input value={submitForm.fileUrl} onChange={e => setSubmitForm({...submitForm, fileUrl: e.target.value})} placeholder="https://drive.google.com/..." /></Field>
            <Field label="Notes (optional)" full><Textarea rows={3} value={submitForm.notes} onChange={e => setSubmitForm({...submitForm, notes: e.target.value})} /></Field>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setSubmitOpen(false)}>Cancel</Button><Button onClick={submitWork} className="bg-orange-500 hover:bg-orange-600 text-white">Submit</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------- USER MANAGEMENT ----------------
function UserManagement({ currentUser: me }) {
  const [users, setUsers] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'counselor', phone: '', specialization: '', commissionPercent: 0 });
  const [showPwFor, setShowPwFor] = useState(null);
  const courses = useCourses();
  const load = () => api('/users').then(r => setUsers(r.users));
  useEffect(() => { load(); }, []);
  const openAdd = () => { setEditUser(null); setForm({ name: '', email: '', password: '', role: 'counselor', phone: '', specialization: courses[0]?.name || '', commissionPercent: 0 }); setAddOpen(true); };
  const openEdit = (u) => { setEditUser(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, phone: u.phone, specialization: u.specialization || '', commissionPercent: u.commissionPercent || 0 }); setAddOpen(true); };
  const submit = async () => {
    if (!form.name || !form.email) return toast.error('Name and email required');
    try {
      if (editUser) { const body = { name: form.name, email: form.email, phone: form.phone, specialization: form.specialization, commissionPercent: form.commissionPercent }; if (form.password) body.password = form.password; await api(`/users/${editUser.id}`, { method: 'PATCH', body: JSON.stringify(body) }); notify('User updated'); }
      else { if (!form.password) return toast.error('Password required'); await api('/users', { method: 'POST', body: JSON.stringify(form) }); notify('User created', form.name); }
      setAddOpen(false); load();
    } catch (e) { toast.error(e.message); }
  };
  const del = async (u) => { if (u.id === me.id) return toast.error("Cannot delete yourself"); if (!confirm(`Delete ${u.name}?`)) return; await api(`/users/${u.id}`, { method: 'DELETE' }); notify('Deleted'); load(); };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3"><div><h1 className="text-3xl font-bold">User Management</h1><p className="text-slate-500">Create and manage all users</p></div><Button onClick={openAdd} className="rounded-full bg-orange-500 hover:bg-orange-600 text-white"><Plus className="w-4 h-4 mr-1" /> Add User</Button></div>
      <Card className="rounded-2xl border-0 shadow-sm"><CardContent className="p-0 overflow-x-auto"><Table>
        <TableHeader className="bg-slate-50"><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Phone</TableHead><TableHead>Password</TableHead><TableHead>Created</TableHead><TableHead></TableHead></TableRow></TableHeader>
        <TableBody>{users.map(u => (<TableRow key={u.id}>
          <TableCell><div className="flex items-center gap-3"><Avatar className="w-9 h-9"><AvatarFallback className="bg-orange-500 text-white text-xs font-bold">{initials(u.name)}</AvatarFallback></Avatar><div><div className="font-medium">{u.name} {u.id === me.id && <span className="text-xs text-orange-500">(you)</span>}</div><div className="text-xs text-slate-500">{u.email}</div></div></div></TableCell>
          <TableCell><Badge className={`${ROLE_META[u.role]?.chip} border-0 text-[10px]`}>{ROLE_META[u.role]?.label}</Badge></TableCell>
          <TableCell className="text-sm">{u.phone || '—'}</TableCell>
          <TableCell><div className="flex items-center gap-2"><span className="font-mono text-xs">{showPwFor === u.id ? (u.plainPassword || 'N/A') : '••••••••'}</span><button onClick={() => setShowPwFor(showPwFor === u.id ? null : u.id)} className="text-slate-400">{showPwFor === u.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button></div></TableCell>
          <TableCell className="text-xs text-slate-500">{(u.createdAt || '').slice(0,10)}</TableCell>
          <TableCell><div className="flex gap-1"><Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(u)}><Edit3 className="w-3.5 h-3.5" /></Button>{u.id !== me.id && <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => del(u)}><Trash2 className="w-3.5 h-3.5" /></Button>}</div></TableCell>
        </TableRow>))}</TableBody>
      </Table></CardContent></Card>
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editUser ? 'Edit User' : 'Add User'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Field label="Full Name"><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></Field>
            <Field label="Email"><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></Field>
            <Field label="Password"><Input value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder={editUser ? 'Leave blank to keep' : 'Set password'} /></Field>
            <Field label="Role"><Select value={form.role} onValueChange={v => setForm({...form, role: v})} disabled={!!editUser}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="super_admin">Super Admin</SelectItem><SelectItem value="academic_manager">Academic Manager</SelectItem><SelectItem value="counselor">Counselor</SelectItem><SelectItem value="faculty">Faculty</SelectItem><SelectItem value="student">Student</SelectItem></SelectContent></Select></Field>
            <Field label="Phone"><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></Field>
            {form.role === 'faculty' && <><Field label="Specialization"><Select value={form.specialization} onValueChange={v => setForm({...form, specialization: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent></Select></Field>
              <Field label="Commission % (optional)"><Input type="number" value={form.commissionPercent} onChange={e => setForm({...form, commissionPercent: Number(e.target.value)})} placeholder="e.g. 10" /></Field></>}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={submit} className="bg-orange-500 hover:bg-orange-600 text-white">{editUser ? 'Update' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------- COMMUNITY ----------------
function Community({ currentUser }) {
  const [posts, setPosts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [batches, setBatches] = useState([]);
  const [batchFilter, setBatchFilter] = useState(currentUser?.batchId || 'all');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', type: 'discussion', tag: 'General', batchId: currentUser?.batchId || null });
  const [tab, setTab] = useState('feed');
  const [openPost, setOpenPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const load = async () => {
    const url = `/community/posts${batchFilter !== 'all' ? '?batchId=' + batchFilter : ''}`;
    const [p, l, b] = await Promise.all([api(url), api('/community/leaderboard'), api('/batches')]);
    setPosts(p.posts); setLeaderboard(l.leaderboard); setBatches(b.batches);
  };
  useEffect(() => { load(); }, [batchFilter]);

  const loadComments = async (postId) => { const r = await api(`/community/posts/${postId}/comments`); setComments(r.comments); };
  const submitPost = async () => { if (!form.title || !form.body) return toast.error('Title and content required'); try { await api('/community/posts', { method: 'POST', body: JSON.stringify(form) }); notify('Posted!', 'You earned XP for posting'); setAddOpen(false); setForm({ title: '', body: '', type: 'discussion', tag: 'General', batchId: currentUser?.batchId || null }); load(); } catch (e) { toast.error(e.message); } };
  const like = async (id) => { try { const r = await api(`/community/posts/${id}/like`, { method: 'POST' }); setPosts(ps => ps.map(p => p.id === id ? { ...p, likesCount: r.likesCount, likes: r.liked ? [...(p.likes || []), currentUser.id] : (p.likes || []).filter(x => x !== currentUser.id) } : p)); } catch (e) { toast.error(e.message); } };
  const comment = async () => { if (!newComment.trim()) return; try { await api(`/community/posts/${openPost.id}/comments`, { method: 'POST', body: JSON.stringify({ body: newComment }) }); setNewComment(''); loadComments(openPost.id); load(); } catch (e) { toast.error(e.message); } };
  const delPost = async (id) => { if (!confirm('Delete post?')) return; await api(`/community/posts/${id}`, { method: 'DELETE' }); notify('Deleted'); load(); };

  const typeIcon = { question: HelpCircle, discussion: MessageSquare, showcase: Trophy };
  const typeColor = { question: 'text-amber-600 bg-amber-50 border-amber-200', discussion: 'text-blue-600 bg-blue-50 border-blue-200', showcase: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  const rankColors = ['from-yellow-400 to-amber-500', 'from-slate-300 to-slate-500', 'from-orange-400 to-orange-600'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-3xl font-bold">Community</h1><p className="text-slate-500">Discuss · Share · Learn · Earn XP</p></div>
        <div className="flex gap-2 items-center flex-wrap">
          <Select value={batchFilter} onValueChange={setBatchFilter}><SelectTrigger className="w-48 rounded-full bg-white"><SelectValue /></SelectTrigger><SelectContent>
            <SelectItem value="all">🌐 Global Community</SelectItem>
            <SelectItem value="global">📢 Global Only</SelectItem>
            {batches.map(b => <SelectItem key={b.id} value={b.id}>📁 {b.name}</SelectItem>)}
          </SelectContent></Select>
          <div className="flex bg-white border rounded-full p-0.5">{[{k:'feed',I:MessageSquare,L:'Feed'},{k:'leaderboard',I:Trophy,L:'Leaderboard'}].map(v => (<button key={v.k} onClick={() => setTab(v.k)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${tab === v.k ? 'bg-orange-500 text-white' : 'text-slate-600'}`}><v.I className="w-3.5 h-3.5" /> {v.L}</button>))}</div>
          <Button onClick={() => setAddOpen(true)} className="rounded-full bg-orange-500 hover:bg-orange-600 text-white"><Plus className="w-4 h-4 mr-1" /> New Post</Button>
        </div>
      </div>

      {tab === 'feed' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {posts.map(p => { const Icon = typeIcon[p.type] || MessageSquare; const liked = (p.likes || []).includes(currentUser.id); const batchName = batches.find(b => b.id === p.batchId)?.name; return (
              <Card key={p.id} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition"><CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar><AvatarFallback className="bg-orange-500 text-white text-xs font-bold">{initials(p.authorName)}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap"><div className="font-semibold text-sm">{p.authorName}</div><Badge className={`${ROLE_META[p.authorRole]?.chip} border-0 text-[10px]`}>{ROLE_META[p.authorRole]?.label}</Badge>{batchName && <Badge variant="outline" className="text-[10px]">📁 {batchName}</Badge>}<div className="text-xs text-slate-400 ml-auto">{new Date(p.createdAt).toLocaleDateString()}</div></div>
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-2"><div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${typeColor[p.type]}`}><Icon className="w-3 h-3" />{p.type}</div><Badge variant="outline" className="text-[10px]">{p.tag}</Badge></div>
                      <div className="font-bold text-lg">{p.title}</div>
                      <div className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{p.body}</div>
                    </div>
                    <div className="mt-4 flex items-center gap-3 text-sm">
                      <button onClick={() => like(p.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${liked ? 'bg-orange-100 text-orange-700' : 'hover:bg-slate-100 text-slate-600'}`}><Heart className={`w-4 h-4 ${liked ? 'fill-orange-500 text-orange-500' : ''}`} />{p.likesCount || 0}</button>
                      <button onClick={() => { setOpenPost(p); loadComments(p.id); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 text-slate-600"><MessageCircle className="w-4 h-4" />{p.commentsCount || 0}</button>
                      {(p.authorId === currentUser.id || currentUser.role === 'super_admin') && <button onClick={() => delPost(p.id)} className="ml-auto text-red-500 hover:bg-red-50 p-1.5 rounded-full"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </div>
                </div>
              </CardContent></Card>
            );})}
            {!posts.length && <div className="text-center text-slate-400 py-10">No posts yet. Be the first!</div>}
          </div>
          <Card className="rounded-2xl border-0 shadow-sm h-fit sticky top-4">
            <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-500" /> Top Learners</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {leaderboard.slice(0, 5).map((u, i) => (<div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${i < 3 ? `bg-gradient-to-br ${rankColors[i]}` : 'bg-slate-300'}`}>{i + 1}</div><Avatar className="w-8 h-8"><AvatarFallback className="bg-orange-500 text-white text-xs">{initials(u.name)}</AvatarFallback></Avatar><div className="flex-1 min-w-0"><div className="font-medium text-sm truncate">{u.name}</div></div><div className="font-bold text-orange-600 text-sm flex items-center gap-1"><Flame className="w-3 h-3" />{u.xp || 0}</div></div>))}
              {!leaderboard.length && <div className="text-center text-slate-400 py-6 text-sm">No students yet</div>}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'leaderboard' && (
        <Card className="rounded-2xl border-0 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="w-6 h-6 text-amber-500" /> XP Leaderboard</CardTitle><CardDescription>Post +10 · Question +15 · Answer +20 · Like +2 · Lesson Complete +10 · Assignment +15</CardDescription></CardHeader><CardContent><div className="grid gap-2">{leaderboard.map((u, i) => (<div key={u.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${i < 3 ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200' : 'bg-white'}`}><div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg ${i < 3 ? `bg-gradient-to-br ${rankColors[i]}` : 'bg-slate-300'}`}>{i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}</div><Avatar className="w-11 h-11"><AvatarFallback className="bg-orange-500 text-white font-bold">{initials(u.name)}</AvatarFallback></Avatar><div className="flex-1 min-w-0"><div className="font-bold">{u.name}</div><div className="text-xs text-slate-500">{u.course} · {u.batchName || 'No batch'}</div></div><div className="text-right"><div className="text-2xl font-black text-orange-600 flex items-center gap-1 justify-end"><Flame className="w-5 h-5" />{u.xp || 0}</div><div className="text-xs text-slate-500">XP</div></div></div>))}</div></CardContent></Card>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-xl"><DialogHeader><DialogTitle>New Post</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Field label="Post to" full><Select value={form.batchId || 'global'} onValueChange={v => setForm({...form, batchId: v === 'global' ? null : v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="global">🌐 Global Community</SelectItem>{batches.map(b => <SelectItem key={b.id} value={b.id}>📁 {b.name}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Type" full><RadioGroup value={form.type} onValueChange={v => setForm({...form, type: v})} className="flex gap-3 pt-1">{[['discussion','Discussion'],['question','Question / Doubt'],['showcase','Showcase']].map(([v,l]) => <label key={v} className={`flex items-center gap-2 cursor-pointer border rounded-full px-3 py-1.5 ${form.type === v ? 'border-orange-500 bg-orange-50' : ''}`}><RadioGroupItem value={v} /><span className="text-sm">{l}</span></label>)}</RadioGroup></Field>
            <Field label="Tag" full><Select value={form.tag} onValueChange={v => setForm({...form, tag: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['General','Digital Marketing','Graphics Design','AI Tools','Freelancing','Career','Portfolio'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></Field>
            <Field label="Title *" full><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></Field>
            <Field label="Details *" full><Textarea rows={5} value={form.body} onChange={e => setForm({...form, body: e.target.value})} /></Field>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={submitPost} className="bg-orange-500 hover:bg-orange-600 text-white">Post & Earn XP</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!openPost} onOpenChange={(o) => !o && setOpenPost(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">{openPost && (<>
          <DialogHeader><DialogTitle>{openPost.title}</DialogTitle><DialogDescription>By {openPost.authorName}</DialogDescription></DialogHeader>
          <div className="whitespace-pre-wrap text-sm">{openPost.body}</div>
          <div className="border-t pt-4"><div className="text-xs font-bold text-slate-500 uppercase mb-2">Comments ({comments.length})</div>
            <div className="space-y-3 max-h-64 overflow-y-auto">{comments.map(c => (<div key={c.id} className="flex gap-2"><Avatar className="w-8 h-8"><AvatarFallback className="bg-slate-500 text-white text-[10px]">{initials(c.authorName)}</AvatarFallback></Avatar><div className="flex-1 bg-slate-50 rounded-xl p-2.5"><div className="flex items-center gap-2"><div className="font-semibold text-xs">{c.authorName}</div><Badge className={`${ROLE_META[c.authorRole]?.chip} border-0 text-[9px]`}>{ROLE_META[c.authorRole]?.label}</Badge></div><div className="text-sm mt-1">{c.body}</div></div></div>))}{!comments.length && <div className="text-center text-slate-400 py-4 text-sm">No comments yet</div>}</div>
            <div className="flex gap-2 mt-3"><Input placeholder="Add comment..." value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && comment()} /><Button onClick={comment} className="bg-orange-500 hover:bg-orange-600 text-white"><Send className="w-4 h-4" /></Button></div>
          </div>
        </>)}</DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------- SETTINGS ----------------
function SettingsPage({ currentUser, onUserUpdate }) {
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [emailForm, setEmailForm] = useState({ newEmail: currentUser.email, password: '' });
  const [notifEnabled, setNotifEnabled] = useState(typeof window !== 'undefined' && Notification.permission === 'granted');
  const changePw = async () => { if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match'); if (pwForm.newPassword.length < 6) return toast.error('Min 6 chars'); try { await api('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }) }); notify('Password updated'); setPwForm({ currentPassword: '', newPassword: '', confirm: '' }); } catch (e) { toast.error(e.message); } };
  const changeEmail = async () => { try { await api('/auth/change-email', { method: 'POST', body: JSON.stringify({ newEmail: emailForm.newEmail, password: emailForm.password }) }); notify('Email updated'); onUserUpdate({ ...currentUser, email: emailForm.newEmail }); setEmailForm({ ...emailForm, password: '' }); } catch (e) { toast.error(e.message); } };
  const enableNotifs = () => { requestNotifPermission(); setTimeout(() => setNotifEnabled(Notification.permission === 'granted'), 500); };
  return (
    <div className="space-y-6 max-w-3xl">
      <div><h1 className="text-3xl font-bold">Settings</h1><p className="text-slate-500">Manage your account</p></div>
      <Card className="rounded-2xl border-0 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-orange-500" /> Profile</CardTitle></CardHeader><CardContent><div className="flex items-center gap-4"><Avatar className="w-16 h-16"><AvatarFallback className="bg-orange-500 text-white text-xl font-bold">{initials(currentUser.name)}</AvatarFallback></Avatar><div><div className="text-xl font-bold">{currentUser.name}</div><div className="text-sm text-slate-500">{currentUser.email}</div><Badge className={`${ROLE_META[currentUser.role]?.chip} border-0 mt-1`}>{ROLE_META[currentUser.role]?.label}</Badge></div></div></CardContent></Card>
      <Card className="rounded-2xl border-0 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-orange-500" /> Browser Notifications</CardTitle><CardDescription>Get instant notifications for new leads, submissions, payments</CardDescription></CardHeader><CardContent><Button onClick={enableNotifs} disabled={notifEnabled} className="bg-orange-500 hover:bg-orange-600 text-white">{notifEnabled ? '✓ Notifications Enabled' : 'Enable Notifications'}</Button></CardContent></Card>
      <Card className="rounded-2xl border-0 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5 text-orange-500" /> Change Email</CardTitle></CardHeader><CardContent className="space-y-3"><Field label="New Email"><Input type="email" value={emailForm.newEmail} onChange={e => setEmailForm({...emailForm, newEmail: e.target.value})} /></Field><Field label="Current Password"><Input type="password" value={emailForm.password} onChange={e => setEmailForm({...emailForm, password: e.target.value})} /></Field><Button onClick={changeEmail} className="bg-orange-500 hover:bg-orange-600 text-white">Update</Button></CardContent></Card>
      <Card className="rounded-2xl border-0 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-orange-500" /> Change Password</CardTitle></CardHeader><CardContent className="space-y-3"><Field label="Current Password"><Input type="password" value={pwForm.currentPassword} onChange={e => setPwForm({...pwForm, currentPassword: e.target.value})} /></Field><Field label="New Password"><Input type="password" value={pwForm.newPassword} onChange={e => setPwForm({...pwForm, newPassword: e.target.value})} /></Field><Field label="Confirm"><Input type="password" value={pwForm.confirm} onChange={e => setPwForm({...pwForm, confirm: e.target.value})} /></Field><Button onClick={changePw} className="bg-orange-500 hover:bg-orange-600 text-white">Update</Button></CardContent></Card>
    </div>
  );
}

// ---------------- APP ----------------
function App() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) api('/auth/me').then(r => { setUser(r.user); requestNotifPermission(); }).catch(() => localStorage.clear()).finally(() => setBooting(false));
    else setBooting(false);
    const c = typeof window !== 'undefined' ? localStorage.getItem('sidebar-collapsed') : null;
    if (c === '1') setCollapsed(true);
  }, []);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('sidebar-collapsed', collapsed ? '1' : '0'); }, [collapsed]);

  const logout = () => { localStorage.clear(); setUser(null); setActive('dashboard'); };
  if (booting) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>;
  if (!user) return <LoginScreen onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar user={user} active={active} setActive={setActive} onLogout={logout} open={sidebarOpen} setOpen={setSidebarOpen} collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="flex-1 min-w-0">
          <header className="lg:hidden sticky top-0 z-20 bg-white border-b px-4 py-3 flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
            <div className="font-bold">Zero to Skill</div>
            <div className="w-5" />
          </header>
          <div className="p-4 md:p-6 lg:p-8">
            {active === 'dashboard' && <Dashboard user={user} goTo={setActive} />}
            {active === 'admissions' && <Admissions currentUser={user} />}
            {active === 'students' && <Students currentUser={user} />}
            {active === 'fees' && <Fees currentUser={user} />}
            {active === 'faculty' && <Faculty />}
            {active === 'batches' && <Batches />}
            {active === 'courses' && <Courses currentUser={user} />}
            {active === 'lms' && <LMS currentUser={user} />}
            {active === 'assignments' && <Assignments currentUser={user} />}
            {active === 'users' && <UserManagement currentUser={user} />}
            {active === 'community' && <Community currentUser={user} />}
            {active === 'settings' && <SettingsPage currentUser={user} onUserUpdate={setUser} />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
