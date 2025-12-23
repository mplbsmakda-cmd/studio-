
import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  HashRouter as Router, 
  Routes, 
  Route, 
  Navigate
} from 'react-router-dom';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, UserRole } from './types';
import { LogOut, Clock, UserX, Loader2, ShieldAlert } from 'lucide-react';

// Pages
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import NotFound from './pages/NotFound';

// Context
interface AuthContextType {
  userUid: string | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  userUid: null,
  profile: null,
  loading: true,
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

const App: React.FC = () => {
  const [userUid, setUserUid] = useState<string | null>(localStorage.getItem('biometric_auth_session'));
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile = () => {};

    if (userUid) {
      unsubscribeProfile = onSnapshot(doc(db, 'users', userUid), (docSnap) => {
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          setProfile(null);
          setUserUid(null);
          localStorage.removeItem('biometric_auth_session');
        }
        setLoading(false);
      }, (error) => {
        console.error("Firestore Error:", error);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    return () => unsubscribeProfile();
  }, [userUid]);

  const signOut = () => {
    setLoading(true);
    localStorage.removeItem('biometric_auth_session');
    setUserUid(null);
    setProfile(null);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h1 className="text-white font-black text-xl tracking-[0.3em] uppercase animate-pulse">LPPMRI BIOMETRIC</h1>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ userUid, profile, loading, signOut }}>
      <Router>
        <Routes>
          <Route path="/login" element={userUid ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/signup" element={userUid ? <Navigate to="/" /> : <SignUpPage />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardSwitcher />
            </ProtectedRoute>
          } />

          <Route path="/admin/*" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/teacher/*" element={
            <ProtectedRoute role="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          } />

          <Route path="/student/*" element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode, role?: UserRole }> = ({ children, role }) => {
  const { userUid, profile } = useAuth();

  if (!userUid) return <Navigate to="/login" />;
  
  if (userUid && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6 text-center">
        <div className="bg-slate-800 p-12 rounded-[3rem] border border-white/10 max-w-lg w-full">
          <ShieldAlert size={64} className="text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-white mb-4">Akses Ditolak</h2>
          <p className="text-slate-400 mb-8">Profil biometrik tidak valid atau belum terdaftar di database.</p>
          <button onClick={() => {localStorage.clear(); window.location.reload();}} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black">Kembali ke Login</button>
        </div>
      </div>
    );
  }

  if (profile && !profile.isApproved && profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6 text-center">
        <div className="bg-slate-800 p-12 rounded-[3rem] border border-white/10 max-w-lg w-full">
          <Clock size={64} className="text-amber-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl font-black text-white mb-4">Menunggu Verifikasi</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Halo, <span className="text-blue-400 font-bold">{profile?.name}</span>. Akun biometrik Anda sedang ditinjau oleh Admin IT untuk validasi NISN/NIP.
          </p>
          <button onClick={() => {localStorage.clear(); window.location.reload();}} className="w-full py-4 border border-white/10 text-white rounded-2xl font-black">Keluar</button>
        </div>
      </div>
    );
  }

  if (role && profile && profile.role !== role) return <Navigate to="/" />;

  return <>{children}</>;
};

const DashboardSwitcher: React.FC = () => {
  const { profile } = useAuth();
  if (!profile) return null;
  switch (profile.role) {
    case 'admin': return <Navigate to="/admin" />;
    case 'teacher': return <Navigate to="/teacher" />;
    case 'student': return <Navigate to="/student" />;
    default: return <Navigate to="/login" />;
  }
};

export default App;
