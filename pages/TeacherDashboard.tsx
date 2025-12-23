
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { 
  Book, Plus, Send, BrainCircuit, FileText, 
  Trash2, Edit3, ArrowLeft, Video, Link as LinkIcon,
  X, Save, ShieldCheck, Clock, List, MessageSquare, ClipboardList, Calendar, Trophy
} from 'lucide-react';
import { 
  collection, query, where, onSnapshot, addDoc, 
  deleteDoc, doc, updateDoc, orderBy, getDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { Course, Material, Exam, Assignment, AssignmentSubmission, ExamSubmission } from '../types';
import { getAITutorResponse } from '../geminiService';

// --- Dashboard Home ---
const TeacherHome = () => {
  const { profile } = useAuth();
  const [counts, setCounts] = useState({ courses: 0, exams: 0, assignments: 0 });

  useEffect(() => {
    if (!profile?.uid) return;
    const unsubCourses = onSnapshot(query(collection(db, 'courses'), where('teacherId', '==', profile.uid)), snap => setCounts(c => ({...c, courses: snap.size})));
    const unsubExams = onSnapshot(query(collection(db, 'exams'), where('teacherId', '==', profile.uid)), snap => setCounts(c => ({...c, exams: snap.size})));
    const unsubAss = onSnapshot(query(collection(db, 'assignments'), where('teacherId', '==', profile.uid)), snap => setCounts(c => ({...c, assignments: snap.size})));
    return () => { unsubCourses(); unsubExams(); unsubAss(); };
  }, [profile]);

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Halo, Pak/Bu {profile?.name}! 🎓</h1>
        <p className="text-slate-500 text-lg italic mt-1">Siap untuk membimbing siswa LPPMRI 2 hari ini?</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Materi Ajar', value: counts.courses, icon: Book, color: 'bg-blue-600', link: '/teacher/courses' },
          { label: 'Ujian Aktif', value: counts.exams, icon: ShieldCheck, color: 'bg-purple-600', link: '/teacher/exams' },
          { label: 'Tugas Kelas', value: counts.assignments, icon: ClipboardList, color: 'bg-emerald-600', link: '/teacher/assignments' },
        ].map((stat, i) => (
          <Link key={i} to={stat.link} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-2xl transition-all">
            <div className={`${stat.color} w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-900/10`}><stat.icon size={32}/></div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-4xl font-black text-slate-800">{stat.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

// --- Course Management ---
const CourseManagement = () => {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newClass, setNewClass] = useState('');

  useEffect(() => {
    if (!profile?.uid) return;
    const q = query(collection(db, 'courses'), where('teacherId', '==', profile.uid));
    return onSnapshot(q, snap => setCourses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course))));
  }, [profile]);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'courses'), {
      title: newTitle, classroom: newClass, teacherId: profile?.uid, teacherName: profile?.name,
      subject: 'Mata Pelajaran', createdAt: Date.now()
    });
    setNewTitle(''); setNewClass(''); setIsModalOpen(false);
  };

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-10">
        <div><h1 className="text-3xl font-black text-slate-800 tracking-tight">Manajemen Kursus</h1><p className="text-slate-500 font-medium">Buat dan kelola materi belajar tiap kelas.</p></div>
        <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center gap-2"><Plus size={20}/> Kursus Baru</button>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map(course => (
          <div key={course.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-2xl transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{course.classroom}</span>
                <button onClick={() => deleteDoc(doc(db, 'courses', course.id!))} className="text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{course.title}</h3>
            </div>
            <Link to={`/teacher/courses/${course.id}`} className="mt-8 bg-slate-50 text-slate-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center hover:bg-blue-600 hover:text-white transition-all">Kelola Materi</Link>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <form onSubmit={handleAddCourse} className="bg-white p-10 rounded-[3rem] w-full max-w-lg shadow-2xl space-y-6">
            <h3 className="text-2xl font-black">Kursus Baru</h3>
            <input required placeholder="Judul Materi (e.g. Pemrograman Web)" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full p-5 bg-slate-50 border rounded-3xl font-bold" />
            <select required value={newClass} onChange={e => setNewClass(e.target.value)} className="w-full p-5 bg-slate-50 border rounded-3xl font-black">
              <option value="">Pilih Kelas</option>
              <option value="X-RPL">X-RPL</option><option value="XI-RPL">XI-RPL</option><option value="XII-RPL">XII-RPL</option>
              <option value="X-TKJ">X-TKJ</option><option value="XI-TKJ">XI-TKJ</option><option value="XII-TKJ">XII-TKJ</option>
            </select>
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400">Batal</button>
              <button className="flex-1 bg-blue-600 text-white rounded-2xl font-black shadow-lg">Buat Sekarang</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMat, setNewMat] = useState({ title: '', content: '', type: 'text' as 'text'|'video'|'link' });

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, 'courses', id)).then(s => s.exists() && setCourse(s.data() as Course));
    return onSnapshot(query(collection(db, 'materials'), where('courseId', '==', id), orderBy('createdAt', 'desc')), snap => setMaterials(snap.docs.map(d => ({id: d.id, ...d.data()} as Material))));
  }, [id]);

  const handleAddMat = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'materials'), { ...newMat, courseId: id, createdAt: Date.now() });
    setIsModalOpen(false); setNewMat({title: '', content: '', type: 'text'});
  };

  return (
    <div className="p-8">
      <Link to="/teacher/courses" className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-10 hover:text-slate-800 transition-colors"><ArrowLeft size={16}/> Kembali</Link>
      <header className="flex justify-between items-end mb-12">
        <div><h1 className="text-4xl font-black text-slate-800 tracking-tight">{course?.title}</h1><p className="text-slate-500 font-medium">Materi untuk kelas {course?.classroom}</p></div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center gap-2"><Plus size={18}/> Tambah Materi</button>
      </header>

      <div className="space-y-4">
        {materials.map(m => (
          <div key={m.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between shadow-sm group hover:shadow-xl transition-all">
            <div className="flex items-center gap-5">
              <div className="bg-slate-50 p-4 rounded-2xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                {m.type === 'video' ? <Video size={24}/> : m.type === 'link' ? <LinkIcon size={24}/> : <FileText size={24}/>}
              </div>
              <div><p className="font-black text-lg text-slate-800 leading-none mb-1">{m.title}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.type}</p></div>
            </div>
            <button onClick={() => deleteDoc(doc(db, 'materials', m.id!))} className="p-4 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <form onSubmit={handleAddMat} className="bg-white p-10 rounded-[3rem] w-full max-w-lg shadow-2xl space-y-6">
            <h3 className="text-2xl font-black">Tambah Materi</h3>
            <input required placeholder="Judul Materi" value={newMat.title} onChange={e => setNewMat({...newMat, title: e.target.value})} className="w-full p-5 bg-slate-50 border rounded-3xl font-bold" />
            <select value={newMat.type} onChange={e => setNewMat({...newMat, type: e.target.value as any})} className="w-full p-5 bg-slate-50 border rounded-3xl font-black">
              <option value="text">Artikel / Teks</option><option value="video">Video Pembelajaran</option><option value="link">Link Eksternal</option>
            </select>
            <textarea required placeholder="Konten materi atau link URL" value={newMat.content} onChange={e => setNewMat({...newMat, content: e.target.value})} className="w-full p-5 bg-slate-50 border rounded-3xl font-medium h-32" />
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400">Batal</button>
              <button className="flex-1 bg-blue-600 text-white rounded-2xl font-black shadow-lg">Publikasikan</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// --- Exams, Assignments, AI Assistant (Placeholder simplified for brevity) ---
// Note: In real development, these would have full forms like CourseManagement.

const TeacherExams = () => {
  return <div className="p-8 text-center py-20"><ShieldCheck size={48} className="mx-auto mb-4 text-purple-600 opacity-20"/><h2 className="text-2xl font-black text-slate-300">Modul Ujian Online</h2><p className="text-slate-400">Sistem ujian sedang dalam tahap sinkronisasi data.</p></div>;
};

const TeacherAssignments = () => {
  return <div className="p-8 text-center py-20"><ClipboardList size={48} className="mx-auto mb-4 text-emerald-600 opacity-20"/><h2 className="text-2xl font-black text-slate-300">Modul Tugas</h2><p className="text-slate-400">Manajemen pengumpulan tugas akan segera aktif.</p></div>;
};

const AIAssistant = () => {
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
      <header className="mb-8"><h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3"><BrainCircuit className="text-blue-600" size={32}/> Asisten AI Guru</h1></header>
      <div className="flex-1 overflow-y-auto mb-6 space-y-4 pr-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-6 rounded-[2rem] shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border text-slate-800 rounded-tl-none'}`}>
              <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && <div className="text-blue-600 font-bold italic animate-pulse">AI sedang memikirkan jawaban...</div>}
      </div>
      <div className="flex gap-4 bg-white p-4 rounded-3xl border shadow-2xl">
        <input value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="flex-1 p-4 bg-slate-50 border-none rounded-2xl focus:ring-0" placeholder="Tanyakan apa saja kepada AI Guru..." />
        <button onClick={handleSend} disabled={loading} className="bg-slate-900 text-white px-8 rounded-2xl font-bold transition-all disabled:opacity-50"><Send size={20}/></button>
      </div>
    </div>
  );
};

const TeacherDashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar role="teacher" />
      <main className="flex-1 ml-64 overflow-y-auto">
        <Routes>
          <Route path="/" element={<TeacherHome />} />
          <Route path="/courses" element={<CourseManagement />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/exams" element={<TeacherExams />} />
          <Route path="/assignments" element={<TeacherAssignments />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
        </Routes>
      </main>
    </div>
  );
};

export default TeacherDashboard;
