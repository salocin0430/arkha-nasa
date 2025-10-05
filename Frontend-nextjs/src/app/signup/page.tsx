'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/infrastructure/external/SupabaseClient';
import { useAuth } from '@/hooks/useAuth';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/mission-builder');
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="h-full text-white">
        <div className="flex items-center justify-center h-full p-4 relative">
          <div className="w-full max-w-sm p-6 space-y-6 z-10">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-4">
                This is the beginning of your journey off Earth
              </h1>
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[#EAFE07] border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-white">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if already authenticated
  if (isAuthenticated) {
    return null;
  }

  // Show success screen
  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex items-center justify-center min-h-screen p-4 relative pt-32">
          <div className="w-full max-w-sm p-8 space-y-8 z-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-[#EAFE07] rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              <span className="text-[#EAFE07]">Welcome</span> to ARKHA!
            </h1>
            <p className="text-gray-400 mb-6">
              Account created successfully. Redirecting to your mission dashboard...
            </p>
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#EAFE07] border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { name: formData.name },
          emailRedirectTo: undefined, // No redirect needed
        },
      });

      if (error) throw error;
      
              if (data.user) {
                // Store user data immediately (no email confirmation needed)
                localStorage.setItem('user', JSON.stringify({
                  id: data.user.id,
                  email: data.user.email,
                  name: formData.name,
                }));

                // Show success state first
                setSignupSuccess(true);
                setLoading(false);

                // Redirect immediately without delay
                router.replace('/mission-builder');
              }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full text-white">
      {/* Main Content */}
      <div className="flex items-center justify-center h-full p-4 relative">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-[600px] h-[600px] bg-transparent rounded-full blur-[150px]" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[200px] w-[800px] h-[50px] bg-transparent rounded-full blur-[50px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[200px] w-[800px] h-[50px] bg-transparent rounded-full blur-[50px]"></div>
        
        <div className="w-full max-w-sm p-6 space-y-6 z-10">
          <div className="text-center">
              <h1 className="text-3xl font-bold">
                  This is the beginning of your journey off Earth
              </h1>
              <p className="text-gray-400 mt-2 text-base">
                  we need you to tell us more about your mission to help you plan it
              </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-[#EAFE07] transition-all text-center text-base"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-[#EAFE07] transition-all text-center text-base"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-[#EAFE07] transition-all text-center text-base"
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-black/20 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-1 focus:ring-[#EAFE07] transition-all text-center text-base"
                required
              />
            </div>
            
            {error && (
              <div className="text-red-400 text-sm text-center pt-1">{error}</div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#EAFE07] text-black py-3 rounded-lg font-semibold hover:bg-[#EAFE07]/80 transition-colors disabled:opacity-50 text-base"
            >
              {loading ? 'CREATING ACCOUNT...' : 'SUBSCRIBE'}
            </button>
          </form>
          
          <div className="text-center">
            <p className="text-white/70 text-base">
              Already have an account?{' '}
              <Link href="/login" className="text-[#EAFE07] hover:text-[#EAFE07]/80 font-semibold underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}