import React from 'react';
import { Outlet } from 'react-router-dom';
import logo from '../../assets/logitranslogo.png'; // Ajusta la ruta según tu estructura

// Componente Header separado
function Header() {
  return (
    <header className='relative overflow-hidden'>
      <div className='relative mx-2 my-2 px-4 py-2 backdrop-blur-sm rounded-xl shadow-2xl'>
        <div className='w-full flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='relative bg-gradient-to-r bg-white backdrop-blur-md h-12 w-12 rounded-xl flex items-center justify-center p-1.5 shadow-xl border border-white/20'>
              <img src={logo} alt="Logo" className='w-full h-full object-contain' />
            </div>
            <div className='flex flex-col'>
              <span className='text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-emerald-100 bg-clip-text text-transparent select-none'>
                LOGITRANS
              </span>
              <span className='text-xs text-slate-400 font-medium tracking-wider'>
                Transformamos el presente, construimos el futuro.
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// Layout que incluye el Header
function LayoutWithHeader() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <Header />
      <Outlet /> {/* Aquí se renderizarán las rutas hijas */}
    </div>
  );
}

export default LayoutWithHeader;