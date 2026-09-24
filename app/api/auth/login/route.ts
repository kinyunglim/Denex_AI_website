import { NextResponse } from 'next/server';
import { LoginSchema } from '@/src/models/user';
import { AuthService } from '@/src/services/auth.service';

/**
 * POST /api/auth/login
 * 
 * Authenticates a user via AuthService.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.format() },
        { status: 400 }
      );
    }

    // Call service
    const result = await AuthService.login(validation.data);

    return NextResponse.json({
      message: 'Login successful',
      ...result
    }, { status: 200 });

  } catch (caught) {
    const error = caught instanceof Error ? caught : new Error('Internal server error');
    console.error('[Auth API] Login error:', error);

    // Handle authentication errors
    const authErrors = [
      'Invalid email or password', 
      'Please verify your email address before logging in',
      'Your account has been deactivated'
    ];

    if (authErrors.includes(error.message)) {
      const status = error.message === 'Invalid email or password' ? 401 : 403;
      return NextResponse.json({ message: error.message }, { status });
    }

    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
