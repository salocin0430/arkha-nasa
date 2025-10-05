'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function NavbarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isAuthenticated, loading } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace('/');
  };

  // Simple current page detection
  const getCurrentPage = () => {
    if (pathname === '/mission-builder') return 'dashboard';
    if (pathname === '/mission-builder/new') return 'new-mission';
    if (pathname === '/gallery') return 'gallery';
    if (pathname === '/profile') return 'profile';
    if (pathname === '/login') return 'login';
    if (pathname === '/signup') return 'signup';
    return '';
  };

  const currentPage = getCurrentPage();

  // Show loading state
  if (loading) {
    return (
      <div className="w-20 h-8 bg-white/20 rounded animate-pulse"></div>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        // Authenticated navigation
        <>
          <Link href="/mission-builder" className={`text-base font-medium transition-colors ${
            currentPage === 'dashboard' ? 'text-[#EAFE07]' : 'text-white hover:text-[#EAFE07]'
          }`}>
            Dashboard
          </Link>
          <Link href="/mission-builder/new" className={`text-base font-medium transition-colors ${
            currentPage === 'new-mission' ? 'text-[#EAFE07]' : 'text-white hover:text-[#EAFE07]'
          }`}>
            New Mission
          </Link>
          <Link href="/gallery" className={`text-base font-medium transition-colors ${
            currentPage === 'gallery' ? 'text-[#EAFE07]' : 'text-white hover:text-[#EAFE07]'
          }`}>
            Gallery
          </Link>
          <Link href="/profile" className={`text-base font-medium transition-colors ${
            currentPage === 'profile' ? 'text-[#EAFE07]' : 'text-white hover:text-[#EAFE07]'
          }`}>
            Profile ({user?.user_metadata?.name || 'User'})
          </Link>
          <button onClick={handleLogout} className="text-base font-medium text-white hover:text-[#EAFE07] transition-colors">
            LOGOUT
          </button>
        </>
      ) : (
        // Public navigation
        <>
          <Link href="#" className="text-base font-medium text-white hover:text-[#EAFE07] transition-colors">
            NASA DATA
          </Link>
          <Link href="/login" className={`text-base font-medium px-5 py-2.5 rounded-full transition-colors ${
            currentPage === 'login'
              ? 'border border-[#EAFE07] text-[#EAFE07]'
              : 'border border-white text-white hover:bg-white/10'
          }`}>
            LOGIN
          </Link>
          <Link href="/signup" className={`text-base font-medium px-5 py-2.5 rounded-full transition-colors ${
            currentPage === 'signup'
              ? 'bg-[#EAFE07] text-black hover:bg-[#EAFE07]/80 hover:text-black'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}>
            SIGN UP
          </Link>
        </>
      )}
    </>
  );
}
