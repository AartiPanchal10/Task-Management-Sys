import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/home/sidebar.jsx';

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className='flex flex-col md:flex-row h-screen'>
      <div className={`w-full md:w-1/4 lg:w-1/5 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'fixed inset-0 z-50' : 'hidden md:block'}`}>
        <Sidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>
      
      <div className='w-full md:w-3/4 lg:w-4/5 overflow-auto p-4 md:p-6'>
        <button
          className="md:hidden fixed top-4 left-4 z-40 bg-slate-600 text-white p-2 rounded"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>
        <div className="md:hidden h-14"></div> {/* Spacer for mobile */}
        <Outlet />
      </div>
    </div>
  );
}

export default Home;