import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '../../../../application/services/AppService';
import { supabase } from '../../../../infrastructure/external/SupabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { email, name, password, avatar } = await request.json();

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth (no email confirmation needed)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: undefined, // No redirect needed
      },
    });

    if (authError) throw authError;

    // Create user profile using domain logic
    const user = await registerUser.execute({ email, name, password, avatar });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 400 }
    );
  }
}
