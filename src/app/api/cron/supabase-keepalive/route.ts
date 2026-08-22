import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { dataService } from '@/lib/dataService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    // 1. Optional Vercel Cron Secret authorization check
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = req.headers.get('authorization');
      const urlToken = new URL(req.url).searchParams.get('token');
      if (authHeader !== `Bearer ${cronSecret}` && urlToken !== cronSecret) {
        return NextResponse.json({ error: 'Unauthorized cron execution request.' }, { status: 401 });
      }
    }

    // 2. Perform lightweight, read-only Supabase activity query
    let queryType = 'raw_sql';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      try {
        queryType = 'orm_find_first';
        await prisma.user.findFirst({ select: { id: true } });
      } catch {
        queryType = 'data_service_fallback';
        await dataService.findUserByEmail('admin@glitch.com');
      }
    }

    // 3. Return lightweight, non-sensitive JSON response
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      method: queryType,
      message: 'Supabase keep-alive activity query executed successfully.',
    });
  } catch (error: any) {
    console.error('[Supabase Keep-Alive Warning]:', error?.message || 'Execution error');
    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        message: 'Keep-alive query attempted.',
      },
      { status: 200 }
    );
  }
}
