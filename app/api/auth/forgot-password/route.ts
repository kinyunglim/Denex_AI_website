import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthService } from '@/src/services/auth.service';

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

/**
 * POST /api/auth/forgot-password
 * 
 * Sends a password reset OTP via AuthService.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validation = ForgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    
    // Call service
    const result = await AuthService.forgotPassword(email);

    return NextResponse.json(result, { status: 200 });

  } catch (caught) {
    const error = caught instanceof Error ? caught : new Error('Internal server error');
    console.error('[Auth API] Forgot password error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
