
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useParams, useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { 
  BookOpen, Calendar, Clock, ChevronRight, MessageSquare, Send, 
  ArrowLeft, FileText, Video, Link as LinkIcon, ShieldCheck, CheckCircle, 
  BrainCircuit, Star, BarChart3, Target, Zap, ClipboardList, X
} from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, doc, addDoc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getAITutorResponse } from '../geminiService';
import { useAuth } from '../App';
import { Course, Material, Exam, ExamSubmission, Assignment } from '../types';

// --- Student Home ---
const StudentHome = () => {
  const { profile } = useAuth();
  return (
    <div className="p-8 animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Halo, {profile?.name}! 👋</h1>
        <p className="text-slate-500 text-lg italic mt-1">"Pendidikan adalah senjata paling mematikan di dunia."</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-[2rem] border shadow-sm"><p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Rata-Rata Nilai</p><p className="text-3xl font-black text-slate-800">85</p></div>
        <div className="bg-white p-6 rounded-[2rem] border shadow-sm"><p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Ujian Selesai</p><p className="text-3xl font-black text-slate-800">12</p></div>
        <div className="bg-white p-6 rounded-[2rem] border shadow-sm"><p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Peringkat Kelas</p><p className="text-3xl font-black text-emerald-600">3</p></div>
        <div className="bg-white p-6 rounded-[2rem] border shadow-sm"><p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Poin Keaktifan</p><p className="text-3xl font-black text-amber-500">250</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Portal Materi', icon: BookOpen, color: 'bg-blue-600', link: '/student/courses' },
          { label: 'Ujian Online', icon: ShieldCheck, color: 'bg-red-500', link: '/student/exams' },
          { label: 'Tugas Mandiri', icon: ClipboardList, color: 'bg-emerald-600', link: '/student/assignments' },
        ].map((item, i) => (
          <Link key={i} to={item.link} className="bg-white p-8 rounded-[3rem] border shadow-sm group hover:shadow-2xl transition-all flex flex-col items-center text-center">
            <div className={`${item.color} w-20 h-20 rounded-[2rem] flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-xl shadow-blue-900/10`}><item.icon size={40}/></div>
            <h3 className="text-xl font-black text-slate-800 mb-2">{item.label}</h3>
            <p className="text-sm text-slate-400 font-medium leading-relaxed">Akses modul pembelajaran dan {item.label.toLowerCase()} terbaru.</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

// --- Course Explorer ---
const CourseList = () => {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!profile?.classroom) return;
    const q = query(collection(db, 'courses'), where('classroom', '==', profile.classroom));
    return onSnapshot(q, snap => setCourses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course))));
  }, [profile]);

  return (
    <div className="p-8">
      <header className="mb-10"><h1 className="text-3xl font-black text-slate-800 tracking-tight">Ruang Belajar</h1><p className="text-slate-500 font-medium">Materi untuk kelas {profile?.classroom}</p></header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map(course => (
          <Link key={course.id} to={`/student/courses/${course.id}`} className="bg-white p-8 rounded-[2.5rem] border shadow-sm hover:shadow-2xl transition-all group">
            <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black">{course.teacherName.charAt(0)}</div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Guru Pengampu</p><p className="text-sm font-bold text-slate-700">{course.teacherName}</p></div></div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{course.title}</h3>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{course.subject}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

const CourseViewer = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, 'courses', id)).then(s => s.exists() && setCourse(s.data() as Course));
    return onSnapshot(query(collection(db, 'materials'), where('courseId', '==', id), orderBy('createdAt', 'desc')), snap => setMaterials(snap.docs.map(d => ({id: d.id, ...d.data()} as Material))));
  }, [id]);

  return (
    <div className="p-8">
      <Link to="/student/courses" className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-10"><ArrowLeft size={16}/> Kembali</Link>
      <header className="mb-12"><h1 className="text-4xl font-black text-slate-800 tracking-tight">{course?.title}</h1><p className="text-slate-500 font-medium">Modul Pembelajaran Mandiri</p></header>
      <div className="grid gap-4 max-w-4xl">
        {materials.map(m => (
          <div key={m.id} className="bg-white p-6 rounded-[2rem] border shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
            <div className="flex items-center gap-6">
              <div className="bg-slate-50 p-4 rounded-2xl text-slate-400 group-hover:text-blue-600 transition-colors">{m.type === 'video' ? <Video size={28}/> : m.type === 'link' ? <LinkIcon size={28}/> : <FileText size={28}/>}</div>
              <div><p className="font-black text-xl text-slate-800 block mb-1">{m.title}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.type}</p></div>
            </div>
            <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg hover:scale-105 transition-transform">Buka</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- AI Tutor ---
const AITutor = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    const userMsg = prompt;
    setPrompt('');
    setMessages(prev => [...prev, {role: 'user', text: userMsg}]);
    setLoading(true);
    const aiResp = await getAITutorResponse(userMsg);
    setMessages(prev => [...prev, {role: 'ai', text: aiResp || ''}]);
    setLoading(false);
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <header className="mb-8"><h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3"><BrainCircuit className="text-emerald-500" size={32}/> AI Tutor Bimbingan</h1><p className="text-slate-500 font-medium">Tanyakan materi yang sulit, asisten AI siap membantu 24 jam.</p></header>
      <div className="flex-1 overflow-y-auto mb-6 space-y-4 pr-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-6 rounded-[2rem] shadow-sm ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white border text-slate-800 rounded-tl-none'}`}><p className="whitespace-pre-wrap leading-relaxed">{m.text}</p></div>
          </div>
        ))}
        {loading && <div className="text-emerald-600 font-black italic animate-pulse">Tutor sedang mengetik penjelasan...</div>}
      </div>
      <div className="flex gap-4 bg-white p-4 rounded-3xl border shadow-2xl">
        <input value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="flex-1 p-4 bg-slate-50 border-none rounded-2xl focus:ring-0 font-bold" placeholder="Tanyakan bantuan atau penjelasan materi..." />
        <button onClick={handleSend} disabled={loading} className="bg-slate-900 text-white px-8 rounded-2xl font-bold transition-all"><Send size={20}/></button>
      </div>
    </div>
  );
};

// --- Exam Hub ---
const StudentExams = () => {
  return <div className="p-8 text-center py-20"><ShieldCheck size={48} className="mx-auto mb-4 text-red-500 opacity-20"/><h2 className="text-2xl font-black text-slate-300">Modul Ujian Online</h2><p className="text-slate-400">Jadwal ujian untuk kelas Anda akan segera muncul di sini.</p></div>;
};

const StudentAssignments = () => {
  return <div className="p-8 text-center py-20"><ClipboardList size={48} className="mx-auto mb-4 text-emerald-600 opacity-20"/><h2 className="text-2xl font-black text-slate-300">Modul Tugas</h2><p className="text-slate-400">Belum ada tugas baru yang perlu dikumpulkan.</p></div>;
};

const StudentDashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar role="student" />
      <main className="flex-1 ml-64 overflow-y-auto">
        <Routes>
          <Route path="/" element={<StudentHome />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/courses/:id" element={<CourseViewer />} />
          <Route path="/exams" element={<StudentExams />} />
          <Route path="/assignments" element={<StudentAssignments />} />
          <Route path="/ai-tutor" element={<AITutor />} />
        </Routes>
      </main>
    </div>
  );
};

export default StudentDashboard;
