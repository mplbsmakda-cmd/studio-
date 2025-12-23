
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Frown } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="bg-white p-12 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 max-w-lg w-full">
        <div className="bg-red-50 p-6 rounded-full inline-block mb-8">
          <Frown className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-6xl font-black text-slate-900 mb-4 tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Halaman Tidak Ditemukan</h2>
        <p className="text-slate-500 mb-10 leading-relaxed">
          Maaf, sepertinya halaman yang Anda cari telah dipindahkan atau tidak pernah ada.
        </p>
        <Link
          to="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
        >
          <Home size={20} />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
