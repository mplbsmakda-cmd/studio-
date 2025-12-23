
import React, { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { GraduationCap, Fingerprint, ScanEye, ShieldCheck, AlertCircle, Loader2, Cpu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Utility to convert base64 to ArrayBuffer
const base64ToBuffer = (base64: string) => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const LoginPage: React.FC = () => {
  const [identity, setIdentity] = useState(''); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBiometricAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      setError('Masukkan NISN atau NIP Anda.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // 1. Cari User & Ambil Credential ID yang tersimpan
      const usersRef = collection(db, 'users');
      const qNisn = query(usersRef, where('nisn', '==', identity));
      const qNip = query(usersRef, where('nip', '==', identity));
      
      const [snapNisn, snapNip] = await Promise.all([getDocs(qNisn), getDocs(qNip)]);
      const snapshot = !snapNisn.empty ? snapNisn : snapNip;

      if (snapshot.empty) {
        throw new Error('Identitas tidak ditemukan. Pastikan Anda sudah terdaftar.');
      }

      const userData = snapshot.docs[0].data();
      
      if (!userData.credentialId) {
        throw new Error('Akun ini belum mengaktifkan kunci biometrik.');
      }

      // 2. Real WebAuthn Challenge
      if (!window.PublicKeyCredential) {
        throw new Error('Browser ini tidak mendukung autentikasi biometrik.');
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions: any = {
        challenge: challenge,
        allowCredentials: [{
          id: base64ToBuffer(userData.credentialId),
          type: 'public-key',
          transports: ['internal'],
        }],
        userVerification: 'required',
        timeout: 60000,
      };

      // Memicu DIALOG BIOMETRIK ASLI (FaceID / Fingerprint)
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      });

      if (assertion) {
        // Autentikasi Berhasil
        localStorage.setItem('biometric_auth_session', userData.uid);
        window.location.reload(); 
      }

    } catch (err: any) {
      console.error(err);
      if (err.name === 'NotAllowedError') {
        setError('Proses biometrik dibatalkan atau ditolak oleh pengguna.');
      } else {
        setError(err.message || 'Gagal memverifikasi biometrik.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-inter">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-lg z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-slate-900/40 backdrop-blur-2xl p-10 md:p-14 rounded-[4rem] border border-white/5 shadow-2xl">
          <div className="text-center mb-10">
            <div className="relative inline-block mb-6">
              <div className="bg-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/40 border border-blue-400/30">
                <GraduationCap size={40} className="text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-xl shadow-lg border-2 border-slate-900">
                <ShieldCheck size={16} className="text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">LPPMRI 2 LOGIN</h1>
            <p className="text-slate-500 font-bold mt-2 text-xs tracking-widest uppercase">Secure Biometric Login</p>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-4 rounded-3xl animate-in slide-in-from-top-4">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-bold leading-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleBiometricAuth} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">ID IDENTITAS (NISN/NIP)</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-6 flex items-center text-slate-600 group-focus-within:text-blue-500 transition-colors">
                  <Cpu size={20} />
                </span>
                <input
                  required
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  className="w-full pl-16 pr-6 py-6 bg-slate-950/50 border border-white/5 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-xl text-blue-400 tracking-widest placeholder:text-slate-800"
                  placeholder="Masukkan ID..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full group relative overflow-hidden py-10 rounded-[3rem] transition-all flex flex-col items-center justify-center gap-4 border-2 ${
                loading 
                  ? 'bg-blue-600/10 border-blue-500/50' 
                  : 'bg-white border-transparent hover:bg-slate-50 hover:scale-[1.02]'
              }`}
            >
              {loading ? (
                <>
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="w-full h-1 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_1.5s_infinite] absolute"></div>
                  </div>
                  <Loader2 className="w-14 h-14 text-blue-500 animate-spin" />
                  <span className="text-blue-500 font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Menunggu Sensor...</span>
                </>
              ) : (
                <>
                  <div className="flex gap-4">
                     <Fingerprint className="w-14 h-14 text-slate-900 group-hover:scale-110 transition-transform duration-300" />
                     <ScanEye className="w-14 h-14 text-slate-900 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="text-center">
                    <span className="block text-slate-900 font-black text-xs uppercase tracking-[0.2em]">Masuk via Biometrik</span>
                    <span className="block text-slate-400 font-bold text-[9px] mt-1">SENTUH SENSOR UNTUK VERIFIKASI</span>
                  </div>
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-xs text-slate-500 font-bold">
              BELUM PUNYA KUNCI? <Link to="/signup" className="text-blue-500 hover:text-blue-400 underline underline-offset-[12px]">DAFTAR BIOMETRIK</Link>
            </p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
