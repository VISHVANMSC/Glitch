import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dataService } from '@/lib/dataService';

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || (sessionUser.role !== 'SCANNER' && sessionUser.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Scanner or Admin access required.' }, { status: 401 });
    }

    const activeEvents = await dataService.getActiveEvents();
    
    // Filter if scanner has allowedEvents restriction
    const scannerUser = await dataService.findUserById(sessionUser.userId);
    let allowedList: string[] = [];
    if (scannerUser && scannerUser.allowedEvents) {
      try {
        allowedList = JSON.parse(scannerUser.allowedEvents);
      } catch {
        allowedList = [];
      }
    }

    const filteredEvents = activeEvents.filter((evt) => {
      if (sessionUser.role === 'ADMIN' || allowedList.length === 0) return true;
      return allowedList.includes(evt.type) || allowedList.includes(evt.id);
    });

    return NextResponse.json({ events: filteredEvents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
