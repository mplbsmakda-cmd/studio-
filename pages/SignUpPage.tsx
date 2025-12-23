
import React, { useState } from 'react';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { GraduationCap, User, AlertCircle, ShieldCheck, Fingerprint, Loader2, ArrowLeft, Calendar, Phone, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';

// Utility to convert ArrayBuffer to base64
const bufferToBase64 = (buffer: ArrayBuffer) => {
  return window.btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', classroom: '', nisn: '', nis: '', birthDate: '', phone: '', gender: 'L' as 'L' | 'P'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleRegisterBiometric = async () => {
    setError('');
    setLoading(true);

    try {
      // 1. Cek NISN
      const q = query(collection(db, 'users'), where('nisn', '==', formData.nisn));
      const snap = await getDocs(q);
      if (!snap.empty) throw new Error('NISN sudah terdaftar.');

      // 2. Real WebAuthn Registration
      if (!window.PublicKeyCredential) {
        throw new Error('Hardware Biometrik tidak didukung di perangkat ini.');
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const userID = new Uint8Array(16);
      window.crypto.getRandomValues(userID);

      // Extract valid domain (RP ID cannot contain port or protocol)
      const hostname = window.location.hostname;
      // WebAuthn generally requires a domain, localhost is allowed for dev.
      const rpId = hostname === "localhost" || hostname === "127.0.0.1" ? hostname : hostname;

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: challenge,
        rp: {
          name: "SMK LPPMRI 2 KEDUNGREJA",
          id: rpId,
        },
        user: {
          id: userID,
          name: formData.email,
          displayName: formData.name,
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" }, // ES256
          { alg: -257, type: "public-key" } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform", // Forces Biometric (FaceID/Fingerprint)
          userVerification: "required",
          residentKey: "required",
        },
        timeout: 60000,
        attestation: "none",
      };

      // Memicu DIALOG PENDAFTARAN BIOMETRIK ASLI
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;

      if (!credential) throw new Error('Gagal membuat kredensial perangkat.');

      const userId = Math.random().toString(36).substr(2, 9);
      const userProfile: UserProfile = {
        uid: userId,
        ...formData,
        role: 'student',
        biometricActive: true,
        credentialId: bufferToBase64(credential.rawId), // Simpan ID Kunci unik perangkat
        isApproved: false,
        createdAt: Date.now()
      };

      await setDoc(doc(db, 'users', userId), userProfile);
      
      alert("Kunci Biometrik Berhasil Didaftarkan! Tunggu Verifikasi Admin.");
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      if (err.name === 'NotAllowedError') {
        setError('Pendaftaran biometrik dibatalkan atau tidak diizinkan oleh kebijakan keamanan browser.');
      } else if (err.name === 'SecurityError') {
        setError('Keamanan: Pastikan Anda menggunakan HTTPS dan domain yang valid.');
      } else {
        setError(err.message || 'Gagal mendaftarkan biometrik.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-2xl z-10 animate-in fade-in duration-500">
        <div className="bg-slate-900/40 backdrop-blur-3xl p-10 md:p-14 rounded-[4rem] border border-white/5 shadow-2xl">
          
          <button onClick={() => step === 2 ? setStep(1) : navigate('/login')} className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-10 text-[10px] font-black uppercase tracking-[0.2em]">
            <ArrowLeft size={16} /> Kembali
          </button>

          <header className="mb-12">
            <h1 className="text-4xl font-black text-white tracking-tighter">DAFTAR BIOMETRIK</h1>
            <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Pendaftaran Identitas & Kunci Perangkat</p>
          </header>

          {error && (
            <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-3xl text-sm font-bold flex gap-3">
              <AlertCircle size={20} className="shrink-0" /> {error}
            </div>
          )}

          {step === 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right duration-300">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Nama Lengkap</label>
                <input required value={formData.name} onChange={e => updateForm('name', e.target.value)} className="w-full px-6 py-4 bg-slate-950/50 border border-white/5 rounded-2xl text-white font-bold focus:ring-2 focus:ring-blue-500/50 outline-none" placeholder="Nama Sesuai Ijazah" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">NISN</label>
                <input required value={formData.nisn} onChange={e => updateForm('nisn', e.target.value)} className="w-full px-6 py-4 bg-slate-950/50 border border-white/5 rounded-2xl text-white font-mono" placeholder="10 Digit" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">Email</label>
                <input type="email" required value={formData.email} onChange={e => updateForm('email', e.target.value)} className="w-full px-6 py-4 bg-slate-950/50 border border-white/5 rounded-2xl text-white font-bold" placeholder="Email aktif" />
              </div>

              <button 
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.nisn}
                className="md:col-span-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-black py-6 rounded-3xl transition-all shadow-2xl shadow-blue-600/20 uppercase tracking-[0.2em] text-[10px] mt-4"
              >
                LANJUT: DAFTAR KUNCI PERANGKAT
              </button>
            </div>
          ) : (
            <div className="text-center space-y-10 animate-in slide-in-from-right duration-300">
              <div className="bg-slate-950/50 p-12 rounded-[3.5rem] border-2 border-dashed border-blue-500/20">
                <div className="relative inline-block mb-8">
                  <Fingerprint className="w-24 h-24 text-blue-500" />
                  <div className="absolute inset-0 w-full h-1 bg-blue-400 blur-sm animate-[scan_2s_infinite]"></div>
                </div>
                <h3 className="text-2xl font-black text-white mb-4">Aktivasi Passkey</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                  Ketuk tombol di bawah, lalu gunakan FaceID atau Sidik Jari Anda untuk mengunci akun ini pada perangkat ini.
                </p>
              </div>

              <button 
                onClick={handleRegisterBiometric}
                disabled={loading}
                className="w-full bg-white text-slate-950 font-black py-8 rounded-[2.5rem] transition-all shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin text-blue-600" /> : <ShieldCheck size={24} className="text-blue-600" />}
                <span className="text-sm uppercase tracking-[0.2em]">{loading ? 'MEMPROSES...' : 'DAFTARKAN KUNCI BIOMETRIK'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  );
};

export default SignUpPage;
