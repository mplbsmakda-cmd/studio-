
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ClipboardList, 
  MessageSquare, 
  LogOut,
  GraduationCap,
  Settings,
  ShieldCheck,
  Layers,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../App';

interface SidebarProps {
  role: 'admin' | 'teacher' | 'student';
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const { signOut, profile } = useAuth();
  const location = useLocation();

  const menuItems = {
    admin: [
      { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/admin/verification', icon: UserCheck, label: 'Verifikasi' },
      { path: '/admin/departments', icon: Layers, label: 'Kelola Jurusan' },
      { path: '/admin/classes', icon: BookOpen, label: 'Kelola Kelas' },
      { path: '/admin/users', icon: Users, label: 'Kelola Pengguna' },
      { path: '/admin/settings', icon: Settings, label: 'Pengaturan' },
    ],
    teacher: [
      { path: '/teacher', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/teacher/courses', icon: BookOpen, label: 'Materi Saya' },
      { path: '/teacher/exams', icon: ShieldCheck, label: 'Kelola Ujian' },
      { path: '/teacher/assignments', icon: ClipboardList, label: 'Tugas Siswa' },
      { path: '/teacher/ai-assistant', icon: MessageSquare, label: 'Asisten AI' },
    ],
    student: [
      { path: '/student', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/student/courses', icon: BookOpen, label: 'Pelajaran' },
      { path: '/student/exams', icon: ShieldCheck, label: 'Ujian Online' },
      { path: '/student/assignments', icon: ClipboardList, label: 'Tugas' },
      { path: '/student/ai-tutor', icon: MessageSquare, label: 'AI Tutor' },
    ]
  };

  const currentMenu = menuItems[role];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-xl">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <div className="overflow-hidden">
          <h1 className="font-black text-sm leading-tight uppercase tracking-tighter">LPPMRI 2</h1>
          <p className="text-[10px] text-slate-500 font-bold truncate">SMK KEDUNGREJA</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto mt-4">
        {currentMenu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
              location.pathname === item.path 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <item.icon size={20} className={location.pathname === item.path ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
            <span className="font-semibold text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="mb-6 flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-blue-400 uppercase">
            {profile?.name?.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">PROFIL</p>
            <p className="text-sm font-bold truncate">{profile?.name || 'User'}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-bold group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Keluar</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
