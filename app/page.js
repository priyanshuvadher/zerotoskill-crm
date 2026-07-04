'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import {
  LayoutDashboard, Users, UserPlus, GraduationCap, IndianRupee, BookOpen,
  BarChart3, LogOut, Plus, Menu, X, Search, Sparkles, Trophy, Bell,
  TrendingUp, CircleDollarSign, Wallet, CheckCircle2, Clock, AlertCircle,
  Phone, Mail, Building2, Star, Filter, ChevronRight, PieChart
} from 'lucide-react';

const API = '/api';

const ROLE_META = {
  super_admin: { label: 'Super Admin', color: 'from-violet-500 to-fuchsia-500' },
  academic_manager: { label: 'Academic Manager', color: 'from-blue-500 to-cyan-500' },
  faculty: { label: 'Faculty / Mentor', color: 'from-emerald-500 to-teal-500' },
  counselor: { label: 'Admission Counselor', color: 'from-amber-500 to-orange-500' },
  student: { label: 'Student', color: 'from-pink-500 to-rose-500' },
};

const STAGES = [
  { key: 'inquiry', label: 'Inquiry', color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  { key: 'counseling', label: 'Counseling', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  { key: 'followup', label: 'Follow-up', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  { key: 'confirmed', label: 'Confirmed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  { key: 'fees_pending', label: 'Fees Pending', color: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  { key: 'onboarded', label: 'Onboarded', color: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
];

const api = async (path, opts = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

const formatINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

// ---------------- LOGIN ----------------
function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('admin@zerotoskill.com');
  const [password, setPassword] = useState('admin123');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const seed = useCallback(async () => {
    setSeeding(true);
    try {
      const r = await api('/seed');
      toast.success(r.seeded ? `Seeded ${r.users} users, ${r.leads} leads` : 'Demo data already exists');
    } catch (e) { toast.error(e.message); }
    setSeeding(false);
  }, []);

  useEffect(() => { seed(); }, [seed]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = mode === 'login' ? { email, password } : { name, email, password };
      const r = await api(path, { method: 'POST', body: JSON.stringify(body) });
      localStorage.setItem('token', r.token);
      localStorage.setItem('user', JSON.stringify(r.user));
      onLogin(r.user);
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  };

  const demoLogins = [
    { role: 'Super Admin', email: 'admin@zerotoskill.com', pw: 'admin123' },
    { role: 'Counselor', email: 'vikram@zerotoskill.com', pw: 'counselor123' },
    { role: 'Faculty', email: 'priya@zerotoskill.com', pw: 'faculty123' },
    { role: 'Academic Mgr', email: 'neha@zerotoskill.com', pw: 'manager123' },
    { role: 'Student', email: 'aarav@student.com', pw: 'student123' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm border">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-medium">Premium EdTech CRM</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
            Zero to Skill CRM
          </h1>
          <p className="text-xl text-slate-600">
            Complete Student Management, LMS, Admission CRM, Fees, Faculty & Community — one unified platform.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Admission CRM', 'Pipeline & Leads'],
              ['Fees Manager', 'Track & Collect'],
              ['Faculty', 'Mentor Assignment'],
              ['Analytics', 'Revenue Dashboards'],
            ].map(([t, s]) => (
              <div key={t} className="p-3 rounded-lg bg-white border shadow-sm">
                <div className="font-semibold text-sm">{t}</div>
                <div className="text-xs text-slate-500">{s}</div>
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-2xl border-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl">{mode === 'login' ? 'Welcome back' : 'Create account'}</CardTitle>
            <CardDescription>
              {mode === 'login' ? 'Sign in to your CRM workspace' : 'Register a new student account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label>Full name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
              )}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90">
                {loading ? 'Please wait...' : (mode === 'login' ? 'Sign in' : 'Create account')}
              </Button>
              <div className="text-center text-sm text-slate-600">
                {mode === 'login' ? (
                  <>New here? <button type="button" className="text-violet-600 font-medium" onClick={() => setMode('register')}>Register as student</button></>
                ) : (
                  <>Have an account? <button type="button" className="text-violet-600 font-medium" onClick={() => setMode('login')}>Sign in</button></>
                )}
              </div>
            </form>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Demo Accounts</div>
                <Button size="sm" variant="outline" onClick={seed} disabled={seeding}>
                  {seeding ? 'Seeding...' : 'Reseed'}
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {demoLogins.map((d) => (
                  <button
                    key={d.email}
                    type="button"
                    onClick={() => { setEmail(d.email); setPassword(d.pw); setMode('login'); }}
                    className="flex items-center justify-between text-left px-3 py-2 rounded-md hover:bg-slate-50 border text-sm"
                  >
                    <span className="font-medium">{d.role}</span>
                    <span className="text-slate-500 text-xs">{d.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------------- SIDEBAR ----------------
function Sidebar({ user, active, setActive, onLogout, open, setOpen }) {
  const roleItems = {
    super_admin: ['overview', 'admissions', 'students', 'fees', 'faculty', 'batches'],
    academic_manager: ['overview', 'students', 'batches', 'faculty'],
    faculty: ['overview', 'students', 'batches'],
    counselor: ['overview', 'admissions', 'fees'],
    student: ['overview', 'fees'],
  };
  const items = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'admissions', label: 'Admission CRM', icon: UserPlus },
    { key: 'students', label: 'Students', icon: GraduationCap },
    { key: 'fees', label: 'Fees & Finance', icon: IndianRupee },
    { key: 'faculty', label: 'Faculty / Mentors', icon: Users },
    { key: 'batches', label: 'Batches', icon: BookOpen },
  ].filter(i => roleItems[user.role]?.includes(i.key));

  return (
    <>
      {open && <div className="lg:hidden fixed inset-0 bg-black/40 z-30" onClick={() => setOpen(false)} />}
      <aside className={`fixed lg:sticky top-0 z-40 h-screen w-64 bg-white border-r border-slate-200 transition-transform ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold">Z</div>
            <div>
              <div className="font-bold text-sm leading-tight">Zero to Skill</div>
              <div className="text-xs text-slate-500">CRM Platform</div>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
        </div>

        <nav className="p-3 space-y-1">
          {items.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActive(key); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active === key ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t bg-white">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar>
              <AvatarFallback className={`bg-gradient-to-br ${ROLE_META[user.role]?.color || 'from-slate-400 to-slate-600'} text-white text-sm`}>
                {user.name?.split(' ').map(w => w[0]).slice(0, 2).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{user.name}</div>
              <div className="text-xs text-slate-500 truncate">{ROLE_META[user.role]?.label}</div>
            </div>
            <button onClick={onLogout} className="p-2 rounded-md hover:bg-slate-100">
              <LogOut className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ---------------- OVERVIEW ----------------
function Overview({ user }) {
  const [stats, setStats] = useState(null);
  useEffect(() => { api('/dashboard/stats').then(setStats).catch(() => {}); }, []);
  if (!stats) return <div className="p-8 text-slate-500">Loading...</div>;

  const cards = [
    { label: 'Total Students', value: stats.totalStudents, icon: GraduationCap, color: 'from-pink-500 to-rose-500' },
    { label: 'Total Leads', value: stats.totalLeads, icon: UserPlus, color: 'from-amber-500 to-orange-500' },
    { label: 'Active Batches', value: stats.totalBatches, icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
    { label: 'Faculty Members', value: stats.totalFaculty, icon: Users, color: 'from-emerald-500 to-teal-500' },
    { label: 'Total Revenue', value: formatINR(stats.totalRevenue), icon: CircleDollarSign, color: 'from-violet-500 to-fuchsia-500' },
    { label: 'Pending Revenue', value: formatINR(stats.pendingRevenue), icon: Wallet, color: 'from-red-500 to-pink-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-slate-500">Here's what's happening at Zero to Skill today.</p>
        </div>
        <Badge className={`bg-gradient-to-r ${ROLE_META[user.role]?.color} text-white border-0`}>
          {ROLE_META[user.role]?.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="overflow-hidden hover:shadow-lg transition">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-slate-500 font-medium">{c.label}</div>
                  <div className="text-2xl font-bold mt-1">{c.value}</div>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white`}>
                  <c.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-violet-600" /> Admission Pipeline</CardTitle>
            <CardDescription>Live status across the CRM</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {STAGES.map((s) => {
              const count = stats.pipelineCount[s.key] || 0;
              const pct = stats.totalLeads > 0 ? Math.round((count / stats.totalLeads) * 100) : 0;
              return (
                <div key={s.key}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <span className="font-medium">{s.label}</span>
                    </div>
                    <span className="text-slate-500">{count} leads · {pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PieChart className="w-5 h-5 text-violet-600" /> Conversion Metrics</CardTitle>
            <CardDescription>Lead to admission funnel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-6">
              <div className="text-6xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                {stats.conversionRate}%
              </div>
              <div className="text-slate-500 mt-2">Lead conversion rate</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="text-emerald-700 text-sm font-semibold">Collected</div>
                <div className="text-2xl font-bold text-emerald-900">{formatINR(stats.totalRevenue)}</div>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <div className="text-amber-700 text-sm font-semibold">Outstanding</div>
                <div className="text-2xl font-bold text-amber-900">{formatINR(stats.pendingRevenue)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------------- ADMISSIONS (KANBAN) ----------------
function Admissions() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try { const r = await api('/leads'); setLeads(r.leads); } catch (e) { toast.error(e.message); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const moveLead = async (id, status) => {
    setLeads(ls => ls.map(l => l.id === id ? { ...l, status } : l));
    try { await api('/leads/status', { method: 'PATCH', body: JSON.stringify({ id, status }) }); toast.success('Moved to ' + STAGES.find(s => s.key === status).label); }
    catch (e) { toast.error(e.message); load(); }
  };

  const filtered = leads.filter(l => !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.course?.toLowerCase().includes(search.toLowerCase()) || l.phone?.includes(search));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Admission CRM</h1>
          <p className="text-slate-500">Drag leads across the pipeline · {leads.length} total</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search leads..." className="pl-9 w-64" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <AddLeadDialog open={addOpen} setOpen={setAddOpen} onCreated={load} />
        </div>
      </div>

      {loading ? <div className="text-slate-500">Loading pipeline...</div> : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {STAGES.map((stage) => {
              const stageLeads = filtered.filter(l => l.status === stage.key);
              return (
                <div
                  key={stage.key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => { if (dragId) { moveLead(dragId, stage.key); setDragId(null); } }}
                  className="w-80 flex-shrink-0"
                >
                  <div className={`flex items-center justify-between px-3 py-2 rounded-t-lg border ${stage.color}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${stage.dot}`} />
                      <span className="font-semibold text-sm">{stage.label}</span>
                    </div>
                    <Badge variant="secondary" className="bg-white">{stageLeads.length}</Badge>
                  </div>
                  <div className="bg-slate-50 rounded-b-lg p-2 min-h-[400px] space-y-2 border border-t-0 border-slate-200">
                    {stageLeads.map((l) => (
                      <div
                        key={l.id}
                        draggable
                        onDragStart={() => setDragId(l.id)}
                        className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 hover:shadow-md hover:border-violet-300 cursor-grab active:cursor-grabbing transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm truncate">{l.name}</div>
                            <div className="text-xs text-slate-500 truncate">{l.course}</div>
                          </div>
                          <Badge variant="outline" className="text-[10px] px-1.5">{l.source}</Badge>
                        </div>
                        <div className="mt-2 space-y-1 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{l.phone}</div>
                          <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" /><span className="truncate">{l.email}</span></div>
                        </div>
                        <div className="mt-2 pt-2 border-t flex items-center justify-between">
                          <div className="text-[11px] text-slate-500">Followup: {l.followupDate}</div>
                          <Select value={l.status} onValueChange={(v) => moveLead(l.id, v)}>
                            <SelectTrigger className="h-7 w-24 text-[10px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {STAGES.map(s => <SelectItem key={s.key} value={s.key} className="text-xs">{s.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                    {stageLeads.length === 0 && <div className="text-center text-xs text-slate-400 py-6">Drop leads here</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AddLeadDialog({ open, setOpen, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', course: 'Digital Marketing', source: 'Website Form', notes: '', followupDate: '', education: '', parentName: '', parentPhone: '' });
  const change = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = async () => {
    if (!form.name || !form.phone) return toast.error('Name and phone required');
    try { await api('/leads', { method: 'POST', body: JSON.stringify(form) }); toast.success('Lead added'); setOpen(false); onCreated(); setForm({ ...form, name: '', email: '', phone: '', notes: '' }); }
    catch (e) { toast.error(e.message); }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600"><Plus className="w-4 h-4 mr-1" /> New Lead</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Capture New Lead</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Full Name *</Label><Input value={form.name} onChange={(e) => change('name', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Phone *</Label><Input value={form.phone} onChange={(e) => change('phone', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input value={form.email} onChange={(e) => change('email', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Education</Label><Input value={form.education} onChange={(e) => change('education', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Course Interest</Label>
            <Select value={form.course} onValueChange={(v) => change('course', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Digital Marketing', 'Graphic Design', 'Video Editing', 'AI Tools', 'Freelancing', 'Career Guidance'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Source</Label>
            <Select value={form.source} onValueChange={(v) => change('source', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Website Form', 'Instagram Ad', 'YouTube Ad', 'Google Ad', 'Referral', 'Walk-in', 'LinkedIn'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Parent Name</Label><Input value={form.parentName} onChange={(e) => change('parentName', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Parent Phone</Label><Input value={form.parentPhone} onChange={(e) => change('parentPhone', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Followup Date</Label><Input type="date" value={form.followupDate} onChange={(e) => change('followupDate', e.target.value)} /></div>
          <div className="col-span-2 space-y-1.5"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => change('notes', e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} className="bg-gradient-to-r from-violet-600 to-fuchsia-600">Save Lead</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------- STUDENTS ----------------
function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  useEffect(() => { api('/students').then(r => setStudents(r.students)); }, []);
  const filtered = students.filter(s => !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-3xl font-bold">Students</h1><p className="text-slate-500">{students.length} enrolled students</p></div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search students..." className="pl-9 w-64" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white text-xs">{s.name.split(' ').map(w => w[0]).slice(0,2).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-slate-500">{s.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{s.course || '—'}</Badge></TableCell>
                  <TableCell>{s.batchName || '—'}</TableCell>
                  <TableCell>{s.mentorName || '—'}</TableCell>
                  <TableCell><span className="text-sm text-slate-600">{s.phone}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------- FEES ----------------
function Fees() {
  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState(null);
  const [payOpen, setPayOpen] = useState(null);
  const [amount, setAmount] = useState('');

  const load = async () => {
    const [f, s] = await Promise.all([api('/fees'), api('/fees/stats')]);
    setFees(f.fees); setStats(s);
  };
  useEffect(() => { load(); }, []);

  const pay = async () => {
    try {
      await api('/fees/pay', { method: 'POST', body: JSON.stringify({ feeId: payOpen.id, amount: Number(amount) }) });
      toast.success('Payment recorded · Receipt generated');
      setPayOpen(null); setAmount(''); load();
    } catch (e) { toast.error(e.message); }
  };

  if (!stats) return <div className="text-slate-500">Loading...</div>;

  const cards = [
    { label: 'Total Collected', value: formatINR(stats.totalRevenue), icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' },
    { label: 'Total Pending', value: formatINR(stats.pendingRevenue), icon: AlertCircle, color: 'from-red-500 to-pink-500' },
    { label: 'Fully Paid', value: stats.fullyPaid, icon: CheckCircle2, color: 'from-blue-500 to-cyan-500' },
    { label: 'Partial / Pending', value: `${stats.partial} / ${stats.pending}`, icon: Clock, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Fees & Finance</h1><p className="text-slate-500">Manage collections, EMIs and payments</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <Card key={c.label}><CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div><div className="text-sm text-slate-500 font-medium">{c.label}</div><div className="text-2xl font-bold mt-1">{c.value}</div></div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white`}><c.icon className="w-5 h-5" /></div>
            </div>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {Object.entries(stats.byCourse).map(([course, d]) => (
          <Card key={course}>
            <CardHeader className="pb-2"><CardTitle className="text-base">{course}</CardTitle><CardDescription>{d.count} students</CardDescription></CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm mb-2"><span className="text-emerald-600 font-medium">Collected</span><span>{formatINR(d.collected)}</span></div>
              <div className="flex justify-between text-sm mb-3"><span className="text-amber-600 font-medium">Pending</span><span>{formatINR(d.pending)}</span></div>
              <Progress value={d.collected + d.pending > 0 ? (d.collected / (d.collected + d.pending)) * 100 : 0} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Student Fee Records</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Student</TableHead><TableHead>Course</TableHead><TableHead>Plan</TableHead>
              <TableHead>Total</TableHead><TableHead>Paid</TableHead><TableHead>Pending</TableHead>
              <TableHead>Status</TableHead><TableHead></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {fees.map(f => (
                <TableRow key={f.id}>
                  <TableCell><div className="font-medium">{f.studentName}</div><div className="text-xs text-slate-500">{f.studentEmail}</div></TableCell>
                  <TableCell><Badge variant="secondary">{f.course}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{f.planType === 'emi' ? 'EMI' : 'One-time'}</Badge></TableCell>
                  <TableCell>{formatINR(f.totalAmount)}</TableCell>
                  <TableCell className="text-emerald-600 font-medium">{formatINR(f.paidAmount)}</TableCell>
                  <TableCell className="text-amber-600 font-medium">{formatINR(f.pendingAmount)}</TableCell>
                  <TableCell>
                    <Badge className={
                      f.status === 'paid' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' :
                      f.status === 'partial' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' :
                      'bg-red-100 text-red-800 hover:bg-red-100'
                    }>{f.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {f.status !== 'paid' && (
                      <Button size="sm" onClick={() => { setPayOpen(f); setAmount(String(f.pendingAmount)); }} className="bg-gradient-to-r from-violet-600 to-fuchsia-600">
                        Collect
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!payOpen} onOpenChange={(o) => !o && setPayOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Collect Payment</DialogTitle></DialogHeader>
          {payOpen && (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-slate-50">
                <div className="font-semibold">{payOpen.studentName}</div>
                <div className="text-sm text-slate-500">{payOpen.course} · {payOpen.batchName}</div>
                <div className="flex justify-between mt-3 text-sm">
                  <span>Total: <b>{formatINR(payOpen.totalAmount)}</b></span>
                  <span>Paid: <b className="text-emerald-600">{formatINR(payOpen.paidAmount)}</b></span>
                  <span>Pending: <b className="text-amber-600">{formatINR(payOpen.pendingAmount)}</b></span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Amount to collect (₹)</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              {payOpen.installments && (
                <div className="space-y-1.5">
                  <Label className="text-xs">EMI Schedule</Label>
                  {payOpen.installments.map((i, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs px-3 py-2 rounded bg-slate-50">
                      <span>Installment {idx+1} · Due {i.dueDate}</span>
                      <span className="flex items-center gap-2">{formatINR(i.amount)} {i.paid ? <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Paid</Badge> : <Badge variant="outline">Due</Badge>}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(null)}>Cancel</Button>
            <Button onClick={pay} className="bg-gradient-to-r from-violet-600 to-fuchsia-600">Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------- FACULTY ----------------
function Faculty() {
  const [faculty, setFaculty] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', specialization: 'Digital Marketing', password: 'faculty123' });
  const load = () => api('/faculty').then(r => setFaculty(r.faculty));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.name || !form.email) return toast.error('Name and email required');
    try { await api('/faculty', { method: 'POST', body: JSON.stringify(form) }); toast.success('Faculty added'); setAddOpen(false); load(); }
    catch (e) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-3xl font-bold">Faculty / Mentors</h1><p className="text-slate-500">{faculty.length} mentors on the platform</p></div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600"><Plus className="w-4 h-4 mr-1" /> Add Faculty</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Faculty / Mentor</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Full Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="space-y-1.5"><Label>Email</Label><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <div className="space-y-1.5"><Label>Specialization</Label>
                <Select value={form.specialization} onValueChange={v => setForm({...form, specialization: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['Digital Marketing', 'Graphic Design', 'Video Editing', 'AI Tools', 'Freelancing'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Password (default: faculty123)</Label><Input value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={submit} className="bg-gradient-to-r from-violet-600 to-fuchsia-600">Add Faculty</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {faculty.map(f => (
          <Card key={f.id} className="hover:shadow-lg transition">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-lg">{f.name.split(' ').map(w => w[0]).slice(0,2).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{f.name}</div>
                  <div className="text-xs text-slate-500 truncate">{f.email}</div>
                  <Badge className="mt-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">{f.specialization || 'Mentor'}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-500"><Star className="w-3 h-3 fill-amber-400" /><span className="text-sm font-bold">{f.rating?.toFixed(1) || '5.0'}</span></div>
                  <div className="text-[10px] text-slate-500 uppercase">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold">{f.studentsCount || 0}</div>
                  <div className="text-[10px] text-slate-500 uppercase">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold">{f.batchesCount || 0}</div>
                  <div className="text-[10px] text-slate-500 uppercase">Batches</div>
                </div>
              </div>
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
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', course: 'Digital Marketing', startDate: '', endDate: '', capacity: 30, facultyId: '' });

  const load = async () => {
    const [b, f] = await Promise.all([api('/batches'), api('/faculty')]);
    setBatches(b.batches); setFaculty(f.faculty);
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.name || !form.facultyId) return toast.error('Name and faculty required');
    const facultyMember = faculty.find(f => f.id === form.facultyId);
    try {
      await api('/batches', { method: 'POST', body: JSON.stringify({ ...form, facultyName: facultyMember?.name }) });
      toast.success('Batch created'); setAddOpen(false); load();
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-3xl font-bold">Batches</h1><p className="text-slate-500">{batches.length} active batches</p></div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600"><Plus className="w-4 h-4 mr-1" /> New Batch</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Batch</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Batch Name</Label><Input placeholder="e.g. DM-Aug-2025" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="space-y-1.5"><Label>Course</Label>
                <Select value={form.course} onValueChange={v => setForm({...form, course: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['Digital Marketing', 'Graphic Design', 'Video Editing', 'AI Tools', 'Freelancing'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} /></div>
                <div className="space-y-1.5"><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} /></div>
              </div>
              <div className="space-y-1.5"><Label>Faculty / Mentor</Label>
                <Select value={form.facultyId} onValueChange={v => setForm({...form, facultyId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select faculty" /></SelectTrigger>
                  <SelectContent>{faculty.map(f => <SelectItem key={f.id} value={f.id}>{f.name} · {f.specialization}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: Number(e.target.value)})} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={submit} className="bg-gradient-to-r from-violet-600 to-fuchsia-600">Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {batches.map(b => (
          <Card key={b.id} className="overflow-hidden hover:shadow-lg transition">
            <div className="h-2 bg-gradient-to-r from-violet-600 to-fuchsia-600" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-lg">{b.name}</div>
                  <Badge variant="secondary" className="mt-1">{b.course}</Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-violet-600">{b.studentsCount || 0}</div>
                  <div className="text-[10px] text-slate-500 uppercase">Students</div>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600"><Users className="w-4 h-4" /> {b.facultyName}</div>
                <div className="flex items-center gap-2 text-slate-600"><Building2 className="w-4 h-4" /> Capacity: {b.capacity}</div>
                <div className="flex items-center gap-2 text-slate-600"><Clock className="w-4 h-4" /> {b.startDate} → {b.endDate}</div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1"><span>Enrollment</span><span>{b.studentsCount || 0}/{b.capacity}</span></div>
                <Progress value={((b.studentsCount || 0) / (b.capacity || 1)) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ---------------- APP ----------------
function App() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t && u) {
      api('/auth/me').then(r => setUser(r.user)).catch(() => { localStorage.clear(); }).finally(() => setBooting(false));
    } else { setBooting(false); }
  }, []);

  const logout = () => { localStorage.clear(); setUser(null); setActive('overview'); };

  if (booting) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>;
  if (!user) return <LoginScreen onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar user={user} active={active} setActive={setActive} onLogout={logout} open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 min-w-0">
          <header className="lg:hidden sticky top-0 z-20 bg-white border-b px-4 py-3 flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
            <div className="font-bold">Zero to Skill CRM</div>
            <div className="w-5" />
          </header>
          <div className="p-4 md:p-6 lg:p-8">
            {active === 'overview' && <Overview user={user} />}
            {active === 'admissions' && <Admissions />}
            {active === 'students' && <Students />}
            {active === 'fees' && <Fees />}
            {active === 'faculty' && <Faculty />}
            {active === 'batches' && <Batches />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
