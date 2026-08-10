import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dataService } from '@/lib/dataService';

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ user: null, team: null });
  }

  const user = await dataService.findUserByEmail(sessionUser.email);
  if (!user) {
    return NextResponse.json({ user: null, team: null });
  }

  const team = await dataService.getTeamByLeaderId(user.id);

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    team,
  });
}
