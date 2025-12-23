
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { 
  Users, BookOpen, GraduationCap, TrendingUp, Search, 
  Trash2, Shield, Check, X, Plus, Hash, 
  ChevronRight, Activity, Layers, UserCheck, 
  User as UserIcon, CheckCircle, Save, Filter, ShieldCheck, Mail, Loader2,
  Calendar, Phone, Info, Eye, ArrowRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  collection, onSnapshot, query, orderBy, doc, deleteDoc, 
  updateDoc, where, setDoc, addDoc 
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebase';
import { UserProfile, UserRole } from '../types';

// --- Dashboard Home Component ---
const AdminHome = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    teachers: 0,
    admins: 0,
    classes: 0,
    departments: 0,
    pending: 0
  });

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const users = snap.docs.map(d => d.data() as UserProfile);
      setStats(prev => ({
        ...prev,
        totalUsers: users.length,
        students: users.filter(u => u.role === 'student').length,
        teachers: users.filter(u => u.role === 'teacher').length,
        admins: users.filter(u => u.role === 'admin').length,
        pending: users.filter(u => !u.isApproved && u.role !== 'admin').length
      }));
    });
    const unsubClasses = onSnapshot(collection(db, 'classrooms'), (snap) => setStats(prev => ({ ...prev, classes: snap.size })));
    const unsubDeps = onSnapshot(collection(db, 'departments'), (snap) => setStats(prev => ({ ...prev, departments: snap.size })));
    return () => { unsubUsers(); unsubClasses(); unsubDeps(); };
  }, []);

  const chartData = [
    { name: 'Siswa', count: stats.students, color: '#3b82f6' },
    { name: 'Guru', count: stats.teachers, color: '#10b981' },
    { name: 'Admin', count: stats.admins, color: '#8b5cf6' },
  ];

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard Admin</h1>
          <p className="text-slate-500 font-medium italic">Portal Kendali SMK LPPMRI 2 KEDUNGREJA</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center animate-pulse"><Activity size={20} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status Server</p>
            <p className="text-sm font-bold text-slate-800">Aktif & Stabil</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total User', value: stats.totalUsers, icon: Users, color: 'bg-blue-600' },
          { label: 'Menunggu', value: stats.pending, icon: UserCheck, color: 'bg-amber-500' },
          { label: 'Siswa Aktif', value: stats.students, icon: GraduationCap, color: 'bg-emerald-600' },
          { label: 'Kelas Rombel', value: stats.classes, icon: Hash, color: 'bg-purple-600' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 hover:scale-105 transition-transform">
            <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg shadow-blue-900/10`}><stat.icon size={24} /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 leading-none">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800 leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2"><TrendingUp className="text-blue-600" size={20}/> Statistik Pengguna</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" radius={[12, 12, 0, 0]} barSize={50}>
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-white">
          <h3 className="text-xl font-black mb-8 flex items-center gap-3"><Shield className="text-blue-400" size={24}/> Quick Links</h3>
          <div className="space-y-4">
            {[
              { to: '/admin/verification', icon: UserCheck, label: 'Verifikasi User', color: 'text-amber-400' },
              { to: '/admin/users', icon: Users, label: 'Database Guru/Siswa', color: 'text-blue-400' },
              { to: '/admin/classes', icon: BookOpen, label: 'Atur Rombel', color: 'text-emerald-400' },
              { to: '/admin/departments', icon: Layers, label: 'Kelola Jurusan', color: 'text-purple-400' },
            ].map((link, i) => (
              <Link key={i} to={link.to} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group">
                <div className="flex items-center gap-4">
                  <link.icon size={20} className={link.color}/>
                  <span className="font-bold text-sm tracking-tight">{link.label}</span>
                </div>
                <ChevronRight size={16} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- User Management ---
const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => setUsers(snap.docs.map(doc => doc.data() as UserProfile)));
  }, []);

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Data Pengguna</h1>
          <p className="text-slate-500 font-medium">Manajemen seluruh akun di dalam platform.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
            <input placeholder="Cari Nama/Email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-12 pr-6 py-4 bg-white border rounded-3xl w-72 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold" />
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="bg-slate-900 text-white px-8 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl">Tambah Akun</button>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <tr>
              <th className="px-8 py-6">Nama & Email</th>
              <th className="px-8 py-6">Peran</th>
              <th className="px-8 py-6">Grup / Kelas</th>
              <th className="px-8 py-6">Status</th>
              <th className="px-8 py-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map(user => (
              <tr key={user.uid} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5">
                  <p className="font-black text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-400 font-bold">{user.email}</p>
                </td>
                <td className="px-8 py-5">
                   <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : user.role === 'teacher' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {user.role}
                   </span>
                </td>
                <td className="px-8 py-5 text-sm font-bold text-slate-600 uppercase">{user.classroom || '-'}</td>
                <td className="px-8 py-5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${user.isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    {user.isApproved ? <Check size={12}/> : <X size={12}/>}
                    {user.isApproved ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button onClick={() => deleteDoc(doc(db, 'users', user.uid))} className="p-3 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddUserModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};

// --- Department Management ---
const DepartmentManagement = () => {
  const [departments, setDepartments] = useState<{id: string, name: string, code: string}[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    return onSnapshot(query(collection(db, 'departments'), orderBy('code', 'asc')), (snap) => {
      setDepartments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    await addDoc(collection(db, 'departments'), { name, code: code.toUpperCase(), createdAt: Date.now() });
    setName(''); setCode('');
  };

  return (
    <div className="p-8">
      <header className="mb-10"><h1 className="text-4xl font-black text-slate-800 tracking-tight">Kelola Jurusan</h1></header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <form onSubmit={handleAdd} className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
          <h3 className="text-xl font-bold">Jurusan Baru</h3>
          {/* Fix: changed target.value to e.target.value */}
          <input required placeholder="Nama Jurusan" value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" />
          <input required placeholder="Kode (e.g. RPL)" value={code} onChange={e => setCode(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" />
          <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl">Simpan Jurusan</button>
        </form>
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map(dept => (
            <div key={dept.id} className="bg-white p-6 rounded-3xl border flex items-center justify-between group hover:border-blue-500 transition-all">
              <div>
                <p className="font-black text-lg text-slate-800 leading-none mb-1">{dept.name}</p>
                <p className="text-xs font-black text-blue-600 uppercase tracking-widest">{dept.code}</p>
              </div>
              <button onClick={() => deleteDoc(doc(db, 'departments', dept.id))} className="p-3 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Classroom Management ---
const ClassroomManagement = () => {
  const [classrooms, setClassrooms] = useState<{id: string, name: string}[]>([]);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    return onSnapshot(query(collection(db, 'classrooms'), orderBy('name', 'asc')), (snap) => {
      setClassrooms(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    await addDoc(collection(db, 'classrooms'), { name: newName.toUpperCase(), createdAt: Date.now() });
    setNewName('');
  };

  return (
    <div className="p-8">
      <header className="mb-10"><h1 className="text-4xl font-black text-slate-800 tracking-tight">Rombongan Belajar</h1></header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <form onSubmit={handleAdd} className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
          <h3 className="text-xl font-bold">Kelas Baru</h3>
          <input required placeholder="e.g. XII RPL 1" value={newName} onChange={e => setNewName(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold uppercase" />
          <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl">Bentuk Kelas</button>
        </form>
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          {classrooms.map(cls => (
            <div key={cls.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center group hover:bg-slate-900 transition-all">
              <span className="font-black text-xl text-slate-800 group-hover:text-white mb-2">{cls.name}</span>
              <button onClick={() => deleteDoc(doc(db, 'classrooms', cls.id))} className="text-slate-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Detailed Verification Component ---
const UserVerification = () => {
  const [pending, setPending] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('isApproved', '==', false));
    return onSnapshot(q, (snap) => setPending(snap.docs.map(doc => doc.data() as UserProfile)));
  }, []);

  const handleApprove = async (uid: string) => {
    await updateDoc(doc(db, 'users', uid), { isApproved: true });
    setSelectedUser(null);
  };

  const handleReject = async (uid: string) => {
    if (window.confirm('Yakin ingin menolak pendaftaran ini? Data akun akan dihapus.')) {
      await deleteDoc(doc(db, 'users', uid));
      setSelectedUser(null);
    }
  };

  return (
    <div className="p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Persetujuan Akun</h1>
        <p className="text-slate-500 font-medium">Lakukan verifikasi identitas (NISN/NIS/NIP) sebelum memberikan akses.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pending.map(user => (
          <div key={user.uid} className="bg-white p-8 rounded-[2.5rem] border shadow-sm flex flex-col animate-in zoom-in-95 group hover:shadow-xl transition-all border-slate-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner">{user.name.charAt(0)}</div>
              <div>
                <p className="font-black text-slate-800 leading-none mb-1.5 text-lg">{user.name}</p>
                <p className="text-xs text-slate-400 font-bold">{user.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kelas</p>
                <p className="text-sm font-black text-slate-800">{user.classroom || 'STAF'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">NISN/ID</p>
                <p className="text-sm font-black text-slate-800 truncate">{user.nisn || user.nip || '-'}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setSelectedUser(user)}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-black transition-all"
              >
                <Eye size={16} /> Review Detail Data
              </button>
              <div className="flex gap-3">
                <button onClick={() => handleReject(user.uid)} className="flex-1 py-4 bg-red-50 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all">Tolak</button>
                <button onClick={() => handleApprove(user.uid)} className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all">Quick Approve</button>
              </div>
            </div>
          </div>
        ))}
        {pending.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <CheckCircle size={64} className="mx-auto mb-6 text-emerald-500 opacity-20" />
            <h3 className="text-2xl font-black text-slate-300">Belum ada pendaftar baru</h3>
            <p className="text-slate-400 font-medium">Semua pengajuan telah diproses.</p>
          </div>
        )}
      </div>

      {/* Deep Review Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-8 duration-300">
            {/* Modal Header */}
            <div className="p-10 bg-slate-900 text-white relative">
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center font-black text-3xl shadow-2xl shadow-blue-500/30">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3 inline-block">Review Registrasi</span>
                    <h3 className="text-3xl font-black tracking-tight">{selectedUser.name}</h3>
                    <p className="text-blue-400 font-bold flex items-center gap-1.5 mt-1"><Mail size={14}/> {selectedUser.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"><X size={24} /></button>
              </div>
              {/* Decorative circle */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                  <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4"><Hash size={14} className="text-blue-600"/> Identitas Akademik</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">NISN (Data Pusat)</p>
                      <p className="text-lg font-black text-slate-800">{selectedUser.nisn || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">NIS (Data Sekolah)</p>
                      <p className="text-lg font-black text-slate-800">{selectedUser.nis || '-'}</p>
                    </div>
                    {selectedUser.nip && (
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">NIP / KODE GURU</p>
                        <p className="text-lg font-black text-slate-800">{selectedUser.nip}</p>
                      </div>
                    )}
                  </div>
                </section>

                <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                  <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4"><Calendar size={14} className="text-blue-600"/> Data Pribadi</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Tanggal Lahir</p>
                      <p className="text-lg font-black text-slate-800">{selectedUser.birthDate || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Jenis Kelamin</p>
                      <p className="text-lg font-black text-slate-800">{selectedUser.gender === 'L' ? 'Laki-Laki' : selectedUser.gender === 'P' ? 'Perempuan' : '-'}</p>
                    </div>
                  </div>
                </section>

                <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 col-span-full">
                  <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4"><Phone size={14} className="text-blue-600"/> Informasi Kontak</h4>
                  <div className="flex flex-wrap gap-8">
                    <div>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Nomor HP / WhatsApp</p>
                      <a href={`https://wa.me/${selectedUser.phone}`} target="_blank" className="text-lg font-black text-emerald-600 hover:underline flex items-center gap-2">
                        {selectedUser.phone || '-'}
                        <ArrowRight size={16} />
                      </a>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Terdaftar Pada</p>
                      <p className="text-lg font-black text-slate-800">{new Date(selectedUser.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 bg-white border-t border-slate-100 flex gap-4">
              <button 
                onClick={() => handleReject(selectedUser.uid)}
                className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
              >
                Tolak Pendaftaran
              </button>
              <button 
                onClick={() => handleApprove(selectedUser.uid)}
                className="flex-[2] py-5 bg-emerald-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-500/30 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
              >
                <Check size={20} /> Verifikasi & Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AddUserModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' as UserRole });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isApproved: true,
        createdAt: Date.now()
      });
      alert("Akun berhasil dibuat.");
      onClose();
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl p-10">
        <h3 className="text-2xl font-black mb-8">Buat Akun Baru</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input required placeholder="Nama Lengkap" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" />
          <input required type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" />
          <input required type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" />
          <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="w-full p-4 bg-slate-50 border rounded-2xl font-black">
            <option value="student">Siswa</option>
            <option value="teacher">Guru</option>
            <option value="admin">Administrator</option>
          </select>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-bold text-slate-400">Batal</button>
            <button disabled={loading} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl">{loading ? 'Proses...' : 'Daftarkan'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar role="admin" />
      <main className="flex-1 ml-64 overflow-y-auto">
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/verification" element={<UserVerification />} />
          <Route path="/departments" element={<DepartmentManagement />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/classes" element={<ClassroomManagement />} />
          <Route path="/settings" element={<AdminHome />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
