import { NextResponse } from 'next/server';
import { RegisterSchema } from '@/src/models/user';
import { AuthService } from '@/src/services/auth.service';

/**
 * POST /api/auth/register
 * 
 * Registers a new user via AuthService.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = RegisterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.format() },
        { status: 400 }
      );
    }

    // Call service
    const result = await AuthService.register(validation.data);

    return NextResponse.json(result, { status: 201 });

  } catch (caught) {
    const error = caught instanceof Error ? caught : new Error('Internal server error');
    console.error('[Auth API] Registration error:', error);
    
    // Handle specific errors from service
    if (error.message === 'User already exists') {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
