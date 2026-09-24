import { NextResponse } from 'next/server';
import { getDb } from '@/src/lib/mongodb';

/**
 * JSON body for GET /api/health.
 * `status` is healthy when the process is up and MongoDB responds to ping.
 */
export type HealthResponse = {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptimeSeconds: number;
  checks: {
    database: 'connected' | 'disconnected';
  };
};

/**
 * GET /api/health
 *
 * Verifies the app is running and can reach MongoDB (readiness-style check).
 * Returns 200 when the database ping succeeds, 503 otherwise.
 */
export async function GET(): Promise<NextResponse<HealthResponse>> {
  const timestamp = new Date().toISOString();
  const uptimeSeconds = Math.round(process.uptime());

  try {
    const db = await getDb();
    await db.admin().ping();

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp,
        uptimeSeconds,
        checks: { database: 'connected' },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Health API] Database check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp,
        uptimeSeconds,
        checks: { database: 'disconnected' },
      },
      { status: 503 }
    );
  }
}
