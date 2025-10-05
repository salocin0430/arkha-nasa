'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/infrastructure/external/SupabaseClient';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('useAuth: Initial session:', session);
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuth: Auth state change:', event, session);
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user
  };
}
