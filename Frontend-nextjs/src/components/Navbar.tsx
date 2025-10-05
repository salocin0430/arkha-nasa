'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface NavbarProps {
  variant?: 'home' | 'authenticated';
  currentPage?: string;
}

export default function Navbar({ currentPage }: NavbarProps) {
  const { user, signOut, isAuthenticated, loading } = useAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  // Show loading state to prevent flickering
  if (loading) {
    return (
      <header className="flex justify-between items-center p-6 md:p-8">
        <div className="flex items-center">
          <Link href="/" className="cursor-pointer">
            <img 
              src="/icono-arkha-blanco.png" 
              alt="ARKHA Logo" 
              className="w-16 h-16 object-contain hover:opacity-80 transition-opacity"
            />
          </Link>
        </div>
        <nav className="flex items-center space-x-4 md:space-x-6">
          <div className="w-20 h-8 bg-white/20 rounded animate-pulse"></div>
        </nav>
      </header>
    );
  }

  return (
    <header className="flex justify-between items-center p-6 md:p-8">
      <div className="flex items-center">
        <Link href="/" className="cursor-pointer">
          <img 
            src="/icono-arkha-blanco.png" 
            alt="ARKHA Logo" 
            className="w-16 h-16 object-contain hover:opacity-80 transition-opacity"
          />
        </Link>
      </div>
      
      <nav className="flex items-center space-x-4 md:space-x-6">
        {isAuthenticated ? (
          // Authenticated navigation
          <>
            <Link href="/mission-builder" className={`text-sm font-medium transition-colors ${
              currentPage === 'dashboard' ? 'text-[#EAFE07]' : 'hover:text-[#EAFE07]'
            }`}>
              Dashboard
            </Link>
            <Link href="/mission-builder/new" className={`text-sm font-medium transition-colors ${
              currentPage === 'new-mission' ? 'text-[#EAFE07]' : 'hover:text-[#EAFE07]'
            }`}>
              New Mission
            </Link>
            <Link href="/gallery" className={`text-sm font-medium transition-colors ${
              currentPage === 'gallery' ? 'text-[#EAFE07]' : 'hover:text-[#EAFE07]'
            }`}>
              Gallery
            </Link>
            <Link href="/profile" className={`text-sm font-medium transition-colors ${
              currentPage === 'profile' ? 'text-[#EAFE07]' : 'hover:text-[#EAFE07]'
            }`}>
              Profile ({user?.user_metadata?.name || 'User'})
            </Link>
            <button onClick={handleLogout} className="text-sm font-medium hover:text-[#EAFE07] transition-colors">
              LOGOUT
            </button>
          </>
        ) : (
          // Public navigation
          <>
            <Link href="#" className="text-sm font-medium hover:text-[#EAFE07] transition-colors">
              NASA DATA
            </Link>
            <Link href="/login" className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
              currentPage === 'login' 
                ? 'border border-[#EAFE07] text-[#EAFE07]' 
                : 'border border-white hover:bg-white/10'
            }`}>
              LOGIN
            </Link>
            <Link href="/signup" className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
              currentPage === 'signup'
                ? 'bg-[#EAFE07] text-[#07173F] hover:bg-[#EAFE07]/80'
                : 'bg-white text-[#07173F] hover:bg-opacity-80'
            }`}>
              SIGN UP
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}